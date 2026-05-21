import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./MarketData.css";
import socket from "../../../services/websocket/socket"; // ← use shared socket, not io()
import MarketDataHeader from "../../../components/dashboard/marketData/MarketDataHeader";
import MarketDataTickerGrid from "../../../components/dashboard/marketData/MarketDataTickerGrid";
import MarketDataCoinsTable from "../../../components/dashboard/marketData/MarketDataCoinsTable";
import MarketDataSideColumn from "../../../components/dashboard/marketData/MarketDataSideColumn";

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

  const displayedCoins = useMemo(() => {
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
  }, [coins, activeTab, activeCategory, searchQuery, sortConfig]);
  const visibleCoins = displayedCoins.slice(0, visibleLimit);

  const handleViewMoreToggle = () => {
    setVisibleLimit(
      visibleLimit >= displayedCoins.length ? 8 : displayedCoins.length,
    );
  };

  return (
    <div className="market-data-container container-fluid p-0">
      <MarketDataHeader isSocketConnected={isSocketConnected} />

      <MarketDataTickerGrid
        marketMetrics={marketMetrics}
        renderSparkline={renderSparkline}
      />

      <section className="dashboard-body-grid">
        <MarketDataCoinsTable
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isMoreOpen={isMoreOpen}
          setIsMoreOpen={setIsMoreOpen}
          additionalCategories={additionalCategories}
          visibleCoins={visibleCoins}
          flashStates={flashStates}
          sortConfig={sortConfig}
          handleSort={handleSort}
          formatCompact={formatCompact}
          renderSparkline={renderSparkline}
          handleViewMoreToggle={handleViewMoreToggle}
          displayedCoins={displayedCoins}
          visibleLimit={visibleLimit}
          navigate={navigate}
        />

        <MarketDataSideColumn
          chartTimeframe={chartTimeframe}
          setChartTimeframe={setChartTimeframe}
          marketMetrics={marketMetrics}
          renderOverviewChart={renderOverviewChart}
          gainers={gainers}
          losers={losers}
          setActiveTab={setActiveTab}
        />
      </section>
    </div>
  );
};

export default MarketData;
