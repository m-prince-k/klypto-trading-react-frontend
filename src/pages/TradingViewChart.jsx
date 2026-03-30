import React, { useEffect, useRef, useState } from "react";
import { createChart, HistogramSeries } from "lightweight-charts";

const MACDHistogramChart = () => {
  const chartContainerRef = useRef();
  const [chartObj, setChartObj] = useState(null); // Dynamic MACD-like palette

  const [palette, setPalette] = useState({
    positiveRising: "#26A69A", // green
    positiveFalling: "#A5D6A7", // light green
    negativeRising: "#EF5350", // red
    negativeFalling: "#F8BBD0", // pink
  });

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: 900,
      height: 500,
      layout: { backgroundColor: "#FFFFFF", textColor: "#000" },
      grid: {
        vertLines: { color: "#F0F0F0" },
        horzLines: { color: "#F0F0F0" },
      },
      rightPriceScale: { visible: true },
      timeScale: { visible: true },
    }); // Sample data

    const rawData = Array.from({ length: 30 }, (_, i) => ({
      time: `2026-03-${(i + 1).toString().padStart(2, "0")}`,
      value: Math.floor(Math.random() * 40 - 20), // -20 to +20
    })); // Function to apply MACD-style colors

    const coloredData = rawData.map((d, i, arr) => {
      let color = palette.positiveRising;

      if (d.value >= 0) {
        if (i === 0 || d.value >= arr[i - 1].value)
          color = palette.positiveRising;
        else color = palette.positiveFalling;
      } else {
        if (i === 0 || d.value >= arr[i - 1].value)
          color = palette.negativeRising;
        else color = palette.negativeFalling;
      }

      return { ...d, color };
    });

    const histogramSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      scaleMargins: { top: 0.1, bottom: 0.1 },
    });

    histogramSeries.setData(coloredData);

    setChartObj({ chart, histogramSeries, rawData });

    return () => chart.remove();
  }, []); // Update colors dynamically

  useEffect(() => {
    if (!chartObj) return;

    const coloredData = chartObj.rawData.map((d, i, arr) => {
      let color = palette.positiveRising;

      if (d.value >= 0) {
        if (i === 0 || d.value >= arr[i - 1].value)
          color = palette.positiveRising;
        else color = palette.positiveFalling;
      } else {
        if (i === 0 || d.value >= arr[i - 1].value)
          color = palette.negativeRising;
        else color = palette.negativeFalling;
      }

      return { ...d, color };
    });

    chartObj.histogramSeries.setData(coloredData);
  }, [palette, chartObj]);

  return (
    <div>
            
      <div style={{ marginBottom: 10 }}>
                
        <label>
                    Positive Rising:           
          <input
            type="color"
            value={palette.positiveRising}
            onChange={(e) =>
              setPalette({ ...palette, positiveRising: e.target.value })
            }
          />
                  
        </label>{" "}
                
        <label>
                    Positive Falling:           
          <input
            type="color"
            value={palette.positiveFalling}
            onChange={(e) =>
              setPalette({ ...palette, positiveFalling: e.target.value })
            }
          />
                  
        </label>{" "}
                
        <label>
                    Negative Rising:           
          <input
            type="color"
            value={palette.negativeRising}
            onChange={(e) =>
              setPalette({ ...palette, negativeRising: e.target.value })
            }
          />
                  
        </label>{" "}
                
        <label>
                    Negative Falling:           
          <input
            type="color"
            value={palette.negativeFalling}
            onChange={(e) =>
              setPalette({ ...palette, negativeFalling: e.target.value })
            }
          />
                  
        </label>
              
      </div>
            <div ref={chartContainerRef}></div>
          
    </div>
  );
};

export default MACDHistogramChart;
