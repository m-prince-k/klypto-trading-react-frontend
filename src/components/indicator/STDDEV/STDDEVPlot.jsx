import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function STDDEVPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {

  /* ================= CREATE STDDEV ================= */

  useEffect(() => {

    console.log("STDDEV RESULT →", result);

    if (!result) {
      console.warn("STDDEV: result missing");
      return;
    }

    /* REMOVE OLD SERIES */

    if (indicatorSeriesRef.current?.[indicator]) {

      console.log("STDDEV: removing old series");

      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]);
            try { chart.removeSeries(s); } catch {} } catch {}
        }
      });

      indicatorSeriesRef.current[indicator] = null;
    }

    const groupedSeries = {};

    /* 🔥 HANDLE BOTH STRUCTURES */

    let stddevData = [];

    if (Array.isArray(result.data)) {

      stddevData = result.data;

    } else if (result?.data?.stddev) {

      stddevData = result.data.stddev;

    }

    console.log("STDDEV DATA →", stddevData);

    if (!Array.isArray(stddevData) || !stddevData.length) {
      console.warn("STDDEV: empty data");
      return;
    }

    const style = indicatorStyle?.[indicator]?.stddev;

    const rowConfig = rows?.find((r) => r.key === "stddev");

    console.log("STDDEV STYLE →", style);

    const series = addSeries(indicator, LineSeries, {
      color: style?.color || rowConfig?.color || "rgba(33,150,243,1)",
      lineWidth: style?.width || 2,
      lineStyle: style?.lineStyle ?? 0,
      visible: style?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    if (!series) {
      console.error("STDDEV: series not created");
      return;
    }

    console.log("STDDEV: series created");

    series.setData(stddevData);

    groupedSeries.stddev = series;

    indicatorSeriesRef.current[indicator] = {
      ...groupedSeries,
      result,
    };

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const stdGroup = indicatorSeriesRef.current?.[indicator];

    if (!stdGroup) return;

    const style = indicatorStyle?.[indicator]?.stddev;

    console.log("STDDEV STYLE UPDATE →", style);

    if (stdGroup.stddev) {

      stdGroup.stddev.applyOptions({
        color: style?.color,
        lineWidth: style?.width,
        lineStyle: style?.lineStyle ?? 0,
        visible: style?.visible,
        lastValueVisible: style?.visible,
      });

    }

  }, [indicatorStyle]);

  return null;
}