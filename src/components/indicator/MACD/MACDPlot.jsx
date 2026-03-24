import { useEffect } from "react";
import { LineSeries, HistogramSeries } from "lightweight-charts";

export default function MACDPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  useEffect(() => {
    if (!result?.data) return;

    /* -------- REMOVE OLD -------- */

    if (indicatorSeriesRef.current?.MACD) {
      Object.values(indicatorSeriesRef.current.MACD).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.MACD = null;
    }

    const groupedSeries = {};
    let macdData = [];

    Object.entries(result.data).forEach(([lineName, lineData]) => {
      if (!Array.isArray(lineData)) return;

      const style = indicatorStyle?.MACD?.[lineName];
      let series;

      /* ================= HISTOGRAM ================= */

      if (lineName === "histogram") {
        series = addSeries("MACD", HistogramSeries, {
          visible: style?.visible ?? true,
          priceLineVisible: false,
          lastValueVisible: true,
        });

        const formatted = lineData
          .filter((d) => d?.time != null && d?.value != null)
          .map((d) => {
            const v = Number(d.value);

            let color;

            if (v >= 0) {
              color = style?.palette?.[0] || style?.upColor;
            } else {
              color = style?.palette?.[2] || style?.downColor;
            }

            return {
              time: d.time,
              value: v,
              color,
            };
          });

        series.setData(formatted);
      } else {
        /* ================= LINE SERIES ================= */
        series = addSeries("MACD", LineSeries, {
          color: style?.color,
          lineWidth: style?.width ?? 2,
          lineStyle: style?.lineStyle ?? 0,
          visible: style?.visible ?? true,
          priceLineVisible: false,
          lastValueVisible: true,
        });

        const cleanData = lineData
          .filter((d) => d?.time != null && d?.value != null)
          .map((d) => ({
            time: d.time,
            value: Number(d.value),
          }));

        series.setData(cleanData);

        if (lineName === "macd") macdData = cleanData;
      }

      if (series) groupedSeries[lineName] = series;
    });

    /* ================= ZERO LINE ================= */

    const zeroLine = addSeries("MACD", LineSeries, {
      color: indicatorStyle?.MACD?.zeroLine?.color,
      lineWidth: indicatorStyle?.MACD?.zeroLine?.width ?? 1,
      lineStyle: indicatorStyle?.MACD?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.MACD?.zeroLine?.visible ?? true,
      value: indicatorStyle?.MACD?.zeroLine?.value ?? 0,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const zeroValue = indicatorStyle?.MACD?.zeroLine?.value ?? 0;

    const zeroData = macdData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    zeroLine.setData(zeroData);

    groupedSeries.zeroLine = zeroLine;
    groupedSeries.macdData = macdData;

    indicatorSeriesRef.current.MACD = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const macdGroup = indicatorSeriesRef.current?.MACD;
    if (!macdGroup) return;

    const macdData = macdGroup.macdData ?? [];

    const zeroValue = indicatorStyle?.MACD?.zeroLine?.value ?? 0;

    macdGroup.zeroLine?.applyOptions({
      color: indicatorStyle?.MACD?.zeroLine?.color,
      lineWidth: indicatorStyle?.MACD?.zeroLine?.width,
      lineStyle: indicatorStyle?.MACD?.zeroLine?.lineStyle,
      visible: indicatorStyle?.MACD?.zeroLine?.visible,
      value: indicatorStyle?.MACD?.zeroLine?.value,
    });

    macdGroup.zeroLine?.setData(
      macdData.map((p) => ({
        time: p.time,
        value: zeroValue,
      })),
    );

    Object.entries(macdGroup).forEach(([key, series]) => {
      if (!series) return;
      if (key === "histogram" || key === "macdData" || key === "zeroLine")
        return;

      const style = indicatorStyle?.MACD?.[key];
      if (!style) return;

      series.applyOptions({
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle,
        visible: style.visible,
      });
    });
  }, [indicatorStyle]);

  return null;
}
