import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import "./CryptoEdgeDashboard.css";
import { useTheme } from "../../context/ThemeContext";
// Structural components — always needed, keep eager
import Sidebar from "../../../src/components/dashboard/layout/Sidebar";
import TopTickerBar from "../../../src/components/dashboard/layout/TopTickerBar";
import HeaderControls from "../../../src/components/dashboard/layout/HeaderControls";
import { Spinner } from "../../components/tradingModals/Spinner";
import socket from "../../services/websocket/socket";
import { useSocket } from "../../services/websocket/useSocket";

// ── Tab panels — lazy-loaded (each becomes its own JS chunk) ────────────────
const Overview           = lazy(() => import("./overview/Overview"));
const SocialIntelligence = lazy(() => import("./socialIntellingence/socialIntellingence"));
const Arbitrage          = lazy(() => import("./arbitrage/Arbitrage"));
const Financials         = lazy(() => import("./financials/Financial"));
const MarketData         = lazy(() => import("./marketData/MarketData"));
const OnChain            = lazy(() => import("./onChain/onChain"));
const WatchlistPanel     = lazy(() => import("../../components/watchlist/WatchlistPanel"));
const MarketSentiment    = lazy(() => import("./marketSentiment/MarketSentiment"));
const Settings           = lazy(() => import("./settings/Settings"));
const Watchlist          = lazy(() => import("./watchlist/Watchlist"));

// Minimal tab-switch fallback
const TabLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <Spinner />
  </div>
);


