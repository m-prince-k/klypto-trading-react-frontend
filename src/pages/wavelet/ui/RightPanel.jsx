import React from "react";

export default function RightPanel({ data }) {
  // Extract dummy values or from actual data
  const trendStrength = data?.dashboard?.market?.trendStrength || 78;
  const currentSignal = data?.wavelet?.latest?.signal || "Bullish";
  const waveletConf = data?.wavelet?.latest?.confidence || 72;
  const fractalConf = data?.fractals?.[Object.keys(data.fractals).pop()]?.confidence || 68;
  const timeframe = "1 Hour";
  const marketState = data?.dashboard?.market?.state || "Bullish";
  const momentum = data?.dashboard?.market?.momentum || "Upward Momentum";

  const isBullish = currentSignal.toUpperCase().includes("BULL") || currentSignal.toUpperCase().includes("UP");

  return (
    <div className="wavelet-right-panel">
      {/* Trend Direction */}
      <div className="right-panel-card text-center">
        <h4 className="panel-title">TREND DIRECTION</h4>
        <div className={`trend-arrow-circle ${isBullish ? "text-green" : "text-red"}`}>
          <div className={`trend-arrow ${isBullish ? "text-green" : "text-red"}`}>
            {isBullish ? "⬆" : "⬇"}
          </div>
        </div>
        <div className={`trend-text ${isBullish ? "text-green" : "text-red"}`}>
          {isBullish ? "UPTREND" : "DOWNTREND"}
        </div>
        <p className="panel-subtitle">Price is likely moving {isBullish ? "UP" : "DOWN"}</p>
      </div>

      {/* Trend Strength */}
      <div className="right-panel-card text-center">
        <h4 className="panel-title">TREND STRENGTH</h4>
        <div className="circular-progress">
          <div className="circular-progress-text">{trendStrength}%</div>
        </div>
        <p className="panel-subtitle text-green mt-2">Strong Bullish<br/>Momentum</p>
      </div>

      {/* Current Signal */}
      <div className="right-panel-card text-center">
        <h4 className="panel-title">CURRENT SIGNAL</h4>
        <div className={`trend-text ${currentSignal === "Bullish" ? "text-green" : "text-red"}`}>
          {currentSignal}
        </div>
        <p className="panel-subtitle">High Probability<br/>of Upward Move</p>
      </div>

      {/* Confidences */}
      <div className="right-panel-card">
        <h4 className="panel-title">WAVELET CONFIDENCE</h4>
        <div className="text-center text-blue font-bold text-lg mb-1">{waveletConf}%</div>
        <div className="horizontal-progress-bg">
          <div className="horizontal-progress-fill fill-blue" style={{ width: `${waveletConf}%` }}></div>
        </div>
      </div>

      <div className="right-panel-card mt-2">
        <h4 className="panel-title">FRACTAL CONFIDENCE</h4>
        <div className="text-center" style={{ color: '#9c27b0', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{fractalConf}%</div>
        <div className="horizontal-progress-bg">
          <div className="horizontal-progress-fill fill-purple" style={{ width: `${fractalConf}%` }}></div>
        </div>
      </div>

      {/* Timeframe & Market State */}
      <div className="right-panel-card text-center no-border">
        <h4 className="panel-title">TIMEFRAME</h4>
        <div className="timeframe-text">{timeframe}</div>

        <h4 className="panel-title mt-4">MARKET STATE</h4>
        <div className={`signal-text ${isBullish ? "text-green" : "text-red"}`}>
          {marketState}
        </div>
        <p className="panel-subtitle">({momentum})</p>
      </div>
    </div>
  );
}
