import { Form } from "react-bootstrap";

export default function IndicatorStyle({
  style,
  setStyle,
  activeBarIndicator,
}) {
  /* ================= UPDATE FUNCTION ================= */

  const update = (section, key, value) => {
    setStyle((prev) => ({
      ...prev,
      [activeBarIndicator]: {
        ...prev[activeBarIndicator],
        [section]: {
          ...prev[activeBarIndicator]?.[section],
          [key]: value,
        },
      },
    }));
  };

  /* ================= ROW CONFIG BASED ON INDICATOR ================= */

  const getRowsByIndicator = (indicator) => {
    switch (indicator) {
      /* ================= RSI ================= */
      case "RSI":
        return [
          { key: "rsi", label: "RSI", type: "line", color: "#26a69a" },
          {
            key: "rsiMa",
            label: "RSI-based MA",
            type: "line",
            color: "#ff9800",
          },

          {
            key: "upper",
            label: "RSI Upper Band",
            type: "band",
            showValue: true,
            value: 70, // default
            color: "#ef5350",
          },
          {
            key: "middle",
            label: "RSI Middle Band",
            type: "band",
            showValue: true,
            value: 50, // default
            color: "#9e9e9e",
          },
          {
            key: "lower",
            label: "RSI Lower Band",
            type: "band",
            showValue: true,
            value: 30, // default
            color: "#26a69a",
          },

          {
            key: "bgFill",
            label: "RSI Background Fill",
            type: "fill",
            color0: "rgba(38,166,154,0.1)",
            color1: "rgba(38,166,154,0.1)",
          },
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

      /* ================= SMA ================= */
      case "SMA":
        return [
          { key: "ma", label: "Moving Average", type: "line" },
          { key: "smaMa", label: "SMA-based MA", type: "line" },
          { key: "bbUpper", label: "Upper Bollinger Band", type: "band" },
          { key: "bbLower", label: "Lower Bollinger Band", type: "band" },
          { key: "bbFill", label: "Bollinger Bands Fill", type: "fill" },
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

          // Kumo boundaries
          { key: "kumoUpper", label: "Kumo Upper Line", type: "line" },
          { key: "kumoLower", label: "Kumo Lower Line", type: "line" },

          // Cloud Fill (Area between Span A & Span B) with palette colors
          {
            key: "cloudFill",
            label: "Cloud Fill",
            type: "area",
            color0: "rgba(38,166,154,0.4)", // bullish cloud
            color1: "rgba(239,83,80,0.4)", // bearish cloud
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
          // Oscillator line
          {
            key: "oscillator",
            label: "Oscillator",
            type: "line",
            color0: "#26a69a",
            color1: "#ef5350",
          },

          // Center line
          {
            key: "center",
            label: "Center Line",
            type: "line",
            color: "#9e9e9e",
            showValue: true,
            value: 0,
          },

          // Upper Level
          {
            key: "upperLevel",
            label: "Upper Level",
            type: "line",
            color: "#ff9800",
            showValue: true,
            value: 90,
          },

          // Lower Level
          {
            key: "lowerLevel",
            label: "Lower Level",
            type: "line",
            color: "#03a9f4",
            showValue: true,
            value: -90,
          },

          // Oscillator fill
          {
            key: "oscillatorFill",
            label: "Oscillator Fill",
            type: "area",
            color0: "rgba(38,166,154,0.2)",
            color1: "rgba(239,83,80,0.2)",
          },
        ]; /* ================= DEFAULT ================= */

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
          // Lines
          { key: "kLine", label: "%K", type: "line", color: "#26a69a" },
          { key: "dLine", label: "%D", type: "line", color: "#ff9800" },

          // Bands
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

          // Background fill
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
          // Lines
          { key: "kLine", label: "%K", type: "line", color: "#26a69a" },
          { key: "dLine", label: "%D", type: "line", color: "#ff9800" },

          // Bands
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

          // Background fill
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
          // MACD line
          {
            key: "macdLine",
            label: "MACD Line",
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

      default:
        return [];
    }
  };

  const rows = getRowsByIndicator(activeBarIndicator);

  /* ================= RENDER ================= */

  return (
    <div style={containerStyle}>
      {rows.map((row) => (
        <div key={row.key} style={rowStyle}>
          {/* LEFT - CHECKBOX */}
          <div style={leftStyle}>
            <Form.Check
              type="checkbox"
              checked={style[row.key]?.visible ?? true}
              onChange={(e) => update(row.key, "visible", e.target.checked)}
              label={row.label}
            />
          </div>

          {/* MIDDLE - COLOR + LINE PREVIEW */}
          <div style={middleStyle}>
            {/* COLOR PICKER */}
            <input
              type="color"
              value={style[activeBarIndicator]?.[row.key]?.color || "#2962ff"}
              onChange={(e) => update(row.key, "color", e.target.value)}
              style={colorBox}
            />

            {/* LINE PREVIEW (for line & band only) */}
            {(row.type === "line" || row.type === "band") && (
              <button type="button" style={linePreviewBtn}>
                <div
                  style={{
                    ...linePreview,
                    background: style[row.key]?.color || "#333",
                  }}
                />
              </button>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div style={rightStyle}>
            {row.showValue && (
              <input
                type="number"
                value={style[row.key]?.value ?? ""}
                onChange={(e) =>
                  update(row.key, "value", Number(e.target.value))
                }
                style={valueInput}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===================== STYLES ===================== */

const containerStyle = {
  display: "flex",
  flexDirection: "column",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 160px 80px",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #eee",
};

const leftStyle = {
  fontSize: "14px",
};

const middleStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const rightStyle = {
  display: "flex",
  justifyContent: "flex-end",
};

const colorBox = {
  width: "36px",
  height: "32px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  cursor: "pointer",
};

const linePreviewBtn = {
  width: "60px",
  height: "32px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const linePreview = {
  width: "40px",
  height: "2px",
};

const valueInput = {
  width: "70px",
  height: "32px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  textAlign: "center",
};
