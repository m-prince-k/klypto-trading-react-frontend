import React, { useEffect, useRef } from "react";
import { createChart, LineSeries } from "lightweight-charts";

// ---------------- DUMMY DATA ----------------
function generateDummyData(count = 200) {
  const data = [];
  let time = 1672531200;
  let price = 100;

  for (let i = 0; i < count; i++) {
    const open = price;
    const high = open + Math.random() * 5;
    const low = open - Math.random() * 5;
    const close = low + Math.random() * (high - low);

    data.push({ time, open, high, low, close });

    price = close;
    time += 60 * 60;
  }

  return data;
}

// ---------------- ATR ----------------
function calculateATR(data, period = 10) {
  const atr = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      atr.push(null);
      continue;
    }

    const highLow = data[i].high - data[i].low;
    const highClose = Math.abs(data[i].high - data[i - 1].close);
    const lowClose = Math.abs(data[i].low - data[i - 1].close);

    const tr = Math.max(highLow, highClose, lowClose);

    if (i < period) {
      atr.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        const idx = i - j;
        const hl = data[idx].high - data[idx].low;
        const hc = Math.abs(data[idx].high - data[idx - 1]?.close || 0);
        const lc = Math.abs(data[idx].low - data[idx - 1]?.close || 0);
        sum += Math.max(hl, hc, lc);
      }
      atr.push(sum / period);
    }
  }

  return atr;
}

// ---------------- CKS ----------------
function calculateCKS(data, atrPeriod, atrMultiplier, stopPeriod) {
  const atr = calculateATR(data, atrPeriod);

  const longStop = [];
  const shortStop = [];

  for (let i = 0; i < data.length; i++) {
    if (i < stopPeriod || atr[i] == null) {
      longStop.push(null);
      shortStop.push(null);
      continue;
    }

    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = i - stopPeriod + 1; j <= i; j++) {
      highestHigh = Math.max(highestHigh, data[j].high);
      lowestLow = Math.min(lowestLow, data[j].low);
    }

    longStop.push(highestHigh - atr[i] * atrMultiplier);
    shortStop.push(lowestLow + atr[i] * atrMultiplier);
  }

  return data.map((d, i) => ({
    time: d.time,
    longStop: longStop[i],
    shortStop: shortStop[i],
  }));
}

// ---------------- COMPONENT ----------------
export default function ChandeKrollStopChart({
  // ===== INPUT PROPERTIES =====
  candleData = null,
  atrPeriod = 10,
  atrMultiplier = 1,
  stopPeriod = 9,

  // ===== STYLE PROPERTIES =====
  height = 300,
  backgroundColor = "#0D1117",
  textColor = "#DDD",
  gridColor = "#1F2937",

  longColor = "#00E676",
  shortColor = "#FF3D00",
  longLineWidth = 2,
  shortLineWidth = 2,
}) {
  const chartRef = useRef();

  useEffect(() => {
    const data = candleData && candleData.length
      ? candleData
      : generateDummyData();

    const chart = createChart(chartRef.current, {
      height,
      layout: {
        background: { color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      rightPriceScale: { visible: true },
      timeScale: { timeVisible: true },
    });

    // ---------------- CKS ----------------
    const cks = calculateCKS(data, atrPeriod, atrMultiplier, stopPeriod);

    const longSeries = chart.addSeries(LineSeries,{
      color: longColor,
      lineWidth: longLineWidth,
    });

    const shortSeries = chart.addSeries(LineSeries,{
      color: shortColor,
      lineWidth: shortLineWidth,
    });

    const longData = cks
      .filter((d) => d.longStop != null)
      .map((d) => ({ time: d.time, value: d.longStop }));

    const shortData = cks
      .filter((d) => d.shortStop != null)
      .map((d) => ({ time: d.time, value: d.shortStop }));

    longSeries.setData(longData);
    shortSeries.setData(shortData);

    return () => chart.remove();
  }, [
    candleData,
    atrPeriod,
    atrMultiplier,
    stopPeriod,
    height,
    backgroundColor,
    textColor,
    gridColor,
  ]);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: `${height}px` }}
    />
  );
}