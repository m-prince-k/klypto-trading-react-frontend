import React, { useEffect, useRef, useState } from 'react';
import { usePatterns } from '../util/usePatterns';
import { LineSeries, LineStyle, createSeriesMarkers } from 'lightweight-charts';

// Safely set markers for v3 and v4 compatibility
export const safeSetMarkers = (series, markers) => {
    try {
        if (typeof series.setMarkers === 'function') {
            series.setMarkers(markers);
        } else if (typeof createSeriesMarkers === 'function') {
            const plugin = createSeriesMarkers(series, markers);
            if (plugin && typeof plugin.setMarkers === 'function') {
                plugin.setMarkers(markers);
            }
        }
    } catch (e) {
        console.warn('Failed to set markers:', e);
    }
};

const normalizePoint = (pt) => pt;

// --- Centralized Drawing Logic ---
function drawPattern(chart, candleSeries, patternType, pattern, rawData) {
    if (!chart || !candleSeries || !patternType || !pattern || !rawData) return { newSeries: [], markers: [] };

    const normalizeTime = (t) => {
        if (!t) return t;
        if (typeof t === 'string') return Math.floor(new Date(t).getTime() / 1000);
        if (typeof t === 'number' && t > 20000000000) return Math.floor(t / 1000);
        return t;
    };

    const data = rawData.map(d => ({ ...d, time: normalizeTime(d.time) }));
    
    // Normalize drawings
    const normDrawings = {};
    if (pattern.drawings) {
        for (const [key, pts] of Object.entries(pattern.drawings)) {
            if (Array.isArray(pts)) {
                normDrawings[key] = pts.map(pt => ({ ...pt, time: normalizeTime(pt.time) }));
            }
        }
    }
    pattern = { ...pattern, drawings: normDrawings };

    const newSeries = [];
    let markers = [];

    if (!pattern || !pattern.indices || !data || data.length === 0) return { newSeries, markers: [] };

    if (patternType === 'CUP_HANDLE') {
        const { priorUptrendStart, leftRim, cupBottom, handleLow, breakout } = pattern.indices;
        const { target = 0 } = pattern.metrics || {};
        const { cupArc = [], handleUpper = [], handleLower = [], resistanceLine = [] } = pattern.drawings || {};

        if (priorUptrendStart !== -1 && data[priorUptrendStart] && data[leftRim]) {
            const uptrendLine = chart.addSeries(LineSeries,{
                color: "#e6edf3cc", lineWidth: 2, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false,
            });
            uptrendLine.setData([
                { time: data[priorUptrendStart].time, value: data[priorUptrendStart].close },
                { time: data[leftRim].time, value: data[leftRim].high },
            ]);
            newSeries.push(uptrendLine);
        }

        if (cupArc.length > 0) {
            const cupArcSeries = chart.addSeries(LineSeries,{
                color: "#f0c040", lineWidth: 2, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false,
            });
            cupArcSeries.setData(cupArc.map(normalizePoint));
            newSeries.push(cupArcSeries);
        }

        if (handleUpper.length > 0) {
            const hUpper = chart.addSeries(LineSeries,{
                color: "#c084fc", lineWidth: 1.5, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false,
            });
            hUpper.setData(handleUpper.map(normalizePoint));
            newSeries.push(hUpper);
        }

        if (handleLower.length > 0) {
            const hLower = chart.addSeries(LineSeries,{
                color: "#c084fc", lineWidth: 1.5, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false,
            });
            hLower.setData(handleLower.map(normalizePoint));
            newSeries.push(hLower);
        }

        if (resistanceLine.length > 0) {
            const rimSeries = chart.addSeries(LineSeries,{
                color: "#e6edf3aa", lineWidth: 1, lineStyle: LineStyle.Dashed,
                lastValueVisible: false, priceLineVisible: false,
            });
            rimSeries.setData(resistanceLine.map(normalizePoint));
            newSeries.push(rimSeries);
        }

        const safeBreakout = breakout === -1 ? handleLow : breakout;
        if (safeBreakout !== -1 && data[safeBreakout] && data[data.length - 1]) {
            const targetSeries = chart.addSeries(LineSeries,{
                color: "#2ea04388", lineWidth: 1, lineStyle: LineStyle.Dashed,
                lastValueVisible: false, priceLineVisible: false,
            });
            targetSeries.setData([
                { time: data[safeBreakout].time, value: target },
                { time: data[data.length - 1].time, value: target },
            ]);
            newSeries.push(targetSeries);
        }

        // Add markers
        if (priorUptrendStart !== -1 && data[priorUptrendStart]) markers.push({ time: data[priorUptrendStart].time, position: "belowBar", color: "#e6edf3", shape: "arrowUp", text: "① Prior Uptrend", size: 1 });
        if (leftRim !== -1 && data[leftRim]) markers.push({ time: data[leftRim].time, position: "aboveBar", color: "#f0c040", shape: "arrowDown", text: "② Cup Rim", size: 1 });
        if (cupBottom !== -1 && data[cupBottom]) markers.push({ time: data[cupBottom].time, position: "belowBar", color: "#f0c040", shape: "arrowUp", text: "③ Bottom", size: 1 });
        if (handleLow !== -1 && data[handleLow]) markers.push({ time: data[handleLow].time, position: "belowBar", color: "#c084fc", shape: "arrowUp", text: "④ Handle", size: 1 });
        if (breakout !== -1 && data[breakout]) {
            markers.push({ time: data[breakout].time, position: "aboveBar", color: "#2ea043", shape: "arrowUp", text: "⑤ Breakout", size: 1 });
            markers.push({ time: data[data.length - 1].time, position: "aboveBar", color: "#39d353", shape: "arrowUp", text: `⑥ Target $${target.toFixed(2)}`, size: 1 });
        }
    } 
    else if (patternType === 'DOUBLE_BOTTOM') {
        const { priorDowntrendStart, firstBottom, swingHigh, secondBottom, breakout } = pattern.indices;
        const { target = 0, neckline = 0 } = pattern.metrics || {};
        const { necklineLine = [] } = pattern.drawings || {};
        
        // Arc generation for frontend (simplified)
        const generateArcPoints = (data, startIdx, bottomIdx, endIdx, rimPrice) => {
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
        };

        const { arcLeftStartIdx = -1, arcRightEndIdx = -1 } = pattern.points || {};
        const arcLeft = arcLeftStartIdx !== -1 ? generateArcPoints(data, arcLeftStartIdx, firstBottom, swingHigh, neckline) : [];
        const arcRight = arcRightEndIdx !== -1 ? generateArcPoints(data, swingHigh, secondBottom, arcRightEndIdx, neckline) : [];

        if (priorDowntrendStart !== -1 && data[priorDowntrendStart] && data[firstBottom]) {
            const downtrendLine = chart.addSeries(LineSeries,{
                color: "#e6edf3cc", lineWidth: 2, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false,
            });
            downtrendLine.setData([
                { time: data[priorDowntrendStart].time, value: data[priorDowntrendStart].high },
                { time: data[firstBottom].time, value: data[firstBottom].low },
            ]);
            newSeries.push(downtrendLine);
        }

        if (arcLeft.length > 0) {
            const arcLeftSeries = chart.addSeries(LineSeries,{
                color: "#f0c040", lineWidth: 2, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false,
            });
            arcLeftSeries.setData(arcLeft.map(normalizePoint));
            newSeries.push(arcLeftSeries);
        }

        if (arcRight.length > 0) {
            const arcRightSeries = chart.addSeries(LineSeries,{
                color: "#f0c040", lineWidth: 2, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false,
            });
            arcRightSeries.setData(arcRight.map(normalizePoint));
            newSeries.push(arcRightSeries);
        }

        if (necklineLine.length > 0) {
            const neckLine = chart.addSeries(LineSeries,{
                color: "#e6edf3aa", lineWidth: 1, lineStyle: LineStyle.Dashed,
                lastValueVisible: false, priceLineVisible: false,
            });
            neckLine.setData(necklineLine.map(normalizePoint));
            newSeries.push(neckLine);
        }

        const safeBreakout = breakout === -1 ? secondBottom : breakout;
        if (safeBreakout !== -1 && data[safeBreakout] && data[data.length - 1]) {
            const targetSeries = chart.addSeries(LineSeries,{
                color: "#2ea04388", lineWidth: 1, lineStyle: LineStyle.Dashed,
                lastValueVisible: false, priceLineVisible: false,
            });
            targetSeries.setData([
                { time: data[safeBreakout].time, value: target },
                { time: data[data.length - 1].time, value: target },
            ]);
            newSeries.push(targetSeries);
        }


        if (priorDowntrendStart !== -1 && data[priorDowntrendStart]) markers.push({ time: data[priorDowntrendStart].time, position: "aboveBar", color: "#e6edf3", shape: "arrowDown", text: "① Prior Downtrend", size: 1 });
        if (firstBottom !== -1 && data[firstBottom]) markers.push({ time: data[firstBottom].time, position: "belowBar", color: "#f0c040", shape: "arrowUp", text: "② First Bottom", size: 1 });
        if (swingHigh !== -1 && data[swingHigh]) markers.push({ time: data[swingHigh].time, position: "aboveBar", color: "#f0c040", shape: "arrowDown", text: "③ Neckline / Swing High", size: 1 });
        if (secondBottom !== -1 && data[secondBottom]) markers.push({ time: data[secondBottom].time, position: "belowBar", color: "#f0c040", shape: "arrowUp", text: "④ Second Bottom", size: 1 });
        if (breakout !== -1 && data[breakout]) {
            markers.push({ time: data[breakout].time, position: "belowBar", color: "#2ea043", shape: "arrowUp", text: "⑤ Breakout", size: 1 });
            markers.push({ time: data[data.length - 1].time, position: "aboveBar", color: "#39d353", shape: "arrowUp", text: `⑥ Target $${target.toFixed(2)}`, size: 1 });
        }
    }
    else if (patternType === 'FLAG') {
        const { flagpoleStart, flagpoleEnd, breakout } = pattern.indices;
        const { target = 0 } = pattern.metrics || {};
        const { poleLine = [], upperChannel = [], lowerChannel = [] } = pattern.drawings || {};

        if (poleLine.length > 0) {
            const poleSeries = chart.addSeries(LineSeries,{
                color: "#ffffff", lineWidth: 3, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false,
            });
            poleSeries.setData(poleLine.map(normalizePoint));
            newSeries.push(poleSeries);
        }

        if (upperChannel.length > 0) {
            const upperSeries = chart.addSeries(LineSeries,{
                color: "#c084fc", lineWidth: 2, lineStyle: LineStyle.Dashed,
                lastValueVisible: false, priceLineVisible: false,
            });
            upperSeries.setData(upperChannel.map(normalizePoint));
            newSeries.push(upperSeries);
        }

        if (lowerChannel.length > 0) {
            const lowerSeries = chart.addSeries(LineSeries,{
                color: "#c084fc", lineWidth: 2, lineStyle: LineStyle.Dashed,
                lastValueVisible: false, priceLineVisible: false,
            });
            lowerSeries.setData(lowerChannel.map(normalizePoint));
            newSeries.push(lowerSeries);
        }

        const safeBreakout = breakout === -1 ? flagpoleEnd : breakout;
        if (safeBreakout !== -1 && data[safeBreakout] && data[data.length - 1]) {
            const targetSeries = chart.addSeries(LineSeries,{
                color: "#2ea04388", lineWidth: 1, lineStyle: LineStyle.Dashed,
                lastValueVisible: false, priceLineVisible: false,
            });
            targetSeries.setData([
                { time: data[safeBreakout].time, value: target },
                { time: data[data.length - 1].time, value: target },
            ]);
            newSeries.push(targetSeries);
        }


        if (flagpoleStart !== -1 && data[flagpoleStart]) markers.push({ time: data[flagpoleStart].time, position: pattern.type === "bull_flag" ? "belowBar" : "aboveBar", color: pattern.type === "bull_flag" ? "#2ea043" : "#f85149", shape: pattern.type === "bull_flag" ? "arrowUp" : "arrowDown", text: "① Flagpole Start", size: 1 });
        if (flagpoleEnd !== -1 && data[flagpoleEnd]) markers.push({ time: data[flagpoleEnd].time, position: pattern.type === "bull_flag" ? "aboveBar" : "belowBar", color: pattern.type === "bull_flag" ? "#2ea043" : "#f85149", shape: pattern.type === "bull_flag" ? "arrowDown" : "arrowUp", text: "② Flagpole End", size: 1 });
        if (breakout !== -1 && data[breakout]) {
            markers.push({ time: data[breakout].time, position: pattern.type === "bull_flag" ? "belowBar" : "aboveBar", color: "#2ea043", shape: pattern.type === "bull_flag" ? "arrowUp" : "arrowDown", text: "③ Breakout", size: 1 });
            markers.push({ time: data[data.length - 1].time, position: pattern.type === "bull_flag" ? "aboveBar" : "belowBar", color: "#39d353", shape: pattern.type === "bull_flag" ? "arrowUp" : "arrowDown", text: `④ Target $${target.toFixed(2)}`, size: 1 });
        }
    }
    else if (patternType === 'N_PATTERN') {
        const { pointA, pointB, pointC, breakout } = pattern.indices;
        const { target = 0 } = pattern.metrics || {};
        const { nLine = [] } = pattern.drawings || {};

        if (nLine.length > 0) {
            const nLineSeries = chart.addSeries(LineSeries,{
                color: pattern.type === "bullish_n" ? "#2ea043" : "#f85149", lineWidth: 3, lineStyle: LineStyle.Solid,
                lastValueVisible: false, priceLineVisible: false,
            });
            nLineSeries.setData(nLine.map(normalizePoint));
            newSeries.push(nLineSeries);
        }

        const safeBreakout = breakout === -1 ? pointC : breakout;
        if (safeBreakout !== -1 && data[safeBreakout] && data[data.length - 1]) {
            const targetSeries = chart.addSeries(LineSeries,{
                color: "#2ea04388", lineWidth: 1, lineStyle: LineStyle.Dashed,
                lastValueVisible: false, priceLineVisible: false,
            });
            targetSeries.setData([
                { time: data[safeBreakout].time, value: target },
                { time: data[data.length - 1].time, value: target },
            ]);
            newSeries.push(targetSeries);
        }


        if (pointA !== -1 && data[pointA]) markers.push({ time: data[pointA].time, position: pattern.type === "bullish_n" ? "belowBar" : "aboveBar", color: pattern.type === "bullish_n" ? "#2ea043" : "#f85149", shape: pattern.type === "bullish_n" ? "arrowUp" : "arrowDown", text: "A", size: 1 });
        if (pointB !== -1 && data[pointB]) markers.push({ time: data[pointB].time, position: pattern.type === "bullish_n" ? "aboveBar" : "belowBar", color: pattern.type === "bullish_n" ? "#2ea043" : "#f85149", shape: pattern.type === "bullish_n" ? "arrowDown" : "arrowUp", text: "B", size: 1 });
        if (pointC !== -1 && data[pointC]) markers.push({ time: data[pointC].time, position: pattern.type === "bullish_n" ? "belowBar" : "aboveBar", color: "#c084fc", shape: pattern.type === "bullish_n" ? "arrowUp" : "arrowDown", text: "C", size: 1 });
        if (breakout !== -1 && data[breakout]) {
            markers.push({ time: data[breakout].time, position: pattern.type === "bullish_n" ? "belowBar" : "aboveBar", color: "#39d353", shape: pattern.type === "bullish_n" ? "arrowUp" : "arrowDown", text: `Target $${target.toFixed(2)}`, size: 1 });
        }
    }

    return { newSeries, markers };
}

