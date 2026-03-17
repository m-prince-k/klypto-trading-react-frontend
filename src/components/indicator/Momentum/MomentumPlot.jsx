import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function WilliamsRPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  /* ================= CREATE SERIES ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.WilliamsR) {
      Object.values(indicatorSeriesRef.current.WilliamsR).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.WilliamsR = null;
    }

    const groupedSeries = {};
    let rData = [];

    const upper = indicatorStyle?.WilliamsR?.upperBand?.value ?? -20;
    const middle = indicatorStyle?.WilliamsR?.middleBand?.value ?? -50;
    const lower = indicatorStyle?.WilliamsR?.lowerBand?.value ?? -80;

    const bgFill = indicatorStyle?.WilliamsR?.bg;

    /* ================= MAIN LINE ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {
      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.WilliamsR?.[lineName];

      const series = addSeries("WilliamsR", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "rgba(38,166,154,1)",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "r") rData = lineData;
    });

    /* ================= LEVEL LINES ================= */

    const makeLevelData = (value) =>
      rData.map((p) => ({
        time: p.time,
        value,
      }));

    const upperLine = addSeries("WilliamsR", LineSeries, {
      color: indicatorStyle?.WilliamsR?.upperBand?.color,
      lineWidth: indicatorStyle?.WilliamsR?.upperBand?.width ?? 1,
      lineStyle: indicatorStyle?.WilliamsR?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.WilliamsR?.upperBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleLine = addSeries("WilliamsR", LineSeries, {
      color: indicatorStyle?.WilliamsR?.middleBand?.color,
      lineWidth: indicatorStyle?.WilliamsR?.middleBand?.width ?? 1,
      lineStyle: indicatorStyle?.WilliamsR?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.WilliamsR?.middleBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerLine = addSeries("WilliamsR", LineSeries, {
      color: indicatorStyle?.WilliamsR?.lowerBand?.color,
      lineWidth: indicatorStyle?.WilliamsR?.lowerBand?.width ?? 1,
      lineStyle: indicatorStyle?.WilliamsR?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.WilliamsR?.lowerBand?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperLine.setData(makeLevelData(upper));
    middleLine.setData(makeLevelData(middle));
    lowerLine.setData(makeLevelData(lower));

    groupedSeries.upperBand = upperLine;
    groupedSeries.middleBand = middleLine;
    groupedSeries.lowerBand = lowerLine;

    /* ================= BAND BACKGROUND ================= */

    const bandData = rData.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bandBackgroundSeries = addSeries("WilliamsR", BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: bgFill?.color0,
      topFillColor2: bgFill?.color1,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bgFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bandBackgroundSeries.setData(bandData);

    groupedSeries.bandBackground = bandBackgroundSeries;

    /* ⭐ store r data */

    groupedSeries.rData = rData;

    indicatorSeriesRef.current.WilliamsR = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const group = indicatorSeriesRef.current?.WilliamsR;
    if (!group) return;

    const rData = group.rData ?? [];

    const upperValue = indicatorStyle?.WilliamsR?.upperBand?.value ?? -20;
    const middleValue = indicatorStyle?.WilliamsR?.middleBand?.value ?? -50;
    const lowerValue = indicatorStyle?.WilliamsR?.lowerBand?.value ?? -80;

    const makeLevel = (v) => rData.map((p) => ({ time: p.time, value: v }));

    /* ================= UPDATE %R ================= */

    const rStyle = indicatorStyle?.WilliamsR?.r;

    if (group.r) {
      group.r.applyOptions({
        color: rStyle?.color,
        lineWidth: rStyle?.width,
        lineStyle: rStyle?.lineStyle ?? 0,
        visible: rStyle?.visible,
        opacity: rStyle?.opacity,
      });
    }

    /* ================= UPDATE LEVELS ================= */

    group.upperBand?.applyOptions({
      color: indicatorStyle?.WilliamsR?.upperBand?.color,
      lineWidth: indicatorStyle?.WilliamsR?.upperBand?.width,
      lineStyle: indicatorStyle?.WilliamsR?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.WilliamsR?.upperBand?.visible,
    });

    group.middleBand?.applyOptions({
      color: indicatorStyle?.WilliamsR?.middleBand?.color,
      lineWidth: indicatorStyle?.WilliamsR?.middleBand?.width,
      lineStyle: indicatorStyle?.WilliamsR?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.WilliamsR?.middleBand?.visible,
    });

    group.lowerBand?.applyOptions({
      color: indicatorStyle?.WilliamsR?.lowerBand?.color,
      lineWidth: indicatorStyle?.WilliamsR?.lowerBand?.width,
      lineStyle: indicatorStyle?.WilliamsR?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.WilliamsR?.lowerBand?.visible,
    });

    group.upperBand?.setData(makeLevel(upperValue));
    group.middleBand?.setData(makeLevel(middleValue));
    group.lowerBand?.setData(makeLevel(lowerValue));

    /* ================= UPDATE BG ================= */

    const bgFill = indicatorStyle?.WilliamsR?.bg;

    if (group.bandBackground) {
      try {
        group.bandBackground.setData([]);
      } catch {}
    }

    const bandData = rData.map((p) => ({
      time: p.time,
      value: upperValue,
    }));

    const newBg = addSeries("WilliamsR", BaselineSeries, {
      baseValue: { type: "price", price: lowerValue },
      topFillColor1: bgFill?.color0,
      topFillColor2: bgFill?.color1,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bgFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    newBg.setData(bandData);

    group.bandBackground = newBg;
  }, [indicatorStyle]);

  return null;
}
