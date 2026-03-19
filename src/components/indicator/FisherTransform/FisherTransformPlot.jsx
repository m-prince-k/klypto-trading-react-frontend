import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function FTPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  useEffect(() => {

    const rows = Array.isArray(result)
      ? result
      : [];

      console.log(rows, "rowssssssssss")

    if (!rows.length) return;

    if (indicatorSeriesRef.current?.FT) {
      Object.values(indicatorSeriesRef.current.FT).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.FT = null;
    }

    const fisherData = rows
      .filter((d) => d.fish != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.fish),
      }));

    const triggerData = rows
      .filter((d) => d.trigger != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.trigger),
      }));

    const grouped = {};

    /* ===== Fisher ===== */

    const fisherSeries = addSeries("FT", LineSeries, {
      color: indicatorStyle?.FT?.fisherLine?.color,
      lineWidth: indicatorStyle?.FT?.fisherLine?.width,
      visible: indicatorStyle?.FT?.fisherLine?.visible,
      priceLineVisible:false,
      lastValueVisible:true
    });

    fisherSeries.setData(fisherData);
    grouped.fisherLine = fisherSeries;

    /* ===== Trigger ===== */

    const triggerSeries = addSeries("FT", LineSeries, {
      color: indicatorStyle?.FT?.triggerLine?.color,
      lineWidth: indicatorStyle?.FT?.triggerLine?.width,
      visible: indicatorStyle?.FT?.triggerLine?.visible,
      priceLineVisible:false,
      lastValueVisible:true
    });

    triggerSeries.setData(triggerData);
    grouped.triggerLine = triggerSeries;

    /* ===== LEVEL LINES ===== */

    const levels = [
      "level1_5",
      "level0_75",
      "level0",
      "level_minus0_75",
      "level_minus1_5",
    ];

    levels.forEach((key) => {

      const value = indicatorStyle?.FT?.[key]?.value;

      const series = addSeries("FT", LineSeries,{
        color: indicatorStyle?.FT?.[key]?.color,
        lineWidth: indicatorStyle?.FT?.[key]?.width ?? 1,
        lineStyle: indicatorStyle?.FT?.[key]?.lineStyle ?? 2,
        visible: indicatorStyle?.FT?.[key]?.visible ?? true,
        priceLineVisible:false,
        lastValueVisible:false
      });

      const levelData = fisherData.map(p=>({
        time:p.time,
        value
      }));

      series.setData(levelData);

      grouped[key] = series;
    });

    grouped.fisherData = fisherData;

    indicatorSeriesRef.current.FT = grouped;

  }, [result, indicatorConfigs]);


  /* ===== STYLE UPDATE ===== */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.FT;
    if (!group) return;

    const fisherData = group.fisherData ?? [];

    const levels = [
      "level1_5",
      "level0_75",
      "level0",
      "level_minus0_75",
      "level_minus1_5",
    ];

    levels.forEach((key)=>{

      const value = indicatorStyle?.FT?.[key]?.value;

      const levelData = fisherData.map(p=>({
        time:p.time,
        value
      }));

      group[key]?.setData(levelData);

      group[key]?.applyOptions({
        color:indicatorStyle?.FT?.[key]?.color,
        visible:indicatorStyle?.FT?.[key]?.visible,
        lineWidth:indicatorStyle?.FT?.[key]?.width,
      });

    });

    group.fisherLine?.applyOptions({
      color:indicatorStyle?.FT?.fisherLine?.color,
      visible:indicatorStyle?.FT?.fisherLine?.visible,
      lineWidth:indicatorStyle?.FT?.fisherLine?.width,
    });

    group.triggerLine?.applyOptions({
      color:indicatorStyle?.FT?.triggerLine?.color,
      visible:indicatorStyle?.FT?.triggerLine?.visible,
      lineWidth:indicatorStyle?.FT?.triggerLine?.width,
    });

  }, [indicatorStyle]);

  return null;
}