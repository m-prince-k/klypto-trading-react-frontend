// import { HistogramSeries, LineSeries } from "lightweight-charts";
// import apiService from "../services/apiServices";
// import { getRowsByIndicator } from "./common";

// export async function fetchDataByCurrency(selectedCurrency, timeframeValue) {
//   let response;
//   if (selectedCurrency && timeframeValue) {
//     response = await apiService.post(
//       `api/listing?symbol=${selectedCurrency || "BTCUSD"}&interval=${timeframeValue || "1m"}&limit=1000`,
//     );
//     // console.log(response, "resssssssssssssss")
//   } else {
//     response = await apiService.post(
//       `api/listing?symbol=${selectedCurrency || "BTCUSD"}&limit=1000&interval=${timeframeValue || "1m"}`,
//     );
//     // console.log(response, "resssssssssssssss")
//   }
//   return response;
// }

// export async function fetchIndicatorData(
//   selectedIndicator,
//   selectedCurrency,
//   timeframeValue,
//   chartRef,
//   addSeries,
//   indicatorSeriesRef,
//   indicatorStyle,
// ) {
//   console.log(indicatorStyle, "styloeeeeeeeeeeeeeeeeeeeeeeeee");

//   if (!selectedIndicator?.length) return;

//   for (const indicator of selectedIndicator) {
//     try {
//       const result = await fetchDataForIndicators(
//         selectedCurrency,
//         indicator,
//         timeframeValue,
//       );

//       if (!result) continue;

//       const rows = getRowsByIndicator(indicator);

//       switch (indicator) {
//         /* ================= RSI ================= */

//         case "RSI": {
//           const groupedSeries = {};

//           Object.entries(result.data).forEach(([lineName, lineData]) => {
//             const rowConfig = rows?.find((r) => r.key === lineName);
//             const styleConfig = indicatorStyle?.[indicator]?.[lineName];

//             const series = addSeries(indicator, LineSeries, {
//               color: styleConfig?.color || rowConfig?.color || "#26a69a",
//               lineWidth: styleConfig?.width || 2,
//               visible: styleConfig?.visible ?? true,
//             });

//             if (!series) return;

//             series.setData(lineData);

//             groupedSeries[lineName] = series;
//           });

//           /* ================= RSI BANDS ================= */

//           const upperBand = indicatorStyle?.[indicator]?.upper;
//           const middleBand = indicatorStyle?.[indicator]?.middle;
//           const lowerBand = indicatorStyle?.[indicator]?.lower;

//           const rsiSeries = groupedSeries["rsi"];

//           if (rsiSeries) {
//             rsiSeries.createPriceLine({
//               price: upperBand?.value ?? 70,
//               color: upperBand?.color || "#ef5350",
//               lineWidth: upperBand?.width ?? 2,
//               lineStyle: 2,
//               axisLabelVisible: true,
//               title: "Upper",
//             });

//             rsiSeries.createPriceLine({
//               price: middleBand?.value ?? 50,
//               color: middleBand?.color || "#9e9e9e",
//               lineWidth: middleBand?.width ?? 2,
//               lineStyle: 2,
//               axisLabelVisible: true,
//               title: "Middle",
//             });

//             rsiSeries.createPriceLine({
//               price: lowerBand?.value ?? 30,
//               color: lowerBand?.color || "#26a69a",
//               lineWidth: lowerBand?.width ?? 2,
//               lineStyle: 2,
//               axisLabelVisible: true,
//               title: "Lower",
//             });
//           }

//           const overboughtSeries = chartRef.addHistogramSeries({
//             priceScaleId: "",
//             priceFormat: { type: "price", precision: 2 },
//             color: "rgba(239,83,80,0.3)",
//             base: 70,
//             lineWidth: 0,
//           });

//           const oversoldSeries = chartRef.addHistogramSeries({
//             priceScaleId: "",
//             priceFormat: { type: "price", precision: 2 },
//             color: "rgba(38,166,154,0.3)",
//             base: 30,
//             lineWidth: 0,
//           });

//           indicatorSeriesRef.current[indicator] = groupedSeries;

