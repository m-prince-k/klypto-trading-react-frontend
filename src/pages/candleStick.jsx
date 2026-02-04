import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries, BarSeries, AreaSeries, HistogramSeries, BaselineSeries, CustomSeries } from "lightweight-charts";
import { ChartProprties } from "../util/common";
import { FaFileWaveform } from "react-icons/fa6";
import { Form } from "../components/tradingModals/Form";
import ChartHeader from "../components/tradingModals/ChartHeader";

const ohlcData = [
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
    ];

export default function ChartDemoCandle() {
    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);


    
  const [timeframe, setTimeframe] = useState("1m");
  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState(60);
  const [rangeValue, setRangeValue] = useState(1);

    const [chartType, setChartType] = useState("candlestick");

    // Create chart ONCE
    useEffect(() => {
        chartRef.current = createChart(containerRef.current, 
          ChartProprties
        );

        return () => chartRef.current?.remove();
    }, []);

    // Reload series when chartType changes
    useEffect(() => {
        loadSeries(chartType);
    }, [chartType]);


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

    const clearSeries = () => {
        if (!chartRef.current || !seriesRef.current) return;

        try {
            chartRef.current.removeSeries(seriesRef.current);
        } catch (e) {
            console.warn("Series already removed");
        }

        seriesRef.current = null;
    };

    const loadSeries = (type) => {
        const chart = chartRef.current;
        if (!chart) return;

        clearSeries();

        let series;

        if (type === "line") {
            series = chart.addSeries(LineSeries, { color: "#38bdf8" });
            series.setData(
                ohlcData.map(d => ({ time: d.time, value: d.close }))
            );
        }

        if (type === "bar") {
            series = chart.addSeries(BarSeries, {});
            series.setData(ohlcData);
        }

        if (type === "area") {
            series = chart.addSeries(AreaSeries, {
                topColor: "rgba(56,189,248,0.4)",
                bottomColor: "rgba(56,189,248,0)",
                lineColor: "#38bdf8",
            });
            series.setData(
                ohlcData.map(d => ({ time: d.time, value: d.close }))
            );
        }

        if (type === "candlestick") {
            series = chart.addSeries(CandlestickSeries, {
                  upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
            });
            series.setData(ohlcData);
        }

        if (type === "baseline") {
            series = chart.addSeries(BaselineSeries, {
                baseValue: { type: "price", price: 100 },
                topLineColor: "#22c55e",
                bottomLineColor: "#ef4444",
                topFillColor1: "rgba(34,197,94,0.3)",
                bottomFillColor1: "rgba(239,68,68,0.3)",
            });
            series.setData(
                ohlcData.map(d => ({ time: d.time, value: d.close }))
            );
        }

        if (type === "histogram") {
            series = chart.addSeries(HistogramSeries, {
                priceFormat: { type: "volume" },
                priceScaleId: "",
            });
            series.setData(
                ohlcData.map(d => ({
                    time: d.time,
                    value: Math.floor(Math.random() * 3000 + 1000),
                    color: d.close >= d.open ? "#22c55e" : "#ef4444",
                }))
            );
        }
        
    //      if (type === "custom") {
    //   series = chart.addSeries(CustomSeries,
    //     { priceLineVisible: false },
    //     {
    //       renderer: {
    //         draw(ctx, priceToY, timeToX, data) {
    //           ctx.fillStyle = "#fbbf24";
    //           data.forEach(point => {
    //             const x = timeToX(point.time);
    //             const y = priceToY(point.value);
    //             if (x !== null && y !== null) {
    //               ctx.beginPath();
    //               ctx.arc(x, y, 4, 0, Math.PI * 2);
    //               ctx.fill();
    //             }
    //           });
    //         },
    //       },
    //     }
    //   );
    //   series.setData(ohlcData.map(d => ({ time: d.time,value: d.close}) ));
    // }


        seriesRef.current = series;
        chart.timeScale().fitContent();
    };

    return (
        <div className="w-screen h-screen flex flex-col bg-slate-900">
            {/* Dropdown */}
            <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                style={{ marginBottom: "10px" }}
            >
                <option value="candlestick">Candlestick</option>
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="area">Area</option>
                <option value="baseline">Baseline</option>
                <option value="histogram">Histogram (Volume)</option>
                  {/* <option value="custom">Custom Series</option> */}
            </select>
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
}