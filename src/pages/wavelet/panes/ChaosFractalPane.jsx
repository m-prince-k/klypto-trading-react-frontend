import React, { useEffect, useRef } from "react";
import { createChart, createSeriesMarkers, LineSeries } from "lightweight-charts";

export default function ChaosFractalPane({ data, masterTimeScale }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data?.fractals) return;

    // ── Guard flag: set to true the moment we start tearing down ──
    let isDisposed = false;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "transparent" }, textColor: "#8A919E" },
      grid: { vertLines: { color: "#1E222D", style: 2 }, horzLines: { color: "#1E222D", style: 2 } },
      rightPriceScale: { borderColor: "#1E222D", autoScale: true },
      timeScale: { borderColor: "#1E222D", timeVisible: true },
    });

    // ── Sync handlers (guarded) ────────────────────────────────────
    let syncHandler = null;
    let localSyncHandler = null;

    if (masterTimeScale) {
      syncHandler = () => {
        if (isDisposed) return;
        try {
          const range = masterTimeScale.getVisibleLogicalRange();
          if (range) chart.timeScale().setVisibleLogicalRange(range);
        } catch (_) {}
      };
      try { masterTimeScale.subscribeVisibleLogicalRangeChange(syncHandler); } catch (_) {}

      localSyncHandler = (range) => {
        if (isDisposed) return;
        try {
          if (range) masterTimeScale.setVisibleLogicalRange(range);
        } catch (_) {}
      };
      try { chart.timeScale().subscribeVisibleLogicalRangeChange(localSyncHandler); } catch (_) {}
    }

    // ── Build series ───────────────────────────────────────────────
    const fractalLine = chart.addSeries(LineSeries, {
      color: "#9c27b0",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const fractalArray = Object.values(data.fractals).filter((f) => f && f.time);
    fractalArray.sort((a, b) => a.time - b.time);

    const strengthData = fractalArray.map((f, i) => ({
      time: f.time / 1000,
      value: f.strength ?? Math.sin(i * 0.5) * 1.5,
    }));
    fractalLine.setData(strengthData);

    const topMarkers = [];
    const bottomMarkers = [];
    fractalArray.forEach((f) => {
      if (f.signal === "SELL" || f.isTop)
        topMarkers.push({ time: f.time / 1000, position: "aboveBar", color: "#f44336", shape: "arrowDown" });
      else if (f.signal === "BUY" || f.isBottom)
        bottomMarkers.push({ time: f.time / 1000, position: "belowBar", color: "#4caf50", shape: "arrowUp" });
    });

    const topZone    = chart.addSeries(LineSeries, { color: "#f44336", lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
    const bottomZone = chart.addSeries(LineSeries, { color: "#4caf50", lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
    const zeroLine   = chart.addSeries(LineSeries, { color: "#555",    lineWidth: 1, lineStyle: 3, priceLineVisible: false, lastValueVisible: false });

    topZone.setData(strengthData.map((d) => ({ time: d.time, value:  1 })));
    bottomZone.setData(strengthData.map((d) => ({ time: d.time, value: -1 })));
    zeroLine.setData(strengthData.map((d) => ({ time: d.time, value:  0 })));

    if (topMarkers.length)    createSeriesMarkers(topZone,    topMarkers);
    if (bottomMarkers.length) createSeriesMarkers(bottomZone, bottomMarkers);

    // ── Resize handler (guarded) ───────────────────────────────────
    const handleResize = () => {
      if (isDisposed || !containerRef.current) return;
      try { chart.applyOptions({ width: containerRef.current.clientWidth }); } catch (_) {}
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ────────────────────────────────────────────────────
    return () => {
      isDisposed = true;                                    // block all callbacks first

      window.removeEventListener("resize", handleResize);

      if (masterTimeScale && syncHandler) {
        try { masterTimeScale.unsubscribeVisibleLogicalRangeChange(syncHandler); } catch (_) {}
      }
      try { chart.timeScale().unsubscribeVisibleLogicalRangeChange(localSyncHandler); } catch (_) {}

      try { chart.remove(); } catch (_) {}                 // synchronous — no setTimeout
    };
  }, [data, masterTimeScale]);

  return (
    <div className="wavelet-pane-wrapper">
      <div className="wavelet-pane-title">CHAOS FRACTAL ANALYSIS</div>
      <div className="wavelet-legend">
        <div className="legend-item"><span className="legend-marker-down">▼</span> <span>Chaos Fractal<br />Top (Sell Zone)</span></div>
        <div className="legend-item"><span className="legend-marker-up">▲</span> <span>Chaos Fractal<br />Bottom (Buy Zone)</span></div>
        <div className="legend-item"><div className="legend-color-box" style={{ backgroundColor: "#9c27b0" }} /> <span>Fractal Strength</span></div>
      </div>
      <div ref={containerRef} style={{ height: "120px" }} />
    </div>
  );
}
