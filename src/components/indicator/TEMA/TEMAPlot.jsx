import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function TEMAPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE TEMA ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.[indicator]) {

      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });

      indicatorSeriesRef.current[indicator] = null;
    }

    const groupedSeries = {};

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.[indicator]?.[lineName];

      const series = addSeries(indicator, LineSeries, {
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

    indicatorSeriesRef.current[indicator] = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const temaGroup = indicatorSeriesRef.current?.[indicator];
    if (!temaGroup) return;

    const style = indicatorStyle?.[indicator]?.tema;

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