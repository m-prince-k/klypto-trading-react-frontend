import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function WMAPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE WMA ================= */

  useEffect(() => {

    if (!result) return;

    /* REMOVE OLD WMA */

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
        color: styleConfig?.color || rowConfig?.color || "#9c27b0",
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

    const wmaGroup = indicatorSeriesRef.current?.[indicator];
    if (!wmaGroup) return;

    const style = indicatorStyle?.[indicator]?.wma;

    if (wmaGroup.wma) {
      wmaGroup.wma.applyOptions({
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