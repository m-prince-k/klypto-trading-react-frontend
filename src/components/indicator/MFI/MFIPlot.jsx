import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function MFIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE MFI ================= */

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

    const upper = indicatorStyle?.MFI?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.MFI?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.MFI?.lowerBand?.value ?? 20;

    const bgFill = indicatorStyle?.MFI?.bgFill;


    /* ================= MAIN MFI LINE ================= */

    const mfiSeries = addSeries("MFI", LineSeries,{
      color: indicatorStyle?.MFI?.mfiLine?.color,
      lineWidth: indicatorStyle?.MFI?.mfiLine?.width ?? 2,
      lineStyle: indicatorStyle?.MFI?.mfiLine?.lineStyle ?? 0,
      visible: indicatorStyle?.MFI?.mfiLine?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:true
    });

    const lineData = result?.data?.mfiLine ?? [];

    mfiSeries.setData(lineData);

    groupedSeries.mfiLine = mfiSeries;

    mfiData = lineData;


    /* ================= LEVEL LINES ================= */

    const makeLevelData = (value) =>
      mfiData.map((p) => ({
        time: p.time,
        value,
      }));


    const upperLine = addSeries("MFI", LineSeries,{
      color: indicatorStyle?.MFI?.upperBand?.color,
      lineWidth: indicatorStyle?.MFI?.upperBand?.width ?? 1,
      lineStyle: indicatorStyle?.MFI?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.MFI?.upperBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const middleLine = addSeries("MFI", LineSeries,{
      color: indicatorStyle?.MFI?.middleBand?.color,
      lineWidth: indicatorStyle?.MFI?.middleBand?.width ?? 1,
      lineStyle: indicatorStyle?.MFI?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.MFI?.middleBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const lowerLine = addSeries("MFI", LineSeries,{
      color: indicatorStyle?.MFI?.lowerBand?.color,
      lineWidth: indicatorStyle?.MFI?.lowerBand?.width ?? 1,
      lineStyle: indicatorStyle?.MFI?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.MFI?.lowerBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    upperLine.setData(makeLevelData(upper));
    middleLine.setData(makeLevelData(middle));
    lowerLine.setData(makeLevelData(lower));

    groupedSeries.upperBand = upperLine;
    groupedSeries.middleBand = middleLine;
    groupedSeries.lowerBand = lowerLine;


    /* ================= BACKGROUND BAND ================= */

    const bandData = mfiData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bandBackgroundSeries = addSeries("MFI", BaselineSeries,{
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

    groupedSeries.mfiData = mfiData;

    indicatorSeriesRef.current.MFI = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const mfiGroup = indicatorSeriesRef.current?.MFI;
    if (!mfiGroup) return;

    const mfiData = mfiGroup.mfiData ?? [];

    const upperValue = indicatorStyle?.MFI?.upperBand?.value ?? 80;
    const middleValue = indicatorStyle?.MFI?.middleBand?.value ?? 50;
    const lowerValue = indicatorStyle?.MFI?.lowerBand?.value ?? 20;

    const makeLevel = (v)=> mfiData.map(p=>({time:p.time,value:v}));


    /* ===== UPDATE LEVEL VALUES ===== */

    mfiGroup.upperBand?.setData(makeLevel(upperValue));
    mfiGroup.middleBand?.setData(makeLevel(middleValue));
    mfiGroup.lowerBand?.setData(makeLevel(lowerValue));


    /* ===== UPDATE MFI LINE ===== */

    if (mfiGroup.mfiLine) {

      const mfiStyle = indicatorStyle?.MFI?.mfiLine;

      mfiGroup.mfiLine.applyOptions({
        color: mfiStyle?.color,
        lineWidth: mfiStyle?.width,
        lineStyle: mfiStyle?.lineStyle ?? 0,
        visible: mfiStyle?.visible,
      });

    }


    /* ===== UPDATE UPPER ===== */

    mfiGroup.upperBand?.applyOptions({
      color: indicatorStyle?.MFI?.upperBand?.color,
      lineWidth: indicatorStyle?.MFI?.upperBand?.width,
      lineStyle: indicatorStyle?.MFI?.upperBand?.lineStyle ?? 0,
      visible: indicatorStyle?.MFI?.upperBand?.visible,
    });


    /* ===== UPDATE MIDDLE ===== */

    mfiGroup.middleBand?.applyOptions({
      color: indicatorStyle?.MFI?.middleBand?.color,
      lineWidth: indicatorStyle?.MFI?.middleBand?.width,
      lineStyle: indicatorStyle?.MFI?.middleBand?.lineStyle ?? 0,
      visible: indicatorStyle?.MFI?.middleBand?.visible,
    });


    /* ===== UPDATE LOWER ===== */

    mfiGroup.lowerBand?.applyOptions({
      color: indicatorStyle?.MFI?.lowerBand?.color,
      lineWidth: indicatorStyle?.MFI?.lowerBand?.width,
      lineStyle: indicatorStyle?.MFI?.lowerBand?.lineStyle ?? 0,
      visible: indicatorStyle?.MFI?.lowerBand?.visible,
    });


    /* ===== UPDATE BACKGROUND ===== */

    const bgFill = indicatorStyle?.MFI?.bgFill;

    mfiGroup.bandBackground?.applyOptions({
      visible: bgFill?.visible,
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
    });

  },[indicatorStyle]);

  return null;

}