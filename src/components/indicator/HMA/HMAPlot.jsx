import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function HMAPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* ================= CREATE HMA ================= */

  useEffect(() => {

    if (!result) return;

    /* REMOVE OLD HMA */

    if (indicatorSeriesRef.current?.HMA) {

      Object.values(indicatorSeriesRef.current.HMA).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.HMA = null;
    }

    const groupedSeries = {};

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.HMA?.[lineName];

      const series = addSeries("HMA", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#673ab7",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.HMA = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const hmaGroup = indicatorSeriesRef.current?.HMA;
    if (!hmaGroup) return;

    const style = indicatorStyle?.HMA?.hma;

    if (hmaGroup.hma) {
      hmaGroup.hma.applyOptions({
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