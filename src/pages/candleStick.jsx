import "bootstrap/dist/css/bootstrap.min.css"; //this is for temp
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
import IndicatorRuleBuilder from "../components/indicator/IndicatorRuleBuilder";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import { RiResetRightLine } from "react-icons/ri";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaCode } from "react-icons/fa6";
import ChartHeader from "../components/tradingModals/ChartHeader";
import IndicatorBuildingListing from "../components/indicator/IndicatorBuilderListing";
import {
  ChartProprties,
  TIMEFRAME_TO_SECONDS,
  SINGLE_VALUE_CHARTS,
  INDICATOR_COLORS,
  chartSeriesStyles,
  getSeriesColor,
  convertToHeikinAshi,
  getIndicatorChartProperties,
} from "../util/common";
import apiService from "../services/apiServices";
import {
  IoCloseSharp,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLink,
  IoSettingsOutline,
} from "react-icons/io5";
import { FiMoreHorizontal } from "react-icons/fi";
import IndicatorAlert from "../components/indicator/IndicatorAlert";
import {
  fetchDataByCurrency,
  fetchIndicatorData,
  PANE_INDICATORS,
} from "../util/chartFunctions";
import IndicatorPropertyDialog from "../components/indicator/IndicatorPropertyDialog";

import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "./auth/protected";


