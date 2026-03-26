import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function VWAPPlot({
  result,
  indicatorStyle,
  indicatorConfigs,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
}) {
  const seriesRef = useRef({});
  const canvasRef = useRef(null);

  const bandDataRef = useRef({
    upper1: [],
    lower1: [],
    upper2: [],
    lower2: [],
    upper3: [],
    lower3: [],
  });

  const clean = (d) => (Array.isArray(d) ? d.filter((x) => x?.time && x?.value != null) : []);

  /* ---------------- CREATE SERIES ---------------- */
  useEffect(() => {
    if (!chart || seriesRef.current.vwap) return;

    const s = {};
    s.vwap = addSeries("VWAP", LineSeries, indicatorStyle.VWAP.vwap);

    for (let i = 1; i <= 3; i++) {
      s[`upperBand${i}`] = addSeries("VWAP", LineSeries, indicatorStyle.VWAP[`upperBand${i}`]);
      s[`lowerBand${i}`] = addSeries("VWAP", LineSeries, indicatorStyle.VWAP[`lowerBand${i}`]);
    }

    seriesRef.current = s;
    indicatorSeriesRef.current.VWAP = s;
  }, [chart]);

  /* ---------------- UPDATE DATA ---------------- */
  useEffect(() => {
    if (!result?.data) return;
    const d = result.data;

    const vwap = clean(d.vwap);
    const upper1 = clean(d.upper1);
    const lower1 = clean(d.lower1);
    const upper2 = clean(d.upper2);
    const lower2 = clean(d.lower2);
    const upper3 = clean(d.upper3);
    const lower3 = clean(d.lower3);

    bandDataRef.current = { upper1, lower1, upper2, lower2, upper3, lower3 };

    seriesRef.current.vwap?.setData(vwap);

    seriesRef.current.upperBand1?.setData(upper1);
    seriesRef.current.lowerBand1?.setData(lower1);

    seriesRef.current.upperBand2?.setData(upper2);
    seriesRef.current.lowerBand2?.setData(lower2);

    seriesRef.current.upperBand3?.setData(upper3);
    seriesRef.current.lowerBand3?.setData(lower3);

    // Delay cloud drawing to allow series coordinates to update
    requestAnimationFrame(() => drawClouds());
  }, [result]);

  /* ---------------- BAND VISIBILITY ---------------- */
  useEffect(() => {
    const cfg = indicatorConfigs?.VWAP || {};

    for (let i = 1; i <= 3; i++) {
      const enabled = cfg[`band${i}`]?.enabled;

      seriesRef.current[`upperBand${i}`]?.applyOptions({ visible: enabled });
      seriesRef.current[`lowerBand${i}`]?.applyOptions({ visible: enabled });
    }

    requestAnimationFrame(() => drawClouds());
  }, [indicatorConfigs]);

  /* ---------------- STYLE UPDATE ---------------- */
  useEffect(() => {
    const group = seriesRef.current;

    Object.entries(group).forEach(([key, s]) => {
      const style = indicatorStyle?.VWAP?.[key];
      if (!style) return;

      s.applyOptions({
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle,
      });
    });

    requestAnimationFrame(() => drawClouds());
  }, [indicatorStyle]);

  /* ---------------- CANVAS INIT ---------------- */
  useEffect(() => {
    if (!containerRef || canvasRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none"; // allow crosshair
    canvas.style.zIndex = "1"; // behind crosshair

    containerRef.appendChild(canvas);
    canvasRef.current = canvas;
  }, [containerRef]);

  /* ---------------- DRAW BAND ---------------- */
  const drawBand = (ctx, upper, lower, color, series) => {
    if (!upper.length || !lower.length || !series) return;

    ctx.beginPath();
    ctx.fillStyle = color;

    // upper line
    for (let i = 0; i < upper.length; i++) {
      const x = chart.timeScale().timeToCoordinate(upper[i].time);
      const y = series.priceToCoordinate(upper[i].value);
      if (x == null || y == null) continue;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    // lower line (reverse)
    for (let i = lower.length - 1; i >= 0; i--) {
      const x = chart.timeScale().timeToCoordinate(lower[i].time);
      const y = series.priceToCoordinate(lower[i].value);
      if (x == null || y == null) continue;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
  };

  /* ---------------- DRAW CLOUDS ---------------- */
  const drawClouds = () => {
    if (!canvasRef.current || !chart || !containerRef) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = containerRef.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cfg = indicatorConfigs?.VWAP || {};
    const style = indicatorStyle?.VWAP || {};

    const fill1 = style.bandFill1?.visible ? style.bandFill1?.color : null;
    const fill2 = style.bandFill2?.visible ? style.bandFill2?.color : null;
    const fill3 = style.bandFill3?.visible ? style.bandFill3?.color : null;

    if (cfg.band1?.enabled && fill1)
      drawBand(ctx, bandDataRef.current.upper1, bandDataRef.current.lower1, fill1, seriesRef.current.upperBand1);

    if (cfg.band2?.enabled && fill2)
      drawBand(ctx, bandDataRef.current.upper2, bandDataRef.current.lower2, fill2, seriesRef.current.upperBand2);

    if (cfg.band3?.enabled && fill3)
      drawBand(ctx, bandDataRef.current.upper3, bandDataRef.current.lower3, fill3, seriesRef.current.upperBand3);
  };

  /* ---------------- REDRAW EVENTS ---------------- */
  useEffect(() => {
    if (!chart) return;

    const redraw = () => requestAnimationFrame(drawClouds);

    chart.timeScale().subscribeVisibleLogicalRangeChange(redraw);
    chart.subscribeCrosshairMove(redraw);
    drawClouds();

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(redraw);
      chart.unsubscribeCrosshairMove(redraw);
    };
  }, [chart, indicatorConfigs, indicatorStyle, result]);

  return null;
}