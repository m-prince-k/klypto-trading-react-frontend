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
  /* ================= BB ================= */
if (result.data.bbUpper?.length && result.data.bbLower?.length) {

  const upperData = result.data.bbUpper;
  const lowerData = result.data.bbLower;

  // ✅ Upper Line
  const upperSeries = addSeries("price", LineSeries, {
    color: "rgba(82,196,26,1)",
    lineWidth: 1,
  });

  // ✅ Lower Line
  const lowerSeries = addSeries("price", LineSeries, {
    color: "rgba(255,120,117,1)",
    lineWidth: 1,
  });

  upperSeries.setData(upperData);
  lowerSeries.setData(lowerData);

  grouped.bbUpper = upperSeries;
  grouped.bbLower = lowerSeries;

  /* ✅ CORRECT AREA FILL (NO OVERFLOW) */
  const areaSeries = addSeries("price", AreaSeries, {
    topColor: "rgba(82,196,26,0.2)",
    bottomColor: "rgba(82,196,26,0.2)",
    lineColor: "transparent",
    baseLineVisible: false,
  });

  // 🔥 KEY FIX: midpoint use karo (center line)
  const fillData = upperData.map((u, i) => {
    const l = lowerData[i];
    const mid = (u.value + l.value) / 2;

    return {
      time: u.time,
      value: mid,
    };
  });

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