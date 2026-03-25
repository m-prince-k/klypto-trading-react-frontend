import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function FTPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    const fisherData = result?.data?.fisherLine ?? [];
    const triggerData = result?.data?.triggerLine ?? [];

    console.log(fisherData, "fisherData");

    if (!fisherData.length) return;

    /* ===== REMOVE OLD SERIES ===== */

    if (indicatorSeriesRef.current?.FT) {
      Object.values(indicatorSeriesRef.current.FT).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.FT = null;
    }

    const grouped = {};

    /* ===== Fisher Line ===== */

    const fisherSeries = addSeries("FT", LineSeries, {
      color: indicatorStyle?.FT?.fisherLine?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.FT?.fisherLine?.width ?? 2,
      visible: indicatorStyle?.FT?.fisherLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    fisherSeries.setData(fisherData);
    grouped.fisherLine = fisherSeries;

    /* ===== Trigger Line ===== */

    const triggerSeries = addSeries("FT", LineSeries, {
      color: indicatorStyle?.FT?.triggerLine?.color ?? "#ff9800",
      lineWidth: indicatorStyle?.FT?.triggerLine?.width ?? 2,
      visible: indicatorStyle?.FT?.triggerLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
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

      const series = addSeries("FT", LineSeries, {
        color: indicatorStyle?.FT?.[key]?.color,
        lineWidth: indicatorStyle?.FT?.[key]?.width ?? 1,
        lineStyle: indicatorStyle?.FT?.[key]?.lineStyle ?? 2,
        visible: indicatorStyle?.FT?.[key]?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const levelData = fisherData.map((p) => ({
        time: p.time,
        value,
      }));

      series.setData(levelData);

      grouped[key] = series;
    });

    grouped.fisherData = fisherData;

    indicatorSeriesRef.current.FT = grouped;

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

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

    levels.forEach((key) => {

      const value = indicatorStyle?.FT?.[key]?.value;

      const levelData = fisherData.map((p) => ({
        time: p.time,
        value,
      }));

      group[key]?.setData(levelData);

      group[key]?.applyOptions({
        color: indicatorStyle?.FT?.[key]?.color,
        visible: indicatorStyle?.FT?.[key]?.visible,
        lineWidth: indicatorStyle?.FT?.[key]?.width,
      });
    });

    group.fisherLine?.applyOptions({
      color: indicatorStyle?.FT?.fisherLine?.color,
      visible: indicatorStyle?.FT?.fisherLine?.visible,
      lineWidth: indicatorStyle?.FT?.fisherLine?.width,
      lineStyle: indicatorStyle?.FT?.fisherLine?.lineStyle,
    });

    group.triggerLine?.applyOptions({
      color: indicatorStyle?.FT?.triggerLine?.color,
      visible: indicatorStyle?.FT?.triggerLine?.visible,
      lineWidth: indicatorStyle?.FT?.triggerLine?.width,
      lineStyle: indicatorStyle?.FT?.triggerLine?.lineStyle,
    });

  }, [indicatorStyle]);

  return null;
}