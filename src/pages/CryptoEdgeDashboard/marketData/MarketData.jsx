import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MarketData.css";
import socket from "../../../services/socket"; // ← use shared socket, not io()

const MarketData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Coins");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [chartTimeframe, setChartTimeframe] = useState("1D");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const additionalCategories = [
    "Web3",
    "NFT",
    "RWA",
    "Launchpad",
    "Infrastructure",
  ];
  const [visibleLimit, setVisibleLimit] = useState(8);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [coins, setCoins] = useState([]);
  const [overviewChartData, setOverviewChartData] = useState({});
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState(null);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc",
  });
  const [flashStates, setFlashStates] = useState({});
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

  // ── WebSocket Integration (shared socket) ─────────────────────────
  useEffect(() => {
    // Request data from server on mount — this is what was missing
    socket.emit("get-market-coins");

    const handleConnect = () => {
      console.log("🟢 MarketData: socket connected");
      setIsSocketConnected(true);
      // Re-request on reconnect in case we missed the initial emit
      socket.emit("get-market-coins");
    };

    const handleDisconnect = () => {
      console.log("🔴 MarketData: socket disconnected");
      setIsSocketConnected(false);
    };

    const handleCoinsInit = (data) => {
      console.log("📥 market-coins-init received in MarketData:", data);
      if (
        data &&
        data.success &&
        Array.isArray(data.coins) &&
        data.coins.length > 0
      ) {
        setCoins(data.coins);
        if (data.metrics) {
          setMarketMetrics((prev) => ({ ...prev, ...data.metrics }));
        }
        if (data.overviewChartData) {
          setOverviewChartData(data.overviewChartData);
        }
      }
    };

    const handleTicker = (data) => {
      if (!data || !data.symbol) return;
      const symbolKey = data.symbol.replace("USDT", "").toUpperCase();

      setCoins((prevCoins) => {
        const coinExists = prevCoins.some((c) => c.symbol === symbolKey);
        if (!coinExists) return prevCoins;

        const originalCoin = prevCoins.find((c) => c.symbol === symbolKey);
        const originalPrice = originalCoin ? originalCoin.price : 0;
        const newPrice = Number(data.price);

        if (originalPrice > 0 && newPrice !== originalPrice) {
          const direction = newPrice >= originalPrice ? "up" : "down";
          const flashKey = `${symbolKey}-price`;
          setFlashStates((prev) => ({ ...prev, [flashKey]: direction }));
          setTimeout(() => {
            setFlashStates((prev) => {
              const next = { ...prev };
              delete next[flashKey];
              return next;
            });
          }, 800);
        }

        return prevCoins.map((coin) => {
          if (coin.symbol === symbolKey) {
            const updatedHistory = [...coin.history.slice(1), newPrice];
            return {
              ...coin,
              price: newPrice,
              change24h: Number(data.changePct),
              volume24h: Number(data.volume),
              high: Number(data.high),
              low: Number(data.low),
              history: updatedHistory,
            };
          }
          return coin;
        });
      });
    };

    const handleSentiment = (data) => {
      if (!data) return;
      setMarketMetrics((prev) => ({
        ...prev,
        btcDominance:
          parseFloat(data.socialStats?.btcDominance) || prev.btcDominance,
        fearGreedIndex: parseInt(data.fearGreed?.value) || prev.fearGreedIndex,
        volume24h:
          parseFloat(data.tvlData?.total?.replace("$", "").replace("B", "")) ||
          prev.volume24h,
      }));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("market-coins-init", handleCoinsInit);
    socket.on("binance-ticker", handleTicker);
    socket.on("binance-sentiment", handleSentiment);

    // If socket is already connected when this component mounts, set state
    if (socket.connected) {
      setIsSocketConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("market-coins-init", handleCoinsInit);
      socket.off("binance-ticker", handleTicker);
      socket.off("binance-sentiment", handleSentiment);
    };
  }, []);

  // ── Simulated Fallback ticks when WebSocket is offline ────────────
  useEffect(() => {
    if (isSocketConnected) return;
    if (coins.length === 0) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * coins.length);
      const coinToUpdate = coins[randomIndex];
      if (!coinToUpdate) return;

      const percentageChange = (Math.random() * 0.4 - 0.18) / 100;
      const originalPrice = coinToUpdate.price;
      const newPrice = Number(
        (originalPrice * (1 + percentageChange)).toFixed(
          coinToUpdate.price < 1 ? 4 : 2,
        ),
      );
      const direction = newPrice >= originalPrice ? "up" : "down";

      const flashKey = `${coinToUpdate.symbol}-price`;
      setFlashStates((prev) => ({ ...prev, [flashKey]: direction }));
      setTimeout(() => {
        setFlashStates((prev) => {
          const next = { ...prev };
          delete next[flashKey];
          return next;
        });
      }, 800);

      setCoins((prevCoins) =>
        prevCoins.map((coin, index) => {
          if (index === randomIndex) {
            const updatedHistory = [...coin.history.slice(1), newPrice];
            return {
              ...coin,
              price: newPrice,
              change24h: Number(
                (coin.change24h + percentageChange * 100).toFixed(2),
              ),
              history: updatedHistory,
            };
          }
          return coin;
        }),
      );

      setMarketMetrics((prev) => {
        const mcapTick = Math.random() * 0.02 - 0.01;
        const fearGreedTick =
          Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return {
          ...prev,
          totalMarketCap: Number((prev.totalMarketCap + mcapTick).toFixed(2)),
          totalMarketCapChange: Number(
            (prev.totalMarketCapChange + mcapTick * 8).toFixed(2),
          ),
          fearGreedIndex: Math.min(
            Math.max(prev.fearGreedIndex + fearGreedTick, 0),
            100,
          ),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSocketConnected, coins]);

  // Derived Gainers and Losers
  useEffect(() => {
    if (coins.length === 0) return;
    const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
    setGainers(sorted.slice(0, 5));
    setLosers([...sorted].reverse().slice(0, 5));
  }, [coins]);

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc")
      direction = "asc";
    setSortConfig({ key, direction });
  };

  const formatCompact = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const renderSparkline = (dataPoints, change) => {
    if (!dataPoints || dataPoints.length === 0) return null;
    const isUp = change >= 0;
    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = max - min || 1;
    const width = 80,
      height = 30,
      padding = 2;
    const points = dataPoints.map((p, idx) => {
      const x =
        padding + (idx / (dataPoints.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });
    return (
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <path
          d={`M ${points.join(" L ")}`}
          fill="none"
          stroke={isUp ? "var(--color-green)" : "var(--color-red)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };


  const renderOverviewChart = (timeframe) => {
    const data = overviewChartData[timeframe] || [
      2.48, 2.5, 2.47, 2.52, 2.51, 2.54, 2.53, 2.56, 2.55, 2.57, 2.56,
    ];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 300,
      height = 130,
      paddingX = 10,
      paddingY = 15;
    const points = data.map((val, idx) => {
      const x = paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
      const y =
        height - paddingY - ((val - min) / range) * (height - 2 * paddingY);
      return { x, y };
    });
    const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;
    const fillPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;
    return (
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="chart-svg">
        <defs>
          <linearGradient id="chart-glow-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-green)"
              stopOpacity="0.22"
            />
            <stop
              offset="100%"
              stopColor="var(--color-green)"
              stopOpacity="0.0"
            />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio, idx) => {
          const gridY = paddingY + ratio * (height - 2 * paddingY);
          return (
            <line
              key={idx}
              x1="0"
              y1={gridY}
              x2={width}
              y2={gridY}
              className="chart-grid-line"
            />
          );
        })}
        <path
          d={fillPath}
          className="chart-fill"
          fill="url(#chart-glow-gradient)"
        />
        <path d={linePath} className="chart-line" />
        <text x="10" y={height + 15} className="chart-axis-text">
          00:00
        </text>
        <text x="75" y={height + 15} className="chart-axis-text">
          06:00
        </text>
        <text x="140" y={height + 15} className="chart-axis-text">
          12:00
        </text>
        <text x="205" y={height + 15} className="chart-axis-text">
          18:00
        </text>
        <text x="270" y={height + 15} className="chart-axis-text">
          24:00
        </text>
      </svg>
    );
  };

  const getDisplayedCoins = () => {
    let list = [...coins];
    if (activeTab === "New Listings")
      list = list.filter((coin) => coin.isNewListing);
    else if (activeTab === "Top Gainers")
      list.sort((a, b) => b.change24h - a.change24h);
    else if (activeTab === "Top Losers")
      list.sort((a, b) => a.change24h - b.change24h);
    else if (activeTab === "24h Volume")
      list.sort((a, b) => b.volume24h - a.volume24h);
    if (activeCategory !== "All")
      list = list.filter((coin) => coin.category?.includes(activeCategory));
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query),
      );
    }
    if (sortConfig.key) {
      list.sort((a, b) => {
        let aVal = a[sortConfig.key],
          bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  };

  const displayedCoins = getDisplayedCoins();
  const visibleCoins = displayedCoins.slice(0, visibleLimit);

  const handleViewMoreToggle = () => {
    setVisibleLimit(
      visibleLimit >= displayedCoins.length ? 8 : displayedCoins.length,
    );
  };

  return (
    <div className="market-data-container container-fluid p-0">

      {/* HERO HEADER */}
      <header className="hero-header d-flex justify-content-between align-items-center">
        {/* <div>
          <h1 className="hero-title text-left">Market Data</h1>
          <p className="hero-subtitle">
            Real-time market overview and cryptocurrency data
          </p>
        </div> */}
        {/* {isSocketConnected && (
          <div className="socket-live-indicator d-flex align-items-center gap-2">
            <span className="live-dot animate-pulse"></span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-green)",
                fontWeight: "600",
              }}
            >
              LIVE STREAMING ACTIVE
            </span>
          </div>
        )} */}
      </header>

      {/* STATS TICKER GRID */}
      <section className="ticker-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Market Cap</span>
          </div>
          <div>
            <div className="stat-value">${marketMetrics.totalMarketCap}T</div>
            <div
              className={`stat-change ${marketMetrics.totalMarketCapChange >= 0 ? "up" : "down"}`}
            >
              {marketMetrics.totalMarketCapChange >= 0 ? "▲" : "▼"}
              {Math.abs(marketMetrics.totalMarketCapChange)}%
            </div>
          </div>
          <div className="stat-chart-container">
            {renderSparkline(
              [
                2.52,
                2.53,
                2.51,
                2.54,
                2.53,
                2.55,
                marketMetrics.totalMarketCap,
              ],
              marketMetrics.totalMarketCapChange,
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">24h Trading Volume</span>
          </div>
          <div>
            <div className="stat-value">${marketMetrics.volume24h}B</div>
            <div
              className={`stat-change ${marketMetrics.volume24hChange >= 0 ? "up" : "down"}`}
            >
              {marketMetrics.volume24hChange >= 0 ? "▲" : "▼"}
              {Math.abs(marketMetrics.volume24hChange)}%
            </div>
          </div>
          <div className="stat-chart-container">
            {renderSparkline(
              [62.5, 64.1, 63.8, 66.2, 65.5, 67.8, marketMetrics.volume24h],
              marketMetrics.volume24hChange,
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">BTC Dominance</span>
          </div>
          <div>
            <div className="stat-value">
              {marketMetrics.btcDominance.toFixed(2)}%
            </div>
            <div
              className={`stat-change ${marketMetrics.btcDominanceChange >= 0 ? "up" : "down"}`}
            >
              {marketMetrics.btcDominanceChange >= 0 ? "▲" : "▼"}
              {Math.abs(marketMetrics.btcDominanceChange)}%
            </div>
          </div>
          <div className="stat-chart-container">
            {renderSparkline(
              [51.8, 51.7, 51.9, 51.6, 51.5, 51.3, marketMetrics.btcDominance],
              marketMetrics.btcDominanceChange,
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ETH Dominance</span>
          </div>
          <div>
            <div className="stat-value">
              {marketMetrics.ethDominance.toFixed(2)}%
            </div>
            <div
              className={`stat-change ${marketMetrics.ethDominanceChange >= 0 ? "up" : "down"}`}
            >
              {marketMetrics.ethDominanceChange >= 0 ? "▲" : "▼"}
              {Math.abs(marketMetrics.ethDominanceChange)}%
            </div>
          </div>
          <div className="stat-chart-container">
            {renderSparkline(
              [
                16.0,
                16.1,
                15.9,
                16.05,
                16.12,
                16.15,
                marketMetrics.ethDominance,
              ],
              marketMetrics.ethDominanceChange,
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Fear & Greed Index</span>
          </div>
          <div className="fg-gauge-wrapper">
            <div className="fg-gauge">
              <svg viewBox="0 0 80 40" className="gauge-svg">
                <defs>
                  <linearGradient
                    id="gauge-gradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#f6465d" />
                    <stop offset="50%" stopColor="#f0b90b" />
                    <stop offset="100%" stopColor="#0ecb81" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10,38 A 30,30 0 0,1 70,38"
                  fill="none"
                  stroke="var(--border-color, #2b3139)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 10,38 A 30,30 0 0,1 70,38"
                  fill="none"
                  stroke="url(#gauge-gradient)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeDasharray="94.2"
                  strokeDashoffset={
                    94.2 - (94.2 * marketMetrics.fearGreedIndex) / 100
                  }
                />
                <line
                  x1="40"
                  y1="38"
                  x2="40"
                  y2="15"
                  stroke="var(--text-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${-90 + (marketMetrics.fearGreedIndex / 100) * 180}, 40, 38)`}
                  style={{ transformOrigin: "40px 38px" }}
                />
                <circle cx="40" cy="38" r="3.5" fill="var(--text-primary)" />
              </svg>
            </div>
            <div className="fg-text-container">
              <span className="fg-value">{marketMetrics.fearGreedIndex}</span>
              <span className="fg-label">
                {marketMetrics.fearGreedIndex >= 70
                  ? "Greed"
                  : marketMetrics.fearGreedIndex >= 50
                    ? "Greed"
                    : "Neutral"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD BODY */}
      <section className="dashboard-body-grid">
        <div className="main-column">
          <div className="table-tabs-header">
            <div className="tabs-group">
              {[
                "Overview",
                "Coins",
                "New Listings",
                "Top Gainers",
                "Top Losers",
                "24h Volume",
              ].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setVisibleLimit(8);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="view-options-bar">
            <div className="category-tags">
              {[
                "All",
                "Layer 1 / Layer 2",
                "DeFi",
                "AI",
                "Gaming",
                "Meme",
                "Metaverse",
                "Storage",
              ].map((cat) => (
                <button
                  key={cat}
                  className={`tag-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsMoreOpen(false);
                  }}
                >
                  {cat}
                </button>
              ))}
              <div className="more-category-container">
                <button
                  className={`tag-btn dropdown-toggle-btn ${additionalCategories.includes(activeCategory) ? "active" : ""}`}
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    {additionalCategories.includes(activeCategory)
                      ? activeCategory
                      : "More"}
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {isMoreOpen && (
                  <div className="more-category-dropdown">
                    {additionalCategories.map((cat) => (
                      <div
                        key={cat}
                        className={`more-category-item ${activeCategory === cat ? "active" : ""}`}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsMoreOpen(false);
                        }}
                      >
                        {cat}
                      </div>
                    ))}
                    {activeCategory !== "All" &&
                      ![
                        "All",
                        "Layer 1 / Layer 2",
                        "DeFi",
                        "AI",
                        "Gaming",
                        "Meme",
                        "Metaverse",
                        "Storage",
                      ].includes(activeCategory) && (
                        <div
                          className="more-category-item reset"
                          onClick={() => {
                            setActiveCategory("All");
                            setIsMoreOpen(false);
                          }}
                          style={{
                            borderTop: "1px solid var(--border-color)",
                            color: "var(--binance-yellow)",
                            padding: "8px 12px",
                          }}
                        >
                          Reset Filter
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
            <div className="table-filter-search">
              <div className="coin-search-container">
                <svg
                  className="coin-search-icon"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="coin-search-input"
                  placeholder="Search Coin"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="btn-filter"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                  setActiveTab("Coins");
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="coins-table-wrapper">
            <table className="coins-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th className="sortable" onClick={() => handleSort("name")}>
                    Name
                  </th>
                  <th
                    className="sortable col-center"
                    onClick={() => handleSort("price")}
                  >
                    Price
                  </th>
                  <th
                    className="sortable col-center"
                    onClick={() => handleSort("change24h")}
                  >
                    24h %
                  </th>
                  <th
                    className="sortable col-center"
                    onClick={() => handleSort("change7d")}
                  >
                    7d %
                  </th>
                  <th
                    className="sortable col-right"
                    onClick={() => handleSort("marketCap")}
                  >
                    Market Cap
                  </th>
                  <th
                    className="sortable col-right"
                    onClick={() => handleSort("volume24h")}
                  >
                    Volume(24h)
                  </th>
                  <th
                    className="sortable col-right"
                    onClick={() => handleSort("supply")}
                  >
                    Circulating Supply
                  </th>
                  <th className="col-center" style={{ width: "100px" }}>
                    Last 7 Days
                  </th>
                  <th className="col-center" style={{ width: "60px" }}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleCoins.length > 0 ? (
                  visibleCoins.map((coin, index) => {
                    const priceFlashKey = `${coin.symbol}-price`;
                    const flashClass =
                      flashStates[priceFlashKey] === "up"
                        ? "flash-up"
                        : flashStates[priceFlashKey] === "down"
                          ? "flash-down"
                          : "";
                    return (
                      <tr key={coin.id}>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {index + 1}
                        </td>
                        <td>
                          <div className="coin-name-cell">
                            <div
                              className="coin-symbol-logo"
                              style={{ backgroundColor: coin.logoColor }}
                            >
                              {coin.symbol[0]}
                            </div>
                            <div className="coin-full-name">
                              <span className="coin-name-text">
                                {coin.name}
                              </span>
                              <span className="coin-symbol-text">
                                {coin.symbol}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={`col-center price-text ${flashClass}`}>
                          $
                          {coin.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: coin.price < 1 ? 4 : 2,
                          })}
                        </td>
                        <td
                          className={`col-center percentage-text ${coin.change24h >= 0 ? "up" : "down"}`}
                        >
                          {coin.change24h >= 0 ? "▲" : "▼"}{" "}
                          {Math.abs(coin.change24h).toFixed(2)}%
                        </td>
                        <td
                          className={`col-center percentage-text ${coin.change7d >= 0 ? "up" : "down"}`}
                        >
                          {coin.change7d >= 0 ? "▲" : "▼"}{" "}
                          {Math.abs(coin.change7d).toFixed(2)}%
                        </td>
                        <td className="col-right">
                          {formatCompact(coin.marketCap)}
                        </td>
                        <td className="col-right">
                          {formatCompact(coin.volume24h)}
                        </td>
                        <td className="col-right" style={{ fontSize: "13px" }}>
                          {coin.supply.toLocaleString()} {coin.symbol}
                        </td>
                        <td className="sparkline-td col-center">
                          {renderSparkline(coin.history, coin.change7d)}
                        </td>
                        <td className="col-center">
                          <button
                            className="btn-detail-icon"
                            onClick={() =>
                              window.open(
                                `/market/${coin.symbol.toUpperCase()}`,
                                "_blank",
                              )
                            }
                            title={`${coin.name} Details`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      No coins match the selected filters or search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            {displayedCoins.length > 8 && (
              <button className="btn-view-more" onClick={handleViewMoreToggle}>
                {visibleLimit >= displayedCoins.length
                  ? "View Less"
                  : "View More"}
              </button>
            )}
          </div>
        </div>

        {/* Side Column */}
        <div className="side-column">
          <div className="market-overview-card">
            <div className="overview-card-header">
              <span className="overview-card-title">Market Overview</span>
              <div className="timeframe-selector">
                {["1D", "7D", "1M", "1Y", "All"].map((tf) => (
                  <button
                    key={tf}
                    className={`timeframe-btn ${chartTimeframe === tf ? "active" : ""}`}
                    onClick={() => setChartTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="overview-meta-data">
              <span className="overview-meta-label">Total Market Cap</span>
              <div className="overview-meta-value">
                ${marketMetrics.totalMarketCap}T
              </div>
              <div
                className={`overview-meta-change ${marketMetrics.totalMarketCapChange >= 0 ? "up" : "down"}`}
              >
                {marketMetrics.totalMarketCapChange >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(marketMetrics.totalMarketCapChange).toFixed(2)}%
              </div>
            </div>
            <div className="main-chart-wrapper">
              {renderOverviewChart(chartTimeframe)}
            </div>
          </div>

          <div className="side-list-card">
            <div className="side-card-header">
              <span className="side-card-title">Top Gainers</span>
              <a
                href="#gainers"
                className="side-card-more-link"
                onClick={() => setActiveTab("Top Gainers")}
              >
                More
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  style={{ marginLeft: "2px" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
            <div className="side-list-container">
              {gainers.map((coin, index) => (
                <div className="side-list-row" key={coin.id}>
                  <div className="side-list-left">
                    <span className="side-list-index">{index + 1}</span>
                    <div className="side-list-coin">
                      <div
                        className="side-coin-logo"
                        style={{ backgroundColor: coin.logoColor }}
                      >
                        {coin.symbol[0]}
                      </div>
                      <span className="side-coin-name">{coin.name}</span>
                      <span className="side-coin-symbol">{coin.symbol}</span>
                    </div>
                  </div>
                  <div className="side-list-right">
                    <span className="side-list-price">
                      $
                      {coin.price.toLocaleString(undefined, {
                        minimumFractionDigits: coin.price < 1 ? 4 : 2,
                      })}
                    </span>
                    <span className="side-list-change up">
                      +{coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="side-list-card">
            <div className="side-card-header">
              <span className="side-card-title">Top Losers</span>
              <a
                href="#losers"
                className="side-card-more-link"
                onClick={() => setActiveTab("Top Losers")}
              >
                More{" "}
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  style={{ marginLeft: "2px" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
            <div className="side-list-container">
              {losers.map((coin, index) => (
                <div className="side-list-row" key={coin.id}>
                  <div className="side-list-left">
                    <span className="side-list-index">{index + 1}</span>
                    <div className="side-list-coin">
                      <div
                        className="side-coin-logo"
                        style={{ backgroundColor: coin.logoColor }}
                      >
                        {coin.symbol[0]}
                      </div>
                      <span className="side-coin-name">{coin.name}</span>
                      <span className="side-coin-symbol">{coin.symbol}</span>
                    </div>
                  </div>
                  <div className="side-list-right">
                    <span className="side-list-price">
                      $
                      {coin.price.toLocaleString(undefined, {
                        minimumFractionDigits: coin.price < 1 ? 4 : 2,
                      })}
                    </span>
                    <span className="side-list-change down">
                      {coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketData;
