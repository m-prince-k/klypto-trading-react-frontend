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
  const cloudCanvasRef = useRef(null);
  const cloudCtxRef = useRef(null);

  const maType = indicatorConfigs?.SMA?.maType;

  /* ================= CREATE SMA ================= */

  useEffect(() => {
    if (!result) return;

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

    Object.entries(result.data || {}).forEach(([lineName, lineData]) => {
      if (!Array.isArray(lineData)) return;

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.SMA?.[lineName];

      const series = addSeries("SMA", LineSeries, {
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

    indicatorSeriesRef.current.SMA = {
      ...groupedSeries,
      result,
    };
  }, [result]);

  /* ================= CREATE CLOUD CANVAS ================= */

  useEffect(() => {
    if (!containerRef?.current || !chart) return;

    if (cloudCanvasRef.current) return;

    const canvas = document.createElement("canvas");

    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";

    containerRef.current.appendChild(canvas);

    cloudCanvasRef.current = canvas;
    cloudCtxRef.current = canvas.getContext("2d");

    const resize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [chart]);

  /* ================= DRAW CLOUD ================= */

  useEffect(() => {
    const ctx = cloudCtxRef.current;
    const canvas = cloudCanvasRef.current;

    if (!ctx || !canvas) return;

    if (maType !== "SMA + Bollinger Bands") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const smaGroup = indicatorSeriesRef.current?.SMA;

    const upperSeries = smaGroup?.bbUpper;
    const lowerSeries = smaGroup?.bbLower;

    const upperData = smaGroup?.result?.data?.bbUpper;
    const lowerData = smaGroup?.result?.data?.bbLower;

    if (!upperSeries || !lowerSeries) return;
    if (!upperData?.length || !lowerData?.length) return;

    const drawCloud = () => {
      const fillStyle = indicatorStyle?.SMA?.bbFill;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!fillStyle?.visible) return;

      const upperCoords = [];
      const lowerCoords = [];

      upperData.forEach((p) => {
        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = upperSeries.priceToCoordinate(p.value);

        if (x != null && y != null) {
          upperCoords.push({ x, y });
        }
      });

      lowerData.forEach((p) => {
        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = lowerSeries.priceToCoordinate(p.value);

        if (x != null && y != null) {
          lowerCoords.push({ x, y });
        }
      });

      if (!upperCoords.length || !lowerCoords.length) return;

      ctx.beginPath();

      ctx.moveTo(upperCoords[0].x, upperCoords[0].y);

      upperCoords.forEach((p) => ctx.lineTo(p.x, p.y));

      for (let i = lowerCoords.length - 1; i >= 0; i--) {
        ctx.lineTo(lowerCoords[i].x, lowerCoords[i].y);
      }

      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient.addColorStop(
        0,
        fillStyle?.topFillColor1 || "rgba(0,255,0,0.25)"
      );

      gradient.addColorStop(
        1,
        fillStyle?.bottomFillColor1 || "rgba(0,255,0,0)"
      );

      ctx.fillStyle = gradient;
      ctx.fill();
    };

    drawCloud();

    const redraw = () => drawCloud();

    chart.timeScale().subscribeVisibleLogicalRangeChange(redraw);
    chart.subscribeCrosshairMove(redraw);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(redraw);
      chart.unsubscribeCrosshairMove(redraw);
    };
  }, [indicatorStyle?.SMA?.bbFill, result, indicatorConfigs]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const smaGroup = indicatorSeriesRef.current?.SMA;
    if (!smaGroup) return;

    const styles = indicatorStyle?.SMA;

    ["sma", "smoothingMA", "bbUpper", "bbLower"].forEach((key) => {
      if (!smaGroup[key]) return;

      const s = styles?.[key];

      smaGroup[key].applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });
    });
  }, [indicatorStyle]);

  return null;
}