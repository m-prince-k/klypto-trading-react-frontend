import React ,{useState} from "react";
import { Form } from "react-bootstrap";

function IndicatorStylePalette({ style, setStyle }) {
  const update = (section, key, value) => {
    setStyle((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const sectionLabel = (section) => {
    switch (section) {
      case "rsi":
        return "RSI";
      case "upper":
        return "RSI Upper Band";
      case "middle":
        return "RSI Middle Band";
      case "lower":
        return "RSI Lower Band";
      default:
        return section;
    }
  };

  const RowItem = ({ section, showValue }) => (
    <div style={rowStyle}>
      {/* LEFT SIDE */}
      <div style={leftStyle}>
        <Form.Check
          type="checkbox"
          checked={style[section].visible}
          onChange={(e) => update(section, "visible", e.target.checked)}
          label={sectionLabel(section)}
        />
      </div>

      {/* RIGHT SIDE */}
      <div style={rightStyle}>
        {/* Color */}
        <input
          type="color"
          value={style[section].color}
          onChange={(e) => update(section, "color", e.target.value)}
          style={colorStyle}
        />

        {/* Thickness */}
        <select
          value={style[section].thickness}
          onChange={(e) => update(section, "thickness", Number(e.target.value))}
          style={selectStyle}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}px
            </option>
          ))}
        </select>

        {/* Value (for bands) */}
        {showValue && (
          <input
            type="number"
            value={style[section].value}
            onChange={(e) => update(section, "value", Number(e.target.value))}
            style={inputStyle}
          />
        )}
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <RowItem section="rsi" />
      <RowItem section="upper" showValue />
      <RowItem section="middle" showValue />
      <RowItem section="lower" showValue />
    </div>
  );
}

export default function Testing()  {
  const [style, setStyle] = useState({
    rsi: { visible: true, color: "#2962FF", thickness: 2 },
    upper: { visible: true, value: 70, color: "#787B86", thickness: 1 },
    middle: { visible: true, value: 50, color: "#B2B5BE", thickness: 1 },
    lower: { visible: true, value: 30, color: "#787B86", thickness: 1 },
  });
  return (
    <>
      <IndicatorStylePalette style={style} setStyle={setStyle} />
    </>
  );
};

/* -------------------- STYLES -------------------- */

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  padding: "10px 4px",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  padding: "8px 4px",
  borderBottom: "1px solid #f0f0f0",
};

const leftStyle = {
  fontSize: "14px",
};

const rightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const colorStyle = {
  width: "36px",
  height: "28px",
  border: "none",
  background: "none",
  cursor: "pointer",
};

const selectStyle = {
  height: "30px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "13px",
  padding: "2px 6px",
};

const inputStyle = {
  width: "60px",
  height: "30px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "13px",
  padding: "4px",
};
// import React, { useEffect, useRef, useState } from "react";
// import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
// import { Form, Row, Col } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";

// export default function TradingChartWithRSI() {
//   const mainChartRef = useRef(null);
//   const rsiChartRef = useRef(null);

//   const candleSeriesRef = useRef(null);
//   const rsiSeriesRef = useRef(null);
//   const upperRef = useRef(null);
//   const middleRef = useRef(null);
//   const lowerRef = useRef(null);

//   const [style, setStyle] = useState({
//     rsi: { visible: true, color: "#2962FF", thickness: 2 },
//     upper: { visible: true, value: 70, color: "#787B86", thickness: 1 },
//     middle: { visible: true, value: 50, color: "#B2B5BE", thickness: 1 },
//     lower: { visible: true, value: 30, color: "#787B86", thickness: 1 },
//   });

//   // ---------------- RSI CALC ----------------
//   const calculateRSI = (data, period = 14) => {
//     const rsi = [];
//     let gains = 0;
//     let losses = 0;

//     for (let i = 1; i < data.length; i++) {
//       const diff = data[i].close - data[i - 1].close;

//       if (i <= period) {
//         if (diff >= 0) gains += diff;
//         else losses -= diff;
//         continue; // ⬅️ skip pushing null
//       }

//       const avgGain = gains / period;
//       const avgLoss = losses / period || 1;
//       const rs = avgGain / avgLoss;
//       const value = 100 - 100 / (1 + rs);

//       rsi.push({
//         time: data[i].time,
//         value: Number(value), // ensure number
//       });
//     }

//     return rsi;
//   };

//   // ---------------- CREATE CHARTS ----------------
//   useEffect(() => {
//     // MAIN CHART
//     const mainChart = createChart(mainChartRef.current, {
//       width: 900,
//       height: 400,
//       layout: { background: { color: "#ffffff" } },
//       rightPriceScale: { visible: true },
//       timeScale: { timeVisible: true },
//     });

