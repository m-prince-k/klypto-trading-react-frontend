import { useEffect, useRef } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function CCIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
  pane,
}) {
  const cloudCanvasRef = useRef(null);
  const cloudCtxRef = useRef(null);

 

  /* ================= CREATE SERIES ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.CCI) {
      Object.values(indicatorSeriesRef.current.CCI).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });
      indicatorSeriesRef.current.CCI = null;
    }

    const groupedSeries = {};
    let cciData = [];

    const upper = indicatorStyle?.CCI?.upperBand?.value ?? 100;
    const middle = indicatorStyle?.CCI?.middleBand?.value ?? 0;
    const lower = indicatorStyle?.CCI?.lowerBand?.value ?? -100;

    const bgFill = indicatorStyle?.CCI?.bgFill;

    /* ================= MAIN LINES ================= */

    let upperData = [];
    let lowerData = [];

    Object.entries(result.data).forEach(([lineName, lineData]) => {
      const styleConfig = indicatorStyle?.CCI?.[lineName];

      const series = addSeries("CCI", LineSeries, {
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
      if (lineName === "bbUpper") upperData = lineData;
      if (lineName === "bbLower") lowerData = lineData;
    });

    /* ================= LEVEL BANDS ================= */

    const makeLevelData = (value) =>
      cciData.map((p) => ({ time: p.time, value }));

    const upperBand = addSeries("CCI", LineSeries, {
      color: indicatorStyle?.CCI?.upperBand?.color,
      lineWidth: indicatorStyle?.CCI?.upperBand?.width,
      lineStyle: indicatorStyle?.CCI?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.upperBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleBand = addSeries("CCI", LineSeries, {
      color: indicatorStyle?.CCI?.middleBand?.color,
      lineWidth: indicatorStyle?.CCI?.middleBand?.width,
      lineStyle: indicatorStyle?.CCI?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.middleBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerBand = addSeries("CCI", LineSeries, {
      color: indicatorStyle?.CCI?.lowerBand?.color,
      lineWidth: indicatorStyle?.CCI?.lowerBand?.width,
      lineStyle: indicatorStyle?.CCI?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.lowerBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperBand.setData(makeLevelData(upper));
    middleBand.setData(makeLevelData(middle));
    lowerBand.setData(makeLevelData(lower));

    groupedSeries.upperBand = upperBand;
    groupedSeries.middleBand = middleBand;
    groupedSeries.lowerBand = lowerBand;
    groupedSeries.bbUpperData = upperData;
    groupedSeries.bbLowerData = lowerData;

    /* ================= BACKGROUND FILL ================= */

    const bandData = cciData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bgSeries = addSeries("CCI", BaselineSeries, {
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

    indicatorSeriesRef.current.CCI = {
      ...groupedSeries,
      result,
    };
  }, [result]);

  /* ================= CREATE CLOUD CANVAS ================= */

  useEffect(() => {
    if (!containerRef) return;

    if (cloudCanvasRef.current) return;

    const rect = containerRef.getBoundingClientRect();

    const canvas = document.createElement("canvas");

    canvas.width = rect.width;
    canvas.height = rect.height;

    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";

    containerRef.appendChild(canvas);

    cloudCanvasRef.current = canvas;
    cloudCtxRef.current = canvas.getContext("2d");
  }, [chart]);

  /* ================= DRAW BOLLINGER CLOUD ================= */

  useEffect(() => {
    const drawCloud = () => {
      const cciGroup = indicatorSeriesRef.current?.CCI;

      if (!cciGroup) return;

      const upper = cciGroup.bbUpperData || [];
      const lower = cciGroup.bbLowerData || [];

      if (!upper.length || !lower.length) return;

      const ctx = cloudCtxRef.current;
      const canvas = cloudCanvasRef.current;

      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();

      for (let i = 0; i < upper.length; i++) {
        const p = upper[i];

        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = cciGroup.bbUpper.priceToCoordinate(p.value);

        if (x == null || y == null) continue;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      for (let i = lower.length - 1; i >= 0; i--) {
        const p = lower[i];

        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = cciGroup.bbLower.priceToCoordinate(p.value);

        if (x == null || y == null) continue;

        ctx.lineTo(x, y);
      }

      ctx.closePath();

      const fill = indicatorStyle?.CCI?.bbFill;

      ctx.fillStyle = fill?.topFillColor1 || "rgba(33,150,243,0.2)";
      ctx.fill();
    };

    drawCloud();

    chart.timeScale().subscribeVisibleLogicalRangeChange(drawCloud);
    chart.subscribeCrosshairMove(drawCloud);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(drawCloud);
      chart.unsubscribeCrosshairMove(drawCloud);
    };
  }, [indicatorStyle?.CCI?.bbFill, result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const cciGroup = indicatorSeriesRef.current?.CCI;
    if (!cciGroup) return;

    const styles = indicatorStyle?.CCI;

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
