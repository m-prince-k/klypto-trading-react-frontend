import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function EMAPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* ================= CREATE EMA ================= */

  useEffect(() => {

    if (!result) return;

    /* REMOVE OLD EMA */

    if (indicatorSeriesRef.current?.EMA) {

      Object.values(indicatorSeriesRef.current.EMA).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.EMA = null;
    }

    const groupedSeries = {};

    const emaData = result?.data || [];

    const style = indicatorStyle?.EMA?.ema ?? {};

    const emaSeries = addSeries("main", LineSeries, {
      color: style?.color || "#ff9800",
      lineWidth: style?.width || 2,
      lineStyle: style?.lineStyle ?? 0,
      visible: style?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true
    });

    if (!emaSeries) return;

    emaSeries.setData(emaData);

    groupedSeries.ema = emaSeries;

    indicatorSeriesRef.current.EMA = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const emaGroup = indicatorSeriesRef.current?.EMA;

    if (!emaGroup) return;

    const style = indicatorStyle?.EMA?.ema ?? {};

    emaGroup.ema?.applyOptions({
      color: style?.color,
      lineWidth: style?.width,
      lineStyle: style?.lineStyle ?? 0,
      visible: style?.visible,
      lastValueVisible: style?.visible,
      opacity: style?.opacity
    });

  }, [indicatorStyle]);

  return null;
}