//     const candleSeries = mainChart.addSeries(CandlestickSeries, {});
//     candleSeriesRef.current = candleSeries;

//     // RSI CHART
//     const rsiChart = createChart(rsiChartRef.current, {
//       width: 900,
//       height: 250,
//       layout: { background: { color: "#ffffff" } },
//       rightPriceScale: { visible: true },
//       timeScale: { visible: true },
//     });

//     const rsiSeries = rsiChart.addSeries(LineSeries, {
//       color: style.rsi.color,
//       lineWidth: style.rsi.thickness,
//     });

//     const upper = rsiChart.addSeries(LineSeries, {
//       color: style.upper.color,
//     });

//     const middle = rsiChart.addSeries(LineSeries, {
//       color: style.middle.color,
//     });

//     const lower = rsiChart.addSeries(LineSeries, {
//       color: style.lower.color,
//     });

//     rsiSeriesRef.current = rsiSeries;
//     upperRef.current = upper;
//     middleRef.current = middle;
//     lowerRef.current = lower;

//     // ---------------- SAFE DUMMY DATA ----------------
//     const rawData = [];
//     let base = 100;

//     for (let i = 0; i < 200; i++) {
//       const open = base + Math.random() * 5;
//       const close = open + (Math.random() - 0.5) * 10;
//       const high = Math.max(open, close) + Math.random() * 5;
//       const low = Math.min(open, close) - Math.random() * 5;

//       rawData.push({
//         time: i,
//         open,
//         high,
//         low,
//         close,
//       });

//       base = close;
//     }

//     // SAFE FORMAT (Prevents your previous assertion error)
//     const formatted = rawData.map((item) => ({
//       time: item.time,
//       open: Number(item.open),
//       high: Number(item.high),
//       low: Number(item.low),
//       close: Number(item.close),
//     }));

//     candleSeries.setData(formatted);

//     const rsiData = calculateRSI(formatted);
//     rsiSeries.setData(rsiData);

//     upper.setData(
//       rsiData.map((d) => ({
//         time: d.time,
//         value: Number(style.upper.value),
//       })),
//     );

//     middle.setData(
//       rsiData.map((d) => ({
//         time: d.time,
//         value: Number(style.middle.value),
//       })),
//     );
//     lower.setData(
//       rsiData.map((d) => ({
//         time: d.time,
//         value: Number(style.lower.value),
//       })),
//     );

//     return () => {
//       mainChart.remove();
//       rsiChart.remove();
//     };
//   }, []);

//   // ---------------- APPLY STYLE LIVE ----------------
//   useEffect(() => {
//     if (!rsiSeriesRef.current) return;

//     rsiSeriesRef.current.applyOptions({
//       color: style.rsi.color,
//       lineWidth: style.rsi.thickness,
//       visible: style.rsi.visible,
//     });

//     upperRef.current.applyOptions({
//       color: style.upper.color,
//       lineWidth: style.upper.thickness,
//       visible: style.upper.visible,
//     });

//     middleRef.current.applyOptions({
//       color: style.middle.color,
//       lineWidth: style.middle.thickness,
//       visible: style.middle.visible,
//     });

//     lowerRef.current.applyOptions({
//       color: style.lower.color,
//       lineWidth: style.lower.thickness,
//       visible: style.lower.visible,
//     });
//   }, [style]);

//   const update = (section, key, value) => {
//     setStyle((prev) => ({
//       ...prev,
//       [section]: { ...prev[section], [key]: value },
//     }));
//   };

//   return (
//     <div className="p-4">
//       <div ref={mainChartRef} />
//       <div ref={rsiChartRef} className="mt-3" />

//       <div className="mt-4" style={{ width: 400 }}>
//         <h5>RSI Style</h5>

//         {["rsi", "upper", "middle", "lower"].map((section) => (
//           <div key={section} className="border p-3 mb-3 rounded">
//             <Form.Check
//               type="checkbox"
//               label={section.toUpperCase()}
//               checked={style[section].visible}
//               onChange={(e) => update(section, "visible", e.target.checked)}
//             />

//             <Row className="mt-2">
//               <Col>
//                 <Form.Control
//                   type="color"
//                   value={style[section].color}
//                   onChange={(e) => update(section, "color", e.target.value)}
//                 />
//               </Col>

//               <Col>
//                 <Form.Control
//                   type="number"
//                   min={1}
//                   max={6}
//                   value={style[section].thickness}
//                   onChange={(e) =>
//                     update(section, "thickness", Number(e.target.value))
//                   }
//                 />
//               </Col>

//               {section !== "rsi" && (
//                 <Col>
//                   <Form.Control
//                     type="number"
//                     value={style[section].value}
//                     onChange={(e) =>
//                       update(section, "value", Number(e.target.value))
//                     }
//                   />
//                 </Col>
//               )}
//             </Row>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
