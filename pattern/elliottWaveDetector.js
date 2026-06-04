/**
 * 12-Module Institutional Elliott Wave Engine
 * Features: Subwave Recursion, MTF Synthesis, Wave Personality, Regime Filters, True Alternation, normalized scoring.
 */

function calculateEMA(data, period, key = 'close') {
    const emaArray = new Array(data.length).fill(null);
    if (data.length < period) return emaArray;
    let startIdx = 0;
    while(startIdx < data.length && data[startIdx] === null) startIdx++;
    if (data.length - startIdx < period) return emaArray;
    let sum = 0;
    for (let i = startIdx; i < startIdx + period; i++) sum += data[i][key];
    emaArray[startIdx + period - 1] = sum / period;
    const multiplier = 2 / (period + 1);
    for (let i = startIdx + period; i < data.length; i++) {
        if(data[i] !== null) emaArray[i] = (data[i][key] - emaArray[i - 1]) * multiplier + emaArray[i - 1];
    }
    return emaArray;
}

function calculateMACD(data) {
    const ema12 = calculateEMA(data, 12), ema26 = calculateEMA(data, 26);
    const macdLine = new Array(data.length).fill(null);
    for (let i = 0; i < data.length; i++) {
        if (ema12[i] !== null && ema26[i] !== null) macdLine[i] = { close: ema12[i] - ema26[i] };
    }
    const signalLineRaw = calculateEMA(macdLine, 9, 'close');
    const macdData = new Array(data.length).fill(null);
    for (let i = 0; i < data.length; i++) {
        if (macdLine[i] && signalLineRaw[i] !== null) {
            macdData[i] = { macd: macdLine[i].close, signal: signalLineRaw[i], histogram: macdLine[i].close - signalLineRaw[i] };
        }
    }
    return macdData;
}

function calculateATR(data, period = 14) {
    const atrArray = new Array(data.length).fill(null);
    const trArray = new Array(data.length).fill(0);
    if (data.length < period) return atrArray;
    for (let i = 1; i < data.length; i++) {
        const high = data[i].high, low = data[i].low, prevClose = data[i-1].close;
        trArray[i] = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    }
    let sum = 0;
    for (let i = 1; i <= period; i++) sum += trArray[i];
    atrArray[period] = sum / period;
    for (let i = period + 1; i < data.length; i++) atrArray[i] = (atrArray[i-1] * (period - 1) + trArray[i]) / period; 
    return atrArray;
}

function calculateADX(data, period = 14) {
    const adxArray = new Array(data.length).fill(null);
    if (data.length < period + 1) return adxArray;
    const tr = new Array(data.length).fill(0), plusDM = new Array(data.length).fill(0), minusDM = new Array(data.length).fill(0);
    for (let i = 1; i < data.length; i++) {
        const high = data[i].high, low = data[i].low, prevClose = data[i-1].close, prevHigh = data[i-1].high, prevLow = data[i-1].low;
        tr[i] = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        const upMove = high - prevHigh, downMove = prevLow - low;
        if (upMove > downMove && upMove > 0) plusDM[i] = upMove;
        if (downMove > upMove && downMove > 0) minusDM[i] = downMove;
    }
    let smoothedTR = 0, smoothedPlusDM = 0, smoothedMinusDM = 0;
    for (let i = 1; i <= period; i++) { smoothedTR += tr[i]; smoothedPlusDM += plusDM[i]; smoothedMinusDM += minusDM[i]; }
    const dx = new Array(data.length).fill(null), plusDI = new Array(data.length).fill(null), minusDI = new Array(data.length).fill(null);
    for (let i = period; i < data.length; i++) {
        if (i > period) {
            smoothedTR = smoothedTR - (smoothedTR / period) + tr[i];
            smoothedPlusDM = smoothedPlusDM - (smoothedPlusDM / period) + plusDM[i];
            smoothedMinusDM = smoothedMinusDM - (smoothedMinusDM / period) + minusDM[i];
        }
        const pDI = (smoothedPlusDM / smoothedTR) * 100 || 0, mDI = (smoothedMinusDM / smoothedTR) * 100 || 0;
        plusDI[i] = pDI; minusDI[i] = mDI;
        dx[i] = Math.abs(pDI - mDI) / (pDI + mDI) * 100 || 0;
    }
    let adxSum = 0;
    for(let i = period; i < period * 2; i++) adxSum += dx[i];
    let currentADX = adxSum / period;
    adxArray[period * 2 - 1] = { adx: currentADX, plusDI: plusDI[period * 2 - 1], minusDI: minusDI[period * 2 - 1] };
    for(let i = period * 2; i < data.length; i++) {
        currentADX = ((currentADX * (period - 1)) + dx[i]) / period;
        adxArray[i] = { adx: currentADX, plusDI: plusDI[i], minusDI: minusDI[i] };
    }
    return adxArray;
}

