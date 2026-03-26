import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function ZIGZAGPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  indicatorConfigs,
}) {

  useEffect(() => {

    if (!result?.data) return;

    if (indicatorSeriesRef.current?.ZIGZAG) {
      Object.values(indicatorSeriesRef.current.ZIGZAG).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.ZIGZAG = null;
    }

    const zigzagData = result.data.zigzagLine ?? [];
    const pivotData = result.data.paneLabels ?? [];

    const zigzagSeries = addSeries("ZIGZAG", LineSeries, {
      color: indicatorStyle?.ZIGZAG?.zigzagLine?.color ?? "#2962ff",
      lineWidth: indicatorStyle?.ZIGZAG?.zigzagLine?.width ?? 2,
      visible: indicatorStyle?.ZIGZAG?.zigzagLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    zigzagSeries.setData(zigzagData);

    // const markers = pivotData.map((p) => ({
    //   time: p.time,
    //   position: p.type === "high" ? "aboveBar" : "belowBar",
    //   color: indicatorStyle?.ZIGZAG?.paneLabels?.backgroundColor ?? "#2962ff",
    //   shape: "circle",
    //   text: p.type === "high" ? "H" : "L",
    // }));

    // zigzagSeries.setMarkers(markers);

    indicatorSeriesRef.current.ZIGZAG = {
      zigzagLine: zigzagSeries,
      pivots: pivotData,
    };

  }, [result, indicatorConfigs]);


  useEffect(() => {

    const group = indicatorSeriesRef.current?.ZIGZAG;
    if (!group) return;

    group.zigzagLine?.applyOptions({
      color: indicatorStyle?.ZIGZAG?.zigzagLine?.color,
      lineWidth: indicatorStyle?.ZIGZAG?.zigzagLine?.width,
      visible: indicatorStyle?.ZIGZAG?.zigzagLine?.visible,
    });

  }, [indicatorStyle]);

  return null;
}