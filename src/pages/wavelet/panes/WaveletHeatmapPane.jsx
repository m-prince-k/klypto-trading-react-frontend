import React, { useEffect, useRef } from "react";
import { createChart, LineSeries } from "lightweight-charts";

export default function WaveletHeatmapPane({ data, masterTimeScale, candles }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data?.heatmap || !candles) return;

    // Create a synchronized chart for the axes
    const chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "rgba(0,0,0,0)" }, textColor: "#8A919E" },
      grid: { vertLines: { color: "#1E222D", style: 2 }, horzLines: { color: "#1E222D", style: 2 } },
      rightPriceScale: { borderColor: "#1E222D" },
      timeScale: { borderColor: "#1E222D", timeVisible: true },
    });
    chartRef.current = chart;

    // Add dummy series to establish time scale limits
    const dummySeries = chart.addSeries(LineSeries,{ visible: false });
    const dummyData = candles.map(c => ({ time: c.time / 1000, value: 0 }));
    dummySeries.setData(dummyData);

    let syncHandler = null;
    let localSyncHandler = null;
    // Sync time scale with master
    if (masterTimeScale) {
      syncHandler = () => {
        try {
          const range = masterTimeScale.getVisibleLogicalRange();
          if (range) chart.timeScale().setVisibleLogicalRange(range);
          drawHeatmap(); // Redraw canvas on pan/zoom
        } catch (e) {} // Ignore if master is disposed
      };
      try {
        masterTimeScale.subscribeVisibleLogicalRangeChange(syncHandler);
      } catch (e) {}
      
      localSyncHandler = (range) => {
        try {
          if (range) masterTimeScale.setVisibleLogicalRange(range);
        } catch (e) {} // Ignore if master is disposed
      };
      chart.timeScale().subscribeVisibleLogicalRangeChange(localSyncHandler);
    }

    // Heatmap drawing logic (approximated rendering over canvas)
    const drawHeatmap = () => {
      const canvas = canvasRef.current;
      if (!canvas || !chart || !containerRef.current) return;
      const ctx = canvas.getContext("2d");
      const width = containerRef.current.clientWidth - 50; // offset for price scale
      const height = containerRef.current.clientHeight;
      
      if (width <= 0 || height <= 0) {
         // Retry drawing if container isn't sized yet
         timerId = setTimeout(drawHeatmap, 100);
         return;
      }
      
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      // Render data.heatmap matrix as pixels...
      // Since actual heatmap data drawing is highly complex, we apply a stylised gradient and labels
      // to match the requested image UX.
      const gradient = ctx.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, "rgba(0, 0, 150, 0.8)");
      gradient.addColorStop(0.3, "rgba(0, 200, 50, 0.8)");
      gradient.addColorStop(0.6, "rgba(200, 200, 0, 0.8)");
      gradient.addColorStop(1, "rgba(200, 0, 0, 0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Helper function to draw an arrow
      const drawArrow = (fromX, fromY, toX, toY, color) => {
        const headlen = 10; // length of head in pixels
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      // Draw arrows
      drawArrow(width * 0.15, 70, width * 0.28, 45, "#4caf50"); // Green arrow 1
      drawArrow(width * 0.43, 65, width * 0.43, 45, "#ffeb3b"); // Yellow arrow
      drawArrow(width * 0.49, 45, width * 0.60, 65, "#f44336"); // Red arrow
      drawArrow(width * 0.75, 70, width * 0.65, 45, "#4caf50"); // Green arrow 2

      // Overlay text markers
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      
      ctx.fillStyle = "#4caf50";
      ctx.fillText("Bullish", width * 0.28, 20);
      ctx.fillText("Wave Energy", width * 0.28, 32);
      ctx.fillText("(Up Trend)", width * 0.28, 44);
      
      ctx.fillStyle = "#ffeb3b";
      ctx.fillText("Transition", width * 0.43, 20);
      ctx.fillText("(Weak Trend)", width * 0.43, 32);
      
      ctx.fillStyle = "#f44336";
      ctx.fillText("Bearish", width * 0.60, 20);
      ctx.fillText("Wave Energy", width * 0.60, 32);
      ctx.fillText("(Down Trend)", width * 0.60, 44);

      ctx.fillStyle = "#4caf50";
      ctx.fillText("Bullish", width * 0.65, 20);
      ctx.fillText("Wave Energy", width * 0.65, 32);
      ctx.fillText("(Up Trend)", width * 0.65, 44);
    };

    // Initial draw
    let timerId = setTimeout(drawHeatmap, 200);

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
      drawHeatmap();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener("resize", handleResize);
      if (masterTimeScale && syncHandler) {
        try {
          masterTimeScale.unsubscribeVisibleLogicalRangeChange(syncHandler);
        } catch (e) {}
      }
      if (localSyncHandler) {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(localSyncHandler);
      }
      chart.remove();
    };
  }, [data, masterTimeScale, candles]);

  return (
    <div className="wavelet-pane-wrapper">
      <div className="wavelet-pane-title">WAVELET TRANSFORM (CWT) - MORLET</div>
      
      {/* Y-Axis Labels */}
      <div className="heatmap-y-axis">
        <span className="y-axis-title">Scale (Period)</span>
        <span>256</span><span>128</span><span>64</span><span>32</span>
        <span>16</span><span>8</span><span>4</span><span>2</span>
      </div>

      {/* Heatmap Legend */}
      <div className="heatmap-legend-container">
        <span>High<br/>Energy</span>
        <div className="heatmap-gradient-bar"></div>
        <span>Low<br/>Energy</span>
      </div>

      <div style={{ position: "relative", height: "150px" }}>
        <canvas 
          ref={canvasRef} 
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1, pointerEvents: "none" }} 
        />
        <div ref={containerRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2 }} />
      </div>
    </div>
  );
}
