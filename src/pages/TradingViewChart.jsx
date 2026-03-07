import React, { useEffect, useRef, useState } from "react";
import { createChart, LineSeries } from "lightweight-charts";

export default function TradingViewChart() {

  const chartRef = useRef(null);
  const rsiSeriesRef = useRef(null);

  const [upper, setUpper] = useState(70);
  const [middle, setMiddle] = useState(50);
  const [lower, setLower] = useState(30);

  useEffect(() => {

    const chart = createChart(chartRef.current, {
      height: 400,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
    });

    const rsiSeries = chart.addSeries(LineSeries,{
      color: "#f97316",
      lineWidth: 2,
    });

    rsiSeriesRef.current = rsiSeries;

    // dummy RSI data
    const data = [];
    let time = 1;

    for (let i = 0; i < 100; i++) {
      data.push({
        time: time++,
        value: Math.random() * 100,
      });
    }

    rsiSeries.setData(data);

    return () => chart.remove();

  }, []);

  // update price lines when values change
  useEffect(() => {

    if (!rsiSeriesRef.current) return;

    // remove old lines
    rsiSeriesRef.current._priceLines?.forEach(line =>
      rsiSeriesRef.current.removePriceLine(line)
    );

    const upperLine = rsiSeriesRef.current.createPriceLine({
      price: upper,
      color: "#ef4444",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "Upper",
    });

    const middleLine = rsiSeriesRef.current.createPriceLine({
      price: middle,
      color: "#22c55e",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "Middle",
    });

    const lowerLine = rsiSeriesRef.current.createPriceLine({
      price: lower,
      color: "#3b82f6",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "Lower",
    });

    rsiSeriesRef.current._priceLines = [
      upperLine,
      middleLine,
      lowerLine,
    ];

  }, [upper, middle, lower]);

  return (
    <div style={{ padding: 20, background: "#020617", color: "white" }}>

      {/* Inputs */}

      <div style={{ marginBottom: 15, display: "flex", gap: 10 }}>

        <div>
          Upper
          <input
            type="number"
            value={upper}
            onChange={(e) => setUpper(Number(e.target.value))}
          />
        </div>

        <div>
          Middle
          <input
            type="number"
            value={middle}
            onChange={(e) => setMiddle(Number(e.target.value))}
          />
        </div>

        <div>
          Lower
          <input
            type="number"
            value={lower}
            onChange={(e) => setLower(Number(e.target.value))}
          />
        </div>

      </div>

      {/* Chart */}

      <div ref={chartRef} />

    </div>
  );
}