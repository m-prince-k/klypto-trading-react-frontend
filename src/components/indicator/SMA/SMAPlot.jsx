import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function SMAPlot({
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

  /* ================= CREATE SMA ================= */

  useEffect(() => {

    if (!result) return;

    /* REMOVE OLD SMA */

    if (indicatorSeriesRef.current?.SMA) {

      Object.values(indicatorSeriesRef.current.SMA).forEach((s) => {

        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }

      });

      indicatorSeriesRef.current.SMA = null;

    }

    const groupedSeries = {};

    /* ================= CREATE LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.SMA?.[lineName];

      const series = addSeries("SMA", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#2962ff",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

    });

    indicatorSeriesRef.current.SMA = {
      ...groupedSeries,
      result: result,
    };

  }, [result]);


  /* ================= CREATE CLOUD CANVAS ================= */

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

    console.log("SMA CLOUD EFFECT TRIGGERED");

    const smaGroup = indicatorSeriesRef.current?.SMA;

    console.log("SMA Group:", smaGroup);

    const upperSeries = smaGroup?.bbUpper;
    const lowerSeries = smaGroup?.bbLower;

    console.log("Upper series:", upperSeries);
    console.log("Lower series:", lowerSeries);

    const fillStyle = indicatorStyle?.SMA?.bbFill;

    console.log("Fill style:", fillStyle);

    const upperData = indicatorSeriesRef.current?.SMA?.result?.data?.bbUpper;
    const lowerData = indicatorSeriesRef.current?.SMA?.result?.data?.bbLower;

    console.log("Upper data:", upperData);
    console.log("Lower data length:", lowerData?.length);

    const ctx = cloudCtxRef.current;
    const canvas = cloudCanvasRef.current;

    console.log("Canvas:", canvas);
    console.log("Context:", ctx);

    if (!ctx || !canvas || !upperSeries || !lowerSeries) return;

    if (!upperData?.length || !lowerData?.length) return;

    if (!fillStyle?.visible) return;

    const drawCloud = () => {

      console.log("DRAW SMA CLOUD CALLED");

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

      console.log(
        "Using colors:",
        fillStyle?.topColor,
        fillStyle?.bottomColor
      );

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient.addColorStop(
        0,
        fillStyle?.topColor || "rgba(0,255,0,0.2)"
      );

      gradient.addColorStop(
        1,
        fillStyle?.bottomColor || "rgba(0,255,0,0)"
      );

      ctx.fillStyle = gradient;

      ctx.fill();

      console.log("SMA Cloud drawn");

    };

    drawCloud();

    chart.timeScale().subscribeVisibleLogicalRangeChange(drawCloud);
    chart.subscribeCrosshairMove(drawCloud);

  }, [indicatorStyle, result]);


  /* ================= STYLE UPDATE LOG ================= */

  useEffect(() => {

    console.log("SMAPlot received style:", indicatorStyle?.SMA);
    console.log("SMA bbFill:", indicatorStyle?.SMA?.bbFill);

  }, [indicatorStyle]);


  /* ================= APPLY STYLE UPDATE ================= */

  useEffect(() => {

    const smaGroup = indicatorSeriesRef.current?.SMA;

    if (!smaGroup) return;

    const styles = indicatorStyle?.SMA;

    /* ===== SMA ===== */

    if (smaGroup.sma) {

      const s = styles?.sma;

      smaGroup.sma.applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });

    }

    /* ===== SMOOTHING ===== */

    if (smaGroup.smoothingMA) {

      const s = styles?.smoothingMA;

      smaGroup.smoothingMA.applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });

    }

    /* ===== BB UPPER ===== */

    if (smaGroup.bbUpper) {

      const s = styles?.bbUpper;

      smaGroup.bbUpper.applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });

    }

    /* ===== BB LOWER ===== */

    if (smaGroup.bbLower) {

      const s = styles?.bbLower;

      smaGroup.bbLower.applyOptions({
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