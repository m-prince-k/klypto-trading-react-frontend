import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function UOPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  useEffect(() => {
    const raw = result?.data?.series;

    if (!Array.isArray(raw) || raw.length === 0) {
      console.log(":x: UO data missing", result);
      return;
    }

    if (indicatorSeriesRef.current?.UO) {
      Object.values(indicatorSeriesRef.current.UO).forEach((s) => {
        try {
          s.setData([]);
        } catch {}
      });
      indicatorSeriesRef.current.UO = null;
    }

    const uoData = raw.map((d) => ({
      time: Number(d.time),
      value: Number(d.uo),
    }));

    const uoSeries = addSeries("UO", LineSeries, {
      color: indicatorStyle?.UO?.uoLine?.color ?? "#E05273",
      lineWidth: indicatorStyle?.UO?.uoLine?.width ?? 2,
      lineStyle: indicatorStyle?.UO?.uoLine?.lineStyle ?? 0,
      visible: indicatorStyle?.UO?.uoLine?.visible ?? true,
    });

    uoSeries.setData(uoData);

    indicatorSeriesRef.current.UO = {
      uoLine: uoSeries,
      uoData,
    };

    console.log(":white_check_mark: UO plotted");
  }, [result]);

  useEffect(() => {
    const g = indicatorSeriesRef.current?.UO;
    if (!g) return;

    const style = indicatorStyle?.UO;

    g.uoLine?.applyOptions({
      color: style?.uoLine?.color,
      lineWidth: style?.uoLine?.width,
      lineStyle: style?.uoLine?.lineStyle,
      visible: style?.uoLine?.visible,
    });
  }, [indicatorStyle?.UO]);

  return null;
}
