import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function HVPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  useEffect(() => {
    if (!result?.data?.hv) return;

    // REMOVE OLD
    if (indicatorSeriesRef.current?.HV) {
      Object.values(indicatorSeriesRef.current.HV).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.HV = null;
    }

    const hvData = result.data.hv;

    if (!hvData.length) return;

    // CREATE SERIES
    const hvSeries = addSeries("HV-hv", LineSeries, {
      color: indicatorStyle?.HV?.hv?.color || "#ff9800",
      lineWidth: indicatorStyle?.HV?.hv?.width || 2,
      lineStyle: indicatorStyle?.HV?.hv?.lineStyle || 0,
      visible: indicatorStyle?.HV?.hv?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    hvSeries.setData(hvData);

    indicatorSeriesRef.current.HV = {
      hv: hvSeries,
    };

  }, [result, addSeries, indicatorStyle]);

  // 🔥 STYLE UPDATE (live change)
  useEffect(() => {
    const hvGroup = indicatorSeriesRef.current?.HV;
    if (!hvGroup) return;

    const series = hvGroup.hv;
    const style = indicatorStyle?.HV?.hv;

    if (!series || !style) return;

    series.applyOptions({
      color: style.color,
      lineWidth: style.width,
      lineStyle: style.lineStyle ?? 0,
      visible: style.visible,
    });

  }, [indicatorStyle]);

  return null;
}