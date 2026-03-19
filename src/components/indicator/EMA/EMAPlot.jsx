import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function EOMPlot({
  result,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {
  /* ================= CREATE ================= */

  useEffect(() => {
    console.log("EOM RESULT:", result);

    if (!result?.data?.eom?.length) return;

    /* REMOVE OLD */
    if (indicatorSeriesRef.current?.EOM?.eom) {
      try {
        indicatorSeriesRef.current.EOM.eom.setData([]);
      } catch {}
    }

    /* 🔥 MAIN CHART */
    const eomSeries = addSeries("price", LineSeries, {
      color: indicatorStyle?.EOM?.eom?.color || "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.EOM?.eom?.width || 2,
      lineStyle: indicatorStyle?.EOM?.eom?.lineStyle ?? 0,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    if (!eomSeries) {
      console.log("❌ EOM series not created");
      return;
    }

    eomSeries.setData(result.data.eom);

    console.log("✅ EOM plotted");

    indicatorSeriesRef.current.EOM = {
      eom: eomSeries,
    };
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const eomGroup = indicatorSeriesRef.current?.EOM;
    if (!eomGroup?.eom) return;

    const style = indicatorStyle?.EOM?.eom;

    eomGroup.eom.applyOptions({
      color: style?.color,
      lineWidth: style?.width,
      lineStyle: style?.lineStyle ?? 0,
      visible: style?.visible,
    });

  }, [indicatorStyle]);

  return null;
}