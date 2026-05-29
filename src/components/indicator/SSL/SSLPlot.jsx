import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function SSLPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  containerRef,
  pane,
}) {
  const canvasRef = useRef(null);

  /* ================= DISPLAY MODE ================= */

  const getDisplayVisibility = (lineName) => {
    const displayMode =
      indicatorStyle?.[indicator]?.displayMode || "FULL_DISPLAY";

    if (displayMode === "FULL_DISPLAY") return true;

    if (displayMode === "BASELINE_ONLY") {
      return ["baseline", "upperChannel", "lowerChannel", "baselineFill"].includes(lineName);
    }
    if (displayMode === "SSL_ONLY") {
      return ["ssl1", "ssl2"].includes(lineName);
    }
    if (displayMode === "BASELINE_SSL") {
      return ["baseline", "upperChannel", "lowerChannel", "ssl1", "ssl2", "baselineFill"].includes(lineName);
    }
    if (displayMode === "ENTRY_EXIT_ONLY") {
      return false; // Hides all lines, keeps only markers
    }

    return true;
  };

  const closeMapRef = useRef(new Map());

  /* ================= PINE SCRIPT COLOR LOGIC ================= */

  const BULLISH = indicatorStyle?.[indicator]?.candles?.palette?.up || "#00c3ff";
  const BEARISH = indicatorStyle?.[indicator]?.candles?.palette?.down || "#ff0062";
  const NEUTRAL  = "#666666";

  // baseline_color = close > upperk ? bullish : close < lowerk ? bearish : neutral
  const getBaselineColor = (close, upperChannel, lowerChannel) => {
    if (close == null || upperChannel == null || lowerChannel == null) return NEUTRAL;
    if (close > upperChannel) return BULLISH;
    if (close < lowerChannel) return BEARISH;
    return NEUTRAL;
  };

  // ssl_color = close > sslDown ? bullish : close < sslDown ? bearish : neutral
  const getSsl1Color = (close, ssl1) => {
    if (close == null || ssl1 == null) return NEUTRAL;
    if (close > ssl1) return BULLISH;
    if (close < ssl1) return BEARISH;
    return NEUTRAL;
  };

  // ssl2_color = buy_atr ? bullish : sell_atr ? bearish : neutral
  const getSsl2Color = (close, ssl2, baseline, atr) => {
    if (close == null || ssl2 == null || baseline == null || atr == null) return NEUTRAL;
    const atr_crit = 0.9;
    const upper_half = atr * atr_crit + close;
    const lower_half = close - atr * atr_crit;
    const buy_inatr  = lower_half < ssl2;
    const sell_inatr = upper_half > ssl2;
    const buy_cont   = close > baseline && close > ssl2;
    const sell_cont  = close < baseline && close < ssl2;
    const buy_atr    = buy_inatr  && buy_cont;
    const sell_atr   = sell_inatr && sell_cont;
    if (buy_atr)  return BULLISH;
    if (sell_atr) return BEARISH;
    return NEUTRAL;
  };

  /* ================= CREATE SSL ================= */

  useEffect(() => {
    if (!result) return;

    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try { s.setData([]); } catch {}
        }
      });
      delete indicatorSeriesRef.current[indicator];
    }

    const groupedSeries = {};
    let upperChannelData = [];
    let lowerChannelData = [];

    const nestedData = result?.data || {};

    const baselineArr     = nestedData.baseline      || [];
    const upperArr        = nestedData.upperChannel   || [];
    const lowerArr        = nestedData.lowerChannel   || [];
    const ssl1Arr         = nestedData.ssl1           || [];
    const ssl2Arr         = nestedData.ssl2           || [];
    const atrUpperArr     = nestedData.atrUpper       || [];
    const atrLowerArr     = nestedData.atrLower       || [];

    // Extract historical close prices from the main chart pane to accurately calculate colors
    const closeMap = new Map();
    let paneDataOriginal = [];
    if (pane && typeof pane.data === "function") {
      try {
        paneDataOriginal = pane.data();
        paneDataOriginal.forEach((d) => {
          closeMap.set(d.time, d.close ?? d.value);
        });
      } catch (e) {}
    }
    closeMapRef.current = closeMap;

    // Apply colors to the main candles if enabled
    if (pane && indicatorStyle?.[indicator]?.candles?.visible && paneDataOriginal.length > 0) {
      const upperMap = new Map();
      const lowerMap = new Map();
      upperArr.forEach(d => upperMap.set(d.time, d.value));
      lowerArr.forEach(d => lowerMap.set(d.time, d.value));

      const updatedPaneData = paneDataOriginal.map((d) => {
        const u = upperMap.get(d.time);
        const l = lowerMap.get(d.time);
        if (u != null && l != null) {
          const color = getBaselineColor(d.close, u, l);
          return {
            ...d,
            color,
            borderColor: color,
            wickColor: color,
          };
        }
        return d;
      });
      try { pane.setData(updatedPaneData); } catch (e) {}
    } else if (pane && paneDataOriginal.length > 0) {
      // Revert colors if visible is false
      const updatedPaneData = paneDataOriginal.map((d) => {
        return {
          ...d,
          color: undefined,
          borderColor: undefined,
          wickColor: undefined,
        };
      });
      try { pane.setData(updatedPaneData); } catch (e) {}
    }

    const lineNames = [
      "baseline", "upperChannel", "lowerChannel",
      "ssl1", "ssl2", "atrUpper", "atrLower",
    ];

    lineNames.forEach((lineName) => {
      const lineData = nestedData[lineName] || [];
      if (!lineData.length) return;

      const rowConfig   = rows?.find((r) => r.key === lineName);
      const styleConfig = indicatorStyle?.[indicator]?.[lineName];
      const shouldShow  = getDisplayVisibility(lineName);

      const series = addSeries(indicator, LineSeries, {
        color:            styleConfig?.color || rowConfig?.color,
        lineWidth:        styleConfig?.width || 2,
        lineStyle:        styleConfig?.lineStyle || 0,
        visible:          (styleConfig?.visible ?? true) && shouldShow,
        priceLineVisible: false,
        lastValueVisible: ["baseline", "ssl1", "ssl2", "atrUpper", "atrLower"].includes(lineName),
      });

      if (!series) return;

      /* ================= DYNAMIC COLORS PER LINE ================= */

      if (lineName === "baseline") {
        const colored = lineData.map((point, i) => {
          const actualClose = closeMap.get(point.time) ?? point.close ?? null;
          return {
            time:  point.time,
            value: point.value,
            color: getBaselineColor(
              actualClose,
              point.upperChannel ?? upperArr[i]?.value ?? null,
              point.lowerChannel ?? lowerArr[i]?.value ?? null,
            ),
          };
        });
        series.setData(colored);

      } else if (lineName === "upperChannel" || lineName === "lowerChannel") {
        const colored = lineData.map((point, i) => {
          const actualClose = closeMap.get(point.time) ?? point.close ?? null;
          return {
            time:  point.time,
            value: point.value,
            color: getBaselineColor(
              actualClose,
              upperArr[i]?.value ?? null,
              lowerArr[i]?.value ?? null,
            ),
          };
        });
        series.setData(colored);

      } else if (lineName === "ssl1") {
        const colored = lineData.map((point, i) => {
          const actualClose = closeMap.get(point.time) ?? point.close ?? null;
          return {
            time:  point.time,
            value: point.value,
            color: getSsl1Color(
              actualClose,
              point.value,
            ),
          };
        });
        series.setData(colored);

      } else if (lineName === "ssl2") {
        const colored = lineData.map((point, i) => {
          const actualClose = closeMap.get(point.time) ?? point.close ?? null;
          return {
            time:  point.time,
            value: point.value,
            color: getSsl2Color(
              actualClose,
              point.value,
              baselineArr[i]?.value ?? null,
              point.atr      ?? null,
            ),
          };
        });
        series.setData(colored);

      } else {
        series.setData(lineData);
      }

      groupedSeries[lineName] = series;
      if (lineName === "upperChannel") upperChannelData = lineData;
      if (lineName === "lowerChannel") lowerChannelData = lineData;
    });

    groupedSeries.upperChannelData = upperChannelData;
    groupedSeries.lowerChannelData = lowerChannelData;
    groupedSeries.rawData = nestedData;
    groupedSeries.closeMap = closeMap;
    groupedSeries.upperArr = upperArr;
    groupedSeries.lowerArr = lowerArr;
    groupedSeries.baselineArr = baselineArr;
    indicatorSeriesRef.current[indicator] = groupedSeries;
  }, [result]);

  /* ================= CANVAS INIT ================= */

  useEffect(() => {
    if (!containerRef?.current || canvasRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 1;
    containerRef?.current.appendChild(canvas);
    canvasRef.current = canvas;
  }, [containerRef?.current]);

  /* ================= DRAW BASELINE CLOUD ================= */

  const drawBaselineCloud = () => {
    const sslGroup = indicatorSeriesRef.current?.[indicator];
    if (!sslGroup) return;

    const upper = sslGroup.upperChannelData || [];
    const lower = sslGroup.lowerChannelData || [];
    if (!upper.length || !lower.length) return;
    if (!canvasRef.current || !chart) return;

    const fill         = indicatorStyle?.[indicator]?.baselineFill;
    const upperVisible = indicatorStyle?.[indicator]?.upperChannel?.visible ?? true;
    const lowerVisible = indicatorStyle?.[indicator]?.lowerChannel?.visible ?? true;

    if (!fill?.visible)                  return;
    if (!upperVisible || !lowerVisible)  return;

    const canvas = canvasRef?.current;
    const ctx    = canvas?.getContext("2d");
    const rect   = containerRef?.current.getBoundingClientRect();

    canvas.width  = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < upper.length - 1; i++) {
      const p1Upper = upper[i];
      const p2Upper = upper[i + 1];
      const p1Lower = lower[i];
      const p2Lower = lower[i + 1];

      const x1 = chart.timeScale().timeToCoordinate(p1Upper.time);
      const x2 = chart.timeScale().timeToCoordinate(p2Upper.time);

      const y1Upper = sslGroup.upperChannel?.priceToCoordinate(p1Upper.value);
      const y2Upper = sslGroup.upperChannel?.priceToCoordinate(p2Upper.value);

      const y1Lower = sslGroup.lowerChannel?.priceToCoordinate(p1Lower.value);
      const y2Lower = sslGroup.lowerChannel?.priceToCoordinate(p2Lower.value);

      if (x1 == null || x2 == null || y1Upper == null || y2Upper == null || y1Lower == null || y2Lower == null) continue;

      const actualClose = closeMapRef.current?.get(p1Upper.time) ?? null;
      const baseColor = getBaselineColor(actualClose, p1Upper.value, p1Lower.value);

      // Extract the rgb values to append opacity, or fallback to default
      let fillStyle = "rgba(33,150,243,0.15)";
      if (baseColor.startsWith("rgba") || baseColor.startsWith("rgb")) {
        // Simple trick to force opacity to 0.15 for the fill
        fillStyle = baseColor.replace(/[\d.]+\)$/g, "0.15)");
        if (fillStyle.startsWith("rgb(")) fillStyle = fillStyle.replace("rgb(", "rgba(");
      } else if (baseColor.startsWith("#")) {
        // hex to rgba
        const r = parseInt(baseColor.slice(1, 3), 16) || 102;
        const g = parseInt(baseColor.slice(3, 5), 16) || 102;
        const b = parseInt(baseColor.slice(5, 7), 16) || 102;
        fillStyle = `rgba(${r},${g},${b},0.15)`;
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1Upper);
      ctx.lineTo(x2, y2Upper);
      ctx.lineTo(x2, y2Lower);
      ctx.lineTo(x1, y1Lower);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
  };

  /* ================= REDRAW EVENTS ================= */

  useEffect(() => {
    if (!chart) return;
    const redraw = () => drawBaselineCloud();
    chart.timeScale().subscribeVisibleLogicalRangeChange(redraw);
    chart.subscribeCrosshairMove(redraw);
    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(redraw);
      chart.unsubscribeCrosshairMove(redraw);
    };
  }, [chart, indicatorStyle]);

  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const sslGroup = indicatorSeriesRef.current?.[indicator];
    if (!sslGroup) return;

    Object.entries(sslGroup).forEach(([key, series]) => {
      if (!series?.applyOptions) return;
      const style = indicatorStyle?.[indicator]?.[key];
      if (!style) return;
      const shouldShow = getDisplayVisibility(key);
      series.applyOptions({
        color:     style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle,
        visible:   (style.visible ?? true) && shouldShow,
      });
    });

    // Recalculate dynamic line colors based on the current BULLISH/BEARISH palette
    const { rawData, closeMap, upperArr, lowerArr, baselineArr } = sslGroup;
    if (rawData && closeMap) {
      const linesToRecolor = ["baseline", "upperChannel", "lowerChannel", "ssl1", "ssl2"];
      linesToRecolor.forEach((lineName) => {
        const series = sslGroup[lineName];
        const lineData = rawData[lineName];
        if (!series || !lineData) return;

        let colored;
        if (lineName === "baseline" || lineName === "upperChannel" || lineName === "lowerChannel") {
          colored = lineData.map((point, i) => {
            const actualClose = closeMap.get(point.time) ?? point.close ?? null;
            return {
              time: point.time,
              value: point.value,
              color: getBaselineColor(
                actualClose,
                point.upperChannel ?? upperArr[i]?.value ?? null,
                point.lowerChannel ?? lowerArr[i]?.value ?? null,
              ),
            };
          });
        } else if (lineName === "ssl1") {
          colored = lineData.map((point) => {
            const actualClose = closeMap.get(point.time) ?? point.close ?? null;
            return {
              time: point.time,
              value: point.value,
              color: getSsl1Color(actualClose, point.value),
            };
          });
        } else if (lineName === "ssl2") {
          colored = lineData.map((point, i) => {
            const actualClose = closeMap.get(point.time) ?? point.close ?? null;
            return {
              time: point.time,
              value: point.value,
              color: getSsl2Color(actualClose, point.value, baselineArr[i]?.value ?? null, point.atr ?? null),
            };
          });
        }

        if (colored) series.setData(colored);
      });
      
      // Update main candle colors
      if (pane && typeof pane.data === "function") {
        const paneDataOriginal = pane.data();
        if (paneDataOriginal.length > 0) {
          if (indicatorStyle?.[indicator]?.candles?.visible) {
             const upperMap = new Map();
             const lowerMap = new Map();
             (upperArr || []).forEach(d => upperMap.set(d.time, d.value));
             (lowerArr || []).forEach(d => lowerMap.set(d.time, d.value));
             
             const updatedPaneData = paneDataOriginal.map((d) => {
               const u = upperMap.get(d.time) ?? null;
               const l = lowerMap.get(d.time) ?? null;
               const c = getBaselineColor(d.close, u, l);
               return {
                 ...d,
                 color: c,
                 borderColor: c,
                 wickColor: c,
               };
             });
             try { pane.setData(updatedPaneData); } catch (e) {}
          } else {
             const revertedData = paneDataOriginal.map((d) => ({
               ...d, color: undefined, borderColor: undefined, wickColor: undefined
             }));
             try { pane.setData(revertedData); } catch (e) {}
          }
        }
      }
    }

    drawBaselineCloud();
  }, [indicatorStyle, result]);

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.remove();
      }
      canvasRef.current = null;
      
      // Revert candle colors back to default
      if (pane && typeof pane.data === "function") {
        try {
          const originalData = pane.data();
          const revertedData = originalData.map((d) => ({
            ...d,
            color: undefined,
            borderColor: undefined,
            wickColor: undefined,
          }));
          pane.setData(revertedData);
        } catch (e) {}
      }
      
      // Let CandleStick.jsx handle series cleanup to prevent memory leaks and un-erasable lines!
    };
  }, [pane]);

  return null;
}