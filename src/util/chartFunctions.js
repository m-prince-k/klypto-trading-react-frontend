import { LineSeries } from "lightweight-charts";

import apiService from "../services/apiServices";
import { useEffect } from "react";

export async function fetchDataByCurrency(selectedCurrency, timeframeValue) {
  let response;
  if (selectedCurrency && timeframeValue) {
    response = await apiService.post(
      `listing?symbol=${selectedCurrency || "BTCUSD"}&interval=${timeframeValue || "1m"}&limit=1000`,
    );
  } else {
    response = await apiService.post(
      `listing?symbol=${selectedCurrency || "BTCUSD"}&limit=1000&interval=${timeframeValue || "1m"}`,
    );
  }
  return response;
}


export async function fetchIndicatorData(
  selectedIndicator,
  selectedCurrency,
  timeframeValue,
  chartRef,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  getIndicatorColor,
) {
  if (!selectedIndicator?.length) return;

  for (const [index, indicator] of selectedIndicator.entries()) {
    try {
      const result = await fetchDataForIndicators(
        selectedCurrency,
        indicator,
        timeframeValue,
      );

      console.log("Formatted:", indicator, result);

      if (!result) continue;

      // ✅ SINGLE LINE INDICATORS
      if (result.type === "single") {
        removeSeries(indicatorSeriesRef, chartRef, indicator);

        const series = chartRef.current.addSeries(LineSeries, {
          color: getIndicatorColor(index),
          lineWidth: 2,
        });

        series.setData(result.data);

        if (result.data.length) {
          latestIndicatorValuesRef.current[indicator] =
            result.data[result.data.length - 1].value;
        }

        indicatorSeriesRef.current[indicator] = series;
      }

      // ✅ MULTI LINE INDICATORS
      if (result.type === "multi") {
        Object.entries(result.data).forEach(([lineName, lineData], i) => {
          const key = `${indicator}_${lineName}`;

          removeSeries(indicatorSeriesRef, chartRef, key);

          const series = chartRef.current.addSeries(LineSeries, {
            color: getIndicatorColor(i),
            lineWidth: 2,
          });
          series.setData(lineData);
          indicatorSeriesRef.current[key] = series;
        });
      }
      if (result.type === "pivot") {
        plotPivotLevels(result.data, chartRef, indicatorSeriesRef);
      }
    } catch (error) {
      console.log(error, "Indicator loading error");
    }
  }
}

