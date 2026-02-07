import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

export default function Testing() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const rsiSeriesRef = useRef(null);
  const smaSeriesRef = useRef(null);

  const [style, setStyle] = useState({
    rsiColor: "#2962FF",
    smaColor: "#FF6D00",
    bgColor: "#2962FF",
    bgOpacity: 0.2,
    lineWidth: 2,
    showRSI: true,
    showSMA: true
  });

  // ---------- RSI CALCULATION ----------
  function calculateRSI(data, length = 14) {
    let gains = [];
    let losses = [];

    for (let i = 1; i < data.length; i++) {
      const diff = data[i].close - data[i - 1].close;
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? Math.abs(diff) : 0);
    }

    const rsi = [];

    for (let i = length; i < gains.length; i++) {
      const avgGain =
        gains.slice(i - length, i).reduce((a, b) => a + b, 0) / length;
      const avgLoss =
        losses.slice(i - length, i).reduce((a, b) => a + b, 0) / length;

      const rs = avgGain / avgLoss;
      const value = 100 - 100 / (1 + rs);

      rsi.push({
        time: data[i + 1].time,
        value: value
      });
    }

    return rsi;
  }

  // ---------- SMA ----------
  function calculateSMA(data, length = 14) {
    const sma = [];

    for (let i = length; i < data.length; i++) {
      const avg =
        data
          .slice(i - length, i)
          .reduce((sum, d) => sum + d.close, 0) / length;

      sma.push({
        time: data[i].time,
        value: avg
      });
    }

    return sma;
  }

  // ---------- Chart Init ----------
  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      height: 500,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#DDD"
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" }
      }
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries);
    candleSeriesRef.current = candleSeries;

    const rsiSeries = chart.addSeries(LineSeries, {
      color: style.rsiColor,
      lineWidth: style.lineWidth
    });

    const smaSeries = chart.addSeries(LineSeries, {
      color: style.smaColor,
      lineWidth: style.lineWidth
    });

    rsiSeriesRef.current = rsiSeries;
    smaSeriesRef.current = smaSeries;

    // ---------- Dummy Data ----------
    const data = [];

    let price = 30000;

    for (let i = 0; i < 200; i++) {
      const open = price;
      const close = open + (Math.random() - 0.5) * 500;
      const high = Math.max(open, close) + Math.random() * 200;
      const low = Math.min(open, close) - Math.random() * 200;

      price = close;

      data.push({
        time: 1700000000 + i * 60,
        open,
        high,
        low,
        close
      });
    }

    candleSeries.setData(data);

    const rsiData = calculateRSI(data);
    const smaData = calculateSMA(data);

    rsiSeries.setData(rsiData);
    smaSeries.setData(smaData);

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, []);

  // ---------- STYLE UPDATE ----------
  useEffect(() => {
    if (!rsiSeriesRef.current || !smaSeriesRef.current) return;

    rsiSeriesRef.current.applyOptions({
      color: style.rsiColor,
      lineWidth: style.lineWidth,
      visible: style.showRSI
    });

    smaSeriesRef.current.applyOptions({
      color: style.smaColor,
      lineWidth: style.lineWidth,
      visible: style.showSMA
    });

  }, [style]);

  return (
    <div style={{ display: "flex" }}>
      
      {/* ---------- Indicator Palette ---------- */}
      <div
        style={{
          width: 250,
          padding: 15,
          background: "#111827",
          color: "white"
        }}
      >
        <h4>Indicator Style</h4>

        <label>RSI Color</label>
        <input
          type="color"
          value={style.rsiColor}
          onChange={(e) =>
            setStyle({ ...style, rsiColor: e.target.value })
          }
        />

        <br />

        <label>SMA Color</label>
        <input
          type="color"
          value={style.smaColor}
          onChange={(e) =>
            setStyle({ ...style, smaColor: e.target.value })
          }
        />

        <br />

        <label>Thickness</label>
        <input
          type="range"
          min="1"
          max="5"
          value={style.lineWidth}
          onChange={(e) =>
            setStyle({ ...style, lineWidth: Number(e.target.value) })
          }
        />

        <br />

        <label>
          <input
            type="checkbox"
            checked={style.showRSI}
            onChange={(e) =>
              setStyle({ ...style, showRSI: e.target.checked })
            }
          />
          Show RSI
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={style.showSMA}
            onChange={(e) =>
              setStyle({ ...style, showSMA: e.target.checked })
            }
          />
          Show SMA
        </label>
      </div>

      {/* ---------- Chart ---------- */}
      <div
        ref={chartContainerRef}
        style={{ flex: 1 }}
      />
    </div>
  );
}