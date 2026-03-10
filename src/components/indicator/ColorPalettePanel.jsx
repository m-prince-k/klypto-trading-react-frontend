import React, { useState } from "react";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const COLORS = [
  "#ffffff","#d9d9d9","#bfbfbf","#a6a6a6","#8c8c8c","#737373","#595959","#404040","#262626","#000000",
  "#f28b82","#fbbc04","#fff475","#ccff90","#a7ffeb","#a0e7e5","#8ab4f8","#a78bfa","#d580ff","#ff8fab",
  "#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd","#f4cccc","#ead1dc",
  "#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0","#f4b6c2","#e6b8af",
  "#cc0000","#ff9900","#ffff00","#00ff00","#00ffff","#00a2e8","#3c78d8","#674ea7","#a64d79","#ff00ff",
  "#990000","#e69138","#f1c232","#274e13","#134f5c","#0b5394","#351c75","#741b47",
];

const getOpacityFromRGBA = (rgba) => {
  if (!rgba) return 100;
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return 100;
  const parts = match[1].split(",");
  if (parts.length < 4) return 100;
  return Math.round(parseFloat(parts[3]) * 100);
};

const getColorFromRGBA = (rgba) => {
  if (!rgba) return "#6fa8dc";
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return rgba;

  const parts = match[1].split(",");

  const r = parseInt(parts[0]).toString(16).padStart(2, "0");
  const g = parseInt(parts[1]).toString(16).padStart(2, "0");
  const b = parseInt(parts[2]).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
};

export default function ColorPalettePanel({
  mode = "line",
  currentStyle = {},
  onChange,
}) {

  const initialColor =
    currentStyle.color ||
    getColorFromRGBA(
      currentStyle.topFillColor1 || currentStyle.bottomFillColor1
    );

  const initialOpacity =
    currentStyle.opacity ??
    getOpacityFromRGBA(
      currentStyle.topFillColor2 || currentStyle.bottomFillColor2
    );

  const [color, setColor] = useState(initialColor);
  const [opacity, setOpacity] = useState(initialOpacity);
  const [width, setWidth] = useState(currentStyle.width ?? 2);
  const [lineStyle, setLineStyle] = useState(currentStyle.lineStyle ?? 0);

  const hexToRGBA = (hex, op) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${op/100})`;
  };

  const previewColor = hexToRGBA(color, opacity);

  /* ================= LINE UPDATE ================= */

  const updateLine = (updates = {}) => {

    const newColor = updates.color ?? color;
    const newOpacity = updates.opacity ?? opacity;
    const newWidth = updates.width ?? width;
    const newStyle = updates.lineStyle ?? lineStyle;

    onChange({
      color: hexToRGBA(newColor, newOpacity),
      opacity: newOpacity,
      width: newWidth,
      lineStyle: newStyle,
    });
  };

  /* ================= FILL UPDATE ================= */

  const updateFill = (hexColor, op = opacity) => {

    const r = parseInt(hexColor.slice(1,3),16);
    const g = parseInt(hexColor.slice(3,5),16);
    const b = parseInt(hexColor.slice(5,7),16);

    const main = `rgba(${r},${g},${b},${op/100})`;
    const faint = `rgba(${r},${g},${b},0.02)`;

    if (mode === "bandFill") {
      onChange({
        topFillColor1: main,
        topFillColor2: main,
      });
    }

    if (mode === "obFill") {
      onChange({
        topFillColor1: faint,
        topFillColor2: main,
      });
    }

    if (mode === "osFill") {
      onChange({
        bottomFillColor1: faint,
        bottomFillColor2: main,
      });
    }

  };

  /* ================= COLOR SELECT ================= */

  const selectColor = (c) => {

    setColor(c);

    if (mode === "line") {
      updateLine({
        color: c,
        opacity
      });
    } else {
      updateFill(c, opacity);
    }

  };

  /* ================= OPACITY SLIDER ================= */

  const updateOpacity = (v) => {

    setOpacity(v);

    if (mode === "line") {
      updateLine({
        color,
        opacity: v
      });
    } else {
      updateFill(color, v);
    }

  };

  const selectWidth = (w) => {
    setWidth(w);
    updateLine({ width: w });
  };

  const selectStyle = (s) => {
    setLineStyle(s);
    updateLine({ lineStyle: s });
  };

  return (
    <div
      style={{
        width: 300,
        padding: 14,
        background: "#f7f7f7",
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      }}
    >

      {/* PREVIEW */}

      <div
        style={{
          height: 40,
          background: "#fff",
          borderRadius: 6,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #ddd",
        }}
      >
        {mode === "line" ? (
          <div
            style={{
              width: 80,
              borderTop:
                lineStyle === 2
                  ? `${width}px dashed ${previewColor}`
                  : lineStyle === 1
                  ? `${width}px dotted ${previewColor}`
                  : `${width}px solid ${previewColor}`,
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 20,
              borderRadius: 4,
              background: previewColor,
            }}
          />
        )}
      </div>

      {/* COLOR GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10,1fr)",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {COLORS.map((c, i) => (
          <div
            key={i}
            onClick={() => selectColor(c)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: c,
              cursor: "pointer",
              border: c === color ? "2px solid #4c8bf5" : "1px solid #ccc",
            }}
          />
        ))}
      </div>

      {/* OPACITY */}

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span>Opacity</span>
          <span>{opacity}%</span>
        </div>

        <Form.Range
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => updateOpacity(Number(e.target.value))}
        />
      </div>

      {mode === "line" && (
        <>
          {/* WIDTH */}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Thickness</div>

            <div style={{ display: "flex" }}>
              {[1,2,3,4].map((w)=>(
                <div
                  key={w}
                  onClick={()=>selectWidth(w)}
                  style={{
                    flex:1,
                    height:36,
                    background: width===w ? "#2c2c2e":"#e9ecef",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    cursor:"pointer"
                  }}
                >
                  <div
                    style={{
                      height:w,
                      width:28,
                      background: width===w ? "#fff":"#333"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* LINE STYLE */}

          <div>
            <div style={{ fontSize:13, marginBottom:6 }}>Line style</div>

            <div style={{ display:"flex" }}>
              {[{v:0},{v:2},{v:1}].map(({v})=>(
                <div
                  key={v}
                  onClick={()=>selectStyle(v)}
                  style={{
                    flex:1,
                    height:36,
                    background: lineStyle===v ? "#2c2c2e":"#e9ecef",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    cursor:"pointer"
                  }}
                >
                  <div
                    style={{
                      width:30,
                      borderTop:
                        v===2 ? "2px dashed #333"
                        : v===1 ? "2px dotted #333"
                        : "2px solid #333"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}