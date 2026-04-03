import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function IchimokuCloudPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
}) {
  const cloudCanvasRef = useRef(null);
  const cloudCtxRef = useRef(null);

  /* ================= CREATE SERIES ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.ICHIMOKU) {
      Object.values(indicatorSeriesRef.current.ICHIMOKU).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.ICHIMOKU = null;
    }

    const style = indicatorStyle?.ICHIMOKU ?? {};
    const grouped = {};

    /* ================= DATA ================= */

    const conversionLine = result?.data?.conversionLine || [];
    const baseLine = result?.data?.baseLine || [];
    const spanA = result?.data?.leadLine1 || [];
    const spanB = result?.data?.leadLine2 || [];
    const laggingSpan = result?.data?.laggingSpan || [];

    /* ================= LINES ================= */

    const conversionSeries = addSeries("main", LineSeries, {
      color: style?.conversionLine?.color,
      lineWidth: style?.conversionLine?.width ?? 2,
      visible: style?.conversionLine?.visible ?? true,
    });

    const baseSeries = addSeries("main", LineSeries, {
      color: style?.baseLine?.color,
      lineWidth: style?.baseLine?.width ?? 2,
      visible: style?.baseLine?.visible ?? true,
    });

    const spanASeries = addSeries("main", LineSeries, {
      color: style?.leadLine1?.color,
      lineWidth: style?.leadLine1?.width ?? 2,
      visible: style?.leadLine1?.visible ?? true,
    });

    const spanBSeries = addSeries("main", LineSeries, {
      color: style?.leadLine2?.color,
      lineWidth: style?.leadLine2?.width ?? 2,
      visible: style?.leadLine2?.visible ?? true,
    });

    const laggingSeries = addSeries("main", LineSeries, {
      color: style?.laggingSpan?.color,
      lineWidth: style?.laggingSpan?.width ?? 2,
      visible: style?.laggingSpan?.visible ?? true,
    });

    conversionSeries.setData(conversionLine);
    baseSeries.setData(baseLine);
    spanASeries.setData(spanA);
    spanBSeries.setData(spanB);
    laggingSeries.setData(laggingSpan);

    /* ================= STORE ================= */

    grouped.conversionLine = conversionSeries;
    grouped.baseLine = baseSeries;
    grouped.leadLine1 = spanASeries;
    grouped.leadLine2 = spanBSeries;
    grouped.laggingSpan = laggingSeries;

    grouped.spanA = spanA;
    grouped.spanB = spanB;

    indicatorSeriesRef.current.ICHIMOKU = grouped;
  }, [result]);

  /* ================= CREATE CANVAS ================= */

  useEffect(() => {
    const container = containerRef?.current || containerRef;

    if (!container || !chart) return;

    const rect = container.getBoundingClientRect();

    const canvas = document.createElement("canvas");

    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";

    container.appendChild(canvas);

    cloudCanvasRef.current = canvas;
    cloudCtxRef.current = canvas.getContext("2d");
  }, [chart]);

  /* ================= DRAW KUMO CLOUD ================= */

  useEffect(() => {
    const drawCloud = () => {
      const group = indicatorSeriesRef.current?.ICHIMOKU;
      if (!group) return;

      const { spanA, spanB, leadLine1, leadLine2 } = group;

      if (!spanA?.length || !spanB?.length) return;

      const ctx = cloudCtxRef.current;
      const canvas = cloudCanvasRef.current;

      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bullishColor =
        indicatorStyle?.ICHIMOKU?.cloudFillBullish?.color ||
        "rgba(0,200,0,0.25)";

      const bearishColor =
        indicatorStyle?.ICHIMOKU?.cloudFillBearish?.color ||
        "rgba(255,0,0,0.25)";

      // 🔥 ONE CONTINUOUS PATH
      ctx.beginPath();

      // TOP LINE (Span A)
      for (let i = 0; i < spanA.length; i++) {
        const p = spanA[i];

        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = leadLine1.priceToCoordinate(p.value);

        if (x == null || y == null) continue;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // BOTTOM LINE (Span B reversed)
      for (let i = spanB.length - 1; i >= 0; i--) {
        const p = spanB[i];

        const x = chart.timeScale().timeToCoordinate(p.time);
        const y = leadLine2.priceToCoordinate(p.value);

        if (x == null || y == null) continue;

        ctx.lineTo(x, y);
      }

      ctx.closePath();

      // Decide color based on last value
      const lastA = spanA[spanA.length - 1]?.value;
      const lastB = spanB[spanB.length - 1]?.value;

      const bullish = lastA > lastB;

      ctx.fillStyle = bullish ? bullishColor : bearishColor;
      ctx.fill();
    };

    drawCloud();
    chart.timeScale().subscribeVisibleLogicalRangeChange(drawCloud);
    chart.subscribeCrosshairMove(drawCloud);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(drawCloud);
      chart.unsubscribeCrosshairMove(drawCloud);
    };
  }, [result, indicatorStyle]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const group = indicatorSeriesRef.current?.ICHIMOKU;
    if (!group) return;

    const style = indicatorStyle?.ICHIMOKU ?? {};

    [
      "conversionLine",
      "baseLine",
      "leadLine1",
      "leadLine2",
      "laggingSpan",
    ].forEach((key) => {
      const s = group[key];
      const st = style?.[key];
      if (!s || !st) return;
      s.applyOptions({
        color: st.color,
        lineWidth: st.width,
        lineStyle: st.lineStyle ?? 0,
        visible: st.visible,
      });
    });
  }, [indicatorStyle]);

  return null;
}
