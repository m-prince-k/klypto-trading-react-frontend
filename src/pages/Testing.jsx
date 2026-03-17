import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

const Testing = () => {

 const sampleData = [
  { time: 1672531200, open: 100, high: 105, low: 95, close: 102 },
  { time: 1672534800, open: 102, high: 108, low: 100, close: 107 },
  { time: 1672538400, open: 107, high: 112, low: 105, close: 110 },
  { time: 1672542000, open: 110, high: 115, low: 108, close: 109 },
  { time: 1672545600, open: 109, high: 111, low: 103, close: 104 },
  { time: 1672549200, open: 104, high: 106, low: 98, close: 100 },
  { time: 1672552800, open: 100, high: 103, low: 95, close: 97 },
  { time: 1672556400, open: 97, high: 102, low: 96, close: 101 },
  { time: 1672560000, open: 101, high: 107, low: 100, close: 106 },
  { time: 1672563600, open: 106, high: 110, low: 104, close: 108 },

  { time: 1672567200, open: 108, high: 109, low: 102, close: 103 },
  { time: 1672570800, open: 103, high: 105, low: 99, close: 100 },
  { time: 1672574400, open: 100, high: 104, low: 98, close: 103 },
  { time: 1672578000, open: 103, high: 108, low: 101, close: 107 },
  { time: 1672581600, open: 107, high: 112, low: 105, close: 111 },
  { time: 1672585200, open: 111, high: 116, low: 109, close: 115 },
  { time: 1672588800, open: 115, high: 120, low: 113, close: 118 },
  { time: 1672592400, open: 118, high: 122, low: 116, close: 121 },
  { time: 1672596000, open: 121, high: 125, low: 118, close: 119 },
  { time: 1672599600, open: 119, high: 121, low: 114, close: 115 },

  { time: 1672603200, open: 115, high: 117, low: 110, close: 111 },
  { time: 1672606800, open: 111, high: 113, low: 105, close: 107 },
  { time: 1672610400, open: 107, high: 109, low: 101, close: 103 },
  { time: 1672614000, open: 103, high: 106, low: 98, close: 100 },
  { time: 1672617600, open: 100, high: 104, low: 97, close: 102 },
  { time: 1672621200, open: 102, high: 108, low: 100, close: 106 },
  { time: 1672624800, open: 106, high: 112, low: 104, close: 110 },
  { time: 1672628400, open: 110, high: 115, low: 108, close: 114 },
  { time: 1672632000, open: 114, high: 118, low: 112, close: 117 },
  { time: 1672635600, open: 117, high: 120, low: 115, close: 119 },

  { time: 1672639200, open: 119, high: 122, low: 116, close: 118 },
  { time: 1672642800, open: 118, high: 120, low: 112, close: 114 },
  { time: 1672646400, open: 114, high: 116, low: 108, close: 110 },
  { time: 1672650000, open: 110, high: 112, low: 104, close: 106 },
  { time: 1672653600, open: 106, high: 108, low: 100, close: 102 },
  { time: 1672657200, open: 102, high: 105, low: 98, close: 101 },
  { time: 1672660800, open: 101, high: 107, low: 99, close: 105 },
  { time: 1672664400, open: 105, high: 110, low: 103, close: 109 },
  { time: 1672668000, open: 109, high: 114, low: 107, close: 113 },
  { time: 1672671600, open: 113, high: 118, low: 111, close: 117 },

  { time: 1672675200, open: 117, high: 121, low: 115, close: 120 },
  { time: 1672678800, open: 120, high: 125, low: 118, close: 123 },
  { time: 1672682400, open: 123, high: 127, low: 121, close: 125 },
  { time: 1672686000, open: 125, high: 128, low: 122, close: 124 },
  { time: 1672689600, open: 124, high: 126, low: 119, close: 120 },
  { time: 1672693200, open: 120, high: 122, low: 115, close: 117 },
  { time: 1672696800, open: 117, high: 119, low: 111, close: 113 },
  { time: 1672700400, open: 113, high: 115, low: 108, close: 109 },
  { time: 1672704000, open: 109, high: 111, low: 103, close: 105 },
  { time: 1672707600, open: 105, high: 108, low: 100, close: 102 },

  { time: 1672711200, open: 102, high: 106, low: 99, close: 104 },
  { time: 1672714800, open: 104, high: 110, low: 102, close: 108 },
  { time: 1672718400, open: 108, high: 114, low: 106, close: 112 },
  { time: 1672722000, open: 112, high: 118, low: 110, close: 116 },
  { time: 1672725600, open: 116, high: 120, low: 114, close: 119 }
];
  const chartContainerRef = useRef();

  // 🔥 Convert normal candles → Heikin Ashi
  const calculateHeikinAshi = (candles) => {
    if (!candles || candles.length === 0) return [];

    const haData = [];

    candles.forEach((candle, i) => {
      const { open, high, low, close, time } = candle;

      const haClose = (open + high + low + close) / 4;

      let haOpen;
      if (i === 0) {
        haOpen = (open + close) / 2;
      } else {
        const prev = haData[i - 1];
        haOpen = (prev.open + prev.close) / 2;
      }

      const haHigh = Math.max(high, haOpen, haClose);
      const haLow = Math.min(low, haOpen, haClose);

      haData.push({
        time,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose
      });
    });

    return haData;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#d1d5db"
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" }
      }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350"
    });

  

    const haData = calculateHeikinAshi(sampleData);

    candleSeries.setData(haData);

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [sampleData]);

  return <div ref={chartContainerRef} style={{ width: "100%" }} />;
};

export default Testing;