/**
 * Institutional-Grade N-Pattern Detector
 * Highly explainable, debuggable, stateful, and suitable for production trading systems.
 */

function calculateEMA(data, period, key = 'close') {
    const k = 2 / (period + 1);
    let emaArray = new Array(data.length).fill(null);
    if (data.length < period) return emaArray;

    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i][key];
    let ema = sum / period;
    emaArray[period - 1] = ema;
    
    for (let i = period; i < data.length; i++) {
        ema = (data[i][key] - ema) * k + ema;
        emaArray[i] = ema;
    }
    return emaArray;
}

function calculateATR(data, period) {
    const atrArray = new Array(data.length).fill(null);
    const trArray = new Array(data.length).fill(0);
    
    if (data.length < period) return atrArray;

    for (let i = 1; i < data.length; i++) {
        const high = data[i].high;
        const low = data[i].low;
        const prevClose = data[i-1].close;
        trArray[i] = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    }
    
    let sum = 0;
    for (let i = 1; i <= period; i++) sum += trArray[i];
    let atr = sum / period;
    atrArray[period] = atr;
    
    for (let i = period + 1; i < data.length; i++) {
        atr = (atr * (period - 1) + trArray[i]) / period; 
        atrArray[i] = atr;
    }
    return atrArray;
}

function calculateSMAVolume(data, period) {
    const smaArray = new Array(data.length).fill(null);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i].volume || 0;
        if (i >= period) sum -= data[i - period].volume || 0;
        if (i >= period - 1) smaArray[i] = sum / period;
    }
    return smaArray;
}

function findAdaptivePivots(candles, atrArray, multiplier = 1.5) {
    const highs = [];
    const lows = [];
    if (!candles.length) return { highs, lows };

    let lastHigh = { index: 0, price: candles[0].high, time: candles[0].time };
    let lastLow = { index: 0, price: candles[0].low, time: candles[0].time };
    let trend = 0; 
    
    for (let i = 1; i < candles.length; i++) {
        const atr = atrArray[i] || ((candles[i].high - candles[i].low) || 1);
        const threshold = multiplier * atr;

        if (trend >= 0) {
            if (candles[i].high > lastHigh.price) {
                lastHigh = { index: i, price: candles[i].high, time: candles[i].time };
            } else if (candles[i].close < lastHigh.price - threshold) {
                highs.push(lastHigh);
                trend = -1;
                lastLow = { index: i, price: candles[i].low, time: candles[i].time };
            }
        }
        if (trend <= 0) {
            if (candles[i].low < lastLow.price) {
                lastLow = { index: i, price: candles[i].low, time: candles[i].time };
            } else if (candles[i].close > lastLow.price + threshold) {
                lows.push(lastLow);
                trend = 1;
                lastHigh = { index: i, price: candles[i].high, time: candles[i].time };
            }
        }
    }
    if (trend === 1) highs.push(lastHigh);
    if (trend === -1) lows.push(lastLow);
    return { highs, lows };
}

function countInternalPivots(candles, startIndex, endIndex) {
    if (endIndex - startIndex <= 2) return 0;
    let pivotCount = 0;
    for (let i = startIndex + 1; i <= endIndex - 1; i++) {
        const isHigh = candles[i].high > candles[i-1].high && candles[i].high > candles[i+1].high;
        const isLow = candles[i].low < candles[i-1].low && candles[i].low < candles[i+1].low;
        if (isHigh || isLow) pivotCount++;
    }
    return pivotCount;
}

