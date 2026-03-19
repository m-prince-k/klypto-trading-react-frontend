import { LineSeries, HistogramSeries } from "lightweight-charts";
import apiService from "../services/apiServices";
import { getRowsByIndicator } from "./common";
import { useRef } from "react";

export default function useChartFunctions({
  chartRef,
  addSeries,
  indicatorSeriesRef,
  indicatorStyle,
  latestIndicatorValuesRef,
  indicatorConfigs,
  setIndicatorLoading,
}) {
  /* ================= FETCH INDICATOR API ================= */

  async function fetchDataByCurrency(selectedCurrency, timeframeValue) {
    let response;
    if (selectedCurrency && timeframeValue) {
      response = await apiService.post(
        `api/listing?symbol=${selectedCurrency || "BTCUSD"}&interval=${timeframeValue || "1m"}&limit=1000`,
      );
    } else {
      response = await apiService.post(
        `api/listing?symbol=${selectedCurrency || "BTCUSD"}&limit=1000&interval=${timeframeValue || "1m"}`,
      );
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
          setIndicatorLoading,
          indicatorSeriesRef,
        );

        if (!result) continue;

        const normalizedType = indicator.replace(/[\s/%]+/g, "");
        const config = indicatorConfigs?.[normalizedType] || {};
        const { maType } = config;
        const rows = getRowsByIndicator(indicator, maType);

        switch (normalizedType) {
          /* ================= RSI ================= */

          case "RSI": {
            const rsiData = result?.data?.rsi ?? [];
            const smoothingData = result?.data?.smoothingMA ?? [];
            const bbUpperData = result?.data?.bbUpperBand ?? [];
            const bbLowerData = result?.data?.bbLowerBand ?? [];

            indicatorSeriesRef.current.RSI = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.RSI = {
              rsi: rsiData[rsiData.length - 1]?.value,
              smoothingMA: smoothingData[smoothingData.length - 1]?.value,
              bbUpperBand:
                bbUpperData.length > 0
                  ? bbUpperData[bbUpperData.length - 1]?.value
                  : null,
              bbLowerBand:
                bbLowerData.length > 0
                  ? bbLowerData[bbLowerData.length - 1]?.value
                  : null,
            };

            break;
          }
          case "SMA": {
            const smaData = result?.data?.sma ?? [];
            const smoothingData = result?.data?.smoothingMA ?? [];
            const bbUpper = result?.data?.bbUpper ?? [];
            const bbLower = result?.data?.bbLower ?? [];

            indicatorSeriesRef.current.SMA = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.SMA = {
              sma: smaData[smaData.length - 1]?.value,
              smoothingMA: smoothingData[smoothingData.length - 1]?.value,
              bbUpper: bbUpper[bbUpper.length - 1]?.value,
              bbLower: bbLower[bbLower.length - 1]?.value,
            };

            break;
          }

          case "ICHIMOKU": {
            indicatorSeriesRef.current.ICHIMOKU = {
              result,
              rows,
            };
            const conversionLine = result?.data?.conversionLine;
            const baseLine = result?.data?.baseLine;
            const leadLine1 = result?.data?.leadLine1;
            const leadLine2 = result?.data?.leadLine2;
            const laggingSpan = result?.data?.laggingSpan;

            latestIndicatorValuesRef.current.ICHIMOKU = {
              conversionLine:
                conversionLine?.[conversionLine.length - 1]?.value,
              baseLine: baseLine?.[baseLine.length - 1]?.value,
              leadLine1: leadLine1?.[leadLine1.length - 1]?.value,
              leadLine2: leadLine2?.[leadLine2.length - 1]?.value,
              laggingSpan: laggingSpan?.[laggingSpan.length - 1]?.value,
            };

            break;
          }

          case "EMA": {
            const emaData = result?.data?.ema ?? [];
            const smoothingData = result?.data?.smoothingMA ?? [];
            const bbUpperData = result?.data?.bbUpper ?? [];
            const bbLowerData = result?.data?.bbLower ?? [];

            indicatorSeriesRef.current.EMA = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.EMA = {
              ema: emaData[emaData.length - 1]?.value ?? null,
              smoothingMA:
                smoothingData[smoothingData.length - 1]?.value ?? null,
              bbUpper: bbUpperData[bbUpperData.length - 1]?.value ?? null,
              bbLower: bbLowerData[bbLowerData.length - 1]?.value ?? null,
            };

            break;
          }
          case "WMA": {
            const wmaData = result?.data?.wma ?? [];

            indicatorSeriesRef.current.WMA = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.WMA = {
              wma: wmaData[wmaData.length - 1]?.value,
            };

            break;
          }
          case "HMA": {
            const hmaData = result?.data?.hma ?? [];

            indicatorSeriesRef.current.HMA = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.HMA = {
              hma: hmaData[hmaData.length - 1]?.value,
            };

            break;
          }
          case "DEMA": {
            const demaData = result?.data?.dema ?? [];

            indicatorSeriesRef.current.DEMA = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.DEMA = {
              dema: demaData[demaData.length - 1]?.value,
            };

            break;
          }
          case "TEMA": {
            const temaData = result?.data?.tema ?? [];

            indicatorSeriesRef.current.TEMA = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.TEMA = {
              tema: temaData[temaData.length - 1]?.value,
            };

            break;
          }
          case "KAMA": {
            const kamaData = result?.data?.kama ?? [];

            indicatorSeriesRef.current.KAMA = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.KAMA = {
              kama: kamaData[kamaData.length - 1]?.value,
            };

            break;
          }
          case "SUPERTREND": {
            const upTrend = result?.data?.upTrend ?? [];
            const downTrend = result?.data?.downTrend ?? [];

            indicatorSeriesRef.current.SUPERTREND = {
              result,
              rows,
            };

            const last =
              upTrend[upTrend.length - 1]?.value ??
              downTrend[downTrend.length - 1]?.value;

            latestIndicatorValuesRef.current.SUPERTREND = {
              supertrend: last,
            };

            break;
          }
          case "AROON": {
            const aroonUp = result?.data?.aroonUp ?? [];
            const aroonDown = result?.data?.aroonDown ?? [];

            indicatorSeriesRef.current.AROON = {
              result,
              rows,
            };
            console.log(result, "ressssssssssss");

            latestIndicatorValuesRef.current.AROON = {
              aroonUp: aroonUp[aroonUp.length - 1]?.value,
              aroonDown: aroonDown[aroonDown.length - 1]?.value,
            };

            break;
          }
          case "AO": {
            const osc = result?.data ?? [];

            indicatorSeriesRef.current.AO = {
              result,
              rows,
            };

            console.log(result, "ressssssssssss")
            latestIndicatorValuesRef.current.AO = {
              oscillator: osc[osc.length - 1]?.value,
            };

            break;
          }
          case "ADX": {
            indicatorSeriesRef.current.ADX = {
              result,
              rows,
            };

            const adx = result?.data?.adx ?? [];

            latestIndicatorValuesRef.current.ADX = {
              adx: adx[adx.length - 1]?.value,
            };

            break;
          }
          case "CCI": {
            const cciLine = result?.data?.cciLine ?? [];
            const cciMa = result?.data?.cciMa ?? [];
            const bbUpper = result?.data?.bbUpper ?? [];
            const bbLower = result?.data?.bbLower ?? [];

            indicatorSeriesRef.current.CCI = {
              result,
              rows,
            };
            latestIndicatorValuesRef.current.CCI = {
              cci: cciLine[cciLine.length - 1]?.value,
              cciMa: cciMa[cciMa.length - 1]?.value,
              bbUpper: bbUpper[bbUpper.length - 1]?.value,
              bbLower: bbLower[bbLower.length - 1]?.value,
            };

            break;
          }

          case "MOM": {
            const momentum = result?.data?.MOM ?? [];

            if (!indicatorSeriesRef.current.MOM) {
              indicatorSeriesRef.current.MOM = {
                MOM: null,
                result: null,
                rows: [],
              };
            }

            indicatorSeriesRef.current.MOM.result = result;
            indicatorSeriesRef.current.MOM.rows = rows;

            latestIndicatorValuesRef.current.MOM = {
              MOM: momentum[momentum.length - 1]?.value,
            };

            break;
          }

          case "ROC": {
            indicatorSeriesRef.current.ROC = {
              result,
              rows,
            };

            const roc = result?.data?.roc ?? [];

            latestIndicatorValuesRef.current.ROC = {
              roc: roc[roc.length - 1]?.value,
            };

            break;
          }

          case "WPR": {
            indicatorSeriesRef.current["WPR"] = {
              result,
              rows,
            };

            const r = result?.data?.r ?? [];

            latestIndicatorValuesRef.current["WPR"] = {
              r: r[r.length - 1]?.value,
            };

            break;
          }

          case "ATR": {
            indicatorSeriesRef.current.ATR = {
              result,
              rows,
            };

            const atr = result?.data?.atr ?? [];

            latestIndicatorValuesRef.current.ATR = {
              atr: atr[atr.length - 1]?.value,
            };

            break;
          }
          case "MFI": {
            const mfiLine = result?.data?.mfiLine ?? [];

            indicatorSeriesRef.current.MFI = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.MFI = {
              mfiLine: mfiLine[mfiLine.length - 1]?.value,
            };

            break;
          }
          case "PSAR": {
            const psar = result;

            indicatorSeriesRef.current.PSAR = {
              result,
              rows,
            };

            latestIndicatorValuesRef.current.PSAR = {
              psar: psar?.[psar.length - 1]?.value,
            };

            break;
          }

          case "EOM": {
            const eomData = result?.data?.eom ?? [];

            indicatorSeriesRef.current.EOM = {
              result,
              rows,
            };



            console.log(result, "resssssssss")
            latestIndicatorValuesRef.current.EOM = {
              eom: eomData[eomData.length - 1]?.value,
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
async function fetchDataForIndicators(
  selectedCurrency,
  type,
  timeframeValue,
  setIndicatorLoading,
  indicatorSeriesRef,
) {
  try {
    const normalizedType = type?.replace(/[\s/%]+/g, "") || "";

    /* -------- SKIP IF ALREADY FETCHED -------- */
    if (indicatorSeriesRef.current?.[normalizedType]) {
      console.log(`${normalizedType} already loaded, skipping API`);
      return;
    }

    setIndicatorLoading(true);

    const url = `/api/indicatorDetails?symbol=${selectedCurrency}&interval=${timeframeValue}&type=${normalizedType}`;

    const response = await apiService.post(url);

    console.log("Raw indicator data for", type, ":", response);

    const mapLine = (arr, field) =>
      arr
        ?.map((d) => ({
          time: Number(d.time),
          value: d[field] != null ? Number(d[field]) : null,
        }))
        .filter((d) => d.value !== null) ?? [];

    console.log("mapped conversion", response.data, "conversionLine");
    switch (normalizedType) {
      /* ---------------- SINGLE VALUE ---------------- */
      case "AwesomeOscillator":
      case "MACDHistogram":
      case "TRIX":
      case "StandardDeviation":
      case "Volume":
      case "OBV":
      case "VolumeOscillator":
      case "ChaikinMoneyFlow":
      case "EaseofMovement":
      case "NegativeVolumeIndex":
      case "PositiveVolumeIndex":
      case "VWAP":
      case "BollingerBandWidth":
      case "HistoricalVolatility":
      case "ChoppinessIndex":
      case "AccumulationDistribution":
      case "UltimateOscillator":
      case "StochasticRSI":
      case "ChandeMomentumOscillator":

        return {
          type: "single",
          data:
            (await response.data
              ?.filter((d) => d.value != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.value,
              }))) ?? [],
        };

      case "PSAR":
        return {
          type: "single",
          data:
            (await response.data
              ?.filter((d) => d.sar != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.sar,
              }))) ?? [],
        };

      case "SMA":
        return {
          type: "multi",
          data: {
            sma:
              response.data
                ?.filter((d) => d.sma != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.sma,
                })) ?? [],

            smoothingMA:
              response.data
                ?.filter((d) => d.smoothingMA != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.smoothingMA,
                })) ?? [],

            bbUpper:
              response.data
                ?.filter((d) => d.bbUpper != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.bbUpper,
                })) ?? [],

            bbLower:
              response.data
                ?.filter((d) => d.bbLower != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.bbLower,
                })) ?? [],
          },
        };
      case "EMA":
        return {
          type: "multi",
          data: {
            ema:
              response.data
                ?.filter((d) => d.ema != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.ema,
                })) ?? [],

            smoothingMA:
              response.data
                ?.filter((d) => d.smoothingMA != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.smoothingMA,
                })) ?? [],

            bbUpper:
              response.data
                ?.filter((d) => d.bbUpper != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.bbUpper,
                })) ?? [],

            bbLower:
              response.data
                ?.filter((d) => d.bbLower != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.bbLower,
                })) ?? [],
          },
        };

      case "CCI": {
        const rows = Array.isArray(response?.data) ? response.data : [];

        const mapLineCCI = (field) =>
          rows
            .map((d) => ({
              time: Number(d.time),
              value: d[field] != null ? Number(d[field]) : null,
            }))
            .filter((d) => d.value !== null);

        const cciLine = mapLineCCI("cci");
        const cciMa = mapLineCCI("smoothingMA");
        const bbUpper = mapLineCCI("bbUpper");
        const bbLower = mapLineCCI("bbLower");

        return {
          type: "multi",
          data: {
            cciLine,
            cciMa,
            bbUpper,
            bbLower,
          },
        };
      }
      case "HMA":
        return {
          type: "multi",
          data: {
            hma:
              response.data
                ?.filter((d) => d.value != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.value,
                })) ?? [],
          },
        };
      case "DEMA":
        return {
          type: "multi",
          data: {
            dema:
              response.data
                ?.filter((d) => d.value != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.value,
                })) ?? [],
          },
        };

      case "TEMA":
        return {
          type: "multi",
          data: {
            tema:
              response.data
                ?.filter((d) => d.value != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.value,
                })) ?? [],
          },
        };
      case "KAMA":
        return {
          type: "multi",
          data: {
            kama:
              response.data
                ?.filter((d) => d.value != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.value,
                })) ?? [],
          },
        };
      case "AO":
        return {
          type: "single",
          data:
            response.data
              ?.filter((d) => d.aroonOsc != null && d.time != null)
              .map((d) => ({
                time: d.time,
                value: d.aroonOsc,
              })) ?? [],
        };

      case "SUPERTREND":
        return {
          type: "multi",
          data: {
            upTrend:
              response.data?.map((d) => ({
                time: d.time,
                value: d.upTrend ?? null,
              })) ?? [],

            downTrend:
              response.data?.map((d) => ({
                time: d.time,
                value: d.downTrend ?? null,
              })) ?? [],

            bodyMiddle:
              response.data?.map((d) => ({
                time: d.time,
                value: d.bodyMiddle,
              })) ?? [],
          },
        };

      case "MOM":
        return {
          type: "multi",
          data: {
            momentum:
              response.data
                ?.filter((d) => d.mom != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.mom,
                })) ?? [],
          },
        };

      case "ROC":
        return {
          type: "multi",
          data: {
            roc:
              response.data
                ?.filter((d) => d.roc != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.roc,
                })) ?? [],
          },
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
      case "ADX":
        return {
          type: "multi",
          data: {
            adx:
              response.data
                ?.filter((d) => d.adx != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.adx,
                })) ?? [],
          },
        };
      case "MFI":
        return {
          type: "multi",
          data: {
            mfiLine:
              response.data
                ?.filter((d) => d.mfi != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.mfi,
                })) ?? [],
          },
        };

      case "ATR":
        return {
          type: "single",

          data: (response?.data ?? [])
            .filter((d) => d && d.atr != null && d.time != null)
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.atr),
            })),
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

            bbUpperBand:
              response.data
                ?.filter((d) => d.bbUpperBand != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.bbUpperBand,
                })) ?? [],

            bbLowerBand:
              response.data
                ?.filter((d) => d.bbLowerBand != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.bbLowerBand,
                })) ?? [],
          },
        };

      case "AROON":
        return {
          type: "multi",
          data: {
            aroonUp: response.data?.aroonUpSeries ?? [],
            aroonDown: response.data?.aroonDownSeries ?? [],
          },
        };

      case "WPR":
        return {
          type: "multi",
          data: {
            r:
              response.data?.candles
                ?.filter((d) => d.percentR != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.percentR,
                })) ?? [],
          },
        };
      case "WMA":
        return {
          type: "multi",
          data: {
            wma:
              response.data
                ?.filter((d) => d.value != null && d.time != null)
                .map((d) => ({
                  time: d.time,
                  value: d.value,
                })) ?? [],
          },
        };

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

      case "EOM":
        return {
          type: "single",
          data: {
            eom:
              response?.data
                ?.filter((d) => d.eom != null && d.time != null)
                .map((d) => ({
                  time: Number(d.time),
                  value: Number(d.eom),
                })) ?? [],
          },
        };

      case "AD":
        return {
          type: "single",
          data: {
            ad:
              response?.data
                ?.filter((d) => d.value != null && d.time != null)
                .map((d) => ({
                  time: Number(d.time),
                  value: Number(d.value),
                })) ?? [],
          },
        };
      /* ---------------- MULTI LINE ---------------- */

      case "ICHIMOKU":
        return {
          type: "multi",
          data: {
            conversionLine: mapLine(response.data, "conversionLine"),
            baseLine: mapLine(response.data, "baseLine"),

            leadLine1: mapLine(response.data, "leadLine1"),
            leadLine2: mapLine(response.data, "leadLine2"),

            laggingSpan: mapLine(response.data, "laggingSpan"),

            kumoCloudUpper: mapLine(response.data, "kumoCloudUpper"),
            kumoCloudLower: mapLine(response.data, "kumoCloudLower"),
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

      // case "AD": {
      //   const adData = result?.data?.ad ?? [];

      //   if (!indicatorSeriesRef.current.AD) {
      //     indicatorSeriesRef.current.AD = {};
      //   }

      //   indicatorSeriesRef.current.AD.result = result;
      //   indicatorSeriesRef.current.AD.rows = rows;

      //   latestIndicatorValuesRef.current.AD = {
      //     ad: adData[adData.length - 1]?.value,
      //   };

      //   break;
      // }

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
  } catch (error) {
    console.error("Indicator fetch error:", error);
    return { type: "error", data: [] };
  } finally {
    setIndicatorLoading(false);
  }
}
