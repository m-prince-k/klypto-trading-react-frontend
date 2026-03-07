import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  AreaSeries,
} from "lightweight-charts";
import apiService from "../services/apiServices";
import { getRowsByIndicator } from "./common";

export default function useChartFunctions({
  chartRef,
  addSeries,
  indicatorSeriesRef,
  indicatorStyle,
}) {
  useEffect(() => {
    const rsiGroup = indicatorSeriesRef.current?.RSI;
    if (!rsiGroup) return;

    const rsiSeries = rsiGroup.rsi;
    const rsiMaSeries = rsiGroup.rsiMa;
    const smoothingSeries = rsiGroup.smoothingMA;

    if (!rsiSeries) return;

    const rsiStyle = indicatorStyle?.RSI?.rsi;
    const rsiMaStyle = indicatorStyle?.RSI?.rsiMa;
    const smoothingStyle = indicatorStyle?.RSI?.smoothingMA;

    const upper = indicatorStyle?.RSI?.upper;
    const middle = indicatorStyle?.RSI?.middle;
    const lower = indicatorStyle?.RSI?.lower;

    /* ================= UPDATE RSI ================= */

    if (rsiStyle) {
      rsiSeries.applyOptions({
        color: rsiStyle.color,
        lineWidth: rsiStyle.width,
        visible: rsiStyle.visible,
      });
    }

    /* ================= UPDATE RSI MA ================= */

    if (rsiMaSeries && rsiMaStyle) {
      rsiMaSeries.applyOptions({
        color: rsiMaStyle.color,
        lineWidth: rsiMaStyle.width,
        visible: rsiMaStyle.visible,
      });
    }

    /* ================= UPDATE SMOOTHING MA ================= */

    if (smoothingSeries && smoothingStyle) {
      smoothingSeries.applyOptions({
        color: smoothingStyle.color,
        lineWidth: smoothingStyle.width,
        visible: smoothingStyle.visible,
      });
    }

    /* ================= CREATE BANDS FIRST TIME ================= */

    if (!rsiGroup._priceLines) {
      rsiGroup._priceLines = {
        upper: rsiSeries.createPriceLine({
          price: upper?.value ?? 70,
          color: upper?.color || "#ef5350",
          lineWidth: upper?.width ?? 2,
          lineStyle: 2,
        }),

        middle: rsiSeries.createPriceLine({
          price: middle?.value ?? 50,
          color: middle?.color || "#9e9e9e",
          lineWidth: middle?.width ?? 2,
          lineStyle: 2,
        }),

        lower: rsiSeries.createPriceLine({
          price: lower?.value ?? 30,
          color: lower?.color || "#26a69a",
          lineWidth: lower?.width ?? 2,
          lineStyle: 2,
        }),
      };

      //   gradient fill
      const upperValue = upper?.value ?? 70;
      const lowerValue = lower?.value ?? 30;

      const overboughtData = [];
      const oversoldData = [];

      const rsiData = rsiGroup._rsiData;
      if (!rsiData) return;

      rsiData.forEach((point) => {
        if (point.value > upperValue) {
          overboughtData.push(point);
        } else {
          overboughtData.push({
            time: point.time,
            value: upperValue,
          });
        }

        if (point.value < lowerValue) {
          oversoldData.push(point);
        } else {
          oversoldData.push({
            time: point.time,
            value: lowerValue,
          });
        }
      });

      rsiGroup.overboughtArea?.setData(overboughtData);
      rsiGroup.oversoldArea?.setData(oversoldData);

      return;
    }

    /* ================= UPDATE EXISTING BANDS ================= */

    const priceLines = rsiGroup._priceLines;

    priceLines.upper?.applyOptions({
      price: upper?.value,
      color: upper?.color,
      lineWidth: upper?.width ?? 2,
    });

    priceLines.middle?.applyOptions({
      price: middle?.value,
      color: middle?.color,
      lineWidth: middle?.width ?? 2,
    });

    priceLines.lower?.applyOptions({
      price: lower?.value,
      color: lower?.color,
      lineWidth: lower?.width ?? 2,
    });
  }, [
    indicatorSeriesRef.current?.RSI?.rsi,

    indicatorStyle?.RSI?.rsi?.color,
    indicatorStyle?.RSI?.rsi?.width,

    indicatorStyle?.RSI?.rsiMa?.color,
    indicatorStyle?.RSI?.rsiMa?.width,

    indicatorStyle?.RSI?.smoothingMA?.color,
    indicatorStyle?.RSI?.smoothingMA?.width,

    indicatorStyle?.RSI?.upper?.value,
    indicatorStyle?.RSI?.middle?.value,
    indicatorStyle?.RSI?.lower?.value,

    indicatorStyle?.RSI?.upper?.color,
    indicatorStyle?.RSI?.middle?.color,
    indicatorStyle?.RSI?.lower?.color,
    indicatorStyle?.RSI?.upper?.width,
    indicatorStyle?.RSI?.middle?.width,
    indicatorStyle?.RSI?.lower?.width,
  ]);

  async function fetchDataByCurrency(selectedCurrency, timeframeValue) {
    let response;
    if (selectedCurrency && timeframeValue) {
      response = await apiService.post(
        `api/listing?symbol=${selectedCurrency || "BTCUSD"}&interval=${timeframeValue || "1m"}&limit=1000`,
      );
      // console.log(response, "resssssssssssssss")
    } else {
      response = await apiService.post(
        `api/listing?symbol=${selectedCurrency || "BTCUSD"}&limit=1000&interval=${timeframeValue || "1m"}`,
      );
      // console.log(response, "resssssssssssssss")
    }
    return response;
  }

  /* ================= FETCH INDICATORS ================= */

  async function fetchIndicatorData(
    selectedIndicator,
    selectedCurrency,
    timeframeValue,
    // chartRef,
    // addSeries,
    // indicatorSeriesRef,
    // indicatorStyle,
  ) {
    console.log(indicatorStyle, "styloeeeeeeeeeeeeeeeeeeeeeeeee");

    if (!selectedIndicator?.length) return;

    for (const indicator of selectedIndicator) {
      try {
        const result = await fetchDataForIndicators(
          selectedCurrency,
          indicator,
          timeframeValue,
        );

        if (!result) continue;

        const rows = getRowsByIndicator(indicator);

        switch (indicator) {
          /* ================= RSI ================= */

          case "RSI": {
            const groupedSeries = {};

            Object.entries(result.data).forEach(([lineName, lineData]) => {
              const rowConfig = rows?.find((r) => r.key === lineName);
              const styleConfig = indicatorStyle?.[indicator]?.[lineName];

              const series = addSeries(indicator, LineSeries, {
                color: styleConfig?.color || rowConfig?.color || "#26a69a",
                lineWidth: styleConfig?.width || 2,
                visible: styleConfig?.visible ?? true,
              });

              if (!series) return;

              series.setData(lineData);

              groupedSeries[lineName] = series;
            });

            /* ================= RSI BANDS ================= */

            groupedSeries.overboughtArea = addSeries(indicator, AreaSeries, {
              lineColor: "transparent",
              topColor: "rgba(0,255,150,0.35)",
              bottomColor: "rgba(0,255,150,0.05)",
            });

            groupedSeries.oversoldArea = addSeries(indicator, AreaSeries, {
              lineColor: "transparent",
              topColor: "rgba(255,70,70,0.35)",
              bottomColor: "rgba(255,70,70,0.05)",
            });

            indicatorSeriesRef.current[indicator] = groupedSeries;

            break;
          }

          /* ================= SMA ================= */

          case "SMA": {
            removeSeries(indicatorSeriesRef, chartRef, indicator);

            const styleConfig = indicatorStyle?.SMA?.sma;

            const series = addSeries(indicator, LineSeries, {
              color: styleConfig?.color || "#2962ff",
              lineWidth: styleConfig?.width || 2,
              visible: styleConfig?.visible ?? true,
            });


            if (!series) break;

            series.setData(result.data);

            // store with correct key
            indicatorSeriesRef.current["SMA"] = {
              sma: series,
            };

            console.log(
              "Stored SMA series:",
              indicatorSeriesRef.current["SMA"],
            );

            break;
          }
          case "EMA": {
  removeSeries(indicatorSeriesRef, chartRef, indicator);

  const styleConfig = indicatorStyle?.EMA?.ema;

  const series = addSeries(indicator, LineSeries, {
    color: styleConfig?.color || "#ff9800",
    lineWidth: styleConfig?.width || 2,
    visible: styleConfig?.visible ?? true,
  });

  if (!series) break;

  series.setData(result.data);

  indicatorSeriesRef.current["EMA"] = {
    ema: series,
  };

  console.log("Stored EMA series:", indicatorSeriesRef.current["EMA"]);

  break;
}
case "HMA": {
  removeSeries(indicatorSeriesRef, chartRef, indicator);

  const styleConfig = indicatorStyle?.HMA?.hma;

  const series = addSeries(indicator, LineSeries, {
    color: styleConfig?.color || "#9c27b0",
    lineWidth: styleConfig?.width || 2,
    visible: styleConfig?.visible ?? true,
  });

  if (!series) break;

  series.setData(result.data);

  indicatorSeriesRef.current["HMA"] = {
    hma: series,
  };

  console.log("Stored HMA series:", indicatorSeriesRef.current["HMA"]);

  break;
}

          /* ================= MACD ================= */

          case "MACD": {
            const groupedSeries = {};

            Object.entries(result.data).forEach(([lineName, lineData]) => {
              let series;

              if (lineName === "histogram") {
                series = addSeries(indicator, HistogramSeries, {
                  color: "#26a69a",
                });
              } else {
                series = addSeries(indicator, LineSeries, {
                  lineWidth: 2,
                });
              }

              if (!series) return;

              series.setData(lineData);

              groupedSeries[lineName] = series;
            });

            indicatorSeriesRef.current[indicator] = groupedSeries;

            break;
          }

          /* ================= ATR ================= */

          case "ATR": {
            removeSeries(indicatorSeriesRef, chartRef, indicator);

            const series = addSeries(indicator, LineSeries, {
              color: "#ff9800",
              lineWidth: 2,
            });

            if (!series) break;

            series.setData(result.data);

            indicatorSeriesRef.current[indicator] = {
              atr: series,
            };

            break;
          }

          /* ================= DEFAULT ================= */

          default:
            console.warn("Indicator not handled:", indicator);
        }
      } catch (error) {
        console.log(error, "Indicator loading error");
      }
    }
  }

  /* ================= UPDATE STYLE ================= */

  const updateIndicatorStyle = (
    activeBarIndicator,
    indicatorStyle,
    indicatorSeriesRef,
  ) => {
    const seriesGroup = indicatorSeriesRef?.current?.[activeBarIndicator];
    const styleGroup = indicatorStyle?.[activeBarIndicator];

    if (!seriesGroup || !styleGroup) return;

    Object.entries(seriesGroup).forEach(([key, series]) => {
      if (key === "_priceLines") return;

      const config = styleGroup?.[key];

      if (!series || !config) return;

      if (series.applyOptions) {
        series.applyOptions({
          ...(config.color && { color: config.color }),
          ...(config.width && { lineWidth: config.width }),
          ...(config.visible !== undefined && { visible: config.visible }),
        });
      }
    });
  };

  return {
    // chartRef,
    fetchDataByCurrency,
    fetchIndicatorData,
    updateIndicatorStyle,
    // indicatorSeriesRef,
    // latestIndicatorValuesRef,
  };
}

