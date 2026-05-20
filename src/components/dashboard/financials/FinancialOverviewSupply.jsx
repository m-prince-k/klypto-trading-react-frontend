import React from 'react';

export default function FinancialOverviewSupply({
  name,
  symbol,
  price,
  change24h,
  volume24h,
  marketCap,
  fdv,
  fundamentals,
  marketExtra,
  formatNum,
  formatLarge,
  changeColor,
  changeSign
}) {
  return (
    <>
      {/* 1. PROJECT OVERVIEW */}
      <div className="fin-col-3">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">👤</span> 1. PROJECT OVERVIEW</div>
          <div className="fin-list">
            <div className="fin-list-item"><span className="fin-list-label">Project Name</span><span className="fin-list-val">{marketExtra?.name || name}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Ticker</span><span className="fin-list-val">{symbol}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Blockchain</span><span className="fin-list-val">{fundamentals?.blockchain}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Category</span><span className="fin-list-val">{(marketExtra?.categories || [fundamentals?.category]).slice(0,2).join(', ') || fundamentals?.category}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Website</span><span className="fin-list-val text-blue" style={{cursor:'pointer'}} onClick={() => window.open(marketExtra?.website || fundamentals?.website, '_blank')}>{(marketExtra?.website || fundamentals?.website || '').replace('https://','')}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Whitepaper</span><span className="fin-list-val text-blue" style={{cursor:'pointer'}}>View Whitepaper</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Launch Date</span><span className="fin-list-val">{marketExtra?.genesisDate || fundamentals?.launchDate}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Consensus</span><span className="fin-list-val">{fundamentals?.consensus}</span></div>
            <div className="fin-list-item" style={{alignItems:'flex-start'}}><span className="fin-list-label">Use Case</span><span className="fin-list-val" style={{textAlign:'right'}}>{fundamentals?.useCase}</span></div>
          </div>
        </div>
      </div>

      {/* 2. SUPPLY & TOKENOMICS */}
      <div className="fin-col-4">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">📊</span> 2. SUPPLY & TOKENOMICS</div>
          <div style={{display: 'flex', gap: '16px'}}>
            <div className="fin-list" style={{flex: 1}}>
              <div className="fin-list-item"><span className="fin-list-label">Total Supply</span><span className="fin-list-val">{formatNum(marketExtra?.totalSupply || fundamentals?.totalSupply,0,0)} {symbol}</span></div>
              <div className="fin-list-item"><span className="fin-list-label">Circulating Supply</span><span className="fin-list-val">{formatNum(marketExtra?.circulatingSupply || fundamentals?.circulatingSupply,0,0)} {symbol}</span></div>
              <div className="fin-list-item"><span className="fin-list-label">Inflation / Emission</span><span className="fin-list-val">{fundamentals?.inflation}</span></div>
              <div className="fin-list-item"><span className="fin-list-label">Burn Mechanism</span><span className="fin-list-val">{fundamentals?.burnMechanism}</span></div>
              <div className="fin-list-item"><span className="fin-list-label">Token Type</span><span className="fin-list-val">{fundamentals?.tokenType}</span></div>
            </div>
            <div style={{flex: '0 0 100px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{fontSize: '9px', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px'}}>TOKEN ALLOCATION</div>
              <div className="fin-donut-wrapper" style={{marginTop: 0, gap: '8px'}}>
                <div className="fin-donut" style={{width: '60px', height: '60px'}}></div>
                <div className="fin-legend" style={{fontSize: '8px'}}>
                  <div className="fin-legend-item"><div className="fin-legend-dot" style={{backgroundColor: '#3b82f6'}}></div> Community 40%</div>
                  <div className="fin-legend-item"><div className="fin-legend-dot" style={{backgroundColor: '#10b981'}}></div> Ecosystem 20%</div>
                  <div className="fin-legend-item"><div className="fin-legend-dot" style={{backgroundColor: '#f59e0b'}}></div> Team 15%</div>
                  <div className="fin-legend-item"><div className="fin-legend-dot" style={{backgroundColor: '#8b5cf6'}}></div> Investors 15%</div>
                  <div className="fin-legend-item"><div className="fin-legend-dot" style={{backgroundColor: '#ef4444'}}></div> Advisors 5%</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{marginTop: '12px'}}>
            <div style={{fontSize: '10px', color: 'var(--text-muted, #94a3b8)', borderBottom: '1px solid var(--border-color, #1e293b)', paddingBottom: '4px', marginBottom: '6px'}}>VESTING SCHEDULE</div>
            <div className="fin-list-item" style={{fontSize: '10px'}}><span className="fin-list-label">Team</span><span className="fin-list-val">12 months cliff, 36 months vesting</span></div>
            <div className="fin-list-item" style={{fontSize: '10px'}}><span className="fin-list-label">Investors</span><span className="fin-list-val">6 months cliff, 24 months vesting</span></div>
            <div className="fin-list-item" style={{fontSize: '10px'}}><span className="fin-list-label">Advisors</span><span className="fin-list-val">6 months cliff, 24 months vesting</span></div>
          </div>
        </div>
      </div>

      {/* 3. MARKET METRICS */}
      <div className="fin-col-3">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">📈</span> 3. MARKET METRICS</div>
          <div className="fin-list">
            <div className="fin-list-item"><span className="fin-list-label">Current Price</span><span className="fin-list-val">${formatNum(price, 2, 4)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">24h Change</span><span className={`fin-list-val ${changeColor}`}>{changeSign}{formatNum(change24h)}%</span></div>
            {marketExtra?.change7d !== undefined && <div className="fin-list-item"><span className="fin-list-label">7d Change</span><span className={`fin-list-val ${marketExtra.change7d >= 0 ? 'text-green' : 'text-red'}`}>{marketExtra.change7d >= 0 ? '+' : ''}{formatNum(marketExtra.change7d)}%</span></div>}
            {marketExtra?.change30d !== undefined && <div className="fin-list-item"><span className="fin-list-label">30d Change</span><span className={`fin-list-val ${marketExtra.change30d >= 0 ? 'text-green' : 'text-red'}`}>{marketExtra.change30d >= 0 ? '+' : ''}{formatNum(marketExtra.change30d)}%</span></div>}
            <div className="fin-list-item"><span className="fin-list-label">Market Cap</span><span className="fin-list-val">${formatLarge(marketExtra?.marketCap || marketCap)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Fully Diluted Val.</span><span className="fin-list-val">${formatLarge(marketExtra?.fdv || fdv)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">24h Volume</span><span className="fin-list-val">${formatLarge(marketExtra?.quoteVolume || volume24h)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Volume / Mkt Cap</span><span className="fin-list-val">{((marketExtra?.quoteVolume || volume24h) / (marketExtra?.marketCap || marketCap || 1)).toFixed(3)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">24h High</span><span className="fin-list-val">${formatNum(marketExtra?.high24h || price, 2, 4)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">24h Low</span><span className="fin-list-val">${formatNum(marketExtra?.low24h || price, 2, 4)}</span></div>
            {marketExtra?.marketCapRank && <div className="fin-list-item"><span className="fin-list-label">Mkt Cap Rank</span><span className="fin-list-val">#{marketExtra.marketCapRank}</span></div>}
            {marketExtra?.ath && <div className="fin-list-item"><span className="fin-list-label">All Time High</span><span className="fin-list-val">${formatNum(marketExtra.ath, 2, 4)}</span></div>}
            {marketExtra?.atl && <div className="fin-list-item"><span className="fin-list-label">All Time Low</span><span className="fin-list-val">${formatNum(marketExtra.atl, 2, 4)}</span></div>}
          </div>
        </div>
      </div>
    </>
  );
}
