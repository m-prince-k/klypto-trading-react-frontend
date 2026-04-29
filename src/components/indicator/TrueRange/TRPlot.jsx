import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function TRPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const tr = result?.data?.tr;

    if (!Array.isArray(tr) || tr.length === 0) {
      console.log("❌ TR not plotting", result);
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.TR) {
      Object.values(indicatorSeriesRef.current.TR).forEach((s) => {
        try { s.setData([]); } catch {}
      });
      indicatorSeriesRef.current.TR = null;
    }

    /* 🔵 TR LINE */
    const trSeries = addSeries("TR", LineSeries, {
      color: indicatorStyle?.TR?.trLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.TR?.trLine?.width ?? 2,
      lineStyle: indicatorStyle?.TR?.trLine?.lineStyle ?? 0,
      visible: indicatorStyle?.TR?.trLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    trSeries.setData(tr);

    indicatorSeriesRef.current.TR = {
      trLine: trSeries,
    };

    console.log("✅ TR plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.TR;
    if (!group) return;

    group.trLine?.applyOptions({
      color: indicatorStyle?.TR?.trLine?.color,
      lineWidth: indicatorStyle?.TR?.trLine?.width,
      lineStyle: indicatorStyle?.TR?.trLine?.lineStyle ?? 0,
      visible: indicatorStyle?.TR?.trLine?.visible,
    });

  }, [indicatorStyle?.TR]);

  return null;
}