import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function UOPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {
  useEffect(() => {
    const raw = result?.data?.series;

    if (!Array.isArray(raw) || raw.length === 0) {
      console.log(":x: UO data missing", result);
      return;
    }

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        try {
          s.setData([]);
            try { chart.removeSeries(s); } catch {}
        } catch {}
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const uoData = raw.map((d) => ({
      time: Number(d.time),
      value: Number(d.uo),
    }));

    const uoSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.uoLine?.color ?? "#E05273",
      lineWidth: indicatorStyle?.[indicator]?.uoLine?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.uoLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.uoLine?.visible ?? true,
    });

    uoSeries.setData(uoData);

    indicatorSeriesRef.current[indicator] = {
      uoLine: uoSeries,
      uoData,
    };

    console.log(":white_check_mark: UO plotted");
  }, [result]);

  useEffect(() => {
    const g = indicatorSeriesRef.current?.[indicator];
    if (!g) return;

    const style = indicatorStyle?.[indicator];

    g.uoLine?.applyOptions({
      color: style?.uoLine?.color,
      lineWidth: style?.uoLine?.width,
      lineStyle: style?.uoLine?.lineStyle,
      visible: style?.uoLine?.visible,
    });
  }, [indicatorStyle?.[indicator]]);

  return null;
}
