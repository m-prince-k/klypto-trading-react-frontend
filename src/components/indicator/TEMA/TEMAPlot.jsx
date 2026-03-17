import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function TEMAPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* ================= CREATE TEMA ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.TEMA) {

      Object.values(indicatorSeriesRef.current.TEMA).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.TEMA = null;
    }

    const groupedSeries = {};

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.TEMA?.[lineName];

      const series = addSeries("TEMA", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#009688",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.TEMA = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const temaGroup = indicatorSeriesRef.current?.TEMA;
    if (!temaGroup) return;

    const style = indicatorStyle?.TEMA?.tema;

    if (temaGroup.tema) {
      temaGroup.tema.applyOptions({
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