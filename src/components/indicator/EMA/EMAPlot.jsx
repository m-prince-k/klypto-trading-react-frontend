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

    /* ================= CREATE LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.EMA?.[lineName];

      const series = addSeries("EMA", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#ff9800",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.EMA = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const emaGroup = indicatorSeriesRef.current?.EMA;

    if (!emaGroup) return;

    const emaStyle = indicatorStyle?.EMA?.ema;
    const smoothingStyle = indicatorStyle?.EMA?.smoothingMA;

    /* EMA */

    if (emaGroup.ema) {
      emaGroup.ema.applyOptions({
        color: emaStyle?.color,
        lineWidth: emaStyle?.width,
        lineStyle: emaStyle?.lineStyle ?? 0,
        visible: emaStyle?.visible,
        lastValueVisible: emaStyle?.visible,
        opacity: emaStyle?.opacity,
      });
    }

    /* SMOOTHING */

    if (emaGroup.smoothingMA) {
      emaGroup.smoothingMA.applyOptions({
        color: smoothingStyle?.color,
        lineWidth: smoothingStyle?.width,
        lineStyle: smoothingStyle?.lineStyle ?? 0,
        visible: smoothingStyle?.visible,
        lastValueVisible: smoothingStyle?.visible,
        opacity: smoothingStyle?.opacity,
      });
    }

  }, [indicatorStyle]);

  return null;
}