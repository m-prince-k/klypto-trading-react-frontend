import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function CandlestickMACDChart() {
  const chartContainerRef = useRef();

  useEffect(() => {
    // ---------------- Dummy Candlestick Data ----------------
    const candles = [
      { time: 1, open: 100, high: 105, low: 95, close: 102 },
      { time: 2, open: 102, high: 108, low: 101, close: 106 },
      { time: 3, open: 106, high: 110, low: 104, close: 107 },
      { time: 4, open: 107, high: 109, low: 103, close: 105 },
      { time: 5, open: 105, high: 107, low: 100, close: 101 },
      { time: 6, open: 101, high: 104, low: 98, close: 100 },
      { time: 7, open: 100, high: 103, low: 95, close: 97 },
      { time: 8, open: 97, high: 100, low: 93, close: 99 },
      { time: 9, open: 99, high: 102, low: 96, close: 101 },
      { time: 10, open: 101, high: 106, low: 100, close: 104 },
      { time: 11, open: 104, high: 108, low: 103, close: 107 },
      { time: 12, open: 107, high: 111, low: 105, close: 110 },
      { time: 13, open: 110, high: 112, low: 107, close: 108 },
      { time: 14, open: 108, high: 109, low: 104, close: 105 },
      { time: 15, open: 105, high: 106, low: 101, close: 103 },
    ];

    // ---------------- EMA Helper ----------------
    const EMA = (values, period) => {
      const k = 2 / (period + 1);
      let emaArr = [];
      values.forEach((price, i) => {
        if (i === 0) emaArr.push(price);
        else emaArr.push(price * k + emaArr[i - 1] * (1 - k));
      });
      return emaArr;
    };

    // ---------------- MACD Calculation ----------------
    const closes = candles.map(c => c.close);
    const ema12 = EMA(closes, 12);
    const ema26 = EMA(closes, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = EMA(macdLine.slice(25), 9);
    const histogram = macdLine.slice(25).map((macd, i) => macd - signalLine[i]);

    // ---------------- Histogram Colors ----------------
    const colors = histogram.map((val, i, arr) => {
      if (i === 0) return val >= 0 ? "#00b300" : "#ff0000";
      const prev = arr[i - 1];

      if (val >= 0 && val >= prev) return "#00b300";       // Bullish Increasing
      if (val >= 0 && val < prev) return "#99ff99";       // Bullish Decreasing
      if (val < 0 && val <= prev) return "#ff0000";       // Bearish Increasing
      if (val < 0 && val > prev) return "#ff99cc";        // Bearish Decreasing
      return "#888888";
    });

    // ---------------- Create Chart ----------------
    const chart = createChart(chartContainerRef.current, {
      width: 900,
      height: 500,
      layout: { backgroundColor: "#ffffff", textColor: "#000" },
      rightPriceScale: { borderColor: "#cccccc" },
      timeScale: { borderColor: "#cccccc" },
    });

    // ---------------- Candlestick Series ----------------
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(candles.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })));

    // ---------------- MACD Histogram Series (Separate Pane) ----------------
    const histSeries = chart.addHistogramSeries({
      color: "#26a69a",
      scaleMargins: { top: 0.85, bottom: 0 },  // histogram pane below
      priceFormat: { type: 'volume' },
      priceScaleId: '', // separate Y-axis
    });
    histSeries.setData(histogram.map((value, index) => ({
      time: candles.slice(25)[index].time,
      value: value,
      color: colors[index],
    })));

    // Cleanup chart on unmount
    return () => chart.remove();
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>
        Candlestick + MACD Histogram (4 Colors)
      </h2>
      <div ref={chartContainerRef} />
    </div>
  );
}