//           break;
//         }

//         /* ================= SMA ================= */

//         case "SMA": {
//           removeSeries(indicatorSeriesRef, chartRef, indicator);

//           const styleConfig = indicatorStyle?.SMA?.sma;

//           const series = addSeries(indicator, LineSeries, {
//             color: styleConfig?.color || "#2962ff",
//             lineWidth: styleConfig?.width || 2,
//             visible: styleConfig?.visible ?? true,
//           });

//           if (!series) break;

//           series.setData(result.data);
//           console.log("Stored SMA series:", indicatorSeriesRef.current["SMA"]);

//           // store with correct key
//           indicatorSeriesRef.current["SMA"] = {
//             sma: series,
//           };

//           console.log("Stored SMA series:", indicatorSeriesRef.current["SMA"]);

//           break;
//         }

//         /* ================= MACD ================= */

//         case "MACD": {
//           const groupedSeries = {};

//           Object.entries(result.data).forEach(([lineName, lineData]) => {
//             let series;

//             if (lineName === "histogram") {
//               series = addSeries(indicator, HistogramSeries, {
//                 color: "#26a69a",
//               });
//             } else {
//               series = addSeries(indicator, LineSeries, {
//                 lineWidth: 2,
//               });
//             }

//             if (!series) return;

//             series.setData(lineData);

//             groupedSeries[lineName] = series;
//           });

//           indicatorSeriesRef.current[indicator] = groupedSeries;

//           break;
//         }

//         /* ================= ATR ================= */

//         case "ATR": {
//           removeSeries(indicatorSeriesRef, chartRef, indicator);

//           const series = addSeries(indicator, LineSeries, {
//             color: "#ff9800",
//             lineWidth: 2,
//           });

//           if (!series) break;

//           series.setData(result.data);

//           indicatorSeriesRef.current[indicator] = {
//             atr: series,
//           };

//           break;
//         }

//         /* ================= DEFAULT ================= */

//         default:
//           console.warn("Indicator not handled:", indicator);
//       }
//     } catch (error) {
//       console.log(error, "Indicator loading error");
//     }
//   }
// }

// export const updateIndicatorStyle = (
//   activeBarIndicator,
//   indicatorStyle,
//   indicatorSeriesRef,
// ) => {
//   console.log(
//     indicatorStyle,
//     "-------------------------------------------------------",
//   );

//   const seriesGroup = indicatorSeriesRef?.current?.[activeBarIndicator];
//   const styleGroup = indicatorStyle?.[activeBarIndicator];

//   if (!seriesGroup || !styleGroup) return;

//   /* ================= UPDATE SERIES ================= */

//   Object.entries(seriesGroup).forEach(([key, series]) => {
//     const config = styleGroup?.[key];

//     if (!series || !config) return;

//     if (series.applyOptions) {
//       series.applyOptions({
//         ...(config.color && { color: config.color }),
//         ...(config.width && { lineWidth: config.width }),
//         ...(config.visible !== undefined && { visible: config.visible }),
//       });
//     }
//   });

//   /* ================= UPDATE RSI BANDS ================= */

//   if (activeBarIndicator === "RSI") {
//     const rsiSeries = seriesGroup["rsi"];
//     if (!rsiSeries) return;

//     const upper = styleGroup?.upper;
//     const middle = styleGroup?.middle;
//     const lower = styleGroup?.lower;

//     /* REMOVE OLD LINES */

//     if (seriesGroup._priceLines) {
//       const oldLines = seriesGroup._priceLines;

//       if (oldLines.upper) rsiSeries.removePriceLine(oldLines.upper);
//       if (oldLines.middle) rsiSeries.removePriceLine(oldLines.middle);
//       if (oldLines.lower) rsiSeries.removePriceLine(oldLines.lower);
//     }

//     /* CREATE NEW LINES */

//     seriesGroup._priceLines = {
//       upper: rsiSeries.createPriceLine({
//         price: upper?.value ?? 70,
//         color: upper?.color || "#ef5350",
//         lineWidth: upper?.width ?? 2,
//         lineStyle: 2,
//       }),

