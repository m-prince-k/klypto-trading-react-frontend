import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function RSIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  /* ================= CREATE RSI ================= */

  useEffect(() => {
    if (!result) return;

    /* REMOVE OLD RSI COMPLETELY */
    if (indicatorSeriesRef.current?.RSI) {
      Object.values(indicatorSeriesRef.current.RSI).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.RSI = null;
    }

    const groupedSeries = {};
    let rsiData = [];

    const upper = indicatorStyle?.RSI?.upper?.value ?? 70;
    const lower = indicatorStyle?.RSI?.lower?.value ?? 30;

    const bandFill = indicatorStyle?.RSI?.bandFill;
    const obFill = indicatorStyle?.RSI?.obFill;
    const osFill = indicatorStyle?.RSI?.osFill;

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {
      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.RSI?.[lineName];

      const series = addSeries("RSI", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "rgba(38,166,154,1)",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: lineName === "rsi" || lineName === "smoothingMA",
      });

      if (!series) return;

      series.setData(lineData);
      groupedSeries[lineName] = series;

      if (lineName === "rsi") rsiData = lineData;
    });

    /* ================= BAND BACKGROUND ================= */

    const bandData = rsiData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bandBackgroundSeries = addSeries("RSI", BaselineSeries, {
      baseValue: { type: "price", price: lower },

      topFillColor1: bandFill?.topFillColor1,
      topFillColor2: bandFill?.topFillColor2,

      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",

      topLineColor: "transparent",
      bottomLineColor: "transparent",

      visible: bandFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bandBackgroundSeries.setData(bandData);

    /* ================= OVERBOUGHT ================= */

    const overboughtSeries = addSeries("RSI", BaselineSeries, {
      baseValue: { type: "price", price: upper },

      topFillColor1: obFill?.topFillColor1,
      topFillColor2: obFill?.topFillColor2,

      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",

      topLineColor: "transparent",
      bottomLineColor: "transparent",

      visible: obFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    /* ================= OVERSOLD ================= */

    const oversoldSeries = addSeries("RSI", BaselineSeries, {
      baseValue: { type: "price", price: lower },

      bottomFillColor1: osFill?.bottomFillColor1,
      bottomFillColor2: osFill?.bottomFillColor2,

      topFillColor1: "rgba(0,0,0,0)",
      topFillColor2: "rgba(0,0,0,0)",

      topLineColor: "transparent",
      bottomLineColor: "transparent",

      visible: osFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
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

    indicatorSeriesRef.current.RSI = groupedSeries;
  }, [result]);

  /* ================= STYLE + VISIBILITY ================= */

  useEffect(() => {
    const rsiGroup = indicatorSeriesRef.current?.RSI;
    if (!rsiGroup) return;

    const rsiStyle = indicatorStyle?.RSI?.rsi;
    const smoothingStyle = indicatorStyle?.RSI?.smoothingMA;

    const bandFill = indicatorStyle?.RSI?.bandFill;
    const obFill = indicatorStyle?.RSI?.obFill;
    const osFill = indicatorStyle?.RSI?.osFill;

    /* ================= UPDATE RSI ================= */

    console.log(rsiStyle, "styleeeeeee");
    if (rsiGroup.rsi) {
      rsiGroup.rsi.applyOptions({
        color: rsiStyle?.color,
        lineWidth: rsiStyle?.width,
        lineStyle: rsiStyle?.lineStyle ?? 0,
        visible: rsiStyle?.visible,
        lastValueVisible: rsiStyle?.visible,
        opacity: rsiStyle?.opacity,
      });
    }

    /* ================= UPDATE SMA ================= */

    if (rsiGroup.smoothingMA) {
      rsiGroup.smoothingMA.applyOptions({
        color: smoothingStyle?.color,
        opacity: smoothingStyle?.opacity,

        lineWidth: smoothingStyle?.width,
        lineStyle: smoothingStyle?.lineStyle ?? 0,
        visible: smoothingStyle?.visible,
        lastValueVisible: smoothingStyle?.visible,
      });
    }

    /* ================= RSI BANDS ================= */

    const rsiSeries = rsiGroup.rsi;

    const upper = indicatorStyle?.RSI?.upper;
    const middle = indicatorStyle?.RSI?.middle;
    const lower = indicatorStyle?.RSI?.lower;

    /* CREATE ONCE */

    /* ================= RSI BANDS ================= */

    if (!rsiGroup._bands) rsiGroup._bands = {};

    const bands = rsiGroup._bands;

    /* ================= UPPER BAND ================= */

    if (upper?.visible) {
      if (!bands.upper) {
        bands.upper = rsiSeries.createPriceLine({
          price: upper?.value ?? 70,
          color: upper?.color || "rgba(158,158,158,1)",
          opacity: upper?.opacity || 100,
          lineWidth: upper?.width ?? 1,
          lineStyle: upper?.lineStyle ?? 2,
          axisLabelVisible: false,
          title: "",
        });
      }

      bands.upper.applyOptions({
        price: upper?.value,
        color: upper?.color,
        opacity: upper?.opacity,
        lineWidth: upper?.width,
        lineStyle: upper?.lineStyle ?? 2,
      });
    } else if (bands.upper) {
      rsiSeries.removePriceLine(bands.upper);
      bands.upper = null;
    }

    /* ================= MIDDLE BAND ================= */

    if (middle?.visible) {
      if (!bands.middle) {
        bands.middle = rsiSeries.createPriceLine({
          price: middle?.value ?? 50,
          color: middle?.color || "rgba(158,158,158,1)",
          opacity: middle?.opacity || 100,
          lineWidth: middle?.width ?? 1,
          lineStyle: middle?.lineStyle ?? 2,
          axisLabelVisible: false,
          title: "",
        });
      }

      bands.middle.applyOptions({
        price: middle?.value,
        color: middle?.color,
        opacity: middle?.opacity,
        lineWidth: middle?.width,
        lineStyle: middle?.lineStyle ?? 2,
      });
    } else if (bands.middle) {
      rsiSeries.removePriceLine(bands.middle);
      bands.middle = null;
    }

    /* ================= LOWER BAND ================= */

    if (lower?.visible) {
      if (!bands.lower) {
        bands.lower = rsiSeries.createPriceLine({
          price: lower?.value ?? 30,
          color: lower?.color || "rgba(158,158,158,1)",
          opacity: lower?.opacity || 100,
          lineWidth: lower?.width ?? 1,
          lineStyle: lower?.lineStyle ?? 2,
          axisLabelVisible: false,
          title: "",
        });
      }

      bands.lower.applyOptions({
        price: lower?.value,
        color: lower?.color,
        opacity: lower?.opacity,
        lineWidth: lower?.width,
        lineStyle: lower?.lineStyle ?? 2,
      });
    } else if (bands.lower) {
      rsiSeries.removePriceLine(bands.lower);
      bands.lower = null;
    }
    /* ================= UPDATE BACKGROUND ================= */

    rsiGroup.bandBackground?.applyOptions({
      visible: bandFill?.visible,
      topFillColor1: bandFill?.topFillColor1,
      topFillColor2: bandFill?.topFillColor2,
    });

    /* ================= UPDATE OVERBOUGHT ================= */

    rsiGroup.overboughtFill?.applyOptions({
      visible: obFill?.visible,
      topFillColor1: obFill?.topFillColor1,
      topFillColor2: obFill?.topFillColor2,
    });

    /* ================= UPDATE OVERSOLD ================= */

    rsiGroup.oversoldFill?.applyOptions({
      visible: osFill?.visible,
      bottomFillColor1: osFill?.bottomFillColor1,
      bottomFillColor2: osFill?.bottomFillColor2,
    });
  }, [indicatorStyle]);

  return null;
}
