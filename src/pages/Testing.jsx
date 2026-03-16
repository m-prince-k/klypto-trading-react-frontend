import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import axios from "axios";

export default function Testing() {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [candleSeries, setCandleSeries] = useState(null);

  // Track which indicators are selected
  const [selectedIndicators, setSelectedIndicators] = useState({});
  // Cache API data so we don't call again
  const [indicatorDataCache, setIndicatorDataCache] = useState({});

  const indicatorsList = ["EMA", "SMA", "RSI", "MACD"];

  // Initialize chart on mount
  useEffect(() => {
    const container = chartRef.current;
    const newChart = createChart(container, { width: container.clientWidth, height: 500 });
    const candles = newChart.addSeries(CandlestickSeries);
    setChart(newChart);
    setCandleSeries(candles);

    // Dummy candle data
    const candleData = [];
    let price = 100;
    const start = new Date(2024, 2, 1);
    for (let i = 0; i < 150; i++) {
      price += (Math.random() - 0.5) * 4;
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      candleData.push({
        time:`${yyyy}-${mm}-${dd}`,
        open: price - 2,
        high: price + 3,
        low: price - 3,
        close: price,
      });
    }
    candles.setData(candleData);

    return () => newChart.remove();
  }, []);

  // Handle checkbox changes
  const handleCheckboxChange = async (e) => {
    const { name, checked } = e.target;
    setSelectedIndicators((prev) => ({ ...prev, [name]: checked }));

    if (checked && !indicatorDataCache[name]) {
      try {
        // Call API only once per indicator
        const res = await axios.get(`/api/indicators/${name.toLowerCase()}`);
        const data = res.data; // Assume array [{time, value}]
        setIndicatorDataCache((prev) => ({ ...prev, [name]: data }));

        // Add series to chart
        const series = chart.addLineSeries({ color: getIndicatorColor(name), lineWidth: 2 });
        series.setData(data);

        setIndicatorDataCache((prev) => ({
          ...prev,
          [name]: { ...prev[name], series }, // store series reference to remove later
        }));
      } catch (err) {
        console.error(err);
      }
    } else if (!checked && indicatorDataCache[name]?.series) {
      // Remove series if unchecked
      chart.removeSeries(indicatorDataCache[name].series);
      setIndicatorDataCache((prev) => ({
        ...prev,
        [name]: { ...prev[name], series: null },
      }));
    }
  };

  const getIndicatorColor = (name) => {
    switch (name) {
      case "EMA":
        return "#2962FF";
      case "SMA":
        return "#FF5252";
      case "RSI":
        return "#00BCD4";
      case "MACD":
        return "#FFA500";
      default:
        return "#000";
    }
  };

  return (
    <div>
      <h2>Indicators Chart</h2>
      <div style={{ display: "flex", gap: "15px", marginBottom: "10px" }}>
        {indicatorsList.map((indi) => (
          <label key={indi}>
            <input
              type="checkbox"
              name={indi}
              checked={!!selectedIndicators[indi]}
              onChange={handleCheckboxChange}
            />{" "}
            {indi}
          </label>
        ))}
      </div>
      <div ref={chartRef} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}