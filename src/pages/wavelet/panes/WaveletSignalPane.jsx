import React, { useEffect, useRef } from "react";
import { createChart, HistogramSeries, LineSeries } from "lightweight-charts";

export default function WaveletSignalPane({ data, masterTimeScale }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data?.wavelet?.signals) return;

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
        const range = masterTimeScale.getVisibleLogicalRange();
        if (range) chart.timeScale().setVisibleLogicalRange(range);
      };
      masterTimeScale.subscribeVisibleLogicalRangeChange(syncHandler);
      
      localSyncHandler = (range) => {
        if (range) masterTimeScale.setVisibleLogicalRange(range);
      };
      chart.timeScale().subscribeVisibleLogicalRangeChange(localSyncHandler);
    }

    const signalsData = data.wavelet.signals;
    signalsData.sort((a, b) => a.time - b.time);

    // Wavelet Signal Line
    const signalLine = chart.addSeries(LineSeries,{
      color: "#2196f3", // Blue line
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const waveData = signalsData.map(s => ({ time: s.time / 1000, value: s.wave || 0 }));
    signalLine.setData(waveData);

    // Signal Strength Histogram
    const histogramSeries = chart.addSeries(HistogramSeries,{
      color: "#26a69a",
      priceFormat: { type: 'price', precision: 2 },
      base: 0,
    });
    const histData = signalsData.map(s => {
      const momentum = s.momentum || 0;
      return {
        time: s.time / 1000,
        value: momentum,
        color: momentum >= 0 ? "rgba(38, 166, 154, 0.8)" : "rgba(239, 83, 80, 0.8)"
      };
    });
    histogramSeries.setData(histData);

    // Baseline (Zero Line)
    const zeroLine = chart.addSeries(LineSeries, { color: "#888888", lineWidth: 1, lineStyle: 3, priceLineVisible: false, lastValueVisible: false });
    zeroLine.setData(signalsData.map(s => ({ time: s.time / 1000, value: 0 })));

    // Custom HTML Markers — clean up any existing container first (React StrictMode guard)
    const existingContainer = containerRef.current.querySelector('.markers-container');
    if (existingContainer) existingContainer.remove();

    const markersContainer = document.createElement('div');
    markersContainer.className = 'markers-container';
    markersContainer.style.position = 'absolute';
    markersContainer.style.top = '0';
    markersContainer.style.left = '0';
    markersContainer.style.width = '100%';
    markersContainer.style.height = '100%';
    markersContainer.style.pointerEvents = 'none';
    markersContainer.style.zIndex = '5';
    containerRef.current.appendChild(markersContainer);

    const domMarkers = [];
    let lastSignal = null;
    signalsData.forEach(s => {
      const type = (s.signal === "UP" || s.signal === "BUY") ? 'buy' : ((s.signal === "DOWN" || s.signal === "SELL") ? 'sell' : null);
      if (!type || type === lastSignal) {
        if (type) lastSignal = type;
        return;
      }
      lastSignal = type;
      
      const el = document.createElement('div');
      el.className = 'custom-marker-wrapper';
      
      const box = document.createElement('div');
      box.className = `custom-marker-box ${type}`;
      box.innerText = type.toUpperCase();
      
      const dot = document.createElement('div');
      dot.className = `custom-marker-dot ${type}`;

      el.appendChild(box);
      el.appendChild(dot);

      markersContainer.appendChild(el);
      domMarkers.push({ time: s.time / 1000, el });
    });

    const updateMarkers = () => {
      if (!chart || !zeroLine) return;
      try {
        domMarkers.forEach(m => {
          const x = chart.timeScale().timeToCoordinate(m.time);
          const y = zeroLine.priceToCoordinate(0);
          if (x === null || y === null || x < 0 || x > containerRef.current.clientWidth) {
            m.el.style.display = 'none';
            return;
          }
          m.el.style.display = 'flex';
          m.el.style.left = `${x}px`;
          // Position the dot exactly at the zero line
          m.el.style.top = `${y - 18}px`; 
        });
      } catch(e) {}
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(updateMarkers);
    chart.timeScale().subscribeSizeChange(updateMarkers);
    
    // Initial sync
    setTimeout(updateMarkers, 100);

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
      updateMarkers();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (masterTimeScale && syncHandler) {
        try {
          masterTimeScale.unsubscribeVisibleLogicalRangeChange(syncHandler);
        } catch (e) {}
      }
      if (localSyncHandler) {
        try {
          chart.timeScale().unsubscribeVisibleLogicalRangeChange(localSyncHandler);
          chart.timeScale().unsubscribeVisibleLogicalRangeChange(updateMarkers);
          chart.timeScale().unsubscribeSizeChange(updateMarkers);
        } catch(e) {}
      }
      if (markersContainer && containerRef.current && containerRef.current.contains(markersContainer)) {
        containerRef.current.removeChild(markersContainer);
      }
      setTimeout(() => {
        try { chart.remove(); } catch(e) {}
      }, 0);
    };
  }, [data, masterTimeScale]);

  return (
    <div className="wavelet-pane-wrapper">
      <div className="wavelet-pane-title">WAVELET + CHAOS FRACTAL SIGNALS</div>
      <div className="wavelet-legend">
        <div className="legend-item"><div className="legend-color-box" style={{backgroundColor: '#2196f3'}}></div> <span>Wavelet Signal Line</span></div>
        <div className="legend-item"><div className="legend-color-dashed" style={{borderColor: '#4caf50'}}></div> <span>Signal Strength</span></div>
      </div>
      <div ref={containerRef} style={{ height: "120px" }} />
    </div>
  );
}
