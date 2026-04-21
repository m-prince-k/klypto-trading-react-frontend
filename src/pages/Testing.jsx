import React, { useState, useRef, useEffect } from "react";
import {
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  createChart,
  LineSeries,
} from "lightweight-charts";

const chartTypes = ["Candlestick", "Line", "Bar", "Area"];

export default function App() {
  const [rawData, setRawData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://192.168.1.7:5000/api/scannerDetail?interval=1d&day=300",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rules: [
                {
                  object1: {
                    indicator: "max",
                    length: 20,
                    timeframe: "1d",
                    inputIndicator: {
                      indicator: "sma",
                      length: 9,
                      timeframe: "1d",
                      inputIndicator: "volume",
                    },
                  },
                  operator1: ">",
                  object2: {
                    indicator: "number",
                    value: 20,
                  },
                },
              ],
            }),
          }
        );

        const data = await res.json();

        setRawData(data.data?.["1d"] || {});
      } catch (err) {
        console.error("API Error:", err);
      }
    };

    fetchData();
  }, []);

  const [hovered, setHovered] = useState(null);
  const [meta, setMeta] = useState(null);
  const [chartType, setChartType] = useState("Candlestick");

  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const seriesRef = useRef(null);

  // ---------------- CREATE CHART ONCE ----------------
  useEffect(() => {
    const chart = createChart(containerRef.current, {
      width: 750,
      height: 420,
      layout: {
        background: { color: "#0F0F0F" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
      rightPriceScale: { borderColor: "#333" },
      timeScale: { borderColor: "#333" },
    });

    chartRef.current = chart;

    return () => chart.remove();
  }, []);

  // ---------------- SERIES ----------------
  const renderSeries = (type, data) => {
    const chart = chartRef.current;

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
    }

    let series;

    if (type === "Candlestick") {
      series = chart.addSeries(CandlestickSeries, {
        upColor: "#00FF88",
        downColor: "#FF4D4F",
        borderVisible: false,
      });

      series.setData(data);
    }

    if (type === "Line") {
      series = chart.addSeries(LineSeries, { color: "#00FF88" });
      series.setData(data.map((d) => ({ time: d.time, value: d.close })));
    }

    if (type === "Bar") {
      series = chart.addSeries(BarSeries, {
        upColor: "#00FF88",
        downColor: "#FF4D4F",
        borderVisible: false,
      });
      series.setData(data);
    }

    if (type === "Area") {
      series = chart.addSeries(AreaSeries, {
        topColor: "rgba(0,255,136,0.3)",
        bottomColor: "rgba(0,255,136,0.0)",
        lineColor: "#00FF88",
      });

      series.setData(data.map((d) => ({ time: d.time, value: d.close })));
    }

    seriesRef.current = series;
  };

  // ---------------- HOVER LOGIC ----------------
  useEffect(() => {
    if (!hovered) return;

    const data = rawData[hovered];

    if (!data) return;

    const formatted = data.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    renderSeries(chartType, formatted);

    const last = data[data.length - 1];

    setMeta({
      symbol: hovered,
      open: last.open,
      high: last.high,
      low: last.low,
      close: last.close,
      volume: last.volume,
      interval: "1D",
    });
  }, [hovered, chartType]);

  // :white_check_mark: NEW: CLEAR CHART ON MOUSE LEAVE
  const handleLeave = () => {
    setHovered(null);
    setMeta(null);

    const chart = chartRef.current;
    if (seriesRef.current && chart) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        padding: 20,
        fontFamily: "Arial",
        background: "#FFFFFF",
        height: "100vh",
      }}
    >
      {/* LEFT SCANNER */}
      <div style={{ width: 200, color: "#fff" }}>
        <h3>Scanner</h3>

        {Object.keys(rawData).map((sym) => (
          <div
            key={sym}
            onMouseEnter={() => setHovered(sym)}
            onMouseLeave={handleLeave}   // :white_check_mark: ONLY ADDITION
            style={{
              padding: 10,
              border: "1px solid #333",
              marginBottom: 8,
              cursor: "pointer",
              background: hovered === sym ? "#1A1A1A" : "#111",
              color: "#fff",
            }}
          >
            {sym}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ marginLeft: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            style={{ padding: 6 }}
          >
            {chartTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select style={{ padding: 6 }}>
            <option>1D</option>
            <option>1H</option>
            <option>15m</option>
          </select>

          <button style={{ padding: "6px 10px" }}>+ Add indicator</button>
        </div>

        {meta && (
          <div
            style={{
              background: "#111",
              color: "#fff",
              padding: 10,
              marginBottom: 10,
              borderRadius: 6,
              display: "flex",
              gap: 15,
              fontSize: 13,
            }}
          >
            <b>{meta.symbol}</b>
            <span>O:{meta.open}</span>
            <span>H:{meta.high}</span>
            <span>L:{meta.low}</span>
            <span>C:{meta.close}</span>
            <span>V:{meta.volume}</span>
            <span>{meta.interval}</span>
          </div>
        )}

        <div ref={containerRef} />
      </div>
    </div>
  );
}