function calculateRSI(data, period = 14) {
    const rsiArray = new Array(data.length).fill(null);
    if (data.length <= period) return rsiArray;
    let avgGain = 0, avgLoss = 0;
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i-1].close;
        if (change > 0) avgGain += change;
        else avgLoss += Math.abs(change);
    }
    avgGain /= period; avgLoss /= period;
    rsiArray[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i-1].close;
        const gain = change > 0 ? change : 0, loss = change < 0 ? Math.abs(change) : 0;
        avgGain = ((avgGain * (period - 1)) + gain) / period;
        avgLoss = ((avgLoss * (period - 1)) + loss) / period;
        rsiArray[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
    }
    return rsiArray;
}

function calculateBollingerBands(data, period = 20, multiplier = 2) {
    const sma = calculateEMA(data, period); // Using EMA proxy for BB midline
    const bbArray = new Array(data.length).fill(null);
    for (let i = period; i < data.length; i++) {
        let variance = 0;
        for (let j = 0; j < period; j++) {
            variance += Math.pow(data[i - j].close - sma[i], 2);
        }
        const stdev = Math.sqrt(variance / period);
        bbArray[i] = { upper: sma[i] + (multiplier * stdev), lower: sma[i] - (multiplier * stdev), width: (multiplier * 2 * stdev) / sma[i] };
    }
    return bbArray;
}

function getPivotConfidence(candles, atrArray, idx, isHigh) {
    const atr = atrArray[idx] || 1;
    const swingExt = isHigh ? candles[idx].high - Math.max(candles[idx].open, candles[idx].close) : Math.min(candles[idx].open, candles[idx].close) - candles[idx].low;
    const atrDist = swingExt / atr;
    const strength = Math.max(0, Math.min(1.0, atrDist * 0.5));
    const volumeSupport = Math.max(0, Math.min(1.0, (candles[idx].volume || 1) / 5000)); 
    return { strength, atrDistance: atrDist, volumeSupport };
}

function findAdaptivePivots(candles, atrArray, multiplier = 1.5, startIdx = 0, endIdx = null) {
    const end = endIdx === null ? candles.length : endIdx + 1;
    const highs = [], lows = [];
    if (end - startIdx < 2) return [];

    let lastHigh = { index: startIdx, price: candles[startIdx].high, time: candles[startIdx].time };
    let lastLow = { index: startIdx, price: candles[startIdx].low, time: candles[startIdx].time };
    let trend = 0; 
    for (let i = startIdx + 1; i < end; i++) {
        const threshold = multiplier * (atrArray[i] || 1);
        if (trend >= 0) {
            if (candles[i].high > lastHigh.price) lastHigh = { index: i, price: candles[i].high, time: candles[i].time };
            else if (candles[i].close < lastHigh.price - threshold) {
                highs.push({ ...lastHigh, type: 'high', confidence: getPivotConfidence(candles, atrArray, lastHigh.index, true) });
                trend = -1;
                lastLow = { index: i, price: candles[i].low, time: candles[i].time };
            }
        }
        if (trend <= 0) {
            if (candles[i].low < lastLow.price) lastLow = { index: i, price: candles[i].low, time: candles[i].time };
            else if (candles[i].close > lastLow.price + threshold) {
                lows.push({ ...lastLow, type: 'low', confidence: getPivotConfidence(candles, atrArray, lastLow.index, false) });
                trend = 1;
                lastHigh = { index: i, price: candles[i].high, time: candles[i].time };
            }
        }
    }
    if (trend === 1) highs.push({ ...lastHigh, type: 'high', confidence: getPivotConfidence(candles, atrArray, lastHigh.index, true) });
    if (trend === -1) lows.push({ ...lastLow, type: 'low', confidence: getPivotConfidence(candles, atrArray, lastLow.index, false) });
    return [...highs, ...lows].sort((a, b) => a.index - b.index);
}

