import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function KAMAPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* ================= CREATE KAMA ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.KAMA) {

      Object.values(indicatorSeriesRef.current.KAMA).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.KAMA = null;
    }

    const groupedSeries = {};

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.KAMA?.[lineName];

      const series = addSeries("KAMA", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#03a9f4",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.KAMA = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const kamaGroup = indicatorSeriesRef.current?.KAMA;
    if (!kamaGroup) return;

    const style = indicatorStyle?.KAMA?.kama;

    if (kamaGroup.kama) {
      kamaGroup.kama.applyOptions({
        color: style?.color,
        lineWidth: style?.width,
        lineStyle: style?.lineStyle ?? 0,
        visible: style?.visible,
        lastValueVisible: style?.visible,
        opacity: style?.opacity,
      });
    }

  }, [indicatorStyle]);

  return null;
}