function scoreCandidateA(candles, candidateA, C, volSmaArray, type) {
    const isBullish = type === 'bullish_n';
    const impulseRange = Math.abs(C.price - candidateA.price);
    const movePct = impulseRange / (candidateA.price || 1);
    const strengthScore = Math.min(movePct / 0.15, 1) * 40; 
    
    const innerPivots = countInternalPivots(candles, candidateA.index, C.index);
    const patternDuration = C.index - candidateA.index;
    const noiseRatio = innerPivots / (patternDuration || 1);
    const cleanlinessScore = Math.max(0, 1 - (noiseRatio / 0.20)) * 35; 
    
    let impulseVol = 0;
    for (let i = candidateA.index; i <= C.index; i++) impulseVol += candles[i].volume || 0;
    const avgImpulseVol = impulseVol / (patternDuration + 1);
    const baselineVol = volSmaArray[candidateA.index - 1] || 1;
    const volRatio = avgImpulseVol / baselineVol;
    const volumeScore = Math.min(volRatio / 1.5, 1) * 15; 
    
    let timeScore = 0;
    if (patternDuration >= 5 && patternDuration <= 60) timeScore = 10;
    else if (patternDuration > 60 && patternDuration <= 100) timeScore = 5;

    return { score: strengthScore + cleanlinessScore + volumeScore + timeScore, cleanlinessScore };
}

