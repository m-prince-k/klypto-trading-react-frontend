import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiChevronLeft, FiTrash2, FiStar, FiBarChart2 } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { VscTriangleDown } from "react-icons/vsc";
import apiService from "../../../services/apiServices";
import { useDebounce } from "../../../util/common";
import { Spinner } from "../../../components/tradingModals/Spinner";
import { useSocket, globalCache } from "../../../services/websocket/useSocket";
import "./Watchlist.css";

const CoinIdentity = ({ symbolItem, isFutures = false }) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [coinName, setCoinName] = useState(null);

  const getBaseAsset = (sym) => {
    let s = sym.toUpperCase();
    if (s.endsWith('USDT')) return s.slice(0, -4);
    if (s.endsWith('BUSD')) return s.slice(0, -4);
    if (s.endsWith('USDC')) return s.slice(0, -4);
    if (s.endsWith('BTC')) return s.slice(0, -3);
    if (s.endsWith('ETH')) return s.slice(0, -3);
    if (s.endsWith('BNB')) return s.slice(0, -3);
    return s;
  };

  const baseAsset = getBaseAsset(symbolItem);

  useEffect(() => {
    let isMounted = true;
    import('../../../services/websocket/useSocket').then(({ globalCache }) => {
      const cachedCoin = globalCache.marketCoins?.find(
        c => c.symbol.toUpperCase() === baseAsset.toUpperCase() || c.symbol.toUpperCase() === baseAsset.toUpperCase() + 'USDT'
      );
      if (cachedCoin) {
        if (isMounted) setCoinName(cachedCoin.name);
        const fullName = cachedCoin.name.toLowerCase().replace(/\s+/g, '-');
        apiService.get(`api/marketStats/${fullName}`).then(res => {
           if (isMounted && res?.data?.image) {
             setImgUrl(res?.data?.image);
           }
           if (isMounted && res?.data?.coin) {
             setCoinName(res?.data?.coin);
           }
        }).catch(err => console.error("MarketStats fetch error:", err));
      }
    });
    return () => { isMounted = false; };
  }, [baseAsset]);

  const fallbackColor = getColor(baseAsset);
  const fallbackLetter = getIcon(baseAsset);

  const iconElement = imgUrl ? (
    <img src={imgUrl} alt={baseAsset} style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0 }} />
  ) : (
    <div className="futures-icon" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: fallbackColor, flexShrink: 0 }}>{fallbackLetter}</div>
  );

  if (isFutures) {
    return iconElement;
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "flex-start" }}>
      <div style={{ width: "36px", display: "flex", alignItems: "center", flexShrink: 0 }}>
        {iconElement}
      </div>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px" }}>
        <span className="wl-symbol-name" style={{ lineHeight: 1, textAlign: "left" }}>{symbolItem}</span>
        {coinName && (
          <span style={{ fontSize: "10px", color: "#8c97ae", background: "rgba(140, 151, 174, 0.1)", padding: "2px 5px", borderRadius: "4px", fontWeight: "600", letterSpacing: "0.02em", lineHeight: 1 }}>
            {coinName}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Futures helpers ────────────────────────────────────────────────
const formatVolume = (numStr) => {
  const num = parseFloat(numStr);
  if (isNaN(num)) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
};

const formatPrice = (numStr) => {
  const num = parseFloat(numStr);
  if (isNaN(num)) return "0.00";
  const maxDec = num < 1 ? 4 : 2;
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: maxDec });
};

const formatChange = (numStr) => {
  const num = parseFloat(numStr);
  if (isNaN(num)) return "0.00%";
  return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
};

const getIcon = (asset) => {
  if (!asset) return "C";
  if (asset === "BTC") return "₿";
  if (asset === "ETH") return "⧫";
  return asset.charAt(0).toUpperCase();
};

