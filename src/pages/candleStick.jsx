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
import IndicatorRuleBuilder from "../components/scanner/IndicatorRuleBuilder";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import { RiResetRightLine } from "react-icons/ri";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaCode } from "react-icons/fa6";
import ChartHeader from "../components/tradingModals/ChartHeader";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import SEO from "../components/SEO";
import {
  ChartProprties,
  TIMEFRAME_TO_SECONDS,
  SINGLE_VALUE_CHARTS,
  chartSeriesStyles,
  convertToHeikinAshi,
  getIndicatorChartProperties,
} from "../util/common";
import SourceCodePanel from "../components/indicator/SourceCodePanel";
import ChartRightSidebar from "../components/chart/rightbar/ChartRightSidebar";
import ChartLeftSidebar from "../components/chart/leftbar/ChartLeftSidebar";
import {
  IoCloseSharp,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLink,
  IoSettingsOutline,
} from "react-icons/io5";
import IndicatorAlert from "../components/indicator/IndicatorAlert";
import IndicatorPropertyDialog from "../components/indicator/IndicatorPropertyDialog";
import useChartFunctions from "../util/useChartFunctions";
import { indicatorComponents } from "../components/indicator/IndicatorIndex";
import { Spinner } from "../components/tradingModals/Spinner";
import IndicatorBar from "../components/indicator/IndicatorBar";
import WatchlistPanel from "../components/watchlist/WatchlistPanel";
import DetailsPanel from "../components/watchlist/DetailsPanel";
import {
  indicatorConfigDefault,
  resolvePaneKey,
  indicatorStyleDefault,
  PANE_INDICATORS,
} from "../util/indicatorFunctions";
import RightSidebar from "../components/layout/RightSidebar";
import { Button } from "react-bootstrap";
import socket from "../services/websocket/socket";
import { useSocket } from "../services/websocket/useSocket";