function analyzeStructure(candles, A, C, B, breakoutIdx, type, atrArray, emaArray, volSmaArray, htfTrend, candidateAnalysisData) {
    const isBullish = type === "bullish_n";
    const hasBreakout = breakoutIdx !== null;
    const currentIdx = hasBreakout ? breakoutIdx : candles.length - 1;
    const breakoutCandle = hasBreakout ? candles[breakoutIdx] : null;

    let score = 0;
    const qualityBreakdown = { impulse: 0, fibonacci: 0, breakout: 0, volume: 0, structure: 0, trend: 0, continuation: 0 };
    const checks = { impulseStrong: false, fibonacciValid: false, breakoutValid: false, volumeValid: false, volumeContraction: false, emaAligned: false, emaStrength: false, timeSymmetry: false, legSymmetry: false, continuationValid: false, followThroughValid: false, structureClean: false, minimumSpacing: false, multiTimeframeAligned: false, pullbackQuality: false };
    
    const metrics = { impulsePct: 0, dominance: 0, efficiency: 0, emaSlope: 0, volumeExpansion: 0, pullbackVolatility: 0, noiseRatio: 0, legRatio: 0, timeRatio: 0, atr: atrArray[currentIdx] || 0, breakoutVolumeRatio: 0 };

    const output = {
        type, status: "forming", isValid: false, quality: "reject", confidence: 0, score: 0,
        points: { A: { ...A }, C: { ...C }, B: { ...B }, Breakout: null },
        indices: { pointA: A.index, pointC: C.index, pointB: B.index, breakout: breakoutIdx !== null ? breakoutIdx : -1 },
        targets: { target1: null, target2: null },
        risk: { invalidation: B.price, stopLoss: null, riskDistance: 0, rewardToTarget1: 0, rewardToTarget2: 0 },
        fibonacci: {}, breakoutInfo: {}, metrics, retest: { detected: false, retestIndex: null, retestPrice: null, successful: false },
        qualityBreakdown, checks,
        drawings: {
            impulseLine: [{ time: A.time, value: A.price }, { time: C.time, value: C.price }],
            pullbackLine: [{ time: C.time, value: C.price }, { time: B.time, value: B.price }],
            nLine: [{ time: A.time, value: A.price }, { time: C.time, value: C.price }, { time: B.time, value: B.price }]
        },
        candidateAnalysis: candidateAnalysisData,
        detection: { patternLength: currentIdx - A.index, lookbackUsed: true, pivotStrength: 1.5, atrUsed: true, scanTimeMs: 0 }
    };

    if (hasBreakout) {
        output.points.Breakout = { index: breakoutIdx, time: breakoutCandle.time, price: breakoutCandle.close };
        output.indices.breakout = breakoutIdx;
        output.drawings.breakoutLine = [{ time: B.time, value: B.price }, { time: breakoutCandle.time, value: breakoutCandle.close }];
        output.drawings.nLine.push({ time: breakoutCandle.time, value: breakoutCandle.close });
        output.drawings.breakdownLine = [{ time: B.time, value: B.price }, { time: breakoutCandle.time, value: B.price }];
        output.status = "breakout";
    }

    // 1. Spacing
    if ((C.index - A.index) < 5 || (B.index - C.index) < 3) return { ...output, reason: "Minimum structural spacing not met." };
    checks.minimumSpacing = true;

    // 2. Risk & Targets
    const impulseRange = Math.abs(C.price - A.price);
    const breakoutRefPrice = hasBreakout ? breakoutCandle.close : C.price; // Target uses C if forming
    
    if (isBullish) {
        output.targets.target1 = breakoutRefPrice + impulseRange;
        output.targets.target2 = breakoutRefPrice + (impulseRange * 1.618);
        output.risk.stopLoss = B.price - (metrics.atr * 0.5); // Buffer below invalidation
        output.risk.riskDistance = breakoutRefPrice - output.risk.stopLoss;
        output.risk.rewardToTarget1 = output.targets.target1 - breakoutRefPrice;
        output.risk.rewardToTarget2 = output.targets.target2 - breakoutRefPrice;
    } else {
        output.targets.target1 = breakoutRefPrice - impulseRange;
        output.targets.target2 = breakoutRefPrice - (impulseRange * 1.618);
        output.risk.stopLoss = B.price + (metrics.atr * 0.5);
        output.risk.riskDistance = output.risk.stopLoss - breakoutRefPrice;
        output.risk.rewardToTarget1 = breakoutRefPrice - output.targets.target1;
        output.risk.rewardToTarget2 = breakoutRefPrice - output.targets.target2;
    }

    // 3. Pullback Quality
    let highestHigh = -Infinity, lowestLow = Infinity;
    for(let i = C.index; i <= B.index; i++) {
        if(candles[i].high > highestHigh) highestHigh = candles[i].high;
        if(candles[i].low < lowestLow) lowestLow = candles[i].low;
    }
    metrics.pullbackVolatility = (highestHigh - lowestLow) / (impulseRange || 1);
    if (metrics.pullbackVolatility > 0.60) return { ...output, reason: "Pullback volatility > 0.60" };
    checks.pullbackQuality = true;

    // 4. Cleanliness
    const innerPivotsAC = countInternalPivots(candles, A.index, C.index);
    const innerPivotsCB = countInternalPivots(candles, C.index, B.index);
    metrics.noiseRatio = (innerPivotsAC + innerPivotsCB) / (B.index - A.index);
    if (metrics.noiseRatio > 0.20) return { ...output, reason: "Structure too noisy" };
    checks.structureClean = true;
    
    let structureScore = (innerPivotsAC + innerPivotsCB) <= 2 ? 5 : ((innerPivotsAC + innerPivotsCB) <= 4 ? 3 : 1);
    score += structureScore; qualityBreakdown.structure += structureScore;

    // 5. Volume Contraction
    let impulseVolSum = 0; for(let i=A.index; i<=C.index; i++) impulseVolSum += candles[i].volume || 0;
    const impulseAvgVolume = impulseVolSum / (C.index - A.index + 1);
    let pullbackVolSum = 0; for(let i=C.index; i<=B.index; i++) pullbackVolSum += candles[i].volume || 0;
    const pullbackAvgVolume = pullbackVolSum / (B.index - C.index + 1);
    
    if (pullbackAvgVolume < impulseAvgVolume) {
        checks.volumeContraction = true; score += 10; qualityBreakdown.volume += 10;
    } else return { ...output, reason: "No volume contraction" };

    // 6. Impulse
    metrics.impulsePct = impulseRange / A.price;
    let pathDistance = 0, sumBullish = 0, sumBearish = 0;
    for (let i = A.index + 1; i <= C.index; i++) {
        const range = candles[i].high - candles[i].low;
        pathDistance += range;
        const str = Math.abs(candles[i].close - candles[i].open) + (range * 0.3);
        if (candles[i].close >= candles[i].open) sumBullish += str; else sumBearish += str;
    }
    metrics.dominance = isBullish ? (sumBullish / (sumBullish + sumBearish || 1)) : (sumBearish / (sumBullish + sumBearish || 1));
    metrics.efficiency = pathDistance > 0 ? (impulseRange / pathDistance) : 0;

    if (metrics.impulsePct >= 0.08 && metrics.dominance >= 0.60 && metrics.efficiency >= 0.50) {
        checks.impulseStrong = true; score += 15; qualityBreakdown.impulse += 15;
    } else return { ...output, reason: "Weak impulse metrics" };

    // 7. Time Symmetry
    metrics.timeRatio = (B.index - C.index) / (C.index - A.index);
    if (metrics.timeRatio > 0.75) return { ...output, reason: "Time symmetry > 0.75" };
    checks.timeSymmetry = true; score += 5; qualityBreakdown.structure += 5;

    // 8. Trend
    const cEma = emaArray[C.index], pEma = emaArray[C.index - 1] || cEma;
    if (cEma && ((isBullish && C.price > cEma && cEma > pEma) || (!isBullish && C.price < cEma && cEma < pEma))) {
        checks.emaAligned = true; score += 10; qualityBreakdown.trend += 10;
    } else return { ...output, reason: "EMA not aligned" };

    const refEma = emaArray[currentIdx], oldEma = emaArray[Math.max(0, currentIdx - 5)];
    if (refEma && oldEma) {
        metrics.emaSlope = (refEma - oldEma) / oldEma;
        const threshold = (metrics.atr / (breakoutCandle ? breakoutCandle.close : C.price)) * 0.5;
        if ((isBullish && metrics.emaSlope > threshold) || (!isBullish && metrics.emaSlope < -threshold)) {
            checks.emaStrength = true;
            let scr = Math.abs(metrics.emaSlope) >= threshold * 2 ? 5 : (Math.abs(metrics.emaSlope) >= threshold * 1.5 ? 4 : 3);
            score += scr; qualityBreakdown.trend += scr;
        }
    }

    // 9. MTF
    if (htfTrend !== 'none') {
        if ((isBullish && htfTrend === 'bullish') || (!isBullish && htfTrend === 'bearish')) checks.multiTimeframeAligned = true;
        else score -= 15;
    } else checks.multiTimeframeAligned = true;

    // 10. Fibonacci
    const fibLevels = [{ level: 0.236, score: 5 }, { level: 0.382, score: 15 }, { level: 0.500, score: 15 }, { level: 0.618, score: 15 }, { level: 0.780, score: 0 }];
    let minDistance = Infinity, nearestFib = null;
    for (const f of fibLevels) {
        const fp = isBullish ? (C.price - impulseRange * f.level) : (C.price + impulseRange * f.level);
        const dist = Math.abs(B.price - fp);
        if (dist < minDistance) { minDistance = dist; nearestFib = f; }
    }
    if (minDistance <= B.price * 0.005) {
        checks.fibonacciValid = true; score += nearestFib.score; qualityBreakdown.fibonacci += nearestFib.score;
        output.fibonacci = { nearestLevel: nearestFib.level, distance: minDistance, quality: nearestFib.level * 100 + "%" };
    } else return { ...output, reason: "Not near key Fib" };

    // Forming State check complete. If no breakout, return early.
    if (!hasBreakout) {
        // Did we fail (drop below B)?
        for (let i = B.index + 1; i < candles.length; i++) {
            if (isBullish && candles[i].close < B.price) output.status = "failed";
            if (!isBullish && candles[i].close > B.price) output.status = "failed";
        }
        output.isValid = output.status === "forming"; // Valid as a forming candidate
        output.score = Math.max(0, score); output.confidence = (output.score / 100).toFixed(2);
        return output;
    }

    // 11. Leg Symmetry (Only checked on breakout)
    metrics.legRatio = Math.abs(breakoutCandle.close - B.price) / (impulseRange || 1);
    if (metrics.legRatio < 0.5 || metrics.legRatio > 2.5) return { ...output, reason: "Leg symmetry out of bounds" };
    if (metrics.legRatio >= 0.8 && metrics.legRatio <= 1.8) { checks.legSymmetry = true; score += 5; qualityBreakdown.structure += 5; }

    // 12. Breakout Info
    const bodyTop = Math.max(breakoutCandle.open, breakoutCandle.close), bodyBottom = Math.min(breakoutCandle.open, breakoutCandle.close), bodySize = bodyTop - bodyBottom;
    let portionAbove = isBullish ? (bodyTop - C.price) : (C.price - bodyBottom);
    
    output.breakoutInfo = { breakoutLevel: C.price, breakoutPrice: breakoutCandle.close, breakoutBodyStrength: portionAbove / (bodySize || 1), breakoutVolumeRatio: 0, breakoutATRExpansion: bodySize / metrics.atr };
    
    const breakoutPasses = isBullish ? (breakoutCandle.close > C.price && breakoutCandle.high > C.price && breakoutCandle.close >= breakoutCandle.open && portionAbove >= 0.5 * bodySize) : 
                                       (breakoutCandle.close < C.price && breakoutCandle.low < C.price && breakoutCandle.close <= breakoutCandle.open && portionAbove >= 0.5 * bodySize);
    if (breakoutPasses) { checks.breakoutValid = true; score += 15; qualityBreakdown.breakout += 15; }
    else return { ...output, reason: "Weak breakout candle" };

    // 13. Volume Spike
    const avgVol = volSmaArray[breakoutIdx - 1] || 1;
    metrics.breakoutVolumeRatio = breakoutCandle.volume / avgVol;
    output.breakoutInfo.breakoutVolumeRatio = metrics.breakoutVolumeRatio;
    if (metrics.breakoutVolumeRatio >= 1.5) { checks.volumeValid = true; score += 10; qualityBreakdown.volume += 10; }
    else return { ...output, reason: "No volume spike on breakout" };

    // 14. Follow-Through & Retest
    let highestPostBreakout = breakoutCandle.high, lowestPostBreakout = breakoutCandle.low;
    const maxFollowIdx = Math.min(candles.length - 1, breakoutIdx + 3);
    
    if (maxFollowIdx > breakoutIdx) {
        for (let i = breakoutIdx + 1; i <= maxFollowIdx; i++) {
            if (isBullish && candles[i].high > breakoutCandle.high) checks.followThroughValid = true;
            if (!isBullish && candles[i].low < breakoutCandle.low) checks.followThroughValid = true;
            highestPostBreakout = Math.max(highestPostBreakout, candles[i].high);
            lowestPostBreakout = Math.min(lowestPostBreakout, candles[i].low);
        }
        if (!checks.followThroughValid) return { ...output, reason: "No follow-through continuation" };
        checks.continuationValid = true; score += 5; qualityBreakdown.continuation += 5;
        output.status = "confirmed";
    }

    // 15. Check Completed / Failed state over history
    for (let i = breakoutIdx + 1; i < candles.length; i++) {
        if (isBullish) {
            if (candles[i].low <= C.price + (metrics.atr * 0.1) && candles[i].close > C.price) {
                output.retest = { detected: true, retestIndex: i, retestPrice: candles[i].low, successful: true };
                score += 5; // Bonus
            }
            if (candles[i].high >= output.targets.target1) output.status = "completed";
            if (candles[i].low < output.risk.invalidation && output.status !== "completed") output.status = "failed";
        } else {
            if (candles[i].high >= C.price - (metrics.atr * 0.1) && candles[i].close < C.price) {
                output.retest = { detected: true, retestIndex: i, retestPrice: candles[i].high, successful: true };
                score += 5; 
            }
            if (candles[i].low <= output.targets.target1) output.status = "completed";
            if (candles[i].high > output.risk.invalidation && output.status !== "completed") output.status = "failed";
        }
    }

    output.score = Math.max(0, Math.min(100, score)); // Cap at 100
    output.confidence = (output.score / 100).toFixed(2);
    
    if (output.score >= 70) {
        output.isValid = true;
        if (output.score >= 95) output.quality = "perfect";
        else if (output.score >= 85) output.quality = "strong";
        else output.quality = "acceptable";
    }

    return output;
}

