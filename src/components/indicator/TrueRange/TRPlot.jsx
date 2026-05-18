import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function TRPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const tr = result?.data?.tr;

    if (!Array.isArray(tr) || tr.length === 0) {
      console.log("❌ TR not plotting", result);
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    /* 🔵 TR LINE */
    const trSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.trLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.[indicator]?.trLine?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.trLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.trLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    trSeries.setData(tr);

    indicatorSeriesRef.current[indicator] = {
      trLine: trSeries,
    };

    console.log("✅ TR plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    group.trLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.trLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.trLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.trLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.trLine?.visible,
    });

  }, [indicatorStyle?.[indicator]]);

  return null;
}