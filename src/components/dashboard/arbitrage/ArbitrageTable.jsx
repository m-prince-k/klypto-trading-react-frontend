import React from 'react';
import { FiSearch, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
  return (
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
        <div style={{ maxHeight: "520px", overflowY: "auto", overflowX: "auto" }}>
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
                          onClick={() => alert(`Executing Arbitrage Trade!\n\nBuy: ${opp.quantity} ${opp.instrument} at $${opp.buyPrice.toLocaleString()} on ${opp.buyEx}\nSell: ${opp.quantity} ${opp.instrument} at $${opp.sellPrice.toLocaleString()} on ${opp.sellEx}\n\nProjected Profit: $${opp.spreadRs.toLocaleString()}\nStatus: Order routed to execution engine.`)}
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
  );
}
