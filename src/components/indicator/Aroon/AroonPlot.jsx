import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function AroonPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {
  /* ================= CREATE AROON ================= */

  useEffect(() => {
    if (!result) return;

    /* REMOVE OLD AROON COMPLETELY */

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
            try { chart.removeSeries(s); } catch {}
          } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const groupedSeries = {};

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {
      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.[indicator]?.[lineName];

      const series = addSeries(indicator, LineSeries, {
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

    indicatorSeriesRef.current[indicator] = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const aroonGroup = indicatorSeriesRef.current?.[indicator];
    if (!aroonGroup) return;

    const upStyle = indicatorStyle?.[indicator]?.aroonUp;
    const downStyle = indicatorStyle?.[indicator]?.aroonDown;

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
