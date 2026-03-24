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
  indicatorConfigs,
}) {

  const seriesRef = useRef({});
  const canvasRef = useRef(null);

  const bandDataRef = useRef({
    upper: [],
    lower: [],
  });

  const maType = indicatorConfigs?.SMA?.maType;

  const clean = (d) =>
    Array.isArray(d) ? d.filter((x) => x?.time && x?.value != null) : [];

  /* ---------------- CREATE SERIES ---------------- */

  useEffect(() => {

    if (!chart || seriesRef.current.sma) return;

    const s = {};

    Object.entries(indicatorStyle?.SMA || {}).forEach(([key]) => {

      if (["bbFill"].includes(key)) return;

      s[key] = addSeries("SMA", LineSeries, indicatorStyle.SMA[key]);

    });

    seriesRef.current = s;
    indicatorSeriesRef.current.SMA = s;

  }, [chart]);


  /* ---------------- UPDATE DATA ---------------- */

  useEffect(() => {

    if (!result?.data) return;

    const d = result.data;

    const sma = clean(d.sma);
    const smoothingMA = clean(d.smoothingMA);
    const upper = clean(d.bbUpper);
    const lower = clean(d.bbLower);

    bandDataRef.current = { upper, lower };

    seriesRef.current.sma?.setData(sma);
    seriesRef.current.smoothingMA?.setData(smoothingMA);

    seriesRef.current.bbUpper?.setData(upper);
    seriesRef.current.bbLower?.setData(lower);

    drawCloud();

  }, [result]);


  /* ---------------- STYLE UPDATE ---------------- */

  useEffect(() => {

    const group = seriesRef.current;

    Object.entries(group).forEach(([key, s]) => {

      const style = indicatorStyle?.SMA?.[key];
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

    if (!containerRef || canvasRef.current) return;

    const canvas = document.createElement("canvas");

    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 1;

    containerRef.appendChild(canvas);

    canvasRef.current = canvas;

  }, [containerRef]);


  /* ---------------- DRAW BAND ---------------- */

  const drawBand = (ctx, upper, lower, color, series) => {

    if (!upper.length || !lower.length) return;

    const len = Math.min(upper.length, lower.length);

    ctx.beginPath();
    ctx.fillStyle = color;

    for (let i = 0; i < len; i++) {

      const p = upper[i];

      const x = chart.timeScale().timeToCoordinate(p.time);
      const y = series.priceToCoordinate(p.value);

      if (x == null || y == null) continue;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    for (let i = len - 1; i >= 0; i--) {

      const p = lower[i];

      const x = chart.timeScale().timeToCoordinate(p.time);
      const y = series.priceToCoordinate(p.value);

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

    if (maType !== "SMA + Bollinger Bands") return;

    const fill = indicatorStyle?.SMA?.bbFill;

    if (!fill?.visible) return;

    drawBand(
      ctx,
      bandDataRef.current.upper,
      bandDataRef.current.lower,
      fill.topFillColor1 || "rgba(76,175,80,0.2)",
      seriesRef.current.bbUpper
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

  }, [chart, indicatorConfigs, indicatorStyle, result]);

  return null;
}