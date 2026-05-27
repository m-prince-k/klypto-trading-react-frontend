import React, { useState, useMemo } from 'react';

export default function MarketDataSideColumn({
  chartTimeframe,
  setChartTimeframe,
  marketMetrics,
  renderOverviewChart,
  gainers,
  losers,
  coins,
  setActiveTab
}) {
  const [modalType, setModalType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fullGainers = useMemo(() => {
    if (!coins) return [];
    return [...coins].sort((a, b) => b.change24h - a.change24h);
  }, [coins]);

  const fullLosers = useMemo(() => {
    if (!coins) return [];
    return [...coins].sort((a, b) => a.change24h - b.change24h);
  }, [coins]);

  const modalData = useMemo(() => {
    let data = modalType === 'gainers' ? fullGainers : modalType === 'losers' ? fullLosers : [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    return data;
  }, [modalType, fullGainers, fullLosers, searchQuery]);
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
          {marketMetrics ? (
            <>
              <div className="overview-meta-value">${marketMetrics.totalMarketCap}T</div>
              <div className={`overview-meta-change ${marketMetrics.totalMarketCapChange >= 0 ? 'up' : 'down'}`}>
                {marketMetrics.totalMarketCapChange >= 0 ? '▲' : '▼'} {Math.abs(marketMetrics.totalMarketCapChange).toFixed(2)}%
              </div>
            </>
          ) : (
            <div className="overview-meta-value" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading…</div>
          )}
        </div>

        <div className="main-chart-wrapper">
          {renderOverviewChart(chartTimeframe)}
        </div>
      </div>

      {/* Top Gainers Card */}
      <div className="side-list-card">
        <div className="side-card-header">
          <span className="side-card-title">Top Gainers</span>
          <a href="#gainers" className="side-card-more-link" onClick={(e) => { e.preventDefault(); setModalType('gainers'); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            View More 
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>

        <div className="side-list-container">
          {(gainers || []).map((coin, index) => (
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
                <span className="side-list-price">${Number(coin.price).toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}</span>
                <span className="side-list-change up">+{Number(coin.change24h).toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers Card */}
      <div className="side-list-card">
        <div className="side-card-header">
          <span className="side-card-title">Top Losers</span>
          <a href="#losers" className="side-card-more-link" onClick={(e) => { e.preventDefault(); setModalType('losers'); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            View More 
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>

        <div className="side-list-container">
          {(losers || []).map((coin, index) => (
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
                <span className="side-list-price">${Number(coin.price).toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}</span>
                <span className="side-list-change down">{Number(coin.change24h).toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for View All */}
      {modalType && (
        <div className="modal-overlay" onClick={() => { setModalType(null); setSearchQuery(''); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, backgroundColor: "rgba(0,0,0,0.6)", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content premium-card" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', backgroundColor: "var(--bg-main, #1e293b)", color: "var(--text-main, #fff)", borderRadius: '12px', overflow: 'hidden' }}>
                <div className="modal-header" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid var(--border-color, #334155)" }}>
                    <h2 className="modal-title" style={{ margin: 0, fontSize: '16px', color: "var(--text-main, #fff)" }}>
                        {modalType === 'gainers' ? 'Top Gainers' : 'Top Losers'} ({modalData.length})
                    </h2>
                    <button className="modal-close" onClick={() => { setModalType(null); setSearchQuery(''); }} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: "var(--text-muted, #9ca3af)" }}>&times;</button>
                </div>
                <div className="modal-body" style={{ padding: '16px 20px', overflowY: 'auto' }}>
                    <input
                        type="text"
                        className="modal-search"
                        placeholder="Search coins..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', marginBottom: '16px', backgroundColor: 'var(--bg-card, #0b0f19)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {modalData.map((coin, index) => (
                            <div className="side-list-row" key={coin.symbol} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                              <div className="side-list-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="side-list-index" style={{ width: '20px', textAlign: 'right' }}>{index + 1}</span>
                                <div className="side-list-coin" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div className="side-coin-logo" style={{ backgroundColor: coin.logoColor, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                                    {coin.symbol[0]}
                                  </div>
                                  <span className="side-coin-name" style={{ fontWeight: '600' }}>{coin.name}</span>
                                  <span className="side-coin-symbol" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{coin.symbol}</span>
                                </div>
                              </div>
                              <div className="side-list-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                <span className="side-list-price" style={{ fontWeight: 'bold' }}>${Number(coin.price).toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}</span>
                                <span className={`side-list-change ${coin.change24h >= 0 ? 'up' : 'down'}`} style={{ fontSize: '12px', color: coin.change24h >= 0 ? '#10b981' : '#ef4444' }}>
                                  {coin.change24h >= 0 ? '+' : ''}{Number(coin.change24h).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                        ))}
                        {modalData.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No coins found.</div>}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
