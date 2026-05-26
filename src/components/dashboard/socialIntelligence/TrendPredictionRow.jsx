import React from 'react';

export default function TrendPredictionRow({ sentimentData }) {
  return (
    <div className="si-grid-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
      {/* Card 6: Buzz Score */}
      <div className="si-card" style={{ flex: '1' }}>
        <h4 className="si-card-title">Buzz Score</h4>
        <div className="si-card-stat-row">
          <span className="si-stat-number">{sentimentData?.buzzScore}<span className="si-score-total">/100</span></span>
        </div>
        <span className="si-buzz-tag">Very High</span>
        <div className="si-buzz-chart-container">
          <svg className="si-buzz-chart-svg" viewBox="0 0 150 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M 0,38 Q 20,32 40,36 T 80,28 T 120,32 T 150,18 L 150,40 L 0,40 Z" fill="url(#purpleAreaGrad)" />
            <path d="M 0,38 Q 20,32 40,36 T 80,28 T 120,32 T 150,18" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Card 7: Trend Prediction */}
      <div className="si-card" style={{ flex: '1' }}>
        <h4 className="si-card-title">Trend Prediction</h4>
        <span className="si-prediction-sub">Trend Prediction (Based on Social)</span>
        <div className="si-prediction-display">
          <div className="si-arrow-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
          </div>
          <span className="si-prediction-result">{sentimentData?.trendPrediction}</span>
        </div>
        <div className="si-confidence-text">
          Confidence: <span className="si-confidence-val">{sentimentData?.confidence}</span>
        </div>
      </div>
    </div>
  );
}
