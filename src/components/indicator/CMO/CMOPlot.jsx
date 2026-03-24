import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function CMOPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result?.data?.cmo) return;

    if (indicatorSeriesRef.current?.CMO) {

      Object.values(indicatorSeriesRef.current.CMO).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.CMO = null;
    }

    const mapSeries = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const cmoData = mapSeries(result.data.cmo);

    /* ================= CMO LINE ================= */

    const cmoSeries = addSeries("CMO", LineSeries, {
      color: indicatorStyle?.CMO?.cmoLine?.color ?? "rgba(38,166,154,1)",
      lineWidth: indicatorStyle?.CMO?.cmoLine?.width ?? 2,
      lineStyle: indicatorStyle?.CMO?.cmoLine?.lineStyle ?? 0,
      visible: indicatorStyle?.CMO?.cmoLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    /* ================= ZERO LINE ================= */

    const zeroValue = indicatorStyle?.CMO?.zeroLine?.value ?? 0;

    const zeroSeries = addSeries("CMO", LineSeries, {
      color: indicatorStyle?.CMO?.zeroLine?.color ?? "rgba(158,158,158,1)",
      lineWidth: indicatorStyle?.CMO?.zeroLine?.width ?? 1,
      lineStyle: indicatorStyle?.CMO?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.CMO?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const zeroData = cmoData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    cmoSeries.setData(cmoData);
    zeroSeries.setData(zeroData);

    indicatorSeriesRef.current.CMO = {
      cmoLine: cmoSeries,
      zeroLine: zeroSeries,
      cmoData,
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.CMO;
    if (!group) return;

    const zeroValue = indicatorStyle?.CMO?.zeroLine?.value ?? 0;

    const zeroData = group.cmoData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    group.zeroLine?.setData(zeroData);

    group.cmoLine?.applyOptions({
      color: indicatorStyle?.CMO?.cmoLine?.color,
      lineWidth: indicatorStyle?.CMO?.cmoLine?.width,
      lineStyle: indicatorStyle?.CMO?.cmoLine?.lineStyle ?? 0,
      visible: indicatorStyle?.CMO?.cmoLine?.visible,
    });

    group.zeroLine?.applyOptions({
      color: indicatorStyle?.CMO?.zeroLine?.color,
      lineWidth: indicatorStyle?.CMO?.zeroLine?.width,
      lineStyle: indicatorStyle?.CMO?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.CMO?.zeroLine?.visible,
    });

  }, [indicatorStyle]);

  return null;
}