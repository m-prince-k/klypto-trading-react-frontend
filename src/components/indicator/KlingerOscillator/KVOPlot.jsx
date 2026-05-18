import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function KVOPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
  chart
}) {
  /* ================= CREATE ================= */

  useEffect(() => {
    if (!result?.data?.kvo) return;

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

    const map = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const kvoData = map(result.data.kvo);
    const signalData = map(
      result.data.signal,
    ); /* :large_blue_circle: KVO LINE */

    const kvoSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.kvoLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.[indicator]?.kvoLine?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.kvoLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.kvoLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    }); /* :large_orange_circle: SIGNAL LINE */

    const signalSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.signalLine?.color ?? "rgba(255,152,0,1)",
      lineWidth: indicatorStyle?.[indicator]?.signalLine?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.signalLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.signalLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    }); /* :white_circle: ZERO LINE */

    const zeroValue = indicatorStyle?.[indicator]?.zeroLine?.value ?? 0;

    const zeroSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.zeroLine?.color ?? "rgba(158,158,158,1)",
      lineWidth: indicatorStyle?.[indicator]?.zeroLine?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.zeroLine?.visible ?? true,
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

    indicatorSeriesRef.current[indicator] = {
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
    const g = indicatorSeriesRef.current?.[indicator];
    if (!g) return;

    const zeroValue = indicatorStyle?.[indicator]?.zeroLine?.value ?? 0;

    const zeroData = g.kvoData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    g.zeroLine?.setData(zeroData);

    g.kvoLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.kvoLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.kvoLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.kvoLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.kvoLine?.visible,
    });

    g.signalLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.signalLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.signalLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.signalLine?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.signalLine?.visible,
    });

    g.zeroLine?.applyOptions({
      color: indicatorStyle?.[indicator]?.zeroLine?.color,
      lineWidth: indicatorStyle?.[indicator]?.zeroLine?.width,
      lineStyle: indicatorStyle?.[indicator]?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.zeroLine?.visible,
    });
  }, [indicatorStyle]);

  return null;
}
