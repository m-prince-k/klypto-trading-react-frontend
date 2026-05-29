import React, { useEffect, useRef } from "react";
import { CandlestickSeries, createChart } from "lightweight-charts";

export default function WaveletHeatmapChart() {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 🔹 Dummy candle generator
  const generateCandles = (count = 100) => {
    let data = [];
    let time = Math.floor(Date.now() / 1000) - count * 60;
    let price = 100;

    for (let i = 0; i < count; i++) {
      const open = price;
      const close = open + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random();
      const low = Math.min(open, close) - Math.random();

      data.push({
        time,
        open,
        high,
        low,
        close,
      });

      price = close;
      time += 60;
    }

    return data;
  };

  // 🔹 Dummy wavelet data (frequency bands)
  const generateWavelet = (count = 100, bands = 16) => {
    return Array.from({ length: count }, (_, i) => ({
      time: i,
      values: Array.from({ length: bands }, () => Math.random()),
    }));
  };

  // 🎨 Heatmap renderer
  const drawHeatmap = (ctx, data, width, height) => {
    const rows = data[0].values.length;
    const colWidth = width / data.length;
    const rowHeight = height / rows;

    ctx.clearRect(0, 0, width, height);

    data.forEach((col, x) => {
      col.values.forEach((val, y) => {
        const intensity = Math.min(1, val);

        // gradient color
        const r = Math.floor(255 * intensity);
        const g = Math.floor(200 * (1 - intensity));
        const b = 80;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;

        ctx.fillRect(
          x * colWidth,
          height - (y + 1) * rowHeight,
          colWidth,
          rowHeight
        );
      });
    });
  };

  useEffect(() => {
    const container = containerRef.current;

    // 📊 Create chart
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 400,
      layout: {
        background: { color: "#0e0e0e" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries,{
      upColor: "#00ff88",
      downColor: "#ff4444",
      borderVisible: false,
      wickUpColor: "#00ff88",
      wickDownColor: "#ff4444",
    });

    const candles = generateCandles(120);
    candleSeries.setData(candles);

    // 🟧 Canvas setup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = container.clientWidth;
    canvas.height = 400;

    let waveletData = generateWavelet(120, 16);

    drawHeatmap(ctx, waveletData, canvas.width, canvas.height);

    // 🔄 Sync with chart zoom/pan
    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      drawHeatmap(ctx, waveletData, canvas.width, canvas.height);
    });

    // ⚡ Simulate real-time updates
    const interval = setInterval(() => {
      const last = candles[candles.length - 1];
      const newTime = last.time + 60;

      const open = last.close;
      const close = open + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random();
      const low = Math.min(open, close) - Math.random();

      const newCandle = { time: newTime, open, high, low, close };

      candles.push(newCandle);
      candleSeries.update(newCandle);

      // update wavelet
      waveletData.push({
        time: waveletData.length,
        values: Array.from({ length: 16 }, () => Math.random()),
      });

      waveletData.shift();

      drawHeatmap(ctx, waveletData, canvas.width, canvas.height);
    }, 1000);

    return () => {
      clearInterval(interval);
      chart.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
      }}
    >
      {/* Heatmap Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      {/* Chart Container */}
      <div
        ref={(el) => el && chartRef.current?.resize(el.clientWidth, 400)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}