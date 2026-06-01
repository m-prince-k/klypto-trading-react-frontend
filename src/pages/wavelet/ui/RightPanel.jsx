import React, { useEffect } from "react";

export default function RightPanel({ data }) {
  useEffect(() => {
    console.log("=== RightPanel data.dashboard ===", data?.dashboard);
    console.log("=== data.wavelet.latest ===", data?.wavelet?.latest);
  }, [data]);

  const market        = data?.dashboard?.market      || {};
  const waveletLatest = data?.wavelet?.latest        || {};

  // ── Raw values — null when the backend doesn't supply them ──────────────
  const rawStrength = market.trendStrength ?? market.trend_strength ?? waveletLatest.trendStrength ?? null;
  const trendStrength = rawStrength !== null ? Math.round(Number(rawStrength)) : null;

  const currentSignal = waveletLatest.signal ?? market.signal ?? data?.dashboard?.signal ?? null;

  const rawWavConf =
    waveletLatest.confidence ?? waveletLatest.waveletConfidence ?? data?.dashboard?.waveletConfidence ?? null;
  const waveletConf =
    rawWavConf !== null
      ? Math.round(Number(rawWavConf) > 1 ? Number(rawWavConf) : Number(rawWavConf) * 100)
      : null;

  const fractalKeys  = data?.fractals ? Object.keys(data.fractals) : [];
  const lastFractal  = fractalKeys.length ? data.fractals[fractalKeys[fractalKeys.length - 1]] : null;
  const rawFracConf  = market.fractalConfidence ?? lastFractal?.confidence ?? data?.dashboard?.fractalConfidence ?? null;
  const fractalConf  =
    rawFracConf !== null
      ? Math.round(Number(rawFracConf) > 1 ? Number(rawFracConf) : Number(rawFracConf) * 100)
      : null;

  const interval     = data?.meta?.interval ?? data?.interval ?? null;
  const timeframeMap = { "1m": "1 Minute", "5m": "5 Minutes", "15m": "15 Minutes", "30m": "30 Minutes", "1h": "1 Hour", "4h": "4 Hours", "1d": "1 Day" };
  const timeframe    = interval ? (timeframeMap[interval] || interval) : null;

  const marketState  = market.state ?? market.marketState ?? data?.dashboard?.marketState ?? null;
  const momentum     = market.momentum ?? market.trend ?? data?.dashboard?.momentum ?? null;

  const isBullish =
    typeof currentSignal === "string" &&
    (currentSignal.toUpperCase().includes("BULL") || currentSignal.toUpperCase().includes("UP"));

  const ringDeg        = trendStrength !== null ? Math.round((trendStrength / 100) * 360) : 0;
  const strengthLabel  =
    trendStrength === null ? null :
    trendStrength >= 70   ? "Strong Bullish"   :
    trendStrength >= 50   ? "Moderate Bullish" :
    trendStrength >= 30   ? "Moderate Bearish" : "Strong Bearish";

  // Helper: render "N/A" badge when value is missing
  const NA = <span className="rp-na">N/A</span>;

  return (
    <div className="wavelet-right-panel">

      {/* ── TREND DIRECTION ──────────────────────────────────────── */}
      <div className="rp-card rp-card--center">
        <div className="rp-label">TREND DIRECTION</div>
        {currentSignal !== null ? (
          <>
            <div className={`rp-arrow-circle ${isBullish ? "rp-arrow-circle--bull" : "rp-arrow-circle--bear"}`}>
              <span className={`rp-arrow-icon ${isBullish ? "text-green" : "text-red"}`}>
                {isBullish ? "↑" : "↓"}
              </span>
            </div>
            <div className={`rp-trend-text ${isBullish ? "text-green" : "text-red"}`}>
              {isBullish ? "UPTREND" : "DOWNTREND"}
            </div>
            <div className="rp-sub">Price is likely moving <strong>{isBullish ? "UP" : "DOWN"}</strong></div>
          </>
        ) : (
          <>{NA}<div className="rp-sub">No signal data</div></>
        )}
      </div>

      {/* ── TREND STRENGTH ───────────────────────────────────────── */}
      <div className="rp-card rp-card--center">
        <div className="rp-label">TREND STRENGTH</div>
        {trendStrength !== null ? (
          <>
            <div className="rp-ring" style={{ background: `conic-gradient(#4caf50 ${ringDeg}deg, #1E222D 0deg)` }}>
              <div className="rp-ring-inner">
                <span className="rp-ring-value">{trendStrength}%</span>
              </div>
            </div>
            <div className="rp-sub text-green rp-sub--bold">{strengthLabel}<br />Momentum</div>
          </>
        ) : (
          <>{NA}<div className="rp-sub">No data from backend</div></>
        )}
      </div>

      {/* ── CURRENT SIGNAL ───────────────────────────────────────── */}
      <div className="rp-card rp-card--center">
        <div className="rp-label">CURRENT SIGNAL</div>
        {currentSignal !== null ? (
          <>
            <div className={`rp-signal-text ${isBullish ? "text-green" : "text-red"}`}>{currentSignal}</div>
            <div className="rp-sub">
              High Probability<br />{isBullish ? "of Upward Move" : "of Downward Move"}
            </div>
          </>
        ) : (
          <>{NA}</>
        )}
      </div>

      {/* ── WAVELET CONFIDENCE ───────────────────────────────────── */}
      <div className="rp-card">
        <div className="rp-label">WAVELET CONFIDENCE</div>
        {waveletConf !== null ? (
          <>
            <div className="rp-conf-value text-blue">{waveletConf}%</div>
            <div className="rp-bar-bg">
              <div className="rp-bar-fill rp-bar-fill--blue" style={{ width: `${waveletConf}%` }} />
            </div>
          </>
        ) : (
          <div className="rp-conf-value">{NA}</div>
        )}
      </div>

      {/* ── FRACTAL CONFIDENCE ───────────────────────────────────── */}
      <div className="rp-card">
        <div className="rp-label">FRACTAL CONFIDENCE</div>
        {fractalConf !== null ? (
          <>
            <div className="rp-conf-value text-purple">{fractalConf}%</div>
            <div className="rp-bar-bg">
              <div className="rp-bar-fill rp-bar-fill--purple" style={{ width: `${fractalConf}%` }} />
            </div>
          </>
        ) : (
          <div className="rp-conf-value">{NA}</div>
        )}
      </div>

      {/* ── TIMEFRAME ────────────────────────────────────────────── */}
      <div className="rp-card rp-card--center">
        <div className="rp-label">TIMEFRAME</div>
        <div className="rp-timeframe-text">{timeframe ?? NA}</div>
      </div>

      {/* ── MARKET STATE ─────────────────────────────────────────── */}
      <div className="rp-card rp-card--center rp-card--last">
        <div className="rp-label">MARKET STATE</div>
        {marketState !== null ? (
          <>
            <div className={`rp-signal-text ${isBullish ? "text-green" : "text-red"}`}>{marketState}</div>
            {momentum !== null && (
              <div className={`rp-sub ${isBullish ? "text-green" : "text-red"}`}>({momentum})</div>
            )}
          </>
        ) : (
          <>{NA}</>
        )}
      </div>

    </div>
  );
}
