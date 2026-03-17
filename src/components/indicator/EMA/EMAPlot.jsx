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
}) {
  const cloudCanvasRef = useRef(null);
  const cloudCtxRef = useRef(null);

  /* ================= CREATE EMA ================= */

  useEffect(() => {
    if (!result) return;

    /* REMOVE OLD EMA */

    if (indicatorSeriesRef.current?.EMA) {
      Object.values(indicatorSeriesRef.current.EMA).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.EMA = null;
    }

    const groupedSeries = {};

    /* ================= CREATE LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {
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
      result: result,
    };
  }, [result]);

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

  useEffect(() => {
    console.log("CLOUD EFFECT TRIGGERED");

    const emaGroup = indicatorSeriesRef.current?.EMA;
    console.log("EMA Group:", emaGroup);

    const upperSeries = emaGroup?.bbUpper;
    const lowerSeries = emaGroup?.bbLower;

    console.log("Upper series:", upperSeries);
    console.log("Lower series:", lowerSeries);

    const fillStyle = indicatorStyle?.EMA?.bbFill;
    console.log("Fill style:", fillStyle);

    const upperData = indicatorSeriesRef.current?.EMA?.result?.data?.bbUpper;
    const lowerData = indicatorSeriesRef.current?.EMA?.result?.data?.bbLower;

    console.log("Upper data length:", upperData);
    console.log("Lower data length:", lowerData?.length);

    const ctx = cloudCtxRef.current;
    const canvas = cloudCanvasRef.current;

    console.log("Canvas:", canvas);
    console.log("Context:", ctx);

    const drawCloud = () => {
      console.log("DRAW CLOUD CALLED");

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

      console.log("Using colors:", fillStyle?.topColor, fillStyle?.bottomColor);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient.addColorStop(0, fillStyle?.topColor || "rgba(0,255,0,0.2)");
      gradient.addColorStop(1, fillStyle?.bottomColor || "rgba(0,255,0,0)");

      ctx.fillStyle = gradient;

      ctx.fill();

      console.log("Cloud drawn");
    };

    drawCloud();

    chart.timeScale().subscribeVisibleLogicalRangeChange(drawCloud);
    chart.subscribeCrosshairMove(drawCloud);
  }, [indicatorStyle, result]);

  /* ================= STYLE UPDATE ================= */
  useEffect(() => {
    console.log("EMAPlot received style:", indicatorStyle?.EMA);
    console.log("EMA bbFill:", indicatorStyle?.EMA?.bbFill);
  }, [indicatorStyle]);

  useEffect(() => {
    const emaGroup = indicatorSeriesRef.current?.EMA;
    if (!emaGroup) return;

    const styles = indicatorStyle?.EMA;

    /* ===== EMA ===== */

    if (emaGroup.ema) {
      const s = styles?.ema;

      emaGroup.ema.applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });
    }

    /* ===== SMOOTHING ===== */

    if (emaGroup.smoothingMA) {
      const s = styles?.smoothingMA;

      emaGroup.smoothingMA.applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });
    }

    /* ===== BB UPPER ===== */

    if (emaGroup.bbUpper) {
      const s = styles?.bbUpper;

      emaGroup.bbUpper.applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });
    }

    /* ===== BB LOWER ===== */

    if (emaGroup.bbLower) {
      const s = styles?.bbLower;

      emaGroup.bbLower.applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });
    }
  }, [indicatorStyle]);

  return null;
}