function validateDynamicSequence(pivots, isBullish) {
    if (pivots.length < 5) return 0.0;
    let validCount = 0;
    if (isBullish) {
        let currentLow = pivots[0].price, currentHigh = pivots[1].price;
        for (let i = 2; i < pivots.length; i++) {
            if (i % 2 === 0) {
                if (pivots[i].price <= currentLow) break;
                currentLow = pivots[i].price; validCount++;
            } else {
                if (pivots[i].price <= currentHigh) break;
                currentHigh = pivots[i].price; validCount++;
            }
        }
    } else {
        let currentHigh = pivots[0].price, currentLow = pivots[1].price;
        for (let i = 2; i < pivots.length; i++) {
            if (i % 2 === 0) {
                if (pivots[i].price >= currentHigh) break;
                currentHigh = pivots[i].price; validCount++;
            } else {
                if (pivots[i].price >= currentLow) break;
                currentLow = pivots[i].price; validCount++;
            }
        }
    }
    return Math.min(1.0, validCount / 4);
}

function synthesizeHTF(candles, factor) {
    const htf = [];
    for (let i = 0; i < candles.length; i += factor) {
        const slice = candles.slice(i, i + factor);
        if (slice.length === 0) break;
        htf.push({
            open: slice[0].open, close: slice[slice.length - 1].close,
            high: Math.max(...slice.map(c => c.high)), low: Math.min(...slice.map(c => c.low)),
            volume: slice.reduce((sum, c) => sum + (c.volume || 0), 0), time: slice[slice.length - 1].time
        });
    }
    return htf;
}

function getVolume(candles, startIdx, endIdx) {
    let vol = 0;
    for (let i = startIdx; i <= endIdx; i++) vol += candles[i].volume || 0;
    return vol / (Math.max(1, endIdx - startIdx + 1));
}
function getExtremes(candles, startIdx, endIdx) {
    let highest = -Infinity, lowest = Infinity;
    for (let i=startIdx; i<=endIdx; i++) {
        if (candles[i].high > highest) highest = candles[i].high;
        if (candles[i].low < lowest) lowest = candles[i].low;
    }
    return { highest, lowest };
}

function mathFibScore(distance) { return Math.max(0, 1 - (distance / 0.236)); }
function getClosestFibDistance(value, allowedRatios) {
    let minDiff = Math.abs(value - allowedRatios[0]);
    for (const ratio of allowedRatios) minDiff = Math.min(minDiff, Math.abs(value - ratio));
    return minDiff;
}