//       middle: rsiSeries.createPriceLine({
//         price: middle?.value ?? 50,
//         color: middle?.color || "#9e9e9e",
//         lineWidth: middle?.width ?? 2,
//         lineStyle: 2,
//       }),

//       lower: rsiSeries.createPriceLine({
//         price: lower?.value ?? 30,
//         color: lower?.color || "#26a69a",
//         lineWidth: lower?.width ?? 2,
//         lineStyle: 2,
//       }),
//     };
//   }
// };
// export async function fetchDataForIndicators(
//   selectedCurrency,
//   type,
//   timeframeValue,
// ) {
//   const normalizedType = type.replace(/[\s/%]+/g, "");;

//   let response;

//   if (normalizedType == "RSI") {
//     response = await apiService.post(
//       `/api/indicatorDetails?symbol=${selectedCurrency}&interval=${timeframeValue}&type=${normalizedType}`,
//       { maType: "SMA" },
//     );
//   } else {
//     response = await apiService.post(
//       `/api/indicatorDetails?symbol=${selectedCurrency}&interval=${timeframeValue}&type=${normalizedType}`,
//     );
//   }

//   // console.log("Raw indicator data for", type, ":", response);

//   const mapLine = (arr) =>
//     arr?.map((d) => ({
//       time: Number(d.time),
//       value: Number(d.value),
//     })) ?? [];

//   switch (normalizedType) {
//     /* ---------------- SINGLE VALUE ---------------- */

//     case "EMA":
//     case "HMA":
//     case "DEMA":
//     case "TEMA":
//     case "AMA":
//     case "ADX":
//     case "SuperTrend":
//     case "Aroon":
//     case "AroonOscillator":
//     case "Momentum":
//     case "ROC":
//     case "AwesomeOscillator":
//     case "MACDHistogram":
//     case "TRIX":
//     case "StandardDeviation":
//     case "Volume":
//     case "OBV":
//     case "VolumeOscillator":
//     case "ChaikinMoneyFlow":
//     case "MFI":
//     case "EaseofMovement":
//     case "NegativeVolumeIndex":
//     case "PositiveVolumeIndex":
//     case "VWAP":
//     case "BollingerBandWidth":
//     case "HistoricalVolatility":
//     case "ChoppinessIndex":
//     case "AccumulationDistribution":
//     case "WilliamsR":
//     case "UltimateOscillator":
//     case "StochasticRSI":
//     case "ParabolicSAR":
//     case "ChandeMomentumOscillator":
//       return {
//         type: "single",
//         data:
//           response.data
//             ?.filter((d) => d.value != null && d.time != null)
//             .map((d) => ({
//               time: d.time,
//               value: d.value,
//             })) ?? [],
//       };

//     case "SMA":
//       return {
//         type: "single",
//         data:
//           response.data
//             ?.filter((d) => d.sma != null && d.time != null) // only valid SMA points
//             .map((d) => ({
//               time: d.time, // timestamp
//               value: d.sma, // SMA value
//             })) ?? [],
//       };

//     case "ZigZag": {
//       const rows = response?.data ?? [];

//       console.log("ZigZag:", rows.length);

//       return {
//         type: "single",
//         data: rows
//           .filter((d) => d.value != null && d.time != null)
//           .map((d) => ({
//             time: d.time,
//             value: d.value,
//           })),
//       };
//     }

//     case "ATR":
//       return {
//         type: "single",

//         data:
//           response.data
//             ?.filter((d) => d.ATR != null && d.time != null)
//             .map((d) => ({
//               time: d.time,
//               value: d.ATR,
//             })) ?? [],
//       };

//     case "RSI":
//       return {
//         type: "multi",
//         data: {
//           rsi:
//             response.data
//               ?.filter((d) => d.rsi != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.rsi,
//               })) ?? [],

//           rsiMa:
//             response.data
//               ?.filter((d) => d.sma != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.sma,
//               })) ?? [],
//         },
//       };

//     /* ---------------- NESTED VALUE ---------------- */

