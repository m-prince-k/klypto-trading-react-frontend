import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
} from "lightweight-charts";

function hexToRGBA(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Dummy candles
const dummyCandles = Array.from({ length: 100 }, (_, i) => {
  const open = 100 + Math.random() * 10;
  const close = open + (Math.random() - 0.5) * 5;
  const high = Math.max(open, close) + Math.random() * 2;
  const low = Math.min(open, close) - Math.random() * 2;
  const volume = 100 + Math.random() * 50;
  return { time: i, open, high, low, close, volume };
});

// VWAP LOGIC (same)
function calculateVWAP(candles, settings) {
  let cumulativePV = 0;
  let cumulativeVolume = 0;

  let prices = [];

  const vwapData = [];
  const upperBands = settings.bandMultipliers.map(() => []);
  const lowerBands = settings.bandMultipliers.map(() => []);

  candles.forEach((candle, i) => {
    const { open, high, low, close, volume } = candle;

    let price;
    switch (settings.source) {
      case "hl2": price = (high + low) / 2; break;
      case "close": price = close; break;
      case "open": price = open; break;
      case "high": price = high; break;
      case "low": price = low; break;
      case "volume": price = volume; break;
      default: price = (high + low + close) / 3;
    }

    cumulativePV += price * volume;
    cumulativeVolume += volume;

    const vwap = cumulativePV / cumulativeVolume;
    prices.push(price);

    let stdDev = 0;
    if (settings.bandMode === "std") {
      const mean = vwap;
      let variance = 0;
      for (let j = 0; j < prices.length; j++) {
        variance += Math.pow(prices[j] - mean, 2);
      }
      variance /= prices.length;
      stdDev = Math.sqrt(variance);
    }

    vwapData.push({ time: i + settings.offset, value: vwap });

    settings.bandMultipliers.forEach((mult, idx) => {
      let upper, lower;

      if (settings.bandMode === "percentage") {
        const percent = (vwap * mult) / 100;
        upper = vwap + percent;
        lower = vwap - percent;
      } else {
        upper = vwap + stdDev * mult;
        lower = vwap - stdDev * mult;
      }

      upperBands[idx].push({ time: i + settings.offset, value: upper });
      lowerBands[idx].push({ time: i + settings.offset, value: lower });
    });
  });

  return { vwapData, upperBands, lowerBands };
}

export default function DynamicVWAPChart() {
  const chartRef = useRef();

  const [settings, setSettings] = useState({
    source: "hlc3",
    bandMode: "std",
    offset: 0,
    bandMultipliers: [1, 2, 3],
    vwapColor: "#2962FF",
    bandColor: "#00C853",
    lineWidth: 2,
  });

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 900,
      height: 450,
      layout: { backgroundColor: "#fff", textColor: "#000" },
    });

    const candleSeries = chart.addSeries(CandlestickSeries);
    candleSeries.setData(dummyCandles);

    const { vwapData, upperBands, lowerBands } = calculateVWAP(
      dummyCandles,
      settings
    );

    // VWAP
    const vwapSeries = chart.addSeries(LineSeries, {
      color: settings.vwapColor,
      lineWidth: settings.lineWidth,
    });
    vwapSeries.setData(vwapData);

    // Bands
    settings.bandMultipliers.forEach((_, i) => {
      const upper = chart.addSeries(LineSeries, {
        color: settings.bandColor,
        lineWidth: 1,
      });

      const lower = chart.addSeries(LineSeries, {
        color: settings.bandColor,
        lineWidth: 1,
      });

      upper.setData(upperBands[i]);
      lower.setData(lowerBands[i]);
    });

    chartRef.current.style.position = "relative";
    // ✅ REAL CLOUD (MAIN FIX)
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.zIndex = "10";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    chartRef.current.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = chartRef.current.clientWidth;
      canvas.height = chartRef.current.clientHeight;
    }
    resizeCanvas();

    function drawCloud() {
      const timeScale = chart.timeScale();
      const refSeries = vwapSeries; // ✅ important

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      settings.bandMultipliers.forEach((_, i) => {
        const upperData = upperBands[i];
        const lowerData = lowerBands[i];

        ctx.beginPath();

        upperData.forEach((point, idx) => {
          const x = timeScale.timeToCoordinate(point.time);
          const y = refSeries.priceToCoordinate(point.value);

          if (x === null || y === null) return;

          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        for (let j = lowerData.length - 1; j >= 0; j--) {
          const point = lowerData[j];
          const x = timeScale.timeToCoordinate(point.time);
          const y = refSeries.priceToCoordinate(point.value);

          if (x === null || y === null) continue;

          ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fillStyle = hexToRGBA(settings.bandColor, 0.08 + i * 0.03);
        ctx.fill();
      });
    }

    chart.timeScale().subscribeVisibleTimeRangeChange(drawCloud);
    chart.subscribeCrosshairMove(drawCloud);

    setTimeout(drawCloud, 0);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      drawCloud();
    });
    resizeObserver.observe(chartRef.current);

    return () => chart.remove();
  }, [settings]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <select
          value={settings.bandMode}
          onChange={(e) =>
            setSettings({ ...settings, bandMode: e.target.value })
          }
        >
          <option value="std">STD</option>
          <option value="percentage">%</option>
        </select>

        <select
          value={settings.source}
          onChange={(e) =>
            setSettings({ ...settings, source: e.target.value })
          }
        >
          <option value="hlc3">hlc3</option>
          <option value="hl2">hl2</option>
          <option value="close">close</option>
          <option value="open">open</option>
        </select>

        <input
          type="number"
          value={settings.offset}
          onChange={(e) =>
            setSettings({
              ...settings,
              offset: parseInt(e.target.value) || 0,
            })
          }
        />

        <input
          type="color"
          value={settings.vwapColor}
          onChange={(e) =>
            setSettings({ ...settings, vwapColor: e.target.value })
          }
        />

        <input
          type="color"
          value={settings.bandColor}
          onChange={(e) =>
            setSettings({ ...settings, bandColor: e.target.value })
          }
        />

        {settings.bandMultipliers.map((val, i) => (
          <input
            key={i}
            type="number"
            value={val}
            onChange={(e) => {
              const arr = [...settings.bandMultipliers];
              arr[i] = Number(e.target.value);
              setSettings({ ...settings, bandMultipliers: arr });
            }}
          />
        ))}
      </div>

      <div ref={chartRef} style={{ position: "relative" }}></div>
    </div>
  );
}