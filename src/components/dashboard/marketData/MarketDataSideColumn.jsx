import React from 'react';

export default function MarketDataSideColumn({
  chartTimeframe,
  setChartTimeframe,
  marketMetrics,
  renderOverviewChart,
  gainers,
  losers,
  setActiveTab
}) {
  return (
    <div className="side-column">
      {/* Market Overview Card */}
      <div className="market-overview-card">
        <div className="overview-card-header">
          <span className="overview-card-title">Market Overview</span>
          <div className="timeframe-selector">
            {['1D', '7D', '1M', '1Y', 'All'].map((tf) => (
              <button 
                key={tf} 
                className={`timeframe-btn ${chartTimeframe === tf ? 'active' : ''}`} 
                onClick={() => setChartTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="overview-meta-data">
          <span className="overview-meta-label">Total Market Cap</span>
          <div className="overview-meta-value">${marketMetrics.totalMarketCap}T</div>
          <div className={`overview-meta-change ${marketMetrics.totalMarketCapChange >= 0 ? 'up' : 'down'}`}>
            {marketMetrics.totalMarketCapChange >= 0 ? '▲' : '▼'} {Math.abs(marketMetrics.totalMarketCapChange).toFixed(2)}%
          </div>
        </div>

        <div className="main-chart-wrapper">
          {renderOverviewChart(chartTimeframe)}
        </div>
      </div>

      {/* Top Gainers Card */}
      <div className="side-list-card">
        <div className="side-card-header">
          <span className="side-card-title">Top Gainers</span>
          <a href="#gainers" className="side-card-more-link" onClick={() => setActiveTab('Top Gainers')}>
            More 
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: '2px' }}><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>

        <div className="side-list-container">
          {gainers.map((coin, index) => (
            <div className="side-list-row" key={coin.symbol}>
              <div className="side-list-left">
                <span className="side-list-index">{index + 1}</span>
                <div className="side-list-coin">
                  <div className="side-coin-logo" style={{ backgroundColor: coin.logoColor }}>
                    {coin.symbol[0]}
                  </div>
                  <span className="side-coin-name">{coin.name}</span>
                  <span className="side-coin-symbol">{coin.symbol}</span>
                </div>
              </div>
              <div className="side-list-right">
                <span className="side-list-price">${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}</span>
                <span className="side-list-change up">+{coin.change24h.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers Card */}
      <div className="side-list-card">
        <div className="side-card-header">
          <span className="side-card-title">Top Losers</span>
          <a href="#losers" className="side-card-more-link" onClick={() => setActiveTab('Top Losers')}>
            More 
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: '2px' }}><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>

        <div className="side-list-container">
          {losers.map((coin, index) => (
            <div className="side-list-row" key={coin.symbol}>
              <div className="side-list-left">
                <span className="side-list-index">{index + 1}</span>
                <div className="side-list-coin">
                  <div className="side-coin-logo" style={{ backgroundColor: coin.logoColor }}>
                    {coin.symbol[0]}
                  </div>
                  <span className="side-coin-name">{coin.name}</span>
                  <span className="side-coin-symbol">{coin.symbol}</span>
                </div>
              </div>
              <div className="side-list-right">
                <span className="side-list-price">${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}</span>
                <span className="side-list-change down">{coin.change24h.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
