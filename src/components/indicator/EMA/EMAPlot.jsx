import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function EMAPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
  indicatorConfigs,
}) {

  const cloudCanvasRef = useRef(null);
  const cloudCtxRef = useRef(null);

  const maType = indicatorConfigs?.EMA?.maType;

  /* ================= CREATE EMA ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.EMA) {

      Object.values(indicatorSeriesRef.current.EMA).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.EMA = null;
    }

    const groupedSeries = {};

    Object.entries(result.data || {}).forEach(([lineName, lineData]) => {

      if (!Array.isArray(lineData)) return;

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.EMA?.[lineName];

      const series = addSeries("EMA", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#ff9800",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.EMA = {
      ...groupedSeries,
      result,
    };

  }, [result]);

  /* ================= CREATE CANVAS ================= */

  useEffect(() => {
    

    if (!containerRef?.current || !chart) return;

    if (cloudCanvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const canvas = document.createElement("canvas");

    canvas.width = rect.width;
    canvas.height = rect.height;

    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";

    containerRef.current.appendChild(canvas);

    cloudCanvasRef.current = canvas;
    cloudCtxRef.current = canvas.getContext("2d");

  }, [chart]);

  /* ================= DRAW CLOUD ================= */

  useEffect(() => {
    if (maType !== "SMA + Bollinger Bands") {
      const ctx = cloudCtxRef.current;
      const canvas = cloudCanvasRef.current;

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      return;
    }

    if (maType !== "SMA + Bollinger Bands") return;

    const emaGroup = indicatorSeriesRef.current?.EMA;

    const upperSeries = emaGroup?.bbUpper;
    const lowerSeries = emaGroup?.bbLower;

    const upperData = emaGroup?.result?.data?.bbUpper;
    const lowerData = emaGroup?.result?.data?.bbLower;

    const fillStyle = indicatorStyle?.EMA?.bbFill;

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

      gradient.addColorStop(
        0,
        fillStyle?.topFillColor1 || "rgba(0,255,0,0.2)"
      );

      gradient.addColorStop(
        1,
        fillStyle?.bottomFillColor1 || "rgba(0,255,0,0)"
      );

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

  }, [indicatorStyle?.EMA?.bbFill, result, indicatorConfigs]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const emaGroup = indicatorSeriesRef.current?.EMA;
    if (!emaGroup) return;

    const styles = indicatorStyle?.EMA;

    ["ema", "smoothingMA", "bbUpper", "bbLower"].forEach((key) => {

      if (!emaGroup[key]) return;

      const s = styles?.[key];

      emaGroup[key].applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });

    });

  }, [indicatorStyle]);

  return null;
}