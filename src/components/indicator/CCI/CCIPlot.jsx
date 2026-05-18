import { useEffect, useRef } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function CCIPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
  pane
}) {

  const cloudCanvasRef = useRef(null);
  const cloudCtxRef = useRef(null);

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const groupedSeries = {};
    let cciData = [];

    const upper = indicatorStyle?.[indicator]?.upperBand?.value ?? 100;
    const middle = indicatorStyle?.[indicator]?.middleBand?.value ?? 0;
    const lower = indicatorStyle?.[indicator]?.lowerBand?.value ?? -100;

    const bgFill = indicatorStyle?.[indicator]?.bgFill;

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const styleConfig = indicatorStyle?.[indicator]?.[lineName];

      const series = addSeries(indicator, LineSeries, {
        color: styleConfig?.color,
        lineWidth: styleConfig?.width,
        lineStyle: styleConfig?.lineStyle ?? 0,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "cciLine") cciData = lineData;

    });

    /* ================= LEVEL BANDS ================= */

    const makeLevelData = (value) =>
      cciData.map((p) => ({ time: p.time, value }));

    const upperBand = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.upperBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.upperBand?.width,
      lineStyle: indicatorStyle?.[indicator]?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.upperBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleBand = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.middleBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.middleBand?.width,
      lineStyle: indicatorStyle?.[indicator]?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.middleBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerBand = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.lowerBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.lowerBand?.width,
      lineStyle: indicatorStyle?.[indicator]?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.lowerBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperBand.setData(makeLevelData(upper));
    middleBand.setData(makeLevelData(middle));
    lowerBand.setData(makeLevelData(lower));

    groupedSeries.upperBand = upperBand;
    groupedSeries.middleBand = middleBand;
    groupedSeries.lowerBand = lowerBand;

    /* ================= BACKGROUND FILL ================= */

    const bandData = cciData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bgSeries = addSeries(indicator, BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bgFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bgSeries.setData(bandData);

    groupedSeries.bgFill = bgSeries;
    groupedSeries.cciData = cciData;

    indicatorSeriesRef.current[indicator] = {
      ...groupedSeries,
      result,
    };

  }, [result]);


  /* ================= CREATE CLOUD CANVAS ================= */

  useEffect(() => {

    if (!chart?.current || !chart) return;
    if (cloudCanvasRef.current) return;

    const rect = chart.current.getBoundingClientRect();

    const canvas = document.createElement("canvas");

    canvas.width = rect.width;
    canvas.height = rect.height;

    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";

    chart.current.appendChild(canvas);

    cloudCanvasRef.current = canvas;
    cloudCtxRef.current = canvas.getContext("2d");

  }, [chart]);


  /* ================= DRAW BOLLINGER CLOUD ================= */

  useEffect(() => {

    const cciGroup = chart.current?.CCI;

    const upperSeries = cciGroup?.bbUpper;
    const lowerSeries = cciGroup?.bbLower;

    const upperData = cciGroup?.result?.data?.bbUpper;
    const lowerData = cciGroup?.result?.data?.bbLower;

    const fillStyle = indicatorStyle?.[indicator]?.bbFill;

    const ctx = cloudCtxRef.current;
    const canvas = cloudCanvasRef.current;

    if (!ctx || !canvas) return;
    if (!upperSeries || !lowerSeries) return;
    if (!upperData?.length || !lowerData?.length) return;
    if (!fillStyle?.visible) return;

    const drawCloud = () => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();

      upperData.forEach((p, i) => {

        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = upperSeries.priceToCoordinate(p.value);

        if (x === null || y === null) return;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

      });

      for (let i = lowerData.length - 1; i >= 0; i--) {

        const p = lowerData[i];

        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = lowerSeries.priceToCoordinate(p.value);

        if (x === null || y === null) continue;

        ctx.lineTo(x, y);
      }

      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient.addColorStop(0, fillStyle?.topFillColor1 || "rgba(33,150,243,0.2)");
      gradient.addColorStop(1, fillStyle?.bottomFillColor1 || "rgba(33,150,243,0)");

      ctx.fillStyle = gradient;
      ctx.fill();
    };

    drawCloud();

    chart.timeScale().subscribeVisibleLogicalRangeChange(drawCloud);
    chart.subscribeCrosshairMove(drawCloud);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(drawCloud);
      chart.unsubscribeCrosshairMove(drawCloud);
    };

  }, [indicatorStyle?.[indicator]?.bbFill, result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const cciGroup = indicatorSeriesRef.current?.[indicator];
    if (!cciGroup) return;

    const styles = indicatorStyle?.[indicator];

    ["cciLine", "cciMa", "bbUpper", "bbLower"].forEach((key) => {

      if (!cciGroup[key]) return;

      const s = styles?.[key];

      cciGroup[key].applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
      });

    });

  }, [indicatorStyle]);

  return null;
}