import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ROCPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE ROC ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.ROC) {

      Object.values(indicatorSeriesRef.current.ROC).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.ROC = null;
    }

    const groupedSeries = {};
    let rocData = [];

    /* ================= CREATE MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const styleConfig = indicatorStyle?.ROC?.[lineName];

      const series = addSeries("ROC", LineSeries, {
        color: styleConfig?.color || "rgba(33,150,243,1)",
        lineWidth: styleConfig?.width || 2,
        lineStyle: styleConfig?.lineStyle ?? 0,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "roc") rocData = lineData;

    });

    /* ================= ZERO LINE ================= */

    const zeroValue = indicatorStyle?.ROC?.zeroLine?.value ?? 0;

    const zeroLine = addSeries("ROC", LineSeries, {
      color: indicatorStyle?.ROC?.zeroLine?.color || "rgba(158,158,158,1)",
      lineWidth: indicatorStyle?.ROC?.zeroLine?.width || 1,
      lineStyle: indicatorStyle?.ROC?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.ROC?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const zeroData = rocData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    zeroLine.setData(zeroData);

    groupedSeries.zeroLine = zeroLine;
    groupedSeries.rocData = rocData;

    indicatorSeriesRef.current.ROC = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const rocGroup = indicatorSeriesRef.current?.ROC;
    if (!rocGroup) return;

    const style = indicatorStyle?.ROC;
    const data = rocGroup.rocData ?? [];

    const zeroValue = style?.zeroLine?.value ?? 0;

    const makeLevel = (v) =>
      data.map((p) => ({ time: p.time, value: v }));


    /* ROC LINE */

    if (rocGroup.roc) {
      rocGroup.roc.applyOptions({
        color: style?.roc?.color,
        lineWidth: style?.roc?.width,
        lineStyle: style?.roc?.lineStyle,
        visible: style?.roc?.visible,
        opacity: style?.roc?.opacity,
      });
    }


    /* ZERO LINE */

    if (rocGroup.zeroLine) {

      rocGroup.zeroLine.applyOptions({
        color: style?.zeroLine?.color,
        lineWidth: style?.zeroLine?.width,
        lineStyle: style?.zeroLine?.lineStyle,
        visible: style?.zeroLine?.visible,
      });

      rocGroup.zeroLine.setData(makeLevel(zeroValue));

    }

  }, [indicatorStyle]);

  return null;
}