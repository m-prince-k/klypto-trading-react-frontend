import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function HVPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    if (!result?.data?.hv) return;

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.HV) {
      Object.values(indicatorSeriesRef.current.HV).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.HV = null;
    }

    const hvData = (result.data.hv || [])
      .map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }))
      .filter((d) => !isNaN(d.value));

    /* 🔥 HV LINE */

    const hvSeries = addSeries("HV", LineSeries, {
      color: indicatorStyle?.HV?.hv?.color ?? "rgba(255,152,0,1)",
      lineWidth: Number(indicatorStyle?.HV?.hv?.width ?? 2),
      lineStyle: indicatorStyle?.HV?.hv?.lineStyle ?? 0,
      visible: indicatorStyle?.HV?.hv?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    hvSeries.setData(hvData);

    // 🔥 IMPORTANT: STORE AS "hv" (NOT hvLine)
    indicatorSeriesRef.current.HV = {
      hv: hvSeries,
      hvData,
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.HV;
    if (!group) return;

    const style = indicatorStyle?.HV;
    if (!style) return;

    // 🔥 APPLY STYLE CORRECTLY
    group.hv?.applyOptions({
      color: style.hv?.color ?? "rgba(255,152,0,1)",
      lineWidth: Number(style.hv?.width ?? 2),
      lineStyle: style.hv?.lineStyle ?? 0,
      visible: style.hv?.visible ?? true,
    });

  }, [indicatorStyle?.HV]);

  return null;
}