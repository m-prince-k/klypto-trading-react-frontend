import { useEffect } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

export default function SuperTrendPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  const buildTrendData = (data = []) => {
    const up = [];
    const down = [];
    const mid = [];

    if (!Array.isArray(data)) return { up, down, mid };

    data.forEach((d) => {
      if (!d?.time) return;

      up.push({
        time: d.time,
        value: d.upTrend ?? null,
      });

      down.push({
        time: d.time,
        value: d.downTrend ?? null,
      });

      mid.push({
        time: d.time,
        value: d.supertrend ?? null,
      });
    });

    return { up, down, mid };
  };

  useEffect(() => {
    const raw = result?.data;

    const data = Array.isArray(raw) ? raw : Object.values(raw || {});

    if (!data.length) {
      console.log("SuperTrend: no data");
      return;
    }

    /* REMOVE OLD SERIES */

    if (indicatorSeriesRef.current?.SuperTrend) {
      Object.values(indicatorSeriesRef.current.SuperTrend).forEach((s) => {
        try {
          s.setData([]);
        } catch {}
      });

      indicatorSeriesRef.current.SuperTrend = null;
    }

    /* CREATE SERIES */

    const upLine = addSeries("SuperTrend", LineSeries, {
      color: indicatorStyle?.SuperTrend?.upTrend?.color || "#26a69a",
      lineWidth: indicatorStyle?.SuperTrend?.upTrend?.width || 2,
    });

    const downLine = addSeries("SuperTrend", LineSeries, {
      color: indicatorStyle?.SuperTrend?.downTrend?.color || "#ef5350",
      lineWidth: indicatorStyle?.SuperTrend?.downTrend?.width || 2,
    });

    const midLine = addSeries("SuperTrend", LineSeries, {
      color: indicatorStyle?.SuperTrend?.bodyMiddle?.color || "#999",
      lineWidth: indicatorStyle?.SuperTrend?.bodyMiddle?.width || 1,
      visible: indicatorStyle?.SuperTrend?.bodyMiddle?.visible ?? false,
    });

    const upBg = addSeries("SuperTrend", AreaSeries, {
      topColor:
        indicatorStyle?.SuperTrend?.upTrendBg?.color0 || "rgba(0,200,0,0.2)",
      bottomColor:
        indicatorStyle?.SuperTrend?.upTrendBg?.color1 || "rgba(0,200,0,0.02)",
      lineColor: "transparent",
      lineWidth: 0,
    });

    const downBg = addSeries("SuperTrend", AreaSeries, {
      topColor:
        indicatorStyle?.SuperTrend?.downTrendBg?.color0 || "rgba(200,0,0,0.2)",
      bottomColor:
        indicatorStyle?.SuperTrend?.downTrendBg?.color1 || "rgba(200,0,0,0.02)",
      lineColor: "transparent",
      lineWidth: 0,
    });

    /* FORMAT DATA */

    const { up, down, mid } = buildTrendData(data);

    console.log("SuperTrend up:", up.length);
    console.log("SuperTrend down:", down.length);

    /* SET DATA */

    upLine.setData(up);
    downLine.setData(down);
    midLine.setData(mid);

    upBg.setData(up);
    downBg.setData(down);

    indicatorSeriesRef.current.SuperTrend = {
      upTrend: upLine,
      downTrend: downLine,
      bodyMiddle: midLine,
      upTrendBg: upBg,
      downTrendBg: downBg,
    };
  }, [result]);

  /* STYLE UPDATE */

  useEffect(() => {
    const st = indicatorSeriesRef.current?.SuperTrend;
    if (!st) return;

    st.upTrend?.applyOptions({
      color: indicatorStyle?.SuperTrend?.upTrend?.color,
      lineWidth: indicatorStyle?.SuperTrend?.upTrend?.width,
      visible: indicatorStyle?.SuperTrend?.upTrend?.visible,
    });

    st.downTrend?.applyOptions({
      color: indicatorStyle?.SuperTrend?.downTrend?.color,
      lineWidth: indicatorStyle?.SuperTrend?.downTrend?.width,
      visible: indicatorStyle?.SuperTrend?.downTrend?.visible,
    });
  }, [indicatorStyle]);

  return null;
}
