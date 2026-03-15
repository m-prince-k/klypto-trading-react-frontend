// -------------React kumo cloud fill b/w two lines --------

import React, { useEffect, useRef } from "react";
import { AreaSeries, createChart, LineSeries } from "lightweight-charts";

export default function IchimokuCloud() {
  const chartRef = useRef();

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 900,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      }
    });

    // Senkou Span A
    const spanA = chart.addSeries(LineSeries,{
      color: "#00a000",
      lineWidth: 2
    });

    // Senkou Span B
    const spanB = chart.addSeries(LineSeries,{
      color: "#d00000",
      lineWidth: 2
    });

    // GREEN CLOUD
    const cloudGreen = chart.addSeries(AreaSeries,{
      lineColor: "transparent",
      topColor: "rgba(0,200,0,0.4)",
      bottomColor: "rgba(0,200,0,0.1)"
    });

    // RED CLOUD
    const cloudRed = chart.addSeries(AreaSeries,{
      lineColor: "transparent",
      topColor: "rgba(200,0,0,0.4)",
      bottomColor: "rgba(200,0,0,0.1)"
    });

    const spanAData = [
      { time: "2024-01-01", value: 100 },
      { time: "2024-01-02", value: 110 },
      { time: "2024-01-03", value: 105 },
      { time: "2024-01-04", value: 115 }
    ];

    const spanBData = [
      { time: "2024-01-01", value: 95 },
      { time: "2024-01-02", value: 100 },
      { time: "2024-01-03", value: 102 },
      { time: "2024-01-04", value: 108 }
    ];

    spanA.setData(spanAData);
    spanB.setData(spanBData);

    const greenCloudData = [];
    const redCloudData = [];

    for (let i = 0; i < spanAData.length; i++) {
      const time = spanAData[i].time;
      const a = spanAData[i].value;
      const b = spanBData[i].value;

      if (a > b) {
        greenCloudData.push({ time, value: a });
        redCloudData.push({ time, value: b });
      } else {
        greenCloudData.push({ time, value: b });
        redCloudData.push({ time, value: a });
      }
    }

    cloudGreen.setData(greenCloudData);
    cloudRed.setData(redCloudData);

    return () => chart.remove();
  }, []);

  return <div ref={chartRef}></div>;
}