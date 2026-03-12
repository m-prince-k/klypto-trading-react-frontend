import { useEffect } from "react";
import { LineSeries, BaselineSeries, AreaSeries } from "lightweight-charts";

export default function RSIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
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

    /* ================= BOLLINGER BANDS (SMA+BB) ================= */
     const config = indicatorConfigs?.["RSI"] || {};
  const maType  = config;

    console.log(result, "resssssss");
    console.log(maType, "tyeeeee");


    if (maType === "SMA + Bollinger Bands") {
      const upperBandData = result.data.bbUpperBand || [];
      const lowerBandData = result.data.bbLowerBand || [];

      const upperSeries = addSeries("RSI", LineSeries, {
        color: indicatorStyle?.RSI?.bbUpperBand?.color || "#4caf50",
        lineWidth: indicatorStyle?.RSI?.bbUpperBand?.width || 1,
      });
      const lowerSeries = addSeries("RSI", LineSeries, {
        color: indicatorStyle?.RSI?.bbLowerBand?.color || "#f44336",
        lineWidth: indicatorStyle?.RSI?.bbLowerBand?.width || 1,
      });

      const fillSeries = addSeries("RSI", AreaSeries, {
        topSeries: upperSeries,
        bottomSeries: lowerSeries,
        topColor: indicatorStyle?.RSI?.bbFill?.topColor || "rgba(76,175,80,0.2)",
        bottomColor:
          indicatorStyle?.RSI?.bbFill?.bottomColor || "rgba(76,175,80,0.05)",
      });

      upperSeries.setData(upperBandData);
      lowerSeries.setData(lowerBandData);

      groupedSeries.bbUpperBand = upperSeries;
      groupedSeries.bbLowerBand = lowerSeries;
      groupedSeries.bbFill = fillSeries;
    }

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

    /* ================= UPDATE BANDS ================= */
    if (rsiGroup.bbUpperBand)
      rsiGroup.bbUpperBand.applyOptions({
        color: indicatorStyle?.RSI?.bbUpperBand?.color,
        lineWidth: indicatorStyle?.RSI?.bbUpperBand?.width,
        visible: indicatorStyle?.RSI?.bbUpperBand?.visible,
      });

    if (rsiGroup.bbLowerBand)
      rsiGroup.bbLowerBand.applyOptions({
        color: indicatorStyle?.RSI?.bbLowerBand?.color,
        lineWidth: indicatorStyle?.RSI?.bbLowerBand?.width,
        visible: indicatorStyle?.RSI?.bbLowerBand?.visible,
      });

    if (rsiGroup.bbFill)
      rsiGroup.bbFill.applyOptions({
        topColor: indicatorStyle?.RSI?.bbFill?.topColor,
        bottomColor: indicatorStyle?.RSI?.bbFill?.bottomColor,
        visible: indicatorStyle?.RSI?.bbFill?.visible,
      });

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