const CryptoEdgeDashboard = () => {
  const { theme } = useTheme();
  // -------------------------------------------------------------
  // Dynamic Real-time States
  // -------------------------------------------------------------
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT"); // 'BTCUSDT', 'ETHUSDT', etc.
  const [marketCoins, setMarketCoins] = useState([]);
  const [marketMetrics, setMarketMetrics] = useState(null);
  
  const [overviewChartData, setOverviewChartData] = useState({});
  const [flashStates, setFlashStates] = useState({});
  const getInitialTab = () => {
    let hash = window.location.hash.replace("#", "");
    try { hash = decodeURIComponent(hash); } catch(e) {}
    if (hash) {
      if (hash === "social-intelligence") return "Social Intelligence";
      if (hash === "market-sentiment") return "Market Sentiment";
      if (hash === "market-data") return "Market Data";
      if (hash === "onchain" || hash === "on-chain (tvl)") return "On-Chain (TVL)";
      if (hash === "api-status") return "API Status";
      return hash.charAt(0).toUpperCase() + hash.slice(1);
    }
    return "Overview";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [activeCurrency, setActiveCurrency] = useState("BTCUSDT");

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    // Use hyphen-separated lowercase for clean URLs
    const TAB_TO_HASH = {
      "Social Intelligence": "social-intelligence",
      "Market Sentiment": "market-sentiment",
      "Market Data": "market-data",
      "On-Chain (TVL)": "onchain",
      "API Status": "api-status",
    };
    const hashName = TAB_TO_HASH[activeTab] ?? activeTab.toLowerCase();
    
    // Decode current hash for safe comparison
    let currentHash = window.location.hash.replace("#", "");
    try { currentHash = decodeURIComponent(currentHash); } catch(e) {}
    
    if (currentHash !== hashName) {
      window.history.replaceState(null, null, `#${hashName}`);
    }
  }, [activeTab]);

  const getBaseSymbol = (sym) => {
    if (!sym) return "";
    if (sym.endsWith("USDT")) return sym.slice(0, -4);
    if (sym.endsWith("BUSD")) return sym.slice(0, -4);
    if (sym.endsWith("USDC")) return sym.slice(0, -4);
    if (sym.endsWith("BTC")) return sym.slice(0, -3);
    if (sym.endsWith("ETH")) return sym.slice(0, -3);
    return sym;
  };
  const [prices, setPrices] = useState({});

  const tvContainerRef = useRef(null);

  // Dynamically load the Official TradingView Technical Analysis Widget
  useEffect(() => {
    if (activeTab !== "Overview") return; // 👈 ONLY run when visible

    let script = document.getElementById("tradingview-widget-script");

    const initWidget = () => {
      if (typeof window.TradingView !== "undefined" && tvContainerRef.current) {
        tvContainerRef.current.innerHTML = "";

        const tvDivId = `tv-embed-${selectedSymbol.toLowerCase()}`;
        const tvDiv = document.createElement("div");

        tvDiv.id = tvDivId;
        tvDiv.style.width = "100%";
        tvDiv.style.height = "100%";

        tvContainerRef.current.appendChild(tvDiv);

        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${selectedSymbol}`,
          interval: "1",
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: tvDivId,
          studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
          backgroundColor: theme === "dark" ? "#07090e" : "#ffffff",
          gridColor:
            theme === "dark"
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.04)",
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = "tradingview-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      initWidget(); // 👈 THIS WAS MISSING BEHAVIOR
    }

  }, [selectedSymbol, theme, activeTab]); // 👈 ADD activeTab

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orderBook, setOrderBook] = useState({
    asks: [],
    bids: [],
    spread: "",
  });

  const [fearGreed, setFearGreed] = useState(null);

  const [socialStats, setSocialStats] = useState(null);
  const [tvlData, setTvlData] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [arbitrage, setArbitrage] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sentimentData, setSentimentData] = useState(null);

  // Synchronize Ref with State to keep socket event listeners always updated
  const selectedSymbolRef = useRef(selectedSymbol);
  useEffect(() => {
    selectedSymbolRef.current = selectedSymbol;
  }, [selectedSymbol]);

  useSocket({
    setCoins: setMarketCoins,
    setMarketMetrics,
    setOverviewChartData,
    setFlashStates,
    setPrices,
    setOrderBook,
    setFearGreed,
    setSocialStats,
    setTvlData,
    setFinancials,
    setOpportunities: setArbitrage,
    setAlerts,
    setSentimentData,
    selectedSymbol,
    selectedSymbolRef,
    getBaseSymbol,
  });

  return (
    <>
      <div className="crypto-dashboard container-fluid p-0" style={{ flexDirection: 'column' }}>
        {/* Top Real-Time Tickers Row */}
        <TopTickerBar prices={prices} selectedSymbol={selectedSymbol} />

        {/* Premium Header Controls (Search & Active Pair Dropdown) */}
        <HeaderControls
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
        />

        <div className="dashboard-wrapper" style={{ flexGrow: 1, minHeight: 0 }}>
          {/* Modular Left Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen} />

          {/* Main Dashboard Panel */}
          <main className="main-workspace" style={{ position: 'relative' }}>
            {/* Scrollable Core Workspace */}
            <div 
              className="scrollable-content-area" 
              style={{ 
                // opacity: !marketMetrics ? 0.4 : 1,
                // transition: 'opacity 0.4s ease',
                // pointerEvents: !marketMetrics ? 'none' : 'auto'
              }}
            >

              <Suspense fallback={<TabLoader />}>
                {activeTab === "Overview" && (
                  <Overview
                    marketMetrics={marketMetrics}
                    fearGreed={fearGreed}
                    socialStats={socialStats}
                    prices={prices}
                    selectedSymbol={selectedSymbol}
                    orderBook={orderBook}
                    tvlData={tvlData}
                    tvContainerRef={tvContainerRef}
                    financials={financials}
                    arbitrage={arbitrage}
                    alerts={alerts}
                    activeTab={activeTab}
                    sentimentData={sentimentData}
                  />
                )}

                {activeTab === "Social Intelligence" && (
                  <SocialIntelligence
                    isSubComponent={true}
                    selectedSymbol={selectedSymbol}
                  />
                )}

                {activeTab === "Arbitrage" && (
                  <Arbitrage
                    isSubComponent={true}
                    selectedSymbol={selectedSymbol}
                  />
                )}

                {activeTab === "Financials" && (
                  <Financials
                    isSubComponent={true}
                    selectedSymbol={selectedSymbol}
                  />
                )}

                {activeTab === "Market Data" && (
                  <MarketData
                    isSubComponent={true}
                    selectedSymbol={selectedSymbol}
                    coins={marketCoins}
                    setCoins={setMarketCoins}
                    marketMetrics={marketMetrics}
                    setMarketMetrics={setMarketMetrics}
                    overviewChartData={overviewChartData}
                    setOverviewChartData={setOverviewChartData}
                    flashStates={flashStates}
                    setFlashStates={setFlashStates}
                  />
                )}

                {activeTab === "On-Chain (TVL)" && (
                  <OnChain
                    isSubComponent={true}
                    selectedSymbol={selectedSymbol}
                  />
                )}
                {activeTab === "Market Sentiment" && (
                  <MarketSentiment
                    isSubComponent={true}
                    selectedSymbol={selectedSymbol}
                  />
                )}

                {activeTab === "Watchlist" && (
                  <Watchlist
                    onClose={() => setActiveTab("Overview")}
                    activeCurrency={activeCurrency}
                    setActiveCurrency={(sym) => {
                      setActiveCurrency(sym);
                      setSelectedSymbol(sym);
                    }}
                  />
                )}

                {activeTab === "Settings" && (
                  <Settings
                    isSubComponent={true}
                  />
                )}
              </Suspense>
            </div>

          </main>
        </div>
      </div>
    </>
  );
};

export default CryptoEdgeDashboard;
