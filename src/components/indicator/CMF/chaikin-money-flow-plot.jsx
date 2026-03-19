import { useEffect } from "react";
import { LineSeries, BaselineSeries } from "lightweight-charts";

/* 🔥 COMMON SANITIZER */
const sanitizeData = (data) => {
  if (!Array.isArray(data)) {
    // 🔥 agar object aaya ho toh usko array me convert karo
    if (data && typeof data === "object") {
      data = Object.values(data);
    } else {
      return [];
    }
  }

  return data
    .filter((d) => d && d.time != null && d.value != null)
    .sort((a, b) => a.time - b.time);
};

export default function ChaikinMoneyFlowPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  console.log(result,"__________________________________________----0670-00678")

  /* ================= CREATE CMF ================= */

  useEffect(() => {

    if (!result) return;

    /* 🔥 REMOVE OLD SERIES */
    if (indicatorSeriesRef.current?.CMF) {
      Object.values(indicatorSeriesRef.current.CMF).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      indicatorSeriesRef.current.CMF = null;
    }

    const groupedSeries = {};
    let cmfData = [];

    /* ================= MAIN LINE ================= */

    Object.entries(result?.data || {}).forEach(([lineName, lineData]) => {

      const safeData = sanitizeData(lineData);

      const style = indicatorStyle?.CMF?.[lineName];
      const rowConfig = rows?.find((r) => r.key === lineName);

      const series = addSeries("CMF", LineSeries, {
        color: style?.color || rowConfig?.color || "rgba(0,140,255,1)",
        lineWidth: style?.width || 2,
        visible: style?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      if (!series) return;

      series.setData(safeData);

      groupedSeries[lineName] = series;

      if (lineName === "cmf") cmfData = safeData;

    });

    /* ================= ZERO LINE ================= */

    const zeroLine = addSeries("CMF", LineSeries, {
      color: indicatorStyle?.CMF?.zeroLine?.color || "rgba(150,150,150,0.5)",
      lineWidth: indicatorStyle?.CMF?.zeroLine?.width ?? 1,
      lineStyle: indicatorStyle?.CMF?.zeroLine?.lineStyle ?? 2,
      visible: indicatorStyle?.CMF?.zeroLine?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    zeroLine.setData(
      (cmfData || []).map((p) => ({
        time: p.time,
        value: 0,
      }))
    );

    groupedSeries.zeroLine = zeroLine;

    /* ================= POSITIVE / NEGATIVE ZONES ================= */

    const posFill = indicatorStyle?.CMF?.positiveFill;
    const negFill = indicatorStyle?.CMF?.negativeFill;

    const positiveSeries = addSeries("CMF", BaselineSeries, {
      baseValue: { type: "price", price: 0 },
      topFillColor1: posFill?.topFillColor1,
      topFillColor2: posFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: posFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const negativeSeries = addSeries("CMF", BaselineSeries, {
      baseValue: { type: "price", price: 0 },
      bottomFillColor1: negFill?.bottomFillColor1,
      bottomFillColor2: negFill?.bottomFillColor2,
      topFillColor1: "rgba(0,0,0,0)",
      topFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: negFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const posData = [];
    const negData = [];

    (cmfData || []).forEach((p) => {
      if (!p || p.time == null || p.value == null) return;

      posData.push({
        time: p.time,
        value: p.value > 0 ? p.value : 0,
      });

      negData.push({
        time: p.time,
        value: p.value < 0 ? p.value : 0,
      });
    });

    positiveSeries.setData(posData);
    negativeSeries.setData(negData);

    groupedSeries.positiveFill = positiveSeries;
    groupedSeries.negativeFill = negativeSeries;

    /* ⭐ STORE DATA */
    groupedSeries.cmfData = cmfData;

    indicatorSeriesRef.current.CMF = groupedSeries;

  }, [result]);


  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const cmfGroup = indicatorSeriesRef.current?.CMF;
    if (!cmfGroup) return;

    const cmfData = cmfGroup.cmfData ?? [];

    const zeroStyle = indicatorStyle?.CMF?.zeroLine;
    const posFill = indicatorStyle?.CMF?.positiveFill;
    const negFill = indicatorStyle?.CMF?.negativeFill;

    /* ZERO LINE UPDATE */
    cmfGroup.zeroLine?.setData(
      (cmfData || []).map((p) => ({ time: p.time, value: 0 }))
    );

    cmfGroup.zeroLine?.applyOptions({
      color: zeroStyle?.color,
      lineWidth: zeroStyle?.width,
      lineStyle: zeroStyle?.lineStyle ?? 2,
      visible: zeroStyle?.visible,
    });

    /* MAIN CMF LINE */
    if (cmfGroup.cmf) {
      const style = indicatorStyle?.CMF?.cmf;

      cmfGroup.cmf.applyOptions({
        color: style?.color,
        lineWidth: style?.width,
        lineStyle: style?.lineStyle ?? 0,
        visible: style?.visible,
        lastValueVisible: style?.visible,
      });
    }

    /* FILLS UPDATE */
    cmfGroup.positiveFill?.applyOptions({
      visible: posFill?.visible,
      topFillColor1: posFill?.topFillColor1,
      topFillColor2: posFill?.topFillColor2,
    });

    cmfGroup.negativeFill?.applyOptions({
      visible: negFill?.visible,
      bottomFillColor1: negFill?.bottomFillColor1,
      bottomFillColor2: negFill?.bottomFillColor2,
    });

  }, [indicatorStyle]);

  return null;
}