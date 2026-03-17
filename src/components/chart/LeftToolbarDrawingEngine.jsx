import { useEffect, useRef, useState } from "react";
import { LineSeries } from "lightweight-charts";
import {
  FaMousePointer,
  FaSlash,
  FaMinus,
  FaPlus,
  FaRuler,
} from "react-icons/fa";

export default function LeftToolbarDrawingEngine({
  chartRef,
  seriesRef,
}) {
  const [activeTool, setActiveTool] = useState("cursor");

  const drawingsRef = useRef([]);
  const drawingStartRef = useRef(null);

  const tools = [
    { key: "cursor", icon: <FaMousePointer /> },
    { key: "trendline", icon: <FaSlash /> },
    { key: "hline", icon: <FaMinus /> },
    { key: "vline", icon: <FaPlus /> },
    { key: "measure", icon: <FaRuler /> },
  ];

  useEffect(() => {
    if (!chartRef?.current) return;

    const chart = chartRef.current;

    const handleClick = (param) => {
      if (!param?.time) return;

      const price = param.seriesPrices.get(seriesRef.current);

      if (!price) return;

      /* ---------------- HORIZONTAL LINE ---------------- */

      if (activeTool === "hline") {
        const line = chart.addSeries(LineSeries, {
          color: "#f59e0b",
          lineWidth: 2,
        });

        line.setData([
          { time: param.time - 5000, value: price },
          { time: param.time + 5000, value: price },
        ]);

        drawingsRef.current.push(line);
      }

      /* ---------------- VERTICAL LINE ---------------- */

      if (activeTool === "vline") {
        const line = chart.addSeries(LineSeries, {
          color: "#22c55e",
          lineWidth: 2,
        });

        line.setData([
          { time: param.time, value: price - 100000 },
          { time: param.time, value: price + 100000 },
        ]);

        drawingsRef.current.push(line);
      }

      /* ---------------- TREND LINE ---------------- */

      if (activeTool === "trendline") {
        if (!drawingStartRef.current) {
          drawingStartRef.current = {
            time: param.time,
            price,
          };
        } else {
          const line = chart.addSeries(LineSeries, {
            color: "#3b82f6",
            lineWidth: 2,
          });

          line.setData([
            {
              time: drawingStartRef.current.time,
              value: drawingStartRef.current.price,
            },
            {
              time: param.time,
              value: price,
            },
          ]);

          drawingsRef.current.push(line);

          drawingStartRef.current = null;
        }
      }

      /* ---------------- MEASURE TOOL ---------------- */

      if (activeTool === "measure") {
        if (!drawingStartRef.current) {
          drawingStartRef.current = {
            time: param.time,
            price,
          };
        } else {
          const diff = price - drawingStartRef.current.price;

          alert(`Price Move: ${diff.toFixed(2)}`);

          drawingStartRef.current = null;
        }
      }
    };

    chart.subscribeClick(handleClick);

    return () => {
      chart.unsubscribeClick(handleClick);
    };
  }, [activeTool]);

  return (
    <div
      style={{
        position: "absolute",
        left: 10,
        top: 120,
        zIndex: 1000,
        background: "#0f172a",
        padding: 8,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {tools.map((tool) => (
        <button
          key={tool.key}
          onClick={() => setActiveTool(tool.key)}
          style={{
            width: 36,
            height: 36,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            color: activeTool === tool.key ? "#fff" : "#94a3b8",
            background: activeTool === tool.key ? "#2563eb" : "transparent",
          }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}