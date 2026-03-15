import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function SMAPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result) return;

    const config = indicatorConfigs?.SMA || {};

    const maType = config?.maType;

    const isSmoothingEnabled =
      maType === "SMA";

    const isBBEnabled =
      maType === "SMA + Bollinger Bands";

    /* REMOVE OLD SERIES */

    if (indicatorSeriesRef.current?.SMA) {

      Object.values(indicatorSeriesRef.current.SMA).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]) } catch {}
        }
      });

      indicatorSeriesRef.current.SMA = null;
    }

    const groupedSeries = {};

    /* ================= CREATE LINES ================= */

    Object.entries(result.data).forEach(([lineName, lineData]) => {

      if (!lineData?.length) return;

      /* Skip smoothing when not needed */

      if (lineName === "smoothingMA" && !isSmoothingEnabled)
        return;

      /* Skip BB lines when BB disabled */

      if ((lineName === "bbUpper" || lineName === "bbLower") && !isBBEnabled)
        return;

      /* Convert API key → style key */

      const styleKey = lineName === "sma" ? "ma" : lineName;

      const rowConfig = rows?.find((r) => r.key === styleKey);
      const styleConfig = indicatorStyle?.SMA?.[styleKey];

      const series = addSeries("SMA", LineSeries, {

        color: styleConfig?.color || rowConfig?.color || "#2962ff",

        lineWidth: styleConfig?.width || 2,

        lineStyle: styleConfig?.lineStyle ?? 0,

        visible: styleConfig?.visible ?? true,

        priceLineVisible: false,

        lastValueVisible: true,

      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[styleKey] = series;

    });

    indicatorSeriesRef.current.SMA = groupedSeries;

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const smaGroup = indicatorSeriesRef.current?.SMA;

    if (!smaGroup) return;

    Object.entries(smaGroup).forEach(([lineName, seriesInstance]) => {

      const style = indicatorStyle?.SMA?.[lineName];

      if (!style || !seriesInstance) return;

      seriesInstance.applyOptions({

        color: style.color,

        lineWidth: style.width,

        lineStyle: style.lineStyle ?? 0,

        visible: style.visible,

        lastValueVisible: style.visible,

        opacity: style.opacity,

      });

    });

  }, [indicatorStyle]);

  return null;
}