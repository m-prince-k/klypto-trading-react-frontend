import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiSearch, FiChevronLeft, FiTrash2 } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { VscTriangleDown } from "react-icons/vsc";
import socket from "../../services/websocket/socket";
import SocketEvents from "../../services/websocket/socketEvents";
import apiService from "../../services/apiServices";
import { useDebounce } from "../../util/common";
import { useSocket } from "../../services/websocket/useSocket";
import { Spinner } from "react-bootstrap";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

  .wl-panel {
    font-family: 'IBM Plex Sans', sans-serif;
    background: var(--bg-card, #ffffff);
    border-left: 1px solid var(--border-color, #e2e6ee);
    display: flex;
    flex-direction: column;
    height: 100%;
    color: var(--text-main, #2d3748);
    overflow-x: hidden;
  }

  .wl-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 10px;
    border-bottom: 1px solid var(--border-color, #e2e6ee);
    background: var(--bg-card, #ffffff);
  }

  .wl-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8c97ae;
    cursor: pointer;
    user-select: none;
    transition: color 0.15s;
  }

  .wl-title:hover {
    color: var(--text-main, #2d3748);
  }

  .wl-title svg {
    opacity: 0.6;
  }

  .wl-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .wl-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: #8c97ae;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    padding: 0;
  }

  .wl-icon-btn:hover {
    background: var(--bg-card-hover, #f0f2f7);
    color: var(--text-main, #2d3748);
  }

  .wl-icon-btn.add:hover {
    background: rgba(41, 98, 255, 0.08);
    color: #2962ff;
  }

  .wl-icon-btn.close:hover {
    background: rgba(242, 54, 69, 0.08);
    color: #f23645;
  }

  .wl-col-header {
    display: flex;
    align-items: center;
    padding: 6px 14px;
    border-bottom: 1px solid var(--border-color, #e2e6ee);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #b0bac9;
    background: var(--bg-main, #f7f8fb);
  }

  .wl-list {
    overflow-y: auto;
    flex: 1;
    scrollbar-width: thin;
    scrollbar-color: #dde1eb transparent;
  }

  .wl-list::-webkit-scrollbar {
    width: 4px;
  }

  .wl-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .wl-list::-webkit-scrollbar-thumb {
    background: #dde1eb;
    border-radius: 2px;
  }

  .wl-row {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: background 0.1s, border-color 0.1s;
    position: relative;
  }

  .wl-row:hover {
    background: var(--bg-card-hover, #f7f8fb);
  }

  .wl-row.active {
    background: var(--bg-main, #f0f4ff);
    border-left-color: #2962ff;
  }

  .wl-row::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 14px;
    right: 14px;
    height: 1px;
    background: var(--border-color, #e2e6ee);
    opacity: 0.7;
  }

  .wl-symbol {
    flex: 1.5;
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
  }

  .wl-symbol-name {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-main, #1a202c);
    letter-spacing: 0.03em;
  }

  .wl-symbol-label {
    font-size: 10px;
    color: #b0bac9;
    font-weight: 400;
  }

  .wl-price {
    flex: 1.5;
    text-align: right;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .wl-change {
    flex: 1.5;
    text-align: right;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 500;
  }

  .wl-changepct {
    flex: 1.5;
    text-align: right;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .wl-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 5px;
    border-radius: 3px;
    letter-spacing: 0.02em;
  }

  .wl-badge.up {
    background: rgba(8, 153, 129, 0.1);
    color: #0a7c67;
  }

  .wl-badge.down {
    background: rgba(242, 54, 69, 0.09);
    color: #d12b3a;
  }

  .wl-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 10px;
    color: #b0bac9;
  }

  .wl-empty-icon {
    width: 36px;
    height: 36px;
    border: 1.5px dashed #dde1eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #c5cad6;
  }

  .wl-empty-text {
    font-size: 12px;
    text-align: center;
    line-height: 1.6;
    color: #b0bac9;
  }

  .wl-footer {
    padding: 8px 14px;
    border-top: 1px solid var(--border-color, #e2e6ee);
    background: var(--bg-main, #f7f8fb);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .wl-count {
    font-size: 10px;
    color: #b0bac9;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .wl-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #089981;
    box-shadow: 0 0 5px rgba(8, 153, 129, 0.5);
    animation: wl-pulse 2s infinite;
  }

  @keyframes wl-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .wl-flash-up { animation: wlFlashUp 0.4s ease-out; }
  .wl-flash-down { animation: wlFlashDown 0.4s ease-out; }

  @keyframes wlFlashUp {
    0% { background: rgba(8, 153, 129, 0.15); }
    100% { background: transparent; }
  }

  @keyframes wlFlashDown {
    0% { background: rgba(242, 54, 69, 0.1); }
    100% { background: transparent; }
  }

  /* ── Loading ── */
  .wl-loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 14px;
    padding: 32px 20px;
  }

  .wl-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color, #e2e6ee);
    border-top-color: #2962ff;
    border-radius: 50%;
    animation: wl-spin 0.7s linear infinite;
  }

  @keyframes wl-spin { to { transform: rotate(360deg); } }

  .wl-loading-text {
    font-size: 11px;
    color: #b0bac9;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .wl-skeleton-rows {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .wl-skeleton-row {
    display: flex;
    align-items: center;
    padding: 9px 14px;
    gap: 8px;
  }

  .wl-skel {
    background: linear-gradient(90deg, #f0f2f7 25%, #e8eaf0 50%, #f0f2f7 75%);
    background-size: 200% 100%;
    animation: wl-shimmer 1.4s infinite;
    border-radius: 4px;
    flex-shrink: 0;
  }

  @keyframes wl-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Add mode search bar ── */
  .wl-search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 12px;
    padding: 6px 10px;
    background: var(--bg-main, #f7f8fb);
    border: 1px solid var(--border-color, #e2e6ee);
    border-radius: 6px;
    transition: border-color 0.15s, background 0.15s;
  }

  .wl-search-bar:focus-within {
    border-color: #2962ff;
    background: var(--bg-card, #ffffff);
  }

  .wl-search-bar svg { color: #b0bac9; flex-shrink: 0; }

  .wl-search-input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 12px;
    font-family: 'IBM Plex Sans', sans-serif;
    color: var(--text-main, #2d3748);
    width: 100%;
  }

  .wl-search-input::placeholder { color: #b0bac9; }
`;

export default function WatchlistPanel({
  onClose,
  activeCurrency,
  setActiveCurrency,
}) {
  // null = still loading, [] = loaded but empty, [...] = has data
  const [watchlist, setWatchlist] = useState(null);

  // Local Filtering Search State
  const [search, setSearch] = useState("");

  // Adding Mode States (Search all currencies)
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [searchAll, setSearchAll] = useState("");
  const debouncedSearchAll = useDebounce(searchAll, 500);
  const [currencies, setCurrencies] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  // Price Tick Flash Animation States
  const [flashMap, setFlashMap] = useState({});
  const prevPrices = useRef({});

  // 1. WebSocket Live Ticks & Watchlist Baseline
  const handleWatchlistResponse = (res) => {
    // console.log("[WatchlistPanel] WATCHLIST_RESPONSE:", res);
    if (res && Array.isArray(res.data)) {
      const normalizedData = res.data.map(item => ({
        ...item,
        lastPrice: item.lastPrice ?? item.price ?? 0,
        change: item.change ?? 0,
        changePercent: item.changePercent ?? item.changePct ?? 0,
        volume: item.volume ?? item.vol ?? 0,
      }));
      setWatchlist(normalizedData);
    } else {
      setWatchlist([]);
    }
  };

  const handleWatchlistUpdate = (tick) => {
    // console.log("[WatchlistPanel] WATCHLIST_UPDATE tick:", tick);
    if (!tick || !tick.symbol) return;

    const normalized = {
      ...tick,
      lastPrice: tick.price ?? tick.lastPrice,
      change: tick.change,
      changePercent: tick.changePct ?? tick.changePercent,
      volume: tick.volume ?? tick.vol,
    };

    setWatchlist((prev) => {
      if (!prev) return prev;
      const index = prev.findIndex(
        (item) => item.symbol === normalized.symbol,
      );
      if (index !== -1) {
        const oldPrice = prevPrices.current[normalized.symbol];
        const newPrice = normalized.lastPrice;

        if (oldPrice !== undefined && newPrice !== oldPrice) {
          const direction = newPrice > oldPrice ? "up" : "down";
          setFlashMap((f) => ({ ...f, [normalized.symbol]: direction }));
          setTimeout(() => {
            setFlashMap((f) => {
              const copy = { ...f };
              delete copy[normalized.symbol];
              return copy;
            });
          }, 450);
        }

        prevPrices.current[normalized.symbol] = newPrice;

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          ...Object.fromEntries(
            Object.entries(normalized).filter(([_, v]) => v !== undefined && v !== null)
          )
        };
        return updated;
      }
      return prev;
    });
  };

  useSocket({ handleWatchlistResponse, handleWatchlistUpdate });

  useEffect(() => {
    socket.emit("get-watchlist");
  }, []);

  // 2. Fetch all matching symbols from the backend when in Add Mode
  useEffect(() => {
    if (!isAddingMode) return;

    async function fetchCurrencies() {
      setLoadingAll(true);
      try {
        const url = debouncedSearchAll
          ? `api/getCurrencies?symbol=${debouncedSearchAll}`
          : `api/getCurrencies`;
        const res = await apiService.post(url);
        setCurrencies(res.data || []);
      } catch (err) {
        console.error("Failed to query active currencies:", err);
      } finally {
        setLoadingAll(false);
      }
    }
    fetchCurrencies();
  }, [debouncedSearchAll, isAddingMode]);

  // 3. Toggle a symbol in the watchlist
  const toggleCurrency = (currency) => {
    const isAdded = watchlist?.some((w) => w.symbol === currency.symbol);
    if (isAdded) {
      setWatchlist((prev) => prev.filter((w) => w.symbol !== currency.symbol));
    } else {
      const newItem = {
        symbol: currency.symbol,
        lastPrice: currency.price || 0,
        change: 0,
        changePercent: 0,
      };
      setWatchlist((prev) => [...(prev || []), newItem]);
    }
  };

  // Dynamic precision formatter
  const fmt = (v) => {
    if (typeof v !== "number") return v;
    if (v === 0) return "0.00";
    const abs = Math.abs(v);
    if (abs >= 1000) return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (abs >= 1) return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    if (abs >= 0.01) return v.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    return v.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 });
  };

  const isLoading = watchlist === null;

  // Local Filtered Active Watchlist
  const filteredActive = (watchlist || []).filter((item) =>
    item.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <style>{styles}</style>
      <div className="wl-panel">
        {/* --- VIEW A: ADDING MODE (SEARCH ALL SYMBOLS IN EXCHANGE) --- */}
        {isAddingMode ? (
          <>
            {/* Header */}
            <div className="wl-header">
              <div
                className="wl-title"
                onClick={() => setIsAddingMode(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  textTransform: "none",
                  color: "var(--text-main, #1a202c)",
                }}
              >
                <FiChevronLeft size={16} />
                <span style={{ fontWeight: "600" }}>Add Symbols</span>
              </div>
              <div className="wl-actions">
                <button
                  className="wl-icon-btn close"
                  onClick={() => setIsAddingMode(false)}
                  title="Back"
                >
                  <IoMdClose size={14} />
                </button>
              </div>
            </div>

            {/* Search bar for add mode */}
            <div className="wl-search-bar">
              <FiSearch size={12} />
              <input
                className="wl-search-input"
                placeholder="Search exchange symbols..."
                value={searchAll}
                onChange={(e) => setSearchAll(e.target.value)}
                autoFocus
              />
              {searchAll && (
                <IoMdClose
                  size={12}
                  style={{ cursor: "pointer", color: "#b0bac9" }}
                  onClick={() => setSearchAll("")}
                />
              )}
            </div>

            {/* List Exchange Currencies */}
            <div className="wl-list">
              {loadingAll ? (
                <div className="wl-loading-wrap">
                  <div className="wl-spinner" />
                  <span className="wl-loading-text">Searching symbols...</span>
                </div>
              ) : (
                <>
                  {currencies.map((curr) => {
                    const isAdded = watchlist?.some(
                      (w) => w.symbol === curr.symbol,
                    );
                    return (
                      <div
                        key={curr.symbol}
                        className="wl-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderLeft: "none",
                        }}
                      >
                        <div className="wl-symbol">
                          <span className="wl-symbol-name">{curr.symbol}</span>
                          {/* <span className="wl-symbol-label">
                            {curr.name || curr.symbol}
                          </span> */}
                        </div>
                        <div>
                          <button
                            className="wl-icon-btn"
                            style={{
                              backgroundColor: isAdded
                                ? "rgba(242, 54, 69, 0.08)"
                                : "rgba(41, 98, 255, 0.08)",
                              color: isAdded ? "#f23645" : "#2962ff",
                              width: "28px",
                              height: "28px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "none",
                              cursor: "pointer",
                            }}
                            onClick={() => toggleCurrency(curr)}
                          >
                            {isAdded ? (
                              <FiTrash2 size={13} />
                            ) : (
                              <FiPlus size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {currencies.length === 0 && (
                    <div className="wl-empty">
                      <div className="wl-empty-icon">
                        <FiSearch size={14} />
                      </div>
                      <div className="wl-empty-text">
                        {searchAll
                          ? `No symbols matching "${searchAll}"`
                          : "Type to search symbols..."}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="wl-footer">
              <span className="wl-count">{currencies.length} found</span>
              <button
                className="btn btn-xs btn-primary py-0.5 px-2"
                style={{ fontSize: "10px", borderRadius: "4px" }}
                onClick={() => setIsAddingMode(false)}
              >
                Done
              </button>
            </div>
          </>
        ) : (
          /* --- VIEW B: STANDARD WATCHLIST VIEW --- */
          <>
            {/* Header */}
            <div className="wl-header">
              <div className="wl-title">
                Watchlist
                <VscTriangleDown size={10} />
              </div>
              <div className="wl-actions">
                <button
                  className="wl-icon-btn add"
                  onClick={() => {
                    setIsAddingMode(true);
                    setSearchAll("");
                  }}
                  title="Add symbol"
                >
                  <FiPlus size={14} />
                </button>
                <button
                  className="wl-icon-btn close"
                  onClick={onClose}
                  title="Close"
                >
                  <IoMdClose size={14} />
                </button>
              </div>
            </div>

            {/* Search filter for active list — unchanged (was empty comment in original) */}

            {/* Column Headers — hidden during loading */}
            {!isLoading && (
              <div className="wl-col-header">
                <div style={{ flex: "1.5", textAlign: "left" }}>Symbol</div>
                <div style={{ flex: "1.5", textAlign: "center" }}>Last</div>
                <div style={{ flex: "1.5", textAlign: "center" }}>Chg</div>
                <div style={{ flex: "1.1", textAlign: "center" }}>Chg%</div>
                {/* <div style={{ flex: "1.1", textAlign: "right" }}>Vol  </div> */}
              </div>
            )}

            {/* List Active Items */}
            <div className="wl-list">

              {/* ── Loading: spinner + shimmer skeleton rows ── */}
              {isLoading && (
                <div className="wl-loading-wrap">
                  <Spinner />
                  <div className="wl-skeleton-rows">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div className="wl-skeleton-row" key={i}>
                        <div className="wl-skel" style={{ width: "56px", height: "12px" }} />
                        <div style={{ flex: 1 }} />
                        <div className="wl-skel" style={{ width: "56px", height: "12px" }} />
                        <div style={{ width: "8px" }} />
                        <div className="wl-skel" style={{ width: "56px", height: "12px" }} />
                        <div style={{ width: "8px" }} />
                        <div className="wl-skel" style={{ width: "56px", height: "20px", borderRadius: "3px" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Data rows ── */}
              {!isLoading && filteredActive.map((item) => {
                const isUp = item.change >= 0;
                const isActive = activeCurrency === item.symbol;
                const color = isUp ? "#089981" : "#f23645";
                const flash = flashMap[item.symbol];
                const flashClass =
                  flash === "up"
                    ? "wl-flash-up"
                    : flash === "down"
                      ? "wl-flash-down"
                      : "";

                return (
                  <div
                    key={item.symbol}
                    className={`wl-row ${isActive ? "active" : ""} ${flashClass}`}
                    onClick={() => setActiveCurrency(item.symbol)}
                  >
                    <div className="wl-symbol">
                      <span className="wl-symbol-name">{item.symbol}</span>
                      {/* <span className="wl-symbol-label">
                        {SYMBOL_LABELS[item.symbol] || ""}
                      </span> */}
                    </div>

                    <div className="wl-price" style={{ color }}>
                      {item.lastPrice !== undefined && item.lastPrice !== null ? (
                        fmt(item.lastPrice)
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="wl-change" style={{ color }}>
                      {item.change !== undefined && item.change !== null ? (
                        `${item.change >= 0 ? "+" : ""}${fmt(item.change)}`
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="wl-changepct">
                      <span className={`wl-badge ${isUp ? "up" : "down"}`}>
                        {item.changePercent !== undefined && item.changePercent !== null
                          ? `${item.changePercent >= 0 ? "+" : ""}${fmt(item.changePercent)}%`
                          : ""}
                      </span>
                    </div>

                    {/* <div style={{
                      flex: "1.5",
                      textAlign: "right",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "11px",
                      fontWeight: "500",
                      color: "#8c97ae",
                    }}>
                      {item.volume !== undefined && item.volume !== null
                        ? fmt(item.volume)
                        : ""}
                    </div> */}
                  </div>
                );
              })}

              {/* ── Empty state ── */}
              {!isLoading && filteredActive.length === 0 && (
                <div className="wl-empty">
                  <div className="wl-empty-icon">+</div>
                  <div className="wl-empty-text">
                    {search
                      ? `No results for "${search}"`
                      : "Watchlist is empty.\nClick + to add symbols."}
                  </div>
                </div>
              )}
            </div>

            {/* Footer — hidden during loading */}
            {!isLoading && (
              <div className="wl-footer">
                <span className="wl-count">{watchlist?.length ?? 0} symbols</span>
                <div className="wl-dot" title="Live" />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}