import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function KVOPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE KO ================= */

  useEffect(() => {

    if (!result?.data) return;

    /* REMOVE OLD */

    if (indicatorSeriesRef.current?.KO) {

      Object.values(indicatorSeriesRef.current.KO).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.KO = null;
    }

    const grouped = {};

    Object.entries(result.data || {}).forEach(([lineName, lineData]) => {

      if (!Array.isArray(lineData)) return;

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.KO?.[lineName];

      const series = addSeries("KO", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#2962ff",
        lineWidth: styleConfig?.width || 2,
        lineStyle: styleConfig?.lineStyle ?? 0,
        visible: styleConfig?.visible ?? true,
        priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
        title: rowConfig?.label || lineName,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      grouped[lineName] = series;
    });

    indicatorSeriesRef.current.KO = {
      ...grouped,
      result,
    };

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const koGroup = indicatorSeriesRef.current?.KO;
    if (!koGroup) return;

    const styles = indicatorStyle?.KO;

    ["ko", "signal"].forEach((key) => {

      if (!koGroup[key]) return;

      const s = styles?.[key];

      koGroup[key].applyOptions({
        color: s?.color,
        lineWidth: s?.width,
        lineStyle: s?.lineStyle ?? 0,
        visible: s?.visible,
        lastValueVisible: s?.visible,
      });

    });

  }, [indicatorStyle]);

  return null;
}