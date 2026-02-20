import { LineSeries } from "lightweight-charts";
import apiService from "../services/apiServices";

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
  addSeries,
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

      if (!result) continue;

      /* ================= SINGLE LINE ================= */

      if (result.type === "single") {
        removeSeries(indicatorSeriesRef, chartRef, indicator);

        const series = addSeries(indicator, LineSeries, {
          color: getIndicatorColor(index),
          lineWidth: 1,
        });

        if (!series) continue;

        series.setData(result.data);

        if (result.data?.length) {
          latestIndicatorValuesRef.current[indicator] =
            result.data[result.data.length - 1].value;
        }

        indicatorSeriesRef.current[indicator] = series;
      }

      /* ================= MULTI LINE ================= */

      if (result.type === "multi") {
        const indicatorKey = indicator;

        // ✅ Remove OLD grouped series safely
        const oldEntry = indicatorSeriesRef.current[indicatorKey];

        if (oldEntry && typeof oldEntry === "object") {
          Object.values(oldEntry).forEach((series) => {
            try {
              series?.remove?.();
            } catch (e) {}
          });
        }

        const groupedSeries = {};

        Object.entries(result.data).forEach(
          ([lineName, lineData], lineIndex) => {
            const series = addSeries(indicator, LineSeries, {
              color: getIndicatorColor(lineIndex), // ✅ FIXED COLOR
              lineWidth: 1,
            });

            if (!series) return;

            series.setData(lineData);

            groupedSeries[lineName] = series;

            if (lineData?.length) {
              latestIndicatorValuesRef.current[indicatorKey] = {
                ...(latestIndicatorValuesRef.current[indicatorKey] || {}),
                [lineName]: lineData[lineData.length - 1].value,
              };
            }
          },
        );

        indicatorSeriesRef.current[indicatorKey] = groupedSeries;
      }

      /* ================= PIVOT ================= */

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
    case "HMA":
    case "DEMA":
    case "TEMA":
    case "AMA":
    case "ADX":
    case "SuperTrend":
    case "Aroon":
    case "AroonOscillator":
    case "Momentum":
    case "ROC":
    case "AwesomeOscillator":
    case "MACDHistogram":
    case "TRIX":
    case "StandardDeviation":
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
            ?.filter((d) => d.value != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.value,
            })) ?? [],
      };
    case "ZigZag": {
      const rows = response?.data ?? [];

      console.log("ZigZag:", rows.length);

      return {
        type: "single",
        data: rows
          .filter((d) => d.value != null && d.time != null)
          .map((d) => ({
            time: d.time,
            value: d.value,
          })),
      };
    }

    case "ATR":
      return {
        type: "single",

        data:
          response.data
            ?.filter((d) => d.ATR != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.ATR,
            })) ?? [],
      };

    case "RSI":
      return {
        type: "single",

        data:
          response.data
            ?.filter((d) => d.rsi != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.rsi,
            })) ?? [],
      };

    /* ---------------- NESTED VALUE ---------------- */

    case "WMA":
      return {
        type: "single",
        data:
          response.data
            ?.filter((d) => d.wma != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.wma,
            })) ?? [],
      };

    case "CCI": {
      const rows = Array.isArray(response?.data) ? response.data : [];

      console.log("CCI rows:", rows.length);
      console.log("CCI sample:", rows[0]);

      return {
        type: "single",
        data: rows.map((d) => ({
          time: d.time,
          value: d.cci,
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
        ].filter((level) => !Number.isNaN(level.value)),
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
        ].filter((level) => !Number.isNaN(level.value)),
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
              ?.filter((d) => d.longStop != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.longStop,
              })) ?? [],

          shortStop:
            response.data
              ?.filter((d) => d.shortStop != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.shortStop,
              })) ?? [],
        },
      };

    case "Stochastic":
      return {
        type: "multi",
        data: {
          k:
            response.data
              ?.filter((d) => d.k != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.k,
              })) ?? [],

          d:
            response.data
              ?.filter((d) => d.d != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.d,
              })) ?? [],
        },
      };

    case "MACD":
      return {
        type: "multi",
        data: {
          macd:
            response.data
              ?.filter((d) => d.macd != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.macd,
              })) ?? [],

          signal:
            response.data
              ?.filter((d) => d.macdSignal != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.macdSignal,
              })) ?? [],

          histogram:
            response.data
              ?.filter((d) => d.macdHistogram != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.macdHistogram,
              })) ?? [],
        },
      };

    case "KlingerOscillator":
      return {
        type: "multi",
        data: {
          kvo:
            response.data
              ?.filter((d) => d.kvo != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.kvo,
              })) ?? [],

          signal:
            response.data
              ?.filter((d) => d.signal != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.signal,
              })) ?? [],
        },
      };

    case "BollingerBands": {
      const rows = response?.data ?? [];

      return {
        type: "multi",
        data: {
          upper: rows
            .filter((d) => d.upper != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.upper,
            })),

          middle: rows
            .filter((d) => d.middle != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.middle,
            })),

          lower: rows
            .filter((d) => d.lower != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.lower,
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
            .filter((d) => d.fisher != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.fisher,
            })),

          trigger: rows
            .filter((d) => d.trigger != null && d.time != null)
            .map((d) => ({
              time: d.time,
              value: d.trigger,
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
              ?.filter((d) => d.upper != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.upper,
              })) ?? [],

          middle:
            response.data
              ?.filter((d) => d.middle != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.middle,
              })) ?? [],

          lower:
            response.data
              ?.filter((d) => d.lower != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.lower,
              })) ?? [],
        },
      };

    case "DonchianChannels":
      return {
        type: "multi",
        data: {
          upper:
            response.data
              ?.filter((d) => d.upper != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.upper,
              })) ?? [],

          middle:
            response.data
              ?.filter((d) => d.middle != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.middle,
              })) ?? [],

          lower:
            response.data
              ?.filter((d) => d.lower != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.lower,
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

export const PANE_INDICATORS = new Set([
  "RSI",
  "MACD",
  "MACDHistogram",
  "CCI",
  "ROC",
  "Williams%R",
  "UltimateOscillator",
  "AroonOscillator",
  "ChandeMomentumOscillator", // CMO
  "TRIX",
  "FisherTransform",
  "KlingerOscillator",
  "ATR",
  "ChoppinessIndex",
  "Volume",
  "ChaikinMoneyFlow",
  "MFI",
]);

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
