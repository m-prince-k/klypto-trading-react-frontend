import { useEffect, useRef } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function STOCHPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
}) {
  const seriesRef = useRef(null);

  /* ================= CREATE ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.STOCH) {
      Object.values(indicatorSeriesRef.current.STOCH).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });
      indicatorSeriesRef.current.STOCH = null;
    }

    const grouped = {};
    let kData = [];

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([key, data]) => {
      const style = indicatorStyle?.STOCH?.[key];

      const series = addSeries("STOCH", LineSeries, {
        color: style?.color,
        lineWidth: style?.width ?? 1,
        lineStyle: style?.lineStyle ?? 0,
        visible: style?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      series.setData(data);

      grouped[key] = series;

      if (key === "k") kData = data;
    });

    /* ================= LEVELS ================= */

    const makeLevel = (value) => kData.map((p) => ({ time: p.time, value }));

    const upper = indicatorStyle?.STOCH?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.STOCH?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.STOCH?.lowerBand?.value ?? 20;

    const upperLine = addSeries("STOCH", LineSeries, {
      color: indicatorStyle?.STOCH?.upperBand?.color,
      lineWidth: indicatorStyle?.STOCH?.upperBand?.width,
      lineStyle: indicatorStyle?.STOCH?.upperBand?.lineStyle,
      visible: indicatorStyle?.STOCH?.upperBand?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleLine = addSeries("STOCH", LineSeries, {
      color: indicatorStyle?.STOCH?.middleBand?.color,
      lineWidth: indicatorStyle?.STOCH?.middleBand?.width,
      lineStyle: indicatorStyle?.STOCH?.middleBand?.lineStyle,
      visible: indicatorStyle?.STOCH?.middleBand?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerLine = addSeries("STOCH", LineSeries, {
      color: indicatorStyle?.STOCH?.lowerBand?.color,
      lineWidth: indicatorStyle?.STOCH?.lowerBand?.width,
      lineStyle: indicatorStyle?.STOCH?.lowerBand?.lineStyle,
      visible: indicatorStyle?.STOCH?.lowerBand?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperLine.setData(makeLevel(upper));
    middleLine.setData(makeLevel(middle));
    lowerLine.setData(makeLevel(lower));

    grouped.upper = upperLine;
    grouped.middle = middleLine;
    grouped.lower = lowerLine;

    /* ================= BACKGROUND ================= */

    const bgFill = indicatorStyle?.STOCH?.bgFill;

    const bgSeries = addSeries("STOCH", BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bgFill?.visible ?? true,
    });

    bgSeries.setData(makeLevel(upper));

    grouped.bg = bgSeries;
    grouped.kData = kData;

    indicatorSeriesRef.current.STOCH = grouped;
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.STOCH;
    if (!g) return;

    const kData = g.kData ?? [];

    const makeLevel = (v) => kData.map((p) => ({ time: p.time, value: v }));

    const upper = indicatorStyle?.STOCH?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.STOCH?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.STOCH?.lowerBand?.value ?? 20;

    g.upper?.setData(makeLevel(upper));
    g.middle?.setData(makeLevel(middle));
    g.lower?.setData(makeLevel(lower));

    /* ==== LINES ==== */

    ["k", "d"].forEach((key) => {
      const s = g[key];
      const st = indicatorStyle?.STOCH?.[key];
      if (!s) return;

      s.applyOptions({
        color: st?.color,
        lineWidth: st?.width,
        lineStyle: st?.lineStyle,
        visible: st?.visible,
      });
    });

    /* ==== LEVEL STYLE ==== */

    g.upper?.applyOptions(indicatorStyle?.STOCH?.upperBand);
    g.middle?.applyOptions(indicatorStyle?.STOCH?.middleBand);
    g.lower?.applyOptions(indicatorStyle?.STOCH?.lowerBand);

    /* ==== BG ==== */

    /* ==== BG ==== */

    const bgFill = indicatorStyle?.STOCH?.bgFill;

    // 🔥 IMPORTANT: update baseValue (lower band)
    g.bg?.applyOptions({
      baseValue: { type: "price", price: lower }, 
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
      visible: bgFill?.visible,
    });

    // 🔥 IMPORTANT: update upper band area
    g.bg?.setData(makeLevel(upper)); 
  }, [indicatorStyle]);

  return null;
}
