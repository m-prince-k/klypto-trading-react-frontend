import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function CCIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.CCI) {
      Object.values(indicatorSeriesRef.current.CCI).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.CCI = null;
    }

    const groupedSeries = {};
    let cciData = [];

    const upper = indicatorStyle?.CCI?.upperBand?.value ?? 100;
    const middle = indicatorStyle?.CCI?.middleBand?.value ?? 0;
    const lower = indicatorStyle?.CCI?.lowerBand?.value ?? -100;

    const bgFill = indicatorStyle?.CCI?.bgFill;

    /* ================= MAIN LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      const styleConfig = indicatorStyle?.CCI?.[lineName];

      const series = addSeries("CCI", LineSeries, {
        color: styleConfig?.color,
        lineWidth: styleConfig?.width,
        lineStyle: styleConfig?.lineStyle ?? 0,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "cciLine") cciData = lineData;

    });

    /* ================= LEVEL BANDS ================= */

    const makeLevelData = (value) =>
      cciData.map((p) => ({ time: p.time, value }));

    const upperBand = addSeries("CCI", LineSeries, {
      color: indicatorStyle?.CCI?.upperBand?.color,
      lineWidth: indicatorStyle?.CCI?.upperBand?.width,
      lineStyle: indicatorStyle?.CCI?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.upperBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleBand = addSeries("CCI", LineSeries, {
      color: indicatorStyle?.CCI?.middleBand?.color,
      lineWidth: indicatorStyle?.CCI?.middleBand?.width,
      lineStyle: indicatorStyle?.CCI?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.middleBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerBand = addSeries("CCI", LineSeries, {
      color: indicatorStyle?.CCI?.lowerBand?.color,
      lineWidth: indicatorStyle?.CCI?.lowerBand?.width,
      lineStyle: indicatorStyle?.CCI?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.CCI?.lowerBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperBand.setData(makeLevelData(upper));
    middleBand.setData(makeLevelData(middle));
    lowerBand.setData(makeLevelData(lower));

    groupedSeries.upperBand = upperBand;
    groupedSeries.middleBand = middleBand;
    groupedSeries.lowerBand = lowerBand;

    /* ================= BACKGROUND FILL ================= */

    const bandData = cciData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bgSeries = addSeries("CCI", BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bgFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bgSeries.setData(bandData);

    groupedSeries.bgFill = bgSeries;
    groupedSeries.cciData = cciData;

    indicatorSeriesRef.current.CCI = groupedSeries;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const cciGroup = indicatorSeriesRef.current?.CCI;
    if (!cciGroup) return;

    const style = indicatorStyle?.CCI;
    const data = cciGroup.cciData ?? [];

    const upper = style?.upperBand?.value ?? 100;
    const middle = style?.middleBand?.value ?? 0;
    const lower = style?.lowerBand?.value ?? -100;

    const makeLevel = (v) =>
      data.map((p) => ({ time: p.time, value: v }));


    /* ================= UPDATE BAND VALUES ================= */

    cciGroup.upperBand?.setData(makeLevel(upper));
    cciGroup.middleBand?.setData(makeLevel(middle));
    cciGroup.lowerBand?.setData(makeLevel(lower));


    /* ================= UPDATE MAIN LINES ================= */

    if (cciGroup.cciLine) {
      cciGroup.cciLine.applyOptions({
        color: style?.cciLine?.color,
        lineWidth: style?.cciLine?.width,
        lineStyle: style?.cciLine?.lineStyle,
        visible: style?.cciLine?.visible,
        opacity: style?.cciLine?.opacity,
      });
    }

    if (cciGroup.cciMa) {
      cciGroup.cciMa.applyOptions({
        color: style?.cciMa?.color,
        lineWidth: style?.cciMa?.width,
        lineStyle: style?.cciMa?.lineStyle,
        visible: style?.cciMa?.visible,
        opacity: style?.cciMa?.opacity,
      });
    }


    /* ================= UPDATE BAND STYLES ================= */

    ["upperBand", "middleBand", "lowerBand"].forEach((key) => {

      if (cciGroup[key]) {

        cciGroup[key].applyOptions({
          color: style?.[key]?.color,
          lineWidth: style?.[key]?.width,
          lineStyle: style?.[key]?.lineStyle,
          visible: style?.[key]?.visible,
        });

      }

    });


    /* ================= UPDATE FILL ================= */

    if (cciGroup.bgFill) {

      const bandData = data.map((p) => ({
        time: p.time,
        value: upper,
      }));

      cciGroup.bgFill.applyOptions({
        baseValue: { type: "price", price: lower },
        visible: style?.bgFill?.visible,
        topFillColor1: style?.bgFill?.topFillColor1,
        topFillColor2: style?.bgFill?.topFillColor2,
      });

      cciGroup.bgFill.setData(bandData);

    }

  }, [indicatorStyle]);

  return null;
}