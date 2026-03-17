import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function MFIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result) return;

    // remove old series
    if (indicatorSeriesRef.current?.MFI) {
      Object.values(indicatorSeriesRef.current.MFI).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.MFI = null;
    }

    const groupedSeries = {};
    const style = indicatorStyle?.MFI ?? {};

    const mfiData = result?.data?.mfi ?? [];

    const upper = style?.upperBand?.value ?? 80;
    const middle = style?.middleBand?.value ?? 50;
    const lower = style?.lowerBand?.value ?? 20;

    const bgFill = style?.bgFill ?? {};

    /* ================= MAIN MFI LINE ================= */

    const mfiSeries = addSeries("MFI", LineSeries, {
      color: style?.mfiLine?.color ?? "#2962FF",
      lineWidth: style?.mfiLine?.width ?? 2,
      lineStyle: style?.mfiLine?.lineStyle ?? 0,
      visible: style?.mfiLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    mfiSeries.setData(mfiData);

    groupedSeries.mfiLine = mfiSeries;
    groupedSeries.mfiData = mfiData;

    /* ================= LEVEL HELPER ================= */

    const makeLevelData = (value) =>
      mfiData.map((p) => ({
        time: p.time,
        value,
      }));

    /* ================= BANDS ================= */

    const upperBand = addSeries("MFI", LineSeries, {
      color: style?.upperBand?.color ?? "#ff0000",
      lineWidth: style?.upperBand?.width ?? 1,
      lineStyle: style?.upperBand?.lineStyle ?? 2,
      visible: style?.upperBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleBand = addSeries("MFI", LineSeries, {
      color: style?.middleBand?.color ?? "#888888",
      lineWidth: style?.middleBand?.width ?? 1,
      lineStyle: style?.middleBand?.lineStyle ?? 2,
      visible: style?.middleBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerBand = addSeries("MFI", LineSeries, {
      color: style?.lowerBand?.color ?? "#00ff00",
      lineWidth: style?.lowerBand?.width ?? 1,
      lineStyle: style?.lowerBand?.lineStyle ?? 2,
      visible: style?.lowerBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperBand.setData(makeLevelData(upper));
    middleBand.setData(makeLevelData(middle));
    lowerBand.setData(makeLevelData(lower));

    groupedSeries.upperBand = upperBand;
    groupedSeries.middleBand = middleBand;
    groupedSeries.lowerBand = lowerBand;

    /* ================= BACKGROUND FILL ================= */

    const bandData = mfiData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bgSeries = addSeries("MFI", BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: bgFill.topFillColor1 ?? "rgba(41,98,255,0.25)",
      topFillColor2: bgFill.topFillColor2 ?? "rgba(41,98,255,0.05)",
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bgFill.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bgSeries.setData(bandData);

    groupedSeries.bgFill = bgSeries;

    indicatorSeriesRef.current.MFI = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const mfiGroup = indicatorSeriesRef.current?.MFI;
    if (!mfiGroup) return;

    const style = indicatorStyle?.MFI ?? {};
    const data = mfiGroup.mfiData ?? [];

    const upper = style?.upperBand?.value ?? 80;
    const middle = style?.middleBand?.value ?? 50;
    const lower = style?.lowerBand?.value ?? 20;

    const makeLevel = (value) =>
      data.map((p) => ({
        time: p.time,
        value,
      }));

    /* ================= UPDATE BAND DATA ================= */

    mfiGroup.upperBand?.setData(makeLevel(upper));
    mfiGroup.middleBand?.setData(makeLevel(middle));
    mfiGroup.lowerBand?.setData(makeLevel(lower));

    /* ================= UPDATE BAND STYLE ================= */

    ["upperBand", "middleBand", "lowerBand"].forEach((key) => {

      const series = mfiGroup[key];
      if (!series) return;

      const s = style?.[key] ?? {};

      series.applyOptions({
        color: s.color ?? "#888",
        lineWidth: s.width ?? 1,
        lineStyle: s.lineStyle ?? 2,
        visible: s.visible ?? true,
      });

    });

    /* ================= UPDATE MFI LINE ================= */

    if (mfiGroup.mfiLine) {

      const s = style?.mfiLine ?? {};

      mfiGroup.mfiLine.applyOptions({
        color: s.color ?? "#2962FF",
        lineWidth: s.width ?? 2,
        lineStyle: s.lineStyle ?? 0,
        visible: s.visible ?? true,
      });

    }

    /* ================= UPDATE BACKGROUND ================= */

    if (mfiGroup.bgFill) {

      const s = style?.bgFill ?? {};

      const bandData = data.map((p) => ({
        time: p.time,
        value: upper,
      }));

      mfiGroup.bgFill.setData([]);

      mfiGroup.bgFill.applyOptions({
        baseValue: { type: "price", price: lower },
        visible: s.visible ?? true,
        topFillColor1: s.topFillColor1 ?? "rgba(41,98,255,0.25)",
        topFillColor2: s.topFillColor2 ?? "rgba(41,98,255,0.05)",
      });

      mfiGroup.bgFill.setData(bandData);

    }

  }, [indicatorStyle]);

  return null;
}