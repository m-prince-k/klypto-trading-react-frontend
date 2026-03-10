import { LineSeries, HistogramSeries } from "lightweight-charts";
import apiService from "../services/apiServices";
import { getRowsByIndicator } from "./common";

export default function useChartFunctions({
  chartRef,
  addSeries,
  indicatorSeriesRef,
  indicatorStyle,
  latestIndicatorValuesRef,
}) {
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
  ) {
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
            indicatorSeriesRef.current.RSI = {
              result,
              rows,
            };
            const rsi = result?.data?.rsi;
            const sma = result?.data?.smoothingMA;

            latestIndicatorValuesRef.current.RSI = {
              rsi: rsi?.[rsi.length - 1]?.value,
              smoothingMA: sma?.[sma.length - 1]?.value,
            };
            break;
          }

          /* ================= SMA ================= */

          case "SMA": {
            indicatorSeriesRef.current.SMA = {
              result,
              rows,
            };
            const ma = result?.data?.ma;

            latestIndicatorValuesRef.current.SMA = ma?.[ma.length - 1]?.value;
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

            console.log(
              "Stored HMA series:",
              indicatorSeriesRef.current["HMA"],
            );

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

  return {
    fetchDataByCurrency,
    fetchIndicatorData,
  };
}

/* ================= FETCH INDICATOR API ================= */

async function fetchDataForIndicators(selectedCurrency, type, timeframeValue) {
  const normalizedType = type.replace(/[\s/]+/g, "");

  let response;

  if (normalizedType === "RSI") {
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
