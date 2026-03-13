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

    if (indicatorSeriesRef.current?.RSI) {

      Object.values(indicatorSeriesRef.current.RSI).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.RSI = null;

    }

    const groupedSeries = {};
    let rsiData = [];

    const upper = indicatorStyle?.RSI?.upper?.value ?? 70;
    const middle = indicatorStyle?.RSI?.middle?.value ?? 50;
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


    /* ================= LEVEL LINES ================= */

    const makeLevelData = (value) =>
      rsiData.map((p) => ({
        time: p.time,
        value,
      }));

    const upperLine = addSeries("RSI", LineSeries,{
      color: indicatorStyle?.RSI?.upper?.color,
      lineWidth: indicatorStyle?.RSI?.upper?.width ?? 1,
      lineStyle: indicatorStyle?.RSI?.upper?.lineStyle ?? 2,
      visible: indicatorStyle?.RSI?.upper?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const middleLine = addSeries("RSI", LineSeries,{
      color: indicatorStyle?.RSI?.middle?.color,
      lineWidth: indicatorStyle?.RSI?.middle?.width ?? 1,
      lineStyle: indicatorStyle?.RSI?.middle?.lineStyle ?? 2,
      visible: indicatorStyle?.RSI?.middle?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const lowerLine = addSeries("RSI", LineSeries,{
      color: indicatorStyle?.RSI?.lower?.color,
      lineWidth: indicatorStyle?.RSI?.lower?.width ?? 1,
      lineStyle: indicatorStyle?.RSI?.lower?.lineStyle ?? 2,
      visible: indicatorStyle?.RSI?.lower?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    upperLine.setData(makeLevelData(upper));
    middleLine.setData(makeLevelData(middle));
    lowerLine.setData(makeLevelData(lower));

    groupedSeries.upper = upperLine;
    groupedSeries.middle = middleLine;
    groupedSeries.lower = lowerLine;


    /* ================= BAND BACKGROUND ================= */

    const bandData = rsiData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bandBackgroundSeries = addSeries("RSI", BaselineSeries,{
      baseValue:{ type:"price", price: lower },
      topFillColor1: bandFill?.topFillColor1,
      topFillColor2: bandFill?.topFillColor2,
      bottomFillColor1:"rgba(0,0,0,0)",
      bottomFillColor2:"rgba(0,0,0,0)",
      topLineColor:"transparent",
      bottomLineColor:"transparent",
      visible: bandFill?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    bandBackgroundSeries.setData(bandData);


    /* ================= OVERBOUGHT ================= */

    const overboughtSeries = addSeries("RSI", BaselineSeries,{
      baseValue:{ type:"price", price: upper },
      topFillColor1: obFill?.topFillColor1,
      topFillColor2: obFill?.topFillColor2,
      bottomFillColor1:"rgba(0,0,0,0)",
      bottomFillColor2:"rgba(0,0,0,0)",
      topLineColor:"transparent",
      bottomLineColor:"transparent",
      visible: obFill?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });


    /* ================= OVERSOLD ================= */

    const oversoldSeries = addSeries("RSI", BaselineSeries,{
      baseValue:{ type:"price", price: lower },
      bottomFillColor1: osFill?.bottomFillColor1,
      bottomFillColor2: osFill?.bottomFillColor2,
      topFillColor1:"rgba(0,0,0,0)",
      topFillColor2:"rgba(0,0,0,0)",
      topLineColor:"transparent",
      bottomLineColor:"transparent",
      visible: osFill?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });


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

    /* ⭐ FIX: STORE RSI DATA */

    groupedSeries.rsiData = rsiData;

    indicatorSeriesRef.current.RSI = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const rsiGroup = indicatorSeriesRef.current?.RSI;
    if (!rsiGroup) return;

    const rsiData = rsiGroup.rsiData ?? [];

    console.log(rsiData,"rsidata");

     const upperValue = indicatorStyle?.RSI?.upper?.value ?? 70;
    const middleValue = indicatorStyle?.RSI?.middle?.value ?? 50;
    const lowerValue = indicatorStyle?.RSI?.lower?.value ?? 30;
    const makeLevel = (v)=> rsiData.map(p=>({time:p.time,value:v}));

    rsiGroup.upper?.setData(makeLevel(upperValue));
    rsiGroup.middle?.setData(makeLevel(middleValue));
    rsiGroup.lower?.setData(makeLevel(lowerValue));
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
    if (rsiGroup.upper)
      rsiGroup.upper?.applyOptions({
        color: indicatorStyle?.RSI?.upper?.color,
        lineWidth: indicatorStyle?.RSI?.upper?.width,
        lineStyle: indicatorStyle?.RSI?.upper?.lineStyle ?? 0,
        visible: indicatorStyle?.RSI?.upper?.visible,
      });

    if (rsiGroup.middle)
      rsiGroup.middle?.applyOptions({
        color: indicatorStyle?.RSI?.middle?.color,
        lineWidth: indicatorStyle?.RSI?.middle?.width,
        lineStyle: indicatorStyle?.RSI?.middle?.lineStyle ?? 0,
        visible: indicatorStyle?.RSI?.middle?.visible,
      });

    if (rsiGroup.lower)
      rsiGroup.lower?.applyOptions({
        color: indicatorStyle?.RSI?.lower?.color,
        lineWidth: indicatorStyle?.RSI?.lower?.width,
        lineStyle: indicatorStyle?.RSI?.lower?.lineStyle ?? 0,
        visible: indicatorStyle?.RSI?.lower?.visible,
      });

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

  },[indicatorStyle]);

  return null;

}