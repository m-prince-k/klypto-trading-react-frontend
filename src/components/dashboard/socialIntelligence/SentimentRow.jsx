import React from 'react';

export default function SentimentRow({ sentimentData, pinX, pinY, generateAreaPath, generateLinePath, timeframe, setTimeframe }) {
  return (
    <div className="si-grid-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
      
      {/* Card 1: Sentiment Gauge */}
      <div className="si-card" style={{ flex: '1' }}>
        <h4 className="si-card-title">Sentiment</h4>
        <div className="si-gauge-container">
          <svg className="si-gauge-svg" viewBox="0 0 100 55">
            <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 10,50 A 40,40 0 0,1 17.6,26.5" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
            <path d="M 17.6,26.5 A 40,40 0 0,1 43.7,10.5" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
            <path d="M 43.7,10.5 A 40,40 0 0,1 73.5,17.6" fill="none" stroke="#eab308" strokeWidth="8" strokeLinecap="round" />
            <path d="M 73.5,17.6 A 40,40 0 0,1 90,50" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            <line x1="50" y1="50" x2={pinX} y2={pinY} stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="4.5" fill="var(--text-main)" />
          </svg>
          <div className="si-gauge-center-text">
            <span className="si-gauge-number">{sentimentData.sentimentScore}</span>
            <span className="si-gauge-label" style={{ color: sentimentData.sentimentScore > 60 ? '#10b981' : sentimentData.sentimentScore > 40 ? '#f59e0b' : '#ef4444' }}>
              {sentimentData.sentimentLabel}
            </span>
          </div>
        </div>
        <div className="si-gauge-legend">
          <span className="si-leg-item"><span className="si-dot green"></span>Bullish <strong className="si-leg-val">{sentimentData.bullishPct}%</strong></span>
          <span className="si-leg-item"><span className="si-dot yellow"></span>Neutral <strong className="si-leg-val">{sentimentData.neutralPct}%</strong></span>
          <span className="si-leg-item"><span className="si-dot red"></span>Bearish <strong className="si-leg-val">{sentimentData.bearishPct}%</strong></span>
        </div>
      </div>

      {/* Card 2: Sentiment Over Time */}
      <div className="si-card" style={{ flex: '2' }}>
        <div className="si-card-header-with-action">
          <h4 className="si-card-title">Sentiment Over Time</h4>
          <div className="si-card-dropdown" onClick={() => setTimeframe(t => t === '24H' ? '7D' : '24H')}>
            <span>{timeframe}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </div>
        <div className="si-linechart-container">
          <svg className="si-linechart-svg" viewBox="0 0 450 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sentimentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="30" x2="450" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="60" x2="450" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="90" x2="450" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <path d={generateAreaPath(sentimentData.sentimentOverTime)} fill="url(#sentimentAreaGrad)" />
            <path d={generateLinePath(sentimentData.sentimentOverTime)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M 10,105 Q 40,85 70,92 T 130,100 T 190,75 T 250,88 T 310,72 T 370,95 T 440,68"
              fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 3" strokeOpacity="0.75"
            />
          </svg>
          <div className="si-chart-xaxis">
            <span>17 May</span>
            <span>18 May</span>
            <span>19 May</span>
            <span>20 May</span>
            <span>21 May</span>
            <span>22 May</span>
            <span>23 May</span>
          </div>
        </div>
      </div>

    </div>
  );
}
