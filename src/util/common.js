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
  height: 500,

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


export function getIndicatorChartProperties() {
  return {
    ...ChartProprties,
    height:140,
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

export const INDICATOR_COLORS = [
  "#fa15ae", // yellow
  "#438506", // pink
  "#34d399", // green
  "#a78bfa", // purple
  "#71e6fb", // blue
  "#f83838", // red
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
        { key: "rsi", label: "RSI", type: "line", color: "#26a69a" },
        { key: "rsiMa", label: "RSI-based MA", type: "line", color: "#ff9800" },

        { key: "upper", label: "RSI Upper Band", value: 70, color: "#ef5350" },
        {
          key: "middle",
          label: "RSI Middle Band",
          value: 50,
          color: "#9e9e9e",
        },
        { key: "lower", label: "RSI Lower Band", value: 30, color: "#26a69a" },
        // {
        //   key: "bgFill",
        //   label: "RSI Background Fill",
        //   type: "fill",
        //   color0: "rgba(38,166,154,0.1)",
        //   color1: "rgba(38,166,154,0.1)",
        // },
        {
          key: "obFill",
          label: "Overbought Gradient Fill",
          type: "fill",
          color0: "rgba(239,83,80,0.2)",
          color1: "rgba(239,83,80,0.4)",
        },
        {
          key: "osFill",
          label: "Oversold Gradient Fill",
          type: "fill",
          color0: "rgba(38,166,154,0.2)",
          color1: "rgba(38,166,154,0.4)",
        },
      ];

    default:
      return [];
  }
};
