import React from 'react';

export default function MarketDataTickerGrid({ marketMetrics, renderSparkline }) {
  return (
    <section className="ticker-grid">
      {/* Total Market Cap */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Market Cap</span>
        </div>
        <div>
          <div className="stat-value">${marketMetrics?.totalMarketCap}T</div>
          <div className={`stat-change ${(marketMetrics?.totalMarketCapChange || 0) >= 0 ? 'up' : 'down'}`}>
            {(marketMetrics?.totalMarketCapChange || 0) >= 0 ? '▲' : '▼'}{Math.abs(marketMetrics?.totalMarketCapChange || 0)}%
          </div>
        </div>
        <div className="stat-chart-container">
          {renderSparkline([2.52, 2.53, 2.51, 2.54, 2.53, 2.55, marketMetrics?.totalMarketCap || 2.55], marketMetrics?.totalMarketCapChange || 0)}
        </div>
      </div>

      {/* 24h Trading Volume */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">24h Trading Volume</span>
        </div>
        <div>
          <div className="stat-value">${marketMetrics?.volume24h}T</div>
          <div className={`stat-change ${(marketMetrics?.volume24hChange || 0) >= 0 ? 'up' : 'down'}`}>
            {(marketMetrics?.volume24hChange || 0) >= 0 ? '▲' : '▼'}{Math.abs(marketMetrics?.volume24hChange || 0)}%
          </div>
        </div>
        <div className="stat-chart-container">
          {renderSparkline([62.5, 64.1, 63.8, 66.2, 65.5, 67.8, marketMetrics?.volume24h || 67.8], marketMetrics?.volume24hChange || 0)}
        </div>
      </div>

      {/* BTC Dominance */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">BTC Dominance</span>
        </div>
        <div>
          <div className="stat-value">{marketMetrics?.btcDominance?.toFixed(2)}%</div>
          <div className={`stat-change ${(marketMetrics?.btcDominanceChange || 0) >= 0 ? 'up' : 'down'}`}>
            {(marketMetrics?.btcDominanceChange || 0) >= 0 ? '▲' : '▼'}{Math.abs(marketMetrics?.btcDominanceChange || 0)}%
          </div>
        </div>
        <div className="stat-chart-container">
          {renderSparkline([51.8, 51.7, 51.9, 51.6, 51.5, 51.3, marketMetrics?.btcDominance || 0], marketMetrics?.btcDominanceChange || 0)}
        </div>
      </div>

      {/* ETH Dominance */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">ETH Dominance</span>
        </div>
        <div>
          <div className="stat-value">{marketMetrics?.ethDominance?.toFixed(2)}%</div>
          <div className={`stat-change ${(marketMetrics?.ethDominanceChange || 0) >= 0 ? 'up' : 'down'}`}>
            {(marketMetrics?.ethDominanceChange || 0) >= 0 ? '▲' : '▼'}{Math.abs(marketMetrics?.ethDominanceChange || 0)}%
          </div>
        </div>
        <div className="stat-chart-container">
          {renderSparkline([16.0, 16.1, 15.9, 16.05, 16.12, 16.15, marketMetrics?.ethDominance || 16.15], marketMetrics?.ethDominanceChange || 0)}
        </div>
      </div>

      {/* Fear & Greed Index */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Fear & Greed Index</span>
        </div>
        <div className="fg-gauge-wrapper">
          <div className="fg-gauge">
            <svg viewBox="0 0 80 40" className="gauge-svg">
              <defs>
                <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f6465d" />
                  <stop offset="50%" stopColor="#f0b90b" />
                  <stop offset="100%" stopColor="#0ecb81" />
                </linearGradient>
              </defs>
              <path d="M 10,38 A 30,30 0 0,1 70,38" fill="none" stroke="#2b3139" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 10,38 A 30,30 0 0,1 70,38" fill="none" stroke="url(#gauge-gradient)" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset={94.2 - (94.2 * (marketMetrics?.fearGreedIndex || 50)) / 100} />
              <line x1="40" y1="38" x2="40" y2="15" stroke="var(--text-main, #131722)" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${-90 + ((marketMetrics?.fearGreedIndex || 50) / 100) * 180}, 40, 38)`} />
              <circle cx="40" cy="38" r="3.5" fill="var(--text-main, #131722)" />
            </svg>
          </div>
          <div className="fg-text-container">
            <span className="fg-value">{marketMetrics?.fearGreedIndex}</span>
            <span className="fg-label">{(marketMetrics?.fearGreedIndex || 50) >= 70 ? 'Greed' : (marketMetrics?.fearGreedIndex || 50) >= 50 ? 'Greed' : 'Neutral'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
