import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function TMAPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const tma = result?.data?.tma;

    if (!Array.isArray(tma) || tma.length === 0) {
      console.log("❌ TMA not plotting", result);
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

    /* 🔵 TMA LINE */
    const tmaSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.tmaLine?.color ?? "rgba(156,39,176,1)", // purple default
      lineWidth: indicatorStyle?.[indicator]?.tmaLine?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.tmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.tmaLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    tmaSeries.setData(tma);

    indicatorSeriesRef.current[indicator] = {
      tmaLine: tmaSeries,
    };

    console.log("✅ TMA plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    group.tmaLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.tmaLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.tmaLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.tmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.tmaLine?.visible,
    });

  }, [indicatorStyle?.[indicator]]);

  return null;
}