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
import IndicatorBuildingListing from "../components/scanner/IndicatorBuilderListing";
import {
  ChartProprties,
  TIMEFRAME_TO_SECONDS,
  SINGLE_VALUE_CHARTS,
  chartSeriesStyles,
  convertToHeikinAshi,
  PANE_INDICATORS,
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
import { FiMoreHorizontal } from "react-icons/fi";
import IndicatorAlert from "../components/indicator/IndicatorAlert";
import IndicatorPropertyDialog from "../components/indicator/IndicatorPropertyDialog";
import useChartFunctions from "../util/useChartFunctions";
import { indicatorComponents } from "../components/indicator/IndicatorIndex";
import { Spinner } from "../components/tradingModals/Spinner";
import IndicatorBar from "../components/indicator/IndicatorBar";

export default function Candlestick() {
  const chartRef = useRef();
  const containerRef = useRef();
  const seriesRef = useRef(null);
  const indicatorSeriesRef = useRef({});
  const latestIndicatorValuesRef = useRef({});
  const panesRef = useRef({});
  const syncingRef = useRef(false);
  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState("1m");
  const [selectedCurrency, setSelectedCurrency] = useState("BTCUSDT");
  const [selectedIndicator, setSelectedIndicator] = useState([]);
  const [rangeValue, setRangeValue] = useState("1000");
  const [chartType, setChartType] = useState("candlestick");
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [liveOhlcv, setLiveOhlcv] = useState({});
  const [liveIndicatorData, setLiveIndicatorData] = useState({});
  const [showAlertForm, setShowAlertForm] = useState(false);
  // const [openSettings, setOpenSettings] = useState(false);
  const [indicatorProperty, setIndicatorProperty] = useState(false);
  const [indicatorLoading, setIndicatorLoading] = useState(false);
  const mainChartHeightRef = useRef(500);

  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [activeSourceIndicator, setActiveSourceIndicator] = useState(null);

  const [indicatorVisibility, setIndicatorVisibility] = useState({});
  const [activeBarIndicator, setActiveBarIndicator] = useState("");

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
  const paneIndexRef = useRef({});

  /* =========================
   GET PANE INDEX
========================= */

  const getPaneIndex = (indicator) => {
    if (!PANE_INDICATORS.has(indicator)) return 0;

    if (paneIndexRef.current[indicator] !== undefined) {
      return paneIndexRef.current[indicator];
    }

    const nextPane = Object.keys(paneIndexRef.current).length + 1;

    paneIndexRef.current[indicator] = nextPane;

    return nextPane;
  };

  const [indicatorConfigs, setIndicatorConfigs] = useState({
    SMA: {
      length: 9,
      source: "close",
      offset: 0,
      maType: "none",
      maLength: 14,
      bbStdDev: 2,
    },

    EMA: {
      length: 9,
      source: "close",
      offset: 0,
      maType: "none",
      maLength: 14,
      bbStdDev: 2,
    },

    WMA: {
      length: 9,
      source: "close",
      offset: 0,
    },

    HMA: {
      length: 9,
      source: "close",
    },

    DEMA: {
      length: 9,
      source: "close",
    },

    TEMA: {
      length: 9,
    },

    KAMA: {
      ERlength: 10,
      fastLength: 2,
      slowLength: 30,
      source: "close",
    },

    IchimokuCloud: {
      conversionLength: 9,
      baseLength: 26,
      spanBLength: 52,
      laggingSpan: 26,
    },
    ParabolicSAR: {
      start: 0.02,
      increment: 0.02,
      maxValue: 0.02,
    },
    SuperTrend: {
      atrLength: 10,
      factor: 3,
    },

    Aroon: {
      length: 14,
    },
    AroonOscillator: {
      length: 14,
    },
    ADX: {
      smoothing: 14,
      diLength: 14,
    },

    "Chande Kroll Stop": {
      atrLength: 10, // default p
      atrCoefficient: 1, // default x
      stopLength: 9, // default q
    },

    RSI: {
      length: 14,
      source: "close",
      maType: "SMA",
      maLength: 14,
      bbStdDev: 2,
    },

    Stochastic: {
      kLength: 14, // %K Length
      kSmoothing: 1, // %K Smoothing
      dSmoothing: 3, // %D Smoothing
    },

    "Stochastic RSI": {
      rsiLength: 14, // RSI period
      rsiSource: "Close", // RSI source (dropdown)
      stochasticLength: 14, // %K length of Stochastic
      kSmoothing: 3, // %K smoothing
      dSmoothing: 3, // %D smoothing
    },

    MACD: {
      source: "Close",
      fastLength: 12, // Fast EMA/SMA
      slowLength: 26, // Slow EMA/SMA
      signalLength: 9, // Signal line length
      oscillatorMAType: "EMA", // dropdown: "EMA" or "SMA"
      signalMAType: "EMA",
    },

    CCI: {
      length: 20,
      source: "HLC3",
      smoothing: {
        type: "SMA",
        length: 14,
        bbStdDev: 2,
      },
    },
    Momentum: {
      length: 10,
      source: "Close",
    },
    ROC: {
      length: 9,
      source: "Close",
    },
    "Williams %R": {
      length: 14,
      source: "Close",
    },
    "Ultimate Oscillator": {
      fastLength: 7, // Fast period
      middleLength: 14, // Middle period
      slowLength: 28, // Slow period
    },
    "Chande Momentum Oscillator": {
      length: 9,
      source: "Close",
    },
    TRIX: {
      length: 18,
    },
    "Fisher Transform": {
      length: 9,
    },
    ATR: {
      length: 14,
      smoothing: "RMA",
    },
    "Bollinger Bands": {
      length: 20,
      maType: "SMA", // default moving average type
      stdDev: 2,
      source: "Close",
      offset: 0,
    },
    "Bollinger Band Width": {
      length: 20,
      stdDev: 2,
      source: "Close",
      highestExpansionLength: 125,
      lowestContractionLength: 125,
    },
    "Keltner Channels": {
      length: 20,
      source: "Close",
      multiplier: 2,
      atrLength: 10,
      bandsStyle: "Average True Range",
      useEMA: true,
    },
    "Donchian Channels": {
      length: 20,
      offset: 0,
    },
    "Choppiness Index": {
      length: 14,
      offset: 0,
    },
    "Standard Deviation": {
      length: 20,
      source: "Close",
    },
    Volume: {
      maLength: 20,
      colorByPrevious: false,
    },
    "Historical Volatility": {
      length: 10,
    },
    OBV: {
      smoothing: {
        type: "None",
        length: 14,
        bbStdDev: 2,
      },
    },
    "Percentage Volume Oscillator": {
      fastLength: 12,
      slowLength: 26,
      signalLength: 9,
      oscMaType: "EMA", // EMA | SMA
      signalMaType: "EMA", // EMA | SMA
    },
    "Chaikin Money Flow": {
      length: 20,
    },
    MFI: {
      length: 14,
    },
    "Ease of Movement": {
      length: 14,
      divisor: 10000,
    },
    "Negative Volume Index": {
      emaLength: 255,
    },
    "Positive Volume Index": {
      emaLength: 255,
    },
    VWAP: {
      hideOnDailyOrAbove: true,
      anchorPeriod: "Daily",
      source: "HLC3",
      offset: 0,

      bandSettings: {
        calculationMode: "Standard Deviation", // or "Percentage"

        band1: { enabled: true, multiplier: 1 },
        band2: { enabled: false, multiplier: 2 },
        band3: { enabled: false, multiplier: 3 },
      },
    },
    "Zig Zag": {
      priceDeviation: 5,
      pivotLegs: 10,
      lineColor: "#2962ff",
      extendToLastBar: true,
      displayReversalPrice: false,
      displayCumulativeVolume: false,
      reversalPriceChangeMode: "absolute",
    },
  });

  let indicatorStyleDefault = {
    RSI: {
      rsi: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },

      smoothingMA: {
        visible: true,
        color: "rgb(255, 202, 28)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },

      upper: {
        visible: true,
        value: 70,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },

      middle: {
        visible: false,
        value: 50,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },

      lower: {
        visible: true,
        value: 30,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },

      bandFill: {
        visible: true,
        topFillColor1: "rgba(140,120,255,0.05)",
        topFillColor2: "rgba(140,120,255,0.05)",
      },

      obFill: {
        visible: true,
        topFillColor1: "rgba(38,166,154,0.012)",
        topFillColor2: "rgba(38,166,154,0.2)",
      },

      osFill: {
        visible: true,
        bottomFillColor1: "rgba(239,83,80,0.012)",
        bottomFillColor2: "rgba(239,83,80,0.4)",
      },

      /* ================== BOLLINGER BANDS ================== */
      bbUpperBand: {
        visible: true,
        color: "#4caf50",
        width: 1,
      },
      bbLowerBand: {
        visible: true,
        color: "#f44336",
        width: 1,
      },
      bbFill: {
        visible: true,
        topColor: "rgba(76,175,80,0.2)",
        bottomColor: "rgba(76,175,80,0.05)",
      },
    },
    SMA: {
      ma: {
        visible: true,
        color: "rgba(41,98,255,1)",
        width: 2,
        lineStyle: 0,
        opacity: 100,
      },
      smoothingMA: {
        visible: true,
        color: "rgb(255, 202, 28)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
    },
    IchimokuCloud: {
      conversionLine: {
        color: "rgba(41,98,255,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      baseLine: {
        color: "rgba(255,109,0,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      leadLine1: {
        color: "rgba(63,81,181,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      leadLine2: {
        color: "rgba(216,27,96,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      laggingSpan: {
        color: "rgba(156,39,176,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      kumoCloudUpper: {
        color: "rgb(130, 132, 141)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      kumoCloudLower: {
        color: "rgb(130, 132, 141)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      cloudFillBullish: {
        color: "rgba(67,160,71,0.35)",
        opacity: 35,
        visible: true,
      },

      cloudFillBearish: {
        color: "rgba(244,67,54,0.35)",
        opacity: 35,
        visible: true,
      },
    },
    EMA: {
      ema: {
        color: "rgb(0,0,0)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
      smoothingMA: {
        visible: true,
        color: "rgb(255, 202, 28)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
    },
    WMA: {
      wma: {
        color: "rgb(0,0,0)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },
    HMA: {
      hma: {
        visible: true,
        color: "rgba(0,0,0)",
        width: 2,
        lineStyle: 0,
        opacity: 100,
      },
    },

    DEMA: {
      dema: {
        color: "rgb(0,0,0)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },

    TEMA: {
      tema: {
        color: "rgb(0,0,0)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },
    SuperTrend: {
      upTrend: {
        color: "rgb(38,166,154)",
        width: 2,
        lineStyle: 0,
        visible: true,
        opacity: 1,
      },

      downTrend: {
        color: "rgb(239,83,80)",
        width: 2,
        lineStyle: 0,
        visible: true,
        opacity: 1,
      },

      bodyMiddle: {
        color: "rgb(255,255,255)",
        width: 1,
        lineStyle: 2,
        visible: false,
        opacity: 0.6,
      },

      upTrendBg: {
        color0: "rgba(38,166,154,0.2)",
        color1: "rgba(38,166,154,0.05)",
        visible: true,
      },

      downTrendBg: {
        color0: "rgba(239,83,80,0.2)",
        color1: "rgba(239,83,80,0.05)",
        visible: true,
      },
    },
    Aroon: {
      aroonUp: {
        color: "rgb(38,166,154)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 1,
      },

      aroonDown: {
        color: "rgb(239,83,80)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 1,
      },
    },
    AroonOscillator: {
      oscillator: {
        color0: "rgb(38,166,154)",
        color1: "rgb(239,83,80)",
        width: 2,
        lineStyle: 0,
        visible: true,
        opacity: 1,
      },

      center: {
        color: "rgb(158,158,158)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 0,
      },

      upperLevel: {
        color: "rgb(255,152,0)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 90,
      },

      lowerLevel: {
        color: "rgb(3,169,244)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: -90,
      },

      oscillatorFill: {
        color0: "rgba(38,166,154,0.2)",
        color1: "rgba(239,83,80,0.2)",
        visible: true,
      },
    },
  };

  const [indicatorStyle, setIndicatorStyle] = useState(indicatorStyleDefault);

  const closeAlert = () => {
    setShowAlertForm(false);
  };

  /* =========================
   ADD SERIES
========================= */

  const addSeries = (indicator, SeriesType, options = {}) => {
    if (!chartRef.current) return null;

    const paneIndex = getPaneIndex(indicator);

    const series = chartRef.current.addSeries(
      SeriesType,
      {
        ...options,
        priceScaleId: `pane_${paneIndex}`,
      },
      paneIndex,
    );

    return series;
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
      case "RSI":
        return "RSI";
      case "MACD":
        return "MACD";
      case "Volume":
        return "volume";
      case "ATR":
        return "ATR";
      case "Aroon":
        return "Aroon";
      case "AroonOscillator":
        return "AroonOscillator";
      default:
        return "momentum";
    }
  }

  function cleanupPane(paneKey) {
    const pane = panesRef.current[paneKey];
    if (!pane) return;

    const stillUsed = Object.entries(indicatorSeriesRef.current).some(
      ([indicatorKey, series]) => {
        if (!series || indicatorKey.startsWith("_")) return false;
        return resolvePaneKey(indicatorKey) === paneKey;
      },
    );

    if (stillUsed) return;

    try {
      /* REMOVE DOM ELEMENT */
      if (pane.div && pane.div.parentNode) {
        pane.div.parentNode.removeChild(pane.div);
      }

      /* REMOVE SPLITTER */
      if (pane.splitter && pane.splitter.parentNode) {
        pane.splitter.parentNode.removeChild(pane.splitter);
      }
    } catch (e) {
      console.error("Pane cleanup error:", e);
    }

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

    /* MULTI SERIES */
    if (entry && typeof entry === "object" && !entry.priceScale) {
      Object.values(entry).forEach((series) => {
        if (!series) return;
        if (typeof series.setData !== "function") return;

        try {
          chart.removeSeries(series);
        } catch {}
      });
    } else {
      /* SINGLE SERIES */

      try {
        chart.removeSeries(entry);
      } catch {}
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

  const toggleIndicator = useCallback((indicator) => {
    setSelectedIndicator((prev) => {
      const alreadySelected = prev.includes(indicator);

      if (alreadySelected) {
        const entry = indicatorSeriesRef.current[indicator];

        if (!entry) {
          return prev.filter((i) => i !== indicator);
        }

        const paneKey = resolvePaneKey(indicator);
        const pane = panesRef.current[paneKey];
        const chart = pane?.chart ?? chartRef.current;

        if (!chart) return prev;

        const seriesList = Array.isArray(entry)
          ? entry
          : typeof entry === "object" && !entry.setData
            ? Object.values(entry)
            : [entry];

        seriesList.forEach((series) => {
          if (!series) return;

          try {
            chart.removeSeries(series);
          } catch (e) {}
        });

        delete indicatorSeriesRef.current[indicator];
        delete latestIndicatorValuesRef.current[indicator];

        cleanupPane(paneKey);

        return prev.filter((i) => i !== indicator);
      }

      return [...prev, indicator];
    });
  }, []);
  /* =========================================================
RENDER INDICATOR VALUE
========================================================= */

  const renderValue = (indicator, value) => {
    if (value == null) return "--";

    /* ================= SINGLE VALUE ================= */

    if (typeof value === "number") {
      const style =
        indicatorStyle?.[indicator]?.sma || indicatorStyle?.[indicator]?.ma;

      if (style?.visible === false) return null;

      const color = style?.color || "#333";

      return <span style={{ color }}>{value.toFixed(2)}</span>;
    }

    /* ================= MULTI VALUE ================= */

    if (typeof value === "object") {
      let keys = [];

      if (indicator === "RSI") {
        keys = ["rsi", "smoothingMA"];
      } else if (indicator === "IchimokuCloud") {
        keys = [
          "conversionLine",
          "baseLine",
          "leadLine1",
          "leadLine2",
          "laggingSpan",
          "kumoCloudUpper",
          "kumoCloudLower",
        ];
      } else {
        keys = Object.keys(value);
      }

      return keys
        .filter((key) => {
          const style = indicatorStyle?.[indicator]?.[key];

          if (style?.visible === false) return false;

          return value[key] != null;
        })
        .map((key) => {
          const val = value[key];

          const color = indicatorStyle?.[indicator]?.[key]?.color || "#333";

          return (
            <span key={key} style={{ marginRight: 8, color }}>
              {Number.isFinite(val) ? val.toFixed(2) : "--"}
            </span>
          );
        });
    }

    return "--";
  };

  const renderIndicators = () => {
    return selectedIndicator.map((indicator) => {
      const normalizedType = indicator.replace(/[\s/]+/g, "");

      const Component = indicatorComponents[normalizedType];
      // console.log(Component, indicator, "dataaaaaa");

      if (!Component) return null;

      const data = indicatorSeriesRef.current[normalizedType];
      // console.log(data, "dataaaaaa");

      if (!data) return null;

      return (
        <Component
          key={normalizedType}
          result={data.result}
          rows={data.rows}
          indicatorStyle={indicatorStyle}
          indicatorSeriesRef={indicatorSeriesRef}
          addSeries={addSeries}
          chartRef={chartRef}
          indicatorConfigs={indicatorConfigs}
        />
      );
    });
  };

  /* =========================================================
SYNC CROSSHAIR
========================================================= */

  const updateIndicatorValues = (param) => {
    const updates = {};

    Object.entries(indicatorSeriesRef.current).forEach(([indicator, group]) => {
      if (!group) return;

      const indicatorValues = {};

      Object.entries(group).forEach(([lineName, series]) => {
        if (
          lineName === "_priceLines" ||
          lineName === "overboughtArea" ||
          lineName === "oversoldArea"
        )
          return;

        const price = param.seriesData?.get(series);

        if (price !== undefined) {
          const value = typeof price === "object" ? price.value : price;

          indicatorValues[lineName] = value;
        }
      });

      if (Object.keys(indicatorValues).length === 1) {
        updates[indicator] = Object.values(indicatorValues)[0];
      } else if (Object.keys(indicatorValues).length > 0) {
        updates[indicator] = indicatorValues;
      }
    });

    if (Object.keys(updates).length > 0) {
      /* store latest values */
      latestIndicatorValuesRef.current = updates;

      /* update UI */
      setLiveIndicatorData(updates);
    }
  };

  /* =========================================================
ATTACH CROSSHAIR
========================================================= */

  const attachCrosshair = useCallback((chart, chartKey) => {
    if (!chart) return () => {};

    const handler = (param) => {
      if (!param?.point || param.time === undefined) {
        const charts = [
          chartRef.current,
          ...Object.values(panesRef.current).map((p) => p.chart),
        ];

        charts.forEach((c) => c?.clearCrosshairPosition?.());

        /* restore latest indicator values */
        if (latestIndicatorValuesRef.current) {
          setLiveIndicatorData(latestIndicatorValuesRef.current);
        }

        return;
      }

      /* ================= SYNC ALL CHARTS ================= */

      const charts = [
        chartRef.current,
        ...Object.values(panesRef.current).map((p) => p.chart),
      ];

      charts.forEach((c) => {
        if (!c) return;

        c.setCrosshairPosition(
          param.point?.x ?? 0,
          param.point?.y ?? 0,
          param.time,
        );
      });

      /* ================= UPDATE CANDLE ================= */

      if (seriesRef.current) {
        const candle = param.seriesData?.get(seriesRef.current);

        if (candle) {
          setLiveOhlcv({
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          });
        }
      }

      /* ================= UPDATE INDICATORS ================= */

      updateIndicatorValues(param);
    };

    chart.subscribeCrosshairMove(handler);

    return () => chart.unsubscribeCrosshairMove(handler);
  }, []);

  /* =========================================================
ATTACH MAIN CHART
========================================================= */

  useEffect(() => {
    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ];

    const detachers = charts
      .filter(Boolean)
      .map((chart) => attachCrosshair(chart));

    return () => detachers.forEach((detach) => detach());
  }, [attachCrosshair]);

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
          );
        }
        HollowCandlesData();
        break;

      default:
        async function fetchCandleStickData() {
          setIndicatorLoading(true); // START LOADER

          try {
            const response = await fetchDataByCurrency(
              selectedCurrency,
              timeframeValue,
              chartType,
            );

            seriesRef.current = chartRef.current.addSeries(
              CandlestickSeries,
              chartSeriesStyles.candlestick,
            );

            if (response) {
              console.log(response, "response");
              seriesRef?.current?.setData(response.data);
            }

            chartRef.current.timeScale().fitContent();

            await fetchIndicatorData(
              selectedIndicator,
              selectedCurrency,
              timeframeValue,
            );
          } catch (err) {
            console.error("Chart load error", err);
          } finally {
            setIndicatorLoading(false); // STOP LOADER
          }
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

  const { fetchDataByCurrency, fetchIndicatorData } = useChartFunctions({
    chartRef,
    addSeries,
    indicatorSeriesRef,
    indicatorStyle,
    latestIndicatorValuesRef,
    indicatorConfigs,
  });

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
    <>
      <section className="trading-view-wrapper">
        <div className="container-fluid p-0 m-0">
          <div className="row">
            <div className="col-md-12">
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

          <div className="row">
            {/* <div className="col-md-1 p-0 m-0"> */}
            {/* <ChartLeftSidebar
                chartRef={chartRef}
                containerRef={containerRef}
              /> */}

            {indicatorLoading && (
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
            {renderIndicators()}
          </div>
          <div className="col-md-7">
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
                        C:{" "}
                        <span className={valueColor}>{liveOhlcv?.close}</span>
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
                      const normalizedType = indicator.replace(/[\s/]+/g, "");
                      const value = liveIndicatorData[normalizedType];
                      return (
                        <div
                          key={index}
                          className="flex w-full justify-between items-center gap-3 bg-white shadow-sm border border-slate-200 rounded-3 px-3 h-8 text-xs "
                        >
                          <span className="font-medium w-full text-slate-800 flex items-center gap-2">
                            {indicator} : {timeframeValue} :
                            <span style={{ display: "flex", gap: 6 }}>
                              {renderValue(normalizedType, value)}
                            </span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              title={
                                indicatorVisibility[normalizedType]
                                  ? "Hide Indicator"
                                  : "Show Indicator"
                              }
                              onClick={() =>
                                toggleIndicatorVisibility(normalizedType)
                              }
                              className="text-slate-600"
                            >
                              {indicatorVisibility[normalizedType] ? (
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

                            {/* <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <button className="text-slate-500 hover:text-slate-800">
                                    <FiMoreHorizontal size={18} />
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
                              </DropdownMenu.Root> */}
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

              {/* {selectedIndicator.map((indicator, index) => {
                const value = liveIndicatorData[indicator];

                const paneIndex = paneIndexRef.current[indicator];

                if (paneIndex === undefined || paneIndex === 0) return null;

                return (
                  <IndicatorBar
                    key={indicator}
                    indicator={indicator}
                    timeframeValue={timeframeValue}
                    value={value}
                    renderValue={renderValue}
                    indicatorVisibility={indicatorVisibility}
                    toggleIndicatorVisibility={toggleIndicatorVisibility}
                    removeIndicator={removeIndicator}
                    setActiveBarIndicator={setActiveBarIndicator}
                    setIndicatorProperty={setIndicatorProperty}
                    setActiveSourceIndicator={setActiveSourceIndicator}
                    setShowSourcePanel={setShowSourcePanel}
                    setShowAlertForm={setShowAlertForm}
                  />
                );
              })} */}
            </div>
          </div>
          <div className="col-md-3">
            <ChartRightSidebar />
          </div>
        </div>
        {/* </div> */}

        <SourceCodePanel
          show={showSourcePanel}
          indicator={activeSourceIndicator}
          onClose={() => setShowSourcePanel(false)}
        />

        {/* -------------------------market part start here-------------------- */}
      </section>

      <section className="market-trading-part">
        <div className="container p-0 m-0">
          <div className="row">
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

            {/* ------------------------------------------indicator sub part property show in modal------------------------------- */}

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
              chartRef={chartRef}
              addSeries={addSeries}
              latestIndicatorValuesRef={latestIndicatorValuesRef}
            />
          </div>
        </div>
      </section>

      <div className="">
        {/* <IndicatorRuleBuilder /> */}
        <IndicatorBuildingListing
          selectedCurrency={selectedCurrency}
          timeframeValue={timeframeValue}
        />
      </div>
    </>
  );
}
