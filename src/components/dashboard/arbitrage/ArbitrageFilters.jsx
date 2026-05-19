import React from "react";
import { FiFilter, FiRotateCcw } from "react-icons/fi";

export default function ArbitrageFilters({
  exchangeFilter,
  setExchangeFilter,
  segmentFilter,
  setSegmentFilter,
  instrumentFilter,
  setInstrumentFilter,
  minSpreadRs,
  setMinSpreadRs,
  minSpreadPct,
  setMinSpreadPct,
  autoRefresh,
  setAutoRefresh,
  handleResetFilters,
  handleApplyFilters,

}) {
  return (
    <div className="filters-card card border-0 mb-4">
      <div className="card-body p-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-2 col-sm-6">
            <label className="form-label select-label">Exchange / Market</label>
            <select
              className="form-select filter-select"
              value={exchangeFilter}
              onChange={(e) => setExchangeFilter(e.target.value)}
            >
              <option value="All">All Markets</option>
              <option value="Binance Spot">Binance Spot Only</option>
              <option value="Binance Futures">Binance Futures Only</option>
            </select>
          </div>
          <div className="col-md-2 col-sm-6">
            <label className="form-label select-label">Segment</label>
            <select
              className="form-select filter-select"
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
            >
              <option value="All">All Segments</option>
              <option value="SPOT/FUTURES">Spot/Futures</option>
            </select>
          </div>
          <div className="col-md-2 col-sm-6">
            <label className="form-label select-label">Instrument</label>
            <select
              className="form-select filter-select"
              value={instrumentFilter}
              onChange={(e) => setInstrumentFilter(e.target.value)}
            >
              <option value="All">All Coins</option>
              <option value="BTC">BTC Only</option>
              <option value="ETH">ETH Only</option>
              <option value="SOL">SOL Only</option>
            </select>
          </div>
          <div className="col-md-2 col-sm-6">
            <label className="form-label select-label">Min. Spread ($)</label>
            <input
              type="number"
              className="form-control filter-input"
              placeholder="Min spread USD"
              value={minSpreadRs}
              onChange={(e) => setMinSpreadRs(e.target.value)}
            />
          </div>
          <div className="col-md-2 col-sm-6">
            <label className="form-label select-label">Min. Spread (%)</label>
            <input
              type="number"
              step="0.001"
              className="form-control filter-input"
              placeholder="Min spread %"
              value={minSpreadPct}
              onChange={(e) => setMinSpreadPct(e.target.value)}
            />
          </div>
          <div className="col-md-2 col-sm-6 d-flex align-items-center justify-content-between pb-1">
            <div className="auto-refresh-wrapper">
              <span className="auto-refresh-label me-2">Live Stream</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3 pt-2 filter-divider">
          <button
            className="btn btn-reset d-flex align-items-center gap-1"
            onClick={handleResetFilters}
          >
            <FiRotateCcw size={14} /> Reset
          </button>
          <button
            className="btn btn-apply d-flex align-items-center gap-1"
            onClick={handleApplyFilters}
          >
            <FiFilter size={14} /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
