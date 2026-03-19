import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function HistoricalVolatilityPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  useEffect(() => {

    if (!result) return;

    /* 🔥 REMOVE OLD */
    if (indicatorSeriesRef.current?.HV) {
      Object.values(indicatorSeriesRef.current.HV).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.HV = null;
    }

    const groupedSeries = {};
    let hvData = [];

    /* ================= MAIN LINE ================= */

    Object.entries(result?.data).forEach(([lineName, lineData]) => {

      const style = indicatorStyle?.HV?.[lineName];

      const series = addSeries("HV", LineSeries, {
        color: style?.color || "rgba(0,140,255,1)",
        lineWidth: style?.width || 2,
        visible: style?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "hv") hvData = lineData;

    });

    /* ================= THRESHOLD LEVELS ================= */

    const high = indicatorStyle?.HV?.highLevel?.value ?? 20;
    const low = indicatorStyle?.HV?.lowLevel?.value ?? 10;

    const makeLevel = (v) => hvData.map(p => ({ time: p.time, value: v }));

    const highLine = addSeries("HV", LineSeries, {
      color: indicatorStyle?.HV?.highLevel?.color,
      lineWidth: 1,
      lineStyle: 2,
      visible: indicatorStyle?.HV?.highLevel?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowLine = addSeries("HV", LineSeries, {
      color: indicatorStyle?.HV?.lowLevel?.color,
      lineWidth: 1,
      lineStyle: 2,
      visible: indicatorStyle?.HV?.lowLevel?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    highLine.setData(makeLevel(high));
    lowLine.setData(makeLevel(low));

    groupedSeries.highLevel = highLine;
    groupedSeries.lowLevel = lowLine;

    /* ================= VOLATILITY ZONES ================= */

    const highFill = addSeries("HV", BaselineSeries, {
      baseValue: { type: "price", price: high },
      topFillColor1: indicatorStyle?.HV?.highFill?.topFillColor1,
      topFillColor2: indicatorStyle?.HV?.highFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: indicatorStyle?.HV?.highFill?.visible ?? true,
    });

    const lowFill = addSeries("HV", BaselineSeries, {
      baseValue: { type: "price", price: low },
      bottomFillColor1: indicatorStyle?.HV?.lowFill?.bottomFillColor1,
      bottomFillColor2: indicatorStyle?.HV?.lowFill?.bottomFillColor2,
      topFillColor1: "rgba(0,0,0,0)",
      topFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: indicatorStyle?.HV?.lowFill?.visible ?? true,
    });

    highFill.setData(hvData);
    lowFill.setData(hvData);

    groupedSeries.highFill = highFill;
    groupedSeries.lowFill = lowFill;

    groupedSeries.hvData = hvData;

    indicatorSeriesRef.current.HV = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const hvGroup = indicatorSeriesRef.current?.HV;
    if (!hvGroup) return;

    const hvData = hvGroup.hvData ?? [];

    const high = indicatorStyle?.HV?.highLevel?.value ?? 20;
    const low = indicatorStyle?.HV?.lowLevel?.value ?? 10;

    const makeLevel = (v) => hvData.map(p => ({ time: p.time, value: v }));

    hvGroup.highLevel?.setData(makeLevel(high));
    hvGroup.lowLevel?.setData(makeLevel(low));

    hvGroup.highLevel?.applyOptions({
      color: indicatorStyle?.HV?.highLevel?.color,
      visible: indicatorStyle?.HV?.highLevel?.visible,
    });

    hvGroup.lowLevel?.applyOptions({
      color: indicatorStyle?.HV?.lowLevel?.color,
      visible: indicatorStyle?.HV?.lowLevel?.visible,
    });

  }, [indicatorStyle]);

  return null;
}