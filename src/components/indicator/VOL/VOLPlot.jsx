import { useEffect } from "react";
import { HistogramSeries, LineSeries } from "lightweight-charts";

export default function VOLPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {

    const volumeData = result?.data?.volume;
    const maData = result?.data?.volumeMA;

    if (!Array.isArray(volumeData) || !volumeData.length) {
      console.log("❌ VOL no data");
      return;
    }

    // 🔥 REMOVE OLD
    if (indicatorSeriesRef.current?.VOL) {
      Object.values(indicatorSeriesRef.current.VOL).forEach((s) => {
        try { s.setData([]); } catch {}
      });
      indicatorSeriesRef.current.VOL = null;
    }

    /* 🔥 HISTOGRAM */
    const volSeries = addSeries("VOL", HistogramSeries, {
      priceLineVisible: false,
      lastValueVisible: true,
      color: indicatorStyle?.VOL?.volume?.color,
      visible: indicatorStyle?.VOL?.volume?.visible,
    });

    /* 🔥 COLOR LOGIC */
    const formattedVolume = volumeData.map((d, i, arr) => {

      let color = indicatorStyle?.VOL?.volume?.color;

      if (indicatorConfigs?.VOL?.colorByPrevious && i > 0) {
        color =
          d.value >= arr[i - 1].value
            ? "rgba(0,200,83,1)"
            : "rgba(244,67,54,1)";
      } else if (d.rising) {
        color = "rgba(0,200,83,1)";
      } else if (d.falling) {
        color = "rgba(244,67,54,1)";
      }

      return {
        time: d.time,
        value: d.value,
        color,
      };
    });

    volSeries.setData(formattedVolume);

    /* 🔥 MA LINE */
    let maSeries = null;

    if (Array.isArray(maData) && maData.length) {
      maSeries = addSeries("VOL", LineSeries, {
        color: indicatorStyle?.VOL?.volumeMA?.color,
        lineWidth: indicatorStyle?.VOL?.volumeMA?.width ?? 2,
        visible: indicatorStyle?.VOL?.volumeMA?.visible,
        priceLineVisible: false,
      });

      maSeries.setData(maData);
    }

    indicatorSeriesRef.current.VOL = {
      volume: volSeries,
      volumeMA: maSeries,
    };

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.VOL;
    if (!group) return;

    group.volume?.applyOptions({
      color: indicatorStyle?.VOL?.volume?.color,
      visible: indicatorStyle?.VOL?.volume?.visible,
    });

    group.volumeMA?.applyOptions({
      color: indicatorStyle?.VOL?.volumeMA?.color,
      lineWidth: indicatorStyle?.VOL?.volumeMA?.width,
      visible: indicatorStyle?.VOL?.volumeMA?.visible,
    });

  }, [indicatorStyle?.VOL]);

  return null;
}