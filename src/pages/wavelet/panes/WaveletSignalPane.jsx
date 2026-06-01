import React, { useEffect, useRef } from "react";
import { createChart, HistogramSeries, LineSeries } from "lightweight-charts";

// ── Signal filtering constants ──────────────────────────────────────────────
// Minimum number of candles that must separate two consecutive signals.
// Prevents noise from rapid BUY→SELL→BUY flips on the same wave.
const MIN_SIGNAL_GAP_CANDLES = 10;

/**
 * Filters the raw signal array from the API into clean, spaced signals.
 *
 * Rules applied (in order):
 *  1. Only accept entries where s.signal is "BUY"/"UP" or "SELL"/"DOWN"
 *  2. Skip consecutive signals of the same type (dedup)
 *  3. Enforce MIN_SIGNAL_GAP_CANDLES candles between any two signals
 *
 * The goal is to surface meaningful trend-flip points, not every wiggle.
 */
function filterSignals(signalsData) {
  const result = [];
  let lastType = null;
  let lastIndex = -Infinity;

  signalsData.forEach((s, idx) => {
    const raw = s.signal;
    const type =
      raw === "UP"   || raw === "BUY"  ? "buy" :
      raw === "DOWN" || raw === "SELL" ? "sell" : null;

    if (!type) return;                                 // no signal on this candle
    if (type === lastType) return;                     // same direction — skip
    if (idx - lastIndex < MIN_SIGNAL_GAP_CANDLES) return; // too close — skip

    result.push({ ...s, _type: type, _idx: idx });
    lastType  = type;
    lastIndex = idx;
  });

  return result;
}

export default function WaveletSignalPane({ data, masterTimeScale }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data?.wavelet?.signals) return;

    // ── Dispose guard ────────────────────────────────────────────────
    let isDisposed = false;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "transparent" }, textColor: "#8A919E" },
      grid: { vertLines: { color: "#1E222D", style: 2 }, horzLines: { color: "#1E222D", style: 2 } },
      rightPriceScale: { borderColor: "#1E222D", autoScale: true },
      timeScale: { borderColor: "#1E222D", timeVisible: true },
    });

    // ── Time-scale sync (guarded) ─────────────────────────────────────
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
        try { if (range) masterTimeScale.setVisibleLogicalRange(range); } catch (_) {}
      };
      try { chart.timeScale().subscribeVisibleLogicalRangeChange(localSyncHandler); } catch (_) {}
    }

    // ── Prepare data ──────────────────────────────────────────────────
    const signalsData = [...data.wavelet.signals].sort((a, b) => a.time - b.time);

    // Wavelet signal line (blue)
    const signalLine = chart.addSeries(LineSeries, {
      color: "#2196f3",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    signalLine.setData(signalsData.map((s) => ({ time: s.time / 1000, value: s.wave || 0 })));

    // Momentum histogram (green/red bars)
    const histogramSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: { type: "price", precision: 2 },
      base: 0,
    });
    histogramSeries.setData(
      signalsData.map((s) => {
        const m = s.momentum || 0;
        return {
          time: s.time / 1000,
          value: m,
          color: m >= 0 ? "rgba(38, 166, 154, 0.8)" : "rgba(239, 83, 80, 0.8)",
        };
      })
    );

    // Zero baseline
    const zeroLine = chart.addSeries(LineSeries, {
      color: "#555",
      lineWidth: 1,
      lineStyle: 3,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    zeroLine.setData(signalsData.map((s) => ({ time: s.time / 1000, value: 0 })));

    // ── Build filtered signal markers ─────────────────────────────────
    const cleanSignals = filterSignals(signalsData);

    // Clean up any leftover DOM markers from a previous render
    const existingContainer = containerRef.current.querySelector(".markers-container");
    if (existingContainer) existingContainer.remove();

    const markersContainer = document.createElement("div");
    markersContainer.className = "markers-container";
    Object.assign(markersContainer.style, {
      position: "absolute", top: "0", left: "0",
      width: "100%", height: "100%",
      pointerEvents: "none", zIndex: "5",
    });
    containerRef.current.appendChild(markersContainer);

    const domMarkers = cleanSignals.map((s) => {
      const el  = document.createElement("div");
      el.className = "custom-marker-wrapper";

      const box = document.createElement("div");
      box.className = `custom-marker-box ${s._type}`;
      box.innerText = s._type.toUpperCase();

      const dot = document.createElement("div");
      dot.className = `custom-marker-dot ${s._type}`;

      el.appendChild(box);
      el.appendChild(dot);
      markersContainer.appendChild(el);

      return { time: s.time / 1000, el };
    });

    // ── Position markers on every pan/zoom ───────────────────────────
    const updateMarkers = () => {
      if (isDisposed) return;
      try {
        const paneWidth = containerRef.current?.clientWidth ?? 0;
        domMarkers.forEach((m) => {
          const x = chart.timeScale().timeToCoordinate(m.time);
          const y = zeroLine.priceToCoordinate(0);
          if (x === null || y === null || x < 0 || x > paneWidth) {
            m.el.style.display = "none";
            return;
          }
          m.el.style.display = "flex";
          m.el.style.left = `${x}px`;
          m.el.style.top  = `${y - 18}px`;
        });
      } catch (_) {}
    };

    try { chart.timeScale().subscribeVisibleLogicalRangeChange(updateMarkers); } catch (_) {}
    try { chart.timeScale().subscribeSizeChange(updateMarkers); } catch (_) {}

    const initTimer = setTimeout(updateMarkers, 120);

    // ── Resize handler (guarded) ──────────────────────────────────────
    const handleResize = () => {
      if (isDisposed || !containerRef.current) return;
      try {
        chart.applyOptions({ width: containerRef.current.clientWidth });
        updateMarkers();
      } catch (_) {}
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      isDisposed = true;
      clearTimeout(initTimer);

      window.removeEventListener("resize", handleResize);

      if (masterTimeScale && syncHandler) {
        try { masterTimeScale.unsubscribeVisibleLogicalRangeChange(syncHandler); } catch (_) {}
      }
      try { chart.timeScale().unsubscribeVisibleLogicalRangeChange(localSyncHandler); } catch (_) {}
      try { chart.timeScale().unsubscribeVisibleLogicalRangeChange(updateMarkers); } catch (_) {}
      try { chart.timeScale().unsubscribeSizeChange(updateMarkers); } catch (_) {}

      if (markersContainer && containerRef.current?.contains(markersContainer)) {
        containerRef.current.removeChild(markersContainer);
      }

      try { chart.remove(); } catch (_) {}   // synchronous — no setTimeout
    };
  }, [data, masterTimeScale]);

  return (
    <div className="wavelet-pane-wrapper">
      <div className="wavelet-pane-title">WAVELET + CHAOS FRACTAL SIGNALS</div>
      <div className="wavelet-legend">
        <div className="legend-item">
          <div className="legend-color-box" style={{ backgroundColor: "#2196f3" }} />
          <span>Wavelet Signal Line</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-dashed" style={{ borderColor: "#4caf50" }} />
          <span>Signal Strength</span>
        </div>
      </div>
      <div ref={containerRef} style={{ height: "120px" }} />
    </div>
  );
}
