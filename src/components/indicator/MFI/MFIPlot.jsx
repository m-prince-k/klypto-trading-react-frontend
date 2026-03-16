import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function MFIPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.MFI) {
      Object.values(indicatorSeriesRef.current.MFI).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.MFI = null;
    }

    const groupedSeries = {};
    let mfiData = [];

    const style = indicatorStyle?.MFI ?? {};

    const upper = style?.upperBand?.value ?? 80;
    const middle = style?.middleBand?.value ?? 50;
    const lower = style?.lowerBand?.value ?? 20;

    const bgFill = style?.bgFill ?? {};

    /* ================= MAIN LINE ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const styleConfig = style?.[lineName] ?? {};

      const series = addSeries("MFI", LineSeries, {
        color: styleConfig?.color,
        lineWidth: styleConfig?.width ?? 2,
        lineStyle: styleConfig?.lineStyle ?? 0,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "mfiLine") mfiData = lineData;

    });

    const makeLevelData = (value) =>
      mfiData.map((p) => ({ time: p.time, value }));


    /* ================= LEVEL BANDS ================= */

    const upperBand = addSeries("MFI", LineSeries, {
      color: style?.upperBand?.color,
      lineWidth: style?.upperBand?.width ?? 1,
      lineStyle: style?.upperBand?.lineStyle ?? 2,
      visible: style?.upperBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleBand = addSeries("MFI", LineSeries, {
      color: style?.middleBand?.color,
      lineWidth: style?.middleBand?.width ?? 1,
      lineStyle: style?.middleBand?.lineStyle ?? 2,
      visible: style?.middleBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerBand = addSeries("MFI", LineSeries, {
      color: style?.lowerBand?.color,
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
      topFillColor1: bgFill?.topFillColor1 ?? "rgba(41,98,255,0.25)",
      topFillColor2: bgFill?.topFillColor2 ?? "rgba(41,98,255,0.05)",
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bgFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bgSeries.setData(bandData);

    groupedSeries.bgFill = bgSeries;
    groupedSeries.mfiData = mfiData;

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

    const makeLevel = (v) =>
      data.map((p) => ({ time: p.time, value: v }));


    mfiGroup.upperBand?.setData(makeLevel(upper));
    mfiGroup.middleBand?.setData(makeLevel(middle));
    mfiGroup.lowerBand?.setData(makeLevel(lower));


    if (mfiGroup.mfiLine) {
      mfiGroup.mfiLine.applyOptions({
        color: style?.mfiLine?.color,
        lineWidth: style?.mfiLine?.width,
        lineStyle: style?.mfiLine?.lineStyle,
        visible: style?.mfiLine?.visible,
      });
    }

    ["upperBand", "middleBand", "lowerBand"].forEach((key) => {

      if (mfiGroup[key]) {

        mfiGroup[key].applyOptions({
          color: style?.[key]?.color,
          lineWidth: style?.[key]?.width,
          lineStyle: style?.[key]?.lineStyle,
          visible: style?.[key]?.visible,
        });

      }

    });


    if (mfiGroup.bgFill) {

      const bandData = data.map((p) => ({
        time: p.time,
        value: upper,
      }));

      mfiGroup.bgFill.applyOptions({
        baseValue: { type: "price", price: lower },
        visible: style?.bgFill?.visible,
        topFillColor1: style?.bgFill?.topFillColor1,
        topFillColor2: style?.bgFill?.topFillColor2,
      });

      mfiGroup.bgFill.setData(bandData);

    }

  }, [
    indicatorStyle?.MFI?.upperBand?.value,
    indicatorStyle?.MFI?.middleBand?.value,
    indicatorStyle?.MFI?.lowerBand?.value,
    indicatorStyle?.MFI?.upperBand?.color,
    indicatorStyle?.MFI?.middleBand?.color,
    indicatorStyle?.MFI?.lowerBand?.color,
    indicatorStyle?.MFI?.bgFill?.visible,
    indicatorStyle?.MFI?.bgFill?.topFillColor1,
    indicatorStyle?.MFI?.bgFill?.topFillColor2,
  ]);

  return null;
}