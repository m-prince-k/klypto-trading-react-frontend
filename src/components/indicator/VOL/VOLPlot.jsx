import { useEffect } from "react";
import { HistogramSeries, LineSeries } from "lightweight-charts";

export default function VOLPlot({
  result,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {

  useEffect(() => {
    if (!result?.data?.volume?.length) return;

    /* CLEAR OLD */
    if (indicatorSeriesRef.current?.VOL) {
      Object.values(indicatorSeriesRef.current.VOL).forEach((s) => {
        try { s?.setData([]); } catch {}
      });
      indicatorSeriesRef.current.VOL = null;
    }

    const grouped = {};

    /* 🔥 HISTOGRAM */
    const volumeSeries = addSeries("volume", HistogramSeries, {
      priceFormat: { type: "volume" },
      color: "rgba(38,166,154,1)",
    });

    volumeSeries.setData(result.data.volume);
    grouped.volume = volumeSeries;

    /* 🔥 MA LINE */
    if (result.data.volumeMA?.length) {
      const maSeries = addSeries("volume", LineSeries, {
        color: indicatorStyle?.VOL?.volumeMA?.color || "rgba(255,193,7,1)",
        lineWidth: 2,
      });

      maSeries.setData(result.data.volumeMA);
      grouped.volumeMA = maSeries;
    }

    indicatorSeriesRef.current.VOL = grouped;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.VOL;
    if (!g) return;

    g.volume?.applyOptions({
      color: indicatorStyle?.VOL?.volume?.color,
    });

    g.volumeMA?.applyOptions({
      color: indicatorStyle?.VOL?.volumeMA?.color,
      lineWidth: indicatorStyle?.VOL?.volumeMA?.width,
    });

  }, [indicatorStyle]);

  return null;
}