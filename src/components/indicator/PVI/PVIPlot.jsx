import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function PVIPlot({
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

    if (!result?.data) return;

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const mapSeries = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const pviData = mapSeries(result.data.pvi);
    const emaData = mapSeries(result.data.pviEma); // ✅ FIXED

    const pviSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.pvi?.color ?? "rgba(41,98,255,1)",
      lineWidth: indicatorStyle?.[indicator]?.pvi?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.pvi?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.pvi?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    const emaSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.pviEma?.color ?? "rgba(38,166,154,1)", // ✅ FIXED
      lineWidth: indicatorStyle?.[indicator]?.pviEma?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.pviEma?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.pviEma?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    pviSeries.setData(pviData);
    emaSeries.setData(emaData);

    indicatorSeriesRef.current[indicator] = {
      pvi: pviSeries,
      pviEma: emaSeries, // ✅ FIXED
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    group.pvi.applyOptions({
      color: indicatorStyle?.[indicator]?.pvi?.color ?? "#2962ff",
      lineWidth: indicatorStyle?.[indicator]?.pvi?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.pvi?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.pvi?.visible ?? true,
    });

    group.pviEma.applyOptions({
      color: indicatorStyle?.[indicator]?.pviEma?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.[indicator]?.pviEma?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.pviEma?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.pviEma?.visible ?? true,
    });

  }, [indicatorStyle]);

  return null;
}