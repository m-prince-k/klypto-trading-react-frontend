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
  const seriesRef = useRef({});
  const canvasRef = useRef(null);
  const bandDataRef = useRef({ upper: [], lower: [] });

  const clean = (d) =>
    Array.isArray(d) ? d.filter((x) => x?.time && x?.value != null) : [];

  /* ---------------- CREATE SERIES ---------------- */
  useEffect(() => {
    if (!chart || seriesRef.current.upper) return;

    const s = {};
    Object.entries(indicatorStyle?.KC || {}).forEach(([key]) => {
      if (key === "bbFill") return; // skip fill
      s[key] = addSeries("KC", LineSeries, indicatorStyle.KC[key]);
    });

    seriesRef.current = s;
    indicatorSeriesRef.current.KC = s;
  }, [chart]);

  /* ---------------- UPDATE DATA ---------------- */
  useEffect(() => {
    if (!result?.data) return;

    const upper = clean(result.data.upper);
    const middle = clean(result.data.middle);
    const lower = clean(result.data.lower);

    bandDataRef.current = { upper, lower };

    seriesRef.current.upper?.setData(upper);
    seriesRef.current.middle?.setData(middle);
    seriesRef.current.lower?.setData(lower);

    drawCloud();
  }, [result]);

  /* ---------------- STYLE UPDATE ---------------- */
  useEffect(() => {
    const group = seriesRef.current;
    Object.entries(group).forEach(([key, s]) => {
      const style = indicatorStyle?.KC?.[key];
      if (!style) return;
      s.applyOptions({
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle,
        visible: style.visible,
      });
    });

    drawCloud();
  }, [indicatorStyle]);

  /* ---------------- CANVAS INIT ---------------- */
  useEffect(() => {
    if (!containerRef?.current || !chart || canvasRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 1;

    containerRef.current.appendChild(canvas);
    canvasRef.current = canvas;

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

  /* ---------------- DRAW BAND ---------------- */
  const drawBand = (ctx, upper, lower, upperSeries, lowerSeries, color) => {
    if (!upper.length || !lower.length) return;
    const len = Math.min(upper.length, lower.length);

    ctx.beginPath();
    ctx.fillStyle = color;

    // upper line
    for (let i = 0; i < len; i++) {
      const p = upper[i];
      const x = chart.timeScale().timeToCoordinate(p.time);
      const y = upperSeries.priceToCoordinate(p.value);
      if (x == null || y == null) continue;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // lower line (reverse)
    for (let i = len - 1; i >= 0; i--) {
      const p = lower[i];
      const x = chart.timeScale().timeToCoordinate(p.time);
      const y = lowerSeries.priceToCoordinate(p.value);
      if (x == null || y == null) continue;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
  };

  /* ---------------- DRAW CLOUD ---------------- */
  const drawCloud = () => {
    if (!canvasRef.current || !chart || !containerRef) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = containerRef.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fill = indicatorStyle?.KC?.bbFill;
    if (!fill?.visible) return;

    const kc = seriesRef.current;
    const { upper, lower } = bandDataRef.current;

    if (!upper.length || !lower.length) return;

    drawBand(
      ctx,
      upper,
      lower,
      kc.upper,
      kc.lower,
      fill.topFillColor1 || "rgba(76,175,80,0.2)"
    );
  };

  /* ---------------- REDRAW EVENTS ---------------- */
  useEffect(() => {
    if (!chart) return;

    const redraw = () => drawCloud();
    chart.timeScale().subscribeVisibleTimeRangeChange(redraw);
    chart.subscribeCrosshairMove(redraw);

    drawCloud();

    return () => {
      chart.timeScale().unsubscribeVisibleTimeRangeChange(redraw);
      chart.unsubscribeCrosshairMove(redraw);
    };
  }, [chart, indicatorStyle, result]);

  return null;
}