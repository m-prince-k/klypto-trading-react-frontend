import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function RMAPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const rma = result?.data?.rma;

    if (!Array.isArray(rma) || rma.length === 0) {
      console.log("❌ RMA not plotting", result);
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

    /* 🔵 RMA LINE */
    const rmaSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.rmaLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.[indicator]?.rmaLine?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.rmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.rmaLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    rmaSeries.setData(rma);

    indicatorSeriesRef.current[indicator] = {
      rmaLine: rmaSeries,
    };

    console.log("✅ RMA plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    group.rmaLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.rmaLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.rmaLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.rmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.rmaLine?.visible,
    });

  }, [indicatorStyle?.[indicator]]);

  return null;
}