import React from 'react';

const AdvancedMetricsGrid = ({ selectedSymbol = "SOL", marketMetrics, fearGreed, socialStats, prices }) => {
  const baseAsset = selectedSymbol.replace(/USDT|BUSD|USD/gi, '') || "SOL";
  return (
    <div className="top-five-grid">
      {/* Card 1: Market Regime */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Market Regime</h4>
          <span className="glow-tag-yellow">ALTERNATIVE.ME</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" fill="url(#regime-glow)" fillOpacity="0.15" stroke="#10b981" strokeWidth="1" />
            <path d="M18 42 L28 28 L36 34 L48 18" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points="48,18 42,22 46,26" fill="#10b981" />
            <defs>
              <radialGradient id="regime-glow" cx="0" cy="0" r="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🐂</span> BULL REGIME
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Strength: 72/100</div>
          </div>
        </div>
        {/* Segment meter */}
        <div className="regime-segments">
          <div className="regime-seg active"></div>
          <div className="regime-seg active"></div>
          <div className="regime-seg active"></div>
          <div className="regime-seg active"></div>
          <div className="regime-seg"></div>
        </div>
      </div>

      {/* Card 2: Fear & Greed Index */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Fear & Greed</h4>
          <span className="glow-tag-yellow">ALTERNATIVE.ME</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
          {/* Gauge Arc SVG */}
          <svg width="40" height="24" viewBox="0 0 40 20">
            <path d="M 5,20 A 15,15 0 0,1 35,20" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="14 30" strokeLinecap="round" />
            <path d="M 5,20 A 15,15 0 0,1 35,20" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="0 14 14 14" strokeLinecap="round" />
            <path d="M 5,20 A 15,15 0 0,1 35,20" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="0 28 14 0" strokeLinecap="round" />
            {/* Dial Needle */}
            <line 
              x1="20" 
              y1="20" 
              x2="8" 
              y2="20" 
              stroke="#ffffff" 
              strokeWidth="2" 
              strokeLinecap="round" 
              transform={`rotate(${((fearGreed?.value || 50) / 100) * 180}, 20, 20)`}
              style={{ transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            <circle cx="20" cy="20" r="2.5" fill="#ffffff" />
          </svg>
          <div>
            <div style={{ fontSize: '19px', fontWeight: 'bold', color: 'var(--text-main)' }}>{fearGreed?.value}</div>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '700' }}>{fearGreed?.label}</div>
          </div>
        </div>
        <div className="fg-historical">
          <div>Yesterday: <span>{fearGreed?.yesterday}</span></div>
          <div>Last Week: <span>{fearGreed?.lastWeek}</span></div>
        </div>
      </div>

      {/* Card 3: Social Dominance */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Social Dominance</h4>
          <span className="glow-tag-purple">LUNARCRUSH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#1f2937" strokeWidth="1" />
            <circle cx="18" cy="18" r="10" fill="none" stroke="#1f2937" strokeWidth="1" />
            {/* Radiating nodes */}
            <circle cx="18" cy="3" r="2" fill="#a78bfa" />
            <circle cx="31" cy="23" r="2.5" fill="#a78bfa" />
            <circle cx="5" cy="14" r="1.5" fill="#a78bfa" />
            {/* Inner Dominant core */}
            <circle cx="18" cy="18" r="6" fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="1.5" />
          </svg>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#a78bfa' }}>{socialStats?.btcDominance}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 'bold' }}>BTC DOMINANCE</div>
          </div>
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
          Twitter: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>44.1%</span> | Reddit: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>21.6%</span>
        </div>
      </div>

      {/* Card 4: AltRank™ */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">AltRank™</h4>
          <span className="glow-tag-purple">LUNARCRUSH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#141c2c" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#6366f1" strokeWidth="3.5" strokeDasharray="75 100" strokeDashoffset="10" strokeLinecap="round" />
            <text x="18" y="21.5" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">#</text>
          </svg>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)', textAlign: 'left' }}>{socialStats?.altRank}</div>
            <div style={{ fontSize: '9px', color: '#6366f1', fontWeight: 'bold' }}>{baseAsset} RANK</div>
          </div>
        </div>
        {/* <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
          Out of <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>4,821 active tokens</span>
        </div> */}
      </div>

      {/* Card 5: Market Cap */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Market Cap</h4>
          <span className="glow-tag-green">CCXT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          {/* Miniature 3D bar chart */}
          <svg width="32" height="32" viewBox="0 0 32 32">
            <rect x="3" y="18" width="5" height="14" rx="1.5" fill="#10b981" />
            <rect x="11" y="10" width="5" height="22" rx="1.5" fill="#10b981" />
            <rect x="19" y="14" width="5" height="18" rx="1.5" fill="#10b981" />
            <rect x="27" y="4" width="5" height="28" rx="1.5" fill="#10b981" fillOpacity="0.4" />
          </svg>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {marketMetrics?.totalMarketCap ? `$${marketMetrics.totalMarketCap}T` : (prices.TOTAL_MCAP?.val ? `$${prices.TOTAL_MCAP.val}` : '')}
            </div>
            <div style={{ fontSize: '9px', color: (marketMetrics?.totalMarketCapChange >= 0 || prices.TOTAL_MCAP?.isUp) ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
              {marketMetrics?.totalMarketCapChange != null 
                ? `${marketMetrics.totalMarketCapChange >= 0 ? '▲' : '▼'} ${Math.abs(marketMetrics.totalMarketCapChange).toFixed(2)}% (24H)` 
                : (prices.TOTAL_MCAP?.change ? `${prices.TOTAL_MCAP.isUp ? '▲' : '▼'} ${prices.TOTAL_MCAP.change} (24H)` : '')}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--text-muted)', marginTop: '5px', textAlign: 'center' }}>
          Dominance: <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>BTC 55.4%</span> | <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>ETH 17.8%</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMetricsGrid;
