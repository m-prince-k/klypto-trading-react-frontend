import { useEffect, useRef } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function STOCHPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {
  const seriesRef = useRef(null);

  /* ================= CREATE ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
            try { chart.removeSeries(s); } catch {}
          } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const grouped = {};
    let kData = [];

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([key, data]) => {
      const style = indicatorStyle?.[indicator]?.[key];

      const series = addSeries(indicator, LineSeries, {
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

    const upper = indicatorStyle?.[indicator]?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.[indicator]?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.[indicator]?.lowerBand?.value ?? 20;

    const upperLine = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.upperBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.upperBand?.width,
      lineStyle: indicatorStyle?.[indicator]?.upperBand?.lineStyle,
      visible: indicatorStyle?.[indicator]?.upperBand?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleLine = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.middleBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.middleBand?.width,
      lineStyle: indicatorStyle?.[indicator]?.middleBand?.lineStyle,
      visible: indicatorStyle?.[indicator]?.middleBand?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerLine = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.lowerBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.lowerBand?.width,
      lineStyle: indicatorStyle?.[indicator]?.lowerBand?.lineStyle,
      visible: indicatorStyle?.[indicator]?.lowerBand?.visible,
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

    const bgFill = indicatorStyle?.[indicator]?.bgFill;

    const bgSeries = addSeries(indicator, BaselineSeries, {
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

    indicatorSeriesRef.current[indicator] = grouped;
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.[indicator];
    if (!g) return;

    const kData = g.kData ?? [];

    const makeLevel = (v) => kData.map((p) => ({ time: p.time, value: v }));

    const upper = indicatorStyle?.[indicator]?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.[indicator]?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.[indicator]?.lowerBand?.value ?? 20;

    g.upper?.setData(makeLevel(upper));
    g.middle?.setData(makeLevel(middle));
    g.lower?.setData(makeLevel(lower));

    /* ==== LINES ==== */

    ["k", "d"].forEach((key) => {
      const s = g[key];
      const st = indicatorStyle?.[indicator]?.[key];
      if (!s) return;

      s.applyOptions({
        color: st?.color,
        lineWidth: st?.width,
        lineStyle: st?.lineStyle,
        visible: st?.visible,
      });
    });

    /* ==== LEVEL STYLE ==== */

    g.upper?.applyOptions(indicatorStyle?.[indicator]?.upperBand);
    g.middle?.applyOptions(indicatorStyle?.[indicator]?.middleBand);
    g.lower?.applyOptions(indicatorStyle?.[indicator]?.lowerBand);

    /* ==== BG ==== */

    /* ==== BG ==== */

    const bgFill = indicatorStyle?.[indicator]?.bgFill;

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
