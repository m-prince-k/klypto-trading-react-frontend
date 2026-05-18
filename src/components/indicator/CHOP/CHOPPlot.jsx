import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function CHOPPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* CREATE SERIES */

  useEffect(() => {
    if (!result?.data?.chopLine) return;

    const old = indicatorSeriesRef.current?.[indicator];

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const grouped = {};

    const chopData = result.data.chopLine ?? [];
    if (!chopData.length) return;

    const upper = indicatorStyle?.[indicator]?.upper?.value ?? 61.8;
    const middle = indicatorStyle?.[indicator]?.middle?.value ?? 50;
    const lower = indicatorStyle?.[indicator]?.lower?.value ?? 38.2;

    const makeLevel = (v) =>
      chopData.map((p) => ({
        time: p.time,
        value: v,
      }));


    /* CHOP LINE */

    const chopSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.chopLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.chopLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.chopLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.chopLine?.visible,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    chopSeries.setData(chopData);

    grouped.chopLine = chopSeries;


    /* BANDS */

    const upperSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.upper?.color,
      lineWidth: indicatorStyle?.[indicator]?.upper?.width,
      lineStyle: indicatorStyle?.[indicator]?.upper?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.upper?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperSeries.setData(makeLevel(upper));


    const middleSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.middle?.color,
      lineWidth: indicatorStyle?.[indicator]?.middle?.width,
      lineStyle: indicatorStyle?.[indicator]?.middle?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.middle?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    middleSeries.setData(makeLevel(middle));


    const lowerSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.lower?.color,
      lineWidth: indicatorStyle?.[indicator]?.lower?.width,
      lineStyle: indicatorStyle?.[indicator]?.lower?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.lower?.visible,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    lowerSeries.setData(makeLevel(lower));


    grouped.upper = upperSeries;
    grouped.middle = middleSeries;
    grouped.lower = lowerSeries;


    /* BACKGROUND FILL */

    const bg = indicatorStyle?.[indicator]?.bg;

    const bgSeries = addSeries(indicator, BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: bg?.topFillColor1,
      topFillColor2: bg?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bg?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bgSeries.setData(makeLevel(upper));

    grouped.bg = bgSeries;

    grouped.chopData = chopData;

    indicatorSeriesRef.current[indicator] = grouped;

  }, [result]);


  /* STYLE + LEVEL UPDATE */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    const chopData = group.chopData ?? [];
    if (!chopData.length) return;

    const upper = indicatorStyle?.[indicator]?.upper?.value ?? 61.8;
    const middle = indicatorStyle?.[indicator]?.middle?.value ?? 50;
    const lower = indicatorStyle?.[indicator]?.lower?.value ?? 38.2;

    const makeLevel = (v) =>
      chopData.map((p) => ({ time: p.time, value: v }));


    /* UPDATE BAND LEVELS */

    group.upper?.setData(makeLevel(upper));
    group.middle?.setData(makeLevel(middle));
    group.lower?.setData(makeLevel(lower));


    /* UPDATE BG FILL (IMPORTANT FIX) */

    group.bg?.applyOptions({
      baseValue: { type: "price", price: lower },
      topFillColor1: indicatorStyle?.[indicator]?.bg?.topFillColor1,
      topFillColor2: indicatorStyle?.[indicator]?.bg?.topFillColor2,
      visible: indicatorStyle?.[indicator]?.bg?.visible,
    });

    group.bg?.setData(makeLevel(upper));


    /* UPDATE STYLES */

    group.chopLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.chopLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.chopLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.chopLine?.lineStyle,
      visible: indicatorStyle?.[indicator]?.chopLine?.visible,
    });

    group.upper?.applyOptions({
      color: indicatorStyle?.[indicator]?.upper?.color,
      lineWidth: indicatorStyle?.[indicator]?.upper?.width,
      lineStyle: indicatorStyle?.[indicator]?.upper?.lineStyle,
      visible: indicatorStyle?.[indicator]?.upper?.visible,
    });

    group.middle?.applyOptions({
      color: indicatorStyle?.[indicator]?.middle?.color,
      lineWidth: indicatorStyle?.[indicator]?.middle?.width,
      lineStyle: indicatorStyle?.[indicator]?.middle?.lineStyle,
      visible: indicatorStyle?.[indicator]?.middle?.visible,
    });

    group.lower?.applyOptions({
      color: indicatorStyle?.[indicator]?.lower?.color,
      lineWidth: indicatorStyle?.[indicator]?.lower?.width,
      lineStyle: indicatorStyle?.[indicator]?.lower?.lineStyle,
      visible: indicatorStyle?.[indicator]?.lower?.visible,
    });

  }, [indicatorStyle]);

  return null;
}