/* ================= FETCH INDICATOR API ================= */

async function fetchDataForIndicators(selectedCurrency, type, timeframeValue) {
  const normalizedType = type.replace(/[\s/]+/g, "");

  let response;

  if (normalizedType == "RSI") {
    response = await apiService.post(
      `/api/indicatorDetails?symbol=${selectedCurrency}&interval=${timeframeValue}&type=${normalizedType}`,
      { maType: "SMA" },
    );
  } else {
    response = await apiService.post(
      `/api/indicatorDetails?symbol=${selectedCurrency}&interval=${timeframeValue}&type=${normalizedType}`,
    );
  }

  // console.log("Raw indicator data for", type, ":", response);

  const mapLine = (arr) =>
    arr?.map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    })) ?? [];

  switch (normalizedType) {
    /* ---------------- SINGLE VALUE ---------------- */

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

    case "SMA":
      return {
        type: "single",
        data:
          response.data
            ?.filter((d) => d.sma != null && d.time != null) // only valid SMA points
            .map((d) => ({
              time: d.time, // timestamp
              value: d.sma, // SMA value
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
        type: "multi",
        data: {
          rsi:
            response.data
              ?.filter((d) => d.rsi != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.rsi,
              })) ?? [],

          smoothingMA:
            response.data
              ?.filter((d) => d.smoothingMA != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.smoothingMA,
              })) ?? [],
        },
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
              value: d.value,
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

function removeSeries(indicatorSeriesRef, chartRef, key) {
  if (indicatorSeriesRef.current[key]) {
    chartRef.current.removeSeries(indicatorSeriesRef.current[key]);
    delete indicatorSeriesRef.current[key];
  }
}
