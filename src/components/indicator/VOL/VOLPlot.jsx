import { useEffect } from "react";
import { HistogramSeries, LineSeries } from "lightweight-charts";

export default function VOLPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  // chart reference to attach series to bottom pane
}) {
  useEffect(() => {
    if (!result?.data) return;

    const volume = result.data.volume || [];
    const volumeMA = result.data.volumeMA || [];

    if (!Array.isArray(volume) || volume.length === 0) return;

    // ---------- REMOVE OLD SERIES ----------
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        try {
          s?.setData?.([]);
        } catch {}
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const groupedSeries = {};

    // ---------- VOLUME BARS ----------
    const volSeries = addSeries(indicator,
      HistogramSeries,
      {
        priceLineVisible: false,
        visible: indicatorStyle?.[indicator]?.volumeBars?.visible ?? true,
        priceScaleId: "pane_volume", // make sure you create a bottom pane with this id
      }
    );

    const coloredVolume = volume.map((d, i, arr) => {
      const prev = arr[i - 1];
      const isGrowing = prev ? d.value >= prev.value : true;

      return {
        time: d.time,
        value: d.value,
        color: isGrowing
          ? indicatorStyle?.[indicator]?.volumeBars?.palette?.up
          : indicatorStyle?.[indicator]?.volumeBars?.palette?.down,
      };
    });

    volSeries.setData(coloredVolume);

    // ---------- VOLUME MA LINE ----------
    const maSeries = addSeries(indicator,
      LineSeries,
      {
        color: indicatorStyle?.[indicator]?.volumeMA?.color ?? "rgba(255,193,7,1)",
        lineWidth: indicatorStyle?.[indicator]?.volumeMA?.width ?? 2,
        lineStyle: indicatorStyle?.[indicator]?.volumeMA?.lineStyle ?? 0,
        visible: indicatorStyle?.[indicator]?.volumeMA?.visible ?? true,
        priceLineVisible: false,
        priceScaleId: "pane_volume",
      }
    );

    maSeries.setData(volumeMA);

    groupedSeries.volume = volSeries;
    groupedSeries.volumeMA = maSeries;
    groupedSeries.rawData = volume;

    indicatorSeriesRef.current[indicator] = groupedSeries;
  }, [result]);

  // ---------- STYLE / PALETTE UPDATE ----------
  useEffect(() => {
    const g = indicatorSeriesRef.current?.[indicator];
    if (!g) return;

    const volume = g.rawData;
    if (!volume) return;

    const palette = indicatorStyle?.[indicator]?.volumeBars?.palette;
    const volVisible = indicatorStyle?.[indicator]?.volumeBars?.visible ?? true;

    // recolor volume bars
    const recolored = volume.map((d, i, arr) => {
      const prev = arr[i - 1];
      const isGrowing = prev ? d.value >= prev.value : true;
      return {
        time: d.time,
        value: d.value,
        color: isGrowing ? palette?.up : palette?.down,
      };
    });

    g.volume?.applyOptions({ visible: volVisible });
    g.volume?.setData(recolored);

    // update MA line style
    g.volumeMA?.applyOptions({
      color: indicatorStyle?.[indicator]?.volumeMA?.color,
      lineWidth: indicatorStyle?.[indicator]?.volumeMA?.width,
      lineStyle: indicatorStyle?.[indicator]?.volumeMA?.lineStyle,
      visible: indicatorStyle?.[indicator]?.volumeMA?.visible,
    });
  }, [indicatorStyle?.[indicator]]);

  return null;
}