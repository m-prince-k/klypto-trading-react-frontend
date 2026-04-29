import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function STOCHRSIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE STOCHRSI ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.STOCHRSI) {

      Object.values(indicatorSeriesRef.current.STOCHRSI).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.STOCHRSI = null;

    }

    const groupedSeries = {};
    let kData = [];

    const upper = indicatorStyle?.STOCHRSI?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.STOCHRSI?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.STOCHRSI?.lowerBand?.value ?? 20;

    const bgFill = indicatorStyle?.STOCHRSI?.bgFill;

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.STOCHRSI?.[lineName];

      const series = addSeries("STOCHRSI", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "rgba(38,166,154,1)",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "kLine") kData = lineData;

    });


    /* ================= LEVEL LINES ================= */

    const makeLevelData = (value) =>
      kData.map((p) => ({
        time: p.time,
        value,
      }));


    const upperLine = addSeries("STOCHRSI", LineSeries,{
      color: indicatorStyle?.STOCHRSI?.upperBand?.color,
      lineWidth: indicatorStyle?.STOCHRSI?.upperBand?.width ?? 1,
      lineStyle: indicatorStyle?.STOCHRSI?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.STOCHRSI?.upperBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const middleLine = addSeries("STOCHRSI", LineSeries,{
      color: indicatorStyle?.STOCHRSI?.middleBand?.color,
      lineWidth: indicatorStyle?.STOCHRSI?.middleBand?.width ?? 1,
      lineStyle: indicatorStyle?.STOCHRSI?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.STOCHRSI?.middleBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const lowerLine = addSeries("STOCHRSI", LineSeries,{
      color: indicatorStyle?.STOCHRSI?.lowerBand?.color,
      lineWidth: indicatorStyle?.STOCHRSI?.lowerBand?.width ?? 1,
      lineStyle: indicatorStyle?.STOCHRSI?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.STOCHRSI?.lowerBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    upperLine.setData(makeLevelData(upper));
    middleLine.setData(makeLevelData(middle));
    lowerLine.setData(makeLevelData(lower));

    groupedSeries.upperBand = upperLine;
    groupedSeries.middleBand = middleLine;
    groupedSeries.lowerBand = lowerLine;


    /* ================= BAND BACKGROUND ================= */

    const bandData = kData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bandBackgroundSeries = addSeries("STOCHRSI", BaselineSeries,{
      baseValue:{ type:"price", price: lower },
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
      bottomFillColor1:"rgba(0,0,0,0)",
      bottomFillColor2:"rgba(0,0,0,0)",
      topLineColor:"transparent",
      bottomLineColor:"transparent",
      visible: bgFill?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    bandBackgroundSeries.setData(bandData);

    groupedSeries.bandBackground = bandBackgroundSeries;

    /* ⭐ STORE DATA */

    groupedSeries.kData = kData;

    indicatorSeriesRef.current.STOCHRSI = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const stochGroup = indicatorSeriesRef.current?.STOCHRSI;
    if (!stochGroup) return;

    const kData = stochGroup.kData ?? [];

    const upperValue = indicatorStyle?.STOCHRSI?.upperBand?.value ?? 80;
    const middleValue = indicatorStyle?.STOCHRSI?.middleBand?.value ?? 50;
    const lowerValue = indicatorStyle?.STOCHRSI?.lowerBand?.value ?? 20;

    const makeLevel = (v)=> kData.map(p=>({time:p.time,value:v}));

    stochGroup.upperBand?.setData(makeLevel(upperValue));
    stochGroup.middleBand?.setData(makeLevel(middleValue));
    stochGroup.lowerBand?.setData(makeLevel(lowerValue));


    const kStyle = indicatorStyle?.STOCHRSI?.kLine;
    const dStyle = indicatorStyle?.STOCHRSI?.dLine;

    const bgFill = indicatorStyle?.STOCHRSI?.bgFill;


    /* ================= UPDATE K ================= */

    if (stochGroup.kLine) {
      stochGroup.kLine.applyOptions({
        color: kStyle?.color,
        lineWidth: kStyle?.width,
        lineStyle: kStyle?.lineStyle ?? 0,
        visible: kStyle?.visible,
      });
    }

    /* ================= UPDATE D ================= */

    if (stochGroup.dLine) {
      stochGroup.dLine.applyOptions({
        color: dStyle?.color,
        lineWidth: dStyle?.width,
        lineStyle: dStyle?.lineStyle ?? 0,
        visible: dStyle?.visible,
      });
    }

    /* ================= UPDATE BANDS ================= */

    stochGroup.upperBand?.applyOptions({
      color: indicatorStyle?.STOCHRSI?.upperBand?.color,
      lineWidth: indicatorStyle?.STOCHRSI?.upperBand?.width,
      visible: indicatorStyle?.STOCHRSI?.upperBand?.visible,
    });

    stochGroup.middleBand?.applyOptions({
      color: indicatorStyle?.STOCHRSI?.middleBand?.color,
      lineWidth: indicatorStyle?.STOCHRSI?.middleBand?.width,
      visible: indicatorStyle?.STOCHRSI?.middleBand?.visible,
    });

    stochGroup.lowerBand?.applyOptions({
      color: indicatorStyle?.STOCHRSI?.lowerBand?.color,
      lineWidth: indicatorStyle?.STOCHRSI?.lowerBand?.width,
      visible: indicatorStyle?.STOCHRSI?.lowerBand?.visible,
    });


    /* ⭐ FIXED BACKGROUND UPDATE */

    const bandData = kData.map((p)=>({
      time:p.time,
      value:upperValue
    }));

    stochGroup.bandBackground?.applyOptions({
      visible: bgFill?.visible,
      baseValue:{ type:"price", price: lowerValue },
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
    });

    stochGroup.bandBackground?.setData(bandData);

  },[indicatorStyle, result]);

  return null;

}