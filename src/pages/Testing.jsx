import React, { useEffect, useRef } from "react";
import {
  createChart,
  LineSeries,
  CandlestickSeries,
  CrosshairMode,
} from "lightweight-charts";

export default function Testing() {
  const mainChartRef = useRef(null);
  const rsiChartRef = useRef(null);

  useEffect(() => {
    if (!mainChartRef.current || !rsiChartRef.current) return;

    /* ================= MAIN CHART ================= */

    const mainChart = createChart(mainChartRef.current, {
      width: 900,
      height: 400,

      layout: {
        background: { type: "solid", color: "#ffffff" },
        textColor: "#334155",
      },

      grid: {
        vertLines: { color: "#e2e8f0" },
        horzLines: { color: "#e2e8f0" },
      },

      crosshair: {
        mode: CrosshairMode.Normal,
      },

      // ✅ HIDE X AXIS HERE
      timeScale: {
        visible: false,
      },
    });

    const candleSeries = mainChart.addSeries(CandlestickSeries);
    const smaSeries = mainChart.addSeries(LineSeries, {
      color: "#0ea5e9",
      lineWidth: 2,
    });

    /* ================= RSI CHART ================= */

    const rsiChart = createChart(rsiChartRef.current, {
      width: 900,
      height: 150,

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
          top: 0.1,
          bottom: 0.1,
        },
      },

      // ✅ SHOW X AXIS ONLY HERE
      timeScale: {
        visible: true,
        timeVisible: true,
        rightBarSpacing: 40,
      },
    });

    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 2,
    });

    // ✅ Lock RSI scale
    rsiChart.priceScale("right").applyOptions({
      autoScale: false,
      minValue: 0,
      maxValue: 100,
    });

    /* ================= SYNC SCROLL / ZOOM ================= */

    const syncCharts = (source, target) => {
      source.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) target.timeScale().setVisibleLogicalRange(range);
      });
    };

    syncCharts(mainChart, rsiChart);
    syncCharts(rsiChart, mainChart);

    /* ================= DATA ================= */

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

    return () => {
      mainChart.remove();
      rsiChart.remove();
    };
  }, []);

  return (
    <div>
      <div ref={mainChartRef} />
      <div ref={rsiChartRef} style={{ marginTop: 2 }} />
    </div>
  );
}
