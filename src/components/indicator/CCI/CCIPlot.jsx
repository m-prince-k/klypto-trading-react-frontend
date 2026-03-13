import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function CCIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* ================= CREATE CCI ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.CCI) {

      Object.values(indicatorSeriesRef.current.CCI).forEach((s)=>{
        if(s?.setData){
          try{s.setData([])}catch{}
        }
      });

      indicatorSeriesRef.current.CCI = null;

    }

    const groupedSeries = {};
    let cciData = [];

    const upper = indicatorStyle?.CCI?.upperBand?.value ?? 100;
    const middle = indicatorStyle?.CCI?.middleBand?.value ?? 0;
    const lower = indicatorStyle?.CCI?.lowerBand?.value ?? -100;

    const bgFill = indicatorStyle?.CCI?.bgFill;

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName,lineData])=>{

      const rowConfig = rows?.find((r)=>r.key===lineName);
      const styleConfig = indicatorStyle?.CCI?.[lineName];

      const series = addSeries("CCI",LineSeries,{
        color: styleConfig?.color || rowConfig?.color || "rgba(38,166,154,1)",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible:false,
        lastValueVisible: lineName === "cciLine"
      });

      if(!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if(lineName === "cciLine") cciData = lineData;

    });


    /* ================= LEVEL LINES ================= */

    const makeLevelData = (value)=>
      cciData.map((p)=>({
        time:p.time,
        value
      }));


    const upperLine = addSeries("CCI",LineSeries,{
      color: indicatorStyle?.CCI?.upperBand?.color,
      lineWidth: indicatorStyle?.CCI?.upperBand?.width ?? 1,
      lineStyle: indicatorStyle?.CCI?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.upperBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const middleLine = addSeries("CCI",LineSeries,{
      color: indicatorStyle?.CCI?.middleBand?.color,
      lineWidth: indicatorStyle?.CCI?.middleBand?.width ?? 1,
      lineStyle: indicatorStyle?.CCI?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.middleBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const lowerLine = addSeries("CCI",LineSeries,{
      color: indicatorStyle?.CCI?.lowerBand?.color,
      lineWidth: indicatorStyle?.CCI?.lowerBand?.width ?? 1,
      lineStyle: indicatorStyle?.CCI?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.lowerBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    upperLine.setData(makeLevelData(upper));
    middleLine.setData(makeLevelData(middle));
    lowerLine.setData(makeLevelData(lower));

    groupedSeries.upperBand = upperLine;
    groupedSeries.middleBand = middleLine;
    groupedSeries.lowerBand = lowerLine;


    /* ================= BACKGROUND FILL ================= */

    const bandData = cciData.map((p)=>({
      time:p.time,
      value:upper
    }));


    const bgFillSeries = addSeries("CCI",BaselineSeries,{
      baseValue:{type:"price",price:lower},
      topFillColor1:bgFill?.topFillColor1,
      topFillColor2:bgFill?.topFillColor2,
      bottomFillColor1:"rgba(0,0,0,0)",
      bottomFillColor2:"rgba(0,0,0,0)",
      topLineColor:"transparent",
      bottomLineColor:"transparent",
      visible:bgFill?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    bgFillSeries.setData(bandData);

    groupedSeries.bgFill = bgFillSeries;

    /* ================= STORE CCI DATA ================= */

    groupedSeries.cciData = cciData;

    indicatorSeriesRef.current.CCI = groupedSeries;

  },[result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(()=>{

    const cciGroup = indicatorSeriesRef.current?.CCI;
    if(!cciGroup) return;

    const cciData = cciGroup.cciData ?? [];

    const upperValue = indicatorStyle?.CCI?.upperBand?.value ?? 100;
    const middleValue = indicatorStyle?.CCI?.middleBand?.value ?? 0;
    const lowerValue = indicatorStyle?.CCI?.lowerBand?.value ?? -100;

    const makeLevel=(v)=> cciData.map(p=>({time:p.time,value:v}));

    cciGroup.upperBand?.setData(makeLevel(upperValue));
    cciGroup.middleBand?.setData(makeLevel(middleValue));
    cciGroup.lowerBand?.setData(makeLevel(lowerValue));


    const cciStyle = indicatorStyle?.CCI?.cciLine;
    const maStyle = indicatorStyle?.CCI?.cciMa;
    const bgFill = indicatorStyle?.CCI?.bgFill;


    /* ================= UPDATE CCI ================= */

    if(cciGroup.cciLine){
      cciGroup.cciLine.applyOptions({
        color: cciStyle?.color,
        lineWidth: cciStyle?.width,
        lineStyle: cciStyle?.lineStyle ?? 0,
        visible: cciStyle?.visible,
        opacity: cciStyle?.opacity
      });
    }


    /* ================= UPDATE CCI MA ================= */

    if(cciGroup.cciMa){
      cciGroup.cciMa.applyOptions({
        color: maStyle?.color,
        lineWidth: maStyle?.width,
        lineStyle: maStyle?.lineStyle ?? 0,
        visible: maStyle?.visible,
        opacity: maStyle?.opacity
      });
    }


    /* ================= UPDATE LEVEL LINES ================= */

    if(cciGroup.upperBand)
      cciGroup.upperBand.applyOptions({
        color: indicatorStyle?.CCI?.upperBand?.color,
        lineWidth: indicatorStyle?.CCI?.upperBand?.width,
        lineStyle: indicatorStyle?.CCI?.upperBand?.lineStyle ?? 0,
        visible: indicatorStyle?.CCI?.upperBand?.visible
      });

    if(cciGroup.middleBand)
      cciGroup.middleBand.applyOptions({
        color: indicatorStyle?.CCI?.middleBand?.color,
        lineWidth: indicatorStyle?.CCI?.middleBand?.width,
        lineStyle: indicatorStyle?.CCI?.middleBand?.lineStyle ?? 0,
        visible: indicatorStyle?.CCI?.middleBand?.visible
      });

    if(cciGroup.lowerBand)
      cciGroup.lowerBand.applyOptions({
        color: indicatorStyle?.CCI?.lowerBand?.color,
        lineWidth: indicatorStyle?.CCI?.lowerBand?.width,
        lineStyle: indicatorStyle?.CCI?.lowerBand?.lineStyle ?? 0,
        visible: indicatorStyle?.CCI?.lowerBand?.visible
      });


    /* ================= UPDATE BACKGROUND ================= */

    cciGroup.bgFill?.applyOptions({
      visible:bgFill?.visible,
      topFillColor1:bgFill?.topFillColor1,
      topFillColor2:bgFill?.topFillColor2
    });

  },[indicatorStyle]);


  return null;

}