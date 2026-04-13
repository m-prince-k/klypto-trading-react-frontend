import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function TMAPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const tma = result?.data?.tma;

    if (!Array.isArray(tma) || tma.length === 0) {
      console.log("❌ TMA not plotting", result);
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.TMA) {
      Object.values(indicatorSeriesRef.current.TMA).forEach((s) => {
        try { s.setData([]); } catch {}
      });
      indicatorSeriesRef.current.TMA = null;
    }

    /* 🔵 TMA LINE */
    const tmaSeries = addSeries("TMA", LineSeries, {
      color: indicatorStyle?.TMA?.tmaLine?.color ?? "rgba(156,39,176,1)", // purple default
      lineWidth: indicatorStyle?.TMA?.tmaLine?.width ?? 2,
      lineStyle: indicatorStyle?.TMA?.tmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.TMA?.tmaLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    tmaSeries.setData(tma);

    indicatorSeriesRef.current.TMA = {
      tmaLine: tmaSeries,
    };

    console.log("✅ TMA plotted SUCCESS");

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.TMA;
    if (!group) return;

    group.tmaLine?.applyOptions({
      color: indicatorStyle?.TMA?.tmaLine?.color,
      lineWidth: indicatorStyle?.TMA?.tmaLine?.width,
      lineStyle: indicatorStyle?.TMA?.tmaLine?.lineStyle ?? 0,
      visible: indicatorStyle?.TMA?.tmaLine?.visible,
    });

  }, [indicatorStyle?.TMA]);

  return null;
}