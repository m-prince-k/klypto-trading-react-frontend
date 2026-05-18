import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ADPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {
  useEffect(() => {
    // ✅ Get AD data
    const adData = result?.data ?? [];


    // 🔥 Remove previous series
    if (indicatorSeriesRef.current?.[indicator]?.ad) {
      try {
        indicatorSeriesRef.current[indicator].ad.setData([]);
      } catch {}
      indicatorSeriesRef.current[indicator] = null;
    }

    // 🔹 Get style
    const style = indicatorStyle?.[indicator]?.ad;

    // 🔹 Add LineSeries
    const adSeries = addSeries(indicator, LineSeries, {
      color: style?.color ?? "rgba(156,39,176,1)",
      lineWidth: style?.width ?? 2,
      lineStyle: style?.lineStyle ?? 0,
      visible: style?.visible ?? true,
      priceLineVisible: false,
    });

    // 🔹 Set the data
    adSeries.setData(adData);

    // 🔹 Store reference
    indicatorSeriesRef.current[indicator] = {
      ad: adSeries,
      result,
      adData,
    };

    console.log("✅ AD plotted successfully", adData.length);
  }, [result]);

  // ================= STYLE UPDATE =================
  useEffect(() => {
    const g = indicatorSeriesRef.current?.[indicator];
    if (!g) return;

    const style = indicatorStyle?.[indicator]?.ad;
    if (!style) return;

    g.ad?.applyOptions({
      color: style.color,
      lineWidth: style.width,
      lineStyle: style.lineStyle,
      visible: style.visible,
    });
  }, [indicatorStyle?.[indicator]]);

  return null;
}