import React, { useState, useEffect, useRef } from "react";
import "./CryptoEdgeDashboard.css";
import { useTheme } from "../../context/ThemeContext";
// Import split components
import Sidebar from "../../../src/components/dashboard/layout/Sidebar";
import TopTickerBar from "../../../src/components/dashboard/layout/TopTickerBar";
import HeaderControls from "../../../src/components/dashboard/layout/HeaderControls";
import Overview from "./overview/Overview";
import SocialIntelligence from "./socialIntellingence/socialIntellingence";
import Arbitrage from "./arbitrage/Arbitrage";
import Financials from "./financials/Financial";
import MarketData from "./marketData/MarketData";
import OnChain from "./onChain/onChain";
import WatchlistPanel from "../../components/watchlist/WatchlistPanel";
import MarketSentiment from "./marketSentiment/MarketSentiment";
import socket from "../../services/websocket/socket";
import Settings from "./settings/Settings";
import { useSocket } from "../../services/websocket/useSocket";

const CryptoEdgeDashboard = () => {
  const { theme } = useTheme();
  // -------------------------------------------------------------
  // Dynamic Real-time States
  // -------------------------------------------------------------
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT"); // 'BTCUSDT', 'ETHUSDT', etc.
  const [marketCoins, setMarketCoins] = useState([]);
  const [marketMetrics, setMarketMetrics] = useState({
    totalMarketCap: 2.56,
    totalMarketCapChange: 1.35,
    volume24h: 68.24,
    volume24hChange: 8.72,
    btcDominance: 51.24,
    btcDominanceChange: -0.45,
    ethDominance: 16.17,
    ethDominanceChange: 0.35,
    fearGreedIndex: 64,
  });
  const [overviewChartData, setOverviewChartData] = useState({});
  const [flashStates, setFlashStates] = useState({});
  const getInitialTab = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      if (hash === "social-intelligence") return "Social Intelligence";
      if (hash === "market-sentiment") return "Market Sentiment";
      if (hash === "market-data") return "Market Data";
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
    };
    const hashName = TAB_TO_HASH[activeTab] ?? activeTab.toLowerCase();
    if (window.location.hash.replace("#", "") !== hashName) {
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

  const [fearGreed, setFearGreed] = useState({
    value: 72,
    label: "Greed",
    yesterday: 68,
    lastWeek: 61,
  });

  const [socialStats, setSocialStats] = useState({
    btcDominance: "35.4%",
    altRank: "#25",
    narrativeScores: {
      DeFi: 82,
      AI: 76,
      Memecoons: 69,
      Layer2: 71,
      RWA: 64,
      Gaming: 58,
      NFT: 42,
    },
    radarValues: { vol: 88, dom: 74, eng: 81, mktDom: 65, sent: 78 },
  });

  const [tvlData, setTvlData] = useState({
    total: "$84.62B",
    chains: [
      { name: "Ethereum", val: "49.82B", pct: 58.8, color: "#6366f1" },
      { name: "Tron", val: "9.14B", pct: 10.8, color: "#3b82f6" },
      { name: "BSC", val: "6.45B", pct: 7.6, color: "#10b981" },
      { name: "Arbitrum", val: "3.21B", pct: 3.8, color: "#a78bfa" },
      { name: "Solana", val: "2.84B", pct: 3.3, color: "#f59e0b" },
      { name: "Others", val: "13.16B", pct: 15.7, color: "#f97316" },
    ],
    protocols: [
      {
        name: "Lido Finance",
        cat: "Liquid Staking",
        val: 27.18,
        change: 4.12,
        icon: "L",
        color: "#627eea",
      },
      {
        name: "AAVE",
        cat: "Lending",
        val: 12.42,
        change: -1.05,
        icon: "A",
        color: "#4a6da7",
      },
      {
        name: "EigenLayer",
        cat: "Restaking",
        val: 11.85,
        change: 8.41,
        icon: "E",
        color: "#3b82f6",
      },
      {
        name: "MakerDAO",
        cat: "CDP / Stable",
        val: 9.12,
        change: 0.5,
        icon: "M",
        color: "#ff5a00",
      },
    ],
  });

  const [financials, setFinancials] = useState({
    revenue: "$3.24M",
    whaleBuy: "342.7M",
    whaleSell: "157.3M",
  });

  const [arbitrage, setArbitrage] = useState([
    { symbol: "BTC/USDT", binance: "", bybit: "", okx: "", spread: "" },
    { symbol: "ETH/USDT", binance: "", bybit: "", okx: "", spread: "" },
    { symbol: "SOL/USDT", binance: "", bybit: "", okx: "", spread: "" },
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "whale",
      msg: "Whale alert: 1,200 BTC ($82.1M) moved from unknown wallet to Binance.",
      time: "1m ago",
    },
    {
      id: 2,
      type: "tvl",
      msg: "TVL surge: Lido Finance TVL increased by $1.2B (+3.2%) in the last 4 hours.",
      time: "14m ago",
    },
    {
      id: 3,
      type: "social",
      msg: "Social spike: LunarCrush alerts #AI narrative dominance up by 14.2%.",
      time: "28m ago",
    },
  ]);

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
    setArbitrage,
    setAlerts,
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
        />

        <div className="dashboard-wrapper" style={{ flexGrow: 1, minHeight: 0 }}>
          {/* Modular Left Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen} />

          {/* Main Dashboard Panel */}
          <main className="main-workspace">
            {/* Scrollable Core Workspace */}
            <div className="scrollable-content-area">

              {activeTab === "Overview" && (
                <Overview
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
                />
              )}
              {activeTab === "Market Sentiment" && (
                <MarketSentiment
                  isSubComponent={true}
                />
              )}

              {activeTab === "Watchlist" && (
                <WatchlistPanel
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
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CryptoEdgeDashboard;
