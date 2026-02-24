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

import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import { RiResetRightLine } from "react-icons/ri";
import { IoCloseSharp, IoSettingsOutline } from "react-icons/io5";
import { FiMoreHorizontal } from "react-icons/fi";
import { FaCode, FaFileWaveform } from "react-icons/fa6";

import IndicatorRuleBuilder from "../components/indicator/IndicatorRuleBuilder";
import IndicatorBuildingListing from "../components/indicator/IndicatorBuilderListing";
import IndicatorAlert from "../components/indicator/IndicatorAlert";
import ChartHeader from "../components/tradingModals/ChartHeader";
import { Form } from "../components/tradingModals/Form";

import {
  ChartProprties,
  TIMEFRAME_TO_SECONDS,
  SINGLE_VALUE_CHARTS,
  INDICATOR_COLORS,
  chartSeriesStyles,
  convertToHeikinAshi,
  getIndicatorChartProperties,
} from "../util/common";

import {
  fetchDataByCurrency,
  fetchIndicatorData,
  PANE_INDICATORS,
} from "../util/chartFunctions";

export default function Candlestick() {
  const chartRef = useRef();
  const containerRef = useRef();
  const seriesRef = useRef();

  const indicatorSeriesRef = useRef({});
  const latestIndicatorValuesRef = useRef({});
  const panesRef = useRef({});
  const syncingRef = useRef(false);

  const TIME_AXIS_HEIGHT = 28;
  const PANE_HEIGHT = 140;

  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState("1m");
  const [selectedCurrency, setSelectedCurrency] = useState("BTCUSDT");
  const [selectedIndicator, setSelectedIndicator] = useState([]);
  const [chartType, setChartType] = useState("candlestick");
  const [liveOhlcv, setLiveOhlcv] = useState({});
  const [liveIndicatorData, setLiveIndicatorData] = useState({});
  const [showAlertForm, setShowAlertForm] = useState(false);

  const getIndicatorColor = useCallback(
    (index) => INDICATOR_COLORS[index % INDICATOR_COLORS.length],
    [],
  );

  /* =========================
     ✅ CHART SYNC ENGINE
  ========================== */

  function syncCharts(sourceChart, logicalRange) {
    if (!logicalRange || syncingRef.current) return;

    syncingRef.current = true;

    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ];

    charts.forEach((chart) => {
      if (!chart || chart === sourceChart) return;
      chart.timeScale().setVisibleLogicalRange(logicalRange);
    });

    syncingRef.current = false;
  }

  function attachSync(chart) {
    if (!chart) return;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || syncingRef.current) return;
      syncCharts(chart, range);
    });
  }

  /* =========================
     ✅ PANE MANAGEMENT
  ========================== */

  function resolvePaneKey(type) {
    switch (type) {
      case "MACD":
        return "macd";
      case "Volume":
        return "volume";
      default:
        return "momentum";
    }
  }

  function ensurePane(paneKey) {
    if (panesRef.current[paneKey]) return panesRef.current[paneKey].chart;

    const paneCount = Object.keys(panesRef.current).length;

    const paneDiv = document.createElement("div");
    paneDiv.style.position = "absolute";
    paneDiv.style.left = "0";
    paneDiv.style.width = "100%";
    paneDiv.style.height = `${PANE_HEIGHT}px`;
    paneDiv.style.bottom = `${TIME_AXIS_HEIGHT + paneCount * PANE_HEIGHT}px`;

    containerRef.current.appendChild(paneDiv);

    const paneChart = createChart(
      paneDiv,
      getIndicatorChartProperties(PANE_HEIGHT),
    );

    panesRef.current[paneKey] = { chart: paneChart, div: paneDiv };

    attachSync(paneChart);

    return paneChart;
  }

  function cleanupPane(paneKey) {
    const pane = panesRef.current[paneKey];
    if (!pane) return;

    const stillUsed = Object.values(indicatorSeriesRef.current).some((entry) => {
      if (!entry) return false;

      if (typeof entry === "object" && !entry.setData) {
        return Object.values(entry).some(
          (series) => series?.chart === pane.chart,
        );
      }

      return entry?.chart === pane.chart;
    });

    if (!stillUsed) {
      pane.chart.remove();
      pane.div.remove();
      delete panesRef.current[paneKey];
    }
  }

  /* =========================
     ✅ INDICATOR REMOVAL
  ========================== */

  function removeIndicator(indicator) {
    const entry = indicatorSeriesRef.current[indicator];
    if (!entry) return;

    if (typeof entry === "object" && !entry.setData) {
      Object.values(entry).forEach((s) => s?.remove());
    } else {
      entry?.remove();
    }

    delete indicatorSeriesRef.current[indicator];
    delete latestIndicatorValuesRef.current[indicator];

    const paneKey = resolvePaneKey(indicator);
    cleanupPane(paneKey);

    setSelectedIndicator((prev) => prev.filter((i) => i !== indicator));
  }

  /* =========================
     ✅ CREATE MAIN CHART
  ========================== */

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, ChartProprties);
    chartRef.current = chart;

    attachSync(chart);

    const candleSeries = chart.addSeries(
      CandlestickSeries,
      chartSeriesStyles.candlestick,
    );

    seriesRef.current = candleSeries;

    return () => chart.remove();
  }, []);

  /* =========================
     ✅ LOAD DATA ON CHANGE
  ========================== */

  useEffect(() => {
    if (!chartRef.current) return;

    async function load() {
      const { data } = await fetchDataByCurrency(
        selectedCurrency,
        timeframeValue,
        chartType,
      );

      seriesRef.current.setData(
        chartType === "heikinashi" ? convertToHeikinAshi(data) : data,
      );

      chartRef.current.timeScale().fitContent();

      await fetchIndicatorData(
        selectedIndicator,
        selectedCurrency,
        timeframeValue,
        chartRef,
        ensurePane,
        indicatorSeriesRef,
        latestIndicatorValuesRef,
        getIndicatorColor,
      );
    }

    load();
  }, [selectedCurrency, timeframeValue, chartType, selectedIndicator]);

