import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function CMOPlot({
  result,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {
    if (!result?.data?.cmo?.length) return;

    if (indicatorSeriesRef.current?.CMO) {
      Object.values(indicatorSeriesRef.current.CMO).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
    }

    const groupedSeries = {};

    /* MAIN CMO LINE */
    const cmoSeries = addSeries("CMO", LineSeries, {
      color: indicatorStyle?.CMO?.cmo?.color || "rgba(255,193,7,1)",
      lineWidth: indicatorStyle?.CMO?.cmo?.width || 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    cmoSeries.setData(result.data.cmo);

    groupedSeries.cmo = cmoSeries;

    /* 🔥 LEVEL LINES (+50 / -50) */

    const makeLevel = (value) =>
      result.data.cmo.map((p) => ({
        time: p.time,
        value,
      }));

    const upper = addSeries("CMO", LineSeries, {
      color: "rgba(255,0,0,0.5)",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });

    const lower = addSeries("CMO", LineSeries, {
      color: "rgba(0,255,0,0.5)",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });

    upper.setData(makeLevel(50));
    lower.setData(makeLevel(-50));

    groupedSeries.upper = upper;
    groupedSeries.lower = lower;

    indicatorSeriesRef.current.CMO = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const group = indicatorSeriesRef.current?.CMO;
    if (!group) return;

    const style = indicatorStyle?.CMO?.cmo;

    group.cmo?.applyOptions({
      color: style?.color,
      lineWidth: style?.width,
      lineStyle: style?.lineStyle ?? 0,
      visible: style?.visible,
    });

  }, [indicatorStyle]);

  return null;
}