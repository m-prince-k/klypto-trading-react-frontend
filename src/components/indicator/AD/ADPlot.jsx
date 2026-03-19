import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ADPlot({
  chart, // 🔥 PASS chart instance directly
  result,
  indicatorStyle,
  indicatorSeriesRef,
}) {

  /* ================= CREATE AD ================= */
  useEffect(() => {

    if (!chart || !result?.data?.ad) return;

    // 🔥 Remove old series
    if (indicatorSeriesRef.current?.AD) {
      try {
        chart.removeSeries(indicatorSeriesRef.current.AD);
      } catch {}
      indicatorSeriesRef.current.AD = null;
    }

    const style = indicatorStyle?.AD?.ad;

    // 🔥 Create series on NEW PANE
    const adSeries = chart.addSeries(LineSeries, {
      color: style?.color || "#FFC107",
      lineWidth: style?.width || 2,
      lineStyle: style?.lineStyle ?? 0,
      priceLineVisible: false,
      lastValueVisible: true,
    }, 1); // 👈 🔥 THIS CREATES SEPARATE PANE (paneIndex = 1)

    // 🔥 Clean data
    const cleanData = result.data.ad
      .filter(d =>
        d &&
        d.time != null &&
        d.value != null &&
        !isNaN(d.value)
      )
      .map(d => ({
        time: Number(d.time),   // MUST be number (seconds)
        value: Number(d.value),
      }))
      .sort((a, b) => a.time - b.time);

    // 🔥 Apply data
    adSeries.setData(cleanData);

    // 🔥 Autoscale fix (important for indicators)
    adSeries.priceScale().applyOptions({
      autoScale: true,
      scaleMargins: {
        top: 0.2,
        bottom: 0.2,
      },
    });

    indicatorSeriesRef.current.AD = adSeries;

  }, [chart, result]);


  /* ================= STYLE UPDATE ================= */
  useEffect(() => {

    const series = indicatorSeriesRef.current?.AD;
    if (!series) return;

    const style = indicatorStyle?.AD?.ad;
    if (!style) return;

    series.applyOptions({
      color: style.color,
      lineWidth: style.width,
      lineStyle: style.lineStyle ?? 0,
      visible: style.visible,
    });

  }, [indicatorStyle]);


  return null;
}