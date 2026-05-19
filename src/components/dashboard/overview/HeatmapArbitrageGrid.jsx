import React from 'react';

const HeatmapArbitrageGrid = ({ socialStats, arbitrage, alerts }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px' }}>
      
      {/* Card 1: Narrative Heatmap bubbles */}
      <div className="premium-card" style={{ minHeight: '180px' }}>
        <div className="card-header-row">
          <h4 className="card-title-main">Narrative Heatmap</h4>
          <span className="glow-tag-purple">LUNARCRUSH</span>
        </div>

        {/* CSS Bubble floating layout inside custom wrapper */}
        <div style={{ position: 'relative', width: '100%', height: '120px', overflow: 'hidden', marginTop: '6px' }}>
          {/* Bubble 1: DeFi */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '48px', height: '48px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.05) 100%)', border: '1.5px solid #6366f1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}>
            <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#ffffff' }}>DeFi</span>
            <span style={{ fontSize: '8.5px', color: '#a5b4fc', fontWeight: 'bold' }}>{socialStats.narrativeScores.DeFi}</span>
          </div>

          {/* Bubble 2: AI */}
          <div style={{ position: 'absolute', top: '48px', right: '15px', width: '44px', height: '44px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(167,139,250,0.05) 100%)', border: '1.5px solid #a78bfa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(167,139,250,0.3)' }}>
            <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#ffffff' }}>AI</span>
            <span style={{ fontSize: '8.5px', color: '#c7d2fe', fontWeight: 'bold' }}>{socialStats.narrativeScores.AI}</span>
          </div>

          {/* Bubble 3: Memecoons */}
          <div style={{ position: 'absolute', bottom: '10px', left: '55px', width: '38px', height: '38px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)', border: '1.2px solid #f59e0b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#ffffff' }}>MEME</span>
            <span style={{ fontSize: '8px', color: '#fcd34d', fontWeight: 'bold' }}>{socialStats.narrativeScores.Memecoons}</span>
          </div>

          {/* Bubble 4: Layer 2 */}
          <div style={{ position: 'absolute', top: '5px', right: '65px', width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.05) 100%)', border: '1.2px solid #10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#ffffff' }}>L2</span>
            <span style={{ fontSize: '8px', color: '#6ee7b7', fontWeight: 'bold' }}>{socialStats.narrativeScores.Layer2}</span>
          </div>

          {/* Bubble 5: RWA */}
          <div style={{ position: 'absolute', bottom: '15px', left: '115px', width: '36px', height: '36px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)', border: '1.2px solid #3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#ffffff' }}>RWA</span>
            <span style={{ fontSize: '8px', color: '#93c5fd', fontWeight: 'bold' }}>{socialStats.narrativeScores.RWA}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Top Arbitrage Opportunities */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Top Arbitrage</h4>
          <span className="glow-tag-green">CCXT PRICES</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
          {arbitrage.map((arb, i) => (
            <div key={`arb-${i}`} className="compass-item-row">
              <div>
                <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{arb.symbol}</span>
                <div style={{ fontSize: '8px', color: '#64748b' }}>Binance ${arb.binance} | Bybit ${arb.bybit}</div>
              </div>
              <span className="trade-action-badge">{arb.spread} Spread</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Multi Exchange pricing compass */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Price Compass</h4>
          <span className="glow-tag-green">CCXT</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
          {/* Bitcoin glowing dial SVG */}
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="#131826" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="24" fill="none" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.4" />
            {/* Compass divisions */}
            <line x1="32" y1="4" x2="32" y2="8" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="32" y1="60" x2="32" y2="56" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="4" y1="32" x2="8" y2="32" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="60" y1="32" x2="56" y2="32" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Dial pointer */}
            <polygon points="32,32 30,12 34,12" fill="#ef4444" />
            <polygon points="32,32 29,48 35,48" fill="#64748b" />

            {/* Center orange glowing BTC node */}
            <circle cx="32" cy="32" r="4.5" fill="#f59e0b" />
          </svg>
          <div>
            <div style={{ fontSize: '10.5px', color: '#8f9cae', lineHeight: '1.4' }}>
              Center dial aligns price deviations between top 4 exchanges.
            </div>
            <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 'bold', marginTop: '3px' }}>
              Compass Deviation: 0.04% (Secure)
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Live Alerts Feed */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Alerts Feed</h4>
          <span className="glow-tag-yellow">SYSTEM STATUS</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', maxHeight: '120px', overflowY: 'auto' }}>
          {alerts.map((alert) => (
            <div key={alert.id} style={{ display: 'flex', gap: '6px', fontSize: '9.5px', borderBottom: '1px solid #0f1320', paddingBottom: '4px' }}>
              <span style={{
                color: alert.type === 'whale' ? '#f59e0b' : (alert.type === 'tvl' ? '#10b981' : '#a78bfa'),
                fontWeight: 'bold',
                textTransform: 'uppercase',
                flexShrink: 0
              }}>
                [{alert.type}]
              </span>
              <span style={{ color: '#cbd5e1' }}>{alert.msg}</span>
              <span style={{ color: '#64748b', marginLeft: 'auto', flexShrink: 0 }}>{alert.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HeatmapArbitrageGrid;
