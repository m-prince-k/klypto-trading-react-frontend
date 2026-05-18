import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function FTPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
  chart
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    const fisherData = result?.data?.fisherLine ?? [];
    const triggerData = result?.data?.triggerLine ?? [];

    console.log(fisherData, "fisherData");

    if (!fisherData.length) return;

    /* ===== REMOVE OLD SERIES ===== */

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const grouped = {};

    /* ===== Fisher Line ===== */

    const fisherSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.fisherLine?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.[indicator]?.fisherLine?.width ?? 2,
      visible: indicatorStyle?.[indicator]?.fisherLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    fisherSeries.setData(fisherData);
    grouped.fisherLine = fisherSeries;

    /* ===== Trigger Line ===== */

    const triggerSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.triggerLine?.color ?? "#ff9800",
      lineWidth: indicatorStyle?.[indicator]?.triggerLine?.width ?? 2,
      visible: indicatorStyle?.[indicator]?.triggerLine?.visible ?? true,
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

      const value = indicatorStyle?.[indicator]?.[key]?.value;

      const series = addSeries(indicator, LineSeries, {
        color: indicatorStyle?.[indicator]?.[key]?.color,
        lineWidth: indicatorStyle?.[indicator]?.[key]?.width ?? 1,
        lineStyle: indicatorStyle?.[indicator]?.[key]?.lineStyle ?? 2,
        visible: indicatorStyle?.[indicator]?.[key]?.visible ?? true,
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

    indicatorSeriesRef.current[indicator] = grouped;

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
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

      const value = indicatorStyle?.[indicator]?.[key]?.value;

      const levelData = fisherData.map((p) => ({
        time: p.time,
        value,
      }));

      group[key]?.setData(levelData);

      group[key]?.applyOptions({
        color: indicatorStyle?.[indicator]?.[key]?.color,
        visible: indicatorStyle?.[indicator]?.[key]?.visible,
        lineWidth: indicatorStyle?.[indicator]?.[key]?.width,
      });
    });

    group.fisherLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.fisherLine?.color,
      visible: indicatorStyle?.[indicator]?.fisherLine?.visible,
      lineWidth: indicatorStyle?.[indicator]?.fisherLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.fisherLine?.lineStyle,
    });

    group.triggerLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.triggerLine?.color,
      visible: indicatorStyle?.[indicator]?.triggerLine?.visible,
      lineWidth: indicatorStyle?.[indicator]?.triggerLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.triggerLine?.lineStyle,
    });

  }, [indicatorStyle]);

  return null;
}