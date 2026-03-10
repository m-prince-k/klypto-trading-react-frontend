import { useEffect, useState } from "react";
import { FiBarChart2, FiActivity } from "react-icons/fi";
import * as XLSX from "xlsx";

import {
  MdCandlestickChart,
  MdShowChart,
  MdStackedLineChart,
  MdWaterfallChart,
} from "react-icons/md";

export const ChartProprties = {
  width: 1300,
  height: 600,

  layout: {
    background: { type: "solid", color: "#ffffff" },
    textColor: "#334155",
    fontSize: 12,
    fontFamily: "Inter, sans-serif",
  },

  localization: {
    priceFormatter: (price) => price.toFixed(2), // TV-like formatting
  },

  timeScale: {
    timeVisible: true,
    secondsVisible: false,

    borderColor: "#e2e8f0",

    rightBarStaysOnScroll: true,
    rightBarStaysOnScale: true,

    rightBarSpacing: 80, // ✅ Future space
    barSpacing: 10, // Slightly tighter like TV

    minBarSpacing: 5, // Prevent over-zoom crush
    fixLeftEdge: false,
    fixRightEdge: false,

    lockVisibleTimeRangeOnResize: true,
    rightEdgeStaysOnScroll: true,
  },

  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
    horzTouchDrag: true,
    vertTouchDrag: true,
  },

  handleScale: {
    mouseWheel: true,
    pinch: true,
    axisPressedMouseMove: true,
    axisDoubleClickReset: true, // ✅ TV behaviour
  },

  kineticScroll: {
    mouse: true, // ✅ Smooth inertial scrolling like TV
    touch: true,
  },

  rightPriceScale: {
    visible: true,
    borderColor: "#e2e8f0",

    scaleMargins: {
      top: 0.1, // TV-like tighter margins
      bottom: 0.1,
    },

    autoScale: true,
    mode: 0, // Normal (NOT log)
    alignLabels: true,
    entireTextOnly: true,
  },

  grid: {
    vertLines: {
      visible: true,
      color: "#f1f5f9",
      style: 0,
    },
    horzLines: {
      visible: true,
      color: "#f1f5f9",
      style: 0,
    },
  },

  crosshair: {
    mode: 1, // Normal crosshair

    vertLine: {
      visible: true,
      labelVisible: true,
      color: "#94a3b8",
      width: 1,
      style: 2, // Dotted like TV
    },

    horzLine: {
      visible: true,
      labelVisible: true,
      color: "#94a3b8",
      width: 1,
      style: 2,
    },
  },
  attributionLogo: false,

  interaction: {
    mode: 0, // Normal interaction
  },
};

export function getIndicatorChartProperties(height = 140, width = 1280) {
  return {
    ...ChartProprties,
    height,
    width,
    layout: { ...ChartProprties.layout },

    timeScale: {
      ...ChartProprties.timeScale,
      visible: false,
      borderVisible: false,
    },

    rightPriceScale: {
      ...ChartProprties.rightPriceScale,
      visible: true,
      scaleMargins: { top: 0.1, bottom: 0.1 },
    },

    grid: { ...ChartProprties.grid },
    crosshair: { ...ChartProprties.crosshair },
  };
}
export const MiniChartProprties = {
  width: 620, // small footprint for hover
  height: 280,

  layout: {
    background: { type: "solid", color: "#ffffff" },
    textColor: "#64748b",
    fontSize: 11,
    fontFamily: "Inter, sans-serif",
  },

  grid: {
    vertLines: { visible: false },
    horzLines: { visible: false },
  },

  crosshair: {
    mode: 0, // Normal crosshair (can disable entirely if desired)
  },

  rightPriceScale: {
    visible: false, // hide price scale
    borderVisible: false,
  },

  leftPriceScale: {
    visible: false,
    borderVisible: false,
  },

  timeScale: {
    visible: false, // hide time axis
    borderVisible: false,
    secondsVisible: false,
  },

  handleScroll: false, // 🔴 disable interactions
  handleScale: false,

  kineticScroll: {
    mouse: false,
    touch: false,
  },

  trackingMode: {
    exitMode: 0,
  },

  localization: {
    priceFormatter: (price) =>
      price.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
  },
};

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after a delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if the value changes again within the delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Rerun effect if value or delay changes

  return debouncedValue;
}

