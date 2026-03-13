import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function DEMAPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* ================= CREATE DEMA ================= */

  useEffect(() => {

    if (!result) return;

    /* REMOVE OLD DEMA */

    if (indicatorSeriesRef.current?.DEMA) {

      Object.values(indicatorSeriesRef.current.DEMA).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.DEMA = null;
    }

    const groupedSeries = {};

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.DEMA?.[lineName];

      const series = addSeries("DEMA", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#ff5722",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.DEMA = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const demaGroup = indicatorSeriesRef.current?.DEMA;
    if (!demaGroup) return;

    const style = indicatorStyle?.DEMA?.dema;

    if (demaGroup.dema) {
      demaGroup.dema.applyOptions({
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