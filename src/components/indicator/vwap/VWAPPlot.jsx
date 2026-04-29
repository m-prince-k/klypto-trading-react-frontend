import { useEffect } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

export default function VWAPPlot({ result, indicatorStyle, indicatorSeriesRef, addSeries }) {

  useEffect(() => {
    if (!result?.data) return;

    // REMOVE OLD
    if (indicatorSeriesRef.current?.VWAP) {
      Object.values(indicatorSeriesRef.current.VWAP).forEach(s => {
        if (s?.setData) try { s.setData([]); } catch {}
      });
      indicatorSeriesRef.current.VWAP = null;
    }

    const groupedSeries = {};
    const vwapData = result.data.vwap || [];
    const upperData = result.data.upperBand || [];
    const lowerData = result.data.lowerBand || [];

    // VWAP line
    if (vwapData.length) {
      const vwapSeries = addSeries("VWAP-vwap", LineSeries, {
        color: indicatorStyle?.VWAP?.vwap?.color || "rgba(156,39,176,1)",
        lineWidth: indicatorStyle?.VWAP?.vwap?.width || 2,
        lineStyle: indicatorStyle?.VWAP?.vwap?.lineStyle || 0,
        visible: indicatorStyle?.VWAP?.vwap?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      vwapSeries.setData(vwapData);
      groupedSeries.vwap = vwapSeries;
    }

    // Upper band line
    if (upperData.length) {
      const upperSeries = addSeries("VWAP-upperBand", LineSeries, {
        color: indicatorStyle?.VWAP?.upper?.color || "rgba(239,83,80,1)",
        lineWidth: indicatorStyle?.VWAP?.upper?.width || 1,
        lineStyle: indicatorStyle?.VWAP?.upper?.lineStyle || 2,
        visible: indicatorStyle?.VWAP?.upper?.visible ?? false,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      upperSeries.setData(upperData);
      groupedSeries.upperBand = upperSeries;
    }

    // Lower band line
    if (lowerData.length) {
      const lowerSeries = addSeries("VWAP-lowerBand", LineSeries, {
        color: indicatorStyle?.VWAP?.lower?.color || "rgba(38,166,154,1)",
        lineWidth: indicatorStyle?.VWAP?.lower?.width || 1,
        lineStyle: indicatorStyle?.VWAP?.lower?.lineStyle || 2,
        visible: indicatorStyle?.VWAP?.lower?.visible ?? false,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      lowerSeries.setData(lowerData);
      groupedSeries.lowerBand = lowerSeries;
    }

    // Band fill
    if (upperData.length && lowerData.length && indicatorStyle?.VWAP?.bg?.visible) {
      const fillSeries = addSeries("VWAP-bandFill", AreaSeries, {
        topColor: indicatorStyle?.VWAP?.bg?.topFillColor1 || "rgba(156,39,176,0.1)",
        bottomColor: indicatorStyle?.VWAP?.bg?.topFillColor2 || "rgba(156,39,176,0.02)",
        lineColor: "transparent",
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const areaData = upperData.map((u, i) => ({
        time: u.time,
        value: u.value,
        bottomValue: lowerData[i]?.value ?? u.value,
      }));

      fillSeries.setData(areaData);
      groupedSeries.bandFill = fillSeries;
    }

    indicatorSeriesRef.current.VWAP = groupedSeries;
  }, [result, indicatorStyle, addSeries]);

  // APPLY STYLE dynamically
  useEffect(() => {
    const vwapGroup = indicatorSeriesRef.current?.VWAP;
    if (!vwapGroup) return;

    Object.entries(vwapGroup).forEach(([key, series]) => {
      if (key === "bandFill") return;
      const styleKey = key === "vwap" ? "vwap" : key === "upperBand" ? "upper" : "lower";
      const style = indicatorStyle?.VWAP?.[styleKey];
      if (!series || !style) return;

      series.applyOptions({
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle || 0,
        visible: style.visible,
      });
    });
  }, [indicatorStyle]);

  return null;
}