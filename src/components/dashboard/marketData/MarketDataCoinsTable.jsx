import React from 'react';

export default function MarketDataCoinsTable({
  activeTab,
  setActiveTab,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  isMoreOpen,
  setIsMoreOpen,
  additionalCategories,
  visibleCoins,
  flashStates,
  sortConfig,
  handleSort,
  formatCompact,
  renderSparkline,
  displayedCoins,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalPages,
  navigate
}) {
  console.log("MarketDataCoinsTable visibleCoins:", visibleCoins);
  return (
    <div className="main-column">
      {/* Sub Navigation Tabs */}
      <div className="table-tabs-header">
        <div className="tabs-group">
          {['Overview', 'Coins', 'New Listings', 'Top Gainers', 'Top Losers', '24h Volume'].map((tab) => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
              onClick={() => {
                setActiveTab(tab);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Category Filters & Search */}
      <div className="view-options-bar">
        <div className="category-tags">
          {['All', 'Layer 1 / Layer 2', 'DeFi', 'AI', 'Gaming', 'Meme', 'Metaverse', 'Storage'].map((cat) => (
            <button 
              key={cat} 
              className={`tag-btn ${activeCategory === cat ? 'active' : ''}`} 
              onClick={() => {
                setActiveCategory(cat);
                setIsMoreOpen(false);
              }}
            >
              {cat}
            </button>
          ))}

          {/* Interactive More Dropdown */}
          <div className="more-category-container">
            <button 
              className={`tag-btn dropdown-toggle-btn ${additionalCategories.includes(activeCategory) ? 'active' : ''}`} 
              onClick={() => setIsMoreOpen(!isMoreOpen)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {additionalCategories.includes(activeCategory) ? activeCategory : 'More'}
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            {isMoreOpen && (
              <div className="more-category-dropdown">
                {additionalCategories.map((cat) => (
                  <div 
                    key={cat} 
                    className={`more-category-item ${activeCategory === cat ? 'active' : ''}`} 
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsMoreOpen(false);
                    }}
                  >
                    {cat}
                  </div>
                ))}
                {activeCategory !== 'All' && !['All', 'Layer 1 / Layer 2', 'DeFi', 'AI', 'Gaming', 'Meme', 'Metaverse', 'Storage'].includes(activeCategory) && (
                  <div 
                    className="more-category-item reset" 
                    onClick={() => {
                      setActiveCategory('All');
                      setIsMoreOpen(false);
                    }}
                    style={{ borderTop: '1px solid var(--border-color)', color: 'var(--binance-yellow)', padding: '8px 12px' }}
                  >
                    Reset Filter
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="table-filter-search">
          <div className="coin-search-container">
            <svg className="coin-search-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              className="coin-search-input" 
              placeholder="Search Coin" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <button 
            className="btn-filter" 
            onClick={() => { 
              setSearchQuery(''); 
              setActiveCategory('All'); 
              setActiveTab('Coins'); 
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>
        </div>
      </div>

      {/* Coins Table */}
      <div className="coins-table-wrapper">
        <table className="coins-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th className="sortable" onClick={() => handleSort('name')}>Name</th>
              <th className="sortable col-center" onClick={() => handleSort('price')}>Price</th>
              <th className="sortable col-center" onClick={() => handleSort('change24h')}>24h %</th>
              <th className="sortable col-center" onClick={() => handleSort('change7d')}>7d %</th>
              <th className="sortable col-right" onClick={() => handleSort('marketCap')}>Market Cap</th>
              <th className="sortable col-right" onClick={() => handleSort('volume24h')}>Volume(24h)</th>
              <th className="sortable col-right" onClick={() => handleSort('supply')}>Circulating Supply</th>
              <th className="col-center" style={{ width: '100px' }}>Last 7 Days</th>
              <th className="col-center" style={{ width: '60px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {visibleCoins.length > 0 ? (
              visibleCoins.map((coin, index) => {
                const priceFlashKey = `${coin.symbol}-price`;
                const flashClass = flashStates[priceFlashKey] === 'up' ? 'flash-up' : flashStates[priceFlashKey] === 'down' ? 'flash-down' : '';

                return (
                  <tr key={coin.symbol}>
                    <td style={{ color: 'var(--text-secondary)' }}>{index + 1}</td>
                    <td>
                      <div className="coin-name-cell">
                        <div className="coin-symbol-logo" style={{ backgroundColor: coin.logoColor }}>
                          {coin.symbol[0]}
                        </div>
                        <div className="coin-full-name">
                          <span className="coin-name-text">{coin.name}</span>
                          <span className="coin-symbol-text">{coin.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`col-center price-text ${flashClass}`}>
                      ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.price < 1 ? 4 : 2 })}
                    </td>
                    <td className={`col-center percentage-text ${coin.change24h >= 0 ? 'up' : 'down'}`}>
                      {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                    </td>
                    <td className={`col-center percentage-text ${coin.change7d >= 0 ? 'up' : 'down'}`}>
                      {coin.change7d >= 0 ? '▲' : '▼'} {Math.abs(coin.change7d).toFixed(2)}%
                    </td>
                    <td className="col-right">
                      {formatCompact(coin.marketCap)}
                    </td>
                    <td className="col-right">
                      {formatCompact(coin.volume24h)}
                    </td>
                    <td className="col-right" style={{ fontSize: '13px' }}>
                      {coin.supply.toLocaleString()} {coin.symbol}
                    </td>
                    <td className="sparkline-td col-center">
                      {renderSparkline(coin.history, coin.change7d)}
                    </td>
                    <td className="col-center">
                      <button 
                        className="btn-detail-icon" 
                        onClick={() => window.open(`/market/${coin.symbol.toUpperCase()}`, "_blank")} 
                        title={`${coin.name} Details`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                  No coins match the selected filters or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color, #2b313f)' }}>
        
        {/* Left Side: Rows per page selector */}
        <div className="d-flex align-items-center" style={{ gap: '8px', color: 'var(--text-muted, #9ca3af)', fontSize: '13px' }}>
          <span>Rows per page:</span>
          <select 
            className="form-select form-select-sm" 
            style={{ 
              width: '65px', 
              backgroundColor: 'var(--bg-secondary, #1e222d)', 
              color: 'var(--text-main, #d1d4dc)',
              borderColor: 'var(--border-color, #2b313f)'
            }}
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>

        {/* Right Side: Pagination Controls */}
        {totalPages > 1 && (
          <div className="custom-pagination d-flex align-items-center gap-1">
            <button className="pagination-arrow" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
            </button>
            {(() => {
              const pageNumbers = [];
              const maxVisiblePages = 5;
              if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
              } else {
                pageNumbers.push(1);
                if (currentPage > 3) pageNumbers.push('...');
                let startPage = Math.max(2, currentPage - 1);
                let endPage = Math.min(totalPages - 1, currentPage + 1);
                if (currentPage === 1) endPage = 3;
                if (currentPage === totalPages) startPage = totalPages - 2;
                for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
                if (currentPage < totalPages - 2) pageNumbers.push('...');
                pageNumbers.push(totalPages);
              }
              return pageNumbers.map((pageNum, idx) => (
                <button
                  key={idx}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''} ${pageNum === '...' ? 'pagination-ellipsis' : ''}`}
                  disabled={pageNum === '...'}
                  onClick={() => { if (pageNum !== '...') setCurrentPage(pageNum); }}
                >
                  {pageNum}
                </button>
              ));
            })()}
            <button className="pagination-arrow" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
