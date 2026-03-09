import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function RSIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= INITIAL PLOT ================= */

  useEffect(() => {

    if (!result) return;

    const groupedSeries = {};

    const upper = indicatorStyle?.RSI?.upper?.value ?? 70;
    const lower = indicatorStyle?.RSI?.lower?.value ?? 30;

    const obFill = indicatorStyle?.RSI?.obFill;
    const osFill = indicatorStyle?.RSI?.osFill;

    let rsiData = [];

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.RSI?.[lineName];

      const series = addSeries("RSI", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#26a69a",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "rsi") rsiData = lineData;

    });

    const bandData = [];

rsiData.forEach((p) => {
  bandData.push({
    time: p.time,
    value: upper,
  });
});

bandBackgroundSeries.setData(bandData);

    const bandFill = indicatorStyle?.RSI?.bandFill;

const bandBackgroundSeries = addSeries("RSI", BaselineSeries, {
  baseValue: { type: "price", price: lower },

  topFillColor1: bandFill?.topFillColor1,
  topFillColor2: bandFill?.topFillColor2,

  bottomFillColor1: "rgba(0,0,0,0)",
  bottomFillColor2: "rgba(0,0,0,0)",

  topLineColor: "transparent",
  bottomLineColor: "transparent",

  visible: bandFill?.visible ?? true,
});

    /* ================= OVERBOUGHT GRADIENT ================= */

    const overboughtSeries = addSeries("RSI", BaselineSeries, {

      baseValue: { type: "price", price: upper },

      topFillColor1: obFill?.topFillColor1,
      topFillColor2: obFill?.topFillColor2,

      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",

      topLineColor: "transparent",
      bottomLineColor: "transparent",

      visible: obFill?.visible ?? true,
    });

    /* ================= OVERSOLD GRADIENT ================= */

    const oversoldSeries = addSeries("RSI", BaselineSeries, {

      baseValue: { type: "price", price: lower },

      bottomFillColor1: osFill?.bottomFillColor1,
      bottomFillColor2: osFill?.bottomFillColor2,

      topFillColor1: "rgba(0,0,0,0)",
      topFillColor2: "rgba(0,0,0,0)",

      topLineColor: "transparent",
      bottomLineColor: "transparent",

      visible: osFill?.visible ?? true,
    });

    /* ================= GRADIENT DATA ================= */

    const overboughtData = [];
    const oversoldData = [];

    rsiData.forEach((p) => {

  overboughtData.push({
    time: p.time,
    value: p.value > upper ? p.value : upper,
  });

  oversoldData.push({
    time: p.time,
    value: p.value < lower ? p.value : lower,
  });

});

    overboughtSeries.setData(overboughtData);
    oversoldSeries.setData(oversoldData);

    groupedSeries.bandBackground = bandBackgroundSeries;
    groupedSeries.overboughtFill = overboughtSeries;
    groupedSeries.oversoldFill = oversoldSeries;
    groupedSeries._rsiData = rsiData;

    indicatorSeriesRef.current.RSI = groupedSeries;

  }, [result]);



  /* ================= STYLE + BAND UPDATE ================= */

  useEffect(() => {

    const rsiGroup = indicatorSeriesRef.current?.RSI;
    if (!rsiGroup) return;

    const rsiSeries = rsiGroup.rsi;
    const smoothingSeries = rsiGroup.smoothingMA;

    if (!rsiSeries) return;

    const rsiStyle = indicatorStyle?.RSI?.rsi;
    const smoothingStyle = indicatorStyle?.RSI?.smoothingMA;

    const upper = indicatorStyle?.RSI?.upper;
    const middle = indicatorStyle?.RSI?.middle;
    const lower = indicatorStyle?.RSI?.lower;
    const bandFill = indicatorStyle?.RSI?.bandFill;


    const obFill = indicatorStyle?.RSI?.obFill;
    const osFill = indicatorStyle?.RSI?.osFill;

    /* ================= UPDATE RSI ================= */

    rsiSeries.applyOptions({
      color: rsiStyle?.color,
      lineWidth: rsiStyle?.width,
      visible: rsiStyle?.visible,
    });

    /* ================= UPDATE SMOOTHING ================= */

    if (smoothingSeries) {
      smoothingSeries.applyOptions({
        color: smoothingStyle?.color,
        lineWidth: smoothingStyle?.width,
        visible: smoothingStyle?.visible,
      });
    }

    /* ================= CREATE BANDS IF NOT EXIST ================= */

    if (!rsiGroup._priceLines) {

      rsiGroup._priceLines = {
        upper: rsiSeries.createPriceLine({
          price: upper?.value ?? 70,
          color: upper?.color || "#9e9e9e",
          lineWidth: upper?.width ?? 1,
          lineStyle: 2,
          axisLabelVisible: false,
        }),

        middle: rsiSeries.createPriceLine({
          price: middle?.value ?? 50,
          color: middle?.color || "#9e9e9e",
          lineWidth: middle?.width ?? 1,
          lineStyle: 2,
          axisLabelVisible: false,
        }),

        lower: rsiSeries.createPriceLine({
          price: lower?.value ?? 30,
          color: lower?.color || "#9e9e9e",
          lineWidth: lower?.width ?? 1,
          lineStyle: 2,
          axisLabelVisible: false,
        }),
      };

    }

    /* ================= UPDATE BANDS ================= */

    const lines = rsiGroup._priceLines;

    lines.upper.applyOptions({
  price: upper?.value,
  color: upper?.color,
  lineWidth: upper?.width,
  visible: upper?.visible,
});

    lines.middle.applyOptions({
      price: middle?.value,
      color: middle?.color,
      lineWidth: middle?.width,
  visible: middle?.visible,

    });

    lines.lower.applyOptions({
      price: lower?.value,
      color: lower?.color,
      lineWidth: lower?.width,
  visible: lower?.visible,

    });

    /* ================= UPDATE GRADIENT COLORS ================= */
    rsiGroup.bandBackground?.applyOptions({
  topFillColor1: bandFill?.topFillColor1,
  topFillColor2: bandFill?.topFillColor2,
  visible: bandFill?.visible,
});

    rsiGroup.overboughtFill?.applyOptions({
      baseValue: { type: "price", price: upper?.value },
      topFillColor1: obFill?.topFillColor1,
      topFillColor2: obFill?.topFillColor2,
      visible: obFill?.visible,
    });

    rsiGroup.oversoldFill?.applyOptions({
      baseValue: { type: "price", price: lower?.value },
      bottomFillColor1: osFill?.bottomFillColor1,
      bottomFillColor2: osFill?.bottomFillColor2,
      visible: osFill?.visible,
    });

  }, [indicatorStyle]);

  return null;
}