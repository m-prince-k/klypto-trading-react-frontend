import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function EOMPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE EOM SERIES ================= */

  useEffect(() => {

    if (!result?.data) return;

    /* remove previous series */

    if (indicatorSeriesRef.current?.EOM?.eom) {
      try {
        indicatorSeriesRef.current.EOM.eom.setData([]);
      } catch {}
      indicatorSeriesRef.current.EOM = null;
    }

    /* format data */

    const eomData = (result.data || []).map((p) => ({
      time: Number(p.time),
      value: Number(p.value),
    }));

    /* create line */

    const series = addSeries("EOM", LineSeries, {
      color: indicatorStyle?.EOM?.eom?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.EOM?.eom?.width ?? 1,
      lineStyle: indicatorStyle?.EOM?.eom?.lineStyle ?? 0,
      visible: indicatorStyle?.EOM?.eom?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    series.setData(eomData);

    /* IMPORTANT: store using key */

    indicatorSeriesRef.current.EOM = {
      eom: series,
    };

  }, [result, indicatorConfigs]);



  /* ================= APPLY STYLE UPDATES ================= */

  useEffect(() => {

    const series = indicatorSeriesRef.current?.EOM?.eom;
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