import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function SMAPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* ================= CREATE SMA ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.SMA) {
      Object.values(indicatorSeriesRef.current.SMA).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.SMA = null;
    }

    const groupedSeries = {};

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.SMA?.[lineName];

      const series = addSeries("SMA", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "#2196f3",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.SMA = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const smaGroup = indicatorSeriesRef.current?.SMA;
    if (!smaGroup) return;

    const smaStyle = indicatorStyle?.SMA?.sma;
    const smoothingStyle = indicatorStyle?.SMA?.smoothingMA;

    if (smaGroup.sma) {
      smaGroup.sma.applyOptions({
        color: smaStyle?.color,
        lineWidth: smaStyle?.width,
        lineStyle: smaStyle?.lineStyle ?? 0,
        visible: smaStyle?.visible,
        lastValueVisible: smaStyle?.visible,
        opacity: smaStyle?.opacity,
      });
    }

    if (smaGroup.smoothingMA) {
      smaGroup.smoothingMA.applyOptions({
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