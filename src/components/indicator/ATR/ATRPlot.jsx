import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ATRPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  /* ================= CREATE SERIES ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.ATR) {
      Object.values(indicatorSeriesRef.current.ATR).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.ATR = null;
    }

    const groupedSeries = {};

    Object.entries(result.data).forEach(([lineName, lineData]) => {
      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.ATR?.[lineName];

      const series = addSeries("ATR", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "rgba(255,152,0,1)",
        lineWidth: styleConfig?.width || 2,
        lineStyle: styleConfig?.lineStyle ?? 0,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      /* IMPORTANT: filter invalid values */
      let safeData = [];

      if (Array.isArray(lineData)) {
        safeData = lineData.filter(
          (d) => d && d.time != null && d.value != null,
        );
      }

      series.setData(safeData);

      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.ATR = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const atrGroup = indicatorSeriesRef.current?.ATR;
    if (!atrGroup) return;

    const atrStyle = indicatorStyle?.ATR?.atr;

    if (atrGroup.atr) {
      atrGroup.atr.applyOptions({
        color: atrStyle?.color,
        lineWidth: atrStyle?.width,
        lineStyle: atrStyle?.lineStyle ?? 0,
        visible: atrStyle?.visible,
        lastValueVisible: atrStyle?.visible,
      });
    }
  }, [indicatorStyle]);

  return null;
}
