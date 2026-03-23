import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

/* ================= SANITIZER ================= */

const sanitizeData = (data) => {
  if (!Array.isArray(data)) {
    if (data && typeof data === "object") {
      data = Object.values(data);
    } else {
      return [];
    }
  }

  return data
    .filter((d) => d && d.time != null && d.value != null)
    .sort((a, b) => a.time - b.time);
};

export default function ChaikinMoneyFlowPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE CMF ================= */

  useEffect(() => {

    if (!result) return;

    /* REMOVE OLD SERIES */

    if (indicatorSeriesRef.current?.CMF) {

      Object.values(indicatorSeriesRef.current.CMF).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.CMF = null;
    }

    const groupedSeries = {};
    let cmfData = [];

    /* ================= MAIN CMF LINE ================= */

    Object.entries(result?.data || {}).forEach(([lineName, lineData]) => {

      const safeData = sanitizeData(lineData);

      const style = indicatorStyle?.CMF?.[lineName];
      const rowConfig = rows?.find((r) => r.key === lineName);

      const series = addSeries("CMF", LineSeries, {
        color: style?.color || rowConfig?.color || "rgba(0,140,255,1)",
        lineWidth: style?.width || 2,
        lineStyle: style?.lineStyle ?? 0,
        visible: style?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(safeData);

      groupedSeries[lineName] = series;

      if (lineName === "cmf") cmfData = safeData;

    });

    /* ================= ZERO LINE ================= */

    const zeroValue = indicatorStyle?.CMF?.zeroLine?.value ?? 0;

    const zeroLine = addSeries("CMF", LineSeries, {
      color: indicatorStyle?.CMF?.zeroLine?.color || "rgba(150,150,150,0.6)",
      lineWidth: indicatorStyle?.CMF?.zeroLine?.width ?? 1,
      lineStyle: indicatorStyle?.CMF?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.CMF?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    zeroLine.setData(
      cmfData.map((p) => ({
        time: p.time,
        value: zeroValue,
      }))
    );

    groupedSeries.zeroLine = zeroLine;

    /* STORE DATA */

    groupedSeries.cmfData = cmfData;

    indicatorSeriesRef.current.CMF = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const cmfGroup = indicatorSeriesRef.current?.CMF;
    if (!cmfGroup) return;

    const cmfData = cmfGroup.cmfData ?? [];

    const cmfStyle = indicatorStyle?.CMF?.cmf;
    const zeroStyle = indicatorStyle?.CMF?.zeroLine;

    const zeroValue = zeroStyle?.value ?? 0;

    /* UPDATE CMF LINE */

    if (cmfGroup.cmf) {

      cmfGroup.cmf.applyOptions({
        color: cmfStyle?.color,
        lineWidth: cmfStyle?.width,
        lineStyle: cmfStyle?.lineStyle ?? 0,
        visible: cmfStyle?.visible,
        lastValueVisible: cmfStyle?.visible,
      });

    }

    /* UPDATE ZERO LINE */

    cmfGroup.zeroLine?.setData(
      cmfData.map((p) => ({
        time: p.time,
        value: zeroValue,
      }))
    );

    cmfGroup.zeroLine?.applyOptions({
      color: zeroStyle?.color,
      lineWidth: zeroStyle?.width,
      lineStyle: zeroStyle?.lineStyle ?? 2,
      visible: zeroStyle?.visible,
    });

  }, [indicatorStyle]);

  return null;
}