async function fetchDataForIndicators(selectedCurrency, type, timeframeValue) {
  const normalizedType = type.replace(/[\s/]+/g, "");

  const response = await apiService.post(
    `indicatorDetails?symbol=${selectedCurrency}&interval=${timeframeValue}&type=${normalizedType}`,
  );

  console.log("Raw indicator data for", type, ":", response);

  const mapLine = (arr) =>
    arr?.map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    })) ?? [];

  switch (normalizedType) {
    /* ---------------- SINGLE VALUE ---------------- */
    case "SMA":
    case "EMA":
    case "DEMA":
    case "TEMA":
    case "ADX":
    case "RSI":
    case "SuperTrend":
    case "Aroon":
    case "AroonOscillator":
    case "ROC":
    case "AwesomeOscillator":
    case "TRIX":
    case "Volume":
    case "OBV":
    case "VolumeOscillator":
    case "ChaikinMoneyFlow":
    case "MFI":
    case "EaseofMovement":
    case "NegativeVolumeIndex":
    case "PositiveVolumeIndex":
    case "VWAP":
    case "BollingerBandWidth":
    case "ATR":
    case "HistoricalVolatility":
    case "ChoppinessIndex":
    case "AccumulationDistribution":
    case "Williams%R":
    case "UltimateOscillator":
    case "StochasticRSI":
    case "ParabolicSAR":
    case "ChandeMomentumOscillator":
      return {
        type: "single",
        data:
          response.data
            ?.filter((d) => d.value != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.value),
            })) ?? [],
      };
      case "ZigZag": {
  const rows = response?.data ?? [];

  console.log("ZigZag:", rows.length);

  return {
    type: "single",
    data: rows
      .filter(d => d.value != null)
      .map(d => ({
        time: Number(d.time),
        value: Number(d.value),
      })),
  };
}


    /* ---------------- NESTED VALUE ---------------- */

    case "WMA":
      return {
        type: "single",
        data:
          response.data
            ?.filter((d) => d.value?.wma != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.value.wma),
            })) ?? [],
      };

    case "HMA":
      return {
        type: "single",
        data:
          response.data
            ?.filter((d) => d.value?.hma != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.value.hma),
            })) ?? [],
      };

    case "AMA":
      return {
        type: "single",
        data:
          response.data
            ?.filter((d) => d.value?.ama != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.value.ama),
            })) ?? [],
      };

    case "CCI": {
      const rows = Array.isArray(response?.data) ? response.data : [];

      console.log("CCI rows:", rows.length);
      console.log("CCI sample:", rows[0]);

      return {
        type: "single",
        data: rows.map((d) => ({
          time: Number(d.time),
          value: Number(d.cci),
        })),
      };
    }

    case "PivotPoints(Standard)": {
      const d = response?.data ?? {};

      console.log("Pivot Standard:", d);

      return {
        type: "pivot",
        data: [
          { label: "P", value: Number(d.P) },
          { label: "R1", value: Number(d.R1) },
          { label: "R2", value: Number(d.R2) },
          { label: "R3", value: Number(d.R3) },
          { label: "S1", value: Number(d.S1) },
          { label: "S2", value: Number(d.S2) },
          { label: "S3", value: Number(d.S3) },
        ].filter((level) => !Number.isNaN(level.value)),
      };
    }

    case "PivotPoints(Fibonacci)": {
      const d = response?.data ?? {};

      console.log("PivotFibonacci:", d);

      return {
        type: "pivot",
        data: [
          { label: "P", value: Number(d.P) },
          { label: "R1", value: Number(d.R1) },
          { label: "R2", value: Number(d.R2) },
          { label: "R3", value: Number(d.R3) },
          { label: "S1", value: Number(d.S1) },
          { label: "S2", value: Number(d.S2) },
          { label: "S3", value: Number(d.S3) },
        ].filter((level) => !Number.isNaN(level.value)),
      };
    }
    case "PivotPoints(Camarilla)": {
  const d = response?.data ?? {};

  console.log("Pivot Camarilla:", d);

  return {
    type: "pivot",
    data: [
      { label: "P", value: Number(d.P) },
      { label: "R1", value: Number(d.R1) },
      { label: "R2", value: Number(d.R2) },
      { label: "R3", value: Number(d.R3) },
      { label: "R4", value: Number(d.R4) }, // Camarilla often has R4/S4
      { label: "S1", value: Number(d.S1) },
      { label: "S2", value: Number(d.S2) },
      { label: "S3", value: Number(d.S3) },
      { label: "S4", value: Number(d.S4) },
    ].filter(level => !Number.isNaN(level.value)),
  };
}