export default function Candlestick() {
  const chartRef = useRef();
  const containerRef = useRef();
  const seriesRef = useRef(null);
  const indicatorSeriesRef = useRef({});
  const latestIndicatorValuesRef = useRef({});
  const panesRef = useRef({});
  const syncingRef = useRef(false);
  const socketRef = useRef(null);
  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState("1m");
  const [selectedCurrency, setSelectedCurrency] = useState("BTCUSDT");
  const [selectedIndicator, setSelectedIndicator] = useState([]);
  const [rangeValue, setRangeValue] = useState("1000");
  const [chartType, setChartType] = useState("candlestick");
  // const [historicalData, setHistoricalData] = useState([]);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [liveOhlcv, setLiveOhlcv] = useState({});
  const [liveIndicatorData, setLiveIndicatorData] = useState({});
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [indicatorProperty, setIndicatorProperty] = useState(false);
  const mainChartHeightRef = useRef(500); // initial height
  const [isVisible, setIsVisible] = useState(true);
  const[activeBarIndicator,setActiveBarIndicator]=useState("");

  const getIndicatorColor = useCallback(
    (index) => INDICATOR_COLORS[index % INDICATOR_COLORS.length],
    [],
  );

  // console.log(liveOhlcv, "liveedata")

  const closeAlert = () => {
    setShowAlertForm(false);
  };

  const closeIndicatorSettings = () => {
    setOpenSettings(false);
  };

  const TIME_AXIS_HEIGHT = 28;
  const PANE_HEIGHT = 140;

  const addSeries = (indicator, SeriesType, options) => {
    if (!chartRef.current) return null;

    const normalized = String(indicator).replace(/[\s/]+/g, "");

    // Indicators that should go to panes
    if (!PANE_INDICATORS.has(normalized)) {
      return chartRef.current.addSeries(SeriesType, options);
    }

    const paneKey = resolvePaneKey(normalized);
    const paneChart = ensurePane(paneKey);

    return paneChart.addSeries(SeriesType, options);
  };

  /* =========================
     ✅ CHART SYNC ENGINE
  ========================== */

  function syncCharts(sourceChart, logicalRange) {
    if (!logicalRange || syncingRef.current) return;

    syncingRef.current = true;

    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ];

    charts.forEach((chart) => {
      if (!chart || chart === sourceChart) return;
      chart.timeScale().setVisibleLogicalRange(logicalRange);
    });

    syncingRef.current = false;
  }

  function attachSync(chart) {
    if (!chart) return;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || syncingRef.current) return;
      syncCharts(chart, range);
    });
  }

  /* =========================
     ✅ PANE MANAGEMENT
  ========================== */

  function resolvePaneKey(type) {
    switch (type) {
      case "MACD":
        return "macd";
      case "Volume":
        return "volume";
      case "ATR":
        return "ATR";
      default:
        return "momentum";
    }
  }

  function repositionPanes() {
    let offset = TIME_AXIS_HEIGHT;

    Object.values(panesRef.current).forEach((pane) => {
      pane.div.style.bottom = `${offset}px`;
      pane.splitter.style.bottom = `${offset + pane.height}px`;

      offset += pane.height;
    });
  }
  function attachSplitterDrag(paneKey) {
    const pane = panesRef.current[paneKey];
    if (!pane) return;

    let startY = 0;
    let startPaneHeight = 0;
    let startMainHeight = 0;

    const onMouseMove = (e) => {
      const dy = startY - e.clientY;

      const newPaneHeight = Math.max(60, startPaneHeight + dy);
      const delta = newPaneHeight - pane.height;

      const newMainHeight = mainChartHeightRef.current - delta;

      /* ✅ Prevent collapsing */
      if (newMainHeight < 150) return;

      pane.height = newPaneHeight;
      mainChartHeightRef.current = newMainHeight;

      /* ✅ Apply sizes */
      pane.div.style.height = `${newPaneHeight}px`;

      pane.chart.applyOptions({ height: newPaneHeight });
      chartRef.current.applyOptions({ height: newMainHeight });

      repositionPanes();
    };

    const onMouseUp = () => {
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    pane.splitter.onmousedown = (e) => {
      startY = e.clientY;
      startPaneHeight = pane.height;
      startMainHeight = mainChartHeightRef.current;

      document.body.style.cursor = "row-resize";

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };
  }
  function repositionPanes() {
    let offset = TIME_AXIS_HEIGHT;

    Object.values(panesRef.current).forEach((pane) => {
      pane.div.style.bottom = `${offset}px`;
      pane.splitter.style.bottom = `${offset + pane.height}px`;

      offset += pane.height;
    });
  }

  function ensurePane(paneKey) {
    // If pane already exists, return its chart
    if (panesRef.current[paneKey]) return panesRef.current[paneKey].chart;

    const paneCount = Object.keys(panesRef.current).length;

    // Create pane container
    const paneDiv = document.createElement("div");
    paneDiv.style.position = "absolute";
    paneDiv.style.left = "0";
    paneDiv.style.width = "100%";
    paneDiv.style.height = `${PANE_HEIGHT}px`;
    paneDiv.style.bottom = `${TIME_AXIS_HEIGHT + paneCount * PANE_HEIGHT}px`;

    // Create splitter
    const splitter = document.createElement("div");
    splitter.style.position = "absolute";
    splitter.style.left = "0";
    splitter.style.width = "100%";
    splitter.style.cursor = "row-resize";
    splitter.style.bottom = `${TIME_AXIS_HEIGHT + paneCount * PANE_HEIGHT + PANE_HEIGHT}px`;
    splitter.style.borderTop = "1px solid rgba(255,255,255,0.08)";
    splitter.style.borderBottom = "1px solid rgba(0,0,0,0.4)";
    splitter.onmouseenter = () =>
      (splitter.style.background = "rgba(255,255,255,0.05)");
    splitter.onmouseleave = () => (splitter.style.background = "transparent");
    splitter.style.background = "rgba(255, 255, 255, 0.8)";
    splitter.style.height = "8px";
    splitter.style.zIndex = "10";

    containerRef.current.appendChild(splitter);
    containerRef.current.appendChild(paneDiv);

    // Create chart inside pane
    const paneChart = createChart(
      paneDiv,
      getIndicatorChartProperties(PANE_HEIGHT),
    );

    // Store pane references
    panesRef.current[paneKey] = {
      chart: paneChart,
      div: paneDiv,
      splitter,
      height: PANE_HEIGHT,
    };

    // Enable resizing
    attachSplitterDrag(paneKey);

    // Attach time-scale sync
    attachSync(paneChart);

    // Attach crosshair sync with main chart and other panes
    attachCrosshair(paneChart, paneKey);

    return paneChart;
  }

  function cleanupPane(paneKey) {
    const paneChart = panesRef.current[paneKey];
    if (!paneChart) return;

    const stillUsed = Object.keys(indicatorSeriesRef.current).some(
      (key) => resolvePaneKey(key) === paneKey,
    );

    if (stillUsed) return;

    try {
      paneChart.remove();
    } catch (e) {}

    delete panesRef.current[paneKey];
  }

  /* =========================
     ✅ INDICATOR REMOVAL
  ========================== */
  const removeIndicator = useCallback((indicator) => {
    const entry = indicatorSeriesRef.current[indicator];
    if (!entry) return;

    const paneKey = resolvePaneKey(indicator);
    const pane = panesRef.current[paneKey];
    const chart = pane?.chart ?? chartRef.current;

    if (!chart) return;

    /* ✅ MULTI SERIES */
    if (typeof entry === "object" && !entry.setData) {
      Object.values(entry).forEach((series) => {
        try {
          chart.removeSeries(series);
        } catch (e) {}
      });
    } else {
      /* ✅ SINGLE SERIES */
      try {
        chart.removeSeries(entry);
      } catch (e) {}
    }

    delete indicatorSeriesRef.current[indicator];
    delete latestIndicatorValuesRef.current[indicator];

    cleanupPane(paneKey);

    setSelectedIndicator((prev) => prev.filter((i) => i !== indicator));
  }, []);

  const isUp = liveOhlcv?.close >= liveOhlcv?.open;
  const valueColor = isUp ? "text-green-500" : "text-red-500";

  // ----------Main chart------------
  useEffect(() => {
    if (!containerRef.current) return;

    const containerHeight = containerRef.current.clientHeight;

    const chart = createChart(containerRef.current, {
      ...ChartProprties,
      height: mainChartHeightRef.current,
    });
    chartRef.current = chart;
    attachSync(chart);
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
                symbols: [selectedCurrency || "BTCUSD"],
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

      const price = Number(msg.mark_price);
      const intervalSec = TIMEFRAME_TO_SECONDS[timeframeValue];
      const time = Math.floor(msg.timestamp / intervalSec) * intervalSec;

      if (!currentCandle || currentCandle.time !== time) {
        currentCandle = {
          time,
          open: price,
          high: price,
          low: price,
          close: price,
        };
        setLiveOhlcv(currentCandle);
      } else {
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;

        setLiveOhlcv({ ...currentCandle }); // ← add this line
      }
    };

    return () => {
      socket.close();
      chart.remove();
    };
  }, [selectedCurrency, timeframeValue]);

  const toggleIndicator = (indicator) => {
    setSelectedIndicator((prev) => {const alreadySelected = prev.includes(indicator);

      if (alreadySelected) {
        // ✅ Remove ALL series belonging to indicator
        Object.keys(indicatorSeriesRef.current).forEach((key) => {
          if (key === indicator || key.startsWith(`${indicator}_`)) {
            const series = indicatorSeriesRef.current[key];

            if (series && chartRef.current) {
              chartRef.current.removeSeries(series);
            }

            delete indicatorSeriesRef.current[key];
          }
        });

        return prev.filter((i) => i !== indicator);
      }

      return [...prev, indicator];
    });
  };

  const renderValue = (indicator, value) => {
    if (value == null) return "--";

    if (typeof value === "number") {
      const series = indicatorSeriesRef.current[indicator];
      const color = getSeriesColor(series);

      return (
        <span style={{ color }}>
          {isFinite(value) ? value.toFixed(2) : "--"}
        </span>
      );
    }

    if (typeof value === "object") {
      const grouped = indicatorSeriesRef.current[indicator];

      return Object.entries(value).map(([lineName, val]) => {
        const series = grouped?.[lineName];
        const color = getSeriesColor(series);
        console.log();
        return (
          <span key={lineName} style={{ color, marginRight: 8 }}>
            {lineName}: {isFinite(val) ? Number(val).toFixed(2) : "--"}
          </span>
        );
      });
    }
    return "";
  };

  /* =========================================================
   CROSSHAIR SYNC & HANDLER
========================================================= */

  const syncCrosshair = useCallback((sourceChart, param) => {
    if (!param?.time || syncingRef.current) return;

    syncingRef.current = true;

    const allCharts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ];

    allCharts.forEach((chart) => {
      if (!chart || chart === sourceChart) return;

      chart.setCrosshairPosition(
        param.point?.x ?? 0,
        param.point?.y ?? 0,
        param.time,
      );
    });

    syncingRef.current = false;
  }, []);

  const attachCrosshair = useCallback(
    (chart, chartKey) => {
      if (!chart) return () => {};

      const handler = (param) => {
        if (!param.point || param.time === undefined) {
          const allCharts = [
            chartRef.current,
            ...Object.values(panesRef.current).map((p) => p.chart),
          ];
          allCharts.forEach((c) => c?.clearCrosshairPosition?.());
          setLiveIndicatorData({});
          return;
        }

        // ----------------- SYNC CROSSHAIR -----------------
        syncCrosshair(chart, param);

        // ----------------- MAIN CHART OHLC -----------------
        if (chartKey === "main" && seriesRef.current) {
          const candle = param.seriesData.get(seriesRef.current);
          if (candle?.open !== undefined) {
            setLiveOhlcv({
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
            });
          }
        }

        // ----------------- INDICATOR VALUES -----------------
        if (!param.seriesData) return;

        const updates = {};
        Object.entries(indicatorSeriesRef.current).forEach(
          ([indicator, entry]) => {
            if (!entry) return;

            if (typeof entry === "object" && !entry.setData) {
              updates[indicator] = {};
              Object.entries(entry).forEach(([lineName, series]) => {
                const val = param.seriesData.get(series);
                updates[indicator][lineName] = val != null ? val : null;
              });
            } else {
              const val = param.seriesData.get(entry);
              updates[indicator] = val != null ? val : null;
            }
          },
        );

        setLiveIndicatorData(updates);
      };

      chart.subscribeCrosshairMove(handler);
      return () => chart.unsubscribeCrosshairMove(handler);
    },
    [syncCrosshair],
  );

  useEffect(() => {
    if (!chartRef.current) return;

    const detach = attachCrosshair(chartRef.current, "main");
    return () => detach();
  }, [chartRef.current]);

  // Main useEffect for chart type/data changes
  useEffect(() => {
    if (!chartRef.current) return;

    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current);
      } catch (e) {
        console.warn("Series already removed");
      }
      seriesRef.current = null;
    }

    switch (chartType) {
      case "line":
        async function LineData() {
          const data = await fetchDataByCurrency(
            selectedCurrency,
            timeframeValue,
            chartType,
          );
          seriesRef.current = chartRef.current.addSeries(
            LineSeries,
            chartSeriesStyles.line,
          );
          seriesRef.current.setData(
            data?.map((d) => ({
              time: d.time,
              value: d?.close != null ? Number(d.close) : null,
            })),
          );
          chartRef.current.timeScale().fitContent();
          await fetchIndicatorData(
            selectedIndicator,
            selectedCurrency,
            timeframeValue,
            chartRef,
            indicatorSeriesRef,
            latestIndicatorValuesRef,
            getIndicatorColor,
          );
        }
        LineData();
        break;

      case "bar":
        async function BarData() {
          const data = await fetchDataByCurrency(
            selectedCurrency,
            timeframeValue,
            chartType,
          );
          seriesRef.current = chartRef.current.addSeries(
            BarSeries,
            chartSeriesStyles.bar,
          );
          seriesRef.current.setData(
            data?.map((d) => ({
              time: d.time,
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
            })),
          );
          chartRef.current.timeScale().fitContent();
          await fetchIndicatorData(
            selectedIndicator,
            selectedCurrency,
            timeframeValue,
            chartRef,
            indicatorSeriesRef,
            latestIndicatorValuesRef,
            getIndicatorColor,
          );
        }
        BarData();
        break;

      case "area":
        async function AreaData() {
          const data = await fetchDataByCurrency(
            selectedCurrency,
            timeframeValue,
            chartType,
          );
          seriesRef.current = chartRef.current.addSeries(
            AreaSeries,
            chartSeriesStyles.area,
          );
          seriesRef.current.setData(
            data?.map((d) => ({
              time: d?.time,
              value: Number(d?.close),
            })),
          );
          chartRef.current.timeScale().fitContent();
          await fetchIndicatorData(
            selectedIndicator,
            selectedCurrency,
            timeframeValue,
            chartRef,
            indicatorSeriesRef,
            latestIndicatorValuesRef,
            getIndicatorColor,
          );
        }
        AreaData();
        break;

      case "baseline":
        async function BaseLineData() {
          const data = await fetchDataByCurrency(
            selectedCurrency,
            timeframeValue,
            chartType,
          );
          seriesRef.current = chartRef.current.addSeries(BaselineSeries, {
            ...chartSeriesStyles.baseline,
            baseValue: {
              type: "price",
              price: Number(data?.[0]?.close ?? 0),
            },
          });
          seriesRef.current.setData(
            data?.map((d) => ({ time: d.time, value: d.close })),
          );
          chartRef.current.timeScale().fitContent();
          await fetchIndicatorData(
            selectedIndicator,
            selectedCurrency,
            timeframeValue,
            chartRef,
            indicatorSeriesRef,
            latestIndicatorValuesRef,
            getIndicatorColor,
          );
        }
        BaseLineData();
        break;

      case "histogram":
        async function HistogramData() {
          const data = await fetchDataByCurrency(
            selectedCurrency,
            timeframeValue,
            chartType,
          );
          seriesRef.current = chartRef.current.addSeries(
            HistogramSeries,
            chartSeriesStyles.histogram,
          );
          seriesRef.current.setData(
            data?.map((d, index, arr) => {
              const prev = arr[index - 1];
              const isUp = prev ? d.close >= prev.close : true;
              return {
                time: d.time,
                value: d.volume,
                color: isUp ? "#22c55e" : "#ef4444",
              };
            }),
          );
          chartRef.current.timeScale().fitContent();
          await fetchIndicatorData(
            selectedIndicator,
            selectedCurrency,
            timeframeValue,
            chartRef,
            indicatorSeriesRef,
            latestIndicatorValuesRef,
            getIndicatorColor,
          );
        }
        HistogramData();
        break;

      case "heikinashi":
        async function HeikinAshiData() {
          const data = await fetchDataByCurrency(
            selectedCurrency,
            timeframeValue,
            chartType,
          );
          seriesRef.current = chartRef.current.addSeries(CandlestickSeries);
          seriesRef.current.setData(convertToHeikinAshi(data));
          chartRef.current.timeScale().fitContent();
          await fetchIndicatorData(
            selectedIndicator,
            selectedCurrency,
            timeframeValue,
            chartRef,
            indicatorSeriesRef,
            latestIndicatorValuesRef,
            getIndicatorColor,
          );
        }
        HeikinAshiData();
        break;

      case "hollowcandles":
        async function HollowCandlesData() {
          const data = await fetchDataByCurrency(
            selectedCurrency,
            timeframeValue,
            chartType,
          );
          seriesRef.current = chartRef.current.addSeries(
            CandlestickSeries,
            chartSeriesStyles.hollowcandles,
          );
          seriesRef.current.setData(data);
          chartRef.current.timeScale().fitContent();
          await fetchIndicatorData(
            selectedIndicator,
            selectedCurrency,
            timeframeValue,
            chartRef,
            indicatorSeriesRef,
            latestIndicatorValuesRef,
            getIndicatorColor,
          );
        }
        HollowCandlesData();
        break;

      default:
        async function fetchCandleStickData() {
          const response = await fetchDataByCurrency(
            selectedCurrency,
            timeframeValue,
            chartType,
          );
          console.log(response,"------------------------------------------->>>>>>>>>>>>>>>>>>")
          seriesRef.current = chartRef.current.addSeries(
            CandlestickSeries,
            chartSeriesStyles.candlestick,
          );
          if(response){
            seriesRef?.current?.setData(response);
          }
          chartRef.current.timeScale().fitContent();
          await fetchIndicatorData(
            selectedIndicator,
            selectedCurrency,
            timeframeValue,
            chartRef,
            addSeries,
            indicatorSeriesRef,
            latestIndicatorValuesRef,
            getIndicatorColor,
          );
        }
        fetchCandleStickData();
    }
  }, [
    chartType,
    rangeValue,
    timeframeValue,
    selectedCurrency,
    selectedIndicator,
  ]);

  // Zoom In
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





  return (
    <div className="w-full flex flex-col bg-slate-50">
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
          toggleIndicator={toggleIndicator}
        />
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        style={{
          width: ChartProprties.width,
          height: ChartProprties.height,
          position: "relative",
          overflow: "hidden",

          display: "flex",
          flexDirection: "column",
        }}
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
          <div className="d-flex gap-2 align-items-center">
            {SINGLE_VALUE_CHARTS.includes(chartType) ? (
              // Line / Area / Baseline → Close only
              <h6 className="px-2 py-1 mb-0">
                <span className="text-primary">{liveOhlcv?.value}</span>
              </h6>
            ) : (
              // Other charts → OHLC
              <>
                <h6 className="px-2 py-1 mb-0">
                  O: <span className={valueColor}>{liveOhlcv?.open}</span>
                </h6>

                <h6 className="px-2 py-1 mb-0">
                  H: <span className={valueColor}>{liveOhlcv?.high}</span>
                </h6>

                <h6 className="px-2 py-1 mb-0">
                  L: <span className={valueColor}>{liveOhlcv?.low}</span>
                </h6>

                <h6 className="px-2 py-1 mb-0">
                  C: <span className={valueColor}>{liveOhlcv?.close}</span>
                </h6>
              </>
            )}
          </div>
        </div>

        {/* -----------------INDICATOR BAR------------------- */}

        {selectedIndicator?.length > 0 && (
          <div className="absolute top-10 left-2 flex flex-col gap-1 z-50">
            {selectedIndicator &&
              selectedIndicator?.map((indicator, index) => {
                const value = liveIndicatorData[indicator];
                // console.log(value, "indicatorrrrrrrrr")
                return (
                  <div
                    key={index}
                    className="flex w-full justify-between items-center gap-3 bg-white shadow-sm border border-slate-200 rounded-3 px-3 h-8 text-xs "
                  >
                    {/* LEFT SIDE */}
                    <span className="font-medium w-full text-slate-800 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: getIndicatorColor(index) }}
                      />
                      
                      {indicator} : {timeframeValue} :
                      <span style={{ display: "flex", gap: 6 }}>
                        {renderValue(indicator, value)}
                      </span>
                    </span>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-2">
                      {/* hide/ */}
                      <button
                        title={isVisible ? "Hide Indicator" : "Show Indicator"}
                        onClick={() => setIsVisible((prev) => !prev)}
                        className="text-slate-600"
                      >
                        {isVisible ? <IoEyeOutline size={18}  /> : <IoEyeOffOutline size={18}  />}
                      </button>

                      {/* Settings */}
                      <button
                        title="Indicator Settings"
                        onClick={() => {
                          setActiveBarIndicator(indicator);
                          setIndicatorProperty((prev) => !prev)
                        } }
                        className="text-slate-600"
                      >
                        <IoSettingsOutline size={18} />
                      </button>

                      {/* Source Code */}
                      <button title="Source Code" className="text-slate-600 ">
                        <FaCode size={18}  />
                      </button>

                      {/* Remove Indicator */}
                      <button
                        onClick={() => removeIndicator(indicator)}
                        className="text-slate-600"
                      >
                        <IoCloseSharp size={18}  />
                      </button>

                      {/* MORE MENU */}
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="text-slate-500 hover:text-slate-800">
                            <FiMoreHorizontal size={18}  />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            sideOffset={6}
                            className="w-56 rounded-3 bg-white shadow-lg border border-gray-200 text-sm z-50"
                          >
                            <DropdownMenu.Item
                              onClick={() => setShowAlertForm(true)}
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

      <div className="d-flex align-items-center position-relative">
        <div className="mx-auto d-flex align-items-center gap-2">
          <button
            onClick={zoomIn}
            className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-purple-50 hover:to-indigo-50 text-slate-700 hover:text-purple-700 font-semibold rounded-xl shadow-sm hover:shadow-md border border-slate-200/50 hover:border-purple-300/50 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
          >
            <LuCirclePlus className="w-4 h-4 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
            <span className="text-sm">Zoom In</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

          <button
            onClick={zoomOut}
            className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-purple-50 hover:to-indigo-50 text-slate-700 hover:text-purple-700 font-semibold rounded-xl shadow-sm hover:shadow-md border border-slate-200/50 hover:border-purple-300/50 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
          >
            <LuCircleMinus className="w-4 h-4 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
            <span className="text-sm">Zoom Out</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

          <button
            onClick={resetZoom}
            className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
          >
            <RiResetRightLine className="w-4 h-4 group-hover:rotate-[360deg] transition-transform duration-500" />
            <span className="text-sm">Reset</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
          </button>
        </div>

        {/* Floating Open Button */}
        {!openForm && (
          <div className="d-flex justify-content-end position-sticky top-0 ">
            <button
              onClick={() => setOpenForm(true)}
              className="btn btn-primary d-flex align-items-center gap-1 mx-3"
              style={{ zIndex: 1050 }}
            >
              <IoLink />
            </button>
          </div>
        )}
      </div>

      {/* Sliding Panel */}
      <div
        className="position-fixed top-0 end-0 vh-100 bg-white shadow"
        style={{
          width: "900px",
          height: "100vh",
          zIndex: 1050,
          transform: openForm ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.6s ease-out",
        }}
      >
        <IndicatorRuleBuilder
          onOpen={() => setOpenForm(true)}
          onClose={() => setOpenForm(false)}
        />
      </div>

      {/* Backdrop (IMPORTANT for UX) */}
      {openForm && (
        <div
          className="position-fixed top-0 start-0 w-100 vh-100 bg-dark bg-opacity-25"
          style={{ zIndex: 1040 }}
          onClick={() => setOpenForm(false)}
        />
      )}

      {/* ------------Start Indicator Rule Builder for Caluculating Indicators along with condition---------------- */}
      <div className="bg-slate-50">
        {/* <IndicatorRuleBuilder /> */}
        <IndicatorBuildingListing
          selectedCurrency={selectedCurrency}
          timeframeValue={timeframeValue}
        />
      </div>

      {/* ------End of indicator rule builder */}

      {/* ------------------------------------------indicator sub part property show in modal------------------------------- */}
      <IndicatorPropertyDialog
        setIndicatorProperty={setIndicatorProperty}
        indicatorProperty={indicatorProperty}
        selectedIndicator={selectedIndicator}
        activeBarIndicator={activeBarIndicator}
      />
    </div>
  );
}