export const TIMEFRAME_TO_SECONDS = {
  "1m": 60,
  "3m": 180,
  "5m": 300,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "2h": 7200,
  "4h": 14400,
  "6h": 21600,
  "1d": 86400,
  "1w": 604800,
};

export const SINGLE_VALUE_CHARTS = ["line", "area", "baseline", "histogram"];

export const chartOptions = [
  { value: "candlestick", label: "Candlestick", icon: MdCandlestickChart },
  { value: "line", label: "Line", icon: MdShowChart },
  { value: "bar", label: "Bar", icon: FiBarChart2 },
  { value: "area", label: "Area", icon: MdStackedLineChart },
  { value: "baseline", label: "Baseline", icon: FiActivity },
  { value: "hollowcandles", label: "Hollow Candles", icon: MdWaterfallChart },
  { value: "heikinashi", label: "Heikin Ashi", icon: MdCandlestickChart },
  { value: "histogram", label: "Histogram", icon: FiBarChart2 },
];

export const getSeriesColor = (series) => {
  if (!series || !series.options) return "#999";

  return series.options().color || "#999";
};

export const chartSeriesStyles = {
  candlestick: {
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderUpColor: "#22c55e",
    borderDownColor: "#ef4444",
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  },

  hollowcandles: {
    upColor: "transparent",
    downColor: "#ef4444",
    borderUpColor: "#22c55e",
    borderDownColor: "#ef4444",
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  },

  line: {
    color: "#fffc50",
  },

  bar: {
    upColor: "#22c55e",
    downColor: "#ef4444",
  },

  area: {
    topColor: "rgba(56, 189, 248, 0.4)",
    bottomColor: "rgba(56, 189, 248, 0.0)",
    lineColor: "#38bdf8",
  },

  baseline: {
    topLineColor: "rgba(34,197,94,1)",
    topFillColor1: "rgba(34,197,94,0.4)",
    topFillColor2: "rgba(34,197,94,0.05)",

    bottomLineColor: "rgba(239,68,68,1)",
    bottomFillColor1: "rgba(239,68,68,0.4)",
    bottomFillColor2: "rgba(239,68,68,0.05)",
  },

  histogram: {
    color: "#22c55e",

    priceFormat: { type: "volume" },
    priceScaleId: "volume",
    scaleMargins: {
      top: 0.7,
      bottom: 0,
    },
    lastValueVisible: true,
  },
};

export const OPERATORS = [
  { label: "Greater Than (>)", value: ">" },
  { label: "Less Than (<)", value: "<" },
  { label: "Greater Than or Equal (≥)", value: ">=" },
  { label: "Less Than or Equal (≤)", value: "<=" },
  { label: "Equal (=)", value: "=" },
  { label: "Not Equal (≠)", value: "!=" },
  { label: "Crosses Above ⤴", value: "crosses_above" },
  { label: "Crosses Below ⤵", value: "crosses_below" },
  { label: "Rising ↗", value: "rising" },
  { label: "Falling ↘", value: "falling" },
  { label: "Between ⇄", value: "between" },
];

