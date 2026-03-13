import {useEffect} from "react";
import {LineSeries,AreaSeries} from "lightweight-charts";

export default function SuperTrendPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}){

  /* CREATE SERIES */

  useEffect(()=>{

    if(!result) return;

    if(indicatorSeriesRef.current?.SuperTrend){
      Object.values(indicatorSeriesRef.current.SuperTrend).forEach(s=>{
        if(s?.setData){
          try{s.setData([])}catch{}
        }
      });
      indicatorSeriesRef.current.SuperTrend=null;
    }

    const grouped={};

    const upLine=addSeries("SuperTrend",LineSeries,{
      color:indicatorStyle?.SuperTrend?.upTrend?.color,
      lineWidth:indicatorStyle?.SuperTrend?.upTrend?.width
    });

    const downLine=addSeries("SuperTrend",LineSeries,{
      color:indicatorStyle?.SuperTrend?.downTrend?.color,
      lineWidth:indicatorStyle?.SuperTrend?.downTrend?.width
    });

    const bodyMiddle=addSeries("SuperTrend",LineSeries,{
      color:indicatorStyle?.SuperTrend?.bodyMiddle?.color,
      lineWidth:indicatorStyle?.SuperTrend?.bodyMiddle?.width,
      visible:indicatorStyle?.SuperTrend?.bodyMiddle?.visible
    });

    const upBg=addSeries("SuperTrend",AreaSeries,{
      topColor:indicatorStyle?.SuperTrend?.upTrendBg?.color0,
      bottomColor:indicatorStyle?.SuperTrend?.upTrendBg?.color1,
      lineColor:"transparent",
      lineWidth:0
    });

    const downBg=addSeries("SuperTrend",AreaSeries,{
      topColor:indicatorStyle?.SuperTrend?.downTrendBg?.color0,
      bottomColor:indicatorStyle?.SuperTrend?.downTrendBg?.color1,
      lineColor:"transparent",
      lineWidth:0
    });

    upLine.setData(result.data.upTrend);
    downLine.setData(result.data.downTrend);
    bodyMiddle.setData(result.data.bodyMiddle);

    upBg.setData(result.data.upTrend);
    downBg.setData(result.data.downTrend);

    grouped.upTrend=upLine;
    grouped.downTrend=downLine;
    grouped.bodyMiddle=bodyMiddle;
    grouped.upTrendBg=upBg;
    grouped.downTrendBg=downBg;

    indicatorSeriesRef.current.SuperTrend=grouped;

  },[result]);



  /* STYLE UPDATE */

  useEffect(()=>{

    const st=indicatorSeriesRef.current?.SuperTrend;
    if(!st) return;

    st.upTrend?.applyOptions({
      color:indicatorStyle?.SuperTrend?.upTrend?.color,
      lineWidth:indicatorStyle?.SuperTrend?.upTrend?.width,
      visible:indicatorStyle?.SuperTrend?.upTrend?.visible
    });

    st.downTrend?.applyOptions({
      color:indicatorStyle?.SuperTrend?.downTrend?.color,
      lineWidth:indicatorStyle?.SuperTrend?.downTrend?.width,
      visible:indicatorStyle?.SuperTrend?.downTrend?.visible
    });

    st.bodyMiddle?.applyOptions({
      visible:indicatorStyle?.SuperTrend?.bodyMiddle?.visible,
      color:indicatorStyle?.SuperTrend?.bodyMiddle?.color
    });

  },[indicatorStyle]);

  return null;
}