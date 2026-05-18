import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function HVPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
  chart
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    if (!result?.data?.hv) return;

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const hvData = (result.data.hv || [])
      .map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }))
      .filter((d) => !isNaN(d.value));

    /* 🔥 HV LINE */

    const hvSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.hv?.color ?? "rgba(255,152,0,1)",
      lineWidth: Number(indicatorStyle?.[indicator]?.hv?.width ?? 2),
      lineStyle: indicatorStyle?.[indicator]?.hv?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.hv?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    hvSeries.setData(hvData);

    // 🔥 IMPORTANT: STORE AS "hv" (NOT hvLine)
    indicatorSeriesRef.current[indicator] = {
      hv: hvSeries,
      hvData,
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    const style = indicatorStyle?.[indicator];
    if (!style) return;

    // 🔥 APPLY STYLE CORRECTLY
    group.hv?.applyOptions({
      color: style.hv?.color ?? "rgba(255,152,0,1)",
      lineWidth: Number(style.hv?.width ?? 2),
      lineStyle: style.hv?.lineStyle ?? 0,
      visible: style.hv?.visible ?? true,
    });

  }, [indicatorStyle?.[indicator]]);

  return null;
}