import { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode, LineStyle } from "lightweight-charts";
import axios from "axios";

import "./CupHandleChart.css";

// Helper to generate arc points for Double Bottoms in the frontend
function generateArcPoints(data, startIdx, bottomIdx, endIdx, rimPrice) {
  if (startIdx < 0 || bottomIdx < 0 || endIdx < 0) return [];
  const points = [];
  const bottom = data[bottomIdx].low;
  const leftLen = bottomIdx - startIdx;
  const rightLen = endIdx - bottomIdx;

  for (let i = startIdx; i <= endIdx; i++) {
    if (!data[i]) continue;
    let yValue;
    if (i <= bottomIdx) {
      const t = leftLen === 0 ? 0 : (bottomIdx - i) / leftLen;
      yValue = bottom + (rimPrice - bottom) * Math.pow(t, 2);
    } else {
      const t = rightLen === 0 ? 0 : (i - bottomIdx) / rightLen;
      yValue = bottom + (rimPrice - bottom) * Math.pow(t, 2);
    }
    points.push({ time: data[i].time, value: yValue });
  }
  return points;
}
export default function CupHandleChart() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [patterns, setPatterns] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const pattern = patterns[selectedIndex] || null;
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [patternType, setPatternType] = useState("CUP_HANDLE");
  const [interval, setIntervalVal] = useState("1d");

  useEffect(() => {
    async function fetchPatternData() {
      try {
        // let binanceData = [];
        // let currentEndTime = undefined;

        // // Fetch 4000 candles (4 requests of 1000)
        // for (let i = 0; i < 4; i++) {
        //   let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`;
        //   if (currentEndTime) {
        //     url += `&endTime=${currentEndTime}`;
        //   }

        //   const res = await fetch(url);
        //   const batch = await res.json();

        //   if (!batch || batch.length === 0) break;

        //   binanceData = [...batch, ...binanceData]; // Prepend older data
        //   currentEndTime = batch[0][0] - 1; // oldest candle timestamp - 1ms
        // }
        // console.log(`Successfully fetched ${binanceData.length} candles for ${symbol} at ${interval} interval!`);

        // // Map 4000 candles to lightweight-charts and our API schema
        // const ohlc = binanceData.map((d) => {
        //   // If interval is intraday, we need time in unix seconds. For daily/weekly, YYYY-MM-DD is fine but unix works for all.
        //   // Lightweight charts requires time as unix timestamp (seconds) if we have intraday data.
        //   const isIntraday = interval.includes('h') || interval.includes('m');
        //   const timeVal = isIntraday ? Math.floor(d[0] / 1000) : new Date(d[0]).toISOString().split("T")[0];

        //   return {
        //     time: timeVal,
        //     open: parseFloat(d[1]),
        //     high: parseFloat(d[2]),
        //     low: parseFloat(d[3]),
        //     close: parseFloat(d[4]),
        //     volume: parseFloat(d[5]),
        //   };
        // });

        // 2. Send real candles to our backend POST endpoint for strict analysis
        const res = await axios.post(
          "http://192.168.1.10:7000/api/patterns/analyze-candles",
          {
            patternType,
            symbol,
            timeframe: interval,
          }
        );

        const json = res.data;

        console.log(json, "patternnnnnnnnnnnnnnnnnnnn");

        if (json.success) {
          const results = json.patterns || [];
          const result = results[0];
          setData(json.meta.candles);
          setPatterns(results);
          setSelectedIndex(0);

          if (
            result &&
            patternType === "CUP_HANDLE" &&
            result.indices.leftRim !== -1
          ) {
            setStats({
              depth: result.metrics.cupDepthPct,
              pullback: result.metrics.handleRetracementPct,
              rim: result.metrics.rimLevel,
              bottom: result.metrics.bottomLevel,
              target: result.metrics.target,
              breakoutPrice: result.metrics.breakoutPrice,
              rimDeviation: result.metrics.rimDeviationPct,
              score: result.score,
              quality: result.metrics.quality,
              reason: result.reason,
            });
          } else if (
            result &&
            patternType === "DOUBLE_BOTTOM" &&
            result.indices.firstBottom !== -1
          ) {
            setStats({
              depth: result.metrics.depthPct,
              neckline: result.metrics.neckline,
              lowestBottom: result.metrics.lowestBottom,
              target: result.metrics.target,
              breakoutPrice: result.metrics.breakoutPrice,
              score: result.score,
              quality: result.metrics.quality,
              reason: result.reason,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch pattern data:", err);
      }
    }

    fetchPatternData();
  }, [symbol, patternType, interval]);

  useEffect(() => {
    if (!data.length || !chartContainerRef.current) return;

    // ── Create chart ─────────────────────────────────────────────────────────
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: "#0d1117" },
        textColor: "#c9d1d9",
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: "#161b22" },
        horzLines: { color: "#161b22" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#444", style: LineStyle.Dashed },
        horzLine: { color: "#444", style: LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: "#30363d",
        textColor: "#8b949e",
      },
      timeScale: {
        borderColor: "#30363d",
        textColor: "#8b949e",
        timeVisible: true,
      },
    });
    chartRef.current = chart;

    // ── Candlestick series ────────────────────────────────────────────────────
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a641",
      downColor: "#f85149",
      borderUpColor: "#26a641",
      borderDownColor: "#f85149",
      wickUpColor: "#26a641",
      wickDownColor: "#f85149",
    });

    const candleData = data.map((c, i) => {
      if (
        patternType === "FLAG" &&
        pattern &&
        pattern.indices &&
        pattern.indices.flagStart !== -1
      ) {
        if (i >= pattern.indices.flagStart && i <= pattern.indices.flagEnd) {
          return {
            ...c,
            color:
              pattern.type === "bull_flag"
                ? "rgba(38, 166, 65, 0.3)"
                : "rgba(248, 81, 73, 0.3)",
            borderColor:
              pattern.type === "bull_flag"
                ? "rgba(38, 166, 65, 0.5)"
                : "rgba(248, 81, 73, 0.5)",
            wickColor:
              pattern.type === "bull_flag"
                ? "rgba(38, 166, 65, 0.5)"
                : "rgba(248, 81, 73, 0.5)",
          };
        }
      } else if (
        patternType === "N_PATTERN" &&
        pattern &&
        pattern.indices &&
        pattern.indices.pointA !== undefined
      ) {
        if (i >= pattern.indices.pointA && i <= pattern.indices.pointC) {
          return {
            ...c,
            color:
              pattern.type === "bullish_n"
                ? "rgba(38, 166, 65, 0.3)"
                : "rgba(248, 81, 73, 0.3)",
            borderColor:
              pattern.type === "bullish_n"
                ? "rgba(38, 166, 65, 0.5)"
                : "rgba(248, 81, 73, 0.5)",
            wickColor:
              pattern.type === "bullish_n"
                ? "rgba(38, 166, 65, 0.5)"
                : "rgba(248, 81, 73, 0.5)",
          };
        }
      }
      return c;
    });
    candleSeries.setData(candleData);

    // ── Volume histogram ──────────────────────────────────────────────────────
    const volumeSeries = chart.addHistogramSeries({
      color: "#1f6feb",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    chart
      .priceScale("volume")
      .applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    const volumeData = data.map((c, i) => {
      let color = "#1f6feb44";
      if (
        pattern &&
        patternType === "CUP_HANDLE" &&
        pattern.indices &&
        pattern.indices.leftRim !== -1
      ) {
        if (i === pattern.indices.breakout) color = "#2ea04388";
        else if (
          i >= pattern.indices.rightRim &&
          i <= pattern.indices.handleLow
        )
          color = "#6e404422";
        else if (i >= pattern.indices.leftRim && i <= pattern.indices.rightRim)
          color = "#1f6feb22";
      } else if (
        pattern &&
        patternType === "DOUBLE_BOTTOM" &&
        pattern.indices &&
        pattern.indices.firstBottom !== -1
      ) {
        if (i === pattern.indices.breakout) color = "#2ea04388";
        else if (
          i >= pattern.indices.priorDowntrendStart &&
          i <= pattern.indices.firstBottom
        )
          color = "#f8514922";
        else if (
          i >= pattern.indices.firstBottom &&
          i <= pattern.indices.secondBottom
        )
          color = "#1f6feb22";
      } else if (
        pattern &&
        patternType === "FLAG" &&
        pattern.indices &&
        pattern.indices.flagpoleStart !== -1
      ) {
        if (i === pattern.indices.breakout) color = "#2ea04388";
        else if (
          i >= pattern.indices.flagpoleStart &&
          i <= pattern.indices.flagpoleEnd
        )
          color = pattern.type === "bull_flag" ? "#2ea04322" : "#f8514922";
        else if (i >= pattern.indices.flagStart && i <= pattern.indices.flagEnd)
          color = "#1f6feb22";
      } else if (
        pattern &&
        patternType === "N_PATTERN" &&
        pattern.indices &&
        pattern.indices.pointA !== undefined
      ) {
        if (i === pattern.indices.breakout) color = "#2ea04388";
        else if (
          i >= pattern.indices.pointA &&
          i <= pattern.indices.pointB
        )
          color = pattern.type === "bullish_n" ? "#2ea04322" : "#f8514922";
        else if (i >= pattern.indices.pointB && i <= pattern.indices.pointC)
          color = "#1f6feb22";
      }
      return { time: c.time, value: c.volume, color };
    });
    volumeSeries.setData(volumeData);

    if (patternType === "CUP_HANDLE" && pattern) {
      if (
        !pattern.indices ||
        typeof pattern.indices.leftRim === "undefined" ||
        pattern.indices.leftRim === -1 ||
        pattern.indices.cupBottom === -1
      ) {
        // Skip
      } else {
        const {
          priorUptrendStart = -1,
          leftRim = -1,
          cupBottom = -1,
          handleLow = -1,
          breakout = -1,
        } = pattern.indices;
        const { target = 0 } = pattern.metrics || {};
        const {
          cupArc: cupArcData = [],
          handleUpper: handleUpperData = [],
          handleLower: handleLowerData = [],
          resistanceLine: resistanceLineData = [],
        } = pattern.drawings || {};

        const uptrendLine = chart.addLineSeries({
          color: "#e6edf3cc",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        if (priorUptrendStart !== -1) {
          uptrendLine.setData([
            {
              time: data[priorUptrendStart].time,
              value: data[priorUptrendStart].close,
            },
            { time: data[leftRim].time, value: data[leftRim].high },
          ]);
        }

        const cupArcSeries = chart.addLineSeries({
          color: "#f0c040",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
        });
        cupArcSeries.setData(cupArcData);

        const handleUpper = chart.addLineSeries({
          color: "#c084fc",
          lineWidth: 1.5,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        handleUpper.setData(handleUpperData);

        const handleLower = chart.addLineSeries({
          color: "#c084fc",
          lineWidth: 1.5,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        handleLower.setData(handleLowerData);

        const rimSeries = chart.addLineSeries({
          color: "#e6edf3aa",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        rimSeries.setData(resistanceLineData);

        const targetSeries = chart.addLineSeries({
          color: "#2ea04388",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        const safeBreakout = breakout === -1 ? handleLow : breakout;
        if (safeBreakout !== -1) {
          targetSeries.setData([
            { time: data[safeBreakout].time, value: target },
            { time: data[data.length - 1].time, value: target },
          ]);
        }

        const markers = [];
        if (priorUptrendStart !== -1)
          markers.push({
            time: data[priorUptrendStart].time,
            position: "belowBar",
            color: "#e6edf3",
            shape: "arrowUp",
            text: "① Prior Uptrend",
            size: 1,
          });
        if (leftRim !== -1)
          markers.push({
            time: data[leftRim].time,
            position: "aboveBar",
            color: "#f0c040",
            shape: "arrowDown",
            text: "② Cup Rim",
            size: 1,
          });
        if (cupBottom !== -1)
          markers.push({
            time: data[cupBottom].time,
            position: "belowBar",
            color: "#f0c040",
            shape: "arrowUp",
            text: "③ Bottom",
            size: 1,
          });
        if (handleLow !== -1)
          markers.push({
            time: data[handleLow].time,
            position: "belowBar",
            color: "#c084fc",
            shape: "arrowUp",
            text: "④ Handle",
            size: 1,
          });
        if (breakout !== -1) {
          markers.push({
            time: data[breakout].time,
            position: "aboveBar",
            color: "#2ea043",
            shape: "arrowUp",
            text: "⑤ Breakout",
            size: 1,
          });
          markers.push({
            time: data[data.length - 1].time,
            position: "aboveBar",
            color: "#39d353",
            shape: "arrowUp",
            text: `⑥ Target $${target.toFixed(2)}`,
            size: 1,
          });
        }
        candleSeries.setMarkers(markers);
      }
    } else if (patternType === "DOUBLE_BOTTOM" && pattern) {
      if (
        !pattern.indices ||
        typeof pattern.indices.firstBottom === "undefined" ||
        pattern.indices.firstBottom === -1 ||
        pattern.indices.swingHigh === -1 ||
        pattern.indices.secondBottom === -1
      ) {
        // Skip
      } else {
        const {
          priorDowntrendStart = -1,
          firstBottom = -1,
          swingHigh = -1,
          secondBottom = -1,
          breakout = -1,
        } = pattern.indices;
        const { target = 0, neckline = 0 } = pattern.metrics || {};
        const { necklineLine = [] } = pattern.drawings || {};
        const { arcLeftStartIdx = -1, arcRightEndIdx = -1 } =
          pattern.points || {};

        const arcLeft =
          arcLeftStartIdx !== -1
            ? generateArcPoints(
                data,
                arcLeftStartIdx,
                firstBottom,
                swingHigh,
                neckline,
              )
            : [];
        const arcRight =
          arcRightEndIdx !== -1
            ? generateArcPoints(
                data,
                swingHigh,
                secondBottom,
                arcRightEndIdx,
                neckline,
              )
            : [];

        const downtrendLine = chart.addLineSeries({
          color: "#e6edf3cc",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        if (priorDowntrendStart !== -1 && data[priorDowntrendStart]) {
          downtrendLine.setData([
            {
              time: data[priorDowntrendStart].time,
              value: data[priorDowntrendStart].high,
            },
            { time: data[firstBottom].time, value: data[firstBottom].low },
          ]);
        }

        const arcLeftSeries = chart.addLineSeries({
          color: "#f0c040",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
        });
        arcLeftSeries.setData(arcLeft);

        const arcRightSeries = chart.addLineSeries({
          color: "#f0c040",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
        });
        arcRightSeries.setData(arcRight);

        const necklineSeries = chart.addLineSeries({
          color: "#e6edf3aa",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        necklineSeries.setData(necklineLine);

        const targetSeries = chart.addLineSeries({
          color: "#2ea04388",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        const safeBreakout = breakout === -1 ? secondBottom : breakout;
        if (safeBreakout !== -1) {
          targetSeries.setData([
            { time: data[safeBreakout].time, value: target },
            { time: data[data.length - 1].time, value: target },
          ]);
        }

        const markers = [];
        if (priorDowntrendStart !== -1)
          markers.push({
            time: data[priorDowntrendStart].time,
            position: "aboveBar",
            color: "#e6edf3",
            shape: "arrowDown",
            text: "① Prior Downtrend",
            size: 1,
          });
        if (firstBottom !== -1)
          markers.push({
            time: data[firstBottom].time,
            position: "belowBar",
            color: "#f0c040",
            shape: "arrowUp",
            text: "② First Bottom",
            size: 1,
          });
        if (swingHigh !== -1)
          markers.push({
            time: data[swingHigh].time,
            position: "aboveBar",
            color: "#f0c040",
            shape: "arrowDown",
            text: "③ Neckline / Swing High",
            size: 1,
          });
        if (secondBottom !== -1)
          markers.push({
            time: data[secondBottom].time,
            position: "belowBar",
            color: "#f0c040",
            shape: "arrowUp",
            text: "④ Second Bottom",
            size: 1,
          });
        if (breakout !== -1) {
          markers.push({
            time: data[breakout].time,
            position: "belowBar",
            color: "#2ea043",
            shape: "arrowUp",
            text: "⑤ Breakout",
            size: 1,
          });
          markers.push({
            time: data[data.length - 1].time,
            position: "aboveBar",
            color: "#39d353",
            shape: "arrowUp",
            text: `⑥ Target $${target.toFixed(2)}`,
            size: 1,
          });
        }
        candleSeries.setMarkers(markers);
      }
    } else if (patternType === "FLAG" && pattern) {
      if (
        !pattern.indices ||
        typeof pattern.indices.flagpoleStart === "undefined" ||
        pattern.indices.flagpoleStart === -1
      ) {
        // Skip
      } else {
        const {
          flagpoleStart = -1,
          flagpoleEnd = -1,
          breakout = -1,
        } = pattern.indices;
        const { target = 0 } = pattern.metrics || {};
        const {
          poleLine = [],
          upperChannel = [],
          lowerChannel = [],
        } = pattern.drawings || {};

        const poleSeries = chart.addLineSeries({
          color: "#ffffff",
          lineWidth: 3,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        poleSeries.setData(poleLine);

        const upperSeries = chart.addLineSeries({
          color: "#c084fc",
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        upperSeries.setData(upperChannel);

        const lowerSeries = chart.addLineSeries({
          color: "#c084fc",
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        lowerSeries.setData(lowerChannel);

        const targetSeries = chart.addLineSeries({
          color: "#2ea04388",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        const safeBreakout = breakout === -1 ? flagpoleEnd : breakout;
        if (safeBreakout !== -1) {
          targetSeries.setData([
            { time: data[safeBreakout].time, value: target },
            { time: data[data.length - 1].time, value: target },
          ]);
        }

        const markers = [];
        if (flagpoleStart !== -1)
          markers.push({
            time: data[flagpoleStart].time,
            position: pattern.type === "bull_flag" ? "belowBar" : "aboveBar",
            color: pattern.type === "bull_flag" ? "#2ea043" : "#f85149",
            shape: pattern.type === "bull_flag" ? "arrowUp" : "arrowDown",
            text: "① Flagpole Start",
            size: 1,
          });
        if (flagpoleEnd !== -1)
          markers.push({
            time: data[flagpoleEnd].time,
            position: pattern.type === "bull_flag" ? "aboveBar" : "belowBar",
            color: pattern.type === "bull_flag" ? "#2ea043" : "#f85149",
            shape: pattern.type === "bull_flag" ? "arrowDown" : "arrowUp",
            text: "② Flagpole End",
            size: 1,
          });
        if (breakout !== -1) {
          markers.push({
            time: data[breakout].time,
            position: pattern.type === "bull_flag" ? "belowBar" : "aboveBar",
            color: "#2ea043",
            shape: pattern.type === "bull_flag" ? "arrowUp" : "arrowDown",
            text: "③ Breakout",
            size: 1,
          });
          markers.push({
            time: data[data.length - 1].time,
            position: pattern.type === "bull_flag" ? "aboveBar" : "belowBar",
            color: "#39d353",
            shape: pattern.type === "bull_flag" ? "arrowUp" : "arrowDown",
            text: `④ Target $${target.toFixed(2)}`,
            size: 1,
          });
        }
        candleSeries.setMarkers(markers);
      }
    } else if (patternType === "N_PATTERN" && pattern) {
      if (
        !pattern.indices ||
        typeof pattern.indices.pointA === "undefined" ||
        pattern.indices.pointA === -1
      ) {
        // Skip
      } else {
        const {
          pointA = -1,
          pointB = -1,
          pointC = -1,
          breakout = -1,
        } = pattern.indices;
        const { target = 0 } = pattern.metrics || {};
        const {
          nLine = [],
        } = pattern.drawings || {};

        const nLineSeries = chart.addLineSeries({
          color: pattern.type === "bullish_n" ? "#2ea043" : "#f85149",
          lineWidth: 3,
          lineStyle: LineStyle.Solid,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        nLineSeries.setData(nLine);

        const targetSeries = chart.addLineSeries({
          color: "#2ea04388",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        
        const safeBreakout = breakout === -1 ? pointC : breakout;
        if (safeBreakout !== -1) {
          targetSeries.setData([
            { time: data[safeBreakout].time, value: target },
            { time: data[data.length - 1].time, value: target },
          ]);
        }

        const markers = [];
        if (pointA !== -1)
          markers.push({
            time: data[pointA].time,
            position: pattern.type === "bullish_n" ? "belowBar" : "aboveBar",
            color: pattern.type === "bullish_n" ? "#2ea043" : "#f85149",
            shape: pattern.type === "bullish_n" ? "arrowUp" : "arrowDown",
            text: "A",
            size: 1,
          });
        if (pointB !== -1)
          markers.push({
            time: data[pointB].time,
            position: pattern.type === "bullish_n" ? "aboveBar" : "belowBar",
            color: pattern.type === "bullish_n" ? "#2ea043" : "#f85149",
            shape: pattern.type === "bullish_n" ? "arrowDown" : "arrowUp",
            text: "B",
            size: 1,
          });
        if (pointC !== -1)
          markers.push({
            time: data[pointC].time,
            position: pattern.type === "bullish_n" ? "belowBar" : "aboveBar",
            color: "#c084fc",
            shape: pattern.type === "bullish_n" ? "arrowUp" : "arrowDown",
            text: "C",
            size: 1,
          });
        if (breakout !== -1) {
          markers.push({
            time: data[breakout].time,
            position: pattern.type === "bullish_n" ? "belowBar" : "aboveBar",
            color: "#39d353",
            shape: pattern.type === "bullish_n" ? "arrowUp" : "arrowDown",
            text: `Target $${target.toFixed(2)}`,
            size: 1,
          });
        }
        candleSeries.setMarkers(markers);
      }
    }

    chart.timeScale().fitContent();

    // ── Responsive resize ─────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
    });
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data, patterns, selectedIndex]);

  return (
    <div className="app-root">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M2 18 Q6 6 11 9 Q16 12 20 4"
                stroke="#f0c040"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="11" cy="9" r="2" fill="#f0c040" />
            </svg>
            <span>Pattern Detector</span>
          </div>
        </div>

        <div
          className="header-center"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <select
            value={patternType}
            onChange={(e) => {
              setPatternType(e.target.value);
              setPatterns([]);
              setSelectedIndex(0);
              setStats(null);
            }}
            style={{
              background: "#21262d",
              color: "#c9d1d9",
              border: "1px solid #30363d",
              padding: "6px 12px",
              borderRadius: "6px",
              outline: "none",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="CUP_HANDLE">Cup & Handle</option>
            <option value="DOUBLE_BOTTOM">Double Bottom</option>
            <option value="FLAG">Bull / Bear Flag</option>
            <option value="N_PATTERN">N Pattern</option>
          </select>
          <select
            value={symbol}
            onChange={(e) => {
              setPatterns([]);
              setSelectedIndex(0);
              setStats(null);
              setSymbol(e.target.value);
            }}
            style={{
              background: "#21262d",
              color: "#c9d1d9",
              border: "1px solid #30363d",
              padding: "6px 12px",
              borderRadius: "6px",
              outline: "none",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="BTCUSDT">Bitcoin (BTC/USDT)</option>
            <option value="ETHUSDT">Ethereum (ETH/USDT)</option>
            <option value="BNBUSDT">Binance Coin (BNB/USDT)</option>
            <option value="SOLUSDT">Solana (SOL/USDT)</option>
            <option value="XRPUSDT">Ripple (XRP/USDT)</option>
          </select>
          <select
            value={interval}
            onChange={(e) => {
              setPatterns([]);
              setSelectedIndex(0);
              setStats(null);
              setIntervalVal(e.target.value);
            }}
            style={{
              background: "#21262d",
              color: "#c9d1d9",
              border: "1px solid #30363d",
              padding: "6px 12px",
              borderRadius: "6px",
              outline: "none",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1H</option>
            <option value="4h">4H</option>
            <option value="1d">1D</option>
            <option value="1w">1W</option>
          </select>
        </div>

        {stats && patternType === "CUP_HANDLE" && (
          <div className="stat-pills">
            <div className="pill pill--blue">
              <span className="pill-label">Quality</span>
              <span
                className="pill-val"
                style={{ textTransform: "capitalize" }}
              >
                {stats.quality || "Unknown"}
              </span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Depth</span>
              <span className="pill-val">{stats.depth}%</span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Rim</span>
              <span className="pill-val">${stats.rim.toFixed(2)}</span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Bottom</span>
              <span className="pill-val">${stats.bottom.toFixed(2)}</span>
            </div>
            <div className="pill pill--purple">
              <span className="pill-label">Handle PB</span>
              <span className="pill-val">{stats.pullback}%</span>
            </div>
            <div className="pill pill--green">
              <span className="pill-label">Breakout</span>
              <span className="pill-val">
                ${stats.breakoutPrice?.toFixed(2)}
              </span>
            </div>
            <div className="pill pill--green-bright">
              <span className="pill-label">🎯 Target</span>
              <span className="pill-val">${stats.target.toFixed(2)}</span>
            </div>
          </div>
        )}

        {stats && patternType === "DOUBLE_BOTTOM" && (
          <div className="stat-pills">
            <div className="pill pill--blue">
              <span className="pill-label">Quality</span>
              <span
                className="pill-val"
                style={{ textTransform: "capitalize" }}
              >
                {stats.quality || "Unknown"}
              </span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Depth</span>
              <span className="pill-val">{stats.depth}%</span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Neckline</span>
              <span className="pill-val">${stats.neckline?.toFixed(2)}</span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Lowest Bottom</span>
              <span className="pill-val">
                ${stats.lowestBottom?.toFixed(2)}
              </span>
            </div>
            <div className="pill pill--green">
              <span className="pill-label">Breakout</span>
              <span className="pill-val">
                ${stats.breakoutPrice?.toFixed(2)}
              </span>
            </div>
            <div className="pill pill--green-bright">
              <span className="pill-label">🎯 Target</span>
              <span className="pill-val">${stats.target?.toFixed(2)}</span>
            </div>
          </div>
        )}

        {stats && patternType === "FLAG" && (
          <div className="stat-pills">
            <div className="pill pill--blue">
              <span className="pill-label">Quality</span>
              <span
                className="pill-val"
                style={{ textTransform: "capitalize" }}
              >
                {stats.quality || "Unknown"}
              </span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Type</span>
              <span
                className="pill-val"
                style={{ textTransform: "capitalize" }}
              >
                {pattern?.type?.replace("_", " ") || "Flag"}
              </span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Slope</span>
              <span
                className="pill-val"
                style={{ textTransform: "capitalize" }}
              >
                {stats.slopeType || "Flat"}
              </span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Pole Dom.</span>
              <span className="pill-val">
                {(stats.dominance * 100).toFixed(1)}%
              </span>
            </div>
            <div className="pill pill--purple">
              <span className="pill-label">Retracement</span>
              <span className="pill-val">
                {(stats.retracementPct * 100).toFixed(1)}%
              </span>
            </div>
            <div className="pill pill--purple">
              <span className="pill-label">Channel W.</span>
              <span className="pill-val">
                {(stats.channelWidthPct * 100).toFixed(1)}%
              </span>
            </div>
            <div className="pill pill--green">
              <span className="pill-label">Breakout</span>
              <span className="pill-val">
                {pattern?.indices?.breakout !== -1
                  ? `$${data[pattern.indices.breakout]?.close.toFixed(2)}`
                  : "Pending"}
              </span>
            </div>
            <div className="pill pill--green-bright">
              <span className="pill-label">🎯 Target</span>
              <span className="pill-val">${stats.target?.toFixed(2)}</span>
            </div>
          </div>
        )}

        {stats && patternType === "N_PATTERN" && (
          <div className="stat-pills">
            <div className="pill pill--blue">
              <span className="pill-label">Quality</span>
              <span
                className="pill-val"
                style={{ textTransform: "capitalize" }}
              >
                {stats.quality || "Unknown"}
              </span>
            </div>
            <div className="pill pill--blue">
              <span className="pill-label">Type</span>
              <span
                className="pill-val"
                style={{ textTransform: "capitalize" }}
              >
                {pattern?.type?.replace("_", " ") || "N Pattern"}
              </span>
            </div>
            <div className="pill pill--purple">
              <span className="pill-label">Retracement</span>
              <span className="pill-val">
                {(stats.retracementPct)?.toFixed(1)}%
              </span>
            </div>
            <div className="pill pill--green-bright">
              <span className="pill-label">🎯 Target</span>
              <span className="pill-val">${stats.target?.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="badge-wrap">
          {pattern?.isValid ? (
            <span className="badge badge--valid">
              ✓ Pattern Detected (Score: {pattern.score})
            </span>
          ) : (
            <span className="badge badge--invalid">
              ✗ Invalid: {stats?.reason || pattern?.reason || "Not Detected"}
            </span>
          )}
        </div>
      </header>

      {/* ── Main chart ── */}

      <div className="main-content">
        <aside className="sidebar">
          <h3>Detected Patterns</h3>
          <div className="pattern-list">
            {patterns.length === 0 && (
              <div className="no-patterns">No patterns found</div>
            )}
            {patterns.map((p, i) => {
              let dateStr = "Unknown Date";
              if (patternType === "CUP_HANDLE" && p.indices?.leftRim !== undefined && p.indices.leftRim !== -1 && data[p.indices.leftRim]) {
                dateStr = data[p.indices.leftRim].time;
              } else if (patternType === "DOUBLE_BOTTOM" && p.indices?.firstBottom !== undefined && p.indices.firstBottom !== -1 && data[p.indices.firstBottom]) {
                dateStr = data[p.indices.firstBottom].time;
              } else if (patternType === "FLAG" && p.indices?.flagpoleStart !== undefined && p.indices.flagpoleStart !== -1 && data[p.indices.flagpoleStart]) {
                dateStr = data[p.indices.flagpoleStart].time;
              } else if (patternType === "N_PATTERN" && p.indices?.pointA !== undefined && p.indices.pointA !== -1 && data[p.indices.pointA]) {
                dateStr = data[p.indices.pointA].time;
              }

              return (
                <div
                  key={i}
                  className={`pattern-item ${i === selectedIndex ? "active" : ""}`}
                  onClick={() => {
                    setSelectedIndex(i);
                    // Update stats for clicked pattern
                    if (
                      patternType === "CUP_HANDLE" &&
                      p.indices.leftRim !== -1
                    ) {
                      setStats({
                        depth: p.metrics.cupDepthPct,
                        pullback: p.metrics.handleRetracementPct,
                        rim: p.metrics.rimLevel,
                        bottom: p.metrics.bottomLevel,
                        target: p.metrics.target,
                        breakoutPrice: p.metrics.breakoutPrice,
                        rimDeviation: p.metrics.rimDeviationPct,
                        score: p.score,
                        quality: p.metrics.quality,
                        reason: p.reason,
                      });
                    } else if (
                      patternType === "DOUBLE_BOTTOM" &&
                      p.indices.firstBottom !== -1
                    ) {
                      setStats({
                        depth: p.metrics.depthPct,
                        neckline: p.metrics.neckline,
                        lowestBottom: p.metrics.lowestBottom,
                        target: p.metrics.target,
                        breakoutPrice: p.metrics.breakoutPrice,
                        score: p.score,
                        quality: p.metrics.quality,
                        reason: p.reason,
                      });
                    } else if (
                      patternType === "FLAG" &&
                      p.indices.flagpoleStart !== -1
                    ) {
                      setStats({
                        movePct: p.metrics.movePct,
                        retracementPct: p.metrics.retracementPct,
                        channelWidthPct: p.metrics.channelWidthPct,
                        target: p.metrics.target,
                        breakoutPrice:
                          p.indices.breakout !== -1
                            ? data[p.indices.breakout].close
                            : undefined,
                        score: p.score,
                        quality: p.metrics.quality,
                        slopeType: p.metrics.slopeType,
                        dominance: p.metrics.dominance,
                        reason: p.reason,
                      });
                    } else if (
                      patternType === "N_PATTERN" &&
                      p.indices.pointA !== undefined
                    ) {
                      setStats({
                        retracementPct: p.metrics.retracementPct,
                        target: p.metrics.target,
                        score: p.score,
                        quality: p.metrics.quality,
                        reason: p.reason,
                      });
                    }

                    if (chartRef.current) {
                      let startIdx = 0;
                      let endIdx = data.length - 1;
                      if (
                        patternType === "CUP_HANDLE" &&
                        p.indices.leftRim !== -1
                      ) {
                        startIdx =
                          p.indices.priorUptrendStart !== -1
                            ? p.indices.priorUptrendStart
                            : p.indices.leftRim;
                        endIdx =
                          p.indices.breakout !== -1
                            ? p.indices.breakout
                            : p.indices.handleLow;
                      } else if (
                        patternType === "DOUBLE_BOTTOM" &&
                        p.indices.firstBottom !== -1
                      ) {
                        startIdx =
                          p.indices.priorDowntrendStart !== -1
                            ? p.indices.priorDowntrendStart
                            : p.indices.firstBottom;
                        endIdx =
                          p.indices.breakout !== -1
                            ? p.indices.breakout
                            : p.indices.secondBottom;
                      } else if (
                        patternType === "FLAG" &&
                        p.indices.flagpoleStart !== -1
                      ) {
                        startIdx = p.indices.flagpoleStart;
                        endIdx =
                          p.indices.breakout !== -1
                            ? p.indices.breakout
                            : p.indices.flagEnd;
                      }
                      chartRef.current
                        .timeScale()
                        .setVisibleLogicalRange({
                          from: Math.max(0, startIdx - 10),
                          to: Math.min(data.length - 1, endIdx + 15),
                        });
                    }
                  }}
                >
                  <div className="pattern-date">{dateStr}</div>
                  <div className="pattern-score">Score: {p.score}</div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="chart-and-info">
          <div className="chart-wrapper">
            <div ref={chartContainerRef} className="chart-container" />

            {/* Legend overlay */}
            <div className="legend">
              {patternType === "CUP_HANDLE" ? (
                <>
                  <LegendItem color="#e6edf3" label="① Prior Uptrend" />
                  <LegendItem
                    color="#f0c040"
                    label="② Cup Rim / Resistance"
                    dashed
                  />
                  <LegendItem color="#f0c040" label="③ Cup Arc" />
                  <LegendItem color="#c084fc" label="④ Handle Channel" />
                  <LegendItem color="#2ea043" label="⑤ Breakout" />
                  <LegendItem
                    color="#39d353"
                    label="⑥ Measured Target"
                    dashed
                  />
                </>
              ) : patternType === "DOUBLE_BOTTOM" ? (
                <>
                  <LegendItem color="#e6edf3" label="① Prior Downtrend" />
                  <LegendItem
                    color="#e6edf3"
                    label="② Neckline / Resistance"
                    dashed
                  />
                  <LegendItem color="#f0c040" label="③ Bottom Arcs" />
                  <LegendItem color="#2ea043" label="④ Breakout" />
                  <LegendItem
                    color="#39d353"
                    label="⑤ Measured Target"
                    dashed
                  />
                </>
              ) : patternType === "FLAG" ? (
                <>
                  <LegendItem color="#ffffff" label="① Flagpole" />
                  <LegendItem color="#c084fc" label="② Flag Channel" dashed />
                  <LegendItem color="#2ea043" label="③ Breakout" />
                  <LegendItem
                    color="#39d353"
                    label="④ Measured Target"
                    dashed
                  />
                </>
              ) : patternType === "N_PATTERN" ? (
                <>
                  <LegendItem color="#2ea043" label="A. First High/Low" />
                  <LegendItem color="#f85149" label="B. Retracement" />
                  <LegendItem color="#c084fc" label="C. Higher Low/Lower High" />
                  <LegendItem color="#2ea043" label="D. Breakout" />
                  <LegendItem
                    color="#39d353"
                    label="🎯 Target"
                    dashed
                  />
                </>
              ) : null}
            </div>
          </div>

          {/* ── Info cards ── */}
          <div className="info-row">
            <InfoCard
              title="Pattern Structure"
              icon="📐"
              items={
                patternType === "CUP_HANDLE"
                  ? pattern?.isValid
                    ? [
                        {
                          label: "Cup Depth",
                          value: `${stats?.depth}%`,
                          ok: true,
                        },
                        {
                          label: "Handle Pullback",
                          value: `${stats?.pullback}%`,
                          ok: true,
                        },
                        {
                          label: "Rim Symmetry",
                          value:
                            stats?.rimDeviation !== undefined
                              ? `${stats.rimDeviation}% deviation`
                              : "Calculating...",
                          ok: stats?.rimDeviation <= 10,
                        },
                        {
                          label: "Rounded Bottom",
                          value: "U-shaped ✓",
                          ok: true,
                        },
                      ]
                    : [{ label: "Status", value: "Not Detected", ok: false }]
                  : patternType === "DOUBLE_BOTTOM"
                    ? pattern?.isValid
                      ? [
                          {
                            label: "Depth",
                            value: `${stats?.depth}%`,
                            ok: true,
                          },
                          {
                            label: "Bottom Symmetry",
                            value: pattern?.geometry?.symmetryStatus,
                            ok: pattern?.checks?.bottomSymmetry,
                          },
                          {
                            label: "Time Symmetry",
                            value: "",
                            ok: pattern?.checks?.timeSymmetry,
                          },
                          {
                            label: "Strong Downtrend",
                            value: "",
                            ok: pattern?.checks?.strongDowntrend,
                          },
                          {
                            label: "Retest Occurred",
                            value: "",
                            ok: pattern?.retest?.occurred,
                          },
                        ]
                      : [{ label: "Status", value: "Not Detected", ok: false }]
                    : patternType === "FLAG" 
                      ? pattern?.isValid
                        ? [
                            {
                              label: "Flagpole Momentum",
                              value: "Strong ✓",
                              ok: pattern?.checks?.flagpoleStrong,
                            },
                            {
                              label: "Channel Bounds",
                              value: "Parallel ✓",
                              ok: pattern?.checks?.channelValid,
                            },
                            {
                              label: "Time Symmetry",
                              value: "",
                              ok: pattern?.checks?.timeSymmetry,
                            },
                            {
                              label: "Volume Spiked",
                              value: "",
                              ok: pattern?.checks?.volumeValid,
                            },
                            {
                              label: "Trend EMA Aligned",
                              value: "",
                              ok: pattern?.checks?.emaTrendValid,
                            },
                          ]
                        : [{ label: "Status", value: "Not Detected", ok: false }]
                    : pattern?.isValid
                      ? [
                          {
                            label: "Retracement Level",
                            value: `${stats?.retracementPct?.toFixed(1)}%`,
                            ok: true,
                          },
                          {
                            label: "Target Reached",
                            value: "Pending",
                            ok: false,
                          },
                        ]
                      : [{ label: "Status", value: "Not Detected", ok: false }]
              }
            />
            {patternType === "CUP_HANDLE" && (
              <InfoCard
                title="Volume Behaviour"
                icon="📊"
                items={[
                  { label: "Prior Uptrend", value: "Higher Volume", ok: true },
                  {
                    label: "Cup Formation",
                    value: "Declining Volume",
                    ok: true,
                  },
                  { label: "Handle", value: "Contracting Volume", ok: true },
                  { label: "Breakout", value: "≥ 1.5× Avg Vol", ok: true },
                ]}
              />
            )}
            <InfoCard
              title="Key Checklist"
              icon="✅"
              items={
                patternType === "CUP_HANDLE" && pattern
                  ? [
                      {
                        label: "Prior uptrend visible",
                        value: "",
                        ok: pattern.checks.priorUptrendValid,
                      },
                      {
                        label: "U-shaped cup (not V)",
                        value: pattern.geometry?.shape,
                        ok: pattern.geometry?.shape?.includes("Valid"),
                      },
                      {
                        label: "Handle pullback valid",
                        value: "",
                        ok: pattern.checks.handleValid,
                      },
                      {
                        label: "Breakout above rim",
                        value: "",
                        ok: pattern.checks.breakoutValid,
                      },
                    ]
                  : patternType === "DOUBLE_BOTTOM" && pattern
                    ? [
                        {
                          label: "Prior downtrend visible",
                          value: "",
                          ok: pattern.checks.priorDowntrendValid,
                        },
                        {
                          label: "Bottoms are symmetrical",
                          value: pattern.geometry?.symmetryStatus,
                          ok: pattern.checks.bottomSymmetry,
                        },
                        {
                          label: "Breakout above neckline",
                          value: "",
                          ok: pattern.checks.breakoutValid,
                        },
                      ]
                    : []
              }
            />
            <InfoCard
              title="Target Formula"
              icon="🎯"
              accent
              items={
                patternType === "CUP_HANDLE" && stats
                  ? [
                      { label: "Rim Level", value: `$${stats.rim.toFixed(2)}` },
                      {
                        label: "Bottom Level",
                        value: `$${stats.bottom.toFixed(2)}`,
                      },
                      {
                        label: "Cup Depth",
                        value: `$${(stats.rim - stats.bottom).toFixed(2)}`,
                      },
                      {
                        label: "Breakout Price",
                        value: `$${stats.breakoutPrice?.toFixed(2)}`,
                      },
                      {
                        label: "🎯 Target",
                        value: `$${stats.target.toFixed(2)}`,
                        ok: true,
                      },
                    ]
                  : patternType === "DOUBLE_BOTTOM" && stats
                    ? [
                        {
                          label: "Neckline",
                          value: `$${stats.neckline?.toFixed(2)}`,
                        },
                        {
                          label: "Lowest Bottom",
                          value: `$${stats.lowestBottom?.toFixed(2)}`,
                        },
                        {
                          label: "Breakout Price",
                          value: `$${stats.breakoutPrice?.toFixed(2)}`,
                        },
                        {
                          label: "🎯 Target",
                          value: `$${stats.target?.toFixed(2)}`,
                          ok: true,
                        },
                      ]
                    : patternType === "N_PATTERN" && stats
                    ? [
                        {
                          label: "Retracement",
                          value: `${stats.retracementPct?.toFixed(1)}%`,
                        },
                        {
                          label: "🎯 Target",
                          value: `$${stats.target?.toFixed(2)}`,
                          ok: true,
                        },
                      ]
                    : [{ label: "Calculating…", value: "" }]
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────────

function LegendItem({ color, label, dashed }) {
  return (
    <div className="legend-item">
      <span
        className="legend-line"
        style={{
          background: dashed ? "transparent" : color,
          borderTop: dashed ? `2px dashed ${color}` : "none",
        }}
      />
      <span className="legend-label">{label}</span>
    </div>
  );
}

function InfoCard({ title, icon, items, accent }) {
  return (
    <div className={`info-card${accent ? " info-card--accent" : ""}`}>
      <div className="info-card-title">
        <span>{icon}</span> {title}
      </div>
      <ul className="info-card-list">
        {items.map((item, i) => (
          <li key={i} className={`info-card-item${item.ok ? " ok" : ""}`}>
            <span className="item-label">{item.label}</span>
            {item.value && <span className="item-value">{item.value}</span>}
            {item.ok !== undefined && (
              <span className="item-check">{item.ok ? "✓" : "✗"}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}