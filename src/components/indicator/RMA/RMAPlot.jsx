import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function RMAPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const rma = result?.data?.rma;

    if (!Array.isArray(rma) || rma.length === 0) {
      console.log("❌ RMA not plotting", result);
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.RMA) {
      Object.values(indicatorSeriesRef.current.RMA).forEach((s) => {
        try { s.setData([]); } catch {}
      });
      indicatorSeriesRef.current.RMA = null;
    }

    /* 🔵 RMA LINE */
    const rmaSeries = addSeries("RMA", LineSeries, {
      color: indicatorStyle?.RMA?.rmaLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.RMA?.rmaLine?.width ?? 2,
      lineStyle: indicatorStyle?.RMA?.rmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.RMA?.rmaLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    rmaSeries.setData(rma);

    indicatorSeriesRef.current.RMA = {
      rmaLine: rmaSeries,
    };

    console.log("✅ RMA plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.RMA;
    if (!group) return;

    group.rmaLine?.applyOptions({
      color: indicatorStyle?.RMA?.rmaLine?.color,
      lineWidth: indicatorStyle?.RMA?.rmaLine?.width,
      lineStyle: indicatorStyle?.RMA?.rmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.RMA?.rmaLine?.visible,
    });

  }, [indicatorStyle?.RMA]);

  return null;
}