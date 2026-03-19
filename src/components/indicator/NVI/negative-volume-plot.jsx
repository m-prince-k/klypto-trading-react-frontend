import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function NVIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE NVI ================= */

  useEffect(() => {

    if (!result) return;

    /* 🔥 REMOVE OLD */
    if (indicatorSeriesRef.current?.NVI) {
      Object.values(indicatorSeriesRef.current.NVI).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.NVI = null;
    }

    const groupedSeries = {};
    let nviData = [];

    /* ================= MAIN LINES ================= */

    Object.entries(result?.data).forEach(([lineName, lineData]) => {

      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.NVI?.[lineName];

      const series = addSeries("NVI", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "rgba(0,140,255,1)",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "nvi") nviData = lineData;

    });

    /* ================= ZERO LINE (OPTIONAL) ================= */

    const zeroVisible = indicatorStyle?.NVI?.zeroLine?.visible;

    if (zeroVisible && nviData.length) {
      const zeroLine = addSeries("NVI", LineSeries, {
        color: indicatorStyle?.NVI?.zeroLine?.color || "rgba(150,150,150,0.5)",
        lineWidth: indicatorStyle?.NVI?.zeroLine?.width ?? 1,
        lineStyle: indicatorStyle?.NVI?.zeroLine?.lineStyle ?? 2,
        visible: true,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      zeroLine.setData(
        nviData.map((p) => ({
          time: p.time,
          value: 0,
        }))
      );

      groupedSeries.zeroLine = zeroLine;
    }

    /* ⭐ STORE DATA */
    groupedSeries.nviData = nviData;

    indicatorSeriesRef.current.NVI = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const nviGroup = indicatorSeriesRef.current?.NVI;
    if (!nviGroup) return;

    const nviData = nviGroup.nviData ?? [];

    /* ================= UPDATE ZERO LINE ================= */

    if (nviGroup.zeroLine && nviData.length) {
      nviGroup.zeroLine.setData(
        nviData.map((p) => ({
          time: p.time,
          value: 0,
        }))
      );

      nviGroup.zeroLine.applyOptions({
        color: indicatorStyle?.NVI?.zeroLine?.color,
        lineWidth: indicatorStyle?.NVI?.zeroLine?.width,
        lineStyle: indicatorStyle?.NVI?.zeroLine?.lineStyle ?? 2,
        visible: indicatorStyle?.NVI?.zeroLine?.visible,
      });
    }

    /* ================= UPDATE MAIN LINES ================= */

    Object.keys(nviGroup).forEach((key) => {

      const series = nviGroup[key];
      const style = indicatorStyle?.NVI?.[key];

      if (!series || !style) return;

      if (key === "zeroLine" || key === "nviData") return;

      series.applyOptions({
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle ?? 0,
        visible: style.visible,
        lastValueVisible: style.visible,
      });

    });

  }, [indicatorStyle]);

  return null;
}