function analyzeElliottWave(candles, pts, atrArray, rsiArray, macdArray, ema50, ema200, adxArray, bbArray, htfEma50, isBullish, allPivots) {
    const [S, W1, W2, W3, W4, W5, WA, WB, WC] = pts;
    const rejectionReasons = [];
    const len1 = Math.abs(W1.price - S.price), len3 = Math.abs(W3.price - W2.price), len5 = Math.abs(W5.price - W4.price);
    const w1Ext = getExtremes(candles, S.index, W1.index), w4Ext = getExtremes(candles, W3.index, W4.index);
    const wave4TerritoryViolation = isBullish ? w4Ext.lowest <= w1Ext.highest : w4Ext.highest >= w1Ext.lowest;
    const wave2BreaksOrigin = isBullish ? W2.price < S.price : W2.price > S.price;

    if (wave2BreaksOrigin) rejectionReasons.push("Wave 2 breaks origin");
    if (len3 < len1 && len3 < len5) rejectionReasons.push("Wave 3 shortest");
    if (wave4TerritoryViolation) rejectionReasons.push("Wave 4 overlaps Wave 1 territory");

    // Fibonacci Guidelines (Not Rejection, but strongly affect score)
    const rW2 = isBullish ? (W1.price - W2.price) / len1 : (W2.price - W1.price) / len1;
    const rW4 = isBullish ? (W3.price - W4.price) / len3 : (W4.price - W3.price) / len3;
    const extW3 = len3 / len1;
    const extW5 = len5 / len1;

    // 1. TRUE ELLIOTT SUBWAVE VALIDATION
    const p1 = allPivots.filter(p => p.index >= S.index && p.index <= W1.index);
    const p3 = allPivots.filter(p => p.index >= W2.index && p.index <= W3.index);
    const p5 = allPivots.filter(p => p.index >= W4.index && p.index <= W5.index);
    const subwaveScoreRaw = (validateDynamicSequence(p1, isBullish) + validateDynamicSequence(p3, isBullish) + validateDynamicSequence(p5, isBullish)) / 3;

    // 2. MULTI-TIMEFRAME CONFIRMATION
    const currentDur = W5.index - S.index;
    const htfIndex = Math.floor(S.index / 5);
    const htfTrendScore = (htfEma50[htfIndex] && htfEma50[htfIndex] < S.price) ? 1.0 : 0.4;
    const nestingScoreRaw = Math.max(0, 1 - Math.abs((currentDur / 250) - 1)); // Peak score at 250 bars

    // 3. TRUE ALTERNATION PRINCIPLE
    const w2Deep = rW2 >= 0.5, w4Deep = rW4 >= 0.382;
    const w2Dur = W2.index - W1.index, w4Dur = W4.index - W3.index;
    const timeAlt = Math.max(w2Dur, w4Dur) / Math.min(w2Dur, w4Dur) > 1.5;
    const alternationScoreRaw = (w2Deep !== w4Deep ? 0.6 : 0.2) + (timeAlt ? 0.4 : 0.1);

    // 4. PROFESSIONAL CHANNELING ENGINE
    const slope13 = (W3.price - W1.price) / (W3.index - W1.index);
    const slope24 = (W4.price - W2.price) / (W4.index - W2.index);
    const projW4_prim = W2.price + (slope13 * (W4.index - W2.index));
    const projW3_sec = W1.price + (slope24 * (W3.index - W1.index));
    const w4Resp = isBullish ? W4.price >= projW4_prim : W4.price <= projW4_prim;
    const w3Resp = isBullish ? W3.price <= projW3_sec : W3.price >= projW3_sec;
    const channelScoreRaw = (w4Resp ? 0.5 : 0.1) + (w3Resp ? 0.5 : 0.1);

    // 5. WAVE PERSONALITY ENGINE
    const v1 = getVolume(candles, S.index, W1.index), v3 = getVolume(candles, W2.index, W3.index), v5 = getVolume(candles, W4.index, W5.index);
    const a1 = atrArray[W1.index], a3 = atrArray[W3.index], a5 = atrArray[W5.index];
    const personalityScoreRaw = ((v3 > v1 && v3 > v5 ? 1.0 : 0.4) + (a3 > a1 && a3 > a5 ? 1.0 : 0.4)) / 2;

    // 6. ADVANCED FIBONACCI RELATIONSHIP ENGINE
    const eW3 = len1 ? len3 / len1 : 1;
    const eW5 = len1 ? len5 / len1 : 1;
    const f2 = mathFibScore(getClosestFibDistance(rW2, [0.382, 0.5, 0.618, 0.786]));
    const f3 = mathFibScore(getClosestFibDistance(eW3, [1.618, 2.618, 4.236]));
    const f4 = mathFibScore(getClosestFibDistance(rW4, [0.236, 0.382, 0.5]));
    const f5 = mathFibScore(getClosestFibDistance(eW5, [0.618, 1.0, 1.618]));
    const advFibScoreRaw = (f2 + f3 + f4 + f5) / 4;

    // 7. REAL CORRECTIVE STRUCTURE RECOGNITION
    const rWB = Math.abs(WB.price - WA.price) / (Math.abs(WA.price - W5.price) || 1);
    const eWC = Math.abs(WC.price - WB.price) / (Math.abs(WA.price - W5.price) || 1);
    const sExpFlat = (mathFibScore(getClosestFibDistance(rWB, [1.236, 1.382])) + mathFibScore(getClosestFibDistance(eWC, [1.618]))) / 2;
    const sRunFlat = (mathFibScore(getClosestFibDistance(rWB, [1.236])) + mathFibScore(getClosestFibDistance(eWC, [0.618, 1.0]))) / 2;
    const sWXY = 1 - Math.min(1.0, Math.abs(w2Dur - w4Dur) / (Math.max(w2Dur, w4Dur) || 1));
    const corrScoreRaw = Math.max(sExpFlat, sRunFlat, sWXY);

    // 8. FRACTAL NESTING HIERARCHY (Validated via degree bounds)
    const currentDegree = classifyDegree(currentDur);

    // 9. VOLUME PROFILE VALIDATION
    const volScoreRaw = (v3 > v1 ? 0.6 : 0.2) + (v5 < v3 ? 0.4 : 0.1);

    // 10. MARKET REGIME FILTER
    const bb = bbArray[S.index];
    const e50 = ema50[S.index], e200 = ema200[S.index];
    let regimeScoreRaw = 1.0;
    if (bb && bb.width < 0.02) regimeScoreRaw = 0.3; // Compression penalty
    if (e50 !== null && e200 !== null && (isBullish ? e50 < e200 : e50 > e200)) regimeScoreRaw = 0.2; // Counter trend

    // 11. MOMENTUM & DIVERGENCE (MACD & RSI)
    const m1 = macdArray[W1.index], m3 = macdArray[W3.index], m5 = macdArray[W5.index];
    let strictMacdDiv = false;
    if (m3 && m5) {
        if (isBullish) strictMacdDiv = (W5.price > W3.price) && (m5.macd < m3.macd) && (m5.histogram < m3.histogram);
        else strictMacdDiv = (W5.price < W3.price) && (m5.macd > m3.macd) && (m5.histogram > m3.histogram);
    }
    const momScoreRaw = strictMacdDiv ? 1.0 : (m3 && m1 && Math.abs(m3.macd) > Math.abs(m1.macd) ? 0.7 : 0.3);

    // 12. DYNAMIC PATTERN COMPETITION
    const scImpulse = wave4TerritoryViolation ? 0 : advFibScoreRaw;
    const scLD = wave4TerritoryViolation ? (mathFibScore(getClosestFibDistance(rW2, [0.618, 0.786])) + mathFibScore(getClosestFibDistance(rW4, [0.618, 0.786]))) / 2 : 0;
    let patternClass = "impulse", highestStructureScore = scImpulse;
    if (scLD > highestStructureScore) { highestStructureScore = scLD; patternClass = "leading_diagonal"; }
    
    // NORMALIZATION & WEIGHTING (0 -> 100)
    // Structure: 15, Fractal: 20, Personality: 10, Fib: 10, Channel: 10, Momentum: 10, Trend/Regime: 5, Vol: 5, Corr: 5, Alt: 5, MTF: 5
    const wStruct = highestStructureScore * 15;
    const wFrac = subwaveScoreRaw * 20;
    const wPers = personalityScoreRaw * 10;
    const wFib = advFibScoreRaw * 10;
    const wChan = channelScoreRaw * 10;
    const wMom = momScoreRaw * 10;
    const wRegime = regimeScoreRaw * 5;
    const wVol = volScoreRaw * 5;
    const wCorr = corrScoreRaw * 5;
    const wAlt = alternationScoreRaw * 5;
    const wMtf = (htfTrendScore * 0.5 + nestingScoreRaw * 0.5) * 5;

    let totalProbability = wStruct + wFrac + wPers + wFib + wChan + wMom + wRegime + wVol + wCorr + wAlt + wMtf;
    if (rejectionReasons.length > 0) totalProbability = Math.min(totalProbability, 45); 
    
    let quality = "Reject";
    if (totalProbability >= 95) quality = "Institutional";
    else if (totalProbability >= 90) quality = "Excellent";
    else if (totalProbability >= 85) quality = "Strong";
    else if (totalProbability >= 75) quality = "Tradable";
    else if (totalProbability >= 65) quality = "Weak";

    return {
        type: `elliott_wave_${isBullish ? 'bullish' : 'bearish'}_${patternClass}`,
        isValid: rejectionReasons.length === 0 && totalProbability >= 65,
        quality,
        score: parseFloat(totalProbability.toFixed(2)),
        rejectionReasons,
        waveQualityMetrics: {
            structureScore: parseFloat(wStruct.toFixed(2)), subwaveScore: parseFloat(wFrac.toFixed(2)), 
            personalityScore: parseFloat(wPers.toFixed(2)), advancedFibScore: parseFloat(wFib.toFixed(2)), 
            channelScore: parseFloat(wChan.toFixed(2)), momentumScore: parseFloat(wMom.toFixed(2)), 
            regimeScore: parseFloat(wRegime.toFixed(2)), volumeProfileScore: parseFloat(wVol.toFixed(2)), 
            correctiveStructureScore: parseFloat(wCorr.toFixed(2)), alternationScore: parseFloat(wAlt.toFixed(2)),
            multiTimeframeScore: parseFloat(wMtf.toFixed(2)), totalProbability: parseFloat(totalProbability.toFixed(2))
        },
        strictMacdDiv,
        points: { START: S, WAVE_1: W1, WAVE_2: W2, WAVE_3: W3, WAVE_4: W4, WAVE_5: W5, WAVE_A: WA, WAVE_B: WB, WAVE_C: WC },
        drawings: {
            impulseLine: [ {time: S.time, value: S.price}, {time: W1.time, value: W1.price}, {time: W2.time, value: W2.price}, {time: W3.time, value: W3.price}, {time: W4.time, value: W4.price}, {time: W5.time, value: W5.price} ],
            correctiveLine: WC ? [ {time: W5.time, value: W5.price}, {time: WA.time, value: WA.price}, {time: WB.time, value: WB.price}, {time: WC.time, value: WC.price} ] : []
        },
        metrics: {
            target: isBullish ? W5.price + (Math.abs(W5.price - W4.price) * 1.618) : W5.price - (Math.abs(W5.price - W4.price) * 1.618)
        }
    };
}

