import { useEffect } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

export default function OBVPlot({
  result,
  rows,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {

  useEffect(() => {
    if (!result?.data?.obv?.length) return;

    /* CLEAR OLD */
    if (indicatorSeriesRef.current?.OBV) {
      Object.values(indicatorSeriesRef.current.OBV).forEach((s) => {
        try { s?.setData([]); } catch {}
      });
      indicatorSeriesRef.current.OBV = null;
    }

    const grouped = {};

    /* ================= OBV ================= */
    const obvSeries = addSeries("price", LineSeries, {
      color: indicatorStyle?.OBV?.obv?.color || "rgba(255,77,79,1)",
      lineWidth: indicatorStyle?.OBV?.obv?.width || 2,
    });

    obvSeries.setData(result.data.obv);
    grouped.obv = obvSeries;

    /* ================= MA ================= */
    if (result.data.smoothingMA?.length) {
      const maSeries = addSeries("price", LineSeries, {
        color: indicatorStyle?.OBV?.smoothingMA?.color || "rgba(250,173,20,1)",
        lineWidth: indicatorStyle?.OBV?.smoothingMA?.width || 2,
      });

      maSeries.setData(result.data.smoothingMA);
      grouped.smoothingMA = maSeries;
    }

    /* ================= BB ================= */
    if (result.data.bbUpper?.length && result.data.bbLower?.length) {

      const upperSeries = addSeries("price", LineSeries, {
        color: "rgba(82,196,26,1)",
        lineWidth: 1,
      });

      const lowerSeries = addSeries("price", LineSeries, {
        color: "rgba(255,120,117,1)",
        lineWidth: 1,
      });

      upperSeries.setData(result.data.bbUpper);
      lowerSeries.setData(result.data.bbLower);

      grouped.bbUpper = upperSeries;
      grouped.bbLower = lowerSeries;

      /* 🔥 REAL BB FILL (AREA BETWEEN) */
      const areaSeries = addSeries("price", AreaSeries, {
        topColor: "rgba(82,196,26,0.2)",
        bottomColor: "rgba(255,120,117,0.2)",
        lineColor: "transparent",
      });

      const fillData = result.data.bbUpper.map((u, i) => ({
        time: u.time,
        value: u.value,
      }));

      areaSeries.setData(fillData);

      grouped.bbFill = areaSeries;
    }

    indicatorSeriesRef.current.OBV = grouped;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.OBV;
    if (!g) return;

    Object.keys(g).forEach((key) => {
      const style = indicatorStyle?.OBV?.[key];

      g[key]?.applyOptions({
        color: style?.color,
        lineWidth: style?.width,
        visible: style?.visible,
      });
    });

  }, [indicatorStyle]);

  return null;
}