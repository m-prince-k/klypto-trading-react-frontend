import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function UOPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

//   console.log(result, "UO result");

  /* ================= CREATE UO SERIES ================= */

  useEffect(() => {

    if (!result) return;

    // get correct array safely
    const rows = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.candles)
      ? result.data.candles
      : [];

    if (!rows.length) return;

    /* remove old series */

    if (indicatorSeriesRef.current?.UO?.ultimateoscillator) {
      try {
        indicatorSeriesRef.current.UO.ultimateoscillator.setData([]);
      } catch {}
      indicatorSeriesRef.current.UO = null;
    }

    /* create series */

    const series = addSeries("UO", LineSeries, {
      color:
        indicatorStyle?.UO?.ultimateoscillator?.color ??
        "rgba(38,166,154,1)",
      lineWidth:
        indicatorStyle?.UO?.ultimateoscillator?.width ?? 2,
      lineStyle:
        indicatorStyle?.UO?.ultimateoscillator?.lineStyle ?? 0,
      visible:
        indicatorStyle?.UO?.ultimateoscillator?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    /* map data */

    const data = rows
      .filter((d) => (d.value ?? d.uo) != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.value ?? d.uo),
      }));

    series.setData(data);

    indicatorSeriesRef.current.UO = {
      ultimateoscillator: series,
    };

  }, [result, indicatorConfigs]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const series = indicatorSeriesRef.current?.UO?.ultimateoscillator;
    if (!series) return;

    series.applyOptions({
      color:
        indicatorStyle?.UO?.ultimateoscillator?.color ??
        "rgba(38,166,154,1)",
      lineWidth:
        indicatorStyle?.UO?.ultimateoscillator?.width ?? 2,
      lineStyle:
        indicatorStyle?.UO?.ultimateoscillator?.lineStyle ?? 0,
      visible:
        indicatorStyle?.UO?.ultimateoscillator?.visible ?? true,
    });

  }, [indicatorStyle]);

  return null;
}