import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function TRIXPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {

    if (!result?.data?.trix) return;

    if (indicatorSeriesRef.current?.TRIX) {

      Object.values(indicatorSeriesRef.current.TRIX).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });

      indicatorSeriesRef.current.TRIX = null;
    }

    const mapSeries = (arr) =>
      (arr || []).map((p) => ({
        time: Number(p.time),
        value: Number(p.value),
      }));

    const trixData = mapSeries(result.data.trix);

    /* ================= TRIX LINE ================= */

    const trixSeries = addSeries("TRIX", LineSeries, {
      color: indicatorStyle?.TRIX?.trixLine?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.TRIX?.trixLine?.width ?? 2,
      lineStyle: indicatorStyle?.TRIX?.trixLine?.lineStyle ?? 0,
      visible: indicatorStyle?.TRIX?.trixLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    /* ================= ZERO LINE ================= */

    const zeroValue = indicatorStyle?.TRIX?.zeroLine?.value ?? 0;

    const zeroSeries = addSeries("TRIX", LineSeries, {
      color: indicatorStyle?.TRIX?.zeroLine?.color ?? "rgba(158,158,158,1)",
      lineWidth: indicatorStyle?.TRIX?.zeroLine?.width ?? 1,
      lineStyle: indicatorStyle?.TRIX?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.TRIX?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const zeroData = trixData.map((p) => ({
      time: p.time,
      value: zeroValue,
    }));

    trixSeries.setData(trixData);
    zeroSeries.setData(zeroData);

    indicatorSeriesRef.current.TRIX = {
      trixLine: trixSeries,
      zeroLine: zeroSeries,
      trixData,
    };

  }, [result, indicatorConfigs]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.TRIX;
    if (!group) return;

    const trixStyle = indicatorStyle?.TRIX;
    if (!trixStyle) return;

    const zeroValue = trixStyle.zeroLine?.value ?? 0;

    if (group.trixData) {
      const zeroData = group.trixData.map((p) => ({
        time: p.time,
        value: zeroValue,
      }));

      group.zeroLine?.setData(zeroData);
    }

    group.trixLine?.applyOptions({
      color: trixStyle.trixLine?.color,
      lineWidth: Number(trixStyle.trixLine?.width ?? 2),
      lineStyle: trixStyle.trixLine?.lineStyle ?? 0,
      visible: trixStyle.trixLine?.visible,
    });

    group.zeroLine?.applyOptions({
      color: trixStyle.zeroLine?.color,
      lineWidth: Number(trixStyle.zeroLine?.width ?? 1),
      lineStyle: trixStyle.zeroLine?.lineStyle ?? 2,
      visible: trixStyle.zeroLine?.visible,
    });

  }, [indicatorStyle]);

  return null;
}