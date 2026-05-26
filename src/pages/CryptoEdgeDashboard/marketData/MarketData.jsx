import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./MarketData.css";
import { useSocket } from "../../../services/websocket/useSocket";
import MarketDataHeader from "../../../components/dashboard/marketData/MarketDataHeader";
import MarketDataTickerGrid from "../../../components/dashboard/marketData/MarketDataTickerGrid";
import MarketDataCoinsTable from "../../../components/dashboard/marketData/MarketDataCoinsTable";
import MarketDataSideColumn from "../../../components/dashboard/marketData/MarketDataSideColumn";
import { Spinner } from "../../../components/tradingModals/Spinner";

const MarketData = ({ coins, setCoins, marketMetrics, setMarketMetrics, overviewChartData, setOverviewChartData, flashStates, setFlashStates }) => {
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isSocketConnected, setIsSocketConnected] = useState(true);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc",
  });

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
        if (!prev) return prev;
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
    if (!coins?.length) return;

    const validCoins = coins.filter(c => typeof c.change24h === "number");

    const gainers = [...validCoins]
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 7);

    const losers = [...validCoins]
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 7);

    setGainers(gainers);
    setLosers(losers);
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
    // Normalize timeframe key (e.g., 'All' to 'ALL') to match backend payload
    const tfKey = timeframe.toUpperCase();
    const data = overviewChartData?.[tfKey] || [
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
        
        {(() => {
          const labelsMap = {
            "1D": ["00:00", "06:00", "12:00", "18:00", "24:00"],
            "7D": ["Mon", "Tue", "Thu", "Sat", "Sun"],
            "1M": ["1st", "8th", "15th", "22nd", "30th"],
            "1Y": ["Jan", "Apr", "Jul", "Oct", "Dec"],
            "ALL": ["2020", "2021", "2022", "2023", "2024"]
          };
          const labels = labelsMap[tfKey] || labelsMap["1D"];
          
          // Original X positions were: 10, 75, 140, 205, 270
          const xPositions = [10, 75, 140, 205, 270];
          
          return labels.map((label, i) => (
            <text key={i} x={xPositions[i]} y={height + 15} className="chart-axis-text">
              {label}
            </text>
          ));
        })()}
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
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (coin) =>
          coin.symbol.toLowerCase().includes(q) ||
          coin.name.toLowerCase().includes(q),
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

  // Reset to first page when filters or page limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeCategory, searchQuery, sortConfig, itemsPerPage]);

  const totalPages = Math.ceil(displayedCoins.length / itemsPerPage);
  const visibleCoins = displayedCoins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // if (!coins || coins.length === 0) {
  //     return (
  //         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
  //             <Spinner />
  //         </div>
  //     );
  // }

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
          displayedCoins={displayedCoins}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalPages={totalPages}
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