function scanForNPattern(candles, htfTrend = 'none') {
    const startTime = Date.now();
    if (candles.length < 30) return [];

    const emaArray = calculateEMA(candles, 20);
    const atrArray = calculateATR(candles, 14);
    const volSmaArray = calculateSMAVolume(candles, 20);
    const { highs, lows } = findAdaptivePivots(candles, atrArray, 1.5);
    
    const allPivots = [];
    highs.forEach(h => allPivots.push({ ...h, type: 'high' }));
    lows.forEach(l => allPivots.push({ ...l, type: 'low' }));
    allPivots.sort((a, b) => a.index - b.index);

    let candidates = [];

    for (let p = 0; p < allPivots.length; p++) {
        const C = allPivots[p];
        
        // BULLISH N
        if (C.type === 'high') {
            let bestA = null, bestAScoreInfo = { score: -1, cleanlinessScore: 0 };
            const candidateAnalysis = { candidatesEvaluated: 0, selectedCandidateScore: 0, rejectedCandidates: [] };

            for (let j = p - 1; j >= 0; j--) {
                const candidateA = allPivots[j];
                if (candidateA.type === 'low') {
                    if (C.index - candidateA.index > 150) break; 
                    if (candidateA.price >= C.price) continue;   

                    const scoreInfo = scoreCandidateA(candles, candidateA, C, volSmaArray, "bullish_n");
                    candidateAnalysis.candidatesEvaluated++;
                    
                    if (scoreInfo.score > bestAScoreInfo.score || (Math.abs(scoreInfo.score - bestAScoreInfo.score) < 5 && scoreInfo.cleanlinessScore > bestAScoreInfo.cleanlinessScore)) {
                        if (bestA) candidateAnalysis.rejectedCandidates.push({ index: bestA.index, reason: "Lower quality score" });
                        bestA = candidateA;
                        bestAScoreInfo = scoreInfo;
                        candidateAnalysis.selectedCandidateScore = scoreInfo.score;
                    } else {
                        candidateAnalysis.rejectedCandidates.push({ index: candidateA.index, reason: "Lower quality score" });
                    }
                    if (candidateAnalysis.candidatesEvaluated >= 5) break; 
                }
            }

            if (bestA) {
                // Find Point B (lowest low after C)
                let pointB = { price: Infinity, index: -1 };
                let foundBreakout = false;
                const maxSearchIdx = Math.min(C.index + 60, candles.length - 1);
                
                for (let i = C.index + 1; i <= maxSearchIdx; i++) {
                    if (candles[i].low < pointB.price) pointB = { price: candles[i].low, index: i, time: candles[i].time };
                    if (candles[i].close > C.price) {
                        if (pointB.index !== -1 && pointB.price > bestA.price) {
                            candidates.push(analyzeStructure(candles, bestA, C, pointB, i, "bullish_n", atrArray, emaArray, volSmaArray, htfTrend, candidateAnalysis));
                        }
                        foundBreakout = true; break; 
                    }
                }
                
                // If forming
                if (!foundBreakout && pointB.index !== -1 && pointB.price > bestA.price) {
                    candidates.push(analyzeStructure(candles, bestA, C, pointB, null, "bullish_n", atrArray, emaArray, volSmaArray, htfTrend, candidateAnalysis));
                }
            }
        }

        // BEARISH N
        if (C.type === 'low') {
            let bestA = null, bestAScoreInfo = { score: -1, cleanlinessScore: 0 };
            const candidateAnalysis = { candidatesEvaluated: 0, selectedCandidateScore: 0, rejectedCandidates: [] };

            for (let j = p - 1; j >= 0; j--) {
                const candidateA = allPivots[j];
                if (candidateA.type === 'high') {
                    if (C.index - candidateA.index > 150) break;
                    if (candidateA.price <= C.price) continue;

                    const scoreInfo = scoreCandidateA(candles, candidateA, C, volSmaArray, "bearish_n");
                    candidateAnalysis.candidatesEvaluated++;
                    
                    if (scoreInfo.score > bestAScoreInfo.score || (Math.abs(scoreInfo.score - bestAScoreInfo.score) < 5 && scoreInfo.cleanlinessScore > bestAScoreInfo.cleanlinessScore)) {
                        if (bestA) candidateAnalysis.rejectedCandidates.push({ index: bestA.index, reason: "Lower quality score" });
                        bestA = candidateA;
                        bestAScoreInfo = scoreInfo;
                        candidateAnalysis.selectedCandidateScore = scoreInfo.score;
                    } else {
                        candidateAnalysis.rejectedCandidates.push({ index: candidateA.index, reason: "Lower quality score" });
                    }
                    if (candidateAnalysis.candidatesEvaluated >= 5) break;
                }
            }

            if (bestA) {
                let pointB = { price: -Infinity, index: -1 };
                let foundBreakout = false;
                const maxSearchIdx = Math.min(C.index + 60, candles.length - 1);
                
                for (let i = C.index + 1; i <= maxSearchIdx; i++) {
                    if (candles[i].high > pointB.price) pointB = { price: candles[i].high, index: i, time: candles[i].time };
                    if (candles[i].close < C.price) {
                        if (pointB.index !== -1 && pointB.price < bestA.price) {
                            candidates.push(analyzeStructure(candles, bestA, C, pointB, i, "bearish_n", atrArray, emaArray, volSmaArray, htfTrend, candidateAnalysis));
                        }
                        foundBreakout = true; break;
                    }
                }
                
                if (!foundBreakout && pointB.index !== -1 && pointB.price < bestA.price) {
                    candidates.push(analyzeStructure(candles, bestA, C, pointB, null, "bearish_n", atrArray, emaArray, volSmaArray, htfTrend, candidateAnalysis));
                }
            }
        }
    }

    const validPatterns = candidates.filter(c => c.isValid);
    validPatterns.forEach(p => p.detection.scanTimeMs = Date.now() - startTime);

    // PATTERN RANKING ENGINE
    return validPatterns.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.metrics.noiseRatio !== b.metrics.noiseRatio) return a.metrics.noiseRatio - b.metrics.noiseRatio; // Lower noise is better
        if (b.qualityBreakdown.continuation !== a.qualityBreakdown.continuation) return b.qualityBreakdown.continuation - a.qualityBreakdown.continuation;
        return b.qualityBreakdown.volume - a.qualityBreakdown.volume;
    });
}