//     case "WMA":
//       return {
//         type: "single",
//         data:
//           response.data
//             ?.filter((d) => d.wma != null && d.time != null)
//             .map((d) => ({
//               time: d.time,
//               value: d.wma,
//             })) ?? [],
//       };

//     case "CCI": {
//       const rows = Array.isArray(response?.data) ? response.data : [];

//       console.log("CCI rows:", rows.length);
//       console.log("CCI sample:", rows[0]);

//       return {
//         type: "single",
//         data: rows.map((d) => ({
//           time: d.time,
//           value: d.cci,
//         })),
//       };
//     }

//     case "PivotPoints(Standard)": {
//       const d = response?.data ?? {};

//       console.log("Pivot Standard:", d);

//       return {
//         type: "pivot",
//         data: [
//           { label: "P", value: Number(d.P) },
//           { label: "R1", value: Number(d.R1) },
//           { label: "R2", value: Number(d.R2) },
//           { label: "R3", value: Number(d.R3) },
//           { label: "S1", value: Number(d.S1) },
//           { label: "S2", value: Number(d.S2) },
//           { label: "S3", value: Number(d.S3) },
//         ].filter((level) => !Number.isNaN(level.value)),
//       };
//     }

//     case "PivotPoints(Fibonacci)": {
//       const d = response?.data ?? {};

//       console.log("PivotFibonacci:", d);

//       return {
//         type: "pivot",
//         data: [
//           { label: "P", value: Number(d.P) },
//           { label: "R1", value: Number(d.R1) },
//           { label: "R2", value: Number(d.R2) },
//           { label: "R3", value: Number(d.R3) },
//           { label: "S1", value: Number(d.S1) },
//           { label: "S2", value: Number(d.S2) },
//           { label: "S3", value: Number(d.S3) },
//         ].filter((level) => !Number.isNaN(level.value)),
//       };
//     }
//     case "PivotPoints(Camarilla)": {
//       const d = response?.data ?? {};

//       console.log("Pivot Camarilla:", d);

//       return {
//         type: "pivot",
//         data: [
//           { label: "P", value: Number(d.P) },
//           { label: "R1", value: Number(d.R1) },
//           { label: "R2", value: Number(d.R2) },
//           { label: "R3", value: Number(d.R3) },
//           { label: "R4", value: Number(d.R4) }, // Camarilla often has R4/S4
//           { label: "S1", value: Number(d.S1) },
//           { label: "S2", value: Number(d.S2) },
//           { label: "S3", value: Number(d.S3) },
//           { label: "S4", value: Number(d.S4) },
//         ].filter((level) => !Number.isNaN(level.value)),
//       };
//     }

//     case "PivotPoints(Classic)": {
//       const d = response?.data ?? {};

//       console.log("Pivot Classic:", d);

//       return {
//         type: "pivot",
//         data: [
//           { label: "P", value: Number(d.P) },
//           { label: "R1", value: Number(d.R1) },
//           { label: "R2", value: Number(d.R2) },
//           { label: "R3", value: Number(d.R3) },
//           { label: "S1", value: Number(d.S1) },
//           { label: "S2", value: Number(d.S2) },
//           { label: "S3", value: Number(d.S3) },
//         ].filter((level) => !Number.isNaN(level.value)),
//       };
//     }

//     /* ---------------- MULTI LINE ---------------- */

//     case "IchimokuCloud":
//       return {
//         type: "multi",
//         data: {
//           tenkan: mapLine(response.data?.tenkan),
//           kijun: mapLine(response.data?.kijun),
//           spanA: mapLine(response.data?.spanA),
//           spanB: mapLine(response.data?.spanB),
//           chikou: mapLine(response.data?.chikou),
//         },
//       };

//     case "ChandeKrollStop":
//       return {
//         type: "multi",
//         data: {
//           longStop:
//             response.data
//               ?.filter((d) => d.longStop != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.longStop,
//               })) ?? [],

//           shortStop:
//             response.data
//               ?.filter((d) => d.shortStop != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.shortStop,
//               })) ?? [],
//         },
//       };

