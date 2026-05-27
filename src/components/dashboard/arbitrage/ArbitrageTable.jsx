import React, { useState } from 'react';
import { FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiX, FiKey, FiLock, FiZap } from 'react-icons/fi';

export default function ArbitrageTable({
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  handleExportCSV,
  handleSort, renderSortIcon,
  paginatedData,
  filteredOpportunities,
  totalPages,
  itemsPerPage,
  getPaginationNumbers,
  priceFlash
}) {
  const [tradeModal, setTradeModal] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const openModal = (opp) => {
    setTradeModal(opp);
    setApiKey('');
    setApiSecret('');
    setSubmitted(false);
    setErrors({});
  };

  const closeModal = () => {
    setTradeModal(null);
    setApiKey('');
    setApiSecret('');
    setSubmitted(false);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!apiKey.trim()) {
      newErrors.apiKey = 'API Key is required.';
    } else if (apiKey.trim().length < 10) {
      newErrors.apiKey = 'API Key must be at least 10 characters.';
    }
    if (!apiSecret.trim()) {
      newErrors.apiSecret = 'API Secret is required.';
    } else if (apiSecret.trim().length < 10) {
      newErrors.apiSecret = 'API Secret must be at least 10 characters.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = {
      symbol: tradeModal.instrument,
      buyExchange: tradeModal.buyEx,
      buyPrice: tradeModal.buyPrice,
      sellExchange: tradeModal.sellEx,
      sellPrice: tradeModal.sellPrice,
      quantity: tradeModal.quantity,
      spread: tradeModal.spreadRs,
      spreadPct: tradeModal.spreadPct,
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
    };
    console.log('[Trade Submit] Payload:', JSON.stringify(payload, null, 2));
    setErrors({});
    setSubmitted(true);
  };

  return (
    <>
      <div className="opportunities-card card border-0">
        <div className="card-header border-0 bg-transparent p-4 d-flex flex-sm-row flex-column justify-content-between align-items-sm-center gap-3">
          <h2 className="table-header-title m-0">Live Arbitrage Opportunities</h2>
          <div className="table-header-actions d-flex gap-2">
            <div className="search-bar-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control table-search-input"
                placeholder="Search coin..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button className="btn btn-export d-flex align-items-center gap-1" onClick={handleExportCSV}>
              <FiDownload size={14} /> Export CSV
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div style={{ overflowX: "auto", overflowY: "visible" }}>
            <table className="arbitrage-table table table-hover mb-0">
              <thead>
                <tr>
                  <th className="th-number">#</th>
                  <th className="cursor-pointer" onClick={() => handleSort('instrument')}>
                    <div className="d-flex align-items-center gap-1">Coin Pair {renderSortIcon('instrument')}</div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('buyEx')}>
                    <div className="d-flex align-items-center gap-1">Buy Exchange {renderSortIcon('buyEx')}</div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('buyPrice')}>
                    <div className="d-flex align-items-center justify-content-end gap-1">Buy Price ($) {renderSortIcon('buyPrice')}</div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('sellEx')}>
                    <div className="d-flex align-items-center gap-1">Sell Exchange {renderSortIcon('sellEx')}</div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('sellPrice')}>
                    <div className="d-flex align-items-center justify-content-end gap-1">Sell Price ($) {renderSortIcon('sellPrice')}</div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('spreadRs')}>
                    <div className="d-flex align-items-center justify-content-end gap-1">Spread ($) {renderSortIcon('spreadRs')}</div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('spreadPct')}>
                    <div className="d-flex align-items-center justify-content-end gap-1">Spread (%) {renderSortIcon('spreadPct')}</div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('quantity')}>
                    <div className="d-flex align-items-center justify-content-end gap-1">Est. Size {renderSortIcon('quantity')}</div>
                  </th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((opp, idx) => {
                    const globalRowIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                    const buyFlashClass = priceFlash[`${opp.id}-buy`] === 'up' ? 'flash-up' : priceFlash[`${opp.id}-buy`] === 'down' ? 'flash-down' : '';
                    const sellFlashClass = priceFlash[`${opp.id}-sell`] === 'up' ? 'flash-up' : priceFlash[`${opp.id}-sell`] === 'down' ? 'flash-down' : '';

                    return (
                      <tr key={opp.id} className="table-row">
                        <td className="td-number">{globalRowIndex}</td>
                        <td className="td-instrument">{opp.instrument}</td>
                        <td>
                          <span className="exchange-badge d-inline-flex align-items-center gap-1">
                            <span className="exchange-dot binance"></span>
                            {opp.buyEx}
                          </span>
                        </td>
                        <td className={`text-end price-cell ${buyFlashClass}`}>
                          ${opp.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td>
                          <span className="exchange-badge d-inline-flex align-items-center gap-1">
                            <span className="exchange-dot delta"></span>
                            {opp.sellEx}
                          </span>
                        </td>
                        <td className={`text-end price-cell ${sellFlashClass}`}>
                          ${opp.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td className="text-end spread-value">
                          ${opp.spreadRs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td className="text-end spread-value">
                          {opp.spreadPct.toFixed(4)}%
                        </td>
                        <td className="text-end">{opp.quantity}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-trade"
                            onClick={() => openModal(opp)}
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-5 empty-state">
                      No arbitrage opportunities matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="card-footer border-0 bg-transparent p-4 d-flex flex-sm-row flex-column justify-content-between align-items-center gap-3">
          <span className="entries-info">
            Showing {filteredOpportunities.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredOpportunities.length)} of {filteredOpportunities.length} entries
          </span>
          {totalPages > 1 && (
            <div className="custom-pagination d-flex align-items-center gap-1">
              <button className="pagination-arrow" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                <FiChevronLeft />
              </button>
              {getPaginationNumbers().map((pageNum, idx) => (
                <button
                  key={idx}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''} ${pageNum === '...' ? 'pagination-ellipsis' : ''}`}
                  disabled={pageNum === '...'}
                  onClick={() => { if (pageNum !== '...') setCurrentPage(pageNum); }}
                >
                  {pageNum}
                </button>
              ))}
              <button className="pagination-arrow" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TRADE MODAL */}
      {tradeModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(6, 8, 15, 0.80)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'var(--bg-card, #121622)',
              border: '1px solid var(--border-color, #1e2a3a)',
              borderRadius: '16px',
              width: '100%', maxWidth: '440px',
              padding: '32px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              position: 'relative',
              animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'var(--bg-hover, rgba(255,255,255,0.06))',
                border: '1px solid var(--border-color, #1e2a3a)',
                borderRadius: '8px', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
              }}
            >
              <FiX size={15} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiZap size={18} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                    Execute Trade
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                    Arbitrage Order
                  </p>
                </div>
              </div>
              {/* Symbol badge */}
              <div style={{
                marginTop: '16px', padding: '12px 16px',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {tradeModal.instrument}
                </span>
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <div>Buy <strong style={{ color: '#10b981' }}>{tradeModal.buyEx}</strong> @ ${tradeModal.buyPrice.toLocaleString()}</div>
                  <div>Sell <strong style={{ color: '#ef4444' }}>{tradeModal.sellEx}</strong> @ ${tradeModal.sellPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                {/* API Key */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    API Key
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiKey size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.apiKey ? '#ef4444' : 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={e => { setApiKey(e.target.value); if (errors.apiKey) setErrors(prev => ({ ...prev, apiKey: '' })); }}
                      style={{
                        width: '100%', padding: '10px 12px 10px 36px',
                        background: 'var(--bg-input, rgba(255,255,255,0.04))',
                        border: `1px solid ${errors.apiKey ? '#ef4444' : 'var(--border-color, #1e2a3a)'}`,
                        borderRadius: '8px', fontSize: '13px',
                        color: 'var(--text-main)', outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = errors.apiKey ? '#ef4444' : '#6366f1'}
                      onBlur={e => e.target.style.borderColor = errors.apiKey ? '#ef4444' : 'var(--border-color, #1e2a3a)'}
                    />
                  </div>
                  {errors.apiKey && (
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.apiKey}</p>
                  )}
                </div>

                {/* API Secret */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    API Secret
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiLock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.apiSecret ? '#ef4444' : 'var(--text-muted)' }} />
                    <input
                      type="password"
                      placeholder="Enter your API secret"
                      value={apiSecret}
                      onChange={e => { setApiSecret(e.target.value); if (errors.apiSecret) setErrors(prev => ({ ...prev, apiSecret: '' })); }}
                      style={{
                        width: '100%', padding: '10px 12px 10px 36px',
                        background: 'var(--bg-input, rgba(255,255,255,0.04))',
                        border: `1px solid ${errors.apiSecret ? '#ef4444' : 'var(--border-color, #1e2a3a)'}`,
                        borderRadius: '8px', fontSize: '13px',
                        color: 'var(--text-main)', outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = errors.apiSecret ? '#ef4444' : '#6366f1'}
                      onBlur={e => e.target.style.borderColor = errors.apiSecret ? '#ef4444' : 'var(--border-color, #1e2a3a)'}
                    />
                  </div>
                  {errors.apiSecret && (
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.apiSecret}</p>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '12px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', borderRadius: '10px',
                    fontSize: '14px', fontWeight: '700', color: '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <FiZap size={15} />
                  Submit Trade
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px',
                }}>✓</div>
                <h4 style={{ color: '#10b981', fontWeight: '700', marginBottom: '6px' }}>Trade Submitted!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 20px' }}>
                  Your order for <strong style={{ color: 'var(--text-main)' }}>{tradeModal.instrument}</strong> has been routed to the execution engine.
                </p>
                <button
                  onClick={closeModal}
                  style={{
                    padding: '10px 28px', borderRadius: '8px',
                    background: 'var(--bg-hover, rgba(255,255,255,0.06))',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { opacity: 0; transform: scale(0.95) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
          `}</style>
        </div>
      )}
    </>
  );
}

