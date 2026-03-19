import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function DCPlot({
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

  /* ================= CREATE DC LINES ================= */

  useEffect(() => {
    if (!result?.data) return;

    if (indicatorSeriesRef.current?.DC) {
      Object.values(indicatorSeriesRef.current.DC).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });
      indicatorSeriesRef.current.DC = null;
    }

    const groupedSeries = {};
    const dcData = Array.isArray(result.data) ? result.data[0] : result.data;

    const mapSeries = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const upperData = mapSeries(dcData.upper);
    const basisData = mapSeries(dcData.basis);
    const lowerData = mapSeries(dcData.lower);

    groupedSeries.upper = addSeries("DC", LineSeries, {
      color: indicatorStyle?.DC?.upper?.color ?? "rgba(239,83,80,1)",
      lineWidth: indicatorStyle?.DC?.upper?.width ?? 1,
      lineStyle: indicatorStyle?.DC?.upper?.lineStyle ?? 0,
      visible: indicatorStyle?.DC?.upper?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    groupedSeries.basis = addSeries("DC", LineSeries, {
      color: indicatorStyle?.DC?.basis?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.DC?.basis?.width ?? 1,
      lineStyle: indicatorStyle?.DC?.basis?.lineStyle ?? 0,
      visible: indicatorStyle?.DC?.basis?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    groupedSeries.lower = addSeries("DC", LineSeries, {
      color: indicatorStyle?.DC?.lower?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.DC?.lower?.width ?? 1,
      lineStyle: indicatorStyle?.DC?.lower?.lineStyle ?? 0,
      visible: indicatorStyle?.DC?.lower?.visible ?? true,
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

    indicatorSeriesRef.current.DC = groupedSeries;
  }, [result,indicatorConfigs, indicatorStyle]);

  /* ================= APPLY STYLE UPDATES ================= */

  useEffect(() => {
    const dcGroup = indicatorSeriesRef.current?.DC;
    if (!dcGroup) return;

    dcGroup.upper.applyOptions({
      color: indicatorStyle?.DC?.upper?.color ?? "#ef5350",
      lineWidth: indicatorStyle?.DC?.upper?.width ?? 1,
      lineStyle: indicatorStyle?.DC?.upper?.lineStyle ?? 0,
      visible: indicatorStyle?.DC?.upper?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    dcGroup.basis.applyOptions({
      color: indicatorStyle?.DC?.basis?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.DC?.basis?.width ?? 1,
      lineStyle: indicatorStyle?.DC?.basis?.lineStyle ?? 0,
      visible: indicatorStyle?.DC?.basis?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    dcGroup.lower.applyOptions({
      color: indicatorStyle?.DC?.lower?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.DC?.lower?.width ?? 2,
      lineStyle: indicatorStyle?.DC?.lower?.lineStyle ?? 0,
      visible: indicatorStyle?.DC?.lower?.visible ?? true,
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

  /* ================= DRAW DC BACKGROUND ================= */

  useEffect(() => {
    const ctx = cloudCtxRef.current;
    const canvas = cloudCanvasRef.current;

    if (!ctx || !canvas) return;

    const drawBg = () => {
      const dcGroup = indicatorSeriesRef.current?.DC;
      if (!dcGroup?._data) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!indicatorStyle?.DC?.bg?.visible) return;

      const upperData = dcGroup._data.upper;
      const lowerData = dcGroup._data.lower;

      if (!upperData.length || !lowerData.length) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient.addColorStop(
        0,
        indicatorStyle?.DC?.bg?.topFillColor1 ?? "rgba(38,166,154,0.1)",
      );

      gradient.addColorStop(
        1,
        indicatorStyle?.DC?.bg?.topFillColor2 ?? "rgba(239,83,80,0.1)",
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();

      /* -------- UPPER LINE -------- */

      upperData.forEach((p, i) => {
        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = dcGroup.upper.priceToCoordinate(p.value);

        if (x == null || y == null) return;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      /* -------- LOWER LINE -------- */

      [...lowerData].reverse().forEach((p) => {
        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = dcGroup.lower.priceToCoordinate(p.value);

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
