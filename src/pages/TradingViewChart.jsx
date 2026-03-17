import React, { useEffect, useRef, useState } from "react";
import { AreaSeries, createChart, LineSeries } from "lightweight-charts";

const sampleData = [
  { time: 1678886400, open: 70000, high: 72000, low: 69000, close: 71000 },
  { time: 1678972800, open: 71000, high: 73000, low: 70000, close: 72500 },
  { time: 1679059200, open: 72500, high: 73500, low: 71000, close: 71500 },
  { time: 1679145600, open: 71500, high: 74000, low: 71000, close: 73500 },
  { time: 1679232000, open: 73500, high: 75000, low: 73000, close: 74500 },
  { time: 1679318400, open: 74500, high: 75500, low: 74000, close: 75000 },
  { time: 1679404800, open: 75000, high: 76000, low: 74500, close: 75500 },
  { time: 1679491200, open: 75500, high: 77000, low: 75000, close: 76500 },
  { time: 1679577600, open: 76500, high: 78000, low: 76000, close: 77500 },
  { time: 1679664000, open: 77500, high: 79000, low: 77000, close: 78500 },
  { time: 1679750400, open: 78500, high: 79500, low: 78000, close: 79000 },
  { time: 1679836800, open: 79000, high: 80000, low: 78500, close: 79500 },
  { time: 1679923200, open: 79500, high: 81000, low: 79000, close: 80500 },
  { time: 1680009600, open: 80500, high: 82000, low: 80000, close: 81500 },
  { time: 1680096000, open: 81500, high: 82500, low: 81000, close: 82000 },
  { time: 1680182400, open: 82000, high: 83000, low: 81500, close: 82500 },
  { time: 1680268800, open: 82500, high: 83500, low: 82000, close: 83000 },
  { time: 1680355200, open: 83000, high: 84000, low: 82500, close: 83500 },
  { time: 1680441600, open: 83500, high: 84500, low: 83000, close: 84000 },
  { time: 1680528000, open: 84000, high: 85000, low: 83500, close: 84500 },
  { time: 1680614400, open: 84500, high: 85500, low: 84000, close: 85000 },
  { time: 1680700800, open: 85000, high: 86000, low: 84500, close: 85500 },
  { time: 1680787200, open: 85500, high: 86500, low: 85000, close: 86000 },
  { time: 1680873600, open: 86000, high: 87000, low: 85500, close: 86500 },
  { time: 1680960000, open: 86500, high: 87500, low: 86000, close: 87000 },
  { time: 1681046400, open: 87000, high: 88000, low: 86500, close: 87500 },
  { time: 1681132800, open: 87500, high: 88500, low: 87000, close: 88000 },
  { time: 1681219200, open: 88000, high: 89000, low: 87500, close: 88500 },
  { time: 1681305600, open: 88500, high: 89500, low: 88000, close: 89000 },
  { time: 1681392000, open: 89000, high: 90000, low: 88500, close: 89500 },
  { time: 1681478400, open: 89500, high: 90500, low: 89000, close: 90000 },
  { time: 1681564800, open: 90000, high: 91000, low: 89500, close: 90500 },
  { time: 1681651200, open: 90500, high: 91500, low: 90000, close: 91000 },
  { time: 1681737600, open: 91000, high: 92000, low: 90500, close: 91500 },
  { time: 1681824000, open: 91500, high: 92500, low: 91000, close: 92000 },
  { time: 1681910400, open: 92000, high: 93000, low: 91500, close: 92500 },
  { time: 1681996800, open: 92500, high: 93500, low: 92000, close: 93000 },
  { time: 1682083200, open: 93000, high: 94000, low: 92500, close: 93500 },
  { time: 1682169600, open: 93500, high: 94500, low: 93000, close: 94000 },
  { time: 1682256000, open: 94000, high: 95000, low: 93500, close: 94500 },
  { time: 1682342400, open: 94500, high: 95500, low: 94000, close: 95000 },
  { time: 1682428800, open: 95000, high: 96000, low: 94500, close: 95500 },
  { time: 1682515200, open: 95500, high: 96500, low: 95000, close: 96000 },
  { time: 1682601600, open: 96000, high: 97000, low: 95500, close: 96500 },
  { time: 1682688000, open: 96500, high: 97500, low: 96000, close: 97000 },
  { time: 1682774400, open: 97000, high: 98000, low: 96500, close: 97500 },
  { time: 1682860800, open: 97500, high: 98500, low: 97000, close: 98000 },
  { time: 1682947200, open: 98000, high: 99000, low: 97500, close: 98500 },
  { time: 1683033600, open: 98500, high: 99500, low: 98000, close: 99000 },
  { time: 1683120000, open: 99000, high: 100000, low: 98500, close: 99500 },
];

