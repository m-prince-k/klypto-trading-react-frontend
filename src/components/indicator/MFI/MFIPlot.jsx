import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function MFIPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {
  /* ================= CREATE SERIES ================= */
  useEffect(() => {
    const raw = result?.data?.mfi;

    if (!Array.isArray(raw) || !raw.length) {
      console.log(":x: MFI data missing", result);
      return;
    }

    // REMOVE OLD SERIES
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        try {
          s.setData([]);
            try { chart.removeSeries(s); } catch {}
        } catch {}
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const mfiData = raw.map((d) => ({
      time: Number(d.time),
      value: Number(d.value ?? d.mfi),
    }));

    const style = indicatorStyle?.[indicator];

    /* ================= MFI LINE ================= */
    const mfiSeries = addSeries(indicator, LineSeries, {
      color: style?.mfiLine?.color,
      lineWidth: style?.mfiLine?.width,
      lineStyle: style?.mfiLine?.lineStyle ?? 0,
      visible: style?.mfiLine?.visible,
      priceLineVisible: false,
    });

    /* ================= LEVEL LINES ================= */
    const makeLevel = (value) => mfiData.map((p) => ({ time: p.time, value }));

    const upperVal = style?.upperBand?.value ?? 80;
    const middleVal = style?.middleBand?.value ?? 50;
    const lowerVal = style?.lowerBand?.value ?? 20;

    const upperSeries = addSeries(indicator, LineSeries, {
      color: style?.upperBand?.color,
      lineWidth: style?.upperBand?.width,
      lineStyle: style?.upperBand?.lineStyle ?? 2,
      visible: style?.upperBand?.visible,
    });

    const middleSeries = addSeries(indicator, LineSeries, {
      color: style?.middleBand?.color,
      lineWidth: style?.middleBand?.width,
      lineStyle: style?.middleBand?.lineStyle ?? 2,
      visible: style?.middleBand?.visible,
    });

    const lowerSeries = addSeries(indicator, LineSeries, {
      color: style?.lowerBand?.color,
      lineWidth: style?.lowerBand?.width,
      lineStyle: style?.lowerBand?.lineStyle ?? 2,
      visible: style?.lowerBand?.visible,
    });

    upperSeries.setData(makeLevel(upperVal));
    middleSeries.setData(makeLevel(middleVal));
    lowerSeries.setData(makeLevel(lowerVal));

    /* ================= BACKGROUND FILL ================= */
    const bgSeries = addSeries(indicator, BaselineSeries, {
      baseValue: { type: "price", price: lowerVal }, // fill starts from lowerBand
      topFillColor1: style?.bgFill?.topFillColor1,
      topFillColor2: style?.bgFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: style?.bgFill?.visible,
      priceLineVisible: false,
    });

    const bgData = mfiData.map((p) => ({ time: p.time, value: upperVal }));
    bgSeries.setData(bgData);

    /* ================= SET DATA ================= */
    mfiSeries.setData(mfiData);

    indicatorSeriesRef.current[indicator] = {
      mfiLine: mfiSeries,
      upperBand: upperSeries,
      middleBand: middleSeries,
      lowerBand: lowerSeries,
      bgFill: bgSeries,
      mfiData,
    };

    console.log(":white_check_mark: MFI plotted");
  }, [result]);

  /* ================= STYLE / BAND UPDATE ================= */
  useEffect(() => {
    const g = indicatorSeriesRef.current?.[indicator];
    if (!g) return;

    const style = indicatorStyle?.[indicator];
    if (!style) return;

    const makeLevel = (value) => g.mfiData.map((p) => ({ time: p.time, value }));

    const upperVal = style?.upperBand?.value ?? 80;
    const middleVal = style?.middleBand?.value ?? 50;
    const lowerVal = style?.lowerBand?.value ?? 20;

    // MFI LINE
    g.mfiLine?.applyOptions({
      color: style?.mfiLine?.color,
      lineWidth: style?.mfiLine?.width,
      lineStyle: style?.mfiLine?.lineStyle ?? 0,
      visible: style?.mfiLine?.visible,
    });

    // LEVEL LINES
    g.upperBand?.applyOptions({
      color: style?.upperBand?.color,
      lineWidth: style?.upperBand?.width,
      lineStyle: style?.upperBand?.lineStyle ?? 2,
      visible: style?.upperBand?.visible,
    });
    g.upperBand?.setData(makeLevel(upperVal));

    g.middleBand?.applyOptions({
      color: style?.middleBand?.color,
      lineWidth: style?.middleBand?.width,
      lineStyle: style?.middleBand?.lineStyle ?? 2,
      visible: style?.middleBand?.visible,
    });
    g.middleBand?.setData(makeLevel(middleVal));

    g.lowerBand?.applyOptions({
      color: style?.lowerBand?.color,
      lineWidth: style?.lowerBand?.width,
      lineStyle: style?.lowerBand?.lineStyle ?? 2,
      visible: style?.lowerBand?.visible,
    });
    g.lowerBand?.setData(makeLevel(lowerVal));

    // BACKGROUND FILL BETWEEN LOWER & UPPER
    g.bgFill?.applyOptions({
      visible: style?.bgFill?.visible,
      topFillColor1: style?.bgFill?.topFillColor1,
      topFillColor2: style?.bgFill?.topFillColor2,
      baseValue: { type: "price", price: lowerVal }, // always start at lowerBand
    });
    const bgData = g.mfiData.map((p) => ({ time: p.time, value: upperVal }));
    g.bgFill?.setData(bgData);
  }, [indicatorStyle?.[indicator]]);

  return null;
}