import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function StochPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE STOCH ================= */

  useEffect(() => {

    if (!result?.data) return;

    /* REMOVE OLD */

    if (indicatorSeriesRef.current?.STOCH) {

      Object.values(indicatorSeriesRef.current.STOCH).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.STOCH = null;
    }

    const grouped = {};

    /* DATA */

    const kData =
      result.data
        ?.filter((d) => d.stochastick != null && d.time != null)
        .map((d) => ({
          time: d.time,
          value: d.stochastick,
        })) ?? [];

    const dData =
      result.data
        ?.filter((d) => d.stochasticd != null && d.time != null)
        .map((d) => ({
          time: d.time,
          value: d.stochasticd,
        })) ?? [];

    if (!kData.length) return;

    const upper = indicatorStyle?.STOCH?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.STOCH?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.STOCH?.lowerBand?.value ?? 20;

    /* ================= %K ================= */

    const kSeries = addSeries("STOCH", LineSeries, {
      color: indicatorStyle?.STOCH?.k?.color,
      lineWidth: indicatorStyle?.STOCH?.k?.width,
      lineStyle: indicatorStyle?.STOCH?.k?.lineStyle ?? 0,
      visible: indicatorStyle?.STOCH?.k?.visible,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      title: "%K",
      priceLineVisible: false,
      lastValueVisible: true,
    });

    kSeries.setData(kData);

    grouped.k = kSeries;


    /* ================= %D ================= */

    const dSeries = addSeries("STOCH", LineSeries, {
      color: indicatorStyle?.STOCH?.d?.color,
      lineWidth: indicatorStyle?.STOCH?.d?.width,
      lineStyle: indicatorStyle?.STOCH?.d?.lineStyle ?? 0,
      visible: indicatorStyle?.STOCH?.d?.visible,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      title: "%D",
      priceLineVisible: false,
      lastValueVisible: true,
    });

    dSeries.setData(dData);

    grouped.d = dSeries;


    /* ================= LEVEL BANDS ================= */

    const makeLevel = (value) =>
      kData.map((p) => ({
        time: p.time,
        value,
      }));


    const upperSeries = addSeries("STOCH", LineSeries, {
      color: indicatorStyle?.STOCH?.upperBand?.color,
      lineWidth: indicatorStyle?.STOCH?.upperBand?.width,
      lineStyle: indicatorStyle?.STOCH?.upperBand?.lineStyle ?? 2,
      visible: indicatorStyle?.STOCH?.upperBand?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperSeries.setData(makeLevel(upper));
    grouped.upperBand = upperSeries;


    const middleSeries = addSeries("STOCH", LineSeries, {
      color: indicatorStyle?.STOCH?.middleBand?.color,
      lineWidth: indicatorStyle?.STOCH?.middleBand?.width,
      lineStyle: indicatorStyle?.STOCH?.middleBand?.lineStyle ?? 2,
      visible: indicatorStyle?.STOCH?.middleBand?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    middleSeries.setData(makeLevel(middle));
    grouped.middleBand = middleSeries;


    const lowerSeries = addSeries("STOCH", LineSeries, {
      color: indicatorStyle?.STOCH?.lowerBand?.color,
      lineWidth: indicatorStyle?.STOCH?.lowerBand?.width,
      lineStyle: indicatorStyle?.STOCH?.lowerBand?.lineStyle ?? 2,
      visible: indicatorStyle?.STOCH?.lowerBand?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    lowerSeries.setData(makeLevel(lower));
    grouped.lowerBand = lowerSeries;


    /* ================= BACKGROUND ================= */

    const bgFill = indicatorStyle?.STOCH?.bgFill;

    const bgSeries = addSeries("STOCH", BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: bgFill?.topFillColor1,
      topFillColor2: bgFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bgFill?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bgSeries.setData(makeLevel(upper));

    grouped.bgFill = bgSeries;

    grouped.kData = kData;

    indicatorSeriesRef.current.STOCH = grouped;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.STOCH;
    if (!group) return;

    const kData = group.kData ?? [];

    const upper = indicatorStyle?.STOCH?.upperBand?.value ?? 80;
    const middle = indicatorStyle?.STOCH?.middleBand?.value ?? 50;
    const lower = indicatorStyle?.STOCH?.lowerBand?.value ?? 20;

    const makeLevel = (v) =>
      kData.map((p) => ({
        time: p.time,
        value: v,
      }));


    /* UPDATE LEVELS */

    group.upperBand?.setData(makeLevel(upper));
    group.middleBand?.setData(makeLevel(middle));
    group.lowerBand?.setData(makeLevel(lower));


    /* UPDATE LINES */

    group.k?.applyOptions({
      color: indicatorStyle?.STOCH?.k?.color,
      lineWidth: indicatorStyle?.STOCH?.k?.width,
      lineStyle: indicatorStyle?.STOCH?.k?.lineStyle,
      visible: indicatorStyle?.STOCH?.k?.visible,
    });

    group.d?.applyOptions({
      color: indicatorStyle?.STOCH?.d?.color,
      lineWidth: indicatorStyle?.STOCH?.d?.width,
      lineStyle: indicatorStyle?.STOCH?.d?.lineStyle,
      visible: indicatorStyle?.STOCH?.d?.visible,
    });


    /* UPDATE BANDS */

    group.upperBand?.applyOptions(indicatorStyle?.STOCH?.upperBand);
    group.middleBand?.applyOptions(indicatorStyle?.STOCH?.middleBand);
    group.lowerBand?.applyOptions(indicatorStyle?.STOCH?.lowerBand);


    /* UPDATE BG */

    group.bgFill?.applyOptions({
      visible: indicatorStyle?.STOCH?.bgFill?.visible,
      topFillColor1: indicatorStyle?.STOCH?.bgFill?.topFillColor1,
      topFillColor2: indicatorStyle?.STOCH?.bgFill?.topFillColor2,
    });

  }, [indicatorStyle]);


  return null;
}