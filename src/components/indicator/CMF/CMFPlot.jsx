import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function CMFPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result?.data?.cmf) return;

    // 🔥 REMOVE OLD SERIES
    if (indicatorSeriesRef.current?.CMF) {
      Object.values(indicatorSeriesRef.current.CMF).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.CMF = null;
    }

    const mapSeries = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const cmfData = mapSeries(result.data.cmf);

    /* ================= CMF LINE ================= */

    const cmfSeries = addSeries("CMF", LineSeries, {
      color: indicatorStyle?.CMF?.cmfLine?.color ?? "rgba(255,193,7,1)",
      lineWidth: Number(indicatorStyle?.CMF?.cmfLine?.width ?? 2),
      lineStyle: indicatorStyle?.CMF?.cmfLine?.lineStyle ?? 0,
      visible: indicatorStyle?.CMF?.cmfLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    /* ================= ZERO LINE ================= */

    const zeroValue = Number(indicatorStyle?.CMF?.zeroLine?.value ?? 0);

    const zeroSeries = addSeries("CMF", LineSeries, {
      color: indicatorStyle?.CMF?.zeroLine?.color ?? "rgba(158,158,158,1)",
      lineWidth: Number(indicatorStyle?.CMF?.zeroLine?.width ?? 1),
      lineStyle: indicatorStyle?.CMF?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.CMF?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const zeroData = cmfData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    cmfSeries.setData(cmfData);
    zeroSeries.setData(zeroData);

    indicatorSeriesRef.current.CMF = {
      cmfLine: cmfSeries,
      zeroLine: zeroSeries,
      cmfData,
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE (FIXED) ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.CMF;
    if (!group) return;

    const style = indicatorStyle?.CMF;
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

  }, [indicatorStyle?.CMF]); // ✅ FIXED DEPENDENCY

  return null;
}