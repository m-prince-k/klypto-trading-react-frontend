import React from 'react';

const ChartAndOrderBook = ({ selectedSymbol, baseSymbol, prices, orderBook, tvlData, tvContainerRef }) => {
  console.log("ChartAndOrderBook orderBook:", orderBook);
  const currentPriceObj = prices[baseSymbol] || prices[selectedSymbol] || {};

  const formatSymbol = (sym) => {
    if (!sym) return '';
    if (sym.endsWith('USDT')) return `${sym.slice(0, -4)}/USDT`;
    if (sym.endsWith('BTC')) return `${sym.slice(0, -3)}/BTC`;
    if (sym.endsWith('ETH')) return `${sym.slice(0, -3)}/ETH`;
    if (sym.endsWith('BUSD')) return `${sym.slice(0, -4)}/BUSD`;
    if (sym.endsWith('USDC')) return `${sym.slice(0, -4)}/USDC`;
    return sym;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.9fr 0.9fr', gap: '12px', marginBottom: '12px' }}>
      
      {/* Card 1: Candlestick chart overview */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Live Market Overview</h4>
          <span className="glow-tag-green">CCXT (BINANCE)</span>
        </div>
        <div style={{ fontSize: '10px', color: '#8f9cae', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--text-main, #ffffff)' }}>{formatSymbol(selectedSymbol)}</span> | 1m | CURRENT PRICE: <span style={{ color: currentPriceObj.isUp ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{currentPriceObj.price ? `$${currentPriceObj.price}` : ''}</span>
        </div>
        {/* Official TradingView Candlestick Chart Widget */}
        <div style={{ width: '100%', height: '460px', background: 'var(--bg-main)', borderRadius: '8px', overflow: 'hidden' }}>
          <div id="tradingview_btc" ref={tvContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      {/* Card 2: Live Order Book */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Order Book</h4>
          <span className="glow-tag-green">BINANCE</span>
        </div>
        <table className="ob-table">
          <thead>
            <tr>
              <th align="left">Price (USDT)</th>
              <th align="right">Size</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Asks (Sell Orders) */}
            {orderBook.asks.map((ask, i) => (
              <tr key={`ask-${i}`} className="ob-ask-row">
                <td align="left">{Number(ask[0]).toFixed(2)}</td>
                <td align="right">{Number(ask[1]).toFixed(4)}</td>
                <td align="right">{(Number(ask[0]) * Number(ask[1])).toFixed(2)}</td>
              </tr>
            ))}
            {/* Live spread divider */}
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <td colSpan="3" align="center" style={{ fontSize: '9px', fontWeight: 'bold', color: '#8f9cae', padding: '4px 0' }}>
                Spread: {orderBook?.spread}
              </td>
            </tr>
            {/* Bids (Buy Orders) */}
            {orderBook.bids.map((bid, i) => (
              <tr key={`bid-${i}`} className="ob-bid-row">
                <td align="left">{Number(bid[0]).toFixed(2)}</td>
                <td align="right">{Number(bid[1]).toFixed(4)}</td>
                <td align="right">{(Number(bid[0]) * Number(bid[1])).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card 3: DefiLlama TVL stacked waves */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Total Value Locked</h4>
          <span className="glow-tag-green">DEFILLAMA</span>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main, #ffffff)' }}>{tvlData?.total}</div>
        <div style={{ fontSize: '9.5px', color: '#10b981', fontWeight: 'bold', marginTop: '-3px' }}>▲ +2.34% (7D growth)</div>

        {/* Rainbow stacked area wave SVG */}
        <div style={{ height: '115px', width: '100%', marginTop: '6px' }}>
          <svg width="100%" height="100%" viewBox="0 0 160 115" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave-grad-eth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wave-grad-tron" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wave-grad-bsc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Layer 1 (BSC) */}
            <path d="M 0,110 Q 40,88 80,98 T 160,90 L 160,115 L 0,115 Z" fill="url(#wave-grad-bsc)" />
            <path d="M 0,110 Q 40,88 80,98 T 160,90" fill="none" stroke="#10b981" strokeWidth="1" />

            {/* Layer 2 (Tron) */}
            <path d="M 0,90 Q 40,65 80,75 T 160,65 L 160,115 L 0,115 Z" fill="url(#wave-grad-tron)" />
            <path d="M 0,90 Q 40,65 80,75 T 160,65" fill="none" stroke="#3b82f6" strokeWidth="1" />

            {/* Layer 3 (Ethereum) */}
            <path d="M 0,65 Q 40,35 80,45 T 160,35 L 160,115 L 0,115 Z" fill="url(#wave-grad-eth)" />
            <path d="M 0,65 Q 40,35 80,45 T 160,35" fill="none" stroke="#6366f1" strokeWidth="1" />
          </svg>
        </div>

        {/* Micro-list for distributions */}
        <div className="tvl-stack-side-list">
          {tvlData?.chains?.map((chain, i) => (
            <div key={`tvl-chain-${i}`} className="tvl-stack-item">
              <div className="tvl-item-label">
                <div className="tvl-item-dot" style={{ backgroundColor: chain?.color }}></div>
                <span>{chain?.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="tvl-item-val">${chain?.val}</span>
                <span className="tvl-item-change">{chain?.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartAndOrderBook;
