import { useEffect } from "react";
import { LineSeries, AreaSeries } from "lightweight-charts";

export default function BBPERBPlot({
  indicator,
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {
  /* ================= CREATE ================= */

  useEffect(() => {
    const percentB = result?.data?.percentB;

    console.log(percentB, "----------------------->>>>>>>>>>>");

    if (!Array.isArray(percentB) || percentB.length === 0) {
      console.log(":x: BBPERB not plotting", result);
      return;
    } // :fire: REMOVE OLD

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        try {
          s.setData([]);
            try { chart.removeSeries(s); } catch {}
        } catch {}
      });
      indicatorSeriesRef.current[indicator] = null;
    } /* :large_blue_circle: %B LINE */

    const percentBSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.percentB?.color ?? "rgba(33,150,243,1)",
      lineWidth: indicatorStyle?.[indicator]?.percentB?.width ?? 2,
      lineStyle: indicatorStyle?.[indicator]?.percentB?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.percentB?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    percentBSeries.setData(percentB); // dynamic band values

    const overboughtVal = indicatorStyle?.[indicator]?.overbought?.value ?? 1;
    const middleVal = indicatorStyle?.[indicator]?.middleBand?.value ?? 0.5;
    const oversoldVal =
      indicatorStyle?.[indicator]?.oversold?.value ??
      0; /* :red_circle: OVERBOUGHT LINE */

    const overboughtSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.overbought?.color ?? "rgba(244,67,54,1)",
      lineWidth: indicatorStyle?.[indicator]?.overbought?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.overbought?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.overbought?.visible ?? true,
      priceLineVisible: false,
    });

    overboughtSeries.setData(
      percentB.map((d) => ({ time: d.time, value: overboughtVal })),
    ); /* :large_yellow_circle: MIDDLE LINE */

    const middleSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.middleBand?.color ?? "rgba(255,193,7,1)",
      lineWidth: indicatorStyle?.[indicator]?.middleBand?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.middleBand?.lineStyle ?? 1,
      visible: indicatorStyle?.[indicator]?.middleBand?.visible ?? true,
      priceLineVisible: false,
    });

    middleSeries.setData(
      percentB.map((d) => ({ time: d.time, value: middleVal })),
    ); /* :large_green_circle: OVERSOLD LINE */

    const oversoldSeries = addSeries(indicator, LineSeries, {
      color: indicatorStyle?.[indicator]?.oversold?.color ?? "rgba(0,200,83,1)",
      lineWidth: indicatorStyle?.[indicator]?.oversold?.width ?? 1,
      lineStyle: indicatorStyle?.[indicator]?.oversold?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.oversold?.visible ?? true,
      priceLineVisible: false,
    });

    oversoldSeries.setData(
      percentB.map((d) => ({ time: d.time, value: oversoldVal })),
    ); /* ================= :art: BACKGROUND FILLS ================= */ /* :red_circle: OVERBOUGHT BG */

    const overboughtBgSeries = addSeries(indicator, AreaSeries, {
      topColor:
        indicatorStyle?.[indicator]?.overboughtBg?.color ?? "rgba(244,67,54,0.1)",
      bottomColor: "rgba(0,0,0,0)",
      lineColor: "transparent",
      baseValue: { type: "price", price: overboughtVal },
      visible: indicatorStyle?.[indicator]?.overboughtBg?.visible ?? true,
    });

    overboughtBgSeries.setData(
      percentB.map((d) => ({ time: d.time, value: 2 })),
    ); /* :large_yellow_square: MIDDLE BG */

    const middleBgSeries = addSeries(indicator, AreaSeries, {
      topColor:
        indicatorStyle?.[indicator]?.middleBg?.color ?? "rgba(255,193,7,0.1)",
      bottomColor:
        indicatorStyle?.[indicator]?.middleBg?.color ?? "rgba(255,193,7,0.1)",
      lineColor: "transparent",
      baseValue: { type: "price", price: oversoldVal },
      visible: indicatorStyle?.[indicator]?.middleBg?.visible ?? true,
    });

    middleBgSeries.setData(
      percentB.map((d) => ({ time: d.time, value: overboughtVal })),
    ); /* :large_green_circle: OVERSOLD BG */

    const oversoldBgSeries = addSeries(indicator, AreaSeries, {
      topColor: "rgba(0,0,0,0)",
      bottomColor:
        indicatorStyle?.[indicator]?.oversoldBg?.color ?? "rgba(0,200,83,0.1)",
      lineColor: "transparent",
      baseValue: { type: "price", price: oversoldVal },
      visible: indicatorStyle?.[indicator]?.oversoldBg?.visible ?? true,
    });

    oversoldBgSeries.setData(
      percentB.map((d) => ({ time: d.time, value: -1 })),
    );

    indicatorSeriesRef.current[indicator] = {
      percentB: percentBSeries,
      overbought: overboughtSeries,
      middleBand: middleSeries,
      oversold: oversoldSeries,
      overboughtBg: overboughtBgSeries,
      middleBg: middleBgSeries,
      oversoldBg: oversoldBgSeries,
    };

    console.log(":white_check_mark: BBPERB plotted SUCCESS");
  }, [result]); /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const group = indicatorSeriesRef.current?.[indicator];
    if (!group) return;

    group.percentB?.applyOptions({
      color: indicatorStyle?.[indicator]?.percentB?.color,
      lineWidth: indicatorStyle?.[indicator]?.percentB?.width,
      lineStyle: indicatorStyle?.[indicator]?.percentB?.lineStyle ?? 0,
      visible: indicatorStyle?.[indicator]?.percentB?.visible,
    });

    group.overbought?.applyOptions({
      color: indicatorStyle?.[indicator]?.overbought?.color,
      lineWidth: indicatorStyle?.[indicator]?.overbought?.width,
      lineStyle: indicatorStyle?.[indicator]?.overbought?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.overbought?.visible,
    });

    group.middleBand?.applyOptions({
      color: indicatorStyle?.[indicator]?.middleBand?.color,
      lineWidth: indicatorStyle?.[indicator]?.middleBand?.width,
      lineStyle: indicatorStyle?.[indicator]?.middleBand?.lineStyle ?? 1,
      visible: indicatorStyle?.[indicator]?.middleBand?.visible,
    });

    group.oversold?.applyOptions({
      color: indicatorStyle?.[indicator]?.oversold?.color,
      lineWidth: indicatorStyle?.[indicator]?.oversold?.width,
      lineStyle: indicatorStyle?.[indicator]?.oversold?.lineStyle ?? 2,
      visible: indicatorStyle?.[indicator]?.oversold?.visible,
    }); /* :art: BG STYLE UPDATE */

    group.overboughtBg?.applyOptions({
      topColor: indicatorStyle?.[indicator]?.overboughtBg?.color,
      visible: indicatorStyle?.[indicator]?.overboughtBg?.visible,
      baseValue: {
        type: "price",
        price: indicatorStyle?.[indicator]?.overbought?.value ?? 1,
      },
    });

    group.middleBg?.applyOptions({
      topColor: indicatorStyle?.[indicator]?.middleBg?.color,
      bottomColor: indicatorStyle?.[indicator]?.middleBg?.color,
      visible: indicatorStyle?.[indicator]?.middleBg?.visible,
      baseValue: {
        type: "price",
        price: indicatorStyle?.[indicator]?.oversold?.value ?? 0,
      },
    });

    group.oversoldBg?.applyOptions({
      bottomColor: indicatorStyle?.[indicator]?.oversoldBg?.color,
      visible: indicatorStyle?.[indicator]?.oversoldBg?.visible,
      baseValue: {
        type: "price",
        price: indicatorStyle?.[indicator]?.oversold?.value ?? 0,
      },
    }); // ===== :repeat: FORCE BG AREA RECALC =====

    const percentB = result?.data?.percentB;

    if (Array.isArray(percentB) && percentB.length) {
      const overboughtVal = indicatorStyle?.[indicator]?.overbought?.value ?? 1;
      const oversoldVal = indicatorStyle?.[indicator]?.oversold?.value ?? 0;

      group.overboughtBg?.setData(
        percentB.map((d) => ({ time: d.time, value: 2 })),
      );

      group.middleBg?.setData(
        percentB.map((d) => ({ time: d.time, value: overboughtVal })),
      );

      group.oversoldBg?.setData(
        percentB.map((d) => ({ time: d.time, value: -1 })),
      );
    }
  }, [indicatorStyle?.[indicator]]);

  return null;
}
