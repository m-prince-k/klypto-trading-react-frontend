import React, { useEffect, useState } from "react";
import WaveletChart from "./WaveletChart";
import RightPanel from "./ui/RightPanel";
import BottomPanel from "./ui/BottomPanel";
import { getWaveletIndicator } from "../../services/apiServices";
import "./WaveletStyles.css";

export default function WaveletDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toolbar icons matching TradingView left panel
  const toolbarIcons = [
    { id: "crosshair", svg: "M3 12h18M12 3v18" },
    { id: "cursor",    svg: "M5 3l14 9-7 1-4 7z" },
    { id: "ruler",     svg: "M3 17l4-4 4 4 4-8 4 4" },
    { id: "text",      svg: "M4 7h16M4 12h16M4 17h10" },
    { id: "fibonacci", svg: "M3 6h18M3 12h12M3 18h6" },
    { id: "pen",       svg: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
    { id: "eraser",    svg: "M20 20H7L3 16l11-11 6 6-1 9zM6.5 17.5l11-11" },
    { id: "magnet",    svg: "M12 22v-5M9 7H5v5a7 7 0 0014 0V7h-4m-4-4v4m0 0H9m3 0h3" },
    { id: "zoom",      svg: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" },
    { id: "settings",  svg: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
    { id: "trash",     svg: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const json = await getWaveletIndicator("BTCUSDT", "1m", 500);
        console.log("=== Full API Response Keys ===", Object.keys(json));
        console.log("=== data.dashboard ===", json.dashboard);
        console.log("=== data.dashboard.summary ===", json.dashboard?.summary);
        if (json.success) {
          setData(json);
        } else {
          setError("Failed to fetch data.");
        }
      } catch (err) {
        console.error("Wavelet Fetch Error:", err);
        setError(err?.message || "Unable to reach the indicator server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="wavelet-splash">
        <div className="wavelet-splash-spinner" />
        <div className="wavelet-splash-text">Loading Wavelet Transform Analysis…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wavelet-splash">
        <div style={{ color: "#ef5350", fontSize: 18, fontWeight: 600 }}>Error Loading Data</div>
        <div style={{ color: "#8a919e", marginTop: 8 }}>{error}</div>
      </div>
    );
  }

  if (!data) return null;

  // Live OHLCV from last candle
  const candles = data?.meta?.candles || [];
  const lastC = candles.length ? candles[candles.length - 1] : null;
  const firstC = candles.length ? candles[0] : null;
  const change = lastC && firstC ? lastC.close - firstC.open : 0;
  const changePct = firstC?.open ? (change / firstC.open) * 100 : 0;
  const isUp = change >= 0;

  return (
    <div className="tv-shell">
      {/* ── TOP NAVIGATION BAR ────────────────────────────────────────── */}
      <div className="tv-top-nav">
        <div className="tv-nav-symbol">
          <span className="tv-symbol-name">BTC/USDT</span>
          <span className="tv-symbol-arrow">▼</span>
        </div>
        <div className="tv-nav-divider" />
        <div className="tv-nav-item">
          <span className="tv-tf-label">1h</span>
          <span className="tv-symbol-arrow">▼</span>
        </div>
        <div className="tv-nav-divider" />
        <div className="tv-nav-item tv-nav-icon" title="Indicators">
          {/* indicators icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 18l4-8 4 4 4-6 4 2" />
          </svg>
        </div>
        <div className="tv-nav-item tv-nav-icon" title="Compare">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
          </svg>
        </div>

        {/* Right-side icons */}
        <div className="tv-nav-right">
          <div className="tv-nav-item tv-nav-icon" title="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <div className="tv-nav-item tv-nav-icon" title="Fullscreen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
          </div>
          <div className="tv-nav-item tv-nav-icon" title="Screenshot">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div className="tv-nav-currency">USDT ▼</div>
        </div>
      </div>

      {/* ── MAIN BODY ─────────────────────────────────────────────────── */}
      <div className="tv-main-layout">
        {/* Left Toolbar */}
        <div className="tv-left-toolbar">
          <div className="tv-tb-group">
            <button className="tv-tb-btn tv-tb-btn--active" title="Cross">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20"/></svg>
            </button>
          </div>
          <div className="tv-tb-separator" />
          <div className="tv-tb-group">
            <button className="tv-tb-btn" title="Trend Line">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 20l18-18"/><circle cx="3" cy="20" r="2" fill="currentColor"/><circle cx="21" cy="2" r="2" fill="currentColor"/></svg>
            </button>
            <button className="tv-tb-btn" title="Horizontal Line">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18"/><circle cx="3" cy="12" r="2" fill="currentColor"/></svg>
            </button>
            <button className="tv-tb-btn" title="Ray">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M18 8l4 4-4 4"/></svg>
            </button>
            <button className="tv-tb-btn" title="Fibonacci">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M3 10h14M3 14h10M3 18h6"/></svg>
            </button>
            <button className="tv-tb-btn" title="Measure">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l18 18M3 21V3M21 21H3"/></svg>
            </button>
          </div>
          <div className="tv-tb-separator" />
          <div className="tv-tb-group">
            <button className="tv-tb-btn" title="Text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M9 12h6M11 17h2M12 4v16"/></svg>
            </button>
            <button className="tv-tb-btn" title="Note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
            </button>
          </div>
          <div className="tv-tb-separator" />
          <div className="tv-tb-group">
            <button className="tv-tb-btn" title="Brush">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button className="tv-tb-btn" title="Highlighter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21l9-9M12 3l9 9-7 7L5 10l7-7z"/></svg>
            </button>
          </div>
          <div className="tv-tb-separator" />
          <div className="tv-tb-group">
            <button className="tv-tb-btn" title="Zoom">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>
            </button>
            <button className="tv-tb-btn" title="Magnet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 5H4a1 1 0 00-1 1v5a9 9 0 0018 0V6a1 1 0 00-1-1h-2M6 5v5a6 6 0 0012 0V5M6 5h12"/></svg>
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <div className="tv-tb-group">
            <button className="tv-tb-btn" title="Delete All">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </div>

        {/* Charts + Right Panel wrapper */}
        <div className="tv-center-area">
          {/* Chart area */}
          <div className="tv-chart-area">
            <WaveletChart data={data} />
          </div>

          {/* Right Panel */}
          <div className="tv-right-panel-area">
            <RightPanel data={data} />
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATS BAR ─────────────────────────────────────────── */}
      <div className="tv-bottom-bar">
        <BottomPanel data={data} />
      </div>
    </div>
  );
}
