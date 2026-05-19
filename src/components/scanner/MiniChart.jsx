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
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function MiniChart({
  activeSymbol,
  chartData,
  timeframeValue,
  dropdownRef,
}) {
  const { theme } = useTheme();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [chartType, setChartType] = useState("candlestick");
  const [ohlc, setOhlc] = useState(null);
  const active = chartOptions.find((c) => c.value === chartType);

  // ✅ Create chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = theme === "dark";
    const chart = createChart(containerRef.current, {
      width: 600,
      height: 350,
      layout: {
        background: { color: isDark ? "#0b0f19" : "#ffffff" },
        textColor: isDark ? "#8f9cae" : "#64748b",
      },
      grid: {
        vertLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
        horzLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
      },
      timeScale: {
        barSpacing: 10,

        timeVisible: true,
        secondsVisible: false,

        tickMarkFormatter: (time, tickMarkType, locale) => {
          const date = new Date(time * 1000);

          // 👇 dynamic formatting
          if (
            timeframeValue === "1m" ||
            timeframeValue === "5m" ||
            timeframeValue === "30m"
          ) {
            return date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }

          if (timeframeValue === "1h") {
            return date.toLocaleString([], {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
            });
          }

          if (timeframeValue === "1d") {
            return date.toLocaleDateString([], {
              day: "2-digit",
              month: "short",
            });
          }

          return date.toLocaleDateString([], {
            month: "short",
            year: "numeric",
          });
        },
      },
    });

    chartRef.current = chart;

    return () => chart.remove();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const isDark = theme === "dark";
    chartRef.current.applyOptions({
      layout: {
        background: { color: isDark ? "#0b0f19" : "#ffffff" },
        textColor: isDark ? "#8f9cae" : "#64748b",
      },
      grid: {
        vertLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
        horzLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
      },
    });
  }, [theme]);

  // ✅ Update series + legend logic
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !chartData) return;

    chart.applyOptions({
      timeScale: {
        timeVisible: timeframeValue !== "1d",
        secondsVisible: false,
      },
    });

    // remove old series
    if (chart && seriesRef.current) {
      try {
        chart.removeSeries(seriesRef.current);
      } catch (e) {}
      seriesRef.current = null;
    }

    let series;

    switch (chartType) {
      case "line":
        series = chart.addSeries(LineSeries, { color: "#60a5fa" });
        series.setData(
          chartData.map((d) => ({ time: d.time, value: d.close })),
        );
        break;

      case "area":
        series = chart.addSeries(AreaSeries, {
          lineColor: "#60a5fa",
          topColor: "rgba(96,165,250,0.4)",
          bottomColor: "rgba(96,165,250,0.05)",
        });
        series.setData(
          chartData.map((d) => ({ time: d.time, value: d.close })),
        );
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
        series.setData(
          chartData.map((d) => ({ time: d.time, value: d.close })),
        );
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
        series.setData(
          chartData.map((d) => ({ time: d.time, value: d.close })),
        );
        break;

      case "heikinashi":
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
          padding: "6px 6px",
          background: "var(--bg-card, #ffffff)",
          borderBottom: "1px solid var(--border-color, #e2e8f0)",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        {/* LEFT → SYMBOL + OHLC */}
        <div style={{ fontSize: 12, color: "var(--text-muted, #64748b)" }}>
          <b style={{ color: "var(--text-main, #131722)" }}>{activeSymbol}</b>{" "}
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
                  background: "var(--bg-main, #f4f6f8)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  color: "var(--text-main, #131722)",
                  padding: "4px 8px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
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
                ref={dropdownRef}
                onPointerDownOutside={(e) => {
                  e.preventDefault();
                }}
                onInteractOutside={(e) => {
                  e.preventDefault(); // 🔥 IMPORTANT
                }}
                style={{
                  background: "var(--bg-card, #ffffff)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  borderRadius: 8,
                  padding: 6,
                  minWidth: 180,
                  zIndex: 9999999, // 🔥 increase
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
                      color: "var(--text-main, #131722)",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--bg-card-hover, #f1f5f9)")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
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
            onClick={() =>
              navigate(`/candleStick?symbol=${activeSymbol}&tf=${timeframeValue}`)
            }
            style={{
              background: "var(--bg-main, #f4f6f8)",
              border: "1px solid var(--border-color, #e2e8f0)",
              color: "var(--text-main, #131722)",
              padding: "4px 6px",
              borderRadius: 6,
              cursor: "pointer",
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
