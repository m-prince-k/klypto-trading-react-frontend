import { useEffect } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

export default function IchimokuCloudPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  const buildCloud = (spanA, spanB, bullishColor, bearishColor) => {

    const upper = [];
    const lower = [];

    spanA.forEach((p,i)=>{

      const b = spanB[i];
      if(!b) return;

      const bullish = p.value >= b.value;

      const color = bullish ? bullishColor : bearishColor;

      upper.push({
        time:p.time,
        value:Math.max(p.value,b.value),
        color
      });

      lower.push({
        time:p.time,
        value:Math.min(p.value,b.value),
        color
      });

    });

    return {upper,lower};
  };



  useEffect(()=>{

    if(!result) return;

    if(indicatorSeriesRef.current?.IchimokuCloud){

      Object.values(indicatorSeriesRef.current.IchimokuCloud).forEach(s=>{
        try{s.setData([])}catch{}
      });

      indicatorSeriesRef.current.IchimokuCloud=null;
    }

    const style = indicatorStyle?.IchimokuCloud ?? {};

    const grouped={};

    const conversionLine = result?.data?.conversionLine || [];
    const baseLine = result?.data?.baseLine || [];
    const spanA = result?.data?.leadLine1 || [];
    const spanB = result?.data?.leadLine2 || [];
    const laggingSpan = result?.data?.laggingSpan || [];
    const kumoUpper = result?.data?.kumoCloudUpper || [];
    const kumoLower = result?.data?.kumoCloudLower || [];



    /* ================= LINES ================= */

    const conversionSeries = addSeries("main",LineSeries,{
      color:style?.conversionLine?.color,
      lineWidth:style?.conversionLine?.width ?? 2,
      lineStyle:style?.conversionLine?.lineStyle ?? 0,
      visible:style?.conversionLine?.visible ?? true
    });

    const baseSeries = addSeries("main",LineSeries,{
      color:style?.baseLine?.color,
      lineWidth:style?.baseLine?.width ?? 2,
      lineStyle:style?.baseLine?.lineStyle ?? 0,
      visible:style?.baseLine?.visible ?? true
    });

    const spanASeries = addSeries("main",LineSeries,{
      color:style?.leadLine1?.color,
      lineWidth:style?.leadLine1?.width ?? 2,
      visible:style?.leadLine1?.visible ?? true
    });

    const spanBSeries = addSeries("main",LineSeries,{
      color:style?.leadLine2?.color,
      lineWidth:style?.leadLine2?.width ?? 2,
      visible:style?.leadLine2?.visible ?? true
    });

    const laggingSeries = addSeries("main",LineSeries,{
      color:style?.laggingSpan?.color,
      lineWidth:style?.laggingSpan?.width ?? 2,
      visible:style?.laggingSpan?.visible ?? true
    });

    const kumoUpperSeries = addSeries("main",LineSeries,{
      color:style?.kumoCloudUpper?.color,
      lineWidth:style?.kumoCloudUpper?.width ?? 2,
      visible:style?.kumoCloudUpper?.visible ?? true
    });

    const kumoLowerSeries = addSeries("main",LineSeries,{
      color:style?.kumoCloudLower?.color,
      lineWidth:style?.kumoCloudLower?.width ?? 2,
      visible:style?.kumoCloudLower?.visible ?? true
    });



    /* ================= CLOUD ================= */

    const bullishColor =
      style?.cloudFillBullish?.color ?? "rgba(67,160,71,0.35)";

    const bearishColor =
      style?.cloudFillBearish?.color ?? "rgba(244,67,54,0.35)";

    const cloudUpperSeries = addSeries("main",AreaSeries,{
      lineWidth:0,
      topColor:bullishColor,
      bottomColor:bullishColor,
      lastValueVisible:false,
      priceLineVisible:false,
      visible:style?.cloudFillBullish?.visible ?? true
    });

    const cloudLowerSeries = addSeries("main",AreaSeries,{
      lineWidth:0,
      topColor:bearishColor,
      bottomColor:bearishColor,
      lastValueVisible:false,
      priceLineVisible:false,
      visible:style?.cloudFillBearish?.visible ?? true
    });

    const cloud = buildCloud(spanA,spanB,bullishColor,bearishColor);

    cloudUpperSeries.setData(cloud.upper);
    cloudLowerSeries.setData(cloud.lower);



    /* ================= SET DATA ================= */

    conversionSeries.setData(conversionLine);
    baseSeries.setData(baseLine);
    spanASeries.setData(spanA);
    spanBSeries.setData(spanB);
    laggingSeries.setData(laggingSpan);
    kumoUpperSeries.setData(kumoUpper);
    kumoLowerSeries.setData(kumoLower);



    grouped.conversionLine=conversionSeries;
    grouped.baseLine=baseSeries;
    grouped.leadLine1=spanASeries;
    grouped.leadLine2=spanBSeries;
    grouped.laggingSpan=laggingSeries;
    grouped.kumoCloudUpper=kumoUpperSeries;
    grouped.kumoCloudLower=kumoLowerSeries;
    grouped.cloudUpper=cloudUpperSeries;
    grouped.cloudLower=cloudLowerSeries;

    indicatorSeriesRef.current.IchimokuCloud=grouped;

  },[result]);



  useEffect(()=>{

    const group=indicatorSeriesRef.current?.IchimokuCloud;
    if(!group) return;

    const style=indicatorStyle?.IchimokuCloud ?? {};

    group.conversionLine?.applyOptions(style.conversionLine);
    group.baseLine?.applyOptions(style.baseLine);
    group.leadLine1?.applyOptions(style.leadLine1);
    group.leadLine2?.applyOptions(style.leadLine2);
    group.laggingSpan?.applyOptions(style.laggingSpan);
    group.kumoCloudUpper?.applyOptions(style.kumoCloudUpper);
    group.kumoCloudLower?.applyOptions(style.kumoCloudLower);

    group.cloudUpper?.applyOptions({
      topColor:style?.cloudFillBullish?.color,
      bottomColor:style?.cloudFillBullish?.color,
      visible:style?.cloudFillBullish?.visible ?? true
    });

    group.cloudLower?.applyOptions({
      topColor:style?.cloudFillBearish?.color,
      bottomColor:style?.cloudFillBearish?.color,
      visible:style?.cloudFillBearish?.visible ?? true
    });

  },[indicatorStyle]);



  return null;
}