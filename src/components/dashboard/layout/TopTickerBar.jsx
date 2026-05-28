import React from 'react';

const TopTickerBar = ({ prices, selectedSymbol }) => {
  const getBaseSymbol = (sym) => {
    if (!sym) return '';
    if (sym.endsWith('USDT')) return sym.slice(0, -4);
    if (sym.endsWith('BUSD')) return sym.slice(0, -4);
    if (sym.endsWith('USDC')) return sym.slice(0, -4);
    if (sym.endsWith('BTC')) return sym.slice(0, -3);
    if (sym.endsWith('ETH')) return sym.slice(0, -3);
    return sym;
  };

  const formatSymbol = (sym) => {
    if (!sym) return '';
    if (sym.endsWith('USDT')) return `${sym.slice(0, -4)}/USDT`;
    if (sym.endsWith('BTC')) return `${sym.slice(0, -3)}/BTC`;
    if (sym.endsWith('ETH')) return `${sym.slice(0, -3)}/ETH`;
    if (sym.endsWith('BUSD')) return `${sym.slice(0, -4)}/BUSD`;
    if (sym.endsWith('USDC')) return `${sym.slice(0, -4)}/USDC`;
    return sym;
  };

  const baseSymbol = getBaseSymbol(selectedSymbol) || 'BTC';
  const isStandard = ['BTC', 'ETH', 'SOL'].includes(baseSymbol);

  const activePriceObj = prices[baseSymbol] || prices[selectedSymbol];

  return (
    <div className="top-tickers-bar">
      {/* Dynamic Selected Active Ticker if not standard */}
      {!isStandard && activePriceObj && (
        <div className="ticker-item active-ticker-highlight" style={{
          background: 'rgba(99, 102, 241, 0.08)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          paddingRight: '12px',
          borderRadius: '4px',
          padding: '2px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          
        }}>
          <span className="ticker-name" style={{ color: '#818cf8', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#a78bfa' }}>★</span> {formatSymbol(selectedSymbol)}
          </span>
          <span className="ticker-val" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 'bold' }}>{activePriceObj.price ? `$${activePriceObj.price}` : ''}</span>
          <span className="ticker-change-pct" style={{ color: activePriceObj.isUp ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{activePriceObj.change || ''}</span>
        </div>
      )}

      <div className="ticker-item">
        <span className="ticker-name">BTC/USDT</span>
        <span className="ticker-val">{prices.BTC?.price ? `$${prices.BTC.price}` : ''}</span>
        <span className="ticker-change-pct" style={{ color: prices.BTC?.isUp ? '#10b981' : '#ef4444' }}>{prices.BTC?.change || ''}</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-name">ETH/USDT</span>
        <span className="ticker-val">{prices.ETH?.price ? `$${prices.ETH.price}` : ''}</span>
        <span className="ticker-change-pct" style={{ color: prices.ETH?.isUp ? '#10b981' : '#ef4444' }}>{prices.ETH?.change || ''}</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-name">SOL/USDT</span>
        <span className="ticker-val">{prices.SOL?.price ? `$${prices.SOL.price}` : ''}</span>
        <span className="ticker-change-pct" style={{ color: prices.SOL?.isUp ? '#10b981' : '#ef4444' }}>{prices.SOL?.change || ''}</span>
      </div>
      <div className="ticker-item" style={{ borderLeft: '1px solid #131826', paddingLeft: '12px' }}>
        <span className="ticker-name" style={{ color: '#a78bfa' }}>TOTAL MARKET CAP</span>
        <span className="ticker-val">{prices.TOTAL_MCAP?.val ? `$${prices.TOTAL_MCAP.val}` : ''}</span>
        <span className="ticker-change-pct" style={{ color: prices.TOTAL_MCAP?.isUp ? '#10b981' : '#ef4444' }}>{prices.TOTAL_MCAP?.change || ''}</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-name" style={{ color: '#a78bfa' }}>24H VOLUME</span>
        <span className="ticker-val">{prices.VOL_24H?.val ? `$${prices.VOL_24H.val}` : ''}</span>
        <span className="ticker-change-pct" style={{ color: prices.VOL_24H?.isUp ? '#10b981' : '#ef4444' }}>{prices.VOL_24H?.change || ''}</span>
      </div>
    </div>
  );
};

export default React.memo(TopTickerBar);
