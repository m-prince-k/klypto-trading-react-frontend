import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function AroonOscillatorPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* ================= CREATE INDICATOR ================= */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.AroonOscillator) {
      Object.values(indicatorSeriesRef.current.AroonOscillator).forEach((s)=>{
        if (s?.setData) {
          try { s.setData([]) } catch {}
        }
      });
      indicatorSeriesRef.current.AroonOscillator = null;
    }

    const groupedSeries = {};
    const oscData = result.data;

    const style = indicatorStyle?.AroonOscillator;

    const center = style?.center?.value ?? 0;
    const upper = style?.upperLevel?.value ?? 90;
    const lower = style?.lowerLevel?.value ?? -90;

    /* ================= OSCILLATOR ================= */

    const oscSeries = addSeries("AroonOscillator", BaselineSeries,{
      baseValue: { type: "price", price: center },

      topLineColor: style?.oscillator?.color0,
      bottomLineColor: style?.oscillator?.color1,

      topFillColor1: style?.oscillatorFillBull?.color0,
      topFillColor2: style?.oscillatorFillBull?.color0,

      bottomFillColor1: style?.oscillatorFillBear?.color0,
      bottomFillColor2: style?.oscillatorFillBear?.color0,

      lineWidth: style?.oscillator?.width || 2,
      visible: style?.oscillator?.visible ?? true,

      lastValueVisible: true
    });

    oscSeries.setData(oscData);

    groupedSeries.oscillator = oscSeries;

    /* ================= LEVEL LINES ================= */

    const makeLevelData = (value) =>
      oscData.map((p)=>({time:p.time,value}));

    const upperSeries = addSeries("AroonOscillator",LineSeries,{
      color: style?.upperLevel?.color,
      lineWidth: style?.upperLevel?.width,
      lineStyle: style?.upperLevel?.lineStyle ?? 0,
      visible: style?.upperLevel?.visible
    });

    const centerSeries = addSeries("AroonOscillator",LineSeries,{
      color: style?.center?.color,
      lineWidth: style?.center?.width,
      lineStyle: style?.center?.lineStyle ?? 0,
      visible: style?.center?.visible
    });

    const lowerSeries = addSeries("AroonOscillator",LineSeries,{
      color: style?.lowerLevel?.color,
      lineWidth: style?.lowerLevel?.width,
      lineStyle: style?.lowerLevel?.lineStyle ?? 0,
      visible: style?.lowerLevel?.visible
    });

    upperSeries.setData(makeLevelData(upper));
    centerSeries.setData(makeLevelData(center));
    lowerSeries.setData(makeLevelData(lower));

    groupedSeries.upperLevel = upperSeries;
    groupedSeries.center = centerSeries;
    groupedSeries.lowerLevel = lowerSeries;

    indicatorSeriesRef.current.AroonOscillator = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(()=>{

    const group = indicatorSeriesRef.current?.AroonOscillator;
    if (!group) return;

    const style = indicatorStyle?.AroonOscillator;

    group.oscillator?.applyOptions({
      topLineColor: style?.oscillator?.color0,
      bottomLineColor: style?.oscillator?.color1,
      lineWidth: style?.oscillator?.width,
      visible: style?.oscillator?.visible
    });

    group.center?.applyOptions({
      color: style?.center?.color,
      lineWidth: style?.center?.width,
      visible: style?.center?.visible
    });

    group.upperLevel?.applyOptions({
      color: style?.upperLevel?.color,
      lineWidth: style?.upperLevel?.width,
      visible: style?.upperLevel?.visible
    });

    group.lowerLevel?.applyOptions({
      color: style?.lowerLevel?.color,
      lineWidth: style?.lowerLevel?.width,
      visible: style?.lowerLevel?.visible
    });

  }, [indicatorStyle]);

  return null;
}