// SIMILARITY DEDUPLICATION (IoU)
function deduplicatePatterns(patterns) {
    const unique = [];
    for (let i = 0; i < patterns.length; i++) {
        let isDuplicate = false;
        const p1 = Object.values(patterns[i].points).map(p => p.index);
        
        for (let j = 0; j < unique.length; j++) {
            const p2 = Object.values(unique[j].points).map(p => p.index);
            let shared = 0;
            for(let k=0; k<p1.length; k++) if (p2.includes(p1[k])) shared++;
            if (shared / p1.length > 0.80) { 
                isDuplicate = true;
                if (patterns[i].score > unique[j].score) unique[j] = patterns[i]; 
                break;
            }
        }
        if (!isDuplicate) unique.push(patterns[i]);
    }
    return unique;
}

function classifyDegree(candleCount) {
    if (candleCount <= 50) return "minuette";
    if (candleCount <= 100) return "minute";
    if (candleCount <= 250) return "minor";
    if (candleCount <= 500) return "intermediate";
    if (candleCount <= 1000) return "primary";
    return "cycle";
}

function scanForElliottWave(candles, isBullish = true) {
    if (candles.length < 50) return [];
    
    // O(N) Cached indicators
    const atrArray = calculateATR(candles, 14);
    const rsiArray = calculateRSI(candles, 14);
    const macdArray = calculateMACD(candles);
    const ema50 = calculateEMA(candles, 50);
    const ema200 = calculateEMA(candles, 200);
    const adxArray = calculateADX(candles, 14);
    const bbArray = calculateBollingerBands(candles, 20, 2);
    
    // Multi-Timeframe Synthesis
    const htfCandles = synthesizeHTF(candles, 5);
    const htfEma50 = calculateEMA(htfCandles, 50);

    const allPivots = findAdaptivePivots(candles, atrArray, 1.5);
    const rawResults = [];

    for (let i = 0; i <= allPivots.length - 9; i++) {
        const pts = allPivots.slice(i, i + 9);
        const structMatches = isBullish ? 
            pts[0].type === 'low' && pts[1].type === 'high' && pts[3].type === 'high' && pts[5].type === 'high' && pts[6].type === 'low' && pts[8].type === 'low' :
            pts[0].type === 'high' && pts[1].type === 'low' && pts[3].type === 'low' && pts[5].type === 'low' && pts[6].type === 'high' && pts[8].type === 'high';

        if (structMatches) {
            const result = analyzeElliottWave(candles, pts, atrArray, rsiArray, macdArray, ema50, ema200, adxArray, bbArray, htfEma50, isBullish, allPivots);
            if (result.isValid || result.rejectionReasons.length > 0) rawResults.push(result);
        }
    }
    
    const validResults = rawResults.filter(r => r.isValid);
    return deduplicatePatterns(validResults);
}

