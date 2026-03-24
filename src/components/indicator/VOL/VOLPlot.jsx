import { useEffect } from "react";
import { HistogramSeries, LineSeries } from "lightweight-charts";

export default function VOLPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  /* ================= CREATE ================= */

  useEffect(() => {
    const volume = result?.data?.volume;
    const volumeMA = result?.data?.volumeMA;

    if (!Array.isArray(volume) || volume.length === 0) {
      console.log(":x: VOL data missing", result);
      return;
    } // :fire: REMOVE OLD

    if (indicatorSeriesRef.current?.VOL) {
      Object.values(indicatorSeriesRef.current.VOL).forEach((s) => {
        try {
          s.setData([]);
        } catch {}
      });
      indicatorSeriesRef.current.VOL = null;
    } /* :fire: HISTOGRAM SERIES */

    const volumeSeries = addSeries("VOL", HistogramSeries, {
      priceLineVisible: false,
    }); /* :fire: APPLY COLOR LOGIC (TradingView Style) */

    const coloredData = volume.map((d, i) => {
      const prev = volume[i - 1];

      const isGrowing = prev ? d.value >= prev.value : true;

      return {
        time: d.time,
        value: d.value,
        color: isGrowing
          ? indicatorStyle?.VOL?.volumeBars?.upColor || "rgba(38,166,154,0.6)"
          : indicatorStyle?.VOL?.volumeBars?.downColor || "rgba(239,83,80,0.6)",
      };
    });

    volumeSeries.setData(coloredData); /* :fire: MA LINE */

    const maSeries = addSeries("VOL", LineSeries, {
      color: indicatorStyle?.VOL?.volumeMA?.color ?? "rgba(255,193,7,1)",
      lineWidth: indicatorStyle?.VOL?.volumeMA?.width ?? 2,
      lineStyle: indicatorStyle?.VOL?.volumeMA?.lineStyle ?? 0,
      visible: indicatorStyle?.VOL?.volumeMA?.visible ?? true,
      priceLineVisible: false,
    });

    maSeries.setData(volumeMA ?? []);

    indicatorSeriesRef.current.VOL = {
      volume: volumeSeries,
      volumeMA: maSeries,
      rawData: volume,
    };
  }, [result]); /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.VOL;
    if (!g) return;

    const volume = g.rawData;
    if (!volume) return; /* :fire: RE-COLOR ON STYLE CHANGE */

    const recolored = volume.map((d, i) => {
      const prev = volume[i - 1];
      const isGrowing = prev ? d.value >= prev.value : true;

      return {
        time: d.time,
        value: d.value,
        color: isGrowing
          ? indicatorStyle?.VOL?.volumeBars?.upColor
          : indicatorStyle?.VOL?.volumeBars?.downColor,
      };
    });

    g.volume?.setData(recolored); /* :fire: MA STYLE UPDATE */

    g.volumeMA?.applyOptions({
      color: indicatorStyle?.VOL?.volumeMA?.color,
      lineWidth: indicatorStyle?.VOL?.volumeMA?.width,
      lineStyle: indicatorStyle?.VOL?.volumeMA?.lineStyle,
      visible: indicatorStyle?.VOL?.volumeMA?.visible,
    });
  }, [indicatorStyle?.VOL]);

  return null;
}
