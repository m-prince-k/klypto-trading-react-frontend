import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function AroonPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  /* ================= CREATE AROON ================= */

  useEffect(() => {
    if (!result) return;

    /* REMOVE OLD AROON COMPLETELY */

    if (indicatorSeriesRef.current?.AROON) {
      Object.values(indicatorSeriesRef.current.AROON).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });
      indicatorSeriesRef.current.AROON = null;
    }

    const groupedSeries = {};

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {
      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.AROON?.[lineName];

      const series = addSeries("AROON", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "rgb(38,166,154)",

        lineWidth: styleConfig?.width || 1,
        lineStyle: styleConfig?.lineStyle ?? 0,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);
      groupedSeries[lineName] = series;
    });

    indicatorSeriesRef.current.AROON = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const aroonGroup = indicatorSeriesRef.current?.AROON;
    if (!aroonGroup) return;

    const upStyle = indicatorStyle?.AROON?.aroonUp;
    const downStyle = indicatorStyle?.AROON?.aroonDown;

    /* UPDATE AROON UP */

    if (aroonGroup.aroonUp) {
      aroonGroup.aroonUp.applyOptions({
        color: upStyle?.color,
        lineWidth: upStyle?.width,
        lineStyle: upStyle?.lineStyle ?? 0,
        visible: upStyle?.visible,
        lastValueVisible: upStyle?.visible,
        opacity: upStyle?.opacity, // ⭐ add this
      });
    }

    /* UPDATE AROON DOWN */

    if (aroonGroup.aroonDown) {
      aroonGroup.aroonDown.applyOptions({
        color: downStyle?.color,
        lineWidth: downStyle?.width,
        lineStyle: downStyle?.lineStyle ?? 0,
        visible: downStyle?.visible,
        lastValueVisible: downStyle?.visible,
        opacity: downStyle?.opacity, // ⭐ add this
      });
    }
  }, [indicatorStyle]);
  return null;
}
