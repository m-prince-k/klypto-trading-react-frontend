import { useEffect } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

export default function VWAPPlot({
  result,
  indicatorStyle,
  indicatorConfigs,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ---------------- SAFE DATA CLEANER ---------------- */

  const cleanSeries = (data) => {
    if (!Array.isArray(data)) return [];

    return data
      .filter(
        (d) =>
          d &&
          d.time != null &&
          d.value != null &&
          !isNaN(d.time) &&
          !isNaN(d.value)
      )
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.value),
      }));
  };



  /* ---------------- CREATE SERIES ---------------- */

  useEffect(() => {

    if (!result?.data) return;

    /* REMOVE OLD SERIES */

    if (indicatorSeriesRef.current?.VWAP) {
      Object.values(indicatorSeriesRef.current.VWAP).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.VWAP = null;
    }

    const grouped = {};

    const vwapData = cleanSeries(result.data.vwap);
    const upper1 = cleanSeries(result.data.upper1);
    const lower1 = cleanSeries(result.data.lower1);
    const upper2 = cleanSeries(result.data.upper2);
    const lower2 = cleanSeries(result.data.lower2);
    const upper3 = cleanSeries(result.data.upper3);
    const lower3 = cleanSeries(result.data.lower3);

    /* ---------------- VWAP MAIN LINE ---------------- */

    const vwapSeries = addSeries("VWAP", LineSeries, {
      color: indicatorStyle?.VWAP?.vwap?.color,
      lineWidth: indicatorStyle?.VWAP?.vwap?.width ?? 2,
      lineStyle: indicatorStyle?.VWAP?.vwap?.lineStyle ?? 0,
      visible: indicatorStyle?.VWAP?.vwap?.visible ?? true,
      priceLineVisible: false,
    });

    if (vwapData.length) vwapSeries.setData(vwapData);

    grouped.vwap = vwapSeries;

    /* ---------------- BAND SERIES ---------------- */

    const createBand = (name, data, style) => {
      if (!data.length) return;

      const series = addSeries("VWAP", LineSeries, {
        color: style?.color,
        lineWidth: style?.width ?? 1,
        lineStyle: style?.lineStyle ?? 2,
        visible: style?.visible ?? false,
        priceLineVisible: false,
      });

      series.setData(data);
      grouped[name] = series;
    };

    createBand("upper1", upper1, indicatorStyle?.VWAP?.upper);
    createBand("lower1", lower1, indicatorStyle?.VWAP?.lower);
    createBand("upper2", upper2, indicatorStyle?.VWAP?.upper);
    createBand("lower2", lower2, indicatorStyle?.VWAP?.lower);
    createBand("upper3", upper3, indicatorStyle?.VWAP?.upper);
    createBand("lower3", lower3, indicatorStyle?.VWAP?.lower);

    /* ---------------- BACKGROUND FILL ---------------- */

    if (
      indicatorStyle?.VWAP?.bg?.visible &&
      upper1.length &&
      lower1.length
    ) {
      const bgSeries = addSeries("VWAP", AreaSeries, {
        topColor: indicatorStyle?.VWAP?.bg?.topFillColor1,
        bottomColor: indicatorStyle?.VWAP?.bg?.topFillColor2,
        lineColor: "rgba(0,0,0,0)",
        lineWidth: 0,
        priceLineVisible: false,
      });

      const bgData = upper1.map((p, i) => ({
        time: p.time,
        value: p.value,
      }));

      bgSeries.setData(bgData);
      grouped.bg = bgSeries;
    }

    indicatorSeriesRef.current.VWAP = grouped;

  }, [result]);



  /* ---------------- STYLE UPDATE ---------------- */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.VWAP;
    if (!group) return;

    Object.entries(group).forEach(([key, series]) => {

      if (!series) return;

      let style;

      if (key === "vwap") style = indicatorStyle?.VWAP?.vwap;
      else if (key.startsWith("upper")) style = indicatorStyle?.VWAP?.upper;
      else if (key.startsWith("lower")) style = indicatorStyle?.VWAP?.lower;

      if (!style) return;

      try {
        series.applyOptions({
          color: style.color,
          lineWidth: style.width,
          lineStyle: style.lineStyle,
          visible: style.visible,
        });
      } catch {}

    });

  }, [indicatorStyle]);


  return null;
}