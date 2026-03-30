import { useEffect, useRef } from "react";
import { LineSeries, BaselineSeries, AreaSeries } from "lightweight-charts";

export default function RSIPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  indicatorConfigs,
  chart,
  panesRef,
}) {
  const canvasRef = useRef(null);

  /* ================= CREATE RSI ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.RSI) {
      Object.values(indicatorSeriesRef.current.RSI).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch { }
        }
      });

      indicatorSeriesRef.current.RSI = null;
    }

    const groupedSeries = {};
    let rsiData = [];

    let bbUpperData = [];
    let bbLowerData = [];

    const upper = indicatorStyle?.RSI?.upper?.value ?? 70;
    const middle = indicatorStyle?.RSI?.middle?.value ?? 50;
    const lower = indicatorStyle?.RSI?.lower?.value ?? 30;

    const bandFill = indicatorStyle?.RSI?.bandFill;
    const obFill = indicatorStyle?.RSI?.obFill;
    const osFill = indicatorStyle?.RSI?.osFill;

    Object.entries(result?.data).forEach(([lineName, lineData]) => {
      const rowConfig = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.RSI?.[lineName];

      const series = addSeries("RSI", LineSeries, {
        color: styleConfig?.color || rowConfig?.color || "rgba(38,166,154,1)",
        lineWidth: styleConfig?.width || 2,
        visible: styleConfig?.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: lineName === "rsi" || lineName === "smoothingMA",
      });

      if (!series) return;

      series.setData(lineData);

      groupedSeries[lineName] = series;

      if (lineName === "rsi") rsiData = lineData;

      if (lineName === "bbUpper") {
        groupedSeries.bbUpper = series;
        bbUpperData = lineData;
      }

      if (lineName === "bbLower") {
        groupedSeries.bbLower = series;
        bbLowerData = lineData;
      }
    });

    const makeLevelData = (value) =>
      rsiData.map((p) => ({
        time: p.time,
        value,
      }));

    const upperLine = addSeries("RSI", LineSeries, {
      color: indicatorStyle?.RSI?.upper?.color,
      lineWidth: indicatorStyle?.RSI?.upper?.width ?? 1,
      lineStyle: indicatorStyle?.RSI?.upper?.lineStyle ?? 2,
      visible: indicatorStyle?.RSI?.upper?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleLine = addSeries("RSI", LineSeries, {
      color: indicatorStyle?.RSI?.middle?.color,
      lineWidth: indicatorStyle?.RSI?.middle?.width ?? 1,
      lineStyle: indicatorStyle?.RSI?.middle?.lineStyle ?? 2,
      visible: indicatorStyle?.RSI?.middle?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerLine = addSeries("RSI", LineSeries, {
      color: indicatorStyle?.RSI?.lower?.color,
      lineWidth: indicatorStyle?.RSI?.lower?.width ?? 1,
      lineStyle: indicatorStyle?.RSI?.lower?.lineStyle ?? 2,
      visible: indicatorStyle?.RSI?.lower?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperLine.setData(makeLevelData(upper));
    middleLine.setData(makeLevelData(middle));
    lowerLine.setData(makeLevelData(lower));

    groupedSeries.upper = upperLine;
    groupedSeries.middle = middleLine;
    groupedSeries.lower = lowerLine;

    const bandData = rsiData?.map((p) => ({
      time: p.time,
      value: upper,
    }));

    const bandBackgroundSeries = addSeries("RSI", BaselineSeries, {
      baseValue: { type: "price", price: lower },
      topFillColor1: bandFill?.topFillColor1,
      topFillColor2: bandFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: bandFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bandBackgroundSeries.setData(bandData);

    const overboughtSeries = addSeries("RSI", BaselineSeries, {
      baseValue: { type: "price", price: upper },
      topFillColor1: obFill?.topFillColor1,
      topFillColor2: obFill?.topFillColor2,
      bottomFillColor1: "rgba(0,0,0,0)",
      bottomFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: obFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const oversoldSeries = addSeries("RSI", BaselineSeries, {
      baseValue: { type: "price", price: lower },
      bottomFillColor1: osFill?.bottomFillColor1,
      bottomFillColor2: osFill?.bottomFillColor2,
      topFillColor1: "rgba(0,0,0,0)",
      topFillColor2: "rgba(0,0,0,0)",
      topLineColor: "transparent",
      bottomLineColor: "transparent",
      visible: osFill?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const overboughtData = [];
    const oversoldData = [];

    rsiData.forEach((p) => {
      overboughtData.push({
        time: p.time,
        value: p.value > upper ? p.value : upper,
      });

      oversoldData.push({
        time: p.time,
        value: p.value < lower ? p.value : lower,
      });
    });

    overboughtSeries.setData(overboughtData);
    oversoldSeries.setData(oversoldData);

    groupedSeries.bandBackground = bandBackgroundSeries;
    groupedSeries.overboughtFill = overboughtSeries;
    groupedSeries.oversoldFill = oversoldSeries;

    groupedSeries.rsiData = rsiData;
    groupedSeries.bbUpperData = bbUpperData;
    groupedSeries.bbLowerData = bbLowerData;

    indicatorSeriesRef.current.RSI = groupedSeries;
  }, [result]);

  /* ================= CANVAS INIT ================= */

  useEffect(() => {
    if (!panesRef || canvasRef.current) return;

    const pane = panesRef.current?.RSI;
    const paneDiv = pane?.div;

    if (!paneDiv) return;

    const canvas = document.createElement("canvas");

    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 1;

    paneDiv.appendChild(canvas);
    canvasRef.current = canvas;

    // ✅ IMPORTANT
    setTimeout(() => {
      drawBBCloud();
    }, 0);

  }, [panesRef]);

  /* ================= DRAW BB CLOUD ================= */

  const drawBBCloud = () => {
    const rsiGroup = indicatorSeriesRef.current?.RSI;
    if (!rsiGroup) return;

    const upperData = rsiGroup.bbUpperData || [];
    const lowerData = rsiGroup.bbLowerData || [];

    if (!upperData.length || !lowerData.length) return;

    const pane = panesRef.current?.RSI;
    const paneDiv = pane?.div;
    const paneChart = pane?.chart;

    if (!canvasRef.current) {
      console.log("❌ canvas missing");
      return;
    }
    if (!paneDiv) {
      console.log("❌ paneDiv missing");
      return;
    }
    if (!paneChart) {
      console.log("❌ paneChart missing");
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const rect = paneDiv.getBoundingClientRect(); // ✅ FIX
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fill = indicatorStyle?.RSI?.bbFill;
    if (!fill?.visible) return;

    ctx.beginPath();

    for (let i = 0; i < upperData.length; i++) {
      const p = upperData[i];
      const x = paneChart.timeScale().timeToCoordinate(p.time); // ✅ FIX
      const y = rsiGroup.bbUpper.priceToCoordinate(p.value);
      if (x == null || y == null) continue;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    for (let i = lowerData.length - 1; i >= 0; i--) {
      const p = lowerData[i];
      const x = paneChart.timeScale().timeToCoordinate(p.time); // ✅ FIX
      const y = rsiGroup.bbLower.priceToCoordinate(p.value);
      if (x == null || y == null) continue;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = fill?.topFillColor1 || "rgba(38,166,154,0.3)";
    ctx.fill();
  };

  useEffect(() => {
    const pane = panesRef.current?.RSI;
    const paneChart = pane?.chart;

    if (!paneChart) return;

    const redraw = () => drawBBCloud();

    const unsubscribeTime = paneChart.timeScale().subscribeVisibleLogicalRangeChange
      ? paneChart.timeScale().subscribeVisibleLogicalRangeChange(redraw)
      : null;

    const unsubscribeCrosshair = paneChart.subscribeCrosshairMove
      ? paneChart.subscribeCrosshairMove(redraw)
      : null;

    return () => {
      if (unsubscribeTime) unsubscribeTime();
      if (unsubscribeCrosshair) unsubscribeCrosshair();
    };
  }, [panesRef, indicatorStyle]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const rsiGroup = indicatorSeriesRef.current?.RSI;
    if (!rsiGroup) return;

    const rsiData = rsiGroup.rsiData ?? [];

    const upperValue = indicatorStyle?.RSI?.upper?.value ?? 70;
    const middleValue = indicatorStyle?.RSI?.middle?.value ?? 50;
    const lowerValue = indicatorStyle?.RSI?.lower?.value ?? 30;

    const makeLevel = (v) => rsiData.map((p) => ({ time: p.time, value: v }));

    rsiGroup.upper?.setData(makeLevel(upperValue));
    rsiGroup.middle?.setData(makeLevel(middleValue));
    rsiGroup.lower?.setData(makeLevel(lowerValue));

    const rsiStyle = indicatorStyle?.RSI?.rsi;
    const smoothingStyle = indicatorStyle?.RSI?.smoothingMA;

    const bandFill = indicatorStyle?.RSI?.bandFill;
    const obFill = indicatorStyle?.RSI?.obFill;
    const osFill = indicatorStyle?.RSI?.osFill;

    if (rsiGroup.rsi) {
      rsiGroup.rsi.applyOptions({
        color: rsiStyle?.color,
        lineWidth: rsiStyle?.width,
        visible: rsiStyle?.visible,
      });
    }

    if (rsiGroup.smoothingMA) {
      rsiGroup.smoothingMA.applyOptions({
        color: smoothingStyle?.color,
        lineWidth: smoothingStyle?.width,
        visible: smoothingStyle?.visible,
      });
    }

    rsiGroup.bbUpper?.applyOptions({
      color: indicatorStyle?.RSI?.bbUpper?.color,
      lineWidth: indicatorStyle?.RSI?.bbUpper?.width,
      visible: indicatorStyle?.RSI?.bbUpper?.visible,
    });

    rsiGroup.bbLower?.applyOptions({
      color: indicatorStyle?.RSI?.bbLower?.color,
      lineWidth: indicatorStyle?.RSI?.bbLower?.width,
      visible: indicatorStyle?.RSI?.bbLower?.visible,
    });

    if (rsiGroup.bandBackground) {
      rsiGroup.bandBackground.applyOptions({
        topFillColor1: bandFill?.topFillColor1,
        topFillColor2: bandFill?.topFillColor2,
        visible: bandFill?.visible ?? true,
      });
    }

    if (rsiGroup.overboughtFill) {
      rsiGroup.overboughtFill.applyOptions({
        topFillColor1: obFill?.topFillColor1,
        topFillColor2: obFill?.topFillColor2,
        visible: obFill?.visible ?? true,
      });
    }

    if (rsiGroup.oversoldFill) {
      rsiGroup.oversoldFill.applyOptions({
        bottomFillColor1: osFill?.bottomFillColor1,
        bottomFillColor2: osFill?.bottomFillColor2,
        visible: osFill?.visible ?? true,
      });
    }

    drawBBCloud();
  }, [indicatorStyle, result]);


  useEffect(() => {
    const pane = panesRef.current?.RSI;
    const paneChart = pane?.chart;

    if (!paneChart) return;

    const redraw = () => drawBBCloud();

    // 🔥 THIS is what actually fixes it
    paneChart.timeScale().subscribeVisibleTimeRangeChange(redraw);

    // also keep existing ones
    paneChart.timeScale().subscribeVisibleLogicalRangeChange(redraw);
    paneChart.subscribeCrosshairMove(redraw);

    return () => {
      paneChart.timeScale().unsubscribeVisibleTimeRangeChange(redraw);
      paneChart.timeScale().unsubscribeVisibleLogicalRangeChange(redraw);
      paneChart.unsubscribeCrosshairMove(redraw);
    };
  }, [panesRef]);

  return null;
}