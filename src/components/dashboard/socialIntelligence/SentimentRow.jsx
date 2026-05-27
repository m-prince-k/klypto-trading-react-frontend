import React, { useState, useRef, useEffect } from 'react';

const TIMEFRAMES = ['24H', '7D', '1M'];

export default function SentimentRow({ sentimentData, pinX, pinY, generateAreaPath, generateLinePath, timeframe, setTimeframe }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Pick the correct data array for the selected timeframe
  const chartPoints = sentimentData?.sentimentOverTime?.[timeframe] || sentimentData?.sentimentOverTime || [];

  // Generate x-axis labels based on timeframe and data length
  const getXLabels = () => {
    const now = new Date();
    const count = chartPoints.length || 7;
    if (timeframe === '24H') {
      return Array.from({ length: count }, (_, i) => {
        const d = new Date(now);
        d.setHours(now.getHours() - (count - 1 - i) * Math.floor(24 / count));
        return `${d.getHours()}:00`;
      });
    } else if (timeframe === '7D') {
      return Array.from({ length: count }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (count - 1 - i));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
    } else {
      return Array.from({ length: count }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (count - 1 - i) * 3);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
    }
  };

  const xLabels = getXLabels();
  // Show at most 6 evenly spaced labels
  const labelCount = Math.min(6, xLabels.length);
  const step = Math.floor((xLabels.length - 1) / (labelCount - 1)) || 1;
  const displayLabels = Array.from({ length: labelCount }, (_, i) =>
    xLabels[Math.min(i * step, xLabels.length - 1)]
  );

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
            <span className="si-gauge-number">{sentimentData?.sentimentScore}</span>
            <span className="si-gauge-label" style={{ color: sentimentData?.sentimentScore > 60 ? '#10b981' : sentimentData?.sentimentScore > 40 ? '#f59e0b' : '#ef4444' }}>
              {sentimentData?.sentimentLabel}
            </span>
          </div>
        </div>
        <div className="si-gauge-legend">
          <span className="si-leg-item"><span className="si-dot green"></span>Bullish <strong className="si-leg-val">{sentimentData?.bullishPct}%</strong></span>
          <span className="si-leg-item"><span className="si-dot yellow"></span>Neutral <strong className="si-leg-val">{sentimentData?.neutralPct}%</strong></span>
          <span className="si-leg-item"><span className="si-dot red"></span>Bearish <strong className="si-leg-val">{sentimentData?.bearishPct}%</strong></span>
        </div>
      </div>

      {/* Card 2: Sentiment Over Time */}
      <div className="si-card" style={{ flex: '2' }}>
        <div className="si-card-header-with-action">
          <h4 className="si-card-title">Sentiment Over Time</h4>
          <div className="si-card-dropdown" ref={dropdownRef} onClick={() => setDropdownOpen(o => !o)} style={{ position: 'relative' }}>
            <span>{timeframe}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '6px', zIndex: 100, minWidth: '70px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                {TIMEFRAMES.map(tf => (
                  <div
                    key={tf}
                    onClick={(e) => { e.stopPropagation(); setTimeframe(tf); setDropdownOpen(false); }}
                    style={{
                      padding: '8px 14px', fontSize: '12px', cursor: 'pointer',
                      color: tf === timeframe ? 'var(--color-primary)' : 'var(--text-muted)',
                      fontWeight: tf === timeframe ? '600' : '400',
                      background: tf === timeframe ? 'rgba(99,102,241,0.1)' : 'transparent',
                    }}
                  >
                    {tf}
                  </div>
                ))}
              </div>
            )}
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
            {chartPoints.length > 0 && (
              <>
                <path d={generateAreaPath(chartPoints)} fill="url(#sentimentAreaGrad)" />
                <path d={generateLinePath(chartPoints)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
          <div className="si-chart-xaxis">
            {displayLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
