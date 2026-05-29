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
  panesRef,
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

  /* ================= CANVAS INIT ================= */

  useEffect(() => {
    if (!panesRef?.current || !containerRef?.current) return;

    let retryCount = 0;
    const MAX_RETRIES = 10;

    const initCanvas = () => {
      const paneKey = indicator;
      const currentPane = panesRef.current[paneKey];
      const paneDiv = currentPane?.div;

      if (!paneDiv) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(initCanvas, 100);
        }
        return;
      }

      if (
        cloudCanvasRef.current &&
        cloudCanvasRef.current.parentNode === containerRef.current
      ) {
        drawBBCloud();
        return;
      }

      if (cloudCanvasRef.current) cloudCanvasRef.current.remove();

      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "10";

      containerRef.current.appendChild(canvas);

      cloudCanvasRef.current = canvas;

      drawBBCloud();
    };

    initCanvas();
  }, [panesRef, result, containerRef]);

  /* ================= DRAW BB CLOUD ================= */

  const drawBBCloud = () => {
    const paneKey = indicator;
    const currentPane = panesRef.current?.[paneKey];
    const paneDiv = currentPane?.div;
    const paneChart = currentPane?.chart;

    if (!cloudCanvasRef.current || !paneDiv || !paneChart || !containerRef?.current) return;

    const canvas = cloudCanvasRef.current;
    const ctx = canvas.getContext("2d");

    const paneRect = paneDiv.getBoundingClientRect();
    const chartRect = containerRef.current.getBoundingClientRect();
    const topOffset = paneRect.top - chartRect.top;
    const leftOffset = paneRect.left - chartRect.left;

    canvas.width = chartRect.width;
    canvas.height = chartRect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cciGroup = indicatorSeriesRef.current?.[indicator];
    if (!cciGroup) return;

    const upperData = cciGroup.result?.data?.bbUpper || [];
    const lowerData = cciGroup.result?.data?.bbLower || [];

    if (!upperData.length || !lowerData.length) return;

    const fillStyle = indicatorStyle?.[indicator]?.bbFill;
    if (!fillStyle?.visible) return;

    ctx.save();
    ctx.translate(leftOffset, topOffset);

    ctx.beginPath();

    for (let i = 0; i < upperData.length; i++) {
      const p = upperData[i];
      const x = paneChart.timeScale().timeToCoordinate(p.time);
      const y = cciGroup.bbUpper?.priceToCoordinate(p.value);

      if (x == null || y == null) continue;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    for (let i = lowerData.length - 1; i >= 0; i--) {
      const p = lowerData[i];
      const x = paneChart.timeScale().timeToCoordinate(p.time);
      const y = cciGroup.bbLower?.priceToCoordinate(p.value);

      if (x == null || y == null) continue;

      ctx.lineTo(x, y);
    }

    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, fillStyle?.topFillColor1 || "rgba(33,150,243,0.2)");
    gradient.addColorStop(1, fillStyle?.bottomFillColor1 || "rgba(33,150,243,0)");

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      drawBBCloud();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let animationFrame;

    const loop = () => {
      drawBBCloud();
      animationFrame = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const paneKey = indicator;
    const currentPane = panesRef.current?.[paneKey];
    const paneChart = currentPane?.chart;

    if (!paneChart) return;

    const redraw = () => {
      requestAnimationFrame(drawBBCloud);
    };

    const timeScale = paneChart.timeScale();

    timeScale.subscribeVisibleTimeRangeChange(redraw);
    timeScale.subscribeVisibleLogicalRangeChange(redraw);
    paneChart.subscribeCrosshairMove(redraw);

    return () => {
      timeScale.unsubscribeVisibleTimeRangeChange(redraw);
      timeScale.unsubscribeVisibleLogicalRangeChange(redraw);
      paneChart.unsubscribeCrosshairMove(redraw);
    };
  }, [panesRef, indicator]);

  /* ================= CLEANUP CANVAS ================= */

  useEffect(() => {
    return () => {
      if (cloudCanvasRef.current) {
        cloudCanvasRef.current.remove();
        cloudCanvasRef.current = null;
      }
    };
  }, []);


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

    if (cciGroup.bgFill) {
      cciGroup.bgFill.applyOptions({
        topFillColor1: styles?.bgFill?.topFillColor1,
        topFillColor2: styles?.bgFill?.topFillColor2,
        visible: styles?.bgFill?.visible ?? true,
      });
    }

    drawBBCloud();

  }, [indicatorStyle, result]);

  return null;
}