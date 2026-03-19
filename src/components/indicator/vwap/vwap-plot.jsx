import { useEffect } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

export default function VWAPPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  useEffect(() => {

    if (!result) return;

    /* 🔥 REMOVE OLD */
    if (indicatorSeriesRef.current?.VWAP) {
      Object.values(indicatorSeriesRef.current.VWAP).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.VWAP = null;
    }

    const groupedSeries = {};
    let vwapData = [];

    /* ================= MAIN LINES ================= */

    Object.entries(result?.data || {}).forEach(([lineName, lineData]) => {

      // ✅ FIX: ensure array
      if (!Array.isArray(lineData)) return;

      const style = indicatorStyle?.VWAP?.[lineName];

      const series = addSeries("VWAP", LineSeries, {
        color:
          style?.color ||
          (lineName === "vwap"
            ? "rgba(0,140,255,1)"
            : lineName === "upperBand"
            ? "rgba(38,166,154,1)"
            : "rgba(239,83,80,1)"),
        lineWidth: style?.width || 2,
        visible: style?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      // ✅ FIX: clean + sort
      const cleanData = lineData
        .filter(d => d && d.time != null && d.value != null && !isNaN(d.value))
        .sort((a, b) => a.time - b.time);

      series.setData(cleanData);

      groupedSeries[lineName] = series;

      if (lineName === "vwap") vwapData = cleanData;

    });

    /* ================= BAND FILL ================= */

    if (
      groupedSeries.upperBand &&
      groupedSeries.lowerBand &&
      indicatorStyle?.VWAP?.bandFill?.visible
    ) {

      const fillSeries = addSeries("VWAP", AreaSeries, {
        topColor: indicatorStyle?.VWAP?.bandFill?.topColor,
        bottomColor: indicatorStyle?.VWAP?.bandFill?.bottomColor,
        lineColor: "transparent",
        priceLineVisible: false,
        lastValueVisible: false,
      });

      if (vwapData.length) {
        fillSeries.setData(vwapData);
      }

      groupedSeries.bandFill = fillSeries;
    }

    groupedSeries.vwapData = vwapData;

    indicatorSeriesRef.current.VWAP = groupedSeries;

  }, [result]);


  useEffect(() => {

    const vwapGroup = indicatorSeriesRef.current?.VWAP;
    if (!vwapGroup) return;

    Object.keys(vwapGroup).forEach((key) => {

      const series = vwapGroup[key];
      const style = indicatorStyle?.VWAP?.[key];

      if (!series || !style) return;
      if (key === "vwapData") return;

      series.applyOptions({
        color: style?.color,
        lineWidth: style?.width,
        lineStyle: style?.lineStyle ?? 0,
        visible: style?.visible,
      });

    });

  }, [indicatorStyle]);

  return null;
}