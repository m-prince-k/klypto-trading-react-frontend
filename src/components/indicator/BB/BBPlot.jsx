import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function BBPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const upper = result?.data?.upper;
    const lower = result?.data?.lower;
    const basis = result?.data?.basis;

    if (!Array.isArray(upper) || !upper.length) {
      console.log("❌ BB not plotting", result);
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.BB) {
      Object.values(indicatorSeriesRef.current.BB).forEach((s) => {
        try { s.setData([]); } catch {}
      });
      indicatorSeriesRef.current.BB = null;
    }

    /* 🔴 UPPER */
    const upperSeries = addSeries("BB", LineSeries, {
      color: indicatorStyle?.BB?.upper?.color,
      lineWidth: indicatorStyle?.BB?.upper?.width,
      lineStyle: indicatorStyle?.BB?.upper?.lineStyle ?? 0,
      visible: indicatorStyle?.BB?.upper?.visible,
      priceLineVisible: false,
    });

    /* 🔵 LOWER */
    const lowerSeries = addSeries("BB", LineSeries, {
      color: indicatorStyle?.BB?.lower?.color,
      lineWidth: indicatorStyle?.BB?.lower?.width,
      lineStyle: indicatorStyle?.BB?.lower?.lineStyle ?? 0,
      visible: indicatorStyle?.BB?.lower?.visible,
      priceLineVisible: false,
    });

    /* 🟡 BASIS */
    const basisSeries = addSeries("BB", LineSeries, {
      color: indicatorStyle?.BB?.basis?.color,
      lineWidth: indicatorStyle?.BB?.basis?.width,
      lineStyle: indicatorStyle?.BB?.basis?.lineStyle ?? 2,
      visible: indicatorStyle?.BB?.basis?.visible,
      priceLineVisible: false,
    });

    upperSeries.setData(upper);
    lowerSeries.setData(lower);
    basisSeries.setData(basis);

    indicatorSeriesRef.current.BB = {
      upper: upperSeries,
      lower: lowerSeries,
      basis: basisSeries,
    };

    console.log("✅ BB plotted");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const g = indicatorSeriesRef.current?.BB;
    if (!g) return;

    g.upper?.applyOptions({
      color: indicatorStyle?.BB?.upper?.color,
      lineWidth: indicatorStyle?.BB?.upper?.width,
      lineStyle: indicatorStyle?.BB?.upper?.lineStyle,
      visible: indicatorStyle?.BB?.upper?.visible,
    });

    g.lower?.applyOptions({
      color: indicatorStyle?.BB?.lower?.color,
      lineWidth: indicatorStyle?.BB?.lower?.width,
      lineStyle: indicatorStyle?.BB?.lower?.lineStyle,
      visible: indicatorStyle?.BB?.lower?.visible,
    });

    g.basis?.applyOptions({
      color: indicatorStyle?.BB?.basis?.color,
      lineWidth: indicatorStyle?.BB?.basis?.width,
      lineStyle: indicatorStyle?.BB?.basis?.lineStyle,
      visible: indicatorStyle?.BB?.basis?.visible,
    });

  }, [indicatorStyle?.BB]);

  return null;
}