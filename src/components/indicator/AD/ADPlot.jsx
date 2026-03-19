import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ADPlot({
  result,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {
    if (!result?.data?.ad?.length) return;

    /* REMOVE OLD */
    if (indicatorSeriesRef.current?.AD?.ad) {
      try {
        indicatorSeriesRef.current.AD.ad.setData([]);
      } catch {}
    }

    /* 🔥 MAIN CHART (PLAIN CHART) */
    const adSeries = addSeries("price", LineSeries, {
      color: indicatorStyle?.AD?.ad?.color || "rgba(33, 150, 243, 1)",
      lineWidth: indicatorStyle?.AD?.ad?.width || 2,
      lineStyle: indicatorStyle?.AD?.ad?.lineStyle ?? 0,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    if (!adSeries) return;

    adSeries.setData(result.data.ad);

    indicatorSeriesRef.current.AD = {
      ad: adSeries,
    };

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const adGroup = indicatorSeriesRef.current?.AD;
    if (!adGroup?.ad) return;

    const style = indicatorStyle?.AD?.ad;

    adGroup.ad.applyOptions({
      color: style?.color,
      lineWidth: style?.width,
      lineStyle: style?.lineStyle ?? 0,
      visible: style?.visible,
    });

  }, [indicatorStyle]);

  return null;
}