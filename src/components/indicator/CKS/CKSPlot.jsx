import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function CKSPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE CKS ================= */

  useEffect(() => {
    if (!result) return;

    const longData = result?.data?.long;
    const shortData = result?.data?.short;

    if (!Array.isArray(longData) || !Array.isArray(shortData)) return;
    if (!longData.length && !shortData.length) return;

    /* 🔥 REMOVE OLD CKS */

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

    const longStyle = indicatorStyle?.[indicator]?.long;
    const shortStyle = indicatorStyle?.[indicator]?.short;

    /* 🔵 LONG SERIES */

    const longSeries = addSeries(indicator, LineSeries, {
      color: longStyle?.color || "#26a69a",
      lineWidth: longStyle?.width || 2,
      lineStyle: longStyle?.lineStyle ?? 0,
      visible: longStyle?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    if (longSeries) {
      longSeries.setData(longData);
      groupedSeries.long = longSeries;
    }

    /* 🔴 SHORT SERIES */

    const shortSeries = addSeries(indicator, LineSeries, {
      color: shortStyle?.color || "#ef5350",
      lineWidth: shortStyle?.width || 2,
      lineStyle: shortStyle?.lineStyle ?? 0,
      visible: shortStyle?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    if (shortSeries) {
      shortSeries.setData(shortData);
      groupedSeries.short = shortSeries;
    }

    indicatorSeriesRef.current[indicator] = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const cksGroup = indicatorSeriesRef.current?.[indicator];
    if (!cksGroup) return;

    const longStyle = indicatorStyle?.[indicator]?.long;
    const shortStyle = indicatorStyle?.[indicator]?.short;

    /* 🔵 UPDATE LONG */

    if (cksGroup.long) {
      cksGroup.long.applyOptions({
        color: longStyle?.color,
        lineWidth: longStyle?.width,
        lineStyle: longStyle?.lineStyle ?? 0,
        visible: longStyle?.visible,
        lastValueVisible: longStyle?.visible,
        opacity: longStyle?.opacity,
      });
    }

    /* 🔴 UPDATE SHORT */

    if (cksGroup.short) {
      cksGroup.short.applyOptions({
        color: shortStyle?.color,
        lineWidth: shortStyle?.width,
        lineStyle: shortStyle?.lineStyle ?? 0,
        visible: shortStyle?.visible,
        lastValueVisible: shortStyle?.visible,
        opacity: shortStyle?.opacity,
      });
    }

  }, [indicatorStyle]);

  return null;
}