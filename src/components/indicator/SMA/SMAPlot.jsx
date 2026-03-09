import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function SMAPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chartRef,
}) {

  /* ================= CREATE SMA ================= */

  useEffect(() => {

    if (!result) return;

    const indicator = "SMA";

    const styleConfig = indicatorStyle?.SMA?.sma;

    const series = addSeries(indicator, LineSeries, {
      color: styleConfig?.color || "#2962ff",
      lineWidth: styleConfig?.width || 2,
      visible: styleConfig?.visible ?? true,
    });

    if (!series) return;

    series.setData(result.data);

    indicatorSeriesRef.current.SMA = {
      sma: series,
    };

    console.log("Stored SMA series:", indicatorSeriesRef.current.SMA);

    /* cleanup when indicator removed */

    return () => {
      try {
        chartRef.current?.removeSeries(series);
      } catch (e) {}
    };

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const smaSeries = indicatorSeriesRef.current?.SMA?.sma;
    if (!smaSeries) return;

    const styleConfig = indicatorStyle?.SMA?.sma;

    smaSeries.applyOptions({
      color: styleConfig?.color || "#2962ff",
      lineWidth: styleConfig?.width || 2,
      visible: styleConfig?.visible ?? true,
    });

  }, [
    indicatorStyle?.SMA?.sma?.color,
    indicatorStyle?.SMA?.sma?.width,
    indicatorStyle?.SMA?.sma?.visible,
  ]);

  return null;
}