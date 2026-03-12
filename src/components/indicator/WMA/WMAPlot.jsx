import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function WMAPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chartRef,
}) {

  /* ================= CREATE WMA ================= */

  useEffect(() => {

    if (!result) return;

    const indicator = "WMA";
    const styleConfig = indicatorStyle?.WMA?.wma;

    let series = indicatorSeriesRef.current?.WMA?.wma;

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

    indicatorSeriesRef.current.WMA = {
      ...indicatorSeriesRef.current.WMA,
      wma: series,
    };

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const wmaSeries = indicatorSeriesRef.current?.WMA?.wma;
    if (!wmaSeries) return;

    const styleConfig = indicatorStyle?.WMA?.wma;

    wmaSeries.applyOptions({
      color: styleConfig?.color,
      lineWidth: styleConfig?.width || 2,
      lineStyle: styleConfig?.lineStyle ?? 0,
      visible: styleConfig?.visible ?? true,
    });

  }, [
    indicatorStyle?.WMA?.wma?.color,
    indicatorStyle?.WMA?.wma?.width,
    indicatorStyle?.WMA?.wma?.visible,
    indicatorStyle?.WMA?.wma?.lineStyle,
  ]);

  return null;
}