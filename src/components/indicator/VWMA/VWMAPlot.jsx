import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function VWMAPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const vwma = result?.data?.vwma;

    if (!Array.isArray(vwma) || vwma.length === 0) {
      console.log("❌ VWMA not plotting", result);
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

    /* 🔵 VWMA LINE */
    const vwmaSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.vwmaLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.[indicator]?.vwmaLine?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.vwmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.vwmaLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    vwmaSeries.setData(vwma);

    indicatorSeriesRef.current[indicator] = {
      vwmaLine: vwmaSeries,
    };

    console.log("✅ VWMA plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    group.vwmaLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.vwmaLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.vwmaLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.vwmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.vwmaLine?.visible,
    });

  }, [indicatorStyle?.[indicator]]);

  return null;
}