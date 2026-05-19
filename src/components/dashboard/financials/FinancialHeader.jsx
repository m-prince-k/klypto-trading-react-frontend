import React from 'react';

export default function FinancialHeader({
  selectedSymbol,
  setSelectedSymbol,
  name,
  symbol,
  price,
  change24h,
  volume24h,
  marketCap,
  fundamentals,
  formatNum,
  formatLarge,
  changeColor,
  changeSign
}) {
  return (
    <div className="fin-header">
      <div className="fin-title-block">
        <div className="fin-title-sub">COIN FINANCE MODEL</div>
        <h1>COMPLETE ANALYSIS & REPORT FRAMEWORK</h1>
        <div className="fin-title-desc">For Advanced Valuation & Price Movement Prediction</div>
      </div>
      
      <div className="fin-header-stats">
        <select 
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          style={{
            background: '#1e293b', 
            color: '#fff', 
            border: '1px solid #334155', 
            borderRadius: '4px', 
            padding: '6px 12px', 
            outline: 'none', 
            marginRight: '20px'
          }}
        >
          <option value="BTC">BTC / Bitcoin</option>
          <option value="ETH">ETH / Ethereum</option>
          <option value="SOL">SOL / Solana</option>
        </select>

        <div className="fin-coin-badge">
          <div className="fin-coin-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <div style={{color: '#94a3b8', fontSize: '9px', marginBottom: '2px'}}>COIN / TOKEN</div>
            <h2 className="fin-coin-name">{name} ({symbol})</h2>
            <div className="fin-coin-tags">
              <span className="fin-tag">Blockchain: {fundamentals?.blockchain}</span>
              <span className="fin-tag">Category: {fundamentals?.category?.split('/')[0]}</span>
            </div>
          </div>
        </div>
        
        <div className="fin-stat-box" style={{marginLeft: '20px'}}>
          <div className="fin-price-val">${formatNum(price, 2, 4)}</div>
          <div className={changeColor} style={{fontSize: '11px', fontWeight: 'bold'}}>
            {changeSign}{formatNum(change24h)}% (24h)
          </div>
        </div>
        
        <div className="fin-stat-box">
          <div className="fin-stat-label">Market Cap</div>
          <div className="fin-stat-val">${formatLarge(marketCap)}</div>
        </div>
        <div className="fin-stat-box">
          <div className="fin-stat-label">24h Volume</div>
          <div className="fin-stat-val">${formatLarge(volume24h)}</div>
        </div>
        <div className="fin-stat-box">
          <div className="fin-stat-label">Circulating Supply</div>
          <div className="fin-stat-val">{formatLarge(fundamentals?.circulatingSupply)} {symbol}</div>
        </div>
        <div className="fin-stat-box">
          <div className="fin-stat-label">Total Supply</div>
          <div className="fin-stat-val">{formatLarge(fundamentals?.totalSupply)} {symbol}</div>
        </div>
        
        <div className="fin-date-box">
          <div className="fin-stat-label" style={{color: '#fff'}}>Report Date</div>
          <div style={{color: '#94a3b8', fontSize: '10px'}}>
            {new Date().toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}
          </div>
          <div style={{color: '#94a3b8', fontSize: '10px'}}>Time</div>
          <div style={{color: '#94a3b8', fontSize: '10px'}}>
            {new Date().toLocaleTimeString('en-GB', {timeZone:'UTC'})} UTC
          </div>
        </div>
      </div>
    </div>
  );
}
