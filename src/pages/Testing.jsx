// MultiPaneTradingViewFixed.jsx
import React, { useEffect, useRef, useState } from 'react';
import { CandlestickSeries, createChart, CrosshairMode, LineSeries } from 'lightweight-charts';

const MultiPaneTradingViewFixed = () => {
  const chartRefs = useRef([]);
  const containerRefs = useRef([]);
  const [hoverInfo, setHoverInfo] = useState('Hover on any chart to see values');

  // 1. OHLC data
  const ohlcData = [
    { time: '2026-02-19', open: 100, high: 105, low: 95, close: 102 },
    { time: '2026-02-20', open: 102, high: 108, low: 101, close: 106 },
    { time: '2026-02-21', open: 106, high: 107, low: 103, close: 104 },
    { time: '2026-02-22', open: 104, high: 110, low: 102, close: 108 },
    { time: '2026-02-23', open: 108, high: 112, low: 107, close: 110 },
  ];

  // 2. Indicators (default)
  const indicators = [
    {
      name: 'ATR',
      color: 'orange',
      onMainChart: true,
      data: [
        { time: '2026-02-19', value: 5 },
        { time: '2026-02-20', value: 6 },
        { time: '2026-02-21', value: 4 },
        { time: '2026-02-22', value: 7 },
        { time: '2026-02-23', value: 3 },
      ],
    },
    {
      name: 'RSI',
      color: 'red',
      onMainChart: false,
      data: [
        { time: '2026-02-19', value: 30 },
        { time: '2026-02-20', value: 35 },
        { time: '2026-02-21', value: 40 },
        { time: '2026-02-22', value: 45 },
        { time: '2026-02-23', value: 50 },
      ],
    },
    {
      name: 'SMA',
      color: 'blue',
      onMainChart: true,
      data: [
        { time: '2026-02-19', value: 101 },
        { time: '2026-02-20', value: 103 },
        { time: '2026-02-21', value: 102 },
        { time: '2026-02-22', value: 106 },
        { time: '2026-02-23', value: 108 },
      ],
    },
    {
      name: 'EMA',
      color: 'green',
      onMainChart: true,
      data: [
        { time: '2026-02-19', value: 100 },
        { time: '2026-02-20', value: 102 },
        { time: '2026-02-21', value: 101 },
        { time: '2026-02-22', value: 105 },
        { time: '2026-02-23', value: 107 },
      ],
    },
    {
      name: 'MACD',
      color: 'purple',
      onMainChart: false,
      data: [
        { time: '2026-02-19', value: 1 },
        { time: '2026-02-20', value: 2 },
        { time: '2026-02-21', value: 0 },
        { time: '2026-02-22', value: 3 },
        { time: '2026-02-23', value: -1 },
      ],
    },
  ];

  useEffect(() => {
    const totalCharts = 1 + indicators.filter(ind => !ind.onMainChart).length;
    const chartHeight = window.innerHeight / totalCharts;

    // 1. Main chart
    const mainChart = createChart(containerRefs.current[0], {
      width: containerRefs.current[0].clientWidth,
      height: chartHeight,
      layout: { backgroundColor: '#fff', textColor: '#000' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { fixRightEdge: true, visible: true }, // show X-axis only on main
    });
    chartRefs.current[0] = mainChart;

    const candleSeries = mainChart.addSeries(CandlestickSeries);
    candleSeries.setData(ohlcData);

    // 2. Main chart indicators
    indicators.forEach((ind) => {
      if (ind.onMainChart) {
        const series = mainChart.addSeries(LineSeries,{ color: ind.color, lineWidth: 2 });
        series.setData(ind.data);
        ind.series = series;
      }
    });

    // 3. Indicator panes
    let paneIndex = 1;
    indicators.forEach((ind) => {
      if (!ind.onMainChart) {
        const chart = createChart(containerRefs.current[paneIndex], {
          width: containerRefs.current[paneIndex].clientWidth,
          height: chartHeight,
          layout: { backgroundColor: '#fff', textColor: '#000' },
          grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
          crosshair: { mode: CrosshairMode.Normal },
          timeScale: { visible: false }, // hide X-axis
        });
        chartRefs.current[paneIndex] = chart;
        const series = chart.addSeries(LineSeries,{ color: ind.color, lineWidth: 2 });
        series.setData(ind.data);
        ind.series = series;
        paneIndex++;
      }
    });

    // 4. Sync hover and crosshair
    chartRefs.current.forEach((sourceChart) => {
      sourceChart.subscribeCrosshairMove((param) => {
        if (!param || !param.time) return;

        const candle = param.seriesData.get(candleSeries);
        const infoText = indicators
          .map((ind) => {
            const seriesValue = param.seriesData.get(ind.series);
            if (seriesValue) return `${ind.name}: ${seriesValue.value}`;
            const idx = ind.data.findIndex((d) => d.time === param.time);
            return idx >= 0 ? `${ind.name}: ${ind.data[idx].value}` : `${ind.name}: -`;
          })
          .join(' | ');

        setHoverInfo(
          `Time: ${param.time} | OHLC: O:${candle?.open} H:${candle?.high} L:${candle?.low} C:${candle?.close} | ${infoText}`
        );

        chartRefs.current.forEach((targetChart) => {
          if (targetChart === sourceChart) return;
          targetChart.timeScale().setVisibleLogicalRange(sourceChart.timeScale().getVisibleLogicalRange());
        });
      });
    });

    return () => chartRefs.current.forEach((c) => c?.remove());
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Main chart */}
      <div ref={(el) => (containerRefs.current[0] = el)} style={{ width: '100%' }} />
      {/* Indicator panes */}
      {indicators
        .filter(ind => !ind.onMainChart)
        .map((_, idx) => (
          <div
            key={idx}
            ref={(el) => (containerRefs.current[idx + 1] = el)}
            style={{ width: '100%' }}
          />
        ))}
      {/* Hover info */}
      <div style={{ marginTop: '5px', fontFamily: 'Arial', fontSize: '14px' }}>{hoverInfo}</div>
    </div>
  );
};

export default MultiPaneTradingViewFixed;