const getColor = (asset) => {
  if (asset === "BTC") return "#F7931A";
  if (asset === "ETH") return "#627EEA";
  if (asset === "SOL") return "#14F195";
  if (asset === "BNB") return "#F3BA2F";
  const colors = ["#F7931A", "#627EEA", "#14F195", "#F3BA2F", "#0ECB81", "#5C8CFF", "#FF5C5C", "#A25CFF"];
  let hash = 0;
  if (asset) for (let i = 0; i < asset.length; i++) hash = asset.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// ── Dynamic precision formatter ───────────────────────────────────
const fmt = (v) => {
  if (typeof v !== "number") return v;
  if (v === 0) return "0.00";
  const abs = Math.abs(v);
  if (abs >= 1000) return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (abs >= 1)    return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (abs >= 0.01) return v.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  return v.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 });
};

export default function Watchlist({ activeCurrency, setActiveCurrency }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("watchlist");

  // ── Watchlist state ───────────────────────────────────────────────
  const [watchlist, setWatchlist]     = useState(null); // null = loading
  const [search, setSearch]           = useState("");
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [searchAll, setSearchAll]     = useState("");
  const debouncedSearchAll            = useDebounce(searchAll, 500);
  const [currencies, setCurrencies]   = useState([]);
  const [loadingAll, setLoadingAll]   = useState(false);
  const [flashMap, setFlashMap]       = useState({});
  const prevPrices                    = useRef({});
  const [watchlistLimit, setWatchlistLimit] = useState(10);

  // Reset limit when search changes
  useEffect(() => {
    setWatchlistLimit(10);
  }, [search]);

  // ── Futures state ─────────────────────────────────────────────────
  const [futuresData, setFuturesData]     = useState([]);
  const [futuresLoading, setFuturesLoading] = useState(true);
  const [futuresError, setFuturesError]   = useState(null);
  const [futuresSearch, setFuturesSearch] = useState("");
  const [futuresSort, setFuturesSort]     = useState({ key: "quoteVolume24h", dir: "desc" });
  const [futuresLimit, setFuturesLimit]   = useState(10);

  useEffect(() => {
    setFuturesLimit(10);
  }, [futuresSearch]);

  const handleFuturesTickerUpdate = (updates) => {
    const map = {};
    if (Array.isArray(updates)) updates.forEach(u => { if (u?.symbol) map[u.symbol.toUpperCase()] = u; });

    setFuturesData(prev => {
      if (!prev?.length) return prev;
      let changed = false;
      const next = prev.map(row => {
        const sym = row.symbol?.toUpperCase() || "";
        if (map[sym]) {
          changed = true;
          const upd = map[sym];
          let flashClass = "";
          if (row.lastPrice && upd.lastPrice) {
            const op = parseFloat(row.lastPrice), np = parseFloat(upd.lastPrice);
            if (np > op) flashClass = "flash-up";
            else if (np < op) flashClass = "flash-down";
          }
          return { ...row, ...upd, flashClass };
        }
        if (row.flashClass) { changed = true; return { ...row, flashClass: "" }; }
        return row;
      });
      return changed ? next : prev;
    });
  };

  useSocket({
    setWatchlist: (data) => {
      if (!data) return;
      if (Array.isArray(data)) {
        setWatchlist(data.map(item => ({
          ...item,
          lastPrice:     item.lastPrice     ?? item.price        ?? 0,
          change:        item.change        ?? 0,
          changePercent: item.changePercent ?? item.changePct    ?? 0,
          volume:        item.volume        ?? item.vol          ?? 0,
        })));
      } else {
        const tick = data;
        if (!tick || !tick.symbol) return;
        const normalized = {
          ...tick,
          lastPrice:     tick.price     ?? tick.lastPrice,
          change:        tick.change,
          changePercent: tick.changePct  ?? tick.changePercent,
          volume:        tick.volume     ?? tick.vol,
        };

        setWatchlist((prev) => {
          if (!prev) return prev;
          const idx = prev.findIndex(i => i.symbol === normalized.symbol);
          if (idx === -1) return prev;

          const oldPrice = prevPrices.current[normalized.symbol];
          const newPrice = normalized.lastPrice;
          if (oldPrice !== undefined && newPrice !== oldPrice) {
            const dir = newPrice > oldPrice ? "up" : "down";
            setFlashMap(f => ({ ...f, [normalized.symbol]: dir }));
            setTimeout(() => setFlashMap(f => { const c = { ...f }; delete c[normalized.symbol]; return c; }), 450);
          }
          prevPrices.current[normalized.symbol] = newPrice;

          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            ...Object.fromEntries(Object.entries(normalized).filter(([, v]) => v !== undefined && v !== null))
          };
          return updated;
        });
      }
    },
    setFuturesData,
    setFuturesLoading,
    setFuturesError,
    handleFuturesTickerUpdate,
  });

  // ── Add-mode currency search ──────────────────────────────────────
  useEffect(() => {
    if (!isAddingMode) return;
    async function fetchCurrencies() {
      setLoadingAll(true);
      try {
        const url = debouncedSearchAll ? `api/getCurrencies?symbol=${debouncedSearchAll}` : `api/getCurrencies`;
        const res = await apiService.post(url);
        setCurrencies(res?.data || []);
      } catch (err) {
        console.error("Failed to query currencies:", err);
      } finally {
        setLoadingAll(false);
      }
    }
    fetchCurrencies();
  }, [debouncedSearchAll, isAddingMode]);

  const toggleCurrency = (currency) => {
    const isAdded = watchlist?.some(w => w.symbol === currency.symbol);
    if (isAdded) {
      setWatchlist(prev => prev.filter(w => w.symbol !== currency.symbol));
    } else {
      setWatchlist(prev => [...(prev || []), { symbol: currency.symbol, lastPrice: currency.price || 0, change: 0, changePercent: 0 }]);
    }
  };

  const isLoading     = watchlist === null;
  const filteredActive = (watchlist || []).filter(i => i.symbol.toLowerCase().includes(search.toLowerCase()));
  const displayedWatchlist = filteredActive.slice(0, watchlistLimit);

  // ── Futures sort + filter ─────────────────────────────────────────
  const handleFuturesSort = (key) => {
    setFuturesSort(prev => ({ key, dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc" }));
  };

  const filteredFutures = futuresData
    .filter(r => !futuresSearch || r.symbol?.toLowerCase().includes(futuresSearch.toLowerCase()))
    .sort((a, b) => {
      const aVal = parseFloat(a[futuresSort.key]) || 0;
      const bVal = parseFloat(b[futuresSort.key]) || 0;
      return futuresSort.dir === "desc" ? bVal - aVal : aVal - bVal;
    });

  const displayedFutures = filteredFutures.slice(0, futuresLimit);

  const SortIcon = ({ col }) => (
    <span className={`wl-sort-icon ${futuresSort.key === col ? "active" : ""}`}>
      {futuresSort.key === col ? (futuresSort.dir === "desc" ? " ▼" : " ▲") : " ⇅"}
    </span>
  );

  return (
    <div className="wl-page">
      {/* ── Page Header ── */}
      <div className="wl-page-header">
        <div className="wl-page-title">
          <span className="wl-page-title-text">Market</span>
          <div className="wl-live-badge">
            <span className="wl-live-dot" />
            LIVE
          </div>
        </div>
        <div className="wl-page-tabs">
          <button
            className={`wl-page-tab ${activeTab === "watchlist" ? "active" : ""}`}
            onClick={() => { setActiveTab("watchlist"); setIsAddingMode(false); }}
          >
            Watchlist
            {watchlist !== null && <span className="wl-tab-count">{watchlist.length}</span>}
          </button>
          <button
            className={`wl-page-tab ${activeTab === "futures" ? "active" : ""}`}
            onClick={() => setActiveTab("futures")}
          >
            Futures
            {futuresData !== null && futuresData.length > 0 && <span className="wl-tab-count">{futuresData.length}</span>}
          </button>
        </div>
      </div>

      {/* ══════════════════ WATCHLIST TAB ══════════════════ */}
      {activeTab === "watchlist" && (
        <div className="wl-tab-content">
          {isAddingMode ? (
            /* ── Add Mode ── */
            <div className="wl-add-wrap">
              <div className="wl-add-header">
                <button className="wl-back-btn" onClick={() => setIsAddingMode(false)}>
                  <FiChevronLeft size={16} /> Back to Watchlist
                </button>
              </div>
              <div className="wl-search-bar-lg">
                <FiSearch size={14} />
                <input
                  className="wl-search-input-lg"
                  placeholder="Search exchange symbols..."
                  value={searchAll}
                  onChange={e => setSearchAll(e.target.value)}
                  autoFocus
                />
                {searchAll && <IoMdClose size={14} style={{ cursor: "pointer", color: "#b0bac9" }} onClick={() => setSearchAll("")} />}
              </div>

              {loadingAll ? (
                <div className="wl-center-loader"><Spinner /></div>
              ) : (
                <div className="wl-add-list" style={{ display: "flex", flexDirection: "column", padding: "0 10px 10px 10px", gap: "10px" }}>
                  {currencies.length > 0 && (
                    <div className="wl-col-header" style={{ borderRadius: "8px", background: "var(--bg-main, #f7f8fb)" }}>
                      <div style={{ flex: "2", textAlign: "left" }}>Symbol</div>
                      <div style={{ flex: "1.5", textAlign: "right" }}>Last</div>
                      <div style={{ flex: "1.5", textAlign: "right" }}>Chg</div>
                      <div style={{ flex: "1.5", textAlign: "right" }}>Chg%</div>
                      <div style={{ flex: "1.5", textAlign: "right" }}>Vol</div>
                      <div style={{ flex: "1.5", textAlign: "center" }}>Actions</div>
                    </div>
                  )}
                  {currencies.map(curr => {
                    const isAdded = watchlist?.some(w => w.symbol === curr.symbol);
                    const liveData = 
                      watchlist?.find(w => w.symbol === curr.symbol) || 
                      futuresData?.find(f => f.symbol === curr.symbol) ||
                      globalCache.marketCoins?.find(c => c.symbol === curr.symbol || c.symbol === curr.symbol.replace('USDT', '')) ||
                      curr;
                      
                    const isUp = (liveData.change || liveData.change24h || 0) >= 0;
                    const color = isUp ? "#089981" : "#f23645";

                    return (
                      <div 
                        key={curr.symbol} 
                        style={{
                          display: 'flex', alignItems: 'center', padding: '12px 16px',
                          background: 'var(--bg-card, #ffffff)',
                          border: '1px solid var(--border-color, #e2e8f0)',
                          borderRadius: '12px', cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'transform 0.15s, box-shadow 0.15s'
                        }}
                        onMouseOver={e => {
                           e.currentTarget.style.transform = 'translateY(-2px)';
                           e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        }}
                        onMouseOut={e => {
                           e.currentTarget.style.transform = 'translateY(0)';
                           e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                        }}
                        onClick={() => { window.open(`/candleStick?symbol=${curr.symbol}`, "_blank"); }}
                      >
                        <div className="wl-symbol" style={{ flex: "2", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                          <CoinIdentity symbolItem={curr.symbol} />
                        </div>
                        
                        <div className="wl-price" style={{ flex: "1.5", color }}>
                          {liveData.lastPrice != null || liveData.price != null ? fmt(liveData.lastPrice ?? liveData.price) : "—"}
                        </div>
                        
                        <div className="wl-change" style={{ flex: "1.5", color }}>
                          {(liveData.change != null || liveData.change24h != null) ? `${(liveData.change ?? liveData.change24h) >= 0 ? "+" : ""}${fmt(liveData.change ?? liveData.change24h)}` : "—"}
                        </div>
                        
                        <div className="wl-changepct" style={{ flex: "1.5" }}>
                          <span className={`wl-badge ${isUp ? "up" : "down"}`}>
                            {(liveData.changePercent != null || liveData.changePct != null || liveData.change24h != null) ? `${(liveData.changePercent ?? liveData.changePct ?? liveData.change24h) >= 0 ? "+" : ""}${fmt(liveData.changePercent ?? liveData.changePct ?? liveData.change24h)}%` : "—"}
                          </span>
                        </div>
                        
                        <div style={{ flex: "1.5", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: "500", color: "#8c97ae" }}>
                          {(liveData.volume != null || liveData.vol != null || liveData.quoteVolume24h != null) ? fmt(liveData.volume ?? liveData.vol ?? liveData.quoteVolume24h) : "—"}
                        </div>
                        
                        <div style={{ flex: "1.5", display: "flex", justifyContent: "center", gap: "10px", alignItems: 'center' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(`/candleStick?symbol=${curr.symbol}`, "_blank"); }}
                            title="Go to Chart"
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #7F77DD', color: '#7F77DD', background: 'rgba(127,119,221,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(127,119,221,0.15)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(127,119,221,0.08)'}
                          >
                            <FiBarChart2 size={15} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCurrency(curr); }}
                            title={isAdded ? "Remove from Watchlist" : "Add to Watchlist"}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', color: isAdded ? '#f23645' : '#089981', background: isAdded ? 'rgba(242,54,69,0.1)' : 'rgba(8,153,129,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = isAdded ? 'rgba(242,54,69,0.15)' : 'rgba(8,153,129,0.15)'}
                            onMouseOut={e => e.currentTarget.style.background = isAdded ? 'rgba(242,54,69,0.1)' : 'rgba(8,153,129,0.1)'}
                          >
                            {isAdded ? <FiTrash2 size={14} /> : <FiPlus size={15} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {currencies.length === 0 && (
                    <div className="wl-add-empty" style={{ padding: "40px 0", textAlign: "center", color: "#8c97ae" }}>
                      <FiSearch size={32} opacity={0.4} style={{ marginBottom: "12px" }} />
                      <p style={{ fontSize: "14px", margin: 0 }}>{searchAll ? `No results for "${searchAll}"` : "Type to search symbols…"}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ── Main Watchlist ── */
            <>
              {/* Toolbar */}
              <div className="wl-toolbar">
                <div className="wl-search-bar">
                  <FiSearch size={12} />
                  <input
                    className="wl-search-input"
                    placeholder="Filter symbols…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && <IoMdClose size={12} style={{ cursor: "pointer", color: "#b0bac9" }} onClick={() => setSearch("")} />}
                </div>
                <button className="wl-add-btn" onClick={() => { setIsAddingMode(true); setSearchAll(""); }}>
                  <FiPlus size={14} /> Add Symbol
                </button>
              </div>

              {/* Column Headers */}
              {!isLoading && (
                <div className="wl-col-header" style={{ borderRadius: "8px", background: "var(--bg-main, #f7f8fb)", margin: "0 10px" }}>
                  <div style={{ flex: "2", textAlign: "left" }}>Symbol</div>
                  <div style={{ flex: "1.5", textAlign: "right" }}>Last</div>
                  <div style={{ flex: "1.5", textAlign: "right" }}>Chg</div>
                  <div style={{ flex: "1.5", textAlign: "right" }}>Chg%</div>
                  <div style={{ flex: "1.5", textAlign: "right" }}>Vol</div>
                  <div style={{ flex: "1.5", textAlign: "center" }}>Actions</div>
                </div>
              )}

              {/* List */}
              <div className="wl-list" style={{ display: "flex", flexDirection: "column", padding: "10px", gap: "10px" }}>
                {isLoading && (
                  <div className="wl-center-loader">
                    <Spinner />
                    <span className="wl-loading-text">Fetching watchlist…</span>
                    <div className="wl-skeleton-rows">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div className="wl-skeleton-row" key={i}>
                          <div className="wl-skel" style={{ width: "80px", height: "13px" }} />
                          <div style={{ flex: 1 }} />
                          <div className="wl-skel" style={{ width: "60px", height: "13px" }} />
                          <div style={{ width: "8px" }} />
                          <div className="wl-skel" style={{ width: "50px", height: "13px" }} />
                          <div style={{ width: "8px" }} />
                          <div className="wl-skel" style={{ width: "50px", height: "22px", borderRadius: "3px" }} />
                          <div style={{ width: "8px" }} />
                          <div className="wl-skel" style={{ width: "55px", height: "13px" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isLoading && displayedWatchlist.map(item => {
                  const isUp      = item.change >= 0;
                  const isActive  = activeCurrency === item.symbol;
                  const color     = isUp ? "#089981" : "#f23645";
                  const flash     = flashMap[item.symbol];
                  const flashCls  = flash === "up" ? "wl-flash-up" : flash === "down" ? "wl-flash-down" : "";

                  return (
                    <div
                      key={item.symbol}
                      className={`wl-row-modern ${isActive ? "active" : ""} ${flashCls}`}
                      style={{
                        display: 'flex', alignItems: 'center', padding: '12px 16px',
                        background: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        borderRadius: '12px', cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        transition: 'transform 0.15s, box-shadow 0.15s'
                      }}
                      onMouseOver={e => {
                         e.currentTarget.style.transform = 'translateY(-2px)';
                         e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      }}
                      onMouseOut={e => {
                         e.currentTarget.style.transform = 'translateY(0)';
                         e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                      }}
                      onClick={() => setActiveCurrency(item.symbol)}
                    >
                      <div className="wl-symbol" style={{ flex: "2", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                        <CoinIdentity symbolItem={item.symbol} />
                      </div>
                      <div className="wl-price" style={{ flex: "1.5", color }}>
                        {item.lastPrice != null ? fmt(item.lastPrice) : ""}
                      </div>
                      <div className="wl-change" style={{ flex: "1.5", color }}>
                        {item.change != null ? `${item.change >= 0 ? "+" : ""}${fmt(item.change)}` : ""}
                      </div>
                      <div className="wl-changepct" style={{ flex: "1.5" }}>
                        <span className={`wl-badge ${isUp ? "up" : "down"}`}>
                          {item.changePercent != null ? `${item.changePercent >= 0 ? "+" : ""}${fmt(item.changePercent)}%` : ""}
                        </span>
                      </div>
                      <div style={{ flex: "1.5", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: "500", color: "#8c97ae" }}>
                        {item.volume != null ? fmt(item.volume) : ""}
                      </div>
                      <div style={{ flex: "1.5", display: "flex", justifyContent: "center", gap: "10px", alignItems: 'center' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`/candleStick?symbol=${item.symbol}`, "_blank"); }}
                          title="Go to Chart"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #7F77DD', color: '#7F77DD', background: 'rgba(127,119,221,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(127,119,221,0.15)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(127,119,221,0.08)'}
                        >
                          <FiBarChart2 size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCurrency(item); }}
                          title="Remove from Watchlist"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', color: '#f23645', background: 'rgba(242,54,69,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(242,54,69,0.15)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(242,54,69,0.1)'}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {!isLoading && filteredActive.length > watchlistLimit && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                    <button 
                      onClick={() => setWatchlistLimit(prev => prev + 10)}
                      style={{
                        padding: '8px 24px',
                        background: 'rgba(41, 98, 255, 0.1)',
                        color: '#2962ff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(41, 98, 255, 0.15)'}
                      onMouseOut={(e) => e.target.style.background = 'rgba(41, 98, 255, 0.1)'}
                    >
                      View More
                    </button>
                  </div>
                )}

                {!isLoading && filteredActive.length === 0 && (
                  <div className="wl-empty">
                    <div className="wl-empty-icon">+</div>
                    <div className="wl-empty-text">
                      {search ? `No results for "${search}"` : "Watchlist is empty.\nClick Add Symbol to get started."}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════ FUTURES TAB ══════════════════ */}
      {activeTab === "futures" && (
        <div className="wl-tab-content">
          {/* Futures Toolbar */}
          <div className="wl-toolbar">
            <div className="wl-search-bar">
              <FiSearch size={12} />
              <input
                className="wl-search-input"
                placeholder="Search futures…"
                value={futuresSearch}
                onChange={e => setFuturesSearch(e.target.value)}
              />
              {futuresSearch && <IoMdClose size={12} style={{ cursor: "pointer", color: "#b0bac9" }} onClick={() => setFuturesSearch("")} />}
            </div>
            <span className="wl-futures-count">{filteredFutures.length} contracts</span>
          </div>

          {futuresLoading && (
            <div className="wl-center-loader"><Spinner /></div>
          )}

          {futuresError && (
            <div className="wl-futures-error">{futuresError}</div>
          )}

          {!futuresLoading && !futuresError && (
            <div className="wl-futures-table-wrap">
              <table className="wl-futures-table">
                <thead>
                  <tr>
                    <th className="th-symbol">
                      Symbol
                    </th>
                    <th>Contract</th>
                    <th>Expiry</th>
                    <th className="th-right sortable" onClick={() => handleFuturesSort("lastPrice")}>
                      Last Price <SortIcon col="lastPrice" />
                    </th>
                    <th className="th-right sortable" onClick={() => handleFuturesSort("change24h")}>
                      24h Chg <SortIcon col="change24h" />
                    </th>
                    <th className="th-right sortable" onClick={() => handleFuturesSort("quoteVolume24h")}>
                      Volume <SortIcon col="quoteVolume24h" />
                    </th>
                    <th className="th-right sortable" onClick={() => handleFuturesSort("openInterest")}>
                      Open Interest <SortIcon col="openInterest" />
                    </th>
                    <th className="th-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedFutures.map((row, i) => {
                    const isStarred   = i < 3;
                    const label       = row.contractType === "PERPETUAL" ? "Perpetual" : (row.symbol?.split("_")[1] || "Delivery");
                    const iconStr     = getIcon(row.baseAsset);
                    const iconCol     = getColor(row.baseAsset);
                    const isPositive  = parseFloat(row.change24h) >= 0;

                    return (
                      <tr key={row.symbol} className={`wl-futures-row ${row.flashClass || ""}`}>
                        <td className="td-symbol">
                          <div className="futures-sym-cell">
                            {/* <span className={`star-icon ${isStarred ? "starred" : ""}`}>{isStarred ? "★" : "☆"}</span> */}
                            <CoinIdentity symbolItem={row.baseAsset} isFutures={true} />
                            <div className="futures-sym-info">
                              <span className="futures-sym-name">{row.symbol}</span>
                              <span className="futures-sym-label">{label}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`contract-badge ${row.contractType?.toLowerCase()}`}>{row.contractType}</span>
                        </td>
                        <td className="td-expiry">
                          {row.expiryDate === "No Expiry" ? (
                            <div className="expiry-cell"><span className="no-expiry-dash">—</span><span className="no-expiry-lbl">No Expiry</span></div>
                          ) : (
                            <div className="expiry-cell"><span className="expiry-date">{row.expiryDate}</span><span className="days-left">{row.daysLeft}</span></div>
                          )}
                        </td>
                        <td className="td-right">
                          <div className="price-main">{formatPrice(row.lastPrice)}</div>
                          <div className="price-sub">${formatPrice(row.lastPrice)}</div>
                        </td>
                        <td className="td-right">
                          <span className={`change-val ${isPositive ? "positive" : "negative"}`}>{formatChange(row.change24h)}</span>
                        </td>
                        <td className="td-right">
                          <div className="vol-main">{formatVolume(row.quoteVolume24h)}</div>
                          <div className="vol-sub">{row.quoteAsset || "USDT"}</div>
                        </td>
                        <td className="td-right">
                          <div className="oi-main">{row.openInterest === "0" ? "—" : formatVolume(row.openInterest)}</div>
                          <div className="oi-sub">{row.quoteAsset || "USDT"}</div>
                        </td>
                        <td className="td-center">
                          <span className="status-badge">{row.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!futuresLoading && !futuresError && filteredFutures.length > futuresLimit && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                  <button 
                    onClick={() => setFuturesLimit(prev => prev + 10)}
                    style={{
                      padding: '8px 24px',
                      background: 'rgba(41, 98, 255, 0.1)',
                      color: '#2962ff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(41, 98, 255, 0.15)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(41, 98, 255, 0.1)'}
                  >
                    View More
                  </button>
                </div>
              )}

              {filteredFutures.length === 0 && (
                <div className="wl-empty" style={{ padding: "40px" }}>
                  <div className="wl-empty-icon"><FiSearch size={16} /></div>
                  <div className="wl-empty-text">No contracts matching "{futuresSearch}"</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}