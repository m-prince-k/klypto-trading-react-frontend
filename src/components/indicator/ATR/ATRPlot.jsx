import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ATRPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ===== CREATE SERIES ===== */

  useEffect(() => {

    if (!result?.data) return;

    if (indicatorSeriesRef.current?.ATR?.atr) {
      try {
        indicatorSeriesRef.current.ATR.atr.setData([]);
      } catch {}
    }

    const atrStyle = indicatorStyle?.ATR?.atr;

    const series = addSeries("ATR", LineSeries, {
      color: atrStyle?.color || "rgba(0,0,0,1)",
      lineWidth: atrStyle?.width || 2,
      lineStyle: atrStyle?.lineStyle ?? 0,
      visible: atrStyle?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    if (!series) return;

    const safeData = (result.data || []).filter(
      (d) => d && d.time != null && d.value != null
    );

    series.setData(safeData);

    indicatorSeriesRef.current.ATR = {
      atr: series,
    };

  }, [result]);


  /* ===== STYLE UPDATE ===== */

  useEffect(() => {

    const atrSeries = indicatorSeriesRef.current?.ATR?.atr;
    if (!atrSeries) return;

    const atrStyle = indicatorStyle?.ATR?.atr;

    atrSeries.applyOptions({
      color: atrStyle?.color,
      lineWidth: atrStyle?.width,
      lineStyle: atrStyle?.lineStyle ?? 0,
      visible: atrStyle?.visible,
    });

  }, [indicatorStyle]);

  return null;
}