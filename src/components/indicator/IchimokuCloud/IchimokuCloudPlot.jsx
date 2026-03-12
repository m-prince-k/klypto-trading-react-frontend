import { useEffect } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

/* ================= CLOUD BUILDER ================= */

function buildCloud(spanA, spanB) {
  const bullish = [];
  const bearish = [];

  for (let i = 0; i < spanA.length; i++) {
    const a = spanA[i];
    const b = spanB[i];

    if (!a || !b) continue;

    if (a.value > b.value) {
      bullish.push({
        time: a.time,
        value: a.value,
      });
    }

    if (b.value > a.value) {
      bearish.push({
        time: b.time,
        value: b.value,
      });
    }
  }

  return { bullish, bearish };
}

export default function IchimokuCloudPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {

  /* ================= CREATE SERIES ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.IchimokuCloud) {
      Object.values(indicatorSeriesRef.current.IchimokuCloud).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });

      indicatorSeriesRef.current.IchimokuCloud = null;
    }

    const style = indicatorStyle?.IchimokuCloud ?? {};
    const grouped = {};

    /* ================= DATA ================= */

    const conversionLine = result?.data?.conversionLine || [];
    const baseLine = result?.data?.baseLine || [];
    const spanA = result?.data?.leadLine1 || [];
    const spanB = result?.data?.leadLine2 || [];
    const laggingSpan = result?.data?.laggingSpan || [];

    const kumoUpper = result?.data?.kumoCloudUpper || [];
    const kumoLower = result?.data?.kumoCloudLower || [];

    /* ================= LINES ================= */

    const conversionSeries = addSeries("main", LineSeries, {
      color: style?.conversionLine?.color,
      lineWidth: style?.conversionLine?.width ?? 2,
      visible: style?.conversionLine?.visible ?? true,
    });

    const baseSeries = addSeries("main", LineSeries, {
      color: style?.baseLine?.color,
      lineWidth: style?.baseLine?.width ?? 2,
      visible: style?.baseLine?.visible ?? true,
    });

    const spanASeries = addSeries("main", LineSeries, {
      color: style?.leadLine1?.color,
      lineWidth: style?.leadLine1?.width ?? 2,
      visible: style?.leadLine1?.visible ?? true,
    });

    const spanBSeries = addSeries("main", LineSeries, {
      color: style?.leadLine2?.color,
      lineWidth: style?.leadLine2?.width ?? 2,
      visible: style?.leadLine2?.visible ?? true,
    });

    const laggingSeries = addSeries("main", LineSeries, {
      color: style?.laggingSpan?.color,
      lineWidth: style?.laggingSpan?.width ?? 2,
      visible: style?.laggingSpan?.visible ?? true,
    });

    const kumoUpperSeries = addSeries("main", LineSeries, {
      color: style?.kumoCloudUpper?.color,
      lineWidth: style?.kumoCloudUpper?.width ?? 2,
      visible: style?.kumoCloudUpper?.visible ?? true,
    });

    const kumoLowerSeries = addSeries("main", LineSeries, {
      color: style?.kumoCloudLower?.color,
      lineWidth: style?.kumoCloudLower?.width ?? 2,
      visible: style?.kumoCloudLower?.visible ?? true,
    });

    /* ================= CLOUD SERIES ================= */

    const bullishCloudSeries = addSeries("main", AreaSeries, {
      lineWidth: 0,
      topColor: style?.cloudFillBullish?.color,
      bottomColor: style?.cloudFillBullish?.color,
      visible: style?.cloudFillBullish?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const bearishCloudSeries = addSeries("main", AreaSeries, {
      lineWidth: 0,
      topColor: style?.cloudFillBearish?.color,
      bottomColor: style?.cloudFillBearish?.color,
      visible: style?.cloudFillBearish?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    /* ================= BUILD CLOUD ================= */

    const cloud = buildCloud(spanA, spanB);

    bullishCloudSeries.setData(cloud.bullish);
    bearishCloudSeries.setData(cloud.bearish);

    /* ================= SET LINE DATA ================= */

    conversionSeries.setData(conversionLine);
    baseSeries.setData(baseLine);
    spanASeries.setData(spanA);
    spanBSeries.setData(spanB);
    laggingSeries.setData(laggingSpan);

    kumoUpperSeries.setData(kumoUpper);
    kumoLowerSeries.setData(kumoLower);

    /* ================= STORE ================= */

    grouped.conversionLine = conversionSeries;
    grouped.baseLine = baseSeries;
    grouped.leadLine1 = spanASeries;
    grouped.leadLine2 = spanBSeries;
    grouped.laggingSpan = laggingSeries;

    grouped.kumoCloudUpper = kumoUpperSeries;
    grouped.kumoCloudLower = kumoLowerSeries;

    grouped.bullishCloud = bullishCloudSeries;
    grouped.bearishCloud = bearishCloudSeries;

    indicatorSeriesRef.current.IchimokuCloud = grouped;

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {

    const group = indicatorSeriesRef.current?.IchimokuCloud;
    if (!group) return;

    const style = indicatorStyle?.IchimokuCloud ?? {};

    /* ===== MAIN LINES ===== */

    if (group.conversionLine) {
      group.conversionLine.applyOptions({
        color: style?.conversionLine?.color,
        lineWidth: style?.conversionLine?.width,
        lineStyle: style?.conversionLine?.lineStyle ?? 0,
        visible: style?.conversionLine?.visible,
      });
    }

    if (group.baseLine) {
      group.baseLine.applyOptions({
        color: style?.baseLine?.color,
        lineWidth: style?.baseLine?.width,
        lineStyle: style?.baseLine?.lineStyle ?? 0,
        visible: style?.baseLine?.visible,
      });
    }

    if (group.leadLine1) {
      group.leadLine1.applyOptions({
        color: style?.leadLine1?.color,
        lineWidth: style?.leadLine1?.width,
        lineStyle: style?.leadLine1?.lineStyle ?? 0,
        visible: style?.leadLine1?.visible,
      });
    }

    if (group.leadLine2) {
      group.leadLine2.applyOptions({
        color: style?.leadLine2?.color,
        lineWidth: style?.leadLine2?.width,
        lineStyle: style?.leadLine2?.lineStyle ?? 0,
        visible: style?.leadLine2?.visible,
      });
    }

    if (group.laggingSpan) {
      group.laggingSpan.applyOptions({
        color: style?.laggingSpan?.color,
        lineWidth: style?.laggingSpan?.width,
        lineStyle: style?.laggingSpan?.lineStyle ?? 0,
        visible: style?.laggingSpan?.visible,
      });
    }

    if (group.kumoCloudUpper) {
      group.kumoCloudUpper.applyOptions({
        color: style?.kumoCloudUpper?.color,
        lineWidth: style?.kumoCloudUpper?.width,
        lineStyle: style?.kumoCloudUpper?.lineStyle ?? 0,
        visible: style?.kumoCloudUpper?.visible,
      });
    }

    if (group.kumoCloudLower) {
      group.kumoCloudLower.applyOptions({
        color: style?.kumoCloudLower?.color,
        lineWidth: style?.kumoCloudLower?.width,
        lineStyle: style?.kumoCloudLower?.lineStyle ?? 0,
        visible: style?.kumoCloudLower?.visible,
      });
    }

    /* ===== CLOUD ===== */

    group.bullishCloud?.applyOptions({
      visible: style?.cloudFillBullish?.visible,
      topColor: style?.cloudFillBullish?.color,
      bottomColor: style?.cloudFillBullish?.color,
    });

    group.bearishCloud?.applyOptions({
      visible: style?.cloudFillBearish?.visible,
      topColor: style?.cloudFillBearish?.color,
      bottomColor: style?.cloudFillBearish?.color,
    });

  }, [indicatorStyle]);

  return null;
}