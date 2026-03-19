import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function EOMPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  useEffect(() => {

    if (!result?.data) return;

    if (indicatorSeriesRef.current?.EOM) {
      const s = indicatorSeriesRef.current.EOM;
      if (s?.setData) {
        try { s.setData([]); } catch {}
      }
      indicatorSeriesRef.current.EOM = null;
    }

    const eomData = (result.data || []).map((p) => ({
      time: Number(p.time),
      value: Number(p.value),
    }));

    const series = addSeries("EOM", LineSeries, {
      color: indicatorStyle?.EOM?.eom?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.EOM?.eom?.width ?? 1,
      lineStyle: indicatorStyle?.EOM?.eom?.lineStyle ?? 0,
      visible: indicatorStyle?.EOM?.eom?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    series.setData(eomData);

    indicatorSeriesRef.current.EOM = series;

  }, [result, indicatorConfigs, indicatorStyle]);

  /* ================= APPLY STYLE UPDATES ================= */

  useEffect(() => {

    const series = indicatorSeriesRef.current?.EOM;
    if (!series) return;

    series.applyOptions({
      color: indicatorStyle?.EOM?.eom?.color ?? "#26a69a",
      lineWidth: indicatorStyle?.EOM?.eom?.width ?? 1,
      lineStyle: indicatorStyle?.EOM?.eom?.lineStyle ?? 0,
      visible: indicatorStyle?.EOM?.eom?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

  }, [indicatorStyle]);

  return null;
}