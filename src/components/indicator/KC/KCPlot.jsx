import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function KCPlot({
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

  /* ================= CREATE KC LINES ================= */

  useEffect(() => {
    if (!result?.data) return;

    if (indicatorSeriesRef.current?.KC) {
      Object.values(indicatorSeriesRef.current.KC).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });
      indicatorSeriesRef.current.KC = null;
    }

    const groupedSeries = {};
    const kcData = Array.isArray(result.data) ? result.data[0] : result.data;

    const mapSeries = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const upperData = mapSeries(kcData.upper);
    const basisData = mapSeries(kcData.basis);
    const lowerData = mapSeries(kcData.lower);

    groupedSeries.upper = addSeries("KC", LineSeries, {
      color: indicatorStyle?.KC?.upper?.color ?? "rgba(239,83,80,1)",
      lineWidth: indicatorStyle?.KC?.upper?.width ?? 1,
      lineStyle: indicatorStyle?.KC?.upper?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.upper?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    groupedSeries.basis = addSeries("KC", LineSeries, {
      color: indicatorStyle?.KC?.basis?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.KC?.basis?.width ?? 1,
      lineStyle: indicatorStyle?.KC?.basis?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.basis?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    groupedSeries.lower = addSeries("KC", LineSeries, {
      color: indicatorStyle?.KC?.lower?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.KC?.lower?.width ?? 1,
      lineStyle: indicatorStyle?.KC?.lower?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.lower?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    groupedSeries.upper.setData(upperData);
    groupedSeries.basis.setData(basisData);
    groupedSeries.lower.setData(lowerData);

    // store data for canvas drawing
    groupedSeries._data = {
      upper: upperData,
      lower: lowerData,
    };

    indicatorSeriesRef.current.KC = groupedSeries;
  }, [result, indicatorConfigs, indicatorStyle]);

  /* ================= APPLY STYLE UPDATES ================= */

  useEffect(() => {
    const kcGroup = indicatorSeriesRef.current?.KC;
    if (!kcGroup) return;

    kcGroup.upper.applyOptions({
      color: indicatorStyle?.KC?.upper?.color ?? "#ef5350",
      lineWidth: indicatorStyle?.KC?.upper?.width ?? 1,
      lineStyle: indicatorStyle?.KC?.upper?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.upper?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    kcGroup.basis.applyOptions({
      color: indicatorStyle?.KC?.basis?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.KC?.basis?.width ?? 1,
      lineStyle: indicatorStyle?.KC?.basis?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.basis?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    kcGroup.lower.applyOptions({
      color: indicatorStyle?.KC?.lower?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.KC?.lower?.width ?? 2,
      lineStyle: indicatorStyle?.KC?.lower?.lineStyle ?? 0,
      visible: indicatorStyle?.KC?.lower?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
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
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";

    containerRef.current.appendChild(canvas);

    cloudCanvasRef.current = canvas;
    cloudCtxRef.current = canvas.getContext("2d");
  }, [chart]);

  /* ================= DRAW KC BACKGROUND ================= */

  useEffect(() => {
    const ctx = cloudCtxRef.current;
    const canvas = cloudCanvasRef.current;

    if (!ctx || !canvas) return;

    const drawBg = () => {
      const kcGroup = indicatorSeriesRef.current?.KC;
      if (!kcGroup?._data) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!indicatorStyle?.KC?.bg?.visible) return;

      const upperData = kcGroup._data.upper;
      const lowerData = kcGroup._data.lower;

      if (!upperData.length || !lowerData.length) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient.addColorStop(
        0,
        indicatorStyle?.KC?.bg?.topFillColor1 ?? "rgba(38,166,154,0.1)",
      );

      gradient.addColorStop(
        1,
        indicatorStyle?.KC?.bg?.topFillColor2 ?? "rgba(239,83,80,0.1)",
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();

      /* -------- UPPER LINE -------- */

      upperData.forEach((p, i) => {
        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = kcGroup.upper.priceToCoordinate(p.value);

        if (x == null || y == null) return;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      /* -------- LOWER LINE -------- */

      [...lowerData].reverse().forEach((p) => {
        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = kcGroup.lower.priceToCoordinate(p.value);

        if (x == null || y == null) return;

        ctx.lineTo(x, y);
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