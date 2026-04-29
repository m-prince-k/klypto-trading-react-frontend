import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function KVOPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {
  /* ================= CREATE ================= */

  useEffect(() => {
    if (!result?.data?.kvo) return;

    if (indicatorSeriesRef.current?.KVO) {
      Object.values(indicatorSeriesRef.current.KVO).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });
      indicatorSeriesRef.current.KVO = null;
    }

    const map = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const kvoData = map(result.data.kvo);
    const signalData = map(
      result.data.signal,
    ); /* :large_blue_circle: KVO LINE */

    const kvoSeries = addSeries("KVO", LineSeries, {
      color: indicatorStyle?.KVO?.kvoLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.KVO?.kvoLine?.width ?? 2,
      lineStyle: indicatorStyle?.KVO?.kvoLine?.lineStyle ?? 0,
      visible: indicatorStyle?.KVO?.kvoLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    }); /* :large_orange_circle: SIGNAL LINE */

    const signalSeries = addSeries("KVO", LineSeries, {
      color: indicatorStyle?.KVO?.signalLine?.color ?? "rgba(255,152,0,1)",
      lineWidth: indicatorStyle?.KVO?.signalLine?.width ?? 2,
      lineStyle: indicatorStyle?.KVO?.signalLine?.lineStyle ?? 0,
      visible: indicatorStyle?.KVO?.signalLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    }); /* :white_circle: ZERO LINE */

    const zeroValue = indicatorStyle?.KVO?.zeroLine?.value ?? 0;

    const zeroSeries = addSeries("KVO", LineSeries, {
      color: indicatorStyle?.KVO?.zeroLine?.color ?? "rgba(158,158,158,1)",
      lineWidth: indicatorStyle?.KVO?.zeroLine?.width ?? 1,
      lineStyle: indicatorStyle?.KVO?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.KVO?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const zeroData = kvoData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    kvoSeries.setData(kvoData);
    signalSeries.setData(signalData);
    zeroSeries.setData(zeroData);

    indicatorSeriesRef.current.KVO = {
      kvoLine: kvoSeries,
      signalLine: signalSeries,
      zeroLine: zeroSeries,
      kvoData,
    };
  }, [
    result,
    indicatorConfigs,
  ]); /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.KVO;
    if (!g) return;

    const zeroValue = indicatorStyle?.KVO?.zeroLine?.value ?? 0;

    const zeroData = g.kvoData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    g.zeroLine?.setData(zeroData);

    g.kvoLine?.applyOptions({
      color: indicatorStyle?.KVO?.kvoLine?.color,
      lineWidth: indicatorStyle?.KVO?.kvoLine?.width,
      lineStyle: indicatorStyle?.KVO?.kvoLine?.lineStyle ?? 0,
      visible: indicatorStyle?.KVO?.kvoLine?.visible,
    });

    g.signalLine?.applyOptions({
      color: indicatorStyle?.KVO?.signalLine?.color,
      lineWidth: indicatorStyle?.KVO?.signalLine?.width,
      lineStyle: indicatorStyle?.KVO?.signalLine?.lineStyle ?? 0,
      visible: indicatorStyle?.KVO?.signalLine?.visible,
    });

    g.zeroLine?.applyOptions({
      color: indicatorStyle?.KVO?.zeroLine?.color,
      lineWidth: indicatorStyle?.KVO?.zeroLine?.width,
      lineStyle: indicatorStyle?.KVO?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.KVO?.zeroLine?.visible,
    });
  }, [indicatorStyle]);

  return null;
}
