import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function CHOPPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {
  /* ================= CREATE / RESET SERIES ================= */
  useEffect(() => {
    if (!result) return;

    // Clear previous series
    if (indicatorSeriesRef.current?.CHOP) {
      Object.values(indicatorSeriesRef.current.CHOP).forEach((s) => {
        if (s?.setData) s.setData([]);
      });
      indicatorSeriesRef.current.CHOP = null;
    }

    const groupedSeries = {};
    const chopData = result.data?.chopLine ?? [];
    const makeLevel = (v) => chopData.map((p) => ({ time: p.time, value: v }));

    // CHOP main line
    const chopSeries = addSeries("CHOP", LineSeries, {
      color: indicatorStyle?.CHOP?.chopLine?.color,
      lineWidth: indicatorStyle?.CHOP?.chopLine?.width ?? 2,
      lineStyle: indicatorStyle?.CHOP?.chopLine?.lineStyle ?? 0,
      visible: indicatorStyle?.CHOP?.chopLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    chopSeries.setData(chopData);
    groupedSeries.chopLine = chopSeries;

    // Bands
    ["upper", "middle", "lower"].forEach((key) => {
      const value =
        indicatorConfigs?.CHOP?.[key] ?? (key === "upper" ? 61.8 : key === "middle" ? 50 : 38.2);
      const s = addSeries("CHOP", LineSeries, {
        color: indicatorStyle?.CHOP?.[key]?.color,
        lineWidth: indicatorStyle?.CHOP?.[key]?.width ?? 1,
        lineStyle: indicatorStyle?.CHOP?.[key]?.lineStyle ?? 0,
        visible: indicatorStyle?.CHOP?.[key]?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      s.setData(makeLevel(value));
      groupedSeries[key] = s;
    });

    // Background fill
    const bandBackground = addSeries("CHOP", BaselineSeries, {
      baseValue: { type: "price", price: indicatorConfigs?.CHOP?.lower ?? 38.2 },
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      topFillColor1: indicatorStyle?.CHOP?.bgFill?.topFillColor1,
      topFillColor2: indicatorStyle?.CHOP?.bgFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      visible: indicatorStyle?.CHOP?.bgFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    bandBackground.setData(makeLevel(indicatorConfigs?.CHOP?.upper ?? 61.8));
    groupedSeries.bandBackground = bandBackground;

    groupedSeries.chopData = chopData;
    indicatorSeriesRef.current.CHOP = groupedSeries;
  }, [result]);

  /* ================= STYLE & BAND UPDATE ================= */
  useEffect(() => {
    const chopGroup = indicatorSeriesRef.current?.CHOP;
    if (!chopGroup) return;

    const chopData = chopGroup.chopData ?? [];
    if (!chopData.length) return;
    const makeLevel = (v) => chopData.map((p) => ({ time: p.time, value: v }));

    const upper = indicatorConfigs?.CHOP?.upper ?? 61.8;
    const middle = indicatorConfigs?.CHOP?.middle ?? 50;
    const lower = indicatorConfigs?.CHOP?.lower ?? 38.2;
    const bgFill = indicatorStyle?.CHOP?.bgFill;

    // Update main CHOP line
    chopGroup.chopLine?.applyOptions({
      color: indicatorStyle?.CHOP?.chopLine?.color,
      lineWidth: indicatorStyle?.CHOP?.chopLine?.width,
      lineStyle: indicatorStyle?.CHOP?.chopLine?.lineStyle ?? 0,
      visible: indicatorStyle?.CHOP?.chopLine?.visible,
      lastValueVisible: indicatorStyle?.CHOP?.chopLine?.visible,
    });

    // Update bands
    ["upper", "middle", "lower"].forEach((key) => {
      const value = key === "upper" ? upper : key === "middle" ? middle : lower;
      const s = chopGroup[key];
      const style = indicatorStyle?.CHOP?.[key];
      if (!s) return;
      s.setData(makeLevel(value));
      s.applyOptions({
        color: style?.color,
        lineWidth: style?.width,
        lineStyle: style?.lineStyle ?? 0,
        visible: style?.visible,
        lastValueVisible: false,
      });
    });

    // Update background fill properly
    chopGroup.bandBackground?.applyOptions({
      baseValue: { price: lower },
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
      visible: bgFill?.visible,
    });
    chopGroup.bandBackground?.setData(makeLevel(upper));
  }, [indicatorStyle, indicatorConfigs]);

  return null;
}