import React from 'react';
import { FiTrendingUp, FiGrid, FiDollarSign, FiPercent, FiClock } from 'react-icons/fi';

export default function ArbitrageStats({ stats, lastUpdated }) {
  return (
    <>
      {/* STATS CARDS — ROW 1: Total Opportunities + Cumulative Spread */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="stats-card card border-0">
            <div className="card-body d-flex justify-content-between align-items-start p-4">
              <div className="card-left">
                <span className="stats-title">Total Opportunities</span>
                <h3 className="stats-value">{stats.total}</h3>
                <span className="stats-trend text-success-dark d-flex align-items-center gap-1">
                  <FiTrendingUp /> <span>Live streaming</span>
                </span>
              </div>
              <div className="stats-icon-wrapper bg-soft-blue">
                <FiGrid className="stats-icon icon-blue" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="stats-card card border-0">
            <div className="card-body d-flex justify-content-between align-items-start p-4">
              <div className="card-left">
                <span className="stats-title">Cumulative Spread ($)</span>
                <h3 className="stats-value">${stats.totalSpreadSum.toFixed(4)}</h3>
                <span className="trend-subtext">Across {stats.total} symbols</span>
              </div>
              <div className="stats-icon-wrapper bg-soft-orange">
                <FiTrendingUp className="stats-icon icon-orange" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS — ROW 2: Best Spread $, Best Spread %, Last Updated */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stats-card card border-0">
            <div className="card-body d-flex justify-content-between align-items-start p-4">
              <div className="card-left">
                <span className="stats-title">Best Spread ($)</span>
                <h3 className="stats-value">${stats.bestRs.toFixed(4)}</h3>
                <span className="stats-badge bg-soft-blue-badge badge-blue-text">
                  {stats.bestRsSym}
                </span>
              </div>
              <div className="stats-icon-wrapper bg-soft-green">
                <FiDollarSign className="stats-icon icon-green" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stats-card card border-0">
            <div className="card-body d-flex justify-content-between align-items-start p-4">
              <div className="card-left">
                <span className="stats-title">Best Spread (%)</span>
                <h3 className="stats-value">{stats.bestPct.toFixed(2)}%</h3>
                <span className="stats-badge bg-soft-blue-badge badge-blue-text">
                  {stats.bestPctSym}
                </span>
              </div>
              <div className="stats-icon-wrapper bg-soft-purple">
                <FiPercent className="stats-icon icon-purple" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stats-card card border-0">
            <div className="card-body d-flex justify-content-between align-items-start p-4">
              <div className="card-left">
                <span className="stats-title">Last Updated</span>
                <h3 className="stats-value">{lastUpdated || "Connecting..."}</h3>
                <span className="trend-subtext">Real-time WebSocket Ticks</span>
              </div>
              <div className="stats-icon-wrapper bg-soft-blue">
                <FiClock className="stats-icon icon-blue" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
