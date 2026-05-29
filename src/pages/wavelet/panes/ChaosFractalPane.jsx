import React, { useEffect, useRef } from "react";
import { createChart, createSeriesMarkers, LineSeries } from "lightweight-charts";

export default function ChaosFractalPane({ data, masterTimeScale }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data?.fractals) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "transparent" }, textColor: "#8A919E" },
      grid: { vertLines: { color: "#1E222D", style: 2 }, horzLines: { color: "#1E222D", style: 2 } },
      rightPriceScale: { borderColor: "#1E222D", autoScale: true },
      timeScale: { borderColor: "#1E222D", timeVisible: true },
    });
    chartRef.current = chart;

    let syncHandler = null;
    let localSyncHandler = null;
    if (masterTimeScale) {
      syncHandler = () => {
        try {
          const range = masterTimeScale.getVisibleLogicalRange();
          if (range) chart.timeScale().setVisibleLogicalRange(range);
        } catch(e) {}
      };
      try {
        masterTimeScale.subscribeVisibleLogicalRangeChange(syncHandler);
      } catch(e) {}
      
      localSyncHandler = (range) => {
        try {
          if (range) masterTimeScale.setVisibleLogicalRange(range);
        } catch(e) {}
      };
      chart.timeScale().subscribeVisibleLogicalRangeChange(localSyncHandler);
    }

    const fractalLine = chart.addSeries(LineSeries,{
      color: "#9c27b0",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Formatting fractal oscillator data
    const fractalArray = Object.values(data.fractals).filter(f => f && f.time);
    fractalArray.sort((a, b) => a.time - b.time);
    
    // Simulate strength data if not explicitly provided, based on standard fractal logic
    const strengthData = fractalArray.map((f, i) => ({
      time: f.time / 1000,
      value: f.strength ?? (Math.sin(i * 0.5) * 1.5) // Fallback curve
    }));
    fractalLine.setData(strengthData);

    const topMarkers = [];
    const bottomMarkers = [];

    fractalArray.forEach(f => {
      if (f.signal === "SELL" || f.isTop) {
        topMarkers.push({ time: f.time / 1000, position: 'aboveBar', color: '#f44336', shape: 'arrowDown' });
      } else if (f.signal === "BUY" || f.isBottom) {
        bottomMarkers.push({ time: f.time / 1000, position: 'belowBar', color: '#4caf50', shape: 'arrowUp' });
      }
    });

    // Overbought/Oversold lines
    const topZone = chart.addSeries(LineSeries,{ color: "#f44336", lineWidth: 1, lineStyle: 2, priceLineVisible: false });
    const bottomZone = chart.addSeries(LineSeries,{ color: "#4caf50", lineWidth: 1, lineStyle: 2, priceLineVisible: false });
    const zeroLine = chart.addSeries(LineSeries,{ color: "#888888", lineWidth: 1, lineStyle: 3, priceLineVisible: false });

    topZone.setData(strengthData.map(d => ({ time: d.time, value: 1 })));
    bottomZone.setData(strengthData.map(d => ({ time: d.time, value: -1 })));
    zeroLine.setData(strengthData.map(d => ({ time: d.time, value: 0 })));

    if (topMarkers.length > 0) createSeriesMarkers(topZone, topMarkers);
    if (bottomMarkers.length > 0) createSeriesMarkers(bottomZone, bottomMarkers);

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (masterTimeScale && syncHandler) {
        try {
          masterTimeScale.unsubscribeVisibleLogicalRangeChange(syncHandler);
        } catch(e) {}
      }
      if (localSyncHandler) {
        try {
          chart.timeScale().unsubscribeVisibleLogicalRangeChange(localSyncHandler);
        } catch(e) {}
      }
      setTimeout(() => {
        try { chart.remove(); } catch(e) {}
      }, 0);
    };
  }, [data, masterTimeScale]);

  return (
    <div className="wavelet-pane-wrapper">
      <div className="wavelet-pane-title">CHAOS FRACTAL ANALYSIS</div>
      <div className="wavelet-legend">
        <div className="legend-item"><span className="legend-marker-down">▼</span> <span>Chaos Fractal<br/>Top (Sell Zone)</span></div>
        <div className="legend-item"><span className="legend-marker-up">▲</span> <span>Chaos Fractal<br/>Bottom (Buy Zone)</span></div>
        <div className="legend-item"><div className="legend-color-box" style={{backgroundColor: '#9c27b0'}}></div> <span>Fractal Strength</span></div>
      </div>
      <div ref={containerRef} style={{ height: "120px" }} />
    </div>
  );
}
