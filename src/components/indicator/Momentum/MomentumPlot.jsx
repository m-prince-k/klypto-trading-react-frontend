import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function MomentumPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {
  /* ================= CREATE MOMENTUM ================= */
  useEffect(() => {
    const momentumData = result?.data?.momentum ?? [];
    if (!momentumData.length) return;

    // Remove previous series if exists
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
            try { chart.removeSeries(s); } catch {}
          } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const groupedSeries = {};

    const rowConfig = rows?.find((r) => r.key === "momentum");
    const styleConfig = indicatorStyle?.[indicator]?.momentum;

    const momentumSeries = addSeries(indicator, LineSeries, {
      color: styleConfig?.color || rowConfig?.color || "rgba(41,98,255,1)",
      lineWidth: styleConfig?.width || 2,
      visible: styleConfig?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    if (!momentumSeries) return;

    momentumSeries.setData(momentumData);

    groupedSeries.MOM = momentumSeries;
    groupedSeries.momentumData = momentumData;

    indicatorSeriesRef.current[indicator] = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */
  useEffect(() => {
    const momentumGroup = indicatorSeriesRef.current?.[indicator];
    if (!momentumGroup) return;

    const styleConfig = indicatorStyle?.[indicator]?.momentum;

    if (momentumGroup.MOM) {
      momentumGroup.MOM.applyOptions({
        color: styleConfig?.color,
        lineWidth: styleConfig?.width,
        visible: styleConfig?.visible,
      });
    }
  }, [indicatorStyle]);

  return null;
}