module.exports = { scanForElliottWave };

if (require.main === module) {
    const mockCandles = [];
    let price = 1000;
    let baseTime = 1600000000;
    for (let i = 0; i < 900; i++) mockCandles.push({ open: price, close: price, high: price + 5, low: price - 5, volume: 1000, time: baseTime + (i * 3600) });

    const injectTrend = (startIdx, endIdx, startPrice, endPrice, volMultiplier, isMotive) => {
        const steps = endIdx - startIdx;
        const priceStep = (endPrice - startPrice) / steps;
        for (let i = 0; i <= steps; i++) {
            const p = startPrice + (priceStep * i);
            const noise = isMotive ? (i % 2 === 0 ? 25 : -25) : (i % 2 === 0 ? 10 : -10); 
            mockCandles.push({ open: p, close: p + noise, high: p + 30 + Math.abs(noise), low: p - 30 - Math.abs(noise), volume: 5000 * volMultiplier, time: baseTime + ((900 + startIdx + i) * 3600) });
        }
    };
    injectTrend(0, 30, 1000, 1200, 1.0, true);   
    injectTrend(31, 50, 1200, 1080, 0.5, false); 
    injectTrend(51, 100, 1080, 1600, 3.0, true); 
    injectTrend(101, 130, 1600, 1400, 0.5, false); 
    injectTrend(131, 160, 1400, 1650, 0.8, true);  
    injectTrend(161, 180, 1650, 1500, 1.0, false); 
    injectTrend(181, 200, 1500, 1580, 0.5, false); 
    injectTrend(201, 230, 1580, 1450, 1.0, false); 

    console.log(`=== RUNNING FINAL 12-MODULE INSTITUTIONAL ENGINE ===`);
    const results = scanForElliottWave(mockCandles, true);
    if (results.length > 0) console.log(JSON.stringify(results[0], null, 2));
}
