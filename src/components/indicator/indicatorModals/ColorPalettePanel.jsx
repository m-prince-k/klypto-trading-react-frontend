import React, { useState } from "react";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const COLORS = [
  "#ffffff","#d9d9d9","#bfbfbf","#a6a6a6","#8c8c8c","#737373","#595959","#404040","#262626","#000000",
  "#f28b82","#fbbc04","#fff475","#ccff90","#a7ffeb","#a0e7e5","#8ab4f8","#a78bfa","#d580ff","#ff8fab",
  "#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd","#f4cccc","#ead1dc",
  "#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0","#f4b6c2","#e6b8af",
  "#cc0000","#ff9900","#ffff00","#00ff00","#00ffff","#00a2e8","#3c78d8","#674ea7","#a64d79","#ff00ff",
  "#990000","#e69138","#f1c232","#274e13","#134f5c","#0b5394","#351c75","#741b47"
];

export default function ColorPalettePanel({ onChange }) {
  const [selectedColor, setSelectedColor] = useState("#6fa8dc");
  const [opacity, setOpacity] = useState(81);
  const [thickness, setThickness] = useState(2);
  const [lineStyle, setLineStyle] = useState("solid");

  const handleUpdate = (updates) => {
    const finalStyle = {
      color: selectedColor,
      opacity,
      thickness,
      lineStyle,
      ...updates,
    };
    onChange && onChange(finalStyle);
  };

  const selectColor = (color) => {
    setSelectedColor(color);
    handleUpdate({ color });
  };

  const selectThickness = (t) => {
    setThickness(t);
    handleUpdate({ thickness: t });
  };

  const selectLineStyle = (style) => {
    setLineStyle(style);
    handleUpdate({ lineStyle: style });
  };

  return (
    <div style={{ width: 350, padding: 15, background: "#f8f9fa", borderRadius: 8 }}>
      
      {/* COLOR GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gap: 8,
          marginBottom: 15,
        }}
      >
        {COLORS.map((color, index) => (
          <div
            key={index}
            onClick={() => selectColor(color)}
            style={{
              width: 24,
              height: 24,
              background: color,
              borderRadius: 4,
              cursor: "pointer",
              border:
                selectedColor === color
                  ? "2px solid #4c8bf5"
                  : "1px solid #ccc",
            }}
          />
        ))}
      </div>

      {/* OPACITY */}
      <div className="mb-3">
        <div className="d-flex justify-content-between">
          <span>Opacity</span>
          <span>{opacity}%</span>
        </div>
        <Form.Range
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => {
            setOpacity(e.target.value);
            handleUpdate({ opacity: Number(e.target.value) });
          }}
        />
      </div>

      {/* THICKNESS */}
      <div className="mb-3">
        <div className="mb-1">Thickness</div>
        <div className="d-flex gap-2">
          {[1, 2, 3, 4].map((t) => (
            <div
              key={t}
              onClick={() => selectThickness(t)}
              style={{
                flex: 1,
                height: 40,
                background: thickness === t ? "#333" : "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  height: t,
                  width: 30,
                  background: thickness === t ? "#fff" : "#333",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* LINE STYLE */}
      <div>
        <div className="mb-1">Line style</div>
        <div className="d-flex gap-2">
          {["solid", "dashed", "dotted"].map((style) => (
            <div
              key={style}
              onClick={() => selectLineStyle(style)}
              style={{
                flex: 1,
                height: 40,
                background: lineStyle === style ? "#333" : "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 2,
                  background:
                    lineStyle === style ? "#fff" : "#333",
                  borderTop:
                    style === "dashed"
                      ? "2px dashed"
                      : style === "dotted"
                      ? "2px dotted"
                      : "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}