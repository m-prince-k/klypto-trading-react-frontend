import React, { useEffect, useRef, useState } from "react";
import { createChart, LineSeries } from "lightweight-charts";

const sampleCandleData = [
  // uptrend
  { time: 1687392000, open: 30000, high: 30500, low: 29500, close: 30400 },
  { time: 1687478400, open: 30400, high: 30800, low: 30200, close: 30700 },
  { time: 1687564800, open: 30700, high: 31200, low: 30500, close: 31000 },
  { time: 1687651200, open: 31000, high: 31500, low: 30800, close: 31400 },
  { time: 1687737600, open: 31400, high: 31800, low: 31200, close: 31700 }, // strong downtrend (force negative aroon)

  { time: 1687824000, open: 31700, high: 31800, low: 31000, close: 31200 },
  { time: 1687910400, open: 31200, high: 31300, low: 30500, close: 30700 },
  { time: 1687996800, open: 30700, high: 30800, low: 30000, close: 30200 },
  { time: 1688083200, open: 30200, high: 30300, low: 29500, close: 29700 },
  { time: 1688169600, open: 29700, high: 29800, low: 29000, close: 29200 }, // sideways / mixed

  { time: 1688256000, open: 29200, high: 29600, low: 28900, close: 29400 },
  { time: 1688342400, open: 29400, high: 29900, low: 29200, close: 29800 },
  { time: 1688428800, open: 29800, high: 30000, low: 29500, close: 29600 },
  { time: 1688515200, open: 29600, high: 30100, low: 29400, close: 30000 },
  { time: 1688601600, open: 30000, high: 30300, low: 29700, close: 29900 },
];

const calculateAroon = (data, period = 14) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) continue;
    let highestIndex = i;
    let lowestIndex = i;
    for (let j = i - period; j <= i; j++) {
      if (data[j].high > data[highestIndex].high) highestIndex = j;
      if (data[j].low < data[lowestIndex].low) lowestIndex = j;
    }
    const aroonUp = ((period - (i - highestIndex)) / period) * 100;
    const aroonDown = ((period - (i - lowestIndex)) / period) * 100;
    result.push({ time: data[i].time, value: aroonUp - aroonDown });
  }
  return result;
};

export default function Testing() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [period, setPeriod] = useState(14);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: { background: { color: "#0F172A" }, textColor: "#FFFFFF" },
      grid: {
        vertLines: { color: "#334155" },
        horzLines: { color: "#334155" },
      },
    });

    const positiveSeries = chart.addSeries(LineSeries, {
      color: "#22C55E",
      lineWidth: 2,
    });

    const negativeSeries = chart.addSeries(LineSeries, {
      color: "#EF4444",
      lineWidth: 2,
    });

    chartRef.current = { chart, positiveSeries, negativeSeries };

    const handleResize = () => {
      if (!chartContainerRef.current) return;
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const { chart, positiveSeries, negativeSeries } = chartRef.current;

    const aroonData = calculateAroon(sampleCandleData, period);
    const positiveData = aroonData
      .filter((d) => d.value >= 0)
      .map((d) => ({ time: d.time, value: d.value }));

    const negativeData = aroonData
      .filter((d) => d.value < 0)
      .map((d) => ({ time: d.time, value: d.value }));

    positiveSeries.setData(positiveData);
    negativeSeries.setData(negativeData);
    chart.timeScale().fitContent();
  }, [period]);

  return (
    <div style={{ padding: 20, background: "#020617", color: "white" }}>
            <h2>Aroon Oscillator (Line)</h2>
            
      <div style={{ marginBottom: 10 }}>
                <label>Period: </label>
                
        <input
          type="number"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
        />
              
      </div>
            
      <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
          
    </div>
  );
}