export const convertToHeikinAshi = (data) => {
  if (!data.length) return [];

  let prevOpen = data[0].open;
  let prevClose = data[0].close;

  return data.map((candle) => {
    const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;

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

export const scanCategories = [
  { id: 1, key: "range_breakouts", label: "Range Breakouts scan" },
  { id: 2, key: "fundamental", label: "Fundamental Scans" },
  { id: 3, key: "bullish", label: "Bullish scan" },
  { id: 4, key: "bearish", label: "Bearish scan" },
  { id: 5, key: "intraday_bullish", label: "Intraday Bullish scan" },
  { id: 6, key: "intraday_bearish", label: "Intraday Bearish scan" },
  { id: 7, key: "crossover", label: "Crossover" },
  { id: 8, key: "other", label: "Other Scans" },
];

export function handleExcelDownload(rows) {
  if (!rows || rows.length === 0) {
    alert("No data to export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stocks");

  XLSX.writeFile(workbook, "stocks.xlsx");
}

export function handleCSVDownload(rows) {
  if (!rows || rows.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","),

    ...rows.map((row) =>
      headers
        .map((key) => {
          const value = row[key] ?? "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "stocks.csv";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function handleCopy(rows = null) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]).join("\t");

  const body = rows.map((row) => Object.values(row).join("\t")).join("\n");

  const text = headers + "\n" + body;

  navigator.clipboard.writeText(text);

  alert("Copied to clipboard ✔");
}

export const getRowsByIndicator = (indicator) => {
  switch (indicator) {
    case "RSI":
      return [
        { key: "rsi", label: "RSI", type: "line" },
        {
          key: "smoothingMA",
          label: "Smoothing MA",
          type: "line",
        },

        { key: "upper", label: "RSI Upper Band", value: 70, },

        {
          key: "middle",
          label: "RSI Middle Band",
          value: 50,
          color: "#9e9e9e",
        },

        { key: "lower", label: "RSI Lower Band", value: 30,  },

        {
  key: "bandFill",
  label: "RSI Background Fill",
  type: "fill",
  topFillColor1: "rgba(140,120,255,0.05)",
  topFillColor2: "rgba(140,120,255,0.05)",
},
        {
          key: "obFill",
          label: "Overbought Gradient Fill",
          type: "fill",
          topFillColor1: "rgba(38,166,154,0.5)",
          topFillColor2: "rgba(38,166,154,0.1)",
        },

        {
          key: "osFill",
          label: "Oversold Gradient Fill",
          type: "fill",
          bottomFillColor1: "rgba(239,83,80,0.5)",
          bottomFillColor2: "rgba(239,83,80,0.1)",
        },
      ];
    case "SMA":
      return [
        { key: "ma", label: "MA", type: "line" },
      ];

    case "EMA":
      return [{ key: "ema", label: "EMA", type: "line" }];
    case "WMA":
      return [{ key: "wma", label: "WMA", type: "line" }];
    case "HMA":
      return [{ key: "hma", label: "HMA", type: "line" }];

    case "DEMA":
      return [{ key: "dema", label: "DEMA", type: "line" }];

    case "TEMA":
      return [{ key: "tema", label: "TEMA", type: "line" }];
    case "KAMA":
      return [{ key: "kama", label: "KAMA", type: "line" }];
    case "Ichimoku Cloud":
      return [
        { key: "conversionLine", label: "Conversion Line", type: "line" },
        { key: "baseLine", label: "Base Line", type: "line" },
        { key: "laggingSpan", label: "Lagging Span", type: "line" },
        { key: "leadingSpanA", label: "Leading Span A", type: "line" },
        { key: "leadingSpanB", label: "Leading Span B", type: "line" },
        { key: "kumoUpper", label: "Kumo Upper Line", type: "line" },
        { key: "kumoLower", label: "Kumo Lower Line", type: "line" },
        {
          key: "cloudFill",
          label: "Cloud Fill",
          type: "area",
          color0: "rgba(38,166,154,0.4)",

          color1: "rgba(239,83,80,0.4)",
        },
      ];

    case "Parabolic SAR":
      return [{ key: "parabolicSAR", label: "Parabolic SAR", type: "line" }];

    case "SuperTrend":
      return [
        { key: "upTrend", label: "Up Trend", type: "line", color: "#26a69a" },
        {
          key: "downTrend",
          label: "Down Trend",
          type: "line",
          color: "#ef5350",
        },
        {
          key: "bodyMiddle",
          label: "Body Middle",
          type: "line",
          color: "#ffffff",
        },
        {
          key: "upTrendBg",
          label: "Up Trend Background",
          type: "area",
          color0: "rgba(38,166,154,0.2)",
          color1: "rgba(38,166,154,0.2)",
        },
        {
          key: "downTrendBg",
          label: "Down Trend Background",
          type: "area",
          color0: "rgba(239,83,80,0.2)",
          color1: "rgba(239,83,80,0.2)",
        },
      ];

    case "Aroon":
      return [
        { key: "aroonUp", label: "Aroon Up", type: "line", color: "#26a69a" },
        {
          key: "aroonDown",
          label: "Aroon Down",
          type: "line",
          color: "#ef5350",
        },
      ];

    case "Aroon Oscillator":
      return [
        {
          key: "oscillator",
          label: "Oscillator",
          type: "line",
          color0: "#26a69a",
          color1: "#ef5350",
        },
        {
          key: "center",
          label: "Center Line",
          type: "line",
          color: "#9e9e9e",
          showValue: true,
          value: 0,
        },
        {
          key: "upperLevel",
          label: "Upper Level",
          type: "line",
          color: "#ff9800",
          showValue: true,
          value: 90,
        },
        {
          key: "lowerLevel",
          label: "Lower Level",
          type: "line",
          color: "#03a9f4",
          showValue: true,
          value: -90,
        },
        {
          key: "oscillatorFill",
          label: "Oscillator Fill",
          type: "area",
          color0: "rgba(38,166,154,0.2)",
          color1: "rgba(239,83,80,0.2)",
        },
      ];
    case "ADX":
      return [{ key: "adx", label: "ADX", type: "line" }];

    case "Chande Kroll Stop":
      return [
        {
          key: "stopLong",
          label: "Stop Long",
          type: "line",
          color: "#26a69a",
        },
        {
          key: "stopShort",
          label: "Stop Short",
          type: "line",
          color: "#ef5350",
        },
      ];

    case "Stochastic":
      return [
        { key: "kLine", label: "%K", type: "line", color: "#26a69a" },
        { key: "dLine", label: "%D", type: "line", color: "#ff9800" },

        {
          key: "upperBand",
          label: "Upper Band",
          type: "band",
          showValue: true,
          value: 80,
          color: "#ef5350",
        },
        {
          key: "middleBand",
          label: "Middle Band",
          type: "band",
          showValue: true,
          value: 50,
          color: "#9e9e9e",
        },
        {
          key: "lowerBand",
          label: "Lower Band",
          type: "band",
          showValue: true,
          value: 20,
          color: "#26a69a",
        },

        {
          key: "bgFill",
          label: "Stochastic Background Fill",
          type: "fill",
          color0: "rgba(38,166,154,0.05)",
          color1: "rgba(38,166,154,0.05)",
        },
      ];

    case "Stochastic RSI":
      return [
        { key: "kLine", label: "%K", type: "line", color: "#26a69a" },
        { key: "dLine", label: "%D", type: "line", color: "#ff9800" },

        {
          key: "upperBand",
          label: "Upper Band",
          type: "band",
          showValue: true,
          value: 80,
          color: "#ef5350",
        },
        {
          key: "middleBand",
          label: "Middle Band",
          type: "band",
          showValue: true,
          value: 50,
          color: "#9e9e9e",
        },
        {
          key: "lowerBand",
          label: "Lower Band",
          type: "band",
          showValue: true,
          value: 20,
          color: "#26a69a",
        },
        {
          key: "bgFill",
          label: "StochRSI Background Fill",
          type: "fill",
          color0: "rgba(38,166,154,0.05)",
          color1: "rgba(38,166,154,0.05)",
        },
      ];

    case "MACD":
      return [
        {
          key: "macdLine",
          label: "MACD Line",
          type: "line",
          color: "#26a69a",
        },

        {
          key: "signalLine",
          label: "Signal Line",
          type: "line",
          color: "#ff9800",
        },

        // Histogram bars
        {
          key: "histogram",
          label: "Histogram",
          type: "histogram",
          color0: "#26a69a", // bullish
          color1: "#81c784", // light bullish
          color2: "#ef5350", // bearish
          color3: "#e57373", // light bearish
        },

        // Zero line
        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          value: 0,
          color: "#9e9e9e",
        },
      ];

    case "CCI":
      return [
        // Lines
        { key: "cciLine", label: "CCI", type: "line", color: "#26a69a" },
        {
          key: "cciMa",
          label: "CCI-based MA",
          type: "line",
          color: "#ff9800",
        },

        // Bands
        {
          key: "upperBand",
          label: "Upper Band",
          type: "band",
          showValue: true,
          value: 100,
          color: "#ef5350",
        },
        {
          key: "middleBand",
          label: "Middle Band",
          type: "band",
          showValue: true,
          value: 0,
          color: "#9e9e9e",
        },
        {
          key: "lowerBand",
          label: "Lower Band",
          type: "band",
          showValue: true,
          value: -100,
          color: "#26a69a",
        },

        // Background fill
        {
          key: "bgFill",
          label: "CCI Background Fill",
          type: "fill",
          color0: "rgba(38,166,154,0.05)",
          color1: "rgba(38,166,154,0.05)",
        },
      ];

    case "Momentum":
      return [{ key: "momentum", label: "Momentum", type: "line" }];

    case "ROC":
      return [
        { key: "momentum", label: "Momentum", type: "line" },
        // Zero line
        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          showValue: true,
          value: 0,
          color: "#9e9e9e",
        },
      ];

    case "Williams %R":
      return [
        // Lines
        { key: "r", label: "%R", type: "line", color: "#26a69a" },

        // Bands
        {
          key: "upperBand",
          label: "Upper Band",
          type: "band",
          showValue: true,
          value: -20,
          color: "#ef5350",
        },
        {
          key: "middleBand",
          label: "Middle Band",
          type: "band",
          showValue: true,
          value: -50,
          color: "#9e9e9e",
        },
        {
          key: "lowerBand",
          label: "Lower Band",
          type: "band",
          showValue: true,
          value: -80,
          color: "#26a69a",
        },

        // Background
        {
          key: "bg",
          label: "Background",
          type: "fill",
          color0: "rgba(38,166,154,0.05)",
          color1: "rgba(38,166,154,0.05)",
        },
      ];
    case "Ultimate Oscillator":
      return [
        {
          key: "ultimateoscillator",
          label: "Ultimate Oscillator",
          type: "line",
        },
      ];

    case "Awesome Oscillator":
      return [
        {
          key: "ao",
          label: "AO",
          type: "fill",
          color0: "rgba(38,166,154,0.05)",
          color1: "rgba(38,166,154,0.05)",
        },
      ];

    case "Chande Momentum Oscillator":
      return [
        // CMO line
        { key: "cmoLine", label: "CMO", type: "line", color: "#26a69a" },

        // Zero line
        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          value: 0,
          showValue: true,
          color: "#9e9e9e",
        },
      ];

    case "TRIX":
      return [
        // CMO line
        { key: "trixLine", label: "TRIX", type: "line", color: "#26a69a" },

        // Zero line
        {
          key: "zeroLine",
          label: "Zero ",
          type: "line",
          value: 0,
          showValue: true,
          color: "#9e9e9e",
        },
      ];
    case "Fisher Transform":
      return [
        // Lines
        {
          key: "fisherLine",
          label: "Fisher",
          type: "line",
          color: "#26a69a",
        },
        {
          key: "triggerLine",
          label: "Trigger",
          type: "line",
          color: "#ff9800",
        },

        // Reference Levels
        {
          key: "level1_5",
          label: "Level 1.5",
          type: "line",
          value: 1.5,
          color: "#ef5350",
        },
        {
          key: "level0_75",
          label: "Level 0.75",
          type: "line",
          value: 0.75,
          color: "#ffb74d",
        },
        {
          key: "level0",
          label: "Level 0",
          type: "line",
          value: 0,
          color: "#9e9e9e",
        },
        {
          key: "level_minus0_75",
          label: "Level -0.75",
          type: "line",
          value: -0.75,
          color: "#81c784",
        },
        {
          key: "level_minus1_5",
          label: "Level -1.5",
          type: "line",
          value: -1.5,
          color: "#26a69a",
        },
      ];
    case "Klinger Oscillator":
      return [
        // Klinger Oscillator line
        {
          key: "klingerLine",
          label: "Klinger Oscillator",
          type: "line",
          color: "#26a69a",
        },

        // Signal line
        {
          key: "signalLine",
          label: "Signal Line",
          type: "line",
          color: "#ff9800",
        },
      ];
    case "ATR":
      return [{ key: "atr", label: "ATR", type: "line" }];

    case "Keltner Channels":
      return [
        // Lines
        {
          key: "upper",
          label: "Upper Channel",
          type: "line",
          color: "#ef5350",
        },
        { key: "basis", label: "Basis Line", type: "line", color: "#26a69a" },
        {
          key: "lower",
          label: "Lower Channel",
          type: "line",
          color: "#26a69a",
        },
        {
          key: "bg",
          label: "Background ",
          type: "fill",
          color0: "rgba(38,166,154,0.1)", // color under bullish trend
          color1: "rgba(239,83,80,0.1)", // color under bearish trend
        },
      ];
    case "Bollinger Bands":
      return [
        // Lines
        {
          key: "upper",
          label: "Upper Channel",
          type: "line",
          color: "#ef5350",
        },
        { key: "basis", label: "Basis Line", type: "line", color: "#26a69a" },
        {
          key: "lower",
          label: "Lower Channel",
          type: "line",
          color: "#26a69a",
        },
        {
          key: "bg",
          label: "Background ",
          type: "fill",
          color0: "rgba(38,166,154,0.1)", // color under bullish trend
          color1: "rgba(239,83,80,0.1)", // color under bearish trend
        },
      ];
    case "Bollinger Band Width":
      return [
        // Lines
        {
          key: "bollingerBandWidth",
          label: "Bollinger Band Width",
          type: "line",
          color: "#ef5350",
        },
        {
          key: "highestExpansion",
          label: "Highest Expansion",
          type: "line",
          color: "#26a69a",
        },
        {
          key: "lowestContraction",
          label: "Lowest Contraction",
          type: "line",
          color: "#26a69a",
        },
      ];

    case "Donchian Channels":
      return [
        // Lines
        {
          key: "upper",
          label: "Upper Channel",
          type: "line",
          color: "#ef5350",
        },
        { key: "basis", label: "Basis Line", type: "line", color: "#26a69a" },
        {
          key: "lower",
          label: "Lower Channel",
          type: "line",
          color: "#26a69a",
        },
        {
          key: "bg",
          label: "Background ",
          type: "fill",
          color0: "rgba(38,166,154,0.1)", // color under bullish trend
          color1: "rgba(239,83,80,0.1)", // color under bearish trend
        },
      ];

    case "Choppiness Index":
      return [
        // Lines
        {
          key: "chopLine",
          label: "Chop",
          type: "line",
          color: "#ef5350",
        },
        {
          key: "upper",
          label: "Upper Band",
          type: "line",
          color: "#ef5350",
          showValue: true,
          value: 61.8,
        },
        {
          key: "middle",
          label: "Middle Band",
          type: "line",
          color: "#26a69a",
          showValue: true,
          value: 50,
        },
        {
          key: "lower",
          label: "Lower Band",
          type: "line",
          color: "#26a69a",
          showValue: true,
          value: 38.2,
        },
        {
          key: "bg",
          label: "Background ",
          type: "fill",
          color: "rgba(38,166,154,0.1)",
        },
      ];

    case "Standard Deviation":
      return [
        // Lines
        {
          key: "plotLine",
          label: "Plot",
          type: "line",
          color: "#ef5350",
        },
      ];

    case "Volume":
      return [
        {
          key: "volumeBars",
          label: "Volume Bars",
          type: "bars",
          colorUp: "#26a69a", // growing volume
          colorDown: "#ef5350", // falling volume
          colorByPrevious: true, // toggle for coloring based on previous bar
        },

        // Volume MA line
        {
          key: "volumeMA",
          label: "Volume MA",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: false, // by default unchecked
        },
      ];

    case "Historical Volatility":
      return [
        // HV Line
        {
          key: "hv",
          label: "HV",
          type: "line",
          color: "#1890ff",
          width: 2,
          visible: false, // default unchecked
        },
      ];

    case "OBV":
      return [
        // VIX Line
        {
          key: "obv",
          label: "On Balance Volume",
          type: "line",
          color: "#ff4d4f",
          width: 2,
        },
      ];

    case "Percentage Volume Oscillator":
      return [
        // Histogram (multi-state coloring)
        {
          key: "histogram",
          label: "Histogram",
          type: "histogram",

          // 5 color states
          color0: "#26a69a", // strong positive
          color1: "#80cbc4", // weak positive
          color2: "#b0bec5", // near zero
          color3: "#ff8a80", // weak negative
          color4: "#ef5350", // strong negative

          visible: true,
        },

        // PVO Line
        {
          key: "pvo",
          label: "PVO",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },

        // Signal Line
        {
          key: "signal",
          label: "Signal",
          type: "line",
          color: "#ff6d00",
          width: 2,
          visible: true,
        },

        // Zero Line
        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          value: 0, // fixed level
          color: "#9e9e9e",
          width: 1,
          lineStyle: 2, // optional: dashed
          visible: true,
        },
      ];

    case "Accumulation / Distribution":
      return [
        // PVO Line
        {
          key: "accumulationDistribution",
          label: "Accumulation / Distribution",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },
      ];

    case "Chaikin Money Flow":
      return [
        {
          key: "cmf",
          label: "CMF",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },
        // Zero Line
        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          value: 0, // fixed level
          color: "#9e9e9e",
          width: 1,
          visible: true,
        },
      ];

    case "MFI":
      return [
        // MFI Line
        {
          key: "mf",
          label: "MFI",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },

        // Overbought Band
        {
          key: "upper",
          label: "Overbought",
          type: "band",
          value: 80,
          showValue: true,
          color: "#ef5350",
        },

        // Middle Band
        {
          key: "middle",
          label: "Middle Band",
          type: "band",
          value: 50,
          showValue: true,
          color: "#9e9e9e",
        },

        // Oversold Band
        {
          key: "lower",
          label: "Oversold",
          type: "band",
          value: 20,
          showValue: true,
          color: "#26a69a",
        },

        // Background
        {
          key: "bg",
          label: "Background",
          type: "fill",
          visible: true,
          topColor: "rgba(239,83,80,0.08)", // overbought zone
          bottomColor: "rgba(38,166,154,0.08)", // oversold zone
        },
      ];
    case "Ease of Movement":
      return [
        // EOM Line
        {
          key: "eom",
          label: "EOM",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },
      ];

    case "Negative Volume Index":
      return [
        // EOM Line
        {
          key: "nvi",
          label: "NVI",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },
      ];

    case "Positive Volume Index":
      return [
        // EOM Line
        {
          key: "nvi",
          label: "PVI",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },

        // Maxima Line
        {
          key: "nviBasedema",
          label: "PVI Based EMA",
          type: "line",
          color: "#26a69a",
          width: 1,
          visible: true,
        },
      ];

    case "VWAP":
      return [
        // Main VWAP Line
        {
          key: "vwap",
          label: "VWAP",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },

        // ===== Band #1 =====
        {
          key: "upperBand1",
          label: "Upper Band #1",
          type: "line",
          color: "#26a69a",
          width: 1,
          visible: true,
        },
        {
          key: "lowerBand1",
          label: "Lower Band #1",
          type: "line",
          color: "#26a69a",
          width: 1,
          visible: true,
        },
        {
          key: "bandFill1",
          label: "Bands Fill #1",
          type: "fill",
          color: "rgba(38,166,154,0.08)",
          visible: true,
          upperKey: "upperBand1",
          lowerKey: "lowerBand1",
        },

        // ===== Band #2 =====
        {
          key: "upperBand2",
          label: "Upper Band #2",
          type: "line",
          color: "#ff9800",
          width: 1,
          visible: false,
        },
        {
          key: "lowerBand2",
          label: "Lower Band #2",
          type: "line",
          color: "#ff9800",
          width: 1,
          visible: false,
        },
        {
          key: "bandFill2",
          label: "Bands Fill #2",
          type: "fill",
          color: "rgba(255,152,0,0.08)",
          visible: false,
          upperKey: "upperBand2",
          lowerKey: "lowerBand2",
        },

        // ===== Band #3 =====
        {
          key: "upperBand3",
          label: "Upper Band #3",
          type: "line",
          color: "#ef5350",
          width: 1,
          visible: false,
        },
        {
          key: "lowerBand3",
          label: "Lower Band #3",
          type: "line",
          color: "#ef5350",
          width: 1,
          visible: false,
        },
        {
          key: "bandFill3",
          label: "Bands Fill #3",
          type: "fill",
          color: "rgba(239,83,80,0.08)",
          visible: false,
          upperKey: "upperBand3",
          lowerKey: "lowerBand3",
        },
      ];
    case "Zig Zag":
      return [
        {
          key: "zigzagLine",
          label: "Lines",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true, // checked by default
        },
        {
          key: "paneLabels",
          label: "Pane Labels",
          type: "label",
          color: "#000000",
          backgroundColor: "rgba(41,98,255,0.15)",
          visible: true, // checked by default
        },
      ];

    default:
      return [];
  }
};

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
