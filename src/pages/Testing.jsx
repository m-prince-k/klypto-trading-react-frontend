import React, { useEffect, useRef } from "react";
import {
  createChart,
  LineSeries,
  CandlestickSeries,
} from "lightweight-charts";

export default function Testing() {
  const chartRef = useRef();

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 900,
      height: 500,

      layout: {
        background: { type: "solid", color: "#ffffff" },
        textColor: "#334155",
      },

      grid: {
        vertLines: { color: "#e2e8f0" },
        horzLines: { color: "#e2e8f0" },
      },

      rightPriceScale: {
        scaleMargins: {
          top: 0.05,
          bottom: 0.25, // ✅ leave space for RSI
        },
      },

      timeScale: {
        timeVisible: true,
        rightBarSpacing: 40,
      },
    });

    /* ---------------- SERIES ---------------- */

    const candleSeries = chart.addSeries(CandlestickSeries);

    const smaSeries = chart.addSeries(LineSeries, {
      color: "#0ea5e9",
      lineWidth: 2,
    });

    // ✅ RSI ON SEPARATE SCALE
    const rsiSeries = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 2,
      priceScaleId: "rsi", // ⭐ MAGIC LINE
    });

    // ✅ Configure RSI scale
    chart.priceScale("rsi").applyOptions({
      scaleMargins: {
        top: 0.75,   // push to bottom
        bottom: 0.05,
      },
    });

    /* ---------------- MOCK DATA ---------------- */

    const candles = [
      { time: 1700000000, open: 70000, high: 71000, low: 69500, close: 70500 },
      { time: 1700000600, open: 70500, high: 71500, low: 70000, close: 71000 },
      { time: 1700001200, open: 71000, high: 71800, low: 70800, close: 71200 },
      { time: 1700001800, open: 71200, high: 72000, low: 70900, close: 71500 },
    ];

    const sma = [
      { time: 1700000000, value: 70200 },
      { time: 1700000600, value: 70600 },
      { time: 1700001200, value: 70900 },
      { time: 1700001800, value: 71300 },
    ];

    const rsi = [
      { time: 1700000000, value: 45 },
      { time: 1700000600, value: 52 },
      { time: 1700001200, value: 48 },
      { time: 1700001800, value: 60 },
    ];

    candleSeries.setData(candles);
    smaSeries.setData(sma);
    rsiSeries.setData(rsi);

    return () => chart.remove();
  }, []);

  return <div ref={chartRef} />;
}
