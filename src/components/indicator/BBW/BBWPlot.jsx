import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function BBWPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const bbw = result?.data?.bbw;
    const highest = result?.data?.highest;
    const lowest = result?.data?.lowest;

    // ✅ HARD CHECK
    if (!Array.isArray(bbw) || bbw.length === 0) {
      console.log("❌ BBW not plotting", result);
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    /* 🔵 BBW LINE */
    const bbwSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.bbwLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.[indicator]?.bbwLine?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.bbwLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.bbwLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    bbwSeries.setData(bbw);

    /* 🔴 HIGHEST LINE */
    let highestSeries = null;

    if (Array.isArray(highest) && highest.length) {
      highestSeries = addSeries(indicator, LineSeries, {
        color: indicatorStyle?.[indicator]?.highest?.color ?? "rgba(244,67,54,1)",
        lineWidth: indicatorStyle?.[indicator]?.highest?.width ?? 1,
        lineStyle: indicatorStyle?.[indicator]?.highest?.lineStyle ?? 2,
        visible: indicatorStyle?.[indicator]?.highest?.visible ?? true,
        priceLineVisible: false,
      });

      highestSeries.setData(highest);
    }

    /* 🟢 LOWEST LINE */
    let lowestSeries = null;

    if (Array.isArray(lowest) && lowest.length) {
      lowestSeries = addSeries(indicator, LineSeries, {
        color: indicatorStyle?.[indicator]?.lowest?.color ?? "rgba(0,200,83,1)",
        lineWidth: indicatorStyle?.[indicator]?.lowest?.width ?? 1,
        lineStyle: indicatorStyle?.[indicator]?.lowest?.lineStyle ?? 2,
        visible: indicatorStyle?.[indicator]?.lowest?.visible ?? true,
        priceLineVisible: false,
      });

      lowestSeries.setData(lowest);
    }

    indicatorSeriesRef.current[indicator] = {
      bbwLine: bbwSeries,
      highest: highestSeries,
      lowest: lowestSeries,
    };

    console.log("✅ BBW plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    group.bbwLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.bbwLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.bbwLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.bbwLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.bbwLine?.visible,
    });

    group.highest?.applyOptions({
      color: indicatorStyle?.[indicator]?.highest?.color,
      lineWidth: indicatorStyle?.[indicator]?.highest?.width,
      lineStyle: indicatorStyle?.[indicator]?.highest?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.highest?.visible,
    });

    group.lowest?.applyOptions({
      color: indicatorStyle?.[indicator]?.lowest?.color,
      lineWidth: indicatorStyle?.[indicator]?.lowest?.width,
      lineStyle: indicatorStyle?.[indicator]?.lowest?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.lowest?.visible,
    });

  }, [indicatorStyle?.[indicator]]);

  return null;
}