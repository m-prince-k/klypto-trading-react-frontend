import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function HVPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
<<<<<<< HEAD
}) {

  useEffect(() => {
    if (!result?.data?.hv) return;

    // REMOVE OLD
=======
  indicatorConfigs,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    if (!result?.data?.hv) return;

    // 🔥 REMOVE OLD
>>>>>>> 74d4aff7095b3a6b6130baf32d081d88ad4573a8
    if (indicatorSeriesRef.current?.HV) {
      Object.values(indicatorSeriesRef.current.HV).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.HV = null;
    }

<<<<<<< HEAD
    const hvData = result.data.hv;

    if (!hvData.length) return;

    // CREATE SERIES
    const hvSeries = addSeries("HV-hv", LineSeries, {
      color: indicatorStyle?.HV?.hv?.color || "#ff9800",
      lineWidth: indicatorStyle?.HV?.hv?.width || 2,
      lineStyle: indicatorStyle?.HV?.hv?.lineStyle || 0,
=======
    const hvData = (result.data.hv || [])
      .map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }))
      .filter((d) => !isNaN(d.value));

    /* 🔥 HV LINE */

    const hvSeries = addSeries("HV", LineSeries, {
      color: indicatorStyle?.HV?.hv?.color ?? "rgba(255,152,0,1)",
      lineWidth: Number(indicatorStyle?.HV?.hv?.width ?? 2),
      lineStyle: indicatorStyle?.HV?.hv?.lineStyle ?? 0,
>>>>>>> 74d4aff7095b3a6b6130baf32d081d88ad4573a8
      visible: indicatorStyle?.HV?.hv?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    hvSeries.setData(hvData);

<<<<<<< HEAD
    indicatorSeriesRef.current.HV = {
      hv: hvSeries,
    };

  }, [result, addSeries, indicatorStyle]);

  // 🔥 STYLE UPDATE (live change)
  useEffect(() => {
    const hvGroup = indicatorSeriesRef.current?.HV;
    if (!hvGroup) return;

    const series = hvGroup.hv;
    const style = indicatorStyle?.HV?.hv;

    if (!series || !style) return;

    series.applyOptions({
      color: style.color,
      lineWidth: style.width,
      lineStyle: style.lineStyle ?? 0,
      visible: style.visible,
    });

  }, [indicatorStyle]);
=======
    // 🔥 IMPORTANT: STORE AS "hv" (NOT hvLine)
    indicatorSeriesRef.current.HV = {
      hv: hvSeries,
      hvData,
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.HV;
    if (!group) return;

    const style = indicatorStyle?.HV;
    if (!style) return;

    // 🔥 APPLY STYLE CORRECTLY
    group.hv?.applyOptions({
      color: style.hv?.color ?? "rgba(255,152,0,1)",
      lineWidth: Number(style.hv?.width ?? 2),
      lineStyle: style.hv?.lineStyle ?? 0,
      visible: style.hv?.visible ?? true,
    });

  }, [indicatorStyle?.HV]);
>>>>>>> 74d4aff7095b3a6b6130baf32d081d88ad4573a8

  return null;
}