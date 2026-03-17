import { useEffect, useRef } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

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

    if (indicatorSeriesRef.current?.IchimokuCloud) {
      Object.values(indicatorSeriesRef.current.IchimokuCloud).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.IchimokuCloud = null;
    }

    const style = indicatorStyle?.IchimokuCloud ?? {};
    const grouped = {};

    /* ================= DATA ================= */

    const conversionLine = result?.data?.conversionLine || [];
    const baseLine = result?.data?.baseLine || [];
    const spanA = result?.data?.leadLine1 || [];
    const spanB = result?.data?.leadLine2 || [];
    const laggingSpan = result?.data?.laggingSpan || [];

    const kumoUpper = result?.data?.kumoCloudUpper || [];
    const kumoLower = result?.data?.kumoCloudLower || [];

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

    const kumoUpperSeries = addSeries("main", LineSeries, {
      color: style?.kumoCloudUpper?.color,
      lineWidth: style?.kumoCloudUpper?.width ?? 2,
      visible: style?.kumoCloudUpper?.visible ?? true,
    });

    const kumoLowerSeries = addSeries("main", LineSeries, {
      color: style?.kumoCloudLower?.color,
      lineWidth: style?.kumoCloudLower?.width ?? 2,
      visible: style?.kumoCloudLower?.visible ?? true,
    });

    /* ================= SET LINE DATA ================= */

    conversionSeries.setData(conversionLine);
    baseSeries.setData(baseLine);
    spanASeries.setData(spanA);
    spanBSeries.setData(spanB);
    laggingSeries.setData(laggingSpan);

    kumoUpperSeries.setData(kumoUpper);
    kumoLowerSeries.setData(kumoLower);

    /* ================= STORE ================= */

    grouped.conversionLine = conversionSeries;
    grouped.baseLine = baseSeries;
    grouped.leadLine1 = spanASeries;
    grouped.leadLine2 = spanBSeries;
    grouped.laggingSpan = laggingSeries;

    grouped.kumoCloudUpper = kumoUpperSeries;
    grouped.kumoCloudLower = kumoLowerSeries;

    grouped.result = result;

    indicatorSeriesRef.current.IchimokuCloud = grouped;
  }, [result]);

  /* ================= CREATE CANVAS ================= */

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

  /* ================= DRAW KUMO CLOUD ================= */

  useEffect(() => {
    const group = indicatorSeriesRef.current?.IchimokuCloud;

    const upperSeries = group?.kumoCloudUpper;
    const lowerSeries = group?.kumoCloudLower;

    const upperData = group?.result?.data?.kumoCloudUpper;
    const lowerData = group?.result?.data?.kumoCloudLower;

    const ctx = cloudCtxRef.current;
    const canvas = cloudCanvasRef.current;

    if (!ctx || !canvas || !upperSeries || !lowerSeries) return;

    if (!upperData?.length || !lowerData?.length) return;

    const drawCloud = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < upperData.length - 1; i++) {
        const u1 = upperData[i];
        const u2 = upperData[i + 1];

        const l1 = lowerData[i];
        const l2 = lowerData[i + 1];

        const x1 = chart.timeScale().timeToCoordinate(u1.time);
        const x2 = chart.timeScale().timeToCoordinate(u2.time);

        const uy1 = upperSeries.priceToCoordinate(u1.value);
        const uy2 = upperSeries.priceToCoordinate(u2.value);

        const ly1 = lowerSeries.priceToCoordinate(l1.value);
        const ly2 = lowerSeries.priceToCoordinate(l2.value);

        if (
          x1 === null ||
          x2 === null ||
          uy1 === null ||
          uy2 === null ||
          ly1 === null ||
          ly2 === null
        )
          continue;

        const bullish = (u1.value + u2.value) / 2 > (l1.value + l2.value) / 2;

        ctx.beginPath();

        ctx.moveTo(x1, uy1);
        ctx.lineTo(x2, uy2);
        ctx.lineTo(x2, ly2);
        ctx.lineTo(x1, ly1);
        ctx.closePath();

        ctx.fillStyle = bullish ? "rgba(0,200,0,0.25)" : "rgba(255,0,0,0.25)";
        

        ctx.fill();
      }
    };

    drawCloud();

    chart.timeScale().subscribeVisibleLogicalRangeChange(drawCloud);
    chart.subscribeCrosshairMove(drawCloud);
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const group = indicatorSeriesRef.current?.IchimokuCloud;
    if (!group) return;

    const style = indicatorStyle?.IchimokuCloud ?? {};

    if (group.conversionLine) {
      group.conversionLine.applyOptions({
        color: style?.conversionLine?.color,
        lineWidth: style?.conversionLine?.width,
        lineStyle: style?.conversionLine?.lineStyle ?? 0,
        visible: style?.conversionLine?.visible,
      });
    }

    if (group.baseLine) {
      group.baseLine.applyOptions({
        color: style?.baseLine?.color,
        lineWidth: style?.baseLine?.width,
        lineStyle: style?.baseLine?.lineStyle ?? 0,
        visible: style?.baseLine?.visible,
      });
    }

    if (group.leadLine1) {
      group.leadLine1.applyOptions({
        color: style?.leadLine1?.color,
        lineWidth: style?.leadLine1?.width,
        lineStyle: style?.leadLine1?.lineStyle ?? 0,
        visible: style?.leadLine1?.visible,
      });
    }

    if (group.leadLine2) {
      group.leadLine2.applyOptions({
        color: style?.leadLine2?.color,
        lineWidth: style?.leadLine2?.width,
        lineStyle: style?.leadLine2?.lineStyle ?? 0,
        visible: style?.leadLine2?.visible,
      });
    }

    if (group.laggingSpan) {
      group.laggingSpan.applyOptions({
        color: style?.laggingSpan?.color,
        lineWidth: style?.laggingSpan?.width,
        lineStyle: style?.laggingSpan?.lineStyle ?? 0,
        visible: style?.laggingSpan?.visible,
      });
    }

    if (group.kumoCloudUpper) {
      group.kumoCloudUpper.applyOptions({
        color: style?.kumoCloudUpper?.color,
        lineWidth: style?.kumoCloudUpper?.width,
        lineStyle: style?.kumoCloudUpper?.lineStyle ?? 0,
        visible: style?.kumoCloudUpper?.visible,
      });
    }

    if (group.kumoCloudLower) {
      group.kumoCloudLower.applyOptions({
        color: style?.kumoCloudLower?.color,
        lineWidth: style?.kumoCloudLower?.width,
        lineStyle: style?.kumoCloudLower?.lineStyle ?? 0,
        visible: style?.kumoCloudLower?.visible,
      });
    }

    group.bullishCloud?.applyOptions({
      visible: style?.cloudFillBullish?.visible,
      topColor: style?.cloudFillBullish?.color,
      bottomColor: style?.cloudFillBullish?.color,
    });

    group.bearishCloud?.applyOptions({
      visible: style?.cloudFillBearish?.visible,
      topColor: style?.cloudFillBearish?.color,
      bottomColor: style?.cloudFillBearish?.color,
    });
  }, [indicatorStyle]);

  return null;
}