// --- Legend Rendering ---
const LegendItem = ({ color, label, dashed }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{
            width: "12px", height: "4px", backgroundColor: color,
            borderBottom: dashed ? `2px dashed ${color}` : "none",
        }} />
        <span style={{ fontSize: "11px", color: "var(--text-main, #d1d5db)" }}>{label}</span>
    </div>
);

const getPatternLegend = (patternType) => {
    return (
        <div style={{
            position: "absolute", top: "10px", right: "95px", zIndex: 10,
            display: "flex", flexDirection: "column", gap: "4px",
            background: "var(--bg-card, rgba(99, 99, 99, 0.26))",
            padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color, #30363d)"
        }}>
            {patternType === "CUP_HANDLE" ? (
                <>
                    <LegendItem color="#e6edf3" label="① Prior Uptrend" />
                    <LegendItem color="#f0c040" label="② Cup Rim / Resistance" dashed />
                    <LegendItem color="#f0c040" label="③ Cup Arc" />
                    <LegendItem color="#c084fc" label="④ Handle Channel" />
                    <LegendItem color="#2ea043" label="⑤ Breakout" />
                    <LegendItem color="#39d353" label="⑥ Measured Target" dashed />
                </>
            ) : patternType === "DOUBLE_BOTTOM" ? (
                <>
                    <LegendItem color="#e6edf3" label="① Prior Downtrend" />
                    <LegendItem color="#e6edf3" label="② Neckline / Resistance" dashed />
                    <LegendItem color="#f0c040" label="③ Bottom Arcs" />
                    <LegendItem color="#2ea043" label="④ Breakout" />
                    <LegendItem color="#39d353" label="⑤ Measured Target" dashed />
                </>
            ) : patternType === "FLAG" ? (
                <>
                    <LegendItem color="#ffffff" label="① Flagpole" />
                    <LegendItem color="#c084fc" label="② Flag Channel" dashed />
                    <LegendItem color="#2ea043" label="③ Breakout" />
                    <LegendItem color="#39d353" label="④ Measured Target" dashed />
                </>
            ) : patternType === "N_PATTERN" ? (
                <>
                    <LegendItem color="#2ea043" label="A. First High/Low" />
                    <LegendItem color="#f85149" label="B. Retracement" />
                    <LegendItem color="#c084fc" label="C. Breakout Node" />
                    <LegendItem color="#39d353" label="Measured Target" dashed />
                </>
            ) : null}
        </div>
    );
};

// --- The HOC Middleware ---
export function withPatternOverlay(WrappedComponent) {
    return function PatternMiddleware(props) {
        // We get timeframe and symbol from props, which Candlestick receives or resolves
        // Wait, Candlestick manages selectedCurrency internally from URL. We need it from Candlestick.
        // HOC might not have symbol/timeframe if Candlestick manages it.
        // To fix this, Candlestick should pass symbol/timeframe to `patternState` or we pass `usePatterns` inside Candlestick.
        // But HOC is a wrapper. We can pass a prop `patternProps` that CandleStick populates.

        // Actually, we can inject a function that Candlestick calls to trigger the fetch
        const patternStateRef = useRef(null);

        // We will pass down a factory/hook-like object or just render the Wrapped component and let it use the HOC's exposed API via props.
        const [activePatternType, setActivePatternType] = useState('');
        
        return (
            <WrappedComponent 
                {...props} 
                patternMiddleware={{
                    drawPattern,
                    getPatternLegend,
                    safeSetMarkers,
                    activePatternType,
                    setActivePatternType
                }}
            />
        );
    };
}
