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

export function getIndicatorChartProperties() {
  return {
    ...ChartProprties,
    height: 140,
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

export const symbols = [
  { label: "BTCUSDT", value: "BTCUSDT" },
  // { label: "ETHUSDT", value: "ETHUSDT" },
  // { label: "BNBUSDT", value: "BNBUSDT" },
  // { label: "SOLUSDT", value: "SOLUSDT" },
  // { label: "XRPUSDT", value: "XRPUSDT" },

  // { label: "ADAUSDT", value: "ADAUSDT" },
  // { label: "DOGEUSDT", value: "DOGEUSDT" },
  // { label: "DOTUSDT", value: "DOTUSDT" },
  // { label: "MATICUSDT", value: "MATICUSDT" },
  // { label: "LTCUSDT", value: "LTCUSDT" },

  // { label: "TRXUSDT", value: "TRXUSDT" },
  // { label: "AVAXUSDT", value: "AVAXUSDT" },
  // { label: "LINKUSDT", value: "LINKUSDT" },
  // { label: "ATOMUSDT", value: "ATOMUSDT" },
  // { label: "UNIUSDT", value: "UNIUSDT" },

  // { label: "ETCUSDT", value: "ETCUSDT" },
  // { label: "FILUSDT", value: "FILUSDT" },
  // { label: "ICPUSDT", value: "ICPUSDT" },
  // { label: "APTUSDT", value: "APTUSDT" },
  // { label: "ARBUSDT", value: "ARBUSDT" },

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
  {label: "Select Operation", value: "" },
 { label: "+", value: "+" },
  { label: "-", value: "-" },
  { label: "*", value: "*" },
  { label: "/", value: "/" },
  { label: "Greater Than (>)", value: ">" },
  { label: "Less Than (<)", value: "<" },
  { label: "Greater Than or Equal (≥)", value: ">=" },
  { label: "Less Than or Equal (≤)", value: "<=" },
  { label: "Equal (=)", value: "=" },
  { label: "Not Equal (≠)", value: "!=" },
  { label: "Crosses Above ⤴", value: "crosses_above" },
  { label: "Crosses Below ⤵", value: "crosses_below" },
];

export const convertToHeikinAshi = (data) => {
  if (!data || data.length === 0) return [];

  // console.log(data, "dataaaaaaaaaaaaa")
  let prevOpen;
  let prevClose;

  return data?.map((candle, i) => {
    const { open, high, low, close, time } = candle;

    const haClose = (open + high + low + close) / 4;

    let haOpen;

    if (i === 0) {
      // first candle
      haOpen = (open + close) / 2;
    } else {
      haOpen = (prevOpen + prevClose) / 2;
    }

    const haHigh = Math.max(high, haOpen, haClose);
    const haLow = Math.min(low, haOpen, haClose);

    prevOpen = haOpen;
    prevClose = haClose;

    return {
      time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
    };
  });
};

export const timeframeMap = {
  // ================= MINUTES =================
  "1 minute ago": "1m_ago",
  "one minute ago": "1m_ago",
  "minute ago": "1m_ago",
  "minutes ago": "1m_ago",

  "2 minutes ago": "2m_ago",
  "three minutes ago": "3m_ago",
  "3 minutes ago": "3m_ago",
  "5 minutes ago": "5m_ago",
  "10 minutes ago": "10m_ago",
  "15 minutes ago": "15m_ago",
  "30 minutes ago": "30m_ago",

  // ================= HOURS =================
  "1 hour ago": "1h_ago",
  "one hour ago": "1h_ago",
  "hour ago": "1h_ago",
  "hours ago": "1h_ago",

  "2 hours ago": "2h_ago",
  "3 hours ago": "3h_ago",
  "4 hours ago": "4h_ago",
  "6 hours ago": "6h_ago",
  "8 hours ago": "8h_ago",
  "12 hours ago": "12h_ago",

  // ================= DAYS =================
  "1 day ago": "1d_ago",
  "one day ago": "1d_ago",
  "day ago": "1d_ago",
  "days ago": "1d_ago",

  "2 days ago": "2d_ago",
  "3 day ago": "3d_ago",
  "3 days ago": "3d_ago",


  // ================= WEEKS =================
  "1 week ago": "1w_ago",
  "one week ago": "1w_ago",
  "week ago": "1w_ago",
  "weeks ago": "1w_ago",

  "2 weeks ago": "2w_ago",
  "3 weeks ago": "3w_ago",
  "4 weeks ago": "4w_ago",

  // ================= MONTHS =================
  "1 month ago": "1mth_ago",
  "one month ago": "1mth_ago",
  "month ago": "1mth_ago",
  "months ago": "1mth_ago",

  "2 months ago": "2mth_ago",
  "3 months ago": "3mth_ago",
  "6 months ago": "6mth_ago",
  "12 months ago": "12mth_ago",
};

export const operatorMap = {
  ">": ">",
  "<": "<",
  ">=": ">=",
  "<=": "<=",
  "=": "=",

  "greater than": ">",
  "is greater than": ">",
  "less than": "<",
  "is less than": "<",
  above: ">",
  below: "<",
  equals: "=",
  "is equal to": "=",

  /* ================= ARITHMETIC ================= */
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",

  add: "+",
  plus: "+",
  "added to": "+",

  subtract: "-",
  minus: "-",
  "less by": "-",

  multiply: "*",
  multiplied: "*",
  "multiplied by": "*",
  times: "*",

  divide: "/",
  divided: "/",
  "divided by": "/",
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


export let indicatorStyleDefault = {
    RSI: {
      rsi: {
        color: "rgba(38,166,154,1)",
        width: 2,
        visible: true,
      },
      smoothingMA: {
        color: "rgba(255,193,7,1)",
        width: 2,
        visible: true,
      },
      bbUpper: {
        color: "rgba(255,152,0,1)",
        width: 1,
        visible: true,
      },
      bbLower: {
        color: "rgba(255,152,0,1)",
        width: 1,
        visible: true,
      },
      bandFill: {
        visible: true,
        topFillColor1: "rgba(140,120,255,0.05)",
        topFillColor2: "rgba(140,120,255,0.05)",
      },

      obFill: {
        visible: true,
        topFillColor1: "rgba(38,166,106,0.1)",
        topFillColor2: "rgba(38,166,106,0.2)",
      },

      osFill: {
        visible: true,
        bottomFillColor1: "rgba(239,83,80,0.1)",
        bottomFillColor2: "rgba(239,83,80,0.4)",
      },

      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },
    KVO: {
      kvoLine: {
        color: "rgba(33,150,243,1)", // blue
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      signalLine: {
        color: "rgba(255,152,0,1)", // orange
        width: 2,
        lineStyle: 0,
        visible: true,
      },
    },
    SMA: {
      sma: {
        color: "rgba(0, 140, 255, 1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      smoothingMA: {
        visible: true,
        color: "rgba(255,202,28,1)",
        width: 1,
        lineStyle: 0,
      },
      bbUpper: {
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
      },
      bbLower: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },

    BBW: {
      bbwLine: {
        color: "rgba(33,150,243,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      highest: {
        color: "rgba(244,67,54,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },

      lowest: {
        color: "rgba(0,200,83,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },
    },

    STDDEV: {
      stddev: {
        color: "rgba(33,150,243,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
    },

    OBV: {
      obv: {
        color: "rgba(156,39,176,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      smoothingMA: {
        color: "rgba(255,193,7,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      bbUpper: {
        color: "rgba(0,200,83,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      bbLower: {
        color: "rgba(255,82,82,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },

    ICHIMOKU: {
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
        color: "rgba(130, 132, 141,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      kumoCloudLower: {
        color: "rgba(130, 132, 141,1)",
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
    CHOP: {
      chopLine: {
        visible: true,
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
      },

      upper: {
        value: 61.8,
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 2,
      },

      middle: {
        value: 50,
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
      },

      lower: {
        value: 38.2,
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
      },

      bg: {
        visible: true,
        topFillColor1: "rgba(38,166,154,0.15)",
        topFillColor2: "rgba(38,166,154,0.05)",
      },
    },
    ZIGZAG: {
      z: {
        color: "rgba(38,166,154,1)",
        width: 2,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },
    EMA: {
      ema: {
        color: "rgba(0,0,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
      smoothingMA: {
        visible: true,
        color: "rgba(255, 202, 28,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      bbUpper: {
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },

      bbLower: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },
    WMA: {
      wma: {
        color: "rgba(0,0,0,1)",
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
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
    },
    DEMA: {
      dema: {
        color: "rgba(0,0,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },
    TEMA: {
      tema: {
        color: "rgba(0,0,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },
    SUPERTREND: {
      upTrend: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      downTrend: {
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      bodyMiddle: {
        color: "rgba(100, 16, 236,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      upTrendBg: {
        topFillColor1: "rgba(38,166,154,0.2)",
        topFillColor2: "rgba(38,166,154,0.05)",
        visible: true,
      },
      downTrendBg: {
        topFillColor1: "rgba(239,83,80,0.2)",
        topFillColor2: "rgba(239,83,80,0.05)",
        visible: true,
      },
    },
    AROON: {
      aroonUp: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      aroonDown: {
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
    },
    AO: {
      oscillator: {
        visible: true,
        palette: {
          up: "rgba(38,166,154,1)", // bullish
          down: "rgba(239,83,80,1)", // bearish
        },
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      center: {
        visible: true,
        value: 0,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },
      upperLevel: {
        visible: true,
        value: 90,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },
      lowerLevel: {
        visible: true,
        value: -90,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },

      oscillatorFill: {
        visible: true,
        palette: {
          topFillColor1: "rgba(38,166,154,0.25)",
          topFillColor2: "rgba(239,83,80,0.25)",
        },
      },
    },
    ADX: {
      adx: {
        color: "rgba(250, 35, 6, 1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
    },
    CCI: {
      cciLine: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },

      cciMa: {
        color: "rgba(255,152,0,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },

      upperBand: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 100,
      },

      middleBand: {
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 0,
      },

      lowerBand: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: -100,
      },

      bgFill: {
        topFillColor1: "rgba(38,166,154,0.05)",
        topFillColor2: "rgba(38,166,154,0.05)",
        visible: true,
      },

      bbUpper: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      bbLower: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      bbFill: {
        topFillColor1: "rgba(33,150,243,0.15)",
        topFillColor2: "rgba(33,150,243,0.05)",
        visible: true,
      },
    },
    MOM: {
      momentum: {
        visible: true,
        color: "rgba(33, 150, 243, 1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
    },
    ROC: {
      roc: {
        color: "rgba(33,150,243,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      zeroLine: {
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 0,
      },
    },
    WPR: {
      r: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 2,
        lineStyle: 0,
        opacity: 100,
      },

      upperBand: {
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 2,
        value: -20,
      },
      middleBand: {
        visible: true,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        value: -50,
      },
      lowerBand: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
        value: -80,
      },
      bg: {
        visible: true,
        topFillColor1: "rgba(38,166,154,0.08)",
        topFillColor2: "rgba(38,166,154,0.02)",
      },
    },
    ATR: {
      atr: {
        visible: true,
        color: "rgba(0, 0, 0,1)",
        width: 2,
        lineStyle: 0,
        opacity: 100,
      },
    },
    STOCH: {
      k: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      d: {
        visible: true,
        color: "rgba(255,152,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      upperBand: {
        value: 80,
        visible: true,
        color: "rgba(120,123,134,0.6)",
        width: 1,
        lineStyle: 2,
      },
      middleBand: {
        value: 50,
        visible: true,
        color: "rgba(120,123,134,0.5)",
        width: 1,
        lineStyle: 2,
      },
      lowerBand: {
        value: 20,
        visible: true,
        color: "rgba(120,123,134,0.6)",
        width: 1,
        lineStyle: 2,
      },
      bgFill: {
        visible: true,
        topFillColor1: "rgba(41,98,255,0.12)",
        topFillColor2: "rgba(41,98,255,0.05)",
      },
    },
    MFI: {
      mfiLine: {
        color: "rgba(41, 98, 255, 1)",
        width: 2,
        lineStyle: 0,
        visible: true,
        opacity: 1,
      },

      upperBand: {
        value: 80,
        color: "rgba(120, 123, 134, 0.8)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },

      middleBand: {
        value: 50,
        color: "rgba(120, 123, 134, 0.6)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },

      lowerBand: {
        value: 20,
        color: "rgba(120, 123, 134, 0.8)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },
      bgFill: {
        visible: true,
        topFillColor1: "rgba(41, 98, 255, 0.25)",
        topFillColor2: "rgba(41, 98, 255, 0.08)",
      },
    },
    AWO: {
      awoBars: {
        visible: true,
        palette: {
          up: "rgba(38,166,154,0.6)",
          down: "rgba(239,83,80,0.6)",
        },
      },
    },
    VOL: {
      volumeBars: {
        visible: true,
        palette: {
          up: "rgba(38,166,154,0.6)",
          down: "rgba(239,83,80,0.6)",
        },
      },
      volumeMA: {
        color: "rgba(255,193,7,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
    },
    VP: {
      volume: {
        color: "rgba(38,166,154,1)",
        visible: true,
      },
      volumeMA: {
        color: "rgba(255,193,7,1)",
        width: 2,
        visible: true,
      },
    },
    PSAR: {
      psar: {
        visible: true,
        color: "rgba(41, 98, 255, 1)",
        width: 1,
        opacity: 100,
      },
    },
    PVO: {
      histogram: {
        visible: true,
        palette: {
          color0: "rgba(0, 150, 136, 1)",
          color1: "rgba(178, 223, 219, 1)",
          color2: "rgba(244, 67, 54, 1)",
          color3: "rgba(239, 83, 80, 1)",
        },
      },

      pvo: {
        visible: true,
        color: "rgba(33, 150, 243, 1)",
        width: 1,
        lineStyle: 0,
      },
      signal: {
        visible: true,
        color: "rgba(255, 152, 0, 1)",
        width: 1,
        lineStyle: 0,
      },
      zero: {
        visible: true,
        value: 0,
        color: "rgba(120, 120, 120, 0.6)",
        width: 1,
        lineStyle: 2,
      },
    },
    AD: {
      ad: {
        color: "rgba(156,39,176,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
    },
    DC: {
      upper: {
        visible: true,
        color: "rgba(239,83,80,1)", // red
        width: 1,
        lineStyle: 0, // solid
      },
      basis: {
        visible: true,
        color: "rgba(38,166,154,1)", // teal
        width: 1,
        lineStyle: 0, // solid
      },
      lower: {
        visible: true,
        color: "rgba(38,166,154,1)", // teal
        width: 1,
        lineStyle: 0, // solid
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },
    KC: {
      upper: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      middle: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      lower: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },

    EOM: {
      eom: {
        color: "rgba(38, 166, 154, 1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
    },
    BB: {
      upper: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      lower: {
        color: "rgba(244,67,54,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      basis: {
        color: "rgba(6, 150, 14, 1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },
    UO: {
      uoLine: {
        color: "rgba(33,150,243,1)", // blue
        width: 2,
        lineStyle: 0,
        visible: true,
      },
    },
    PVI: {
      pvi: {
        color: "rgba(41,98,255,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      pviEma: {
        color: "rgb(153, 166, 38)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
    },
    MACD: {
      macd: {
        visible: true,
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
      },

      signal: {
        visible: true,
        color: "rgba(255,193,7,1)",
        width: 1,
        lineStyle: 0,
      },

      histogram: {
        visible: true,
        palette: {
          pr: "rgba(38,166,154,1)",
          pf: "rgba(129,199,132,1)",
          nf: "rgba(239,83,80,1)",
          nr: "rgba(255,138,128,1)",
        },
      },

      zeroLine: {
        visible: true,
        color: "rgba(150,150,150,0.5)",
        width: 1,
        value: 0,
        lineStyle: 2,
      },
    },
    VWAP: {
      vwap: {
        color: "rgba(255, 193, 7, 1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },

      upperBand1: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      lowerBand1: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      bandFill1: {
        color: "rgba(33,150,243,0.15)",
        visible: true,
      },

      upperBand2: {
        color: "rgba(156,39,176,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      lowerBand2: {
        color: "rgba(156,39,176,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      bandFill2: {
        color: "rgba(156,39,176,0.12)",
        visible: true,
      },

      upperBand3: {
        color: "rgba(244,67,54,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      lowerBand3: {
        color: "rgba(244,67,54,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      bandFill3: {
        color: "rgba(244,67,54,0.10)",
        visible: true,
      },
    },
    CKS: {
      long: {
        color: "rgba(33,150,243,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      short: {
        color: "rgba(244,67,54,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
    },
    HV: {
      hv: {
        visible: true,
        color: "rgba(255,152,0,1)",
        width: 2,
        lineStyle: 0,
      },
    },
    CMF: {
      cmfLine: {
        color: "rgba(255,193,7,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      zeroLine: {
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 0,
      },
    },
    NVI: {
      nvi: {
        color: "rgba(41,98,255,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      nviEma: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
    },
    STOCHRSI: {
      kLine: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      dLine: {
        visible: true,
        color: "rgba(255,152,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },

      upperBand: {
        value: 80,
        visible: true,
        color: "rgba(120,123,134,0.6)",
        width: 1,
        lineStyle: 2,
      },

      middleBand: {
        value: 50,
        visible: true,
        color: "rgba(120,123,134,0.5)",
        width: 1,
        lineStyle: 2,
      },

      lowerBand: {
        value: 20,
        visible: true,
        color: "rgba(120,123,134,0.6)",
        width: 1,
        lineStyle: 2,
      },

      bgFill: {
        visible: true,
        topFillColor1: "rgba(41,98,255,0.12)",
        topFillColor2: "rgba(41,98,255,0.05)",
      },
    },
    CMO: {
      cmoLine: {
        color: "rgba(38,166,154,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      zeroLine: {
        value: 0,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },
    },
    TRIX: {
      trixLine: {
        color: "rgba(33,150,243,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },

      zeroLine: {
        value: 0,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },
    },
    FT: {
      fisherLine: {
        color: "rgba(38,166,154,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      triggerLine: {
        color: "rgba(255,152,0,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      level1_5: {
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 1.5,
      },
      level0_75: {
        color: "rgba(255,183,77,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 0.75,
      },
      level0: {
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 0,
      },

      level_minus0_75: {
        color: "rgba(129,199,132,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: -0.75,
      },

      level_minus1_5: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: -1.5,
      },
    },
    VP: {
      enabled: true,
      width: 120, // width of profile on right
      color: "rgba(33,150,243,1)",
      pocColor: "rgba(239,83,80,1)",
      vaColor: "rgba(38,166,154,1)",
    },
  };

export const getRowsByIndicator = (indicator, maType, indicatorConfigs) => {
  switch (indicator) {
    case "SMA": {
      const rows = [{ key: "sma", label: "SMA", type: "line" }];

      if (maType !== "none") {
        rows.push({
          key: "smoothingMA",
          label: "SMA-Based MA",
          type: "line",
        });
      }

      if (maType === "SMA + Bollinger Bands") {
        rows.push(
          {
            key: "bbUpper",
            label: "BB Upper",
            type: "line",
          },
          {
            key: "bbLower",
            label: "BB Lower",
            type: "line",
          },
          {
            key: "bbFill",
            label: "BB Background",
            type: "fill",
          },
        );
      }

      return rows;
    }
    case "EMA": {
      const rows = [{ key: "ema", label: "EMA", type: "line" }];

      if (maType !== "none") {
        rows.push({
          key: "smoothingMA",
          label: "EMA-Based MA",
          type: "line",
        });
      }

      if (maType === "SMA + Bollinger Bands") {
        rows.push(
          {
            key: "bbUpper",
            label: "BB Upper",
            type: "line",
          },
          {
            key: "bbLower",
            label: "BB Lower",
            type: "line",
          },
          {
            key: "bbFill",
            label: "BB Background",
            type: "fill",
            upperKey: "bbUpper",
            lowerKey: "bbLower",
          },
        );
      }

      return rows;
    }
    case "RSI": {
      const rows = [
        { key: "rsi", label: "RSI", type: "line" },
        {
          key: "upper",
          label: "RSI Upper Band",
          value: 70,
        },
        {
          key: "middle",
          label: "RSI Middle Band",
          value: 50,
        },
        {
          key: "lower",
          label: "RSI Lower Band",
          value: 30,
        },
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
        },
        {
          key: "osFill",
          label: "Oversold Gradient Fill",
          type: "fill",
        },
      ];
      if (maType !== "none") {
        rows.push({
          key: "smoothingMA",
          label: "RSI-Based MA",
          type: "line",
        });
      }
      if (maType === "SMA + Bollinger Bands") {
        rows.push(
          {
            key: "bbUpper",
            label: "BB Upper Band",
            type: "line",
            width: 1,
          },
          {
            key: "bbLower",
            label: "BB Lower Band",
            type: "line",
            width: 1,
          },
          {
            key: "bbFill",
            label: "BB Fill Area",
            type: "fill",
          },
        );
      }

      return rows;
    }
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
    case "ICHIMOKU":
      return [
        { key: "conversionLine", label: "Conversion Line", type: "line" },
        { key: "baseLine", label: "Base Line", type: "line" },

        { key: "leadLine1", label: "Leading Span A", type: "line" },
        { key: "leadLine2", label: "Leading Span B", type: "line" },

        { key: "laggingSpan", label: "Lagging Span", type: "line" },

        { key: "kumoCloudUpper", label: "Kumo Cloud Upper Line", type: "line" },
        { key: "kumoCloudLower", label: "Kumo Cloud Lower Line", type: "line" },

        {
          key: "cloudFillBullish",
          label: "Cloud Fill Color 1",
          type: "fill",
        },

        {
          key: "cloudFillBearish",
          label: "Cloud Fill Color 2",
          type: "fill",
        },
      ];

    case "PSAR":
      return [{ key: "parabolicSAR", label: "Parabolic SAR", type: "line" }];

    case "SUPERTREND":
      return [
        { key: "upTrend", label: "Up Trend", type: "line" },
        {
          key: "downTrend",
          label: "Down Trend",
          type: "line",
        },
        {
          key: "bodyMiddle",
          label: "Body Middle",
          type: "line",
        },
        {
          key: "upTrendBg",
          label: "Up Trend Background",
          type: "fill",
        },
        {
          key: "downTrendBg",
          label: "Down Trend Background",
          type: "fill",
        },
      ];

    case "AROON":
      return [
        { key: "aroonUp", label: "Aroon Up", type: "line" },
        {
          key: "aroonDown",
          label: "Aroon Down",
          type: "line",
        },
      ];
    case "AO":
      return [
        {
          key: "oscillator",
          label: "Oscillator",
          type: "checkbox",
          children: [
            {
              key: "up",
              parent: "oscillator",
              label: "Bullish Color",
              type: "line",
            },
            {
              key: "down",
              parent: "oscillator",
              label: "Bearish Color",
              type: "line",
            },
          ],
        },
        {
          key: "center",
          label: "Center Line",
          type: "line",
          showValue: true,
          value: 0,
        },
        {
          key: "upperLevel",
          label: "Upper Level",
          type: "line",
          showValue: true,
          value: 90,
        },
        {
          key: "lowerLevel",
          label: "Lower Level",
          type: "line",
          showValue: true,
          value: -90,
        },
        {
          key: "oscillatorFill",
          label: "Oscillator Fill",
          type: "checkbox",
          children: [
            {
              key: "topFillColor1",
              parent: "oscillatorFill", 
              label: "Bullish Fill",
              type: "fill",
            },
            {
              key: "topFillColor2",
              parent: "oscillatorFill", 
              label: "Bearish Fill",
              type: "fill",
            },
          ],
        },
      ];

    case "ADX":
      return [{ key: "adx", label: "ADX", type: "line" }];

    case "CKS":
      return [
        {
          key: "longStop",
          label: "Long Stop",
          type: "line",
          color: "#26a69a", // green
        },
        {
          key: "shortStop",
          label: "Short Stop",
          type: "line",
          color: "#ef5350", // red
        },

        {
          key: "fillArea",
          label: "CKS Fill Area",
          type: "fill",
          color0: "rgba(38,166,154,0.08)", // green light
          color1: "rgba(239,83,80,0.08)", // red light
        },
      ];

    case "STOCH":
      return [
        {
          key: "k",
          label: "%K",
          type: "line",
          visible: true,
        },
        {
          key: "d",
          label: "%D",
          type: "line",
          visible: true,
        },

        {
          key: "upperBand",
          label: "Upper Band",
          type: "band",
          showValue: true,
          value: 80,
          visible: true,
        },

        {
          key: "middleBand",
          label: "Middle Band",
          type: "band",
          showValue: true,
          value: 50,
          visible: true,
        },
        {
          key: "lowerBand",
          label: "Lower Band",
          type: "band",
          showValue: true,
          value: 20,
          visible: true,
        },
        {
          key: "bgFill",
          label: "Background Fill",
          type: "fill",
          visible: true,
        },
      ];
    case "STOCHRSI":
      return [
        { key: "kLine", label: "%K", type: "line" },
        { key: "dLine", label: "%D", type: "line" },

        {
          key: "upperBand",
          label: "Upper Band",
          type: "band",
          showValue: true,
          value: 80,
        },
        {
          key: "middleBand",
          label: "Middle Band",
          type: "band",
          showValue: true,
          value: 50,
        },
        {
          key: "lowerBand",
          label: "Lower Band",
          type: "band",
          showValue: true,
          value: 20,
        },
        {
          key: "bgFill",
          label: "StochRSI Background Fill",
          type: "fill",
        },
      ];

    case "MACD":
      return [
        {
          key: "macd",
          label: "MACD Line",
          type: "line",
          color: "#26a69a",
        },

        {
          key: "signal",
          label: "Signal Line",
          type: "line",
          color: "#ff9800",
        },

        {
          key: "histogram",
          label: "Histogram",
          type: "histogram",

          children: [
            {
              key: "pr",
              parent: "histogram",
              label: "Positive Rising",
              type: "fill",
            },

            {
              key: "pf",
              parent: "histogram",
              label: "Positive Falling",
              type: "fill",
            },

            {
              key: "nf",
              parent: "histogram",
              label: "Negative Falling",
              type: "fill",
            },

            {
              key: "nr",
              parent: "histogram",
              label: "Negative Rising",
              type: "fill",
            },
          ],
        },

        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          value: 0,
        },
      ];

    case "CCI": {
      const rows = [{ key: "cciLine", label: "CCI", type: "line" }];

      if (maType !== "none") {
        rows.push({ key: "cciMa", label: "Smoothing MA", type: "line" });
      }

      rows.push(
        {
          key: "upperBand",
          label: "Upper Level",
          type: "line",
          value: 100,
        },
        {
          key: "middleBand",
          label: "Middle Level",
          type: "line",
          value: 0,
        },
        {
          key: "lowerBand",
          label: "Lower Level",
          type: "line",
          value: -100,
        },
        {
          key: "bgFill",
          label: "Band Fill",
          type: "fill",
        },
      );

      if (maType === "SMA + Bollinger Bands") {
        rows.push(
          { key: "bbUpper", label: "BB Upper", type: "line" },
          { key: "bbLower", label: "BB Lower", type: "line" },
          { key: "bbFill", label: "BB Fill", type: "fill" },
        );
      }

      return rows;
    }
    case "MOM":
      return [{ key: "momentum", label: "Momentum", type: "line" }];

    case "ROC":
      return [
        { key: "roc", label: "ROC", type: "line" },

        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          showValue: false,
          value: 0,
          color: "#9e9e9e",
        },
      ];

    case "WPR":
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
    case "UO":
      return [
        {
          key: "uoLine",
          label: "Ultimate Oscillator",
          type: "line",
        },
      ];

    case "CMO":
      return [
        { key: "cmoLine", label: "CMO", type: "line", color: "#26A69A" },
        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          value: 0,
          showValue: true,
        },
      ];

    case "TRIX":
      return [
        { key: "trixLine", label: "TRIX", type: "line", color: "#26a69a" },
        {
          key: "zeroLine",
          label: "Zero ",
          type: "line",
          value: 0,
          showValue: true,
          color: "#9e9e9e",
        },
      ];
    case "FT":
      return [
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

    case "KVO":
      return [
        {
          key: "kvoLine",
          label: "Klinger Oscillator",
          type: "line",
          width: 1,
          lineStyle: 0,
          visible: true,
        },

        {
          key: "signalLine",
          label: "Signal Line",
          type: "line",
          width: 1,
          lineStyle: 0,
          visible: true,
        },
      ];
    case "ATR":
      return [{ key: "atr", label: "ATR", type: "line" }];

    case "KC":
      return [
        {
          key: "upper",
          label: "Upper Channel",
          type: "line",
        },
        { key: "middle", label: "Basis Line", type: "line" },
        {
          key: "lower",
          label: "Lower Channel",
          type: "line",
        },
        {
          key: "bbFill",
          label: "Background ",
          type: "fill",
        },
      ];

    case "BB":
      return [
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
          key: "bbFill",
          label: "Background ",
          type: "fill",
        },
      ];

    case "BBW":
      return [
        {
          key: "bbwLine",
          label: "Bollinger Band Width",
          type: "line",
        },
        {
          key: "highest",
          label: "Highest Expansion",
          type: "line",
        },
        {
          key: "lowest",
          label: "Lowest Contraction",
          type: "line",
        },
      ];

    case "DC":
      return [
        // Lines
        {
          key: "upper",
          label: "Upper Channel",
          type: "line",
        },
        { key: "basis", label: "Basis Line", type: "line" },
        {
          key: "lower",
          label: "Lower Channel",
          type: "line",
        },
        {
          key: "bbFill",
          label: "Background ",
          type: "fill",
        },
      ];

    case "CHOP":
      return [
        {
          key: "chopLine",
          label: "Chop",
          type: "line",
        },
        {
          key: "upper",
          label: "Upper Band",
          type: "line",
          showValue: true,
          value: 61.8,
        },
        {
          key: "middle",
          label: "Middle Band",
          type: "line",
          showValue: true,
          value: 50,
        },
        {
          key: "lower",
          label: "Lower Band",
          type: "line",
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

    case "STDDEV":
      return [
        {
          key: "stddev",
          label: "Plot",
          type: "line",
          color: "#ef5350",
        },
      ];

    case "AWO":
      return [
        {
          key: "awoBars",
          label: "AWO Bars",
          type: "checkbox",
          children: [
            {
              key: "up",
              parent: "awoBars",
              label: "Positive AO",
              type: "fill",
            },
            {
              key: "down",
              parent: "awoBars",
              label: "Negative AO",
              type: "fill",
            },
          ],
        },
      ];

    case "VOL":
      return [
        {
          key: "volumeBars",
          label: "Volume Bars",
          type: "checkbox",
          children: [
            {
              key: "up",
              parent: "volumeBars",
              label: "Growing Volume",
              type: "fill",
            },
            {
              key: "down",
              parent: "volumeBars",
              label: "Falling Volume",
              type: "fill",
            },
          ],
        },
        {
          key: "volumeMA",
          label: "Volume MA",
          type: "line",
          width: 2,
          lineStyle: 0,
          visible: true,
        },
      ];
    case "HV":
      return [
        {
          key: "hv",
          label: "HV",
          type: "line",
          visible: false,
        },
      ];

    case "OBV": {
      const rows = [
        {
          key: "obv",
          label: "On Balance Volume",
          type: "line",
        },
      ];
      if (maType !== "none") {
        rows.push({
          key: "smoothingMA",
          label: "OBV MA",
          type: "line",
        });
      }
      if (maType === "SMA + Bollinger Bands") {
        rows.push(
          {
            key: "bbUpper",
            label: "BB Upper",
            type: "line",
          },
          {
            key: "bbLower",
            label: "BB Lower",
            type: "line",
          },
          {
            key: "bbFill",
            label: "BB Background",
            type: "fill",
          },
        );
      }

      return rows;
    }

    case "PVO":
      return [
        // Histogram with multiple color states
        {
          key: "histogram",
          label: "Histogram",
          type: "histogram",
          children: [
            {
              key: "color0",
              parent: "histogram",
              label: "Positive Rising",
              type: "fill",
            },
            {
              key: "color1",
              parent: "histogram",
              label: "Positive Falling",
              type: "fill",
            },
            {
              key: "color2",
              parent: "histogram",
              label: "Negative Falling",
              type: "fill",
            },
            {
              key: "color3",
              parent: "histogram",
              label: "Negative Rising",
              type: "fill",
            },
          ],
        },

        // PVO Line
        {
          key: "pvo",
          label: "PVO Line",
          type: "line",
        },

        // Signal Line
        {
          key: "signal",
          label: "Signal Line",
          type: "line",
        },

        // Zero Line
        {
          key: "zero",
          label: "Zero Line",
          type: "line",
        },
      ];
    case "AD":
      return [
        {
          key: "accumulationDistribution",
          label: "Accumulation / Distribution",
          type: "line",
          width: 2,
          visible: true,
        },
      ];

    case "CMF":
      return [
        {
          key: "cmfLine",
          label: "CMF",
          type: "line",
          visible: true,
        },
        {
          key: "zeroLine",
          label: "Zero Line",
          type: "line",
          value: 0,
          visible: true,
        },
      ];

    case "MFI":
      return [
        {
          key: "mfiLine",
          label: "MFI",
          type: "line",
          color: "#2962FF",
          width: 2,
          visible: true,
        },

        {
          key: "upperBand",
          label: "Overbought",
          type: "band",
          value: 80,
          showValue: true,
          color: "#EF5350",
        },
        {
          key: "middleBand",
          label: "Middle Band",
          type: "band",
          value: 50,
          showValue: true,
          color: "#9E9E9E",
        },
        {
          key: "lowerBand",
          label: "Oversold",
          type: "band",
          value: 20,
          showValue: true,
          color: "#26A69A",
        },
        {
          key: "bgFill",
          label: "Background",
          type: "fill",
          visible: true,
          topColor: "rgba(239,83,80,0.08)", // overbought zone
          bottomColor: "rgba(38,166,154,0.08)", // oversold zone
        },
      ];
    case "EOM":
      return [
        {
          key: "eom",
          label: "EOM",
          type: "line",
          visible: true,
        },
      ];
    case "NVI":
      return [
        {
          key: "nvi",
          label: "NVI",
          type: "line",
          visible: true,
        },
        {
          key: "nviEma",
          label: "NVI Based EMA",
          type: "line",
          color: "#26a69a",
          width: 1,
          visible: true,
        },
      ];
    case "PVI":
      return [
        {
          key: "pvi",
          label: "PVI",
          type: "line",
          color: "#2962ff",
          width: 2,
          visible: true,
        },
        {
          key: "pviEma",
          label: "PVI Based EMA",
          type: "line",
          width: 1,
          visible: true,
        },
      ];

    case "VWAP": {
      const config = indicatorConfigs?.VWAP || {};

      const rows = [
        {
          key: "vwap",
          label: "VWAP",
          type: "line",
          visible: true,
        },
      ];

      /* -------- BAND 1 -------- */

      if (config?.band1?.enabled) {
        rows.push(
          {
            key: "upperBand1",
            label: "Upper Band #1",
            type: "line",
            width: 1,
            visible: true,
          },
          {
            key: "lowerBand1",
            label: "Lower Band #1",
            type: "line",
            width: 1,
            visible: true,
          },
          {
            key: "bandFill1",
            label: "Bands Fill #1",
            type: "fill",
            visible: true,
            upperKey: "upperBand1",
            lowerKey: "lowerBand1",
          },
        );
      }

      /* -------- BAND 2 -------- */

      if (config?.band2?.enabled) {
        rows.push(
          {
            key: "upperBand2",
            label: "Upper Band #2",
            type: "line",
            width: 1,
            visible: true,
          },
          {
            key: "lowerBand2",
            label: "Lower Band #2",
            type: "line",
            width: 1,
            visible: true,
          },
          {
            key: "bandFill2",
            label: "Bands Fill #2",
            type: "fill",
            visible: true,
            upperKey: "upperBand2",
            lowerKey: "lowerBand2",
          },
        );
      }

      /* -------- BAND 3 -------- */

      if (config?.band3?.enabled) {
        rows.push(
          {
            key: "upperBand3",
            label: "Upper Band #3",
            type: "line",
            width: 1,
            visible: true,
          },
          {
            key: "lowerBand3",
            label: "Lower Band #3",
            type: "line",
            width: 1,
            visible: true,
          },
          {
            key: "bandFill3",
            label: "Bands Fill #3",
            type: "fill",
            visible: true,
            upperKey: "upperBand3",
            lowerKey: "lowerBand3",
          },
        );
      }

      return rows;
    }
    case "ZIGZAG":
      return [
        {
          key: "z",
          label: "Zig Zag Line",
          type: "line",
          visible: true,
        },
      ];

    case "VP":
      return [
        {
          key: "vp",
          label: "Volume Profile",
          type: "custom",
        },
        {
          key: "poc",
          label: "POC",
          type: "line",
          showValue: true,
        },
        {
          key: "vah",
          label: "VAH",
          type: "line",
          showValue: true,
        },
        {
          key: "val",
          label: "VAL",
          type: "line",
          showValue: true,
        },
      ];

    default:
      return [];
  }
};

export const PANE_INDICATORS = new Set([
  "RSI",
  "FT",
  "MACD",
  "STDDEV",
  "CCI",
  "ROC",
  "WPR",
  "UO",
  "AROON",
  "HV",
  "AO",
  "CMO",
  "TRIX",
  "VP",
  "KO",
  "ATR",
  "ADX",
  "MFI",
  "EOM",
  "PVI",
  "NVI",
  "CHOP",
  "STOCHRSI",
  "STOCH",
  "MOM",
  "PVO",
  "AD",
  "OBV",
  "BBW",
  "CMF",
  "KVO",
  "AWO",
]);

export const RANGE_INTERVAL_MAPPING = {
  "1D": "1m",
  "5D": "5m",
  "1M": "30m",
  "3M": "1h",
  "6M": "4h",
  YTD: "1d",
  "1Y": "1d",
  "5Y": "1w",
  All: "1d",
};
