import React, { useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FiSearch, FiBarChart2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import { useDebounce } from "../../util/common";
import { Spinner } from "./Spinner";

const TABS = ["All", "Spot", "Futures"];

const SymbolIcon = ({ symbol }) => {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import("../../services/websocket/useSocket").then(({ globalCache }) => {
      const baseAsset = symbol.toUpperCase().replace(/USDT|BUSD|USDC|BTC|ETH|BNB/g, "");
      const cachedCoin = globalCache.marketCoins?.find(
        (c) =>
          c.symbol.toUpperCase() === baseAsset ||
          c.symbol.toUpperCase() === baseAsset + "USDT"
      );
      if (cachedCoin && cachedCoin.name) {
        const fullName = cachedCoin.name.toLowerCase().replace(/\s+/g, "-");
        apiService
          .get(`api/marketStats/${fullName}`)
          .then((res) => {
            if (isMounted && res?.data?.image) {
              setImgUrl(res?.data?.image);
            }
          })
          .catch((err) => console.error("MarketStats fetch error:", err));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [symbol]);

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={symbol}
        style={{ width: "100%", height: "100%", borderRadius: "100%", objectFit: "cover" }}
      />
    );
  }

  return <>{symbol ? symbol.charAt(0).toUpperCase() : "?"}</>;
};

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setCurrencies([]);
      return;
    }

    async function fetchCurrencies() {
      setLoading(true);
      setError(null);
      try {
        const url = debouncedSearch
          ? `api/getCurrencies?symbol=${debouncedSearch}`
          : `api/getCurrencies`;
        const res = await apiService.post(url);
        setCurrencies(res?.data || []);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Failed to fetch symbols");
      } finally {
        setLoading(false);
      }
    }

    fetchCurrencies();
  }, [isOpen, debouncedSearch]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .gsm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3); /* Lighter bg, no blur */
          display: flex;
          align-items: flex-start; /* Align to top */
          justify-content: center;
          padding-top: 75px; /* Offset to appear just below the header/search bar */
          z-index: 9999;
          animation: gsm-fade-in 0.18s ease;
        }

        @keyframes gsm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes gsm-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        .gsm-modal {
          width: 92%;
          max-width: 720px;
          height: 80vh;
          max-height: 760px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08),
            0 32px 80px rgba(0,0,0,0.32),
            0 8px 24px rgba(0,0,0,0.12);
          animation: gsm-slide-up 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* ── Header ── */
        .gsm-header {
          padding: 20px 22px 0;
          border-bottom: 1px solid var(--border-color, #e8eaed);
          background: var(--bg-card, #ffffff);
          flex-shrink: 0;
        }

        .gsm-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .gsm-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gsm-title-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2962ff, #5b8fff);
          box-shadow: 0 0 6px rgba(41,98,255,0.5);
        }

        .gsm-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-main, #131722);
          margin: 0;
        }

        .gsm-close {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          cursor: pointer;
          color: var(--text-muted, #9ba1ab);
          transition: background 0.12s, color 0.12s;
          border: 1px solid transparent;
          background: transparent;
        }
        .gsm-close:hover {
          background: var(--bg-main, #f3f4f6);
          border-color: var(--border-color, #e2e8f0);
          color: var(--text-main, #131722);
        }

        /* ── Search Input ── */
        .gsm-search-wrap {
          position: relative;
          margin-bottom: 14px;
        }

        .gsm-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted, #9ba1ab);
          pointer-events: none;
          display: flex;
          transition: color 0.15s;
        }

        .gsm-search-wrap:focus-within .gsm-search-icon {
          color: #2962ff;
        }

        .gsm-input {
          width: 100%;
          padding: 11px 14px 11px 38px;
          font-size: 13px;
          font-weight: 400;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          background: var(--bg-main, #f7f8fb);
          color: var(--text-main, #131722);
          border: 1.5px solid var(--border-color, #e2e8f0);
          box-sizing: border-box;
        }
        .gsm-input::placeholder {
          color: var(--text-muted, #b0b5be);
        }
        .gsm-input:focus {
          border-color: #2962ff;
          box-shadow: 0 0 0 3.5px rgba(41,98,255,0.12);
          background: var(--bg-card, #ffffff);
        }

        /* ── Tabs ── */
        .gsm-tabs {
          display: flex;
          gap: 0;
        }

        .gsm-tab {
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.02em;
          padding: 9px 16px;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--text-muted, #9ba1ab);
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: color 0.12s, border-color 0.12s;
        }
        .gsm-tab:hover {
          color: var(--text-main, #131722);
        }
        .gsm-tab.active {
          color: #2962ff;
          border-bottom-color: #2962ff;
          font-weight: 600;
        }

        /* ── Column Headers ── */
        .gsm-col-headers {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 22px;
          background: var(--bg-main, #f7f8fb);
          border-bottom: 1px solid var(--border-color, #eef0f3);
          flex-shrink: 0;
        }

        .gsm-col-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-muted, #b0b5be);
        }

        /* ── Results ── */
        .gsm-results {
          flex: 1;
          overflow-y: auto;
          background: var(--bg-card, #ffffff);
          scrollbar-width: thin;
          scrollbar-color: var(--border-color, #e2e8f0) transparent;
        }
        .gsm-results::-webkit-scrollbar { width: 4px; }
        .gsm-results::-webkit-scrollbar-track { background: transparent; }
        .gsm-results::-webkit-scrollbar-thumb {
          background: var(--border-color, #e0e3e8);
          border-radius: 2px;
        }

        /* ── Result Row ── */
        .gsm-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 22px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color, #f3f4f7);
          transition: background 0.1s;
          position: relative;
        }
        .gsm-row:hover {
          background: var(--bg-main, #f7f9fc);
        }
        .gsm-row:last-child {
          border-bottom: none;
        }

        .gsm-row-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .gsm-avatar {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #1a37d4 0%, #2962ff 60%, #4d7fff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.03em;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(41,98,255,0.28);
        }

        .gsm-text-block {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .gsm-symbol-name {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-main, #131722);
          letter-spacing: 0.03em;
          line-height: 1.25;
        }

        .gsm-full-name {
          font-size: 10px;
          color: var(--text-muted, #9ba1ab);
          font-weight: 400;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
        }

        .gsm-row-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .gsm-exchange-pill {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-muted, #b0b5be);
          background: var(--bg-main, #f3f4f6);
          border: 1px solid var(--border-color, #e8eaed);
          border-radius: 5px;
          padding: 3px 7px;
          transition: opacity 0.15s;
        }

        .gsm-chart-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1.5px solid #2962ff;
          background: rgba(41,98,255,0.06);
          color: #2962ff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.14s, color 0.14s, transform 0.12s, box-shadow 0.14s;
          opacity: 0;
          transform: scale(0.8) translateX(4px);
          pointer-events: none;
        }
        .gsm-row:hover .gsm-chart-btn {
          opacity: 1;
          transform: scale(1) translateX(0);
          pointer-events: auto;
        }
        .gsm-row:hover .gsm-exchange-pill {
          opacity: 0;
          pointer-events: none;
        }
        .gsm-chart-btn:hover {
          background: #2962ff;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(41,98,255,0.35);
          transform: scale(1.06);
        }

        /* ── Empty / Error States ── */
        .gsm-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 10px;
          padding: 48px 32px;
        }

        .gsm-state-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: var(--bg-main, #f3f4f6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted, #c4c8d0);
          margin-bottom: 4px;
        }

        .gsm-state-text {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-muted, #9ba1ab);
          text-align: center;
        }

        .gsm-state-sub {
          font-size: 11px;
          color: var(--text-muted, #b5bac4);
          text-align: center;
          max-width: 220px;
          line-height: 1.5;
        }

        .gsm-error-text {
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
        }

        /* ── Footer ── */
        .gsm-footer {
          padding: 9px 22px;
          border-top: 1px solid var(--border-color, #f0f1f4);
          display: flex;
          align-items: center;
          background: var(--bg-main, #f7f8fb);
          flex-shrink: 0;
        }

        .gsm-count-badge {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: var(--text-muted, #9ba1ab);
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 5px;
          padding: 2px 8px;
        }

        .gsm-footer-divider {
          flex: 1;
        }

        .gsm-footer-hint {
          font-size: 10.5px;
          color: var(--text-muted, #c0c4cc);
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="gsm-overlay" onClick={onClose}>
        <div className="gsm-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="gsm-header">
            <div className="gsm-title-row">
              <div className="gsm-title-group">
                <div className="gsm-title-dot" />
                <span className="gsm-title">Symbol Search</span>
              </div>
              <button className="gsm-close" onClick={onClose}>
                <IoCloseSharp size={15} />
              </button>
            </div>

            <div className="gsm-search-wrap">
              <span className="gsm-search-icon">
                <FiSearch size={15} />
              </span>
              <input
                className="gsm-input"
                type="text"
                autoFocus
                placeholder="Search symbol, name, or exchange…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="gsm-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`gsm-tab${activeTab === tab ? " active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>


          {/* Results */}
          <div className="gsm-results">
            {loading ? (
              <div className="gsm-state">
                <Spinner />
              </div>
            ) : error ? (
              <div className="gsm-state">
                <span className="gsm-error-text">{error}</span>
              </div>
            ) : currencies.length > 0 ? (
              currencies.map((curr, idx) => (
                <div
                  key={idx}
                  className="gsm-row"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    navigate(`/candleStick?symbol=${curr?.symbol}`);
                    onClose();
                  }}
                >
                  <div className="gsm-row-left">
                    <div className="gsm-avatar">
                      <SymbolIcon symbol={curr?.symbol} />
                    </div>
                    <div className="gsm-text-block">
                      <span className="gsm-symbol-name">{curr?.symbol}</span>
                      <span className="gsm-full-name text-left">
                        {curr?.name || curr?.base || "Crypto Asset"}
                      </span>
                    </div>
                  </div>

                  <div className="gsm-row-right">
                    <span className="gsm-exchange-pill">Binance</span>
                    <button
                      className="gsm-chart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/candleStick?symbol=${curr?.symbol}`, "_blank");
                        onClose();
                      }}
                      title="Open Chart"
                    >
                      <FiBarChart2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="gsm-state">
                <div className="gsm-state-icon-wrap">
                  <FiSearch size={22} />
                </div>
                <span className="gsm-state-text">No symbols found</span>
                <span className="gsm-state-sub">
                  Try searching by ticker, full name, or exchange
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="gsm-footer">
            {currencies.length > 0 && (
              <span className="gsm-count-badge">{currencies.length} results</span>
            )}
            <div className="gsm-footer-divider" />
            
          </div>

        </div>
      </div>
    </>
  );
};