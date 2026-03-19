import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ADPlot({
  result,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {

  useEffect(() => {
    if (!result?.data?.length) return;

    /* CLEAR OLD */
    if (indicatorSeriesRef.current?.AD?.ad) {
      try {
        indicatorSeriesRef.current.AD.ad.setData([]);
      } catch {}
    }

    /* 🔥 CREATE LINE */
    const adSeries = addSeries("price", LineSeries, {
      color:
        indicatorStyle?.AD?.ad?.color ||
        "rgba(156,39,176,1)",
      lineWidth:
        indicatorStyle?.AD?.ad?.width || 2,
      lineStyle:
        indicatorStyle?.AD?.ad?.lineStyle ?? 0,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    adSeries.setData(result.data);

    indicatorSeriesRef.current.AD = {
      ad: adSeries,
    };

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.AD;
    if (!g?.ad) return;

    g.ad.applyOptions({
      color: indicatorStyle?.AD?.ad?.color,
      lineWidth: indicatorStyle?.AD?.ad?.width,
      lineStyle: indicatorStyle?.AD?.ad?.lineStyle ?? 0,
      visible: indicatorStyle?.AD?.ad?.visible,
    });

  }, [indicatorStyle]);

  return null;
}