export default function Candlestick() {
  const { theme } = useTheme();
  const chartRef = useRef();
  const containerRef = useRef();
  const paneContainerRef = useRef();
  const seriesRef = useRef(null);
  const indicatorSeriesRef = useRef({});
  const latestIndicatorValuesRef = useRef({});
  const panesRef = useRef({});
  const paneIndexRef = useRef({});
  const syncingRef = useRef(false);
  const fetchedIndicatorsRef = useRef(new Set());
  const mainChartHeightRef = useRef(500);
  const zoomBtnRef = useRef(null);

  const [openForm, setOpenForm] = useState(false);
  const params = new URLSearchParams(window.location.search);

  const [selectedCurrency, setSelectedCurrency] = useState(
    params.get("symbol") || "BTCUSDT",
  );

  const [timeframeValue, setTimeframeValue] = useState(
    params.get("tf") || "1m",
  );
  const [selectedIndicator, setSelectedIndicator] = useState([]);
  const [rangeValue, setRangeValue] = useState("1000");
  const [chartType, setChartType] = useState("candlestick");
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [liveOhlcv, setLiveOhlcv] = useState({});
  const [liveIndicatorData, setLiveIndicatorData] = useState({});
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [indicatorProperty, setIndicatorProperty] = useState(false);
  const [indicatorLoading, setIndicatorLoading] = useState(false);
  const [mainChartLoading, setMainChartLoading] = useState(false);
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [activeSourceIndicator, setActiveSourceIndicator] = useState(null);
  const [indicatorVisibility, setIndicatorVisibility] = useState({});
  const [activeBarIndicator, setActiveBarIndicator] = useState("");

  // Watchlist & Details state
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Resizable layout states
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [detailsHeight, setDetailsHeight] = useState(200);
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);
  const [showZoomButtons, setShowZoomButtons] = useState(false);

  const sidebarContainerRef = useRef(null);

  // Width resizing logic
  useEffect(() => {
    if (!isDraggingWidth) return;

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 250 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingWidth(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingWidth]);

  // Height resizing logic
  useEffect(() => {
    if (!isDraggingHeight) return;

    const handleMouseMove = (e) => {
      if (sidebarContainerRef.current) {
        const containerRect = sidebarContainerRef.current.getBoundingClientRect();
        const newHeight = containerRect.bottom - e.clientY;
        if (newHeight > 100 && newHeight < containerRect.height - 65) {
          setDetailsHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHeight(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingHeight]);

  const startWidthResize = useCallback((e) => {
    e.preventDefault();
    setIsDraggingWidth(true);
  }, []);

  const startHeightResize = useCallback((e) => {
    e.preventDefault();
    setIsDraggingHeight(true);
  }, []);
  const [activeWatchlistCurrency, setActiveWatchlistCurrency] = useState(null);
  const [livePrice, setLivePrice] = useState(null);

  // Removed standalone watchlist socket logic, now handled via useSocket


  // Keep activeWatchlistCurrency in sync with selectedCurrency from listing modal
  useEffect(() => {
    if (selectedCurrency) {
      setActiveWatchlistCurrency(selectedCurrency);
    }
  }, [selectedCurrency]);

  const prevTimeframeRef = useRef(timeframeValue);
  const prevCurrencyRef = useRef(selectedCurrency);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const symbolFromUrl = params.get("symbol");
    const tfFromUrl = params.get("tf");

    if (symbolFromUrl) {
      setSelectedCurrency(symbolFromUrl);
    }

    if (tfFromUrl) {
      setTimeframeValue(tfFromUrl);
    }
  }, [location.search]);

  const [indicatorConfigs, setIndicatorConfigs] = useState(
    indicatorConfigDefault,
  );
  const [indicatorStyle, setIndicatorStyle] = useState(indicatorStyleDefault);
  const isUp = liveOhlcv?.close >= liveOhlcv?.open;
  const valueColor = isUp ? "text-green-500" : "text-red-500";

  useEffect(() => {
    if (!selectedIndicator.length) return;

    const isContextChange =
      prevTimeframeRef.current !== timeframeValue ||
      prevCurrencyRef.current !== selectedCurrency;

    let indicatorsToFetch = selectedIndicator;

    if (!isContextChange) {
      // ✅ Only filter when indicator list changes
      indicatorsToFetch = selectedIndicator.filter(
        (ind) => !fetchedIndicatorsRef.current.has(ind),
      );

      if (indicatorsToFetch.length === 0) return;
    } else {
      // 🔥 Reset on timeframe / currency change
      fetchedIndicatorsRef.current.clear();

      // ✅ Remove existing indicator series from charts before refetching
      selectedIndicator.forEach((indicator) => {
        const entry = indicatorSeriesRef.current[indicator];
        if (!entry) return;

        const paneKey = resolvePaneKey(indicator);
        const pane = panesRef.current[paneKey];
        const chart = pane?.chart ?? chartRef.current;
        if (!chart) return;

        /* MULTI SERIES */
        if (entry && typeof entry === "object" && !entry.priceScale) {
          Object.values(entry).forEach((series) => {
            if (!series) return;
            if (typeof series.setData !== "function") return;

            try {
              chart.removeSeries(series);
            } catch { }
          });
        } else {
          /* SINGLE SERIES */
          try {
            chart.removeSeries(entry);
          } catch { }
        }

        // Keep it empty so the Plot component knows it needs to create a new one
        delete indicatorSeriesRef.current[indicator];
      });
    }

    fetchIndicatorData(indicatorsToFetch, selectedCurrency, timeframeValue);

    indicatorsToFetch.forEach((ind) => fetchedIndicatorsRef.current.add(ind));

    // update previous values
    prevTimeframeRef.current = timeframeValue;
    prevCurrencyRef.current = selectedCurrency;
  }, [selectedIndicator, selectedCurrency, timeframeValue]);

  const toggleIndicatorVisibility = (indicator) => {
    const currentVisible = indicatorVisibility[indicator] ?? true;
    const newVisibility = !currentVisible;
    const seriesGroup = indicatorSeriesRef.current?.[indicator];
    if (seriesGroup) {
      Object.values(seriesGroup).forEach((series) => {
        if (series?.applyOptions) {
          series.applyOptions({ visible: newVisibility });
        }
      });
      if (seriesGroup._priceLines) {
        Object.values(seriesGroup._priceLines).forEach((line) => {
          line?.applyOptions({ visible: newVisibility });
        });
      }
    }
    setIndicatorVisibility((prev) => ({
      ...prev,
      [indicator]: newVisibility,
    }));
  };

  //  GET PANE INDEX
  const getPaneIndex = (indicator) => {
    // ❗ overlay indicators → always main pane
    const baseIndicator = indicator.split("_")[0];
    if (!PANE_INDICATORS.has(baseIndicator)) return 0;

    if (paneIndexRef.current[indicator] !== undefined) {
      return paneIndexRef.current[indicator];
    }

    const usedPanes = new Set(Object.values(paneIndexRef.current));
    let nextPane = 1;
    while (usedPanes.has(nextPane)) {
      nextPane++;
    }

    paneIndexRef.current[indicator] = nextPane;
    return nextPane;
  };

  const closeAlert = () => {
    setShowAlertForm(false);
  };

  //  ADD SERIES
  const addSeries = (indicator, SeriesType, options = {}) => {
    if (!chartRef.current) return null;

    const paneIndex = getPaneIndex(indicator);

    const series = chartRef.current.addSeries(
      SeriesType,
      {
        ...options,
        ...(paneIndex !== 0 && { priceScaleId: `pane_${paneIndex}` }),
      },
      paneIndex,
    );

    // 🔥 ADD THIS BLOCK (same as first project)
    if (paneIndex !== 0) {
      const tryPopulate = () => {
        const panes = chartRef.current.panes();
        const paneObj = panes[paneIndex];

        if (paneObj) {
          const div = paneObj.getHTMLElement();
          if (div) {
            const paneKey = resolvePaneKey(indicator);

            panesRef.current[paneKey] = {
              chart: chartRef.current,
              pane: paneObj,
              div: div,
            };
            return true;
          }
        }
        return false;
      };

      if (!tryPopulate()) {
        setTimeout(tryPopulate, 100);
      }
    }

    return series;
  };

  //  ✅ CHART SYNC ENGINE
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

  function cleanupPane(paneKey) {
    const pane = panesRef.current[paneKey];
    if (!pane) return;

    const chart = pane.chart;

    const isStillUsed = Object.entries(indicatorSeriesRef.current).some(
      ([indicatorKey]) => resolvePaneKey(indicatorKey) === paneKey,
    );

    if (isStillUsed) return;

    try {
      // 1. Collect all series in this pane
      const seriesToRemove = [];

      Object.entries(indicatorSeriesRef.current).forEach(([ind, group]) => {
        if (resolvePaneKey(ind) !== paneKey) return;

        if (!group) return;

        Object.values(group).forEach((series) => {
          if (series) seriesToRemove.push(series);
        });

        delete indicatorSeriesRef.current[ind];
      });

      // 2. REMOVE series FIRST
      seriesToRemove.forEach((s) => {
        try {
          chart.removeSeries(s);
        } catch { }
      });

      // 3. IMPORTANT: force chart to recompute pane layout
      requestAnimationFrame(() => {
        try {
          chart.timeScale().fitContent();
        } catch { }
      });

      // 4. Remove internal references
      delete panesRef.current[paneKey];
    } catch (e) {
      console.warn("cleanupPane error:", e);
    }
  }

  //  ✅ INDICATOR REMOVAL
  const removeIndicator = useCallback((indicator) => {
    const entry = indicatorSeriesRef.current[indicator];
    if (!entry) return;

    const paneKey = resolvePaneKey(indicator);
    const pane = panesRef.current[paneKey];
    const chart = pane?.chart ?? chartRef.current;
    if (!chart) return;

    /* MULTI SERIES */
    if (entry && typeof entry === "object" && !entry.priceScale) {
      Object.values(entry).forEach((series) => {
        if (!series) return;
        if (typeof series.setData !== "function") return;

        try {
          chart.removeSeries(series);
        } catch { }
      });
    } else {
      /* SINGLE SERIES */
      try {
        chart.removeSeries(entry);
      } catch { }
    }

    delete indicatorSeriesRef.current[indicator];
    delete latestIndicatorValuesRef.current[indicator];
    delete paneIndexRef.current[indicator];
    fetchedIndicatorsRef.current.delete(indicator);

    /* ✅ ADD THIS BLOCK (IMPORTANT) */
    setIndicatorConfigs((prev) => {
      const updated = { ...prev };
      delete updated[indicator]; // remove old config
      return {
        ...updated,
        [indicator]: indicatorConfigDefault[indicator] || {},
      };
    });

    setIndicatorStyle((prev) => {
      const updated = { ...prev };
      delete updated[indicator];
      return {
        ...updated,
        [indicator]: indicatorStyleDefault[indicator] || {},
      };
    });

    cleanupPane(paneKey);

    setSelectedIndicator((prev) => prev.filter((i) => i !== indicator));
  }, []);
  // ----------Main chart------------
  useEffect(() => {
    if (!containerRef.current) return;
    if (chartRef.current) return; // Prevent recreating the chart on every render

    const isDark = theme === "dark";
    const chart = createChart(containerRef.current, {
      ...ChartProprties,
      height: mainChartHeightRef.current,
      layout: {
        ...ChartProprties.layout,
        background: { type: "solid", color: isDark ? "#000000ff" : "#ffffff" },
        textColor: isDark ? "#ffffff" : "#334155",
      },
      grid: {
        vertLines: { color: isDark ? "#171e29ff" : "#f1f5f9" },
        horzLines: { color: isDark ? "#171e29ff" : "#f1f5f9" },
      },
      timeScale: {
        ...ChartProprties.timeScale,
        borderColor: isDark ? "#1e293b" : "#e2e8f0",
      },
      rightPriceScale: {
        ...ChartProprties.rightPriceScale,
        borderColor: isDark ? "#1e293b" : "#e2e8f0",
      },
    });
    chartRef.current = chart;
    attachSync(chart);

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []); // Run only once

  useEffect(() => {
    if (!chartRef.current) return;
    const isDark = theme === "dark";
    chartRef.current.applyOptions({
      layout: {
        background: { type: "solid", color: isDark ? "#0b0f19" : "#ffffff" },
        textColor: isDark ? "#ffffff" : "#334155",
      },
      grid: {
        vertLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
        horzLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
      },
      timeScale: {
        borderColor: isDark ? "#1e293b" : "#e2e8f0",
      },
      rightPriceScale: {
        borderColor: isDark ? "#1e293b" : "#e2e8f0",
      },
    });
  }, [theme]);

  const toggleIndicator = useCallback((indicator) => {
    setSelectedIndicator((prev) => {
      if (prev.length >= 10) {
        alert("Maximum of 10 indicators allowed.");
        return prev;
      }

      const newId = `${indicator}_${Date.now()}`;

      setIndicatorConfigs((configs) => ({
        ...configs,
        [newId]: { ...(indicatorConfigDefault[indicator] || {}) },
      }));

      setIndicatorStyle((styles) => ({
        ...styles,
        [newId]: { ...(indicatorStyleDefault[indicator] || {}) },
      }));

      return [...prev, newId];
    });
  }, []);

  // RENDER INDICATOR VALUE

  const renderValue = (indicator, value) => {
    if (value == null) return "--";

    const baseIndicator = indicator.split("_")[0];
    const showPercent = baseIndicator === "AROON"; // Only show % for Aroon

    /* ================= NUMBER VALUES ================= */
    if (typeof value === "number") {
      const style =
        indicatorStyle?.[indicator]?.sma ||
        indicatorStyle?.[indicator]?.ma ||
        indicatorStyle?.[indicator]?.[baseIndicator?.toLowerCase()];

      if (style?.visible === false) return null;

      const color = style?.color || "var(--text-main, #333)";

      return (
        <span style={{ color }}>
          {Number(value).toFixed(2)}
          {showPercent ? "%" : ""}
        </span>
      );
    }

    /* ================= OBJECT VALUES ================= */
    if (typeof value === "object") {
      let keysToShow;

      switch (baseIndicator) {
        case "RSI":
          keysToShow = ["rsi", "smoothingMA", "bbUpper", "bbLower"];
          break;
        case "MACD":
          keysToShow = ["macd", "signal", "histogram"];
          break;
        case "CCI":
          keysToShow = ["cciLine", "cciMa"];
          break;
        case "TRIX":
          keysToShow = ["trixLine"];
          break;
        case "CMF":
          keysToShow = ["cmfLine"];
          break;
        case "MFI":
          keysToShow = ["mfiLine"];
          break;
        case "KVO":
          keysToShow = ["kvoLine", "signalLine"];
          break;
        case "STOCHRSI":
          keysToShow = ["kLine", "dLine"];
          break;
        case "EOM":
          keysToShow = ["eom"];
          break;
        case "WPR":
          keysToShow = ["r"];
          break;
        case "ROC":
          keysToShow = ["roc"];
          break;
        case "CHOP":
          keysToShow = ["chopLine"];
          break;
        case "MOM":
          keysToShow = ["mom"];
          break;
        case "UO":
          keysToShow = ["uo"];
          break;
        case "AO":
          keysToShow = ["oscillator"];
          break;
        case "ICHIMOKU":
          keysToShow = [
            "conversionLine",
            "baseLine",
            "leadLine1",
            "leadLine2",
            "laggingSpan",
            "kumoCloudUpper",
            "kumoCloudLower",
          ];
          break;
        case "AROON":
          keysToShow = ["aroonUp", "aroonDown"];
          break;
        case "FT":
          keysToShow = ["fisherLine", "triggerLine"];
          break;
        case "STOCH":
          keysToShow = ["k", "d"];
          break;

        case "SUPERTREND":
          keysToShow = ["upTrend", "downTrend", "bodyMiddle"];

        default:
          keysToShow = Object.keys(value);
      }

      return keysToShow
        .filter((key) => {
          const style = indicatorStyle?.[indicator]?.[key];
          if (style?.visible === false) return false;
          return value[key] != null;
        })
        .map((key) => {
          const val = value[key];
          const color =
            indicatorStyle?.[indicator]?.[key]?.color ||
            "var(--text-main, #333)";

          return (
            <span key={key} style={{ marginRight: 8, color }}>
              {Number.isFinite(val)
                ? `${Number(val).toFixed(2)}${showPercent ? "%" : ""}`
                : "--"}
            </span>
          );
        });
    }

    return "--";
  };

  const renderIndicators = () => {
    return selectedIndicator.map((indicator) => {
      const baseIndicator = indicator.split("_")[0];
      const Component = indicatorComponents[baseIndicator];
      if (!Component) return null;

      const data = indicatorSeriesRef.current?.[indicator];

      return (
        <Component
          key={indicator}
          indicator={indicator}
          result={data?.result}
          rows={data?.rows}
          indicatorStyle={indicatorStyle}
          indicatorSeriesRef={indicatorSeriesRef}
          addSeries={addSeries}
          containerRef={containerRef}
          chart={chartRef.current}
          container={containerRef}
          panesRef={panesRef}
          indicatorConfigs={indicatorConfigs}
          pane={seriesRef.current}
          timeframeValue={timeframeValue}
          selectedCurrency={selectedCurrency}
        />
      );
    });
  };

  // SYNC CROSSHAIR
  const updateIndicatorValues = (param) => {
    const updates = {};

    Object.entries(indicatorSeriesRef.current).forEach(([indicator, group]) => {
      if (!group) return;

      const indicatorValues = {};

      Object.entries(group).forEach(([lineName, series]) => {
        if (!series || typeof series.setData !== "function") return;

        const price = param.seriesData?.get(series);
        if (price !== undefined) {
          indicatorValues[lineName] =
            typeof price === "object" ? price.value : price;
        }
      });

      if (Object.keys(indicatorValues).length === 1) {
        updates[indicator] = Object.values(indicatorValues)[0];
      } else if (Object.keys(indicatorValues).length > 0) {
        updates[indicator] = indicatorValues;
      }
    });

    if (Object.keys(updates).length > 0) {
      latestIndicatorValuesRef.current = updates;
      setLiveIndicatorData(updates); // <- triggers renderValue
    }
  };
  // ATTACH CROSSHAIR

  const attachCrosshair = useCallback((chart) => {
    if (!chart) return () => { };
    const handler = (param) => {
      const charts = [
        chartRef.current,
        ...Object.values(panesRef.current).map((p) => p.chart),
      ].filter(Boolean);

      // clear crosshair if invalid
      if (!param?.point || param.time === undefined) {
        charts.forEach((c) => c.clearCrosshairPosition?.());
        setLiveIndicatorData(latestIndicatorValuesRef.current);
        return;
      }

      // sync crosshair
      charts.forEach((c) => {
        c.setCrosshairPosition(
          param.point?.x ?? 0,
          param.point?.y ?? 0,
          param.time,
        );
      });

      // update candles
      const candle = param.seriesData?.get(seriesRef.current);
      if (candle) setLiveOhlcv({ ...candle });

      // update indicators
      updateIndicatorValues(param);
    };

    chart.subscribeCrosshairMove(handler);
    return () => chart.unsubscribeCrosshairMove(handler);
  }, []);

  // ATTACH MAIN CHART

  useEffect(() => {
    // Reattach crosshair whenever series references change
    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ].filter(Boolean);
    const detachHandlers = charts.map((c) => attachCrosshair(c));

    return () => detachHandlers.forEach((d) => d());
  }, [indicatorSeriesRef.current, timeframeValue]);

  // Main useEffect for chart type/data changes
  useEffect(() => {
    if (!chartRef.current) return;

    let isCancelled = false;

    const loadChart = async () => {
      try {
        setMainChartLoading(true);

        const response = await fetchDataByCurrency(
          selectedCurrency,
          timeframeValue,
          chartType,
        );

        if (isCancelled) return;

        // remove previous series to avoid showing old data before adding the new series
        if (seriesRef.current) {
          try {
            chartRef.current.removeSeries(seriesRef.current);
          } catch (e) { }
          seriesRef.current = null;
        }

        const data = response?.data || [];

        if (!Array.isArray(data) || !data.length) return;

        setLivePrice(Number(data[data.length - 1]?.close));

        switch (chartType) {
          case "line":
            seriesRef.current = chartRef.current.addSeries(
              LineSeries,
              chartSeriesStyles.line,
            );

            seriesRef.current.setData(
              data.map((d) => ({
                time: d.time,
                value: Number(d.close),
              })),
            );
            break;

          case "bar":
            seriesRef.current = chartRef.current.addSeries(
              BarSeries,
              chartSeriesStyles.bar,
            );

            seriesRef.current.setData(
              data.map((d) => ({
                time: d.time,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
              })),
            );
            break;

          case "area":
            seriesRef.current = chartRef.current.addSeries(
              AreaSeries,
              chartSeriesStyles.area,
            );

            seriesRef.current.setData(
              data.map((d) => ({
                time: d.time,
                value: Number(d.close),
              })),
            );
            break;

          case "baseline":
            seriesRef.current = chartRef.current.addSeries(BaselineSeries, {
              ...chartSeriesStyles.baseline,
              baseValue: {
                type: "price",
                price: Number(data[0]?.close ?? 0),
              },
            });

            seriesRef.current.setData(
              data.map((d) => ({
                time: d.time,
                value: Number(d.close),
              })),
            );
            break;

          case "histogram":
            seriesRef.current = chartRef.current.addSeries(
              HistogramSeries,
              chartSeriesStyles.histogram,
            );

            seriesRef.current.setData(
              data.map((d, index, arr) => {
                const prev = arr[index - 1];
                const isUp = prev ? d.close >= prev.close : true;

                return {
                  time: d.time,
                  value: d.volume,
                  color: isUp ? "#26a69a" : "#f23645",
                };
              }),
            );
            break;

          case "heikinashi":
            seriesRef.current = chartRef.current.addSeries(
              CandlestickSeries,
              chartSeriesStyles.candlestick,
            );

            seriesRef.current.setData(convertToHeikinAshi(data));
            break;

          case "hollowcandles":
            seriesRef.current = chartRef.current.addSeries(
              CandlestickSeries,
              chartSeriesStyles.hollowcandles,
            );

            seriesRef.current.setData(data);
            break;

          default:
            seriesRef.current = chartRef.current.addSeries(
              CandlestickSeries,
              chartSeriesStyles.candlestick,
            );

            seriesRef.current.setData(data);
        }

        chartRef.current.timeScale().fitContent();
      } catch (err) {
        console.error("Chart load error", err);
      } finally {
        setMainChartLoading(false);
      }
    };

    loadChart();

    return () => {
      isCancelled = true;
    };
  }, [chartType, timeframeValue, selectedCurrency]);

  // Subscribe to live ticks for real-time candle formation
  const handleLiveTickUpdate = useCallback((tick) => {
    if (!tick) return;
    const tickData = tick.ohlcv || tick;
    const tickTime = tick.timestamp || tickData.time;
    if (!tickTime || !seriesRef.current) return;
    if (tick.symbol && tick.symbol !== selectedCurrency) return;

    setLivePrice(Number(tickData.close));
    setLiveOhlcv(tickData);

    try {
      let parsedTime = Number(tickTime);
      if (parsedTime > 1e10) {
        parsedTime = Math.floor(parsedTime / 1000);
      }
      switch (chartType) {
        case "line":
        case "area":
        case "baseline":
          seriesRef.current.update({
            time: parsedTime,
            value: Number(tickData.close),
          });
          break;
        case "histogram":
          seriesRef.current.update({
            time: parsedTime,
            value: Number(tickData.volume),
            color: Number(tickData.close) >= Number(tickData.open) ? "#26a69a" : "#f23645",
          });
          break;
        case "bar":
        case "hollowcandles":
        case "heikinashi":
        default:
          seriesRef.current.update({
            time: parsedTime,
            open: Number(tickData.open),
            high: Number(tickData.high),
            low: Number(tickData.low),
            close: Number(tickData.close),
          });
          break;
      }
    } catch (err) {
      console.error("Lightweight charts update error:", err, "tickData:", tickData);
    }
  }, [selectedCurrency, chartType]);

  const handleWatchlistResponse = useCallback((res) => {
    if (res && Array.isArray(res.data)) {
      const item = res.data.find((w) => w.symbol === selectedCurrency);
      if (item) {
        const price = item.price ?? item.lastPrice;
        if (price !== undefined && price !== null) {
          setLivePrice(Number(price));
        }
      }
    }
  }, [selectedCurrency]);

  const handleWatchlistUpdate = useCallback((tick) => {
    if (tick && tick.symbol === selectedCurrency) {
      const price = tick.price ?? tick.lastPrice;
      if (price !== undefined && price !== null) {
        setLivePrice(Number(price));
      }
    }
  }, [selectedCurrency]);

  useSocket({
    handleLiveTickUpdate,
    handleWatchlistResponse,
    handleWatchlistUpdate,
  });

  useEffect(() => {
    if (!selectedCurrency || !timeframeValue) return;
    const symbol = selectedCurrency;
    const interval = timeframeValue;
    socket.emit("subscribe-live-tick", { symbol, interval });
    socket.emit("get-watchlist");

    return () => {
      socket.emit("unsubscribe-live-tick", { symbol, interval });
    };
  }, [selectedCurrency, timeframeValue]);

  const { fetchDataByCurrency, fetchIndicatorData } = useChartFunctions({
    chartRef,
    addSeries,
    indicatorSeriesRef,
    indicatorStyle,
    latestIndicatorValuesRef,
    indicatorConfigs,
  });

  const zoomCharts = (delta) => {
    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ].filter(Boolean);
    charts.forEach((chart) => {
      const range = chart.timeScale().getVisibleLogicalRange();
      if (!range) return;
      chart.timeScale().setVisibleLogicalRange({
        from: range.from + delta,
        to: range.to - delta,
      });
    });
  };

  const zoomIn = () => zoomCharts(1);
  const zoomOut = () => zoomCharts(-1);
  const resetZoom = () => {
    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ].filter(Boolean);
    charts.forEach((chart) => chart.timeScale().fitContent());
  };
  return (
    <>
      <SEO
        title="Best Crypto Trading Platform"
        description="Trade crypto instantly with low fees"
        keywords="crypto, trading, bitcoin, ethereum"
        url="https://yourdomain.com/"
        image="https://yourdomain.com/banner.jpg"
      />
      <section className="trading-view-wrapper overflow-x-hidden" style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden"
      }}>
        <div className="container-fluid p-0 m-0" style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden"
        }}>
          <div className="row m-0">
            <div className="col-md-12 p-0">
              <div className="trading-chart-header">
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
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              backgroundColor: "var(--bg-main, #ffffff)",
            }}
          >
            {/* Left Content (Chart + Indicators) */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                transition: "flex 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              <div
                ref={containerRef}
                onMouseEnter={() => { if (zoomBtnRef.current) zoomBtnRef.current.style.opacity = "1"; }}
                onMouseLeave={() => { if (zoomBtnRef.current) zoomBtnRef.current.style.opacity = "0"; }}
                style={{
                  width: "100%",
                  height: ChartProprties.height,
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {mainChartLoading && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 1000,
                    }}
                  >
                    <Spinner />
                  </div>
                )}
                {/* -------------------------------sub-header live Values----------------------- */}
                <div
                  className="flex px-2 py-1 top-2 z-10 absolute items-center gap-2 justify-start rounded-3"
                  style={{
                    backgroundColor: "var(--bg-card, #f8f9fa)",
                    color: "var(--text-main, #131722)",
                    border: "1px solid var(--border-color, #e2e8f0)",
                  }}
                >
                  {/* LEFT: Symbol */}
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-main, #131722)" }}
                  >
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
                      <h6
                        className="px-2 py-1 mb-0"
                        style={{ fontSize: "12px" }}
                      >
                        <span className="text-primary">{liveOhlcv?.value}</span>
                      </h6>
                    ) : (
                      // Other charts → OHLC
                      <>
                        <h6
                          className="px-2 py-1 mb-0"
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted, #64748b)",
                          }}
                        >
                          O:{" "}
                          <span className={valueColor}>{liveOhlcv?.open}</span>
                        </h6>
                        <h6
                          className="px-2 py-1 mb-0"
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted, #64748b)",
                          }}
                        >
                          H:{" "}
                          <span className={valueColor}>{liveOhlcv?.high}</span>
                        </h6>
                        <h6
                          className="px-2 py-1 mb-0"
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted, #64748b)",
                          }}
                        >
                          L:{" "}
                          <span className={valueColor}>{liveOhlcv?.low}</span>
                        </h6>
                        <h6
                          className="px-2 py-1 mb-0"
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted, #64748b)",
                          }}
                        >
                          C:{" "}
                          <span className={valueColor}>{liveOhlcv?.close}</span>
                        </h6>
                      </>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    position: "absolute",
                    top: "54px",
                    left: "8px",
                    zIndex: 50,
                  }}
                >
                  <Button
                    onClick={() =>
                      alert(
                        `Executing Buy Order for ${selectedCurrency} at $${livePrice || "market price"}`,
                      )
                    }
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(8, 153, 129, 0.05)"
                          : "rgba(8, 153, 129, 0.02)",
                      border: "1.5px solid #089981",
                      color: "#089981",
                      borderRadius: "8px",
                      width: "120px",
                      padding: "6px 12px",
                      lineHeight: "1.2",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(8, 153, 129, 0.15)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme === "dark"
                          ? "rgba(8, 153, 129, 0.05)"
                          : "rgba(8, 153, 129, 0.02)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.96)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {livePrice !== null && livePrice !== undefined
                        ? livePrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })
                        : "—"}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        letterSpacing: "0.05em",
                        marginTop: "2px",
                      }}
                    >
                      BUY
                    </span>
                  </Button>

                  <Button
                    onClick={() =>
                      alert(
                        `Executing Sell Order for ${selectedCurrency} at $${livePrice || "market price"}`,
                      )
                    }
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(242, 54, 69, 0.05)"
                          : "rgba(242, 54, 69, 0.02)",
                      border: "1.5px solid #f23645",
                      color: "#f23645",
                      borderRadius: "8px",
                      width: "120px",
                      padding: "6px 12px",
                      lineHeight: "1.2",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(242, 54, 69, 0.15)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme === "dark"
                          ? "rgba(242, 54, 69, 0.05)"
                          : "rgba(242, 54, 69, 0.02)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.96)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {livePrice !== null && livePrice !== undefined
                        ? livePrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })
                        : "—"}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        letterSpacing: "0.05em",
                        marginTop: "2px",
                      }}
                    >
                      SELL
                    </span>
                  </Button>
                </div>

                {/* -----------------INDICATOR BAR------------------- */}

                {selectedIndicator?.length > 0 && (
                  <div className="absolute top-10 left-2 flex flex-col gap-1 z-50">
                    {selectedIndicator &&
                      selectedIndicator?.map((indicator, index) => {
                        const normalizedType = indicator.replace(
                          /[\s/%]+/g,
                          "",
                        );
                        const baseIndicator = normalizedType.split("_")[0];
                        const value = liveIndicatorData[normalizedType];
                        return (
                          <div
                            key={index}
                            className="flex w-full justify-between items-center gap-3 shadow-sm border rounded-3 px-3 h-8 text-xs "
                            style={{
                              backgroundColor: "var(--bg-card, #ffffff)",
                              borderColor: "var(--border-color, #e2e8f0)",
                              color: "var(--text-main, #131722)",
                            }}
                          >
                            <span
                              className="font-medium w-full flex items-center gap-2"
                              style={{ color: "var(--text-main, #131722)" }}
                            >
                              {baseIndicator} :{" "}
                              {indicatorConfigs?.[normalizedType]?.length ?? ""}{" "}
                              {indicatorConfigs?.[normalizedType]?.source ?? ""}{" "}
                              <span style={{ display: "flex", gap: 6 }}>
                                {renderValue(normalizedType, value)}
                              </span>
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                title={
                                  indicatorVisibility[normalizedType] !== false
                                    ? "Hide Indicator"
                                    : "Show Indicator"
                                }
                                onClick={() =>
                                  toggleIndicatorVisibility(normalizedType)
                                }
                                className="text-slate-600"
                              >
                                {indicatorVisibility[normalizedType] !== false ? (
                                  <IoEyeOutline size={18} />
                                ) : (
                                  <IoEyeOffOutline size={18} />
                                )}
                              </button>
                              <button
                                title="Indicator Settings"
                                onClick={() => {
                                  setActiveBarIndicator(indicator);
                                  setIndicatorProperty((prev) => !prev);
                                }}
                                className="text-slate-600"
                              >
                                <IoSettingsOutline size={18} />
                              </button>

                              <button
                                title="Source Code"
                                onClick={() => {
                                  setActiveSourceIndicator(indicator);
                                  setShowSourcePanel(true);
                                }}
                                className="text-slate-600"
                              >
                                <FaCode size={18} />
                              </button>

                              <button
                                onClick={() => removeIndicator(normalizedType)}
                                className="text-slate-600"
                              >
                                <IoCloseSharp size={18} />
                              </button>
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
                {/* ── Zoom Buttons (TradingView style, hover to reveal) ── */}
                <div
                  ref={zoomBtnRef}
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "row",
                    gap: "4px",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  <button
                    onClick={zoomIn}
                    title="Zoom In"
                    style={{
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--bg-card, #ffffff)",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      borderRadius: "6px",
                      color: "var(--text-main, #131722)",
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-card-hover, #f1f5f9)";
                      e.currentTarget.style.borderColor = "var(--accent-color, #2962ff)";
                      e.currentTarget.style.color = "var(--accent-color, #2962ff)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--bg-card, #ffffff)";
                      e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)";
                      e.currentTarget.style.color = "var(--text-main, #131722)";
                    }}
                  >
                    <LuCirclePlus size={15} />
                  </button>

                  <button
                    onClick={zoomOut}
                    title="Zoom Out"
                    style={{
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--bg-card, #ffffff)",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      borderRadius: "6px",
                      color: "var(--text-main, #131722)",
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-card-hover, #f1f5f9)";
                      e.currentTarget.style.borderColor = "var(--accent-color, #2962ff)";
                      e.currentTarget.style.color = "var(--accent-color, #2962ff)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--bg-card, #ffffff)";
                      e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)";
                      e.currentTarget.style.color = "var(--text-main, #131722)";
                    }}
                  >
                    <LuCircleMinus size={15} />
                  </button>

                  <button
                    onClick={resetZoom}
                    title="Reset Zoom"
                    style={{
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--accent-color, #2962ff)",
                      border: "1px solid var(--accent-color, #2962ff)",
                      borderRadius: "6px",
                      color: "#ffffff",
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(41,98,255,0.25)",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <RiResetRightLine size={14} />
                  </button>
                </div>
              </div>

              <div
                ref={paneContainerRef}
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                {indicatorLoading && (
                  <div
                    style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 1000,
                    }}
                  >
                    <Spinner />
                  </div>
                )}
                {renderIndicators()}
              </div>
            </div>

            <div
              ref={sidebarContainerRef}
              style={{
                position: "relative",
                width: isWatchlistOpen ? `${sidebarWidth}px` : "0px",
                transition: isDraggingWidth
                  ? "none"
                  : "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                overflow: "hidden",
                borderLeft: isWatchlistOpen
                  ? "1px solid var(--border-color, #e2e8f0)"
                  : "none",
                backgroundColor: "var(--bg-card, #ffffff)",
                height: "100%",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {/* Width Resizer Handle on the left edge */}
              {isWatchlistOpen && (
                <div
                  onMouseDown={startWidthResize}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    cursor: "col-resize",
                    zIndex: 100,
                    backgroundColor: isDraggingWidth
                      ? "var(--accent-color, #2962ff)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor =
                      "var(--accent-color, #2962ff)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isDraggingWidth)
                      e.target.style.backgroundColor = "transparent";
                  }}
                />
              )}

              {/* Inside Wrapper */}
              <div
                style={{
                  width: `${sidebarWidth}px`,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                {/* Watchlist Panel (Top) */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <WatchlistPanel
                    onClose={() => setIsWatchlistOpen(false)}
                    activeCurrency={activeWatchlistCurrency}
                    setActiveCurrency={(symbol) => {
                      setActiveWatchlistCurrency(symbol);
                      setSelectedCurrency(symbol);
                    }}
                  />
                </div>

                {/* Details Panel (Bottom) */}
                {isDetailsOpen && (
                  <>
                    {/* Horizontal Height Resizer Handle */}
                    <div
                      onMouseDown={startHeightResize}
                      style={{
                        height: "5px",
                        cursor: "row-resize",
                        zIndex: 100,
                        backgroundColor: isDraggingHeight
                          ? "var(--accent-color, #2962ff)"
                          : "var(--border-color, #e2e8f0)",
                        borderTop: "1px solid var(--border-color, #e2e8f0)",
                        borderBottom: "1px solid var(--border-color, #e2e8f0)",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          "var(--accent-color, #2962ff)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isDraggingHeight)
                          e.target.style.backgroundColor =
                            "var(--border-color, #e2e8f0)";
                      }}
                    />
                    <div
                      style={{
                        height: `${detailsHeight}px`,
                        overflow: "hidden",
                        display: "flex",

                        flexDirection: "column",
                      }}
                    >
                      <DetailsPanel
                        onClose={() => setIsDetailsOpen(false)}
                        symbol={activeWatchlistCurrency || selectedCurrency}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div style={{ width: "50px", height: "100%", flexShrink: 0 }}>
              <RightSidebar
                isWatchlistOpen={isWatchlistOpen}
                toggleWatchlist={() => {
                  setIsWatchlistOpen(!isWatchlistOpen);
                  setIsAlertsOpen(false);
                }}
                isDetailsOpen={isDetailsOpen}
                toggleDetails={() => {
                  if (isWatchlistOpen) {
                    setIsDetailsOpen(!isDetailsOpen);
                  } else {
                    setIsWatchlistOpen(true);
                    setIsDetailsOpen(true);
                  }
                  setIsAlertsOpen(false);
                }}
                isAlertsOpen={isAlertsOpen}
                toggleAlerts={() => {
                  setIsAlertsOpen(!isAlertsOpen);
                  setIsWatchlistOpen(false);
                  setIsDetailsOpen(false);
                }}
              />
            </div>
          </div>
        </div>

        <SourceCodePanel
          show={showSourcePanel}
          indicator={activeSourceIndicator}
          onClose={() => setShowSourcePanel(false)}
        />
      </section>
      <section

      >



        {/* --------------indicator sub part property show in modal-------------- */}
        <IndicatorPropertyDialog
          setIndicatorProperty={setIndicatorProperty}
          indicatorProperty={indicatorProperty}
          activeBarIndicator={activeBarIndicator}
          setIndicatorConfigs={setIndicatorConfigs}
          indicatorConfigs={indicatorConfigs}
          indicatorStyle={indicatorStyle}
          setIndicatorStyle={setIndicatorStyle}
          indicatorSeriesRef={indicatorSeriesRef}
          selectedCurrency={selectedCurrency}
          timeframeValue={timeframeValue}
          latestIndicatorValuesRef={latestIndicatorValuesRef}
        />


      </section>
    </>
  );
}
