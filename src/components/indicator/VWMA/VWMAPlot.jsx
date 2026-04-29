import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function VWMAPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const vwma = result?.data?.vwma;

    if (!Array.isArray(vwma) || vwma.length === 0) {
      console.log("❌ VWMA not plotting", result);
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.VWMA) {
      Object.values(indicatorSeriesRef.current.VWMA).forEach((s) => {
        try { s.setData([]); } catch {}
      });
      indicatorSeriesRef.current.VWMA = null;
    }

    /* 🔵 VWMA LINE */
    const vwmaSeries = addSeries("VWMA", LineSeries, {
      color: indicatorStyle?.VWMA?.vwmaLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.VWMA?.vwmaLine?.width ?? 2,
      lineStyle: indicatorStyle?.VWMA?.vwmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.VWMA?.vwmaLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    vwmaSeries.setData(vwma);

    indicatorSeriesRef.current.VWMA = {
      vwmaLine: vwmaSeries,
    };

    console.log("✅ VWMA plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.VWMA;
    if (!group) return;

    group.vwmaLine?.applyOptions({
      color: indicatorStyle?.VWMA?.vwmaLine?.color,
      lineWidth: indicatorStyle?.VWMA?.vwmaLine?.width,
      lineStyle: indicatorStyle?.VWMA?.vwmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.VWMA?.vwmaLine?.visible,
    });

  }, [indicatorStyle?.VWMA]);

  return null;
}