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
    } catch (error) {
      console.log(error, "Indicator loading error");
    }
  }
}

async function fetchDataForIndicators(selectedCurrency, type, timeframeValue) {
  const normalizedType = type.replace(/\s+/g, "");

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

    case "BollingerBands":
      return {
        type: "multi",
        data: {
          upper:
            response.data
              ?.filter((d) => d.value?.upper != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.value.upper),
              })) ?? [],

          middle:
            response.data
              ?.filter((d) => d.value?.middle != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.value.middle),
              })) ?? [],

          lower:
            response.data
              ?.filter((d) => d.value?.lower != null)
              .map((d) => ({
                time: Number(d.time),
                value: Number(d.value.lower),
              })) ?? [],
        },
      };

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
function removeSeries(indicatorSeriesRef, chartRef, key) {
  if (indicatorSeriesRef.current[key]) {
    chartRef.current.removeSeries(indicatorSeriesRef.current[key]);
    delete indicatorSeriesRef.current[key];
  }
}
