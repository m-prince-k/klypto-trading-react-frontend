import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function NVIPlot({
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

    const nviData = mapSeries(result.data.nvi);
    const emaData = mapSeries(result.data.nviEma);

    const nviSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.nvi?.color ?? "rgba(41,98,255,1)",
      lineWidth: indicatorStyle?.[indicator]?.nvi?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.nvi?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.nvi?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    const emaSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.nviEma?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.[indicator]?.nviEma?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.nviEma?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.nviEma?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    nviSeries.setData(nviData);
    emaSeries.setData(emaData);

    indicatorSeriesRef.current[indicator] = {
      nvi: nviSeries,
      nviEma: emaSeries,
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    group.nvi.applyOptions({
      color: indicatorStyle?.[indicator]?.nvi?.color ?? "#2962ff",
      lineWidth: indicatorStyle?.[indicator]?.nvi?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.nvi?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.nvi?.visible ?? true,
    });

    group.nviEma.applyOptions({
      color: indicatorStyle?.[indicator]?.nviEma?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.[indicator]?.nviEma?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.nviEma?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.nviEma?.visible ?? true,
    });

  }, [indicatorStyle]);

  return null;
}