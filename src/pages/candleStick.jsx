import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import ChartHeader from "../pages/chartHeader";

const Candlestick = () => {
  const chartRef = useRef(null);
  const [timeframe, setTimeframe] = useState("1m");

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 800,
      height: 400,

      layout: {
        background: { type: "solid", color: "#0f172a" },
        textColor: "#cbd5e1",
        fontSize: 12,
        fontFamily: "Inter, sans-serif",
      },

      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#334155",
        fixLeftEdge: true,
        fixRightEdge: true,
      },

      rightPriceScale: {
        borderColor: "#334155",
        scaleMargins: { top: 0.2, bottom: 0.2 },
      },

      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },

      crosshair: {
        mode: 1,
        vertLine: { color: "#64748b" },
        horzLine: { color: "#64748b" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candleSeries.setData([
      { time: "2025-01-01", open: 100, high: 110, low: 95, close: 105 },
      { time: "2025-01-02", open: 105, high: 115, low: 100, close: 112 },
      { time: "2025-01-03", open: 112, high: 120, low: 108, close: 118 },
      { time: "2025-01-04", open: 118, high: 125, low: 110, close: 115 },
      { time: "2025-01-05", open: 115, high: 122, low: 112, close: 120 },
      { time: "2025-01-06", open: 120, high: 130, low: 118, close: 128 },
      { time: "2025-01-07", open: 128, high: 135, low: 120, close: 125 },
      { time: "2025-01-08", open: 125, high: 132, low: 123, close: 130 },
      { time: "2025-01-09", open: 130, high: 138, low: 127, close: 135 },
      { time: "2025-01-10", open: 135, high: 145, low: 132, close: 140 },
      { time: "2025-01-11", open: 140, high: 148, low: 138, close: 142 },
      { time: "2025-01-12", open: 142, high: 150, low: 140, close: 145 },
      { time: "2025-01-13", open: 145, high: 155, low: 142, close: 150 },
      { time: "2025-01-14", open: 150, high: 160, low: 148, close: 158 },
      { time: "2025-01-15", open: 158, high: 165, low: 150, close: 155 },
      { time: "2025-01-16", open: 155, high: 162, low: 148, close: 150 },
      { time: "2025-01-17", open: 150, high: 158, low: 145, close: 152 },
      { time: "2025-01-18", open: 152, high: 160, low: 150, close: 158 },
      { time: "2025-01-19", open: 158, high: 168, low: 155, close: 165 },
      { time: "2025-01-20", open: 165, high: 175, low: 20, close: 150 },
    ]);

    return () => chart.remove();
  }, [timeframe]); // 👈 will refetch later based on timeframe

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-900">
      {/* ✅ Chart Header */}
      <ChartHeader
        symbol="BTC / USDT"
        price="43,250"
        change={2.15}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      {/* ✅ Chart Canvas */}
      <div ref={chartRef} />
    </div>
  );
};

export default Candlestick;
