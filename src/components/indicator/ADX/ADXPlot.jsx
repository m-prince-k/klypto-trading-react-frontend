import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ADXPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE ADX ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.ADX) {

      Object.values(indicatorSeriesRef.current.ADX).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.ADX = null;
    }

    const groupedSeries = {};

    const adxData = result.data.adx || [];

    const styleConfig = indicatorStyle?.ADX?.adx;

    const series = addSeries("ADX", LineSeries, {

      color: styleConfig?.color || "rgb(255,152,0)",

      lineWidth: styleConfig?.width || 2,

      lineStyle: styleConfig?.lineStyle ?? 0,

      visible: styleConfig?.visible ?? true,

      priceLineVisible: false,

      lastValueVisible: true,
    });

    if (!series) return;

    series.setData(adxData);

    groupedSeries.adx = series;

    indicatorSeriesRef.current.ADX = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const adxGroup = indicatorSeriesRef.current?.ADX;
    if (!adxGroup) return;

    const style = indicatorStyle?.ADX?.adx;

    adxGroup.adx?.applyOptions({

      color: style?.color,

      lineWidth: style?.width,

      lineStyle: style?.lineStyle ?? 0,

      visible: style?.visible,

      opacity: style?.opacity,

    });

  }, [indicatorStyle]);

  return null;

}