import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function MomentumPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  /* ================= CREATE MOMENTUM ================= */
  useEffect(() => {
    const momentumData = result?.data?.momentum ?? [];
    if (!momentumData.length) return;

    // Remove previous series if exists
    if (indicatorSeriesRef.current?.MOM) {
      Object.values(indicatorSeriesRef.current.MOM).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });
      indicatorSeriesRef.current.MOM = null;
    }

    const groupedSeries = {};

    const rowConfig = rows?.find((r) => r.key === "momentum");
    const styleConfig = indicatorStyle?.MOM?.momentum;

    const momentumSeries = addSeries("MOM", LineSeries, {
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

    indicatorSeriesRef.current.MOM = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */
  useEffect(() => {
    const momentumGroup = indicatorSeriesRef.current?.MOM;
    if (!momentumGroup) return;

    const styleConfig = indicatorStyle?.MOM?.momentum;

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