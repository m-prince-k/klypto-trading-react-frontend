import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
  BaselineSeries,
  HistogramSeries,
} from "lightweight-charts";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BsArrowUpRight } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import { chartOptions, convertToHeikinAshi } from "../../util/common";

export default function MiniChart({
  activeSymbol,
  chartData,
  timeframeValue,
  containerRef,
}) {
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [chartType, setChartType] = useState("candlestick");
  const [ohlc, setOhlc] = useState(null);

  const active = chartOptions.find((c) => c.value === chartType);

  // ✅ Create chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: 600,
      height: 350,
      layout: {
        background: { color: "#0F0F0F" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
      timeScale: {
        barSpacing: 10,
      },
    });

    chartRef.current = chart;

    return () => chart.remove();
  }, []);

  // ✅ Update series + legend logic
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !chartData) return;

    // remove old series
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
    }

    let series;

    switch (chartType) {
      case "line":
        series = chart.addSeries(LineSeries, { color: "#60a5fa" });
        series.setData(chartData.map(d => ({ time: d.time, value: d.close })));
        break;

      case "area":
        series = chart.addSeries(AreaSeries, {
          lineColor: "#60a5fa",
          topColor: "rgba(96,165,250,0.4)",
          bottomColor: "rgba(96,165,250,0.05)",
        });
        series.setData(chartData.map(d => ({ time: d.time, value: d.close })));
        break;

      case "bar":
        series = chart.addSeries(BarSeries, {
          upColor: "#00FF88",
          downColor: "#FF4D4F",
        });
        series.setData(chartData);
        break;

      case "baseline":
        series = chart.addSeries(BaselineSeries, {
          baseValue: { type: "price", price: chartData[0]?.close },
          topLineColor: "#22c55e",
          bottomLineColor: "#ef4444",
        });
        series.setData(chartData.map(d => ({ time: d.time, value: d.close })));
        break;

      case "hollowcandles":
        series = chart.addSeries(CandlestickSeries, {
          upColor: "transparent",
          downColor: "#FF4D4F",
          borderUpColor: "#00FF88",
          borderDownColor: "#FF4D4F",
          wickUpColor: "#00FF88",
          wickDownColor: "#FF4D4F",
          borderVisible: true,
        });
        series.setData(chartData);
        break;

      case "histogram":
        series = chart.addSeries(HistogramSeries, {
          color: "#60a5fa",
        });
        series.setData(chartData.map(d => ({ time: d.time, value: d.close })));
        break;

      case "heikin":
        series = chart.addSeries(CandlestickSeries, {
          upColor: "#00FF88",
          downColor: "#FF4D4F",
        });
        series.setData(convertToHeikinAshi(chartData));
        break;

      default:
        series = chart.addSeries(CandlestickSeries, {
          upColor: "#00FF88",
          downColor: "#FF4D4F",
        });
        series.setData(chartData);
    }

    seriesRef.current = series;

    // ✅ Default OHLC (last candle)
    const last = chartData[chartData.length - 1];
    if (last) {
      setOhlc({
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
      });
    }

    // ✅ Crosshair move
    const handler = (param) => {
      if (!param.time || !seriesRef.current) return;

      const data = param.seriesData.get(seriesRef.current);
      if (!data) return;

      setOhlc({
        open: data.open ?? data.value,
        high: data.high ?? data.value,
        low: data.low ?? data.value,
        close: data.close ?? data.value,
      });
    };

    chart.subscribeCrosshairMove(handler);

    return () => {
      chart.unsubscribeCrosshairMove(handler);
    };
  }, [chartData, chartType, activeSymbol, timeframeValue]);

  const isUp = ohlc?.close >= ohlc?.open;
  const ohlcColor = isUp ? "#22c55e" : "#ef4444";

  return (
    <div style={{ width: 600 }}>
      
      {/* 🔥 TOP BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          background: "#0b1220",
          borderBottom: "1px solid #1f2937",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        {/* LEFT → SYMBOL + OHLC */}
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          <b style={{ color: "#e5e7eb" }}>{activeSymbol}</b>{" "}
          {timeframeValue && `(${timeframeValue})`} &nbsp;
          {ohlc && (
            <span style={{ color: ohlcColor }}>
              O: {ohlc.open} H: {ohlc.high} L: {ohlc.low} C: {ohlc.close}
            </span>
          )}
        </div>

        {/* RIGHT → DROPDOWN */}
        <div style={{ display: "flex", gap: 8 }}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  color: "#e5e7eb",
                  padding: "4px 8px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {active?.icon && <active.icon size={14} />}
                <span>{active?.label}</span>
                <FiChevronDown size={14} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                style={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  padding: 6,
                  minWidth: 180,
                  zIndex: 99999,
                }}
              >
                {chartOptions.map((item) => (
                  <DropdownMenu.Item
                    key={item.value}
                    onClick={() => setChartType(item.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "#e5e7eb",
                    }}
                  >
                    <item.icon size={14} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {chartType === item.value && "✓"}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Expand */}
          <button
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              color: "#e5e7eb",
              padding: "4px 6px",
              borderRadius: 6,
            }}
          >
            <BsArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* 🔥 CHART */}
      <div
        ref={containerRef}
        style={{
          width: 600,
          height: 350,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          overflow: "hidden",
        }}
      />
    </div>
  );
}