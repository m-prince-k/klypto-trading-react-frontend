import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

export default function AroonOscillatorPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries
}) {

  /* CREATE INDICATOR */

  useEffect(() => {

    if (!result) return;

    if (indicatorSeriesRef.current?.AroonOscillator) {
      Object.values(indicatorSeriesRef.current.AroonOscillator).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.AroonOscillator = null;
    }

    const groupedSeries = {};
    const oscData = result.data;

    const center = indicatorStyle?.AroonOscillator?.center?.value ?? 0;
    const upper = indicatorStyle?.AroonOscillator?.upperLevel?.value ?? 90;
    const lower = indicatorStyle?.AroonOscillator?.lowerLevel?.value ?? -90;

    /* OSCILLATOR LINE */

    const oscSeries = addSeries("AroonOscillator", LineSeries, {
      color: indicatorStyle?.AroonOscillator?.oscillator?.color0,
      lineWidth: indicatorStyle?.AroonOscillator?.oscillator?.width || 2,
      visible: indicatorStyle?.AroonOscillator?.oscillator?.visible ?? true,
      lastValueVisible: true
    });

    oscSeries.setData(oscData);
    groupedSeries.oscillator = oscSeries;

    /* LEVEL LINES */

    const makeLevelData = (value) =>
      oscData.map(p => ({ time: p.time, value }));

    const upperSeries = addSeries("AroonOscillator", LineSeries,{
      color: indicatorStyle?.AroonOscillator?.upperLevel?.color,
      lineWidth: indicatorStyle?.AroonOscillator?.upperLevel?.width,
      lineStyle: indicatorStyle?.AroonOscillator?.upperLevel?.lineStyle,
      visible: indicatorStyle?.AroonOscillator?.upperLevel?.visible
    });

    const centerSeries = addSeries("AroonOscillator", LineSeries,{
      color: indicatorStyle?.AroonOscillator?.center?.color,
      lineWidth: indicatorStyle?.AroonOscillator?.center?.width,
      lineStyle: indicatorStyle?.AroonOscillator?.center?.lineStyle,
      visible: indicatorStyle?.AroonOscillator?.center?.visible
    });

    const lowerSeries = addSeries("AroonOscillator", LineSeries,{
      color: indicatorStyle?.AroonOscillator?.lowerLevel?.color,
      lineWidth: indicatorStyle?.AroonOscillator?.lowerLevel?.width,
      lineStyle: indicatorStyle?.AroonOscillator?.lowerLevel?.lineStyle,
      visible: indicatorStyle?.AroonOscillator?.lowerLevel?.visible
    });

    upperSeries.setData(makeLevelData(upper));
    centerSeries.setData(makeLevelData(center));
    lowerSeries.setData(makeLevelData(lower));

    groupedSeries.upperLevel = upperSeries;
    groupedSeries.center = centerSeries;
    groupedSeries.lowerLevel = lowerSeries;

    /* OSCILLATOR FILL */

    const fillSeries = addSeries("AroonOscillator", BaselineSeries,{
      baseValue: { type: "price", price: center },
      topFillColor1: indicatorStyle?.AroonOscillator?.oscillatorFill?.color0,
      topFillColor2: indicatorStyle?.AroonOscillator?.oscillatorFill?.color0,
      bottomFillColor1: indicatorStyle?.AroonOscillator?.oscillatorFill?.color1,
      bottomFillColor2: indicatorStyle?.AroonOscillator?.oscillatorFill?.color1,
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: indicatorStyle?.AroonOscillator?.oscillatorFill?.visible
    });

    fillSeries.setData(oscData);

    groupedSeries.oscillatorFill = fillSeries;

    indicatorSeriesRef.current.AroonOscillator = groupedSeries;

  }, [result]);


  /* STYLE UPDATE */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.AroonOscillator;
    if (!group) return;

    const style = indicatorStyle?.AroonOscillator;

    group.oscillator?.applyOptions({
      color: style?.oscillator?.color0,
      lineWidth: style?.oscillator?.width,
      visible: style?.oscillator?.visible,
      opacity: style?.oscillator?.opacity
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

    group.oscillatorFill?.applyOptions({
      topFillColor1: style?.oscillatorFill?.color0,
      bottomFillColor1: style?.oscillatorFill?.color1,
      visible: style?.oscillatorFill?.visible
    });

  }, [indicatorStyle]);

  return null;
}