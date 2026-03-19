import { useEffect } from "react";
import { LineSeries, HistogramSeries } from "lightweight-charts";

export default function PVOPlot({
  result,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {

  /* ================= CREATE ================= */

  useEffect(() => {
    if (!result?.data?.pvo?.length) return;

    if (indicatorSeriesRef.current?.PVO) {
      Object.values(indicatorSeriesRef.current.PVO).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
    }

    const grouped = {};

    /* 🔥 HISTOGRAM */
    const histSeries = addSeries("PVO", HistogramSeries, {
      color: "rgba(0,200,83,1)",
      priceLineVisible: false,
    });

    const histData = result.data.hist.map((d) => ({
      time: d.time,
      value: d.value,
      color: d.value >= 0
        ? "rgba(0,200,83,1)"
        : "rgba(255,82,82,1)",
    }));

    histSeries.setData(histData);

    /* 🔥 PVO LINE */
    const pvoSeries = addSeries("PVO", LineSeries, {
      color: indicatorStyle?.PVO?.pvo?.color || "rgba(33,150,243,1)",
      lineWidth: 2,
      priceLineVisible: false,
    });

    pvoSeries.setData(result.data.pvo);

    /* 🔥 SIGNAL LINE */
    const signalSeries = addSeries("PVO", LineSeries, {
      color: indicatorStyle?.PVO?.signal?.color || "rgba(255,193,7,1)",
      lineWidth: 2,
      priceLineVisible: false,
    });

    signalSeries.setData(result.data.signal);

    grouped.hist = histSeries;
    grouped.pvo = pvoSeries;
    grouped.signal = signalSeries;

    indicatorSeriesRef.current.PVO = grouped;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const group = indicatorSeriesRef.current?.PVO;
    if (!group) return;

    group.pvo?.applyOptions({
      color: indicatorStyle?.PVO?.pvo?.color,
      lineWidth: indicatorStyle?.PVO?.pvo?.width,
    });

    group.signal?.applyOptions({
      color: indicatorStyle?.PVO?.signal?.color,
      lineWidth: indicatorStyle?.PVO?.signal?.width,
    });

  }, [indicatorStyle]);

  return null;
}