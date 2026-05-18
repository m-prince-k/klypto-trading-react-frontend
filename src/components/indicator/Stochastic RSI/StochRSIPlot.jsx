import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function STOCHRSIPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
  chart
}) {

  /* ================= CREATE STOCHRSI ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.[indicator]) {

      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });

      indicatorSeriesRef.current[indicator] = null;

    }

    const groupedSeries = {};
    let kData = [];

    const upper = indicatorStyle?.[indicator]?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.[indicator]?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.[indicator]?.lowerBand?.value ?? 20;

    const bgFill = indicatorStyle?.[indicator]?.bgFill;

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.[indicator]?.[lineName];

      const series = addSeries(indicator, LineSeries, {
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


    const upperLine = addSeries(indicator, LineSeries,{
      color: indicatorStyle?.[indicator]?.upperBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.upperBand?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.upperBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const middleLine = addSeries(indicator, LineSeries,{
      color: indicatorStyle?.[indicator]?.middleBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.middleBand?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.middleBand?.visible ?? true,
      priceLineVisible:false,
      lastValueVisible:false
    });

    const lowerLine = addSeries(indicator, LineSeries,{
      color: indicatorStyle?.[indicator]?.lowerBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.lowerBand?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.lowerBand?.visible ?? true,
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

    const bandBackgroundSeries = addSeries(indicator, BaselineSeries,{
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

    indicatorSeriesRef.current[indicator] = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const stochGroup = indicatorSeriesRef.current?.[indicator];
    if (!stochGroup) return;

    const kData = stochGroup.kData ?? [];

    const upperValue = indicatorStyle?.[indicator]?.upperBand?.value ?? 80;
    const middleValue = indicatorStyle?.[indicator]?.middleBand?.value ?? 50;
    const lowerValue = indicatorStyle?.[indicator]?.lowerBand?.value ?? 20;

    const makeLevel = (v)=> kData.map(p=>({time:p.time,value:v}));

    stochGroup.upperBand?.setData(makeLevel(upperValue));
    stochGroup.middleBand?.setData(makeLevel(middleValue));
    stochGroup.lowerBand?.setData(makeLevel(lowerValue));


    const kStyle = indicatorStyle?.[indicator]?.kLine;
    const dStyle = indicatorStyle?.[indicator]?.dLine;

    const bgFill = indicatorStyle?.[indicator]?.bgFill;


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
      color: indicatorStyle?.[indicator]?.upperBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.upperBand?.width,
      visible: indicatorStyle?.[indicator]?.upperBand?.visible,
    });

    stochGroup.middleBand?.applyOptions({
      color: indicatorStyle?.[indicator]?.middleBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.middleBand?.width,
      visible: indicatorStyle?.[indicator]?.middleBand?.visible,
    });

    stochGroup.lowerBand?.applyOptions({
      color: indicatorStyle?.[indicator]?.lowerBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.lowerBand?.width,
      visible: indicatorStyle?.[indicator]?.lowerBand?.visible,
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