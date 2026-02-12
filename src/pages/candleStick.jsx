import {
  createChart,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  HistogramSeries,
  BaselineSeries,
} from "lightweight-charts";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import { RiResetRightLine } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import { FaCode, FaEye, FaEyeSlash, FaFileWaveform } from "react-icons/fa6";
import { Form } from "../components/tradingModals/Form";
import ChartHeader from "../components/tradingModals/ChartHeader";
import {
  ChartProprties,
  TIMEFRAME_TO_SECONDS,
  SINGLE_VALUE_CHARTS,
  INDICATOR_COLORS,
} from "../util/common";
import apiService from "../services/apiServices";
import moment from "moment/moment";
import { IndicatorBar } from "../components/indicator/IndicatorBar";
import { IoCloseSharp, IoSettingsOutline } from "react-icons/io5";
import { FiMoreHorizontal } from "react-icons/fi";
import IndicatorAlert from "../components/indicator/IndicatorAlert";

export default function Candlestick() {
  const chartRef = useRef();
  const containerRef = useRef();
  const seriesRef = useRef(null);
  const indicatorSeriesRef = useRef({});
  const latestIndicatorValuesRef = useRef({});

  const socketRef = useRef(null);
  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState("1m");
  const [selectedCurrency, setSelectedCurrency] = useState("BTCUSDT");
  const [selectedIndicator, setSelectedIndicator] = useState([]);
  const [rangeValue, setRangeValue] = useState("1000");
  const [chartType, setChartType] = useState("candlestick");
  const [historicalData, setHistoricalData] = useState([]);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [liveOhlcv, setLiveOhlcv] = useState({});
  const [liveIndicatorData, setLiveIndicatorData] = useState({});
  const [showAlertForm, setShowAlertForm] = useState(false);
  const getIndicatorColor = (index) =>
    INDICATOR_COLORS[index % INDICATOR_COLORS.length];
  const openAlert = () => {
    setShowAlertForm(true);
  };

  const closeAlert = () => {
    setShowAlertForm(false);
  };
  // console.log(
  //   liveIndicatorData,
  //   "live indicator data-----------------------------",
  // );

  const [indicatorVisible, setIndicatorVisible] = useState(true);

  const isUp = liveOhlcv?.close >= liveOhlcv?.open;
  const valueColor = isUp ? "text-green-500" : "text-red-500";

  useEffect(() => {
    chartRef.current = createChart(containerRef.current, ChartProprties);

    /* =======================
       2️⃣ Load Historical OHLC
    ======================== */

    const end = Math.floor(Date.now() / 1000);
    const start = end - 60 * 60;

    // --------------------------API calling for live records-current time Stamps-----------------------------

    fetch(
      `https://api.india.delta.exchange/v2/history/candles?symbol=${selectedCurrency}&resolution=${timeframeValue}&start=${start}&end=${end}`,
    )
      .then((res) => res.json())
      .then(async (data) => {
        const candles = await data?.result?.map((c) => ({
          time: c.time, // unix seconds
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
        }));

        // seriesRef.current.setData(candles);
        // chartRef.current = candles[candles.length - 1];
      });

    /* =======================
       3️⃣ WebSocket Trades
    ======================== */
    const socket = new WebSocket("wss://socket.delta.exchange");

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "subscribe",
          payload: {
            channels: [
              {
                name: "v2/ticker",
                symbols: [selectedCurrency ? selectedCurrency : "BTCUSD"],
              },
            ],
          },
        }),
      );
    };

    let currentCandle = null;

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (!msg?.mark_price || !msg?.timestamp) return;
      const price = Number(msg?.mark_price);
      const intervalSec = TIMEFRAME_TO_SECONDS[timeframeValue];
      const time = Math.floor(msg?.timestamp / intervalSec) * intervalSec;

      if (!currentCandle || currentCandle.time !== time) {
        // 🔥 new candle
        const date = new Date(time / 1000);

        currentCandle = {
          time: time / 1000, // convert to unix seconds
          open: price,
          high: price,
          low: price,
          close: price,
        };
        setLiveOhlcv(currentCandle);
        // console.log(
        //   currentCandle,
        //   "current candle-----------------------------",
        // );
      } else {
        // 🔁 update candle
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
      }
    };

    return () => {
      socket.close();
      chartRef.current.remove();
    };
  }, []);

  //  -------------------LOAD INDICATOR FROM API------------------------------

  const loadIndicator = async () => {
    try {
      const { candles, indicatorData } = await apiService.post(
        `indicatorDetails?symbol=BTCUSD&interval=1d&indicator=${selectedIndicator.toLocaleUpperCase()}`,
      );

      if (chartType === "line") {
        console.log(indicatorData, "loading indicator");

        // Remove old indicator only
        // if (indicatorSeriesRef.current) {
        //   chartRef.current.removeSeries(indicatorSeriesRef.current);
        // }

        // indicatorSeriesRef.current = chartRef.current.addSeries(LineSeries, {
        //   color: "#facc15",
        //   lineWidth: 2,
        // });

        // indicatorSeriesRef.current.setData(
        //   indicatorData.map((d) => ({
        //     time: d.time,
        //     value: d.close, // indicators use value, NOT close
        //   })),
        // );
      }

      // Overlay indicators
      // if (panel === "overlay") {
      //   series = chartRef.current.addSeries(LineSeries, {
      //     color: "#3b82f6",
      //     lineWidth: 2,
      //   });
      // }

      // // Separate panel indicators (RSI, MACD)
      // if (panel === "separate") {
      //   series = chartRef.current.addSeries(LineSeries, {
      //     color: "#facc15",
      //     priceScaleId: "right",
      //   });
      // }

      // // Volume
      // if (panel === "volume") {
      //   series = chartRef.current.addSeries(HistogramSeries, {
      //     priceFormat: { type: "volume" },
      //     priceScaleId: "",
      //     scaleMargins: { top: 0.8, bottom: 0 },
      //   });
      // }

      // series.setData(data);
      // indicatorSeriesRef.current[selectedIndicator] = series;
    } catch (error) {
      console.log(
        error,
        "______________error loading indicator__________________",
      );
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const handler = (param) => {
      const liveValues = {};

      // ✅ Cursor outside chart OR no data
      if (!param.time || !param.seriesData || param.seriesData.size === 0) {
        selectedIndicator.forEach((indicator) => {
          const latest = latestIndicatorValuesRef.current[indicator];
          if (latest !== undefined) {
            liveValues[indicator] = latest;
          }
        });

        setLiveIndicatorData(liveValues);
        return;
      }

      // ✅ Cursor inside chart
      selectedIndicator.forEach((indicator) => {
        const series = indicatorSeriesRef.current[indicator];
        if (!series) return;

        const dataPoint = param.seriesData.get(series);

        if (dataPoint?.value !== undefined) {
          liveValues[indicator] = dataPoint.value;
        }
      });

      setLiveIndicatorData(liveValues);
    };

    chartRef.current.subscribeCrosshairMove(handler);

    return () => chartRef.current.unsubscribeCrosshairMove(handler);
  }, [selectedIndicator]);

  const removeIndicator = (indicator) => {
    const series = indicatorSeriesRef.current[indicator];
    if (!series) return;

    chartRef.current.removeSeries(series);

    delete indicatorSeriesRef.current[indicator];

    setSelectedIndicator((prev) => prev.filter((i) => i !== indicator));
  };

  const toggleIndicator = async (indicator) => {
    setSelectedIndicator((prev) => {
      const alreadySelected = prev.includes(indicator);

      // ✅ UNCHECK → REMOVE FROM CHART
      if (alreadySelected) {
        const series = indicatorSeriesRef.current[indicator];

        if (series && chartRef.current) {
          chartRef.current.removeSeries(series);
        }

        delete indicatorSeriesRef.current[indicator];

        return prev.filter((i) => i !== indicator);
      }

      // ✅ CHECK → ADD TO STATE (series added via effect / fetch)
      return [...prev, indicator];
    });
  };

  async function fetchIndicatorData() {
    if (!selectedIndicator.length) return;

    selectedIndicator.forEach(async (indicator, index) => {
      try {
        const { data } = await apiService.post(
          `indicatorDetails?symbol=BTCUSD&interval=${timeframeValue}&type=${indicator}`,
        );

        // Remove old series if exists
        if (indicatorSeriesRef.current[indicator]) {
          chartRef.current.removeSeries(indicatorSeriesRef.current[indicator]);
        }

        const series = chartRef.current.addSeries(LineSeries, {
          color: getIndicatorColor(index),
          lineWidth: 2,
        });

        // ✅ FORMAT DATA HERE
        const formatted = data
          .filter((d) => d.value != null)
          .map((d) => ({
            time: Number(d.time), // ✅ Ensure number
            value: Number(d.value),
          }));

        series.setData(formatted);

        // ✅ SAVE LATEST VALUE HERE (CRITICAL)
        if (formatted.length) {
          latestIndicatorValuesRef.current[indicator] =
            formatted[formatted.length - 1].value;
        }


        indicatorSeriesRef.current[indicator] = series;
        console.log(latestIndicatorValuesRef.current, "loaded indicator-----------------------------");
      } catch (error) {
        console.log(indicator, "Indicator loading error");
      }
    });
  }

  // useEffect(() => {
  //   loadIndicator();
  // }, [selectedIndicator, chartType]);

  useEffect(() => {
    try {
      chartRef.current.removeSeries(seriesRef.current);
    } catch (e) {
      console.warn("Series already removed");
    }

    seriesRef.current = null;

    switch (chartType) {
      case "line":
        // async function fetchIndicatorData() {
        //   if (!selectedIndicator) return;

        //   try {
        //     const { data } = await apiService.post(
        //       `indicatorDetails?symbol=BTCUSD&interval=${timeframeValue}&type=${selectedIndicator.toUpperCase()}`,
        //     );

        //     console.log(data, "indicator candles-------------------------");
        //     // Remove old indicator
        //     if (indicatorSeriesRef.current) {
        //       chartRef.current.removeSeries(indicatorSeriesRef.current);
        //     }

        //     indicatorSeriesRef.current = chartRef.current.addSeries(
        //       LineSeries,
        //       {
        //         color: "#facc15",
        //         lineWidth: 3,
        //       },
        //     );

        //     indicatorSeriesRef?.current.setData(
        //       data
        //         .filter((d) => d.value != null)
        //         .map((d) => ({
        //           time: d.time,
        //           value: Number(d.value),
        //         })),
        //     );
        //     chartRef.current.subscribeCrosshairMove((param) => {
        //       if (!param.time || !param.seriesData) {
        //         setLiveIndicatorData(null);
        //         return;
        //       }

        //       const candle = param.seriesData?.get(indicatorSeriesRef.current);
        //       if (!candle) return;

        //       setLiveIndicatorData(candle);
        //     });

        //     indicatorSeriesRef.current.applyOptions({
        //       visible: indicatorVisible,
        //     });
        //   } catch (error) {
        //     console.log(error, "Indicator loading error");
        //   }
        // }
        async function LineData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency || "BTCUSD"}&interval=${timeframeValue || "1m"}&limit=${rangeValue || 1000}`,
              { type: chartType },
            );
          } else {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency || "BTCUSD"}&limit=${rangeValue || 1000}&interval=${timeframeValue || "1m"}`,
              { type: chartType },
            );
          }

          // ✅ Remove MAIN price line only
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }

          seriesRef.current = chartRef.current.addSeries(LineSeries, {
            color: "#38bdf8",
          });

          seriesRef.current.setData(
            response.data.map((d) => ({
              time: d.time,
              value: Number(Math.round(d.close)), // ✅ Prevent undefined crash
            })),
          );
        }

        // ✅ CRITICAL FIX → Ensure correct order
        async function loadLine() {
          await LineData(); // Draw price line FIRST
          await fetchIndicatorData(); // Overlay indicator AFTER
        }
        loadLine();
        break;

      case "bar":
        async function BarData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );
          } else {
            console.log("fourth insertion------------------------------");
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(BarSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
          });
          seriesRef.current.setData(
            response.data.map((d) => ({
              time: d.time,
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
            })),
          );
          chartRef.current.timeScale().fitContent();
        }
        async function loadBar() {
          await BarData(); // Draw price line FIRST
          await fetchIndicatorData(); // Overlay indicator AFTER
        }
        loadBar();
        break;

      case "area":
        async function AreaData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );
          } else {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(AreaSeries, {
            topColor: "rgba(56,189,248,0.4)",
            bottomColor: "rgba(56,189,248,0)",
            lineColor: "#38bdf8",
          });

          seriesRef.current.setData(
            await response.data.map((d) => ({
              time: d?.time,
              value: Number(d?.close),
            })),
          );
          console.log(response.data, "area data-----------------------------");
          chartRef.current.timeScale().fitContent();
        }
        AreaData();
        break;

      case "baseline":
        async function BaseLineData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );
          } else {
            console.log("fourth insertion------------------------------");
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(BaselineSeries, {
            baseValue: { type: "price", price: response.data[0]?.close },

            topLineColor: "rgba(34,197,94,1)", // green
            topFillColor1: "rgba(34,197,94,0.4)",
            topFillColor2: "rgba(34,197,94,0.05)",

            bottomLineColor: "rgba(239,68,68,1)", // red
            bottomFillColor1: "rgba(239,68,68,0.4)",
            bottomFillColor2: "rgba(239,68,68,0.05)",
          });

          seriesRef.current.setData(
            await response.data.map((d) => ({ time: d.time, value: d.close })),
          );
          chartRef.current.timeScale().fitContent();
        }
        BaseLineData();
        break;

      case "histogram":
        async function HistogramData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );
          } else {
            console.log("fourth insertion------------------------------");
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(HistogramSeries, {
            color: "#22c55e", // ✅ green bars

            priceFormat: { type: "volume" },
            priceScaleId: "volume",
            scaleMargins: {
              top: 0.7,
              bottom: 0,
            },
            lastValueVisible: true,
          });

          seriesRef.current.setData(
            response.data.map((d, index, arr) => {
              const prev = arr[index - 1];

              const isUp = prev ? d.close >= prev.close : true;

              return {
                time: d.time,
                value: d.volume, // or d.value
                color: isUp ? "#22c55e" : "#ef4444", // ✅ green / red
              };
            }),
          );
          chartRef.current.timeScale().fitContent();
        }
        HistogramData();
        break;

      case "heikinashi":
        async function HeikinAshiData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );
          } else {
            console.log("fourth insertion------------------------------");
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(CandlestickSeries);

          seriesRef.current.setData(convertToHeikinAshi(await response?.data));

          chartRef.current.timeScale().fitContent();
        }
        HeikinAshiData();
        break;

      case "hollowcandles":
        async function HollowCandlesData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );
          } else {
            console.log("fourth insertion------------------------------");
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
            upColor: "transparent",
            downColor: "#ef4444",
            borderUpColor: "#22c55e",
            borderDownColor: "#ef4444",
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
          });
          seriesRef.current.setData(await response?.data);

          chartRef.current.timeScale().fitContent();
        }
        HollowCandlesData();
        break;

      default:
        async function fetchCandeStickData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );
          } else {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "BTCUSD"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderUpColor: "#22c55e",
            borderDownColor: "#ef4444",
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
          });
          seriesRef.current.setData(await response?.data);

          chartRef.current.subscribeCrosshairMove((param) => {
            if (!param.time || !param.seriesData) {
              setLiveOhlcv(null);
              return;
            }

            const candle = param.seriesData?.get(seriesRef.current);
            if (!candle) return;

            setLiveOhlcv(candle);
          });
        }

        fetchCandeStickData();
    }
    chartRef.current.timeScale().fitContent();
  }, [
    chartType,
    historicalData,
    rangeValue,
    timeframeValue,
    selectedCurrency,
    selectedIndicator,
  ]);

  // console.log(liveOhlcv, "live ohlcv-----------------------------");

  const convertToHeikinAshi = (data) => {
    if (!data.length) return [];

    let prevOpen = data[0].open;
    let prevClose = data[0].close;

    return data.map((candle) => {
      const haClose =
        (candle.open + candle.high + candle.low + candle.close) / 4;

      const haOpen = (prevOpen + prevClose) / 2;

      const haHigh = Math.max(candle.high, haOpen, haClose);
      const haLow = Math.min(candle.low, haOpen, haClose);

      prevOpen = haOpen;
      prevClose = haClose;

      return {
        time: candle.time,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
      };
    });
  };

  const zoomIn = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return;

    chart.timeScale().setVisibleLogicalRange({
      from: range.from + 1,
      to: range.to - 1,
    });
  };

  // 🔎 Zoom Out
  const zoomOut = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return;

    chart.timeScale().setVisibleLogicalRange({
      from: range.from - 1,
      to: range.to + 1,
    });
  };

  // 🔄 Reset Zoom
  const resetZoom = () => {
    chartRef.current?.timeScale().fitContent();
  };

  const clearSeries = () => {
    if (!chartRef.current || !seriesRef.current) return;

    try {
      chartRef.current.removeSeries(seriesRef.current);
    } catch (e) {
      console.warn("Series already removed");
    }

    seriesRef.current = null;
  };

  const loadSeries = (type) => {
    const chart = chartRef.current;
    if (!chart) return;

    clearSeries();

    let series;

    if (type === "line") {
      series = chart.addSeries(LineSeries, { color: "#38bdf8" });
      series.setData(
        historicalData.map((d) => ({ time: d.time, value: d.close })),
      );
    }

    if (type === "bar") {
      series = chart.addSeries(BarSeries, {});
      series.setData(historicalData);
    }

    if (type === "area") {
      series = chart.addSeries(AreaSeries, {
        topColor: "rgba(56,189,248,0.4)",
        bottomColor: "rgba(56,189,248,0)",
        lineColor: "#38bdf8",
      });
      series.setData(
        historicalData.map((d) => ({ time: d.time, value: d.close })),
      );
    }

    if (type === "candlestick") {
      series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      series.setData(historicalData);
      chartRef.current.timeScale().fitContent();
    }

    if (type === "baseline") {
      series = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: +historicalData[0]?.close || 0 },
        topLineColor: "#22c55e",
        bottomLineColor: "#ef4444",
        topFillColor1: "rgba(34,197,94,0.3)",
        bottomFillColor1: "rgba(239,68,68,0.3)",
      });
      series.setData(
        historicalData.map((d) => ({ time: d.time, value: d.close })),
      );
    }

    if (type === "histogram") {
      series = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
      });
      series.setData(
        historicalData.map((d) => ({
          time: d.time,
          value: Math.floor(Math.random() * 3000 + 1000),
          color: d.close >= d.open ? "#22c55e" : "#ef4444",
        })),
      );
    }

    seriesRef.current = series;
    chart.timeScale().fitContent();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
      <div>
        <ChartHeader
          timeframeValue={timeframeValue}
          setTimeframeValue={setTimeframeValue}
          rangeValue={rangeValue}
          setRangeValue={setRangeValue}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          setChartType={setChartType}
          chartType={chartType}
          selectedIndicator={selectedIndicator}
          setSelectedIndicator={setSelectedIndicator}
          loadIndicator={loadIndicator}
          toggleIndicator={toggleIndicator}
        />
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        className="p-2 z-0 relative m-2 rounded-md bg-white w-fit"
      >
        {/* -------------------------------sub-header live Values----------------------- */}
        <div className="flex px-2 top-2 z-10 absolute items-center gap-2 bg-slate-100 justify-start">
          {/* LEFT: Symbol */}

          <div className="text-sm text-slate-950">
            {selectedCurrency} : {timeframeValue} :
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* outer ring */}
              <span
                className={`absolute inset-0 rounded-full opacity-30 animate-ping ${isMarketOpen ? "bg-green-500" : "bg-red-400"}`}
              ></span>

              {/* inner dot */}
              <span
                className={`relative block w-3 h-3 rounded-full ${isMarketOpen ? "bg-green-500" : "bg-red-400"}`}
              ></span>
            </div>
          </div>

          {/* CENTER: Timeframes */}
          <div className="flex gap-1 text-xs">
            {SINGLE_VALUE_CHARTS.includes(chartType) ? (
              // 🔵 Line / Area / Baseline → Close only
              <h2 className="px-2 py-1">
                <span className="text-blue-600">{liveOhlcv?.value}</span>
              </h2>
            ) : (
              // 🟢 Other charts → OHLC
              <>
                <h2 className="px-2 py-1">
                  O: <span className={valueColor}>{liveOhlcv?.open}</span>
                </h2>

                <h2 className="px-2 py-1">
                  H: <span className={valueColor}>{liveOhlcv?.high}</span>
                </h2>

                <h2 className="px-2 py-1">
                  L: <span className={valueColor}>{liveOhlcv?.low}</span>
                </h2>

                <h2 className="px-2 py-1">
                  C: <span className={valueColor}>{liveOhlcv?.close}</span>
                </h2>
              </>
            )}
          </div>
        </div>

        {/* -----------------INDICATOR BAR------------------- */}

        {selectedIndicator.length > 0 && (
          <div className="absolute top-10 left-2 flex flex-col gap-1 z-50">
            {selectedIndicator.map((indicator, index) => {
              const value = liveIndicatorData?.[indicator];
              const series = indicatorSeriesRef.current[indicator];

              return (
                <div
                  key={indicator}
                  className="flex justify-between items-center gap-3 bg-white shadow-sm border border-slate-200 rounded-md px-3 h-8 text-xs min-w-[260px]"
                >
                  {/* LEFT SIDE */}
                  <span className="font-medium text-slate-800 flex items-center gap-2">
                    {/* Color Dot */}
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: getIndicatorColor(index) }}
                    />
                    {indicator} : {timeframeValue} :
                    {value !== undefined && (
                      <span style={{ color: getIndicatorColor(index) }}>
                        {Number(value).toFixed(2)}
                      </span>
                    )}
                  </span>

                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-2">
                    {/* Visibility Toggle */}
                    <button
                      onClick={() => {
                        if (!series) return;

                        const visible = series.options().visible ?? true;

                        series.applyOptions({ visible: !visible });
                      }}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      {(series?.options()?.visible ?? true) ? (
                        <FaEye />
                      ) : (
                        <FaEyeSlash />
                      )}
                    </button>

                    {/* Settings */}
                    <button
                      title="Indicator Settings"
                      className="text-slate-500 hover:text-slate-800"
                    >
                      <IoSettingsOutline />
                    </button>

                    {/* Source Code */}
                    <button
                      title="Source Code"
                      className="text-slate-500 hover:text-slate-800"
                    >
                      <FaCode />
                    </button>

                    {/* Remove Indicator */}
                    <button
                      onClick={() => {
                        if (!series) return;

                        chartRef.current.removeSeries(series);

                        delete indicatorSeriesRef.current[indicator];

                        setSelectedIndicator((prev) =>
                          prev.filter((i) => i !== indicator),
                        );
                      }}
                      className="text-slate-500 hover:text-red-500"
                    >
                      <IoCloseSharp />
                    </button>

                    {/* MORE MENU */}
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="text-slate-500 hover:text-slate-800">
                          <FiMoreHorizontal />
                        </button>
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          sideOffset={6}
                          className="w-56 rounded-md bg-white shadow-lg border border-gray-200 text-sm z-50"
                        >
                          <DropdownMenu.Item
                            onClick={() => openAlert(indicator)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer outline-none"
                          >
                            Add Alert
                          </DropdownMenu.Item>

                          <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer outline-none">
                            Add Strategy / Indicator
                          </DropdownMenu.Item>

                          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

                          <DropdownMenu.Item asChild>
                            <a
                              href="<LINK>"
                              target="_blank"
                              className="block px-4 py-2 hover:bg-gray-100 outline-none"
                            >
                              View Source Code
                            </a>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                  {showAlertForm && (
        <IndicatorAlert
          onClose={closeAlert}
          value={value}
          liveOhlcv={liveOhlcv}
          symbol={selectedCurrency}
        />
      )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      

      <div className="flex justify-center text-sm ml-3 text-slate-950">
        <button
          onClick={zoomIn}
          className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-md"
        >
          <LuCirclePlus /> Zoom In
        </button>
        <button
          onClick={zoomOut}
          className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-md ml-2"
        >
          <LuCircleMinus /> Zoom Out
        </button>
        <button
          onClick={resetZoom}
          className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-md ml-2"
        >
          <RiResetRightLine /> Reset
        </button>
      </div>

      <div
        className={`
                    fixed top-0 right-0 h-screen w-[400px] bg-white shadow-xl z-50
                    transform transition-transform duration-300 ease-in-out
                    ${openForm ? "translate-x-0" : "translate-x-full hidden"}
                  `}
      >
        <Form onClose={() => setOpenForm(false)} />
      </div>

      {/* Open Button */}
      {!openForm && (
        <button
          onClick={() => setOpenForm(true)}
          className="fixed bottom-6 right-6 flex items-center gap-1 px-3 py-2
                             text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-purple-500 z-50"
        >
          <FaFileWaveform />
        </button>
      )}
    </div>
  );
}
