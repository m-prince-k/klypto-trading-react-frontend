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
  const [ohlcv, setOhlcv] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data?.meta?.candles) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: "solid", color: "#0B0E14" },
        textColor: "#8A919E",
      },
      grid: {
        vertLines: { color: "#1E222D" },
        horzLines: { color: "#1E222D" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#1E222D" },
      timeScale: { borderColor: "#1E222D", timeVisible: true },
    });
    chartInstanceRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeriesRef.current = candleSeries;

    const formattedCandles = data.meta.candles.map((c) => ({
      time: c.time / 1000,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeries.setData(formattedCandles);

    // Zoom in to show last ~120 candles on initial load
    const totalCandles = formattedCandles.length;
    const zoomCount = Math.min(120, totalCandles);
    chart.timeScale().setVisibleLogicalRange({
      from: totalCandles - zoomCount - 0.5,
      to: totalCandles + 2,
    });

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "",
      scaleMargins: { top: 0.82, bottom: 0 },
    });
    const volumeData = data.meta.candles.map((c) => ({
      time: c.time / 1000,
      value: c.volume || 0,
      color: c.close >= c.open ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)",
    }));
    volumeSeries.setData(volumeData);

    // Chaos Fractal markers on main chart
    const markers = [];
    if (data.fractals) {
      Object.values(data.fractals).forEach((f) => {
        if (!f || !f.time) return;
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
      markers.sort((a, b) => a.time - b.time);
      createSeriesMarkers(candleSeries, markers);
    }

    // Update OHLCV on crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData) {
        const bar = param.seriesData.get(candleSeries);
        if (bar) {
          setOhlcv({
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
          });
          return;
        }
      }
      // Default to last candle
      const last = data.meta.candles[data.meta.candles.length - 1];
      if (last) setOhlcv({ open: last.open, high: last.high, low: last.low, close: last.close });
    });

    // Init with last candle
    const last = data.meta.candles[data.meta.candles.length - 1];
    const first = data.meta.candles[0];
    if (last) setOhlcv({ open: last.open, high: last.high, low: last.low, close: last.close, volume: last.volume });

    setSyncedTimeScale(chart.timeScale());

    const handleResize = () => {
      if (chartContainerRef.current)
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  const candles = data?.meta?.candles || [];
  const last = candles.length ? candles[candles.length - 1] : null;
  const first = candles.length ? candles[0] : null;
  const displayOhlcv = ohlcv || (last ? { open: last.open, high: last.high, low: last.low, close: last.close, volume: last.volume } : null);
  const change = displayOhlcv && first ? displayOhlcv.close - first.open : 0;
  const changePct = first?.open ? (change / first.open) * 100 : 0;
  const isUp = change >= 0;
  const changeColor = isUp ? "#26a69a" : "#ef5350";

  // SMA-9 volume approximation
  const smaVol = candles.length >= 9
    ? candles.slice(-9).reduce((s, c) => s + (c.volume || 0), 0) / 9
    : last?.volume || 0;

  return (
    <div className="wavelet-charts-wrapper">
      {/* ── OHLCV Header Bar ─────────────────────────────────────── */}
      {displayOhlcv && (
        <div className="tv-ohlcv-bar">
          <span className="tv-ohlcv-title">BTC/USDT · 1h · BINANCE</span>
          <span style={{ color: "#8a919e" }}>
            O&nbsp;<span style={{ color: displayOhlcv.open >= (first?.open || displayOhlcv.open) ? "#26a69a" : "#ef5350" }}>
              {displayOhlcv.open?.toFixed(1)}
            </span>
          </span>
          <span style={{ color: "#8a919e" }}>H&nbsp;<span style={{ color: "#26a69a" }}>{displayOhlcv.high?.toFixed(1)}</span></span>
          <span style={{ color: "#8a919e" }}>L&nbsp;<span style={{ color: "#ef5350" }}>{displayOhlcv.low?.toFixed(1)}</span></span>
          <span style={{ color: "#8a919e" }}>C&nbsp;<span style={{ color: changeColor }}>{displayOhlcv.close?.toFixed(1)}</span></span>
          <span style={{ color: changeColor }}>
            {isUp ? "+" : ""}{change.toFixed(1)} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
          </span>
          <span style={{ color: "#8a919e", marginLeft: 8 }}>
            Volume (SMA, 9)&nbsp;
            <span style={{ color: "#26a69a" }}>{Math.round(smaVol).toLocaleString()}</span>
          </span>
        </div>
      )}

      {/* ── Main Candlestick Chart ────────────────────────────────── */}
      <div className="wavelet-main-chart" ref={chartContainerRef} />

      {/* ── Sub Panes ────────────────────────────────────────────── */}
      {syncedTimeScale && (
        <>
          <WaveletHeatmapPane data={data} masterTimeScale={syncedTimeScale} candles={candles} />
          <ChaosFractalPane data={data} masterTimeScale={syncedTimeScale} />
          <WaveletSignalPane data={data} masterTimeScale={syncedTimeScale} />
        </>
      )}
    </div>
  );
}
