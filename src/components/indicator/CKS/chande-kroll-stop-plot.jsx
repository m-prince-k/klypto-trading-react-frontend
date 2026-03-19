import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ChandeKrollStopPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  useEffect(() => {

    if (!result) return;

    /* 🔥 REMOVE OLD */
    if (indicatorSeriesRef.current?.CKS) {
      Object.values(indicatorSeriesRef.current.CKS).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.CKS = null;
    }

    const groupedSeries = {};

    /* ================= MAIN LINES ================= */

    Object.entries(result?.data).forEach(([lineName, lineData]) => {

      const style = indicatorStyle?.CKS?.[lineName];

      const series = addSeries("CKS", LineSeries, {
        color:
          style?.color ||
          (lineName === "longStop"
            ? "rgba(38,166,154,1)"
            : "rgba(239,83,80,1)"),
        lineWidth: style?.width || 2,
        visible: style?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

    });

    indicatorSeriesRef.current.CKS = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const cksGroup = indicatorSeriesRef.current?.CKS;
    if (!cksGroup) return;

    Object.keys(cksGroup).forEach((key) => {

      const series = cksGroup[key];
      const style = indicatorStyle?.CKS?.[key];

      if (!series || !style) return;

      series.applyOptions({
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle ?? 0,
        visible: style.visible,
        lastValueVisible: style.visible,
      });

    });

  }, [indicatorStyle]);

  return null;
}