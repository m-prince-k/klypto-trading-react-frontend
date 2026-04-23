

// dropdown options for ma_indicators
export const ohlcv_dropdown = [
  { label: "Open", value: "open" },
  { label: "High", value: "high" },
  { label: "Low", value: "low" },
  { label: "Close", value: "close" },
  { label: "Volume", value: "volume" },
];

// indicators with source
export const MA_INDICATORS = [
  "sma",
  "ema",
  "tema",
  "wma",
  "hma",
  "stddev",
  "wpr",
  "vwma",
  "rma",
];

// indicators with no params or value (only timeframe)
export const PRICE_FIELDS = [
    "Open",
    "High",
    "Low",
    "Close",
    "Volume",
    "Accumulation / Distribution",
    "Volume Oscillator",
    "Pivot Point",
    "OBV",
    "Session Volume Profile",
  ];

export const INDICATOR_ALIASES = {
    "bollinger bands upper": ["bbupper", "bb_upper", "upper"],
    "bollinger bands lower": ["bblower", "bb_lower", "lower"],
    "bollinger bands basis": ["bbbasis", "bbmiddle", "bb_basis", "basis"],
    "bollinger bands percentage b": ["bb%b", "bbpb", "bb_pb"],
    "bollinger bands width": ["bbwidth", "bb_width"],
    "keltner channels upper": ["kcupper", "UPPERBANDKELTNER"],
    "keltner channels lower": ["kclower", "LOWERBANDKELTNER"],
    "keltner channels middle": [
      "kcmiddle",
      "MIDDLELINEKELTNER",
      "kc_middle",
      "kc_basis",
    ],
    "donchian channels upper": ["dcupper", "UPPERDC"],
    "donchian channels lower": ["dclower", "LOWERDC"],
    "donchian channels middle": ["MIDDLEDC"],
    "macd line": ["macd", "MACD"],
    "macd histogram": ["macd_h", "MACDHISTOGRAM", "macdhist", "histogram"],
    "macd signal": ["MACDSIGNAL", "macdsignal", "signal"],
    "plus di": ["plus_di", "pdi", "+di", "plus"],
    "minus di": ["minus_di", "mdi", "-di", "minus"],
    "ichimoku base line": ["kijun", "BASELINEICHIMOKU"],
    "ichimoku conversion line": ["tenkan", "CONVERSIONLINEICHIMOKU"],
    "ichimoku lead line 1": ["spana", "LEADLINE1ICHIMOKU"],
    "ichimoku lead line 2": ["LEADLINE2ICHIMOKU"],
    "ichimoku cloud bottom": ["cloud", "CLOUDBOTTOMICHIMOKU"],
    "ichimoku cloud top": ["cloud", "CLOUDTOPICHIMOKU"],
    "slow stochastic %k": ["SLOWSTOCHASTICK", "stochk", "%k"],
    "slow stochastic %d": ["SLOWSTOCHASTICD", "stochd", "%d"],
    "fast stochastic %k": ["FASTSTOCHASTICK", "stochk", "%k"],
    "fast stochastic %d": ["FASTSTOCHASTICD", "stochd", "%d"],
  };

export const baseStyle = {
  borderRadius: "12px",
  borderWidth: "1.5px",
  borderStyle: "solid",
  fontSize: "0.875rem",
  letterSpacing: "0.01em",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
};

