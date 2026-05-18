import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function CMFPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
  chart
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result?.data?.cmf) return;

    // 🔥 REMOVE OLD SERIES
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const mapSeries = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const cmfData = mapSeries(result.data.cmf);

    /* ================= CMF LINE ================= */

    const cmfSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.cmfLine?.color ?? "rgba(255,193,7,1)",
      lineWidth: Number(indicatorStyle?.[indicator]?.cmfLine?.width ?? 2),
      lineStyle: indicatorStyle?.[indicator]?.cmfLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.cmfLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    /* ================= ZERO LINE ================= */

    const zeroValue = Number(indicatorStyle?.[indicator]?.zeroLine?.value ?? 0);

    const zeroSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.zeroLine?.color ?? "rgba(158,158,158,1)",
      lineWidth: Number(indicatorStyle?.[indicator]?.zeroLine?.width ?? 1),
      lineStyle: indicatorStyle?.[indicator]?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const zeroData = cmfData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    cmfSeries.setData(cmfData);
    zeroSeries.setData(zeroData);

    indicatorSeriesRef.current[indicator] = {
      cmfLine: cmfSeries,
      zeroLine: zeroSeries,
      cmfData,
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE (FIXED) ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    const style = indicatorStyle?.[indicator];
    if (!style) return;

    /* 🔥 UPDATE ZERO LINE DATA */
    const zeroValue = Number(style.zeroLine?.value ?? 0);

    if (group.cmfData) {
      const zeroData = group.cmfData.map((p) => ({
        time: p.time,
        value: zeroValue,
      }));

      group.zeroLine?.setData(zeroData);
    }

    /* 🔥 APPLY CMF STYLE */
    if (group.cmfLine) {
      group.cmfLine.applyOptions({
        color: style.cmfLine?.color ?? "rgba(255,193,7,1)",
        lineWidth: Number(style.cmfLine?.width ?? 2),
        lineStyle: style.cmfLine?.lineStyle ?? 0,
        visible: style.cmfLine?.visible ?? true,
      });
    }

    /* 🔥 APPLY ZERO LINE STYLE */
    if (group.zeroLine) {
      group.zeroLine.applyOptions({
        color: style.zeroLine?.color ?? "rgba(158,158,158,1)",
        lineWidth: Number(style.zeroLine?.width ?? 1),
        lineStyle: style.zeroLine?.lineStyle ?? 2,
        visible: style.zeroLine?.visible ?? true,
      });
    }

  }, [indicatorStyle?.[indicator]]); // ✅ FIXED DEPENDENCY

  return null;
}