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
  const styleConfig = indicatorStyle?.SMA?.ma;

  let series = indicatorSeriesRef.current?.SMA?.ma;

  /* series already exists → just update data */

  if (series) {
    series.setData(result.data);
    return;
  }

  /* create series */

  series = addSeries(indicator, LineSeries, {
    color: styleConfig?.color,
    lineWidth: styleConfig?.width || 2,
    lineStyle: styleConfig?.lineStyle ?? 0,
    visible: styleConfig?.visible ?? true,
  });

  if (!series) return;

  series.setData(result.data);

  indicatorSeriesRef.current.SMA = {
    ...indicatorSeriesRef.current.SMA,
    ma: series,
  };

}, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const smaSeries = indicatorSeriesRef.current?.SMA?.ma;
    if (!smaSeries) return;

    const styleConfig = indicatorStyle?.SMA?.ma;

    smaSeries.applyOptions({
      color: styleConfig?.color,
      lineWidth: styleConfig?.width || 2,
      lineStyle: styleConfig?.lineStyle ?? 0,
      visible: styleConfig?.visible ?? true,
    });

  }, [
    indicatorStyle?.SMA?.ma?.color,
    indicatorStyle?.SMA?.ma?.width,
    indicatorStyle?.SMA?.ma?.visible,
    indicatorStyle?.SMA?.ma?.lineStyle,
  ]);

  return null;
}