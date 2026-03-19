import React, { useEffect, useRef, useState } from "react";
import { createChart, LineSeries } from "lightweight-charts";

// :small_blue_diamond: Sample Data (replace with API)
const sampleData = [
  {
    time: 1701993600,
    upper: 44700,
    lower: 35632,
    basis: 40166,
  },
  { time: 1702080000, upper: 45000, lower: 36000, basis: 40500 },
  { time: 1702166400, upper: 45500, lower: 36500, basis: 41000 },
  { time: 1702252800, upper: 46000, lower: 37000, basis: 41500 },
  { time: 1702339200, upper: 46500, lower: 37500, basis: 42000 },
];

export default function Testing() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  const [upperColor, setUpperColor] = useState("#22C55E");
  const [lowerColor, setLowerColor] = useState("#EF4444");
  const [basisColor, setBasisColor] = useState("#3B82F6");

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#020617" },
        textColor: "#FFFFFF",
      },
      grid: {
        vertLines: { color: "#1E293B" },
        horzLines: { color: "#1E293B" },
      },
    });

    const upperSeries = chart.addSeries(LineSeries, {
      color: upperColor,
      lineWidth: 2,
    });

    const lowerSeries = chart.addSeries(LineSeries, {
      color: lowerColor,
      lineWidth: 2,
    });

    const basisSeries = chart.addSeries(LineSeries, {
      color: basisColor,
      lineWidth: 2,
    });

    chartRef.current = { chart, upperSeries, lowerSeries, basisSeries };

    const handleResize = () => {
      if (!chartContainerRef.current) return;
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    const { chart, upperSeries, lowerSeries, basisSeries } = chartRef.current; // :repeat: Replace with API

    const data = sampleData;

    const upperData = data.map((d) => ({ time: d.time, value: d.upper }));
    const lowerData = data.map((d) => ({ time: d.time, value: d.lower }));
    const basisData = data.map((d) => ({ time: d.time, value: d.basis }));

    upperSeries.applyOptions({ color: upperColor });
    lowerSeries.applyOptions({ color: lowerColor });
    basisSeries.applyOptions({ color: basisColor });

    upperSeries.setData(upperData);
    lowerSeries.setData(lowerData);
    basisSeries.setData(basisData);

    chart.timeScale().fitContent();
  }, [upperColor, lowerColor, basisColor]);

  return (
    <div
      style={{
        padding: 20,
        background: "linear-gradient(to bottom, #020617, #111827)",
        color: "white",
      }}
    >
            <h2>Donchian Channels</h2>
            
      <div style={{ marginBottom: 10 }}>
                <label>Upper Color: </label>
                
        <input
          type="color"
          value={upperColor}
          onChange={(e) => setUpperColor(e.target.value)}
        />
              
      </div>
            
      <div style={{ marginBottom: 10 }}>
                <label>Lower Color: </label>
                
        <input
          type="color"
          value={lowerColor}
          onChange={(e) => setLowerColor(e.target.value)}
        />
              
      </div>
            
      <div style={{ marginBottom: 10 }}>
                <label>Basis Color: </label>
                
        <input
          type="color"
          value={basisColor}
          onChange={(e) => setBasisColor(e.target.value)}
        />
              
      </div>
            
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: "400px", borderRadius: "12px" }}
      />
          
    </div>
  );
}
