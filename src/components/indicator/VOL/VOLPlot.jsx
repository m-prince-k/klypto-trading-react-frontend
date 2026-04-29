import { useEffect } from "react";
import { HistogramSeries, LineSeries } from "lightweight-charts";

export default function VOLPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart, // chart reference to attach series to bottom pane
}) {
  useEffect(() => {
    if (!result?.data) return;

    const volume = result.data.volume || [];
    const volumeMA = result.data.volumeMA || [];

    if (!Array.isArray(volume) || volume.length === 0) return;

    // ---------- REMOVE OLD SERIES ----------
    if (indicatorSeriesRef.current?.VOL) {
      Object.values(indicatorSeriesRef.current.VOL).forEach((s) => {
        try {
          s?.setData?.([]);
        } catch {}
      });
      indicatorSeriesRef.current.VOL = null;
    }

    const groupedSeries = {};

    // ---------- VOLUME BARS ----------
    const volSeries = addSeries(
      "VOL",
      HistogramSeries,
      {
        priceLineVisible: false,
        visible: indicatorStyle?.VOL?.volumeBars?.visible ?? true,
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
          ? indicatorStyle?.VOL?.volumeBars?.palette?.up
          : indicatorStyle?.VOL?.volumeBars?.palette?.down,
      };
    });

    volSeries.setData(coloredVolume);

    // ---------- VOLUME MA LINE ----------
    const maSeries = addSeries(
      "VOL",
      LineSeries,
      {
        color: indicatorStyle?.VOL?.volumeMA?.color ?? "rgba(255,193,7,1)",
        lineWidth: indicatorStyle?.VOL?.volumeMA?.width ?? 2,
        lineStyle: indicatorStyle?.VOL?.volumeMA?.lineStyle ?? 0,
        visible: indicatorStyle?.VOL?.volumeMA?.visible ?? true,
        priceLineVisible: false,
        priceScaleId: "pane_volume",
      }
    );

    maSeries.setData(volumeMA);

    groupedSeries.volume = volSeries;
    groupedSeries.volumeMA = maSeries;
    groupedSeries.rawData = volume;

    indicatorSeriesRef.current.VOL = groupedSeries;
  }, [result]);

  // ---------- STYLE / PALETTE UPDATE ----------
  useEffect(() => {
    const g = indicatorSeriesRef.current?.VOL;
    if (!g) return;

    const volume = g.rawData;
    if (!volume) return;

    const palette = indicatorStyle?.VOL?.volumeBars?.palette;
    const volVisible = indicatorStyle?.VOL?.volumeBars?.visible ?? true;

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
      color: indicatorStyle?.VOL?.volumeMA?.color,
      lineWidth: indicatorStyle?.VOL?.volumeMA?.width,
      lineStyle: indicatorStyle?.VOL?.volumeMA?.lineStyle,
      visible: indicatorStyle?.VOL?.volumeMA?.visible,
    });
  }, [indicatorStyle?.VOL]);

  return null;
}