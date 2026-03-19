import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function BBPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
  indicatorConfigs,
}) {

  const cloudCanvasRef = useRef(null);
  const cloudCtxRef = useRef(null);

  /* ================= CREATE BB LINES ================= */

  useEffect(() => {

    if (!result?.data) return;

    if (indicatorSeriesRef.current?.BB) {
      Object.values(indicatorSeriesRef.current.BB).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.BB = null;
    }

    const groupedSeries = {};
    const bbData = Array.isArray(result.data) ? result.data[0] : result.data;

    const mapSeries = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const upperData = mapSeries(bbData.upper);
    const basisData = mapSeries(bbData.basis);
    const lowerData = mapSeries(bbData.lower);

    groupedSeries.upper = addSeries("BB", LineSeries, {
      color: indicatorStyle?.BB?.upper?.color ?? "rgba(239,83,80,1)",
      lineWidth: indicatorStyle?.BB?.upper?.width ?? 2,
      lineStyle: indicatorStyle?.BB?.upper?.lineStyle ?? 0,
      visible: indicatorStyle?.BB?.upper?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    groupedSeries.basis = addSeries("BB", LineSeries, {
      color: indicatorStyle?.BB?.basis?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.BB?.basis?.width ?? 1,
      lineStyle: indicatorStyle?.BB?.basis?.lineStyle ?? 0,
      visible: indicatorStyle?.BB?.basis?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    groupedSeries.lower = addSeries("BB", LineSeries, {
      color: indicatorStyle?.BB?.lower?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.BB?.lower?.width ?? 2,
      lineStyle: indicatorStyle?.BB?.lower?.lineStyle ?? 0,
      visible: indicatorStyle?.BB?.lower?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    groupedSeries.upper.setData(upperData);
    groupedSeries.basis.setData(basisData);
    groupedSeries.lower.setData(lowerData);

    groupedSeries._data = {
      upper: upperData,
      lower: lowerData,
    };

    indicatorSeriesRef.current.BB = groupedSeries;

  }, [result, indicatorConfigs]);

  /* ================= APPLY STYLE UPDATES ================= */

  useEffect(() => {

    const bbGroup = indicatorSeriesRef.current?.BB;
    if (!bbGroup) return;

    bbGroup.upper.applyOptions({
      color: indicatorStyle?.BB?.upper?.color,
      lineWidth: indicatorStyle?.BB?.upper?.width,
      lineStyle: indicatorStyle?.BB?.upper?.lineStyle,
      visible: indicatorStyle?.BB?.upper?.visible,
    });

    bbGroup.basis.applyOptions({
      color: indicatorStyle?.BB?.basis?.color,
      lineWidth: indicatorStyle?.BB?.basis?.width,
      lineStyle: indicatorStyle?.BB?.basis?.lineStyle,
      visible: indicatorStyle?.BB?.basis?.visible,
    });

    bbGroup.lower.applyOptions({
      color: indicatorStyle?.BB?.lower?.color,
      lineWidth: indicatorStyle?.BB?.lower?.width,
      lineStyle: indicatorStyle?.BB?.lower?.lineStyle,
      visible: indicatorStyle?.BB?.lower?.visible,
    });

  }, [indicatorStyle]);

  /* ================= CREATE CLOUD CANVAS ================= */

  useEffect(() => {

    if (!containerRef?.current || !chart) return;
    if (cloudCanvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const canvas = document.createElement("canvas");

    canvas.width = rect.width;
    canvas.height = rect.height;

    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";

    containerRef.current.appendChild(canvas);

    cloudCanvasRef.current = canvas;
    cloudCtxRef.current = canvas.getContext("2d");

  }, [chart]);

  /* ================= DRAW CLOUD ================= */

  useEffect(() => {

    const ctx = cloudCtxRef.current;
    const canvas = cloudCanvasRef.current;

    if (!ctx || !canvas) return;

    const drawBg = () => {

      const bbGroup = indicatorSeriesRef.current?.BB;
      if (!bbGroup?._data) return;

      ctx.clearRect(0,0,canvas.width,canvas.height);

      if (!indicatorStyle?.BB?.bg?.visible) return;

      const upperData = bbGroup._data.upper;
      const lowerData = bbGroup._data.lower;

      const gradient = ctx.createLinearGradient(0,0,0,canvas.height);

      gradient.addColorStop(0, indicatorStyle?.BB?.bg?.topFillColor1);
      gradient.addColorStop(1, indicatorStyle?.BB?.bg?.topFillColor2);

      ctx.fillStyle = gradient;

      ctx.beginPath();

      upperData.forEach((p,i)=>{

        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = bbGroup.upper.priceToCoordinate(p.value);

        if(x==null || y==null) return;

        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);

      });

      [...lowerData].reverse().forEach((p)=>{

        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = bbGroup.lower.priceToCoordinate(p.value);

        if(x==null || y==null) return;

        ctx.lineTo(x,y);

      });

      ctx.closePath();
      ctx.fill();

    };

    drawBg();

    chart.timeScale().subscribeVisibleLogicalRangeChange(drawBg);
    chart.subscribeCrosshairMove(drawBg);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(drawBg);
      chart.unsubscribeCrosshairMove(drawBg);
    };

  }, [indicatorStyle, result]);

  return null;
}