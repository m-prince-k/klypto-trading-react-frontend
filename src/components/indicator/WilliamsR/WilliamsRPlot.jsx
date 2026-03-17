import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function WilliamsRPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  /* ================= CREATE SERIES ================= */

  useEffect(() => {
    if (!result?.data?.r) return;

    if (indicatorSeriesRef.current?.WilliamsR) {
      Object.values(indicatorSeriesRef.current.WilliamsR).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.WilliamsR = null;
    }

    const groupedSeries = {};
    const rData = result.data.r;

    const style = indicatorStyle?.WilliamsR || {};

    const upper = style?.upperBand?.value ?? -20;
    const middle = style?.middleBand?.value ?? -50;
    const lower = style?.lowerBand?.value ?? -80;

    if (!rData.length) return;

    /* ================= MAIN %R LINE ================= */

    const rSeries = addSeries("WilliamsR", LineSeries, {
      color: style?.r?.color || "rgba(38,166,154,1)",
      lineWidth: style?.r?.width || 2,
      lineStyle: style?.r?.lineStyle ?? 0,
      visible: style?.r?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    rSeries.setData(rData);

    groupedSeries.r = rSeries;

    /* ================= BANDS ================= */

    const makeLevel = (v) => rData.map((p) => ({ time: p.time, value: v }));

    const upperBand = addSeries("WilliamsR", LineSeries, {
      color: style?.upperBand?.color,
      lineWidth: style?.upperBand?.width,
      lineStyle: style?.upperBand?.lineStyle ?? 2,
      visible: style?.upperBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperBand.setData(makeLevel(upper));

    const middleBand = addSeries("WilliamsR", LineSeries, {
      color: style?.middleBand?.color,
      lineWidth: style?.middleBand?.width,
      lineStyle: style?.middleBand?.lineStyle ?? 2,
      visible: style?.middleBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    middleBand.setData(makeLevel(middle));

    const lowerBand = addSeries("WilliamsR", LineSeries, {
      color: style?.lowerBand?.color,
      lineWidth: style?.lowerBand?.width,
      lineStyle: style?.lowerBand?.lineStyle ?? 2,
      visible: style?.lowerBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    lowerBand.setData(makeLevel(lower));

    groupedSeries.upperBand = upperBand;
    groupedSeries.middleBand = middleBand;
    groupedSeries.lowerBand = lowerBand;

    /* ================= BACKGROUND FILL ================= */

    const bandData = rData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bgSeries = addSeries("WilliamsR", BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: style?.bg?.color0,
      topFillColor2: style?.bg?.color1,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: style?.bg?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bgSeries.setData(bandData);

    groupedSeries.bg = bgSeries;
    groupedSeries.rData = rData;

    indicatorSeriesRef.current.WilliamsR = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const group = indicatorSeriesRef.current?.WilliamsR;
    if (!group) return;

    const style = indicatorStyle?.WilliamsR || {};
    const data = group.rData ?? [];

    if (!data.length) return;

    const upper = style?.upperBand?.value ?? -20;
    const middle = style?.middleBand?.value ?? -50;
    const lower = style?.lowerBand?.value ?? -80;

    const makeLevel = (v) => data.map((p) => ({ time: p.time, value: v }));

    /* ================= %R STYLE ================= */

    group.r?.applyOptions({
      color: style?.r?.color,
      lineWidth: style?.r?.width,
      lineStyle: style?.r?.lineStyle,
      visible: style?.r?.visible,
    });

    /* ================= BAND STYLE UPDATE ================= */

    ["upperBand", "middleBand", "lowerBand"].forEach((key) => {
      if (!group[key]) return;

      group[key].applyOptions({
        color: style?.[key]?.color,
        lineWidth: style?.[key]?.width,
        lineStyle: style?.[key]?.lineStyle,
        visible: style?.[key]?.visible,
      });

      group[key].setData(makeLevel(style?.[key]?.value));
    });

    /* ================= BG FILL UPDATE ================= */

    if (group.bg) {
      const upper = style?.upperBand?.value ?? -20;
      const lower = style?.lowerBand?.value ?? -80;

      const bandData = data.map((p) => ({
        time: p.time,
        value: upper,
      }));

      group.bg.applyOptions({
        baseValue: { type: "price", price: lower },

        visible: style?.bg?.visible ?? true,

        topFillColor1: style?.bg?.color0,
        topFillColor2: style?.bg?.color1,

        bottomFillColor1: "rgba(0,0,0,0)",
        bottomFillColor2: "rgba(0,0,0,0)",

        topLineColor: "transparent",
        bottomLineColor: "transparent",
      });

      group.bg.setData(bandData);
    }
  }, [indicatorStyle]);

  return null;
}
