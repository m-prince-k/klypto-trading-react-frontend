import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import ChartHeader from "../components/tradingModals/ChartHeader";
import { FaFileWaveform } from "react-icons/fa6";
import { Form } from "../components/tradingModals/Form";
import { ChartProprties } from "../util/common";

const CandleStick = () => {
  const containerRef = useRef(null); // DOM container
  const chartRef = useRef(null); // Chart instance
  const [timeframe, setTimeframe] = useState("1m");
  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState(60);
  const [rangeValue, setRangeValue] = useState(1);

  console.log("timeframeValue---------------", timeframeValue);
  useEffect(() => {
    if (!containerRef.current) return;

    // 🟢 Create chart
    const chart = createChart(containerRef.current, ChartProprties);

    chartRef.current = chart; // ✅ store chart instance

    // 🟢 Add candlestick series (v4+ API)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candleSeries.setData([
      { time: "2025-01-01", open: 100, high: 110, low: 95, close: 105 },
      { time: "2025-01-02", open: 105, high: 115, low: 100, close: 112 },
      { time: "2025-01-03", open: 112, high: 120, low: 108, close: 118 },
      { time: "2025-01-04", open: 118, high: 125, low: 110, close: 115 },
      { time: "2025-01-05", open: 115, high: 122, low: 112, close: 120 },
      { time: "2025-01-06", open: 120, high: 130, low: 118, close: 128 },
      { time: "2025-01-07", open: 128, high: 135, low: 120, close: 125 },
      { time: "2025-01-08", open: 125, high: 132, low: 123, close: 130 },
      { time: "2025-01-09", open: 130, high: 138, low: 127, close: 135 },
      { time: "2025-01-10", open: 135, high: 145, low: 132, close: 140 },
      { time: "2025-01-11", open: 140, high: 148, low: 138, close: 142 },
      { time: "2025-01-12", open: 142, high: 150, low: 140, close: 145 },
      { time: "2025-01-13", open: 145, high: 155, low: 142, close: 150 },
      { time: "2025-01-14", open: 150, high: 160, low: 148, close: 158 },
      { time: "2025-01-15", open: 158, high: 165, low: 150, close: 155 },
      { time: "2025-01-16", open: 155, high: 162, low: 148, close: 150 },
      { time: "2025-01-17", open: 150, high: 158, low: 145, close: 152 },
      { time: "2025-01-18", open: 152, high: 160, low: 150, close: 158 },
      { time: "2025-01-19", open: 158, high: 168, low: 155, close: 165 },
      { time: "2025-01-20", open: 165, high: 175, low: 120, close: 150 },
    ]);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [timeframe]);

  // 🔍 Zoom In
  const zoomIn = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return;

    chart.timeScale().setVisibleLogicalRange({
      from: range.from + 1,
      to: range.to - 1,
    });
  };

  // 🔎 Zoom Out
  const zoomOut = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return;

    chart.timeScale().setVisibleLogicalRange({
      from: range.from - 1,
      to: range.to + 1,
    });
  };

  // 🔄 Reset Zoom
  const resetZoom = () => {
    chartRef.current?.timeScale().fitContent();
  };
  function generateCandles(tfSeconds, bars = 100) {
    let time = Math.floor(Date.now() / 1000) - bars * tfSeconds;
    let price = 30000;
    const data = [];

    for (let i = 0; i < bars; i++) {
      const open = price;
      const close = open + (Math.random() - 0.5) * 200;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;

      data.push({
        time,
        open: +open.toFixed(2),
        high: +high.toFixed(2),
        low: +low.toFixed(2),
        close: +close.toFixed(2),
      });

      price = close;
      time += tfSeconds;
    }
    console.log("generatedData", data);
    return data;
  }

  useEffect(() => {
    if (!chartRef.current) return;
    const { chart, series } = chartRef.current;
    console.log("timeframe in candleStick.jsx==================>>>>>>>>>", timeframe.seconds, rangeValue);
    if(timeframe.seconds && rangeValue){ 
      series.setData(generateCandles(60,1));
      chart.timeScale().fitContent();
    }
  }, [timeframe, rangeValue]);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-900">
      {/* Zoom Controls */}
      <ChartHeader
        price="43,250"
        change={2.15}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        setTimeframeValue={setTimeframeValue}
        setRangeValue={rangeValue}
      />
      <div className="ml-3 text-slate-50">
        <button onClick={zoomIn}>➕ Zoom In</button>
        <button onClick={zoomOut} className="ml-3 ">
          ➖ Zoom Out
        </button>
        <button onClick={resetZoom} className="ml-3">
          🔄 Reset
        </button>
      </div>

      {/* Chart */}
      <div ref={containerRef} />

      {/* display data */}
      {/* <div className="mx-8 mt-6">
        <h3 className="font-bold mb-2">Form Data</h3>
        <pre className="bg-gray-100 p-4 rounded">
           {JSON.stringify(data || [], null, 2)} 
        </pre>
      </div> */}

      {/* Slide-in Form */}
      <div
        className={`
            fixed top-0 right-0 h-screen w-[400px] bg-white shadow-xl z-50
            transform transition-transform duration-300 ease-in-out
            ${openForm ? "translate-x-0" : "translate-x-full"}
          `}
      >
        <Form onClose={() => setOpenForm(false)} />
      </div>

      {/* Open Button */}
      {!openForm && (
        <button
          onClick={() => setOpenForm(true)}
          className="fixed bottom-6 right-6 flex items-center gap-1 px-3 py-2
               text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-purple-500 z-50"
        >
          <FaFileWaveform />
        </button>
      )}
    </div>
  );
};

export default CandleStick;