case "PivotPoints(Classic)": {
  const d = response?.data ?? {};

  console.log("Pivot Classic:", d);

  return {
    type: "pivot",
    data: [
      { label: "P", value: Number(d.P) },
      { label: "R1", value: Number(d.R1) },
      { label: "R2", value: Number(d.R2) },
      { label: "R3", value: Number(d.R3) },
      { label: "S1", value: Number(d.S1) },
      { label: "S2", value: Number(d.S2) },
      { label: "S3", value: Number(d.S3) },
    ].filter(level => !Number.isNaN(level.value)),
  };
}


    /* ---------------- MULTI LINE ---------------- */

    case "IchimokuCloud":
      return {
        type: "multi",
        data: {
          tenkan: mapLine(response.data?.tenkan),
          kijun: mapLine(response.data?.kijun),
          spanA: mapLine(response.data?.spanA),
          spanB: mapLine(response.data?.spanB),
          chikou: mapLine(response.data?.chikou),
        },
      };

    case "ChandeKrollStop":
      return {
        type: "multi",
        data: {
          longStop:
            response.data
              ?.filter((d) => d.longStop != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.longStop),
              })) ?? [],

          shortStop:
            response.data
              ?.filter((d) => d.shortStop != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.shortStop),
              })) ?? [],
        },
      };

    case "Stochastic":
      return {
        type: "multi",
        data: {
          k:
            response.data
              ?.filter((d) => d.value?.k != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.value.k),
              })) ?? [],

          d:
            response.data
              ?.filter((d) => d.value?.d != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.value.d),
              })) ?? [],
        },
      };

    case "MACD":
      return {
        type: "multi",
        data: {
          macd:
            response.data
              ?.filter((d) => d.value?.MACD != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.value.MACD),
              })) ?? [],

          signal:
            response.data
              ?.filter((d) => d.value?.signal != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.value.signal),
              })) ?? [],

          histogram:
            response.data
              ?.filter((d) => d.value?.histogram != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.value.histogram),
              })) ?? [],
        },
      };

    case "KlingerOscillator":
      return {
        type: "multi",
        data: {
          kvo:
            response.data
              ?.filter((d) => d.kvo != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.kvo),
              })) ?? [],

          signal:
            response.data
              ?.filter((d) => d.signal != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.signal),
              })) ?? [],
        },
      };

    case "BollingerBands": {
      const rows = response?.data ?? [];

      return {
        type: "multi",
        data: {
          upper: rows
            .filter((d) => d.upper != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.upper),
            })),

          middle: rows
            .filter((d) => d.middle != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.middle),
            })),

          lower: rows
            .filter((d) => d.lower != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.lower),
            })),
        },
      };
    }

    case "FisherTransform": {
      const rows = response?.data ?? [];

      return {
        type: "multi",
        data: {
          fisher: rows
            .filter((d) => d.value?.fisher != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.value.fisher),
            })),

          trigger: rows
            .filter((d) => d.value?.trigger != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.value.trigger),
            })),
        },
      };
    }

    case "KeltnerChannels":
      return {
        type: "multi",
        data: {
          upper:
            response.data
              ?.filter((d) => d.upper != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.upper),
              })) ?? [],

          middle:
            response.data
              ?.filter((d) => d.middle != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.middle),
              })) ?? [],

          lower:
            response.data
              ?.filter((d) => d.lower != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.lower),
              })) ?? [],
        },
      };

    case "DonchianChannels":
      return {
        type: "multi",
        data: {
          upper:
            response.data
              ?.filter((d) => d.upper != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.upper),
              })) ?? [],

          middle:
            response.data
              ?.filter((d) => d.middle != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.middle),
              })) ?? [],

          lower:
            response.data
              ?.filter((d) => d.lower != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.lower),
              })) ?? [],
        },
      };

    default:
      return {
        type: "single",
        data: [],
      };
  }
}
function plotPivotLevels(pivotLevels, chartRef, indicatorSeriesRef) {
  const chart = chartRef.current;
  if (!chart || !pivotLevels?.length) return;

  const visibleRange = chart.timeScale().getVisibleRange();
  if (!visibleRange) return;

  const { from, to } = visibleRange;

  pivotLevels.forEach(({ label, value }) => {
    const price = Number(value);
    if (!price || isNaN(price)) return;

    const key = `pivot_${label}`;

    safeRemoveSeries(chart, indicatorSeriesRef.current[key]);

    const series = chart.addSeries(LineSeries, {
      color: getPivotColor(label),
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    series.setData([
      { time: from, value: price },
      { time: to, value: price },
    ]);

    indicatorSeriesRef.current[key] = series;
  });
}
function safeRemoveSeries(chart, series) {
  try {
    if (!chart || !series) return;
    chart.removeSeries(series);
  } catch (e) {}
}

function getPivotColor(label) {
  if (label === "P") return "#eab308"; // Pivot → Yellow
  if (label.startsWith("R")) return "#44d5ef"; // Resistance → Red
  if (label.startsWith("S")) return "#9722c5"; // Support → Green
  return "#94a3b8";
}

function removeSeries(indicatorSeriesRef, chartRef, key) {
  if (indicatorSeriesRef.current[key]) {
    chartRef.current.removeSeries(indicatorSeriesRef.current[key]);
    delete indicatorSeriesRef.current[key];
  }
}
