import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

const INDICATOR_LIST = [
  { key: "ema", label: "EMA (20)" },
  { key: "sma", label: "SMA (20)" },
];

export default function ChartWithMultiSelect() {
  const containerRef = useRef();
  const chartRef = useRef();
  const candleSeriesRef = useRef();
  const indicatorSeriesRef = useRef({}); // map → { ema: series }

  const [candles, setCandles] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState([]);

  /* ---------------- CREATE CHART ---------------- */

  useEffect(() => {
    chartRef.current = createChart(containerRef.current, {
      width: 900,
      height: 500,
      layout: {
        background: { color: "white" },
        textColor: "#111",
      },
    });

    candleSeriesRef.current = chartRef.current.addSeries(CandlestickSeries);

    fetchCandles();

    return () => chartRef.current.remove();
  }, []);

  /* ---------------- FETCH BINANCE DATA ---------------- */

  async function fetchCandles() {
    const res = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=300"
    );

    const data = await res.json();

    const formatted = data.map((c) => ({
      time: c[0] / 1000,
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
    }));

    setCandles(formatted);
    candleSeriesRef.current.setData(formatted);
  }

  /* ---------------- INDICATOR MATH ---------------- */

  function calculateSMA(data, period = 20) {
    const result = [];

    for (let i = period; i < data.length; i++) {
      const slice = data.slice(i - period, i);
      const avg =
        slice.reduce((sum, c) => sum + c.close, 0) / period;

      result.push({ time: data[i].time, value: avg });
    }

    return result;
  }

  function calculateEMA(data, period = 20) {
    const result = [];
    const k = 2 / (period + 1);

    let prev = data[0].close;

    for (let i = 1; i < data.length; i++) {
      const value = data[i].close * k + prev * (1 - k);
      prev = value;

      result.push({ time: data[i].time, value });
    }

    return result;
  }

  /* ---------------- ADD / REMOVE SERIES ---------------- */

  useEffect(() => {
    if (!candles.length) return;

    INDICATOR_LIST.forEach((ind) => {
      const exists = indicatorSeriesRef.current[ind.key];
      const selected = selectedIndicators.includes(ind.key);

      // ADD
      if (selected && !exists) {
        const series = chartRef.current.addSeries(LineSeries, {
          color: ind.key === "ema" ? "#f59e0b" : "#3b82f6",
          lineWidth: 2,
        });

        const data =
          ind.key === "ema"
            ? calculateEMA(candles)
            : calculateSMA(candles);

        series.setData(data);

        indicatorSeriesRef.current[ind.key] = series;
      }

      // REMOVE
      if (!selected && exists) {
        chartRef.current.removeSeries(exists);
        delete indicatorSeriesRef.current[ind.key];
      }
    });
  }, [selectedIndicators, candles]);

  /* ---------------- UI HANDLER ---------------- */

  function toggleIndicator(key) {
    setSelectedIndicators((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div style={{ position: "relative" }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setOpen(!open)}>
          Indicators ▾
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: 35,
              left: 0,
              background: "white",
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: 10,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              zIndex: 10,
            }}
          >
            {INDICATOR_LIST.map((ind) => (
              <label
                key={ind.key}
                style={{
                  display: "flex",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  padding: "4px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIndicators.includes(ind.key)}
                  onChange={() => toggleIndicator(ind.key)}
                />
                {ind.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <div ref={containerRef} />
    </div>
  );
}
