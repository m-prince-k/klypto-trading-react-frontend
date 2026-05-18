import { useEffect } from "react";
import { HistogramSeries } from "lightweight-charts";

export default function AWOPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  // chart reference to attach series to bottom pane
}) {
  useEffect(() => {
    if (!result?.data) return;

    const awo = result.data || [];

    if (!Array.isArray(awo) || awo.length === 0) return;

    // ---------- REMOVE OLD SERIES ----------
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        try {
          s?.setData?.([]);
        } catch {}
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const groupedSeries = {};

    // ---------- AWO HISTOGRAM ----------
    const style = indicatorStyle?.[indicator]?.awoBars || {};
    const palette = style?.palette || { up: "rgba(38,166,154,0.6)", down: "rgba(239,83,80,0.6)" };

    const histSeries = addSeries(indicator, HistogramSeries, {
      priceLineVisible: false,
      visible: style?.visible ?? true,
      priceScaleId: "pane_awo", // attach to bottom pane, create pane with this ID
    });

    const coloredAO = awo.map((d) => ({
      time: Number(d.time),
      value: Number(d.ao ?? d.value ?? 0),
      color: d.ao >= 0 ? palette.up : palette.down,
    }));

    histSeries.setData(coloredAO);

    groupedSeries.hist = histSeries;
    groupedSeries.rawData = awo;

    indicatorSeriesRef.current[indicator] = groupedSeries;
  }, [result]);

  // ---------- STYLE / PALETTE UPDATE ----------
  useEffect(() => {
    const g = indicatorSeriesRef.current?.[indicator];
    if (!g) return;

    const awo = g.rawData;
    if (!awo) return;

    const style = indicatorStyle?.[indicator]?.awoBars || {};
    const palette = style?.palette || { up: "rgba(38,166,154,0.6)", down: "rgba(239,83,80,0.6)" };
    const visible = style?.visible ?? true;

    const recolored = awo.map((d) => ({
      time: Number(d.time),
      value: Number(d.ao ?? d.value ?? 0),
      color: d.ao >= 0 ? palette.up : palette.down,
    }));

    g.hist?.applyOptions({ visible });
    g.hist?.setData(recolored);
  }, [indicatorStyle?.[indicator]?.awoBars?.palette?.up, indicatorStyle?.[indicator]?.awoBars?.palette?.down, indicatorStyle?.[indicator]?.awoBars?.visible]);

  return null;
}