import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CoinMarketDetails.css";
import apiService from "../../../services/apiServices";
import { useSocket, globalCache } from "../../../services/websocket/useSocket";
import { useTheme } from "../../../context/ThemeContext";
import { Spinner } from "../../../components/tradingModals/Spinner";
import SharedCandlestickChart from "../../../components/chart/SharedCandlestickChart";

const CoinMarketDetails = () => {
  const { theme } = useTheme();
  const { symbol } = useParams();
  const navigate = useNavigate();
  const areaSeriesRef = useRef(null);

  const [coin, setCoin] = useState(null);
  const [marketStats, setMarketStats] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [flashState, setFlashState] = useState(null);
  const [activeTab, setActiveTab] = useState("Chart");
  const [activeTimeframe, setActiveTimeframe] = useState("1d");
  const [klines, setKlines] = useState([]);

  const cleanSymbol = (sym) => {
    if (!sym) return 'BTC';
    return sym.replace(/USDT|BUSD|USD/gi, '').toUpperCase();
  };

  // ── STEP 1: One-time API call for initial coin metadata ──
  useEffect(() => {
    async function fetchCoinData() {
      try {
        const response = await apiService.post(
          `api/listing?symbol=${symbol.toUpperCase()}USDT&interval=1m&limit=1000`,
        );

        const data = response?.data;

        if (!data || !Array.isArray(data)) {
          console.warn(
            "⚠️ CoinMarketDetails: unexpected response shape",
            response,
          );
          return;
        }

        const latest = data[data.length - 1];
        const newPrice = Number(latest.close);

        setCoin({
          symbol: symbol.toUpperCase(),
          name: symbol.toUpperCase(),
          price: newPrice,
          change24h: 0,
          volume24h: Number(latest.volume),
          high: Number(latest.high),
          low: Number(latest.low),
          history: data.map((d) => Number(d.close)),
          supply: 0,
          logoColor: "#6366f1",
        });
      } catch (err) {
        console.error("API fetch error:", err);
      }
    }

    function fetchMarketStats() {
      const cachedCoin = globalCache.marketCoins?.find(
        c => c.symbol.toUpperCase() === symbol.toUpperCase() || c.symbol.toUpperCase() === symbol.toUpperCase() + 'USDT'
      );

      if (!cachedCoin) {
        setTimeout(fetchMarketStats, 500);
        return;
      }

      const fullName = cachedCoin.name.toLowerCase().replace(/\s+/g, '-');
      
      apiService.get(`api/marketStats/${fullName}`)
        .then(res => {
          if (res && res?.data) {
            setMarketStats(res?.data);
          } else if (res) {
            setMarketStats(res);
          }
        })
        .catch(err => console.error("MarketStats fetch error:", err));
    }

    // Single fetch only — live updates come from useSocket
    fetchCoinData();
    fetchMarketStats();
  }, [symbol]);

  // ── STEP 2: Socket.IO for live price ticks and kline fetching ──
  useSocket({
    setCoinDetail: setCoin,
    areaSeriesRef,
    setFlashState,
    selectedSymbol: symbol,
    selectedPeriod: activeTimeframe,
    setKlines,
    cleanSymbol,
  });

  useEffect(() => {
    setIsSocketConnected(true);
  }, []);

  // Clear stale data to prevent flickering when switching symbols
  useEffect(() => {
    setCoin(null);
  }, [symbol]);

  const isCoinLoaded = !!coin;

  if (!coin) {
    return (
      <div className="detail-loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  const isUp = coin.change24h >= 0;

  const tabs = ["Chart", "Analysis", "News", "FAQ", "Trending Crypto", "Trading Pairs"];
  const timeframes = ["15m", "1h", "4h", "1d", "1w", "1M"];

  return (
    <div className="coin-detail-page">
      <main className="detail-page-body">
        {/* Coin Info Bar */}
        <section className="coin-header-top">
          {marketStats?.image ? (
            <img 
              src={marketStats.image} 
              alt={`${coin.name} logo`} 
              className="coin-details-logo-img" 
              style={{ width: "48px", height: "48px", borderRadius: "50%" }}
            />
          ) : (
            <div
              className="coin-details-logo"
              style={{ backgroundColor: coin.logoColor || "#f7931a" }}
            >
              {coin.symbol === "BTC" ? "₿" : coin.symbol[0]}
            </div>
          )}
          <div className="coin-title-section">
            <div className="coin-name-row">
              <span className="coin-name-text">{coin.name} Price ({coin.symbol})</span>
              <span className="badge-hot">HOT</span>
            </div>
            <div className="coin-price-row">
              <h1 className={`price-display ${flashState === "up" ? "flash-up" : flashState === "down" ? "flash-down" : ""}`}>
                ${coin.price.toLocaleString(undefined, {
                  minimumFractionDigits: coin.price < 1 ? 4 : 2,
                  maximumFractionDigits: coin.price < 1 ? 4 : 2,
                })}
              </h1>
            </div>
            <div className="coin-portfolio-row">
              <span className={`change-text ${isUp ? "up" : "down"}`}>
                {isUp ? "+" : ""}{coin.change24h.toFixed(2)}% in the past 24 hrs
              </span>
              <span className="dot-separator">•</span>
              {/* <span className="portfolio-text">
                You have 0 {coin.name} in portfolio <span className="add-now-link">Add Now</span>
              </span> */}
            </div>
          </div>
        </section>

        {/* Tabs Navigation */}
        <nav className="coin-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Live Chart Section */}
        <section className="detail-chart-wrapper">
          <div className="timeframe-controls">
            {timeframes.map((tf) => (
              <button
                key={tf}
                className={`time-btn ${activeTimeframe === tf ? "active" : ""}`}
                onClick={() => setActiveTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
            <div className="chart-right-header">USD</div>
          </div>
          <div className="lightweight-chart-container">
            <SharedCandlestickChart
              ref={areaSeriesRef}
              klines={klines}
              height="450px"
              upColor="#10b981"
              downColor="#ef4444"
            />
          </div>
        </section>

        {/* Market Stats Section */}
        <section className="market-stats-section">
          <h2 className="market-stats-title">{coin.name} Market Stats</h2>
          <div className="market-stats-grid">
            <div className="stat-item">
              <span className="stat-label">
                Popularity
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">#{marketStats?.popularityRank || "N/A"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Market Cap
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">{marketStats?.marketCap ? (marketStats.marketCap >= 1e12 ? `$${(marketStats.marketCap / 1e12).toFixed(2)}T` : `$${(marketStats.marketCap / 1e9).toFixed(1)}B`) : "N/A"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Volume (24hours)
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">
                ${(((marketStats?.volume24h) || coin.volume24h || 0) / 1e9).toFixed(1)}B
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Circulation Supply
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">
                {marketStats?.circulatingSupply ? `${(marketStats.circulatingSupply / 1e6).toFixed(0)}M` : `${((coin.supply || 0) / 1e6).toFixed(0)}M`} {marketStats?.circulatingSupply && marketStats?.maxSupply ? `• ${((marketStats.circulatingSupply / marketStats.maxSupply) * 100).toFixed(2)}%` : ""}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Total Maximum Supply
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">{marketStats?.maxSupply ? `${(marketStats.maxSupply / 1e6).toFixed(0)}M` : "N/A"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Fully Diluted Market Cap
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">{marketStats?.fullyDilutedMarketCap ? (marketStats.fullyDilutedMarketCap >= 1e12 ? `$${(marketStats.fullyDilutedMarketCap / 1e12).toFixed(2)}T` : `$${(marketStats.fullyDilutedMarketCap / 1e9).toFixed(1)}B`) : "N/A"}</span>
            </div>
            {marketStats?.issueDate && (
              <div className="stat-item">
                <span className="stat-label">Issue Date</span>
                <span className="stat-value">{marketStats?.issueDate}</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CoinMarketDetails;
