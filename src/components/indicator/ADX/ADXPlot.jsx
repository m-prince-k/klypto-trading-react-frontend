import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ADXPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE ADX ================= */

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

    const adxData = result.data.adx || [];

    const styleConfig = indicatorStyle?.[indicator]?.adx;

    const series = addSeries(indicator, LineSeries, {

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

    indicatorSeriesRef.current[indicator] = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const adxGroup = indicatorSeriesRef.current?.[indicator];
    if (!adxGroup) return;

    const style = indicatorStyle?.[indicator]?.adx;

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