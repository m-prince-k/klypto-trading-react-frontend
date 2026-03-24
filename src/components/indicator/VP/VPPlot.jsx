import { useEffect } from "react";
import { HistogramSeries, LineSeries } from "lightweight-charts";

export default function VPPlot({
  result,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {

  useEffect(() => {
    if (!result?.data?.volume?.length) {
      console.log("❌ No VP data");
      return;
    }

    console.log("✅ VP DATA:", result.data.volume);

    /* CLEAR OLD */
    if (indicatorSeriesRef.current?.VP) {
      Object.values(indicatorSeriesRef.current.VP).forEach((s) => {
        try { s?.setData([]); } catch {}
      });
    }

    const grouped = {};

    /* 🔥 HISTOGRAM (FIXED) */
    const volumeSeries = addSeries("price", HistogramSeries, {
      priceFormat: { type: "volume" },
      color: "rgba(38,166,154,1)",
      priceLineVisible: false,
    });

    volumeSeries.setData(result.data.volume);

    grouped.volume = volumeSeries;

    /* 🔥 MA LINE */
    if (result.data.volumeMA?.length) {
      const maSeries = addSeries("price", LineSeries, {
        color: "rgba(255,193,7,1)",
        lineWidth: 2,
      });

      maSeries.setData(result.data.volumeMA);
      grouped.volumeMA = maSeries;
    }

    indicatorSeriesRef.current.VP = grouped;

  }, [result]);



  /* STYLE */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.VP;
    if (!g) return;

    g.volume?.applyOptions({
      color: indicatorStyle?.VP?.volume?.color,
    });

    g.volumeMA?.applyOptions({
      color: indicatorStyle?.VP?.volumeMA?.color,
      lineWidth: indicatorStyle?.VP?.volumeMA?.width,
    });

  }, [indicatorStyle]);

  return null;
}