const toggleIndicator = useCallback((indicator) => {
  setSelectedIndicator((prev) => {
    const exists = prev.includes(indicator);

    /* ✅ REMOVE */
    if (exists) {
      const entry = indicatorSeriesRef.current[indicator];

      if (entry) {
        if (typeof entry === "object" && !entry.setData) {
          Object.values(entry).forEach((s) => s?.remove());
        } else {
          entry?.remove();
        }

        delete indicatorSeriesRef.current[indicator];
        delete latestIndicatorValuesRef.current[indicator];
      }

      const paneKey = resolvePaneKey(indicator);
      cleanupPane(paneKey);

      return prev.filter((i) => i !== indicator);
    }

    /* ✅ ADD */
    return [...prev, indicator];
  });
}, []);
  /* =========================
     ✅ ZOOM CONTROLS
  ========================== */


  const zoomIn = () => {
    const range = chartRef.current.timeScale().getVisibleLogicalRange();
    if (!range) return;
    chartRef.current.timeScale().setVisibleLogicalRange({
      from: range.from + 5,
      to: range.to - 5,
    });
  };

  const zoomOut = () => {
    const range = chartRef.current.timeScale().getVisibleLogicalRange();
    if (!range) return;
    chartRef.current.timeScale().setVisibleLogicalRange({
      from: range.from - 5,
      to: range.to + 5,
    });
  };

  const resetZoom = () => chartRef.current.timeScale().fitContent();

  /* =========================
     ✅ UI
  ========================== */

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50">
      <ChartHeader
        timeframeValue={timeframeValue}
        setTimeframeValue={setTimeframeValue}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        setChartType={setChartType}
        chartType={chartType}
        selectedIndicator={selectedIndicator}
        setSelectedIndicator={setSelectedIndicator}
      />

      <div
        ref={containerRef}
        className="relative m-2 rounded-md bg-white"
        style={{ width: ChartProprties.width, height: ChartProprties.height }}
      />

      <div className="flex gap-2 justify-center">
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