function calculateSuperTrend(data, period = 3, multiplier = 3) {
  let result = [];
  let upTrend = [];
  let downTrend = [];
  let finalTrend = [];

  for (let i = 0; i < data.length; i++) {
    const prev = i > 0 ? data[i - 1] : data[i];
    const hl2 = data[i].close; // simple approximation

    const basicUpper = hl2 + multiplier;
    const basicLower = hl2 - multiplier;

    if (i === 0) {
      upTrend.push(basicUpper);
      downTrend.push(basicLower);
      finalTrend.push(data[i].close);
    } else {
      upTrend.push(Math.min(basicUpper, upTrend[i - 1]));
      downTrend.push(Math.max(basicLower, downTrend[i - 1]));
      finalTrend.push(data[i].close >= finalTrend[i - 1] ? upTrend[i] : downTrend[i]);
    }

    result.push({
      time: data[i].time,
      value: finalTrend[i],
      trend: data[i].close >= finalTrend[i - 1] ? "up" : "down",
    });
  }

  return result;
}

export default function TradingViewChart() {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const upLineRef = useRef();
  const downLineRef = useRef();
  const areaRef = useRef();

  const [upLineColor, setUpLineColor] = useState("#00ff00");
  const [downLineColor, setDownLineColor] = useState("#ff0000");
  const [upAreaColor, setUpAreaColor] = useState("rgba(0,255,0,0.1)");
  const [downAreaColor, setDownAreaColor] = useState("rgba(255,0,0,0.1)");

  useEffect(() => {
    chartRef.current = createChart(chartContainerRef.current, {
      width: 800,
      height: 400,
      layout: { backgroundColor: "#1b1b1b", textColor: "#d1d4dc" },
      grid: { vertLines: { color: "#333" }, horzLines: { color: "#333" } },
    });

    upLineRef.current = chartRef.current.addSeries(LineSeries,{ color: upLineColor, lineWidth: 2 });
    downLineRef.current = chartRef.current.addSeries(LineSeries,{ color: downLineColor, lineWidth: 2 });
    areaRef.current = chartRef.current.addSeries(AreaSeries,{
      topColor: upAreaColor,
      bottomColor: downAreaColor,
      lineWidth: 0,
    });

    updateChart();

    return () => chartRef.current.remove();
  }, []);

  useEffect(() => {
    if (upLineRef.current) upLineRef.current.applyOptions({ color: upLineColor });
  }, [upLineColor]);

  useEffect(() => {
    if (downLineRef.current) downLineRef.current.applyOptions({ color: downLineColor });
  }, [downLineColor]);

  useEffect(() => {
    if (areaRef.current) areaRef.current.applyOptions({ topColor: upAreaColor, bottomColor: downAreaColor });
  }, [upAreaColor, downAreaColor]);

  const updateChart = () => {
    const superTrendData = calculateSuperTrend(sampleData);

   const upTrendData = superTrendData
  .map(d => (d.trend === "up" ? { time: d.time, value: d.value } : undefined))
  .filter(d => d); // undefined points remove

const downTrendData = superTrendData
  .map(d => (d.trend === "down" ? { time: d.time, value: d.value } : undefined))
  .filter(d => d);

    upLineRef.current.setData(upTrendData);
    downLineRef.current.setData(downTrendData);
    areaRef.current.setData(superTrendData.map(d => ({ time: d.time, value: d.value })));
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Up Line Color:
          <input type="color" value={upLineColor} onChange={e => setUpLineColor(e.target.value)} />
        </label>
        <label style={{ marginLeft: 10 }}>
          Down Line Color:
          <input type="color" value={downLineColor} onChange={e => setDownLineColor(e.target.value)} />
        </label>
        <label style={{ marginLeft: 10 }}>
          Up Background Color:
          <input type="color" value={upAreaColor} onChange={e => setUpAreaColor(e.target.value + "33")} />
        </label>
        <label style={{ marginLeft: 10 }}>
          Down Background Color:
          <input type="color" value={downAreaColor} onChange={e => setDownAreaColor(e.target.value + "33")} />
        </label>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}