//     case "Stochastic":
//       return {
//         type: "multi",
//         data: {
//           k:
//             response.data
//               ?.filter((d) => d.k != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.k,
//               })) ?? [],

//           d:
//             response.data
//               ?.filter((d) => d.d != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.d,
//               })) ?? [],
//         },
//       };

//     case "MACD":
//       return {
//         type: "multi",
//         data: {
//           macd:
//             response.data
//               ?.filter((d) => d.macd != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.macd,
//               })) ?? [],

//           signal:
//             response.data
//               ?.filter((d) => d.macdSignal != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.macdSignal,
//               })) ?? [],

//           histogram:
//             response.data
//               ?.filter((d) => d.macdHistogram != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.macdHistogram,
//               })) ?? [],
//         },
//       };

//     case "KlingerOscillator":
//       return {
//         type: "multi",
//         data: {
//           kvo:
//             response.data
//               ?.filter((d) => d.kvo != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.kvo,
//               })) ?? [],

//           signal:
//             response.data
//               ?.filter((d) => d.signal != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.signal,
//               })) ?? [],
//         },
//       };

//     case "BollingerBands": {
//       const rows = response?.data ?? [];

//       return {
//         type: "multi",
//         data: {
//           upper: rows
//             .filter((d) => d.upper != null && d.time != null)
//             .map((d) => ({
//               time: d.time,
//               value: d.upper,
//             })),

//           middle: rows
//             .filter((d) => d.middle != null && d.time != null)
//             .map((d) => ({
//               time: d.time,
//               value: d.middle,
//             })),

//           lower: rows
//             .filter((d) => d.lower != null && d.time != null)
//             .map((d) => ({
//               time: d.time,
//               value: d.lower,
//             })),
//         },
//       };
//     }

//     case "FisherTransform": {
//       const rows = response?.data ?? [];

//       return {
//         type: "multi",
//         data: {
//           fisher: rows
//             .filter((d) => d.fisher != null && d.time != null)
//             .map((d) => ({
//               time: d.time,
//               value: d.fisher,
//             })),

//           trigger: rows
//             .filter((d) => d.trigger != null && d.time != null)
//             .map((d) => ({
//               time: d.time,
//               value: d.trigger,
//             })),
//         },
//       };
//     }

//     case "KeltnerChannels":
//       return {
//         type: "multi",
//         data: {
//           upper:
//             response.data
//               ?.filter((d) => d.upper != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.upper,
//               })) ?? [],

//           middle:
//             response.data
//               ?.filter((d) => d.middle != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.middle,
//               })) ?? [],

//           lower:
//             response.data
//               ?.filter((d) => d.lower != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.lower,
//               })) ?? [],
//         },
//       };

//     case "DonchianChannels":
//       return {
//         type: "multi",
//         data: {
//           upper:
//             response.data
//               ?.filter((d) => d.upper != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.upper,
//               })) ?? [],

//           middle:
//             response.data
//               ?.filter((d) => d.middle != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.middle,
//               })) ?? [],

//           lower:
//             response.data
//               ?.filter((d) => d.lower != null && d.time != null)
//               .map((d) => ({
//                 time: d.time,
//                 value: d.lower,
//               })) ?? [],
//         },
//       };

//     default:
//       return {
//         type: "single",
//         data: [],
//       };
//   }
// }

// function safeRemoveSeries(chart, series) {
//   try {
//     if (!chart || !series) return;
//     chart.removeSeries(series);
//   } catch (e) {}
// }

// function getPivotColor(label) {
//   if (label === "P") return "#eab308"; // Pivot → Yellow
//   if (label.startsWith("R")) return "#44d5ef"; // Resistance → Red
//   if (label.startsWith("S")) return "#9722c5"; // Support → Green
//   return "#94a3b8";
// }

// function removeSeries(indicatorSeriesRef, chartRef, key) {
//   if (indicatorSeriesRef.current[key]) {
//     chartRef.current.removeSeries(indicatorSeriesRef.current[key]);
//     delete indicatorSeriesRef.current[key];
//   }
// }