module.exports = { scanForNPattern };

// ========================
// MOCK EXECUTION BLOCK
// ========================
if (require.main === module) {
    const mockCandles = [];
    let price = 100;
    let baseTime = 1600000000;
    
    for (let i = 0; i < 970; i++) {
        price += 0.05; 
        mockCandles.push({ open: price, close: price, high: price + 0.5, low: price - 0.5, volume: 10000, time: baseTime + (i * 3600) });
    }

    // A (Index 975)
    for (let i = 970; i <= 975; i++) mockCandles.push({ open: 102, close: 101, high: 103, low: 100, volume: 15000, time: baseTime + (i * 3600) });
    
    // Impulse to C (Index 985)
    for (let i = 976; i <= 984; i++) mockCandles.push({ open: 104, close: 108, high: 108.5, low: 103.5, volume: 30000, time: baseTime + (i * 3600) });
    mockCandles.push({ open: 108, close: 109, high: 110, low: 107, volume: 40000, time: baseTime + (985 * 3600) }); 
    
    // Pullback to B (Index 990)
    for (let i = 986; i <= 989; i++) mockCandles.push({ open: 108, close: 106, high: 109, low: 105.5, volume: 8000, time: baseTime + (i * 3600) });
    mockCandles.push({ open: 106, close: 105.5, high: 106, low: 105, volume: 6000, time: baseTime + (990 * 3600) }); 

    // Move to breakout
    for (let i = 991; i <= 994; i++) mockCandles.push({ open: 106, close: 109, high: 109.5, low: 105.5, volume: 15000, time: baseTime + (i * 3600) });
    
    // Breakout Candle (Index 995)
    mockCandles.push({ open: 109, close: 112, high: 112.5, low: 108, volume: 150000, time: baseTime + (995 * 3600) }); 
    
    // Follow-Through Candles
    mockCandles.push({ open: 112, close: 114, high: 115, low: 111, volume: 20000, time: baseTime + (996 * 3600) });
    mockCandles.push({ open: 113, close: 115, high: 116, low: 112, volume: 15000, time: baseTime + (997 * 3600) });

    console.log(`=== RUNNING INSTITUTIONAL ADVANCED SCANNER ===`);
    const results = scanForNPattern(mockCandles, 'bullish');
    console.log(JSON.stringify(results, null, 2));
}
