import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  createSeriesMarkers,
} from "lightweight-charts";

export default function VolumeChart() {
  const containerRef = useRef();
  const chartRef = useRef();

  const [maLength, setMaLength] = useState(20);
  const [type, setType] = useState("Columns"); // :art: COLORS

  const [upColor, setUpColor] = useState("#26A69A");
  const [downColor, setDownColor] = useState("#EF5350");
  const [maColor, setMaColor] = useState("#FACC15"); // :bar_chart: SAMPLE DATA

  const data = Array.from({ length: 200 }, (_, i) => {
    const base = 30000 + Math.sin(i / 5) * 1000;
    const open = base;
    const close = base + (Math.random() - 0.5) * 500;

    return {
      time: 1688947200 + i * 60, // :white_check_mark: UNIQUE TIME
      open,
      high: open + 300,
      low: open - 300,
      close,
      volume: 10000 + Math.random() * 50000,
    };
  }); // :fire: SMA

  const sma = (arr, len, i) =>
    i + 1 < len
      ? null
      : arr.slice(i - len + 1, i + 1).reduce((a, b) => a + b, 0) / len; // :dart: CREATE CHART

  useEffect(() => {
    const chart = createChart(containerRef.current, {
      height: 500,
      layout: { background: { color: "#020617" }, textColor: "#fff" },
    });

    const candleSeries = chart.addSeries(CandlestickSeries);

    chartRef.current = {
      chart,
      candleSeries,
      volumeSeries: null,
      maSeries: null,
    };

    return () => chart.remove();
  }, []); // :arrows_counterclockwise: UPDATE

  useEffect(() => {
    const chart = chartRef.current.chart; // :broom: REMOVE OLD SERIES

    if (chartRef.current.volumeSeries) {
      chart.removeSeries(chartRef.current.volumeSeries);
    }
    if (chartRef.current.maSeries) {
      chart.removeSeries(chartRef.current.maSeries);
    }

    let volumeSeries; // :bar_chart: CREATE SERIES BASED ON TYPE

    switch (type) {
      case "Area":
      case "Area with breaks":
        volumeSeries = chart.addSeries(AreaSeries, {
          priceScaleId: "volume",
          topColor: upColor,
          bottomColor: "rgba(0,0,0,0)",
          lineColor: upColor,
        });
        break;

      case "Line":
      case "Line with breaks":
      case "Step line":
        volumeSeries = chart.addSeries(LineSeries, {
          priceScaleId: "volume",
          color: upColor,
          lineWidth: 2,
        });
        break;

      case "Cross":
      case "Circles":
        volumeSeries = chart.addSeries(LineSeries, {
          priceScaleId: "volume",
          color: "transparent", // hide line
          lineWidth: 0,
        });
        break;

      case "Histogram":
      case "Columns":
      default:
        volumeSeries = chart.addSeries(HistogramSeries, {
          priceScaleId: "volume",
          priceFormat: { type: "volume" },
        });
    } // :chart_with_downwards_trend: MA SERIES

    const maSeries = chart.addSeries(LineSeries, {
      priceScaleId: "volume",
      color: maColor,
      lineWidth: 2,
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 },
    });

    chartRef.current.volumeSeries = volumeSeries;
    chartRef.current.maSeries = maSeries; // :bar_chart: DATA FORMAT

    const volumeData = data.map((d) => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? upColor : downColor,
    })); // :chart_with_downwards_trend: MA DATA

    const volumes = data.map((d) => d.volume);
    const maData = [];

    for (let i = 0; i < data.length; i++) {
      const val = sma(volumes, maLength, i);
      if (val) {
        maData.push({ time: data[i].time, value: val });
      }
    } // :fire: APPLY TYPES

    if (type === "Cross" || type === "Circles") {
      const cleanData = volumeData.map((d) => ({
        time: d.time,
        value: d.value,
      }));

      volumeSeries.setData(cleanData); // :white_check_mark: FIXED MARKERS

      const markers = volumeData.map((d) => ({
        time: d.time,
        position: "inBar",
        color: d.color,
        shape: type === "Cross" ? "cross" : "circle",
      }));

      createSeriesMarkers(volumeSeries, []); // clear
      createSeriesMarkers(volumeSeries, markers);
    } else {
      volumeSeries.setData(volumeData);
    }

    maSeries.setData(maData);

    chart.timeScale().fitContent();
  }, [type, maLength, upColor, downColor, maColor]);

  return (
    <div style={{ background: "#020617", color: "#fff", padding: 10 }}>
            <h2>:fire: Volume Indicator PRO (Fixed)</h2>
            
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {/* MA LENGTH */}
                
        <input
          type="number"
          value={maLength}
          onChange={(e) => setMaLength(+e.target.value)}
        />
                {/* TYPE SELECT */}
                
        <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option>Columns</option>
                    <option>Histogram</option>
                    <option>Area</option>
                    <option>Area with breaks</option>
                    <option>Line</option>
                    <option>Line with breaks</option>
                    <option>Step line</option>
                    <option>Cross</option>
                    <option>Circles</option>
                  
        </select>
                {/* COLORS */}
                
        <input
          type="color"
          value={upColor}
          onChange={(e) => setUpColor(e.target.value)}
        />
                
        <input
          type="color"
          value={downColor}
          onChange={(e) => setDownColor(e.target.value)}
        />
                
        <input
          type="color"
          value={maColor}
          onChange={(e) => setMaColor(e.target.value)}
        />
              
      </div>
            
      <div ref={containerRef} style={{ marginTop: 10 }} />
          
    </div>
  );
}
