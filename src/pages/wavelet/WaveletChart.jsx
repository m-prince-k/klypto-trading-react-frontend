import React, { useEffect, useRef, useState } from "react";
import { CandlestickSeries, createChart, CrosshairMode, createSeriesMarkers, HistogramSeries } from "lightweight-charts";
import WaveletHeatmapPane from "./panes/WaveletHeatmapPane";
import ChaosFractalPane from "./panes/ChaosFractalPane";
import WaveletSignalPane from "./panes/WaveletSignalPane";

export default function WaveletChart({ data }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const [syncedTimeScale, setSyncedTimeScale] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data?.meta?.candles) return;

    // Create main chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: "solid", color: "#0B0E14" },
        textColor: "#8A919E",
      },
      grid: {
        vertLines: { color: "#1E222D" },
        horzLines: { color: "#1E222D" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#1E222D",
      },
      timeScale: {
        borderColor: "#1E222D",
        timeVisible: true,
      },
    });
    chartInstanceRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries,{
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeriesRef.current = candleSeries;

    // Format candle data
    const formattedCandles = data.meta.candles.map((c) => ({
      time: c.time / 1000,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeries.setData(formattedCandles);

    // Add Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // set as an overlay
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% from the top
        bottom: 0,
      },
    });

    const volumeData = data.meta.candles.map((c) => ({
      time: c.time / 1000,
      value: c.volume || Math.random() * 1000, // Fallback if no volume provided
      color: c.close >= c.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
    }));
    volumeSeries.setData(volumeData);

    // Apply Chaos Fractal Markers
    const markers = [];
    if (data.fractals) {
      // fractals is an object or array. Assume object with keys '0', '1', etc.
      const fractalList = Object.values(data.fractals);
      fractalList.forEach((f) => {
        if (!f || !f.time) return;
        
        // Adjust condition based on actual backend format. Assuming f.isTop / f.isBottom
        // from standard fractal logic. Or we extract from f.signal
        if (f.signal === "SELL" || f.isTop) {
          markers.push({
            time: f.time / 1000,
            position: "aboveBar",
            color: "#e91e63",
            shape: "arrowDown",
            text: "Chaos Fractal\n(Top)",
          });
        } else if (f.signal === "BUY" || f.isBottom) {
          markers.push({
            time: f.time / 1000,
            position: "belowBar",
            color: "#4caf50",
            shape: "arrowUp",
            text: "Chaos Fractal\n(Bottom)",
          });
        }
      });
      // Sort markers by time
      markers.sort((a, b) => a.time - b.time);
      createSeriesMarkers(candleSeries, markers);
    }

    // Pass timeScale to sub-components for synchronization
    setSyncedTimeScale(chart.timeScale());

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="wavelet-charts-wrapper">
      {/* OHLCV Overlay - now in normal flow above the chart */}
      {data?.meta?.candles?.length > 0 && (
        <div style={{ padding: '6px 10px', display: 'flex', gap: '12px', fontSize: '11px', color: '#c5cbd5', background: '#0B0E14', borderBottom: '1px solid #1E222D' }}>
          <span style={{ fontWeight: 600, marginRight: 4 }}>BTC/USDT · 1h · BINANCE</span>
          <span>O <span style={{ color: '#4caf50' }}>{data.meta.candles[0].open?.toFixed(2)}</span></span>
          <span>H <span style={{ color: '#4caf50' }}>{data.meta.candles[0].high?.toFixed(2)}</span></span>
          <span>L <span style={{ color: '#ef5350' }}>{data.meta.candles[0].low?.toFixed(2)}</span></span>
          <span>C <span style={{ color: '#4caf50' }}>{data.meta.candles[0].close?.toFixed(2)}</span></span>
          <span style={{ marginLeft: 12 }}>Volume (SMA, 9) <span style={{ color: '#4caf50' }}>{Math.round(data.meta.candles[0].volume || 0).toLocaleString()}</span></span>
        </div>
      )}

      <div className="wavelet-main-chart" ref={chartContainerRef} />
      
      {syncedTimeScale && (
        <>
          <WaveletHeatmapPane data={data} masterTimeScale={syncedTimeScale} candles={data?.meta?.candles} />
          <ChaosFractalPane data={data} masterTimeScale={syncedTimeScale} />
          <WaveletSignalPane data={data} masterTimeScale={syncedTimeScale} />
        </>
      )}
    </div>
  );
}
