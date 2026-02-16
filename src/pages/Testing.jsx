import React, { useEffect, useRef } from "react";
import { createChart, LineSeries, CandlestickSeries } from "lightweight-charts";

export default function Testing() {
  const chartRef = useRef();

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 900,
      height: 500,

      layout: {
        background: { type: "solid", color: "#ffffff" },
        textColor: "#334155",
      },

      grid: {
        vertLines: { color: "#e2e8f0" },
        horzLines: { color: "#e2e8f0" },
      },

      rightPriceScale: {
        scaleMargins: {
          top: 0.05,
          bottom: 0.05,
        },
      },

      timeScale: {
        timeVisible: true,
        rightBarSpacing: 40,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries);

    const smaSeries = chart.addSeries(LineSeries, {
      color: "#0ea5e9",
      lineWidth: 2,
    });

    const rsiSeries = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    /* ---------------- MOCK DATA ---------------- */

    const candles = [
      { time: 1700000000, open: 100, high: 110, low: 95, close: 105 },
      { time: 1700000600, open: 105, high: 115, low: 100, close: 110 },
      { time: 1700001200, open: 110, high: 118, low: 108, close: 112 },
      { time: 1700001800, open: 112, high: 120, low: 109, close: 115 },
    ];

    const sma = [
      { time: 1700000000, value: 102 },
      { time: 1700000600, value: 106 },
      { time: 1700001200, value: 109 },
      { time: 1700001800, value: 113 },
    ];

    const rsiRaw = [
      { time: 1700000000, value: 45 },
      { time: 1700000600, value: 52 },
      { time: 1700001200, value: 48 },
      { time: 1700001800, value: 60 },
    ];

    candleSeries.setData(candles);
    smaSeries.setData(sma);

    /* ---------------- RSI SCALING MAGIC ---------------- */

    const highs = candles.map(c => c.high);
    const priceMax = Math.max(...highs);

    const BAND_HEIGHT = 20; // visual thickness of RSI pane
    const BAND_OFFSET = 10; // gap above candles

    function scaleRSI(rsiValue) {
      const bandLow = priceMax + BAND_OFFSET;
      const bandHigh = bandLow + BAND_HEIGHT;

      return bandLow + (rsiValue / 100) * BAND_HEIGHT;
    }

    const rsiScaled = rsiRaw.map(r => ({
      time: r.time,
      value: scaleRSI(r.value),
    }));

    rsiSeries.setData(rsiScaled);

    return () => chart.remove();
  }, []);

  return <div ref={chartRef} />;
}
