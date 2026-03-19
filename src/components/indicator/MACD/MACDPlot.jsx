import { useEffect } from "react";
import { LineSeries, HistogramSeries, LineStyle } from "lightweight-charts";

export default function MACDPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  useEffect(() => {

    if (!result) return;

    /* 🔥 REMOVE OLD */
    if (indicatorSeriesRef.current?.MACD) {
      Object.values(indicatorSeriesRef.current.MACD).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.MACD = null;
    }

    const groupedSeries = {};
    let macdData = [];

    /* ================= MAIN SERIES ================= */

    Object.entries(result?.data).forEach(([lineName, lineData]) => {

      const style = indicatorStyle?.MACD?.[lineName];

      let series;

      if (lineName === "histogram") {

        series = addSeries("MACD", HistogramSeries, {
          priceLineVisible: false,
          lastValueVisible: true,
        });

        series.setData(
          lineData.map((d) => ({
            ...d,
            color:
              d.value >= 0
                ? (style?.upColor || "rgba(38,166,154,1)")
                : (style?.downColor || "rgba(239,83,80,1)"),
          }))
        );

      } else {

        series = addSeries("MACD", LineSeries, {
          color: style?.color,
          lineWidth: style?.width || 2,
          visible: style?.visible ?? true,
          priceLineVisible: false,
          lastValueVisible: true,
        });

        series.setData(lineData);

        if (lineName === "macd") macdData = lineData;
      }

      if (!series) return;

      groupedSeries[lineName] = series;

    });

    /* ================= ZERO LINE ================= */

    const zeroLine = addSeries("MACD", LineSeries, {
      color: indicatorStyle?.MACD?.zeroLine?.color || "rgba(150,150,150,0.5)",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      visible: indicatorStyle?.MACD?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    zeroLine.setData(
      macdData.map((p) => ({
        time: p.time,
        value: 0,
      }))
    );

    groupedSeries.zeroLine = zeroLine;

    groupedSeries.macdData = macdData;

    indicatorSeriesRef.current.MACD = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const macdGroup = indicatorSeriesRef.current?.MACD;
    if (!macdGroup) return;

    const macdData = macdGroup.macdData ?? [];

    /* ZERO LINE UPDATE */
    macdGroup.zeroLine?.setData(
      macdData.map((p) => ({ time: p.time, value: 0 }))
    );

    macdGroup.zeroLine?.applyOptions({
      color: indicatorStyle?.MACD?.zeroLine?.color,
      visible: indicatorStyle?.MACD?.zeroLine?.visible,
    });

    /* MAIN SERIES */
    Object.keys(macdGroup).forEach((key) => {

      const series = macdGroup[key];
      const style = indicatorStyle?.MACD?.[key];

      if (!series || !style) return;

      if (key === "histogram" || key === "macdData" || key === "zeroLine") return;

      series.applyOptions({
        color: style?.color,
        lineWidth: style?.width,
        visible: style?.visible,
      });

    });

  }, [indicatorStyle]);

  return null;
}