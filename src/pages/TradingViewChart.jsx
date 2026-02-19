import {
  createChart,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  HistogramSeries,
  BaselineSeries,
} from "lightweight-charts";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useRef, useState, useCallback } from "react";

import ChartHeader from "../components/tradingModals/ChartHeader";
import IndicatorRuleBuilder from "../components/indicator/IndicatorRuleBuilder";
import IndicatorBuildingListing from "../components/indicator/IndicatorBuilderListing";
import IndicatorAlert from "../components/indicator/IndicatorAlert";

import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import { RiResetRightLine } from "react-icons/ri";
import { IoCloseSharp, IoSettingsOutline } from "react-icons/io5";
import { FiMoreHorizontal } from "react-icons/fi";
import { FaCode, FaFileWaveform } from "react-icons/fa6";

import {
  ChartProprties,
  TIMEFRAME_TO_SECONDS,
  SINGLE_VALUE_CHARTS,
  INDICATOR_COLORS,
  chartSeriesStyles,
  getSeriesColor,
  convertToHeikinAshi,
} from "../util/common";

import {
  fetchDataByCurrency,
  fetchIndicatorData,
} from "../util/chartFunctions";

export default function Candlestick() {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const seriesRef = useRef(null);
  const indicatorSeriesRef = useRef({});
  const latestIndicatorValuesRef = useRef({});

  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState("1m");
  const [selectedCurrency, setSelectedCurrency] = useState("BTCUSDT");
  const [selectedIndicator, setSelectedIndicator] = useState([]);
  const [rangeValue, setRangeValue] = useState("1000");
  const [chartType, setChartType] = useState("candlestick");
  const [liveOhlcv, setLiveOhlcv] = useState(null);
  const [liveIndicatorData, setLiveIndicatorData] = useState({});
  const [showAlertForm, setShowAlertForm] = useState(false);

  const getIndicatorColor = useCallback(
    (index) => INDICATOR_COLORS[index % INDICATOR_COLORS.length],
    []
  );

  /* -------------------- CREATE CHART ONCE -------------------- */

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, ChartProprties);
    chartRef.current = chart;

    return () => chart.remove();
  }, []);

  /* -------------------- CROSSHAIR HANDLER -------------------- */

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const handler = (param) => {
      if (!param.time || !param.seriesData) {
        setLiveOhlcv(null);
        return;
      }

      const candle = param.seriesData.get(seriesRef.current);
      if (candle) setLiveOhlcv(candle);

      const values = {};

      selectedIndicator.forEach((indicator) => {
        const entry = indicatorSeriesRef.current[indicator];
        if (!entry) return;

        const isGrouped =
          typeof entry === "object" && !("setData" in entry);

        if (isGrouped) {
          const groupedValues = {};

          Object.entries(entry).forEach(([line, series]) => {
            const point = param.seriesData.get(series);
            if (point?.value !== undefined) {
              groupedValues[line] = point.value;
            }
          });

          if (Object.keys(groupedValues).length) {
            values[indicator] = groupedValues;
          }
        } else {
          const point = param.seriesData.get(entry);
          if (point?.value !== undefined) {
            values[indicator] = point.value;
          }
        }
      });

      setLiveIndicatorData(values);
    };

    chart.subscribeCrosshairMove(handler);
    return () => chart.unsubscribeCrosshairMove(handler);
  }, [selectedIndicator]);

  /* -------------------- SERIES CLEANUP -------------------- */

  const removeMainSeries = () => {
    if (!seriesRef.current || !chartRef.current) return;

    try {
      chartRef.current.removeSeries(seriesRef.current);
    } catch {}
    seriesRef.current = null;
  };

  /* -------------------- LOAD CHART DATA -------------------- */

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    removeMainSeries();

    async function load() {
      const { data } = await fetchDataByCurrency(
        selectedCurrency,
        timeframeValue,
        chartType
      );

      switch (chartType) {
        case "line":
          seriesRef.current = chart.addSeries(
            LineSeries,
            chartSeriesStyles.line
          );
          seriesRef.current.setData(
            data.map((d) => ({ time: d.time, value: Number(d.close) }))
          );
          break;

        case "bar":
          seriesRef.current = chart.addSeries(
            BarSeries,
            chartSeriesStyles.bar
          );
          seriesRef.current.setData(data);
          break;

        case "area":
          seriesRef.current = chart.addSeries(
            AreaSeries,
            chartSeriesStyles.area
          );
          seriesRef.current.setData(
            data.map((d) => ({ time: d.time, value: Number(d.close) }))
          );
          break;

        case "baseline":
          seriesRef.current = chart.addSeries(BaselineSeries, {
            ...chartSeriesStyles.baseline,
            baseValue: { type: "price", price: Number(data[0]?.close ?? 0) },
          });
          seriesRef.current.setData(
            data.map((d) => ({ time: d.time, value: d.close }))
          );
          break;

        case "histogram":
          seriesRef.current = chart.addSeries(
            HistogramSeries,
            chartSeriesStyles.histogram
          );
          seriesRef.current.setData(
            data.map((d) => ({ time: d.time, value: d.volume }))
          );
          break;

        case "heikinashi":
          seriesRef.current = chart.addSeries(CandlestickSeries);
          seriesRef.current.setData(convertToHeikinAshi(data));
          break;

        default:
          seriesRef.current = chart.addSeries(
            CandlestickSeries,
            chartSeriesStyles.candlestick
          );
          seriesRef.current.setData(data);
      }

      chart.timeScale().fitContent();

      await fetchIndicatorData(
        selectedIndicator,
        selectedCurrency,
        timeframeValue,
        chartRef,
        indicatorSeriesRef,
        latestIndicatorValuesRef,
        getIndicatorColor
      );
    }

    load();
  }, [chartType, timeframeValue, selectedCurrency, rangeValue, selectedIndicator]);

  /* -------------------- INDICATOR TOGGLE -------------------- */

  const toggleIndicator = (indicator) => {
    setSelectedIndicator((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator]
    );
  };

  const removeIndicator = (indicator) => {
    const series = indicatorSeriesRef.current[indicator];
    if (series && chartRef.current) {
      chartRef.current.removeSeries(series);
    }
    delete indicatorSeriesRef.current[indicator];

    setSelectedIndicator((prev) => prev.filter((i) => i !== indicator));
  };

  /* -------------------- ZOOM -------------------- */

  const zoomIn = () => {
    const chart = chartRef.current;
    const range = chart?.timeScale().getVisibleLogicalRange();
    if (!range) return;

    chart.timeScale().setVisibleLogicalRange({
      from: range.from + 5,
      to: range.to - 5,
    });
  };

  const zoomOut = () => {
    const chart = chartRef.current;
    const range = chart?.timeScale().getVisibleLogicalRange();
    if (!range) return;

    chart.timeScale().setVisibleLogicalRange({
      from: range.from - 5,
      to: range.to + 5,
    });
  };

  const resetZoom = () => chartRef.current?.timeScale().fitContent();

  const isUp =
    SINGLE_VALUE_CHARTS.includes(chartType)
      ? true
      : liveOhlcv?.close >= liveOhlcv?.open;

  const valueColor = isUp ? "text-green-500" : "text-red-500";

  return (
    <div className="w-full h-screen z-999 flex flex-col bg-slate-50">
      <ChartHeader
        timeframeValue={timeframeValue}
        setTimeframeValue={setTimeframeValue}
        rangeValue={rangeValue}
        setRangeValue={setRangeValue}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        setChartType={setChartType}
        chartType={chartType}
        selectedIndicator={selectedIndicator}
        setSelectedIndicator={setSelectedIndicator}
        toggleIndicator={toggleIndicator}
      />

      <div ref={containerRef} className="relative z-0 m-2 rounded-md bg-white" />

      {selectedIndicator.length > 0 && (
        <div className="absolute top-20 left-4 flex flex-col gap-2">
          {selectedIndicator.map((indicator, index) => (
            <div key={indicator} className="flex items-center gap-2 text-xs bg-white shadow px-3 h-8 rounded">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: getIndicatorColor(index) }}
              />
              {indicator}
              <span style={{ color: getSeriesColor(indicatorSeriesRef.current[indicator]) }}>
                {liveIndicatorData?.[indicator]?.toFixed?.(2) ?? "--"}
              </span>

              <button onClick={() => removeIndicator(indicator)}>
                <IoCloseSharp />
              </button>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button><FiMoreHorizontal /></button>
                </DropdownMenu.Trigger>
              </DropdownMenu.Root>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 p-4">
        <button onClick={zoomIn}><LuCirclePlus /></button>
        <button onClick={zoomOut}><LuCircleMinus /></button>
        <button onClick={resetZoom}><RiResetRightLine /></button>
      </div>

      <IndicatorRuleBuilder />
      <IndicatorBuildingListing
        selectedCurrency={selectedCurrency}
        timeframeValue={timeframeValue}
      />
    </div>
  );
}
