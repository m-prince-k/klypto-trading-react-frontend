import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function KCPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
}) {

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    const upper = result?.data?.upper;
    const middle = result?.data?.middle;
    const lower = result?.data?.lower;

    if (!Array.isArray(upper) || upper.length === 0) {
      console.log("❌ KC invalid data", result);
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.KC) {
      Object.values(indicatorSeriesRef.current.KC).forEach((s) => {
        try { s.setData([]); } catch {}
      });
      indicatorSeriesRef.current.KC = null;
    }

    const map = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const upperData = map(upper);
    const middleData = map(middle);
    const lowerData = map(lower);

    /* 🔴 UPPER */
    const upperSeries = addSeries("KC", LineSeries, {
      color: indicatorStyle?.KC?.upper?.color ?? "#EF5350",
      lineWidth: indicatorStyle?.KC?.upper?.width ?? 2,
      lineStyle: indicatorStyle?.KC?.upper?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.upper?.visible ?? true,
      priceLineVisible: false,
    });

    /* 🟡 MIDDLE (BASIS) */
    const middleSeries = addSeries("KC", LineSeries, {
      color: indicatorStyle?.KC?.middle?.color ?? "#FFD54F",
      lineWidth: indicatorStyle?.KC?.middle?.width ?? 2,
      lineStyle: indicatorStyle?.KC?.middle?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.middle?.visible ?? true,
      priceLineVisible: false,
    });

    /* 🔵 LOWER */
    const lowerSeries = addSeries("KC", LineSeries, {
      color: indicatorStyle?.KC?.lower?.color ?? "#26A69A",
      lineWidth: indicatorStyle?.KC?.lower?.width ?? 2,
      lineStyle: indicatorStyle?.KC?.lower?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.lower?.visible ?? true,
      priceLineVisible: false,
    });

    upperSeries.setData(upperData);
    middleSeries.setData(middleData);
    lowerSeries.setData(lowerData);

    indicatorSeriesRef.current.KC = {
      upper: upperSeries,
      middle: middleSeries,
      lower: lowerSeries,
      _data: { upper: upperData, lower: lowerData },
    };

    console.log("✅ KC plotted");

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const g = indicatorSeriesRef.current?.KC;
    if (!g) return;

    g.upper?.applyOptions({
      color: indicatorStyle?.KC?.upper?.color,
      lineWidth: indicatorStyle?.KC?.upper?.width,
      lineStyle: indicatorStyle?.KC?.upper?.lineStyle,
      visible: indicatorStyle?.KC?.upper?.visible,
    });

    g.middle?.applyOptions({
      color: indicatorStyle?.KC?.middle?.color,
      lineWidth: indicatorStyle?.KC?.middle?.width,
      lineStyle: indicatorStyle?.KC?.middle?.lineStyle,
      visible: indicatorStyle?.KC?.middle?.visible,
    });

    g.lower?.applyOptions({
      color: indicatorStyle?.KC?.lower?.color,
      lineWidth: indicatorStyle?.KC?.lower?.width,
      lineStyle: indicatorStyle?.KC?.lower?.lineStyle,
      visible: indicatorStyle?.KC?.lower?.visible,
    });

  }, [indicatorStyle?.KC]);



  /* ================= CANVAS INIT ================= */

  useEffect(() => {

    if (!containerRef?.current || !chart) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";

    containerRef.current.appendChild(canvas);

    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext("2d");

    const resize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.remove();
    };

  }, [chart]);



  /* ================= DRAW CLOUD ================= */

  useEffect(() => {

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    if (!ctx || !canvas || !chart) return;

    const draw = () => {

      const kc = indicatorSeriesRef.current?.KC;
      if (!kc?._data) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!indicatorStyle?.KC?.bg?.visible) return;

      const upper = kc._data.upper;
      const lower = kc._data.lower;

      if (!upper.length || !lower.length) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient.addColorStop(
        0,
        indicatorStyle?.KC?.bg?.topFillColor1 ?? "rgba(38,166,154,0.2)"
      );

      gradient.addColorStop(
        1,
        indicatorStyle?.KC?.bg?.topFillColor2 ?? "rgba(239,83,80,0.2)"
      );

      ctx.fillStyle = gradient;
      ctx.beginPath();

      /* 🔴 UPPER */
      upper.forEach((p, i) => {
        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = kc.upper.priceToCoordinate(p.value);

        if (x == null || y == null) return;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      /* 🔵 LOWER */
      [...lower].reverse().forEach((p) => {
        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = kc.lower.priceToCoordinate(p.value);

        if (x == null || y == null) return;

        ctx.lineTo(x, y);
      });

      ctx.closePath();
      ctx.fill();
    };

    draw();

    chart.timeScale().subscribeVisibleTimeRangeChange(draw);
    chart.subscribeCrosshairMove(draw);

    return () => {
      chart.timeScale().unsubscribeVisibleTimeRangeChange(draw);
      chart.unsubscribeCrosshairMove(draw);
    };

  }, [indicatorStyle?.KC?.bg, result]);



  return null;
}