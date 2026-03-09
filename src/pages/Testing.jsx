import React, { useEffect, useRef } from "react";
import { createChart, LineSeries, BaselineSeries } from "lightweight-charts";

export default function RSIGradientExample() {
  const chartRef = useRef();

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 600,
      height: 300,
      layout: {
        background: { color: "#fff" },
        textColor: "#0f172a"
      }
    });

    /* ================= SAMPLE RSI ================= */

    const rsiData = [];
    let value = 50;

    for (let i = 0; i < 200; i++) {
      value += (Math.random() - 0.5) * 10;
      value = Math.max(0, Math.min(100, value));

      rsiData.push({
        time: i,
        value
      });
    }

    /* ================= RSI LINE ================= */

    const rsiSeries = chart.addSeries(LineSeries, {
      color: "#7c6cf3",
      lineWidth: 2
    });

    rsiSeries.setData(rsiData);

    const upper = 70;
    const lower = 30;

    /* ================= BANDS ================= */

    rsiSeries.createPriceLine({
      price: upper,
      color: "#999",
      lineWidth: 1,
      lineStyle: 2
    });

    rsiSeries.createPriceLine({
      price: lower,
      color: "#999",
      lineWidth: 1,
      lineStyle: 2
    });

    /* ================= OVERBOUGHT FILL ================= */

    const overboughtSeries = chart.addSeries(BaselineSeries, {
      baseValue: { type: "price", price: upper },

      topFillColor1: "rgba(0,255,150,0.45)",
      topFillColor2: "rgba(0,255,150,0.05)",

      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",

      topLineColor: "transparent",
      bottomLineColor: "transparent"
    });

    /* ================= OVERSOLD FILL ================= */

    const oversoldSeries = chart.addSeries(BaselineSeries, {
      baseValue: { type: "price", price: lower },

      bottomFillColor1: "rgba(255,80,80,0.45)",
      bottomFillColor2: "rgba(255,80,80,0.05)",

      topFillColor1: "rgba(0,0,0,0)",
      topFillColor2: "rgba(0,0,0,0)",

      topLineColor: "transparent",
      bottomLineColor: "transparent"
    });

    /* ================= DATA FOR FILL ================= */

    const overboughtData = rsiData.map(p => ({
      time: p.time,
      value: Math.max(p.value, upper)
    }));

    const oversoldData = rsiData.map(p => ({
      time: p.time,
      value: Math.min(p.value, lower)
    }));

    overboughtSeries.setData(overboughtData);
    oversoldSeries.setData(oversoldData);

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, []);

  return <div ref={chartRef} />;
}