import React from 'react';

export default function MarketDataHeader({ isSocketConnected }) {
  return (
    <header className="hero-header d-flex justify-content-between align-items-center pb-4">
      <div>
        <h1 className="hero-title text-left">Market Data</h1>
        <p className="hero-subtitle">Real-time market overview and cryptocurrency data</p>
      </div>
      {isSocketConnected && (
        <div className="socket-live-indicator d-flex align-items-center gap-2">
          <span className="live-dot animate-pulse"></span>
          <span style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: '600' }}>
            LIVE STREAMING ACTIVE
          </span>
        </div>
      )}
    </header>
  );
}
