import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function EOMPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
  chart
}) {
  /* ================= CREATE EOM SERIES ================= */

  useEffect(() => {
    if (!result?.data) return; /* remove previous series */

    if (indicatorSeriesRef.current?.[indicator]?.eom) {
      try {
        indicatorSeriesRef.current[indicator].eom.setData([]);
      } catch {}
      indicatorSeriesRef.current[indicator] = null;
    } /* format data */

    const eomData = (result.data || []).map((p) => ({
      time: Number(p.time),
      value: Number(p.value),
    })); /* create line */

    const series = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.eom?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.[indicator]?.eom?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.eom?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.eom?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    series.setData(eomData); /* IMPORTANT: store using key */

    indicatorSeriesRef.current[indicator] = {
      eom: series,
    };
  }, [
    result,
    indicatorConfigs,
  ]); /* ================= APPLY STYLE UPDATES ================= */

  useEffect(() => {
    const series = indicatorSeriesRef.current?.[indicator]?.eom;
    if (!series) return;

    series.applyOptions({
      color: indicatorStyle?.[indicator]?.eom?.color ?? "#26A69A",
      lineWidth: indicatorStyle?.[indicator]?.eom?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.eom?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.eom?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });
  }, [indicatorStyle]);

  return null;
}
