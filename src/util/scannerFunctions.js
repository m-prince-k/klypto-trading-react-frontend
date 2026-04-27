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

/* ================= CONDITION BUILDER ================= */
const OPERATOR_LABELS = {
  ">": "is greater than",
  "<": "is less than",
  ">=": "is greater than or equal to",
  "<=": "is less than or equal to",
  "==": "is equal to",
  "!=": "is not equal to",
};

/* ================= PARSER ================= */

export function parseObject(obj) {
  if (!obj) return "";

  // ✅ number
  if (obj.indicator === "number") {
    return obj.value;
  }

  // ✅ string
  if (typeof obj === "string") return obj;

  if (!obj.indicator) return "";

  // 🔥 extract length + source (NEW STRUCTURE)
  let length = "";
  let source = "";

  if (typeof obj.length === "object") {
    length = obj.length?.length;
    source = obj.length?.source;
  } else {
    length = obj.length;
  }

  // fallback (older structure)
  if (!source && obj.source) {
    source = obj.source;
  }

  const params = [];

  if (source) params.push(source);
  if (length) params.push(length);

  const tfMap = {
    "1d": "daily",
    "1w": "weekly",
    "1M": "monthly",
    "30d": "monthly",
    "90d": "quarterly",
    "365d": "yearly",
  };

  const tf = tfMap[obj.timeframe] || obj.timeframe || "";

  return `${tf ? tf + " " : ""}${obj.indicator.toUpperCase()}(${params.join(", ")})`
    .replace(/\(\)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ================= CONDITION BUILDER ================= */
export function buildCondition(payload) {
  if (!payload?.rules?.length) return "";

  const result = payload.rules
    .map((rule) => {
      const left = parseObject(rule.object1);
      const op1 = OPERATOR_LABELS[rule.operator1] || rule.operator1;
      const right = parseObject(rule.object2);

      let expression = `${left} ${op1} ${right}`;

      // 🔥 handle chaining
      if (rule.operator2 && rule.object3) {
        expression += ` ${rule.operator2} ${parseObject(rule.object3)}`;
      }

      if (rule.operator3 && rule.object4) {
        expression += ` ${rule.operator3} ${parseObject(rule.object4)}`;
      }

      return expression;
    })
    .join(" AND ");

  return toTitleCase(result); // ✅ apply here
}
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      // keep small words lowercase if you want (optional)
      const smallWords = ["and", "or", "of", "in", "on", "at", "to"];
      if (smallWords.includes(word)) return word;

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function formatSmartDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `Today, ${time}`;
  }

  if (isYesterday) {
    return `Yesterday, ${time}`;
  }

  // fallback (older dates)
  return (
    date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + `, ${time}`
  );
}
