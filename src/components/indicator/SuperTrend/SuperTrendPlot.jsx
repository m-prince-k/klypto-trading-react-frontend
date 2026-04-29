import { useCallback, useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function SuperTrendPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
}) {
  const canvasRef = useRef(null);
  const styleRef = useRef(indicatorStyle); // ✅ LIVE STYLE REF

  const seriesRef = useRef({
    bodyMiddle: null,
    upTrend: [],
    downTrend: [],
  });

  if (!indicatorSeriesRef.current) {
    indicatorSeriesRef.current = {};
  }

  /* ================= KEEP STYLE LIVE ================= */
  useEffect(() => {
    styleRef.current = indicatorStyle; // ✅ ALWAYS LATEST
  }, [indicatorStyle]);

  /* ================= CREATE LINES ================= */
  useEffect(() => {
    if (!result?.data || !chart) return;

    const { SUPERTREND } = indicatorStyle;

    if (seriesRef.current.bodyMiddle) {
      try { seriesRef.current.bodyMiddle.setData([]); } catch {}
      seriesRef.current.bodyMiddle = null;
    }

    ["upTrend", "downTrend"].forEach((key) => {
      seriesRef.current[key]?.forEach((s) => {
        try { chart.removeSeries(s); } catch {}
      });
      seriesRef.current[key] = [];
    });

    // BODY MIDDLE
    if (result.data.bodyMiddle?.length) {
      const style = SUPERTREND.bodyMiddle;

      const series = addSeries("SUPERTREND_BODY_MIDDLE", LineSeries, {
        color: style?.color,
        lineWidth: style?.width,
        lineStyle: style?.lineStyle ?? 0,
        visible: style?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      series.setData(result.data.bodyMiddle);
      seriesRef.current.bodyMiddle = series;
    }

    // SEGMENTS
    const createSegments = (dataArray) => {
      const segments = [];
      let segment = [];

      dataArray.forEach((p) => {
        if (!p || p.value == null) {
          if (segment.length) {
            segments.push(segment);
            segment = [];
          }
        } else segment.push(p);
      });

      if (segment.length) segments.push(segment);
      return segments;
    };

    ["upTrend", "downTrend"].forEach((key) => {
      const dataArray = result.data[key] || [];
      const style = SUPERTREND[key];

      const segments = createSegments(dataArray);

      segments.forEach((segment, i) => {
        const isLast = i === segments.length - 1;

        const series = addSeries(`SUPERTREND_${key}_${i}`, LineSeries, {
          color: style?.color,
          lineWidth: style?.width,
          lineStyle: style?.lineStyle ?? 0,
          visible: style?.visible ?? true,
          priceLineVisible: false,
          lastValueVisible: isLast,
        });

        series.setData(segment);
        seriesRef.current[key].push(series);
      });
    });

    indicatorSeriesRef.current.SUPERTREND = seriesRef.current;
  }, [result]); // ❗ unchanged

  /* ================= CANVAS INIT ================= */
  useEffect(() => {
    if (!containerRef || canvasRef.current) return;

    const canvas = document.createElement("canvas");

    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 1;

    containerRef.appendChild(canvas);
    canvasRef.current = canvas;
  }, [containerRef]);

  /* ================= DRAW FILL ================= */
  const drawFill = useCallback(() => {
    if (!canvasRef.current || !chart || !result?.data) return;

    const ctx = canvasRef.current.getContext("2d");
    const rect = containerRef.getBoundingClientRect();

    canvasRef.current.width = rect.width;
    canvasRef.current.height = rect.height;

    ctx.clearRect(0, 0, rect.width, rect.height);

    const { upTrend = [], downTrend = [], bodyMiddle = [] } = result.data;
    if (!bodyMiddle.length) return;

    const timeScale = chart.timeScale();
    const bodySeries = seriesRef.current.bodyMiddle;
    if (!bodySeries) return;

    // ✅ ALWAYS LATEST STYLE
    const style = styleRef.current?.SUPERTREND || {};

    const getCoord = (p) => {
      if (!p || p.value == null) return null;

      const x = timeScale.timeToCoordinate(p.time);
      const y = bodySeries.priceToCoordinate(p.value);

      if (x == null || y == null) return null;
      return { x, y };
    };

    const createSegments = (dataArray) => {
      const segments = [];
      let segment = [];

      dataArray.forEach((p) => {
        if (!p || p.value == null) {
          if (segment.length) {
            segments.push(segment);
            segment = [];
          }
        } else segment.push(p);
      });

      if (segment.length) segments.push(segment);
      return segments;
    };

    const drawSegment = (segment, c1, c2) => {
      const top = segment.map(getCoord).filter(Boolean);

      const bottom = segment
        .map((p) => bodyMiddle.find((b) => b.time === p.time))
        .map(getCoord)
        .filter(Boolean);

      if (!top.length || !bottom.length) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, c1);
      gradient.addColorStop(1, c2 || c1);

      ctx.beginPath();

      top.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });

      for (let i = bottom.length - 1; i >= 0; i--) {
        ctx.lineTo(bottom[i].x, bottom[i].y);
      }

      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    if (style.upTrendBg?.visible) {
      createSegments(upTrend).forEach((seg) =>
        drawSegment(
          seg,
          style.upTrendBg.topFillColor1,
          style.upTrendBg.topFillColor2
        )
      );
    }

    if (style.downTrendBg?.visible) {
      createSegments(downTrend).forEach((seg) =>
        drawSegment(
          seg,
          style.downTrendBg.topFillColor1,
          style.downTrendBg.topFillColor2
        )
      );
    }
  }, [result, chart, containerRef, indicatorStyle]); // ❗ removed indicatorStyle

  /* ================= STYLE UPDATE ================= */
  useEffect(() => {
    const { SUPERTREND } = indicatorStyle;

    if (seriesRef.current.bodyMiddle) {
      seriesRef.current.bodyMiddle.applyOptions({
        color: SUPERTREND.bodyMiddle?.color,
        lineWidth: SUPERTREND.bodyMiddle?.width,
        lineStyle: SUPERTREND.bodyMiddle?.lineStyle ?? 0,
        visible: SUPERTREND.bodyMiddle?.visible,
      });
    }

    ["upTrend", "downTrend"].forEach((key) => {
      seriesRef.current[key]?.forEach((s) => {
        s.applyOptions({
          color: SUPERTREND[key]?.color,
          lineWidth: SUPERTREND[key]?.width,
          lineStyle: SUPERTREND[key]?.lineStyle ?? 0,
          visible: SUPERTREND[key]?.visible,
        });
      });
    });

    drawFill(); // ✅ instant update
  }, [indicatorStyle]);

  /* ================= REDRAW ================= */
  useEffect(() => {
    if (!chart) return;

    drawFill();

    const redraw = () => drawFill();

    const unsub1 = chart.timeScale().subscribeVisibleLogicalRangeChange?.(redraw);
    const unsub2 = chart.subscribeCrosshairMove?.(redraw);

    return () => {
      if (unsub1) unsub1();
      if (unsub2) unsub2();
    };
  }, [chart, drawFill, indicatorStyle, result]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }

      if (indicatorSeriesRef.current) {
        indicatorSeriesRef.current.SUPERTREND = null;
      }
    };
  }, []);

  return null;
}