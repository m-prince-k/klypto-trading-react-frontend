import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function BollingerBandWidthPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE BBW ================= */

  useEffect(() => {

    if (!result) return;

    /* 🔥 REMOVE OLD SERIES */
    if (indicatorSeriesRef.current?.BBW) {
      Object.values(indicatorSeriesRef.current.BBW).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.BBW = null;
    }

    const groupedSeries = {};

    /* ================= MAIN LINES ================= */

    Object.entries(result?.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.BBW?.[lineName];

      const series = addSeries("BBW", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "rgba(41,98,255,1)",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

    });

    /* ⭐ STORE DATA */
    indicatorSeriesRef.current.BBW = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const bbwGroup = indicatorSeriesRef.current?.BBW;
    if (!bbwGroup) return;

    const bbwStyle = indicatorStyle?.BBW;

    /* ================= UPDATE ALL LINES ================= */

    Object.keys(bbwGroup).forEach((key) => {

      const series = bbwGroup[key];
      const style = bbwStyle?.[key];

      if (!series || !style) return;

      series.applyOptions({
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle ?? 0,
        visible: style.visible,
        lastValueVisible: style.visible,
      });
    });

  }, [indicatorStyle]);

  return null;
}