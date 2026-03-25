import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function MFIPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  /* ================= CREATE ================= */

  useEffect(() => {
    const raw = result?.data?.mfi;

    if (!Array.isArray(raw) || !raw.length) {
      console.log(":x: MFI data missing", result);
      return;
    } // :fire: REMOVE OLD

    if (indicatorSeriesRef.current?.MFI) {
      Object.values(indicatorSeriesRef.current.MFI).forEach((s) => {
        try {
          s.setData([]);
        } catch {}
      });
      indicatorSeriesRef.current.MFI = null;
    }

    const mfiData = raw.map((d) => ({
      time: Number(d.time),
      value: Number(d.value ?? d.mfi),
    }));

    const style =
      indicatorStyle?.MFI; /* ================= MFI LINE ================= */

    const mfiSeries = addSeries("MFI", LineSeries, {
      color: style?.mfiLine?.color,
      lineWidth: style?.mfiLine?.width,
      lineStyle: style?.mfiLine?.lineStyle ?? 0,
      visible: style?.mfiLine?.visible,
      priceLineVisible: false,
    }); /* ================= LEVEL LINES ================= */

    const makeLevel = (value) => mfiData.map((p) => ({ time: p.time, value }));

    const upperVal = style?.upperBand?.value ?? 80;
    const middleVal = style?.middleBand?.value ?? 50;
    const lowerVal = style?.lowerBand?.value ?? 20;

    const upperSeries = addSeries("MFI", LineSeries, {
      color: style?.upperBand?.color,
      lineWidth: style?.upperBand?.width,
      lineStyle: style?.upperBand?.lineStyle ?? 2,
      visible: style?.upperBand?.visible,
    });

    const middleSeries = addSeries("MFI", LineSeries, {
      color: style?.middleBand?.color,
      lineWidth: style?.middleBand?.width,
      lineStyle: style?.middleBand?.lineStyle ?? 2,
      visible: style?.middleBand?.visible,
    });

    const lowerSeries = addSeries("MFI", LineSeries, {
      color: style?.lowerBand?.color,
      lineWidth: style?.lowerBand?.width,
      lineStyle: style?.lowerBand?.lineStyle ?? 2,
      visible: style?.lowerBand?.visible,
    });

    upperSeries.setData(makeLevel(upperVal));
    middleSeries.setData(makeLevel(middleVal));
    lowerSeries.setData(
      makeLevel(lowerVal),
    ); /* ================= BACKGROUND ================= */

    const bgSeries = addSeries("MFI", BaselineSeries, {
      baseValue: { type: "price", price: lowerVal },

      topFillColor1: style?.bgFill?.topFillColor1,
      topFillColor2: style?.bgFill?.topFillColor2,

      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",

      topLineColor: "transparent",
      bottomLineColor: "transparent",

      visible: style?.bgFill?.visible,
      priceLineVisible: false,
    });

    const bgData = mfiData.map((p) => ({
      time: p.time,
      value: upperVal,
    }));

    bgSeries.setData(bgData); /* ================= SET DATA ================= */

    mfiSeries.setData(mfiData);

    indicatorSeriesRef.current.MFI = {
      mfiLine: mfiSeries,
      upperBand: upperSeries,
      middleBand: middleSeries,
      lowerBand: lowerSeries,
      bgFill: bgSeries,
      mfiData,
    };

    console.log(":white_check_mark: MFI plotted");
  }, [result]); /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.MFI;
    if (!g) return;

    const style = indicatorStyle?.MFI;
    if (!style) return;

    const makeLevel = (value) =>
      g.mfiData.map((p) => ({ time: p.time, value })); /* :fire: LINE */

    g.mfiLine?.applyOptions({
      color: style?.mfiLine?.color,
      lineWidth: style?.mfiLine?.width,
      lineStyle: style?.mfiLine?.lineStyle ?? 0,
      visible: style?.mfiLine?.visible,
    }); /* :fire: UPPER */

    g.upperBand?.applyOptions({
      color: style?.upperBand?.color,
      lineWidth: style?.upperBand?.width,
      lineStyle: style?.upperBand?.lineStyle ?? 2,
      visible: style?.upperBand?.visible,
    });
    g.upperBand?.setData(
      makeLevel(style?.upperBand?.value ?? 80),
    ); /* :fire: MIDDLE */

    g.middleBand?.applyOptions({
      color: style?.middleBand?.color,
      lineWidth: style?.middleBand?.width,
      lineStyle: style?.middleBand?.lineStyle ?? 2,
      visible: style?.middleBand?.visible,
    });
    g.middleBand?.setData(
      makeLevel(style?.middleBand?.value ?? 50),
    ); /* :fire: LOWER */

    g.lowerBand?.applyOptions({
      color: style?.lowerBand?.color,
      lineWidth: style?.lowerBand?.width,
      lineStyle: style?.lowerBand?.lineStyle ?? 2,
      visible: style?.lowerBand?.visible,
    });
    g.lowerBand?.setData(
      makeLevel(style?.lowerBand?.value ?? 20),
    ); /* :fire: BACKGROUND */

    g.bgFill?.applyOptions({
      visible: style?.bgFill?.visible,
      topFillColor1: style?.bgFill?.topFillColor1,
      topFillColor2: style?.bgFill?.topFillColor2,
    });
  }, [indicatorStyle?.MFI]);

  return null;
}
