import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MarketData.css';

// Import split subcomponents
import MarketDataHeader from '../../../../src/components/dashboard/marketData/MarketDataHeader';
import MarketDataTickerGrid from '../../../../src/components/dashboard/marketData/MarketDataTickerGrid';
import MarketDataCoinsTable from '../../../../src/components/dashboard/marketData/MarketDataCoinsTable';
import MarketDataSideColumn from '../../../../src/components/dashboard/marketData/MarketDataSideColumn';
import socket from '../../../services/socket';

export default function     MarketData({ 
  setActiveTab: setParentActiveTab = () => {}, 
  isSubComponent = false, 
  selectedSymbol = "" 
}) {
  const navigate = useNavigate();
  
  // Local navigation tabs and filters
  const [activeTab, setActiveTab] = useState('Coins');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartTimeframe, setChartTimeframe] = useState('1D');

  // Categories Dropdown State (More option)
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const additionalCategories = ['Web3', 'NFT', 'RWA', 'Launchpad', 'Infrastructure'];

  // Table pagination state (View More limit)
  const [visibleLimit, setVisibleLimit] = useState(8);

  // Connection State for Real-Time Sockets
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Real-time Lists State
  const [coins, setCoins] = useState([]);
  const [overviewChartData, setOverviewChartData] = useState({});
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState(null);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

  // Flashing cells to highlight tick changes
  const [flashStates, setFlashStates] = useState({});

  // Market metrics states
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

  useEffect(() => {
  if (coins.length > 0) {
    console.log("🟢 Coins state updated:");
    console.log("Length:", coins.length);
    console.table(coins);
  } else {
    console.warn("⚠️ Coins state is empty");
  }
}, [coins]);

  // ── Live WebSocket Integration ─────────────────────────────────────
 useEffect(() => {

  socket.on('connect', () => {
    console.log("🟢 Connected to Live Backend Socket Server!");
    setIsSocketConnected(true);
  });

  socket.on('disconnect', () => {
    console.log("🔴 Disconnected from Live Backend Socket Server!");
    setIsSocketConnected(false);
  });

  // 0. Initial coins + metrics
  socket.on('market-coins-init', (data) => {
    console.log("📥 market-coins-init FULL RESPONSE:", data);

    if (data && data.success) {
      console.log("✅ Coins:", data.coins);
      console.log("📊 Metrics:", data.metrics);
      console.log("📈 Overview Chart:", data.overviewChartData);

      setCoins(data.coins);

      if (data.metrics) {
        setMarketMetrics((prev) => ({
          ...prev,
          ...data.metrics,
        }));
      }

      if (data.overviewChartData) {
        setOverviewChartData(data.overviewChartData);
      }
    } else {
      console.warn("⚠️ Invalid market-coins-init response:", data);
    }
  });

  // 1. Real-time ticker updates
  socket.on('binance-ticker', (data) => {
    // console.log("📡 binance-ticker:", data);

    if (!data || !data.symbol) return;

    const symbolKey = data.symbol.replace('USDT', '').toUpperCase();

    setCoins((prevCoins) => {
      const coinExists = prevCoins.some((c) => c.symbol === symbolKey);
      if (!coinExists) return prevCoins;

      const originalCoin = prevCoins.find((c) => c.symbol === symbolKey);
      const originalPrice = originalCoin ? originalCoin.price : 0;
      const newPrice = Number(data.price);

      if (originalPrice > 0 && newPrice !== originalPrice) {
        const direction = newPrice >= originalPrice ? 'up' : 'down';
        const flashKey = `${symbolKey}-price`;

        console.log(`⚡ ${symbolKey} price ${direction}:`, {
          old: originalPrice,
          new: newPrice,
        });

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
  });

  // 2. Sentiment metrics
  socket.on('binance-sentiment', (data) => {
    // console.log("🧠 binance-sentiment FULL RESPONSE:", data);

    if (!data) return;

    setMarketMetrics((prev) => ({
      ...prev,
      btcDominance:
        parseFloat(data.socialStats?.btcDominance) || prev.btcDominance,
      fearGreedIndex:
        parseInt(data.fearGreed?.value) || prev.fearGreedIndex,
      volume24h:
        parseFloat(
          data.tvlData?.total?.replace('$', '').replace('B', '')
        ) || prev.volume24h,
    }));
  });

  return () => {
    console.log("🧹 Cleaning up socket listeners...");

    socket.off('connect');
    socket.off('disconnect');
    socket.off('market-coins-init');
    socket.off('binance-ticker');
    socket.off('binance-sentiment');
  };

}, []);

  // ── Simulated Fallback ticks when WebSocket is offline ──────────────
  useEffect(() => {
    if (isSocketConnected) return; // Do not run local updates if Sockets are live!

    const interval = setInterval(() => {
      if (coins.length === 0) return;
      const randomIndex = Math.floor(Math.random() * coins.length);
      const coinToUpdate = coins[randomIndex];
      
      const percentageChange = (Math.random() * 0.40 - 0.18) / 100;
      const originalPrice = coinToUpdate.price;
      const newPrice = Number((originalPrice * (1 + percentageChange)).toFixed(coinToUpdate.price < 1 ? 4 : 2));
      const direction = newPrice >= originalPrice ? 'up' : 'down';
      
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
              change24h: Number((coin.change24h + percentageChange * 100).toFixed(2)),
              history: updatedHistory,
            };
          }
          return coin;
        })
      );

      // Tick global mock metrics slightly
      setMarketMetrics((prev) => {
        const mcapTick = (Math.random() * 0.02 - 0.01);
        const fearGreedTick = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return {
          ...prev,
          totalMarketCap: Number((prev.totalMarketCap + mcapTick).toFixed(2)),
          totalMarketCapChange: Number((prev.totalMarketCapChange + mcapTick * 8).toFixed(2)),
          fearGreedIndex: Math.min(Math.max(prev.fearGreedIndex + fearGreedTick, 0), 100),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSocketConnected, coins]);

  // Derived Gainers and Losers state sorted dynamically from active coin feeds
  useEffect(() => {
    if (coins.length === 0) return;
    const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
    setGainers(sorted.slice(0, 5));
    setLosers([...sorted].reverse().slice(0, 5));
  }, [coins]);

  // Handle Header Column Sort Toggle
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Format big numbers
  const formatCompact = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  // Sparkline Generator helper
  const renderSparkline = (dataPoints, change) => {
    if (!dataPoints || dataPoints.length === 0) return null;
    const isUp = change >= 0;
    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = max - min || 1;
    const width = 80;
    const height = 30;
    const padding = 2;

    const points = dataPoints.map((p, idx) => {
      const x = padding + (idx / (dataPoints.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const strokeColor = isUp ? 'var(--color-green)' : 'var(--color-red)';

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // SVG Line Chart for right side card
  const renderOverviewChart = (timeframe) => {
    const data = overviewChartData[timeframe] || [2.48, 2.50, 2.47, 2.52, 2.51, 2.54, 2.53, 2.56, 2.55, 2.57, 2.56];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 300;
    const height = 130;
    const paddingX = 10;
    const paddingY = 15;

    const points = data.map((val, idx) => {
      const x = paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((val - min) / range) * (height - 2 * paddingY);
      return { x, y };
    });

    const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
    const fillPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="chart-svg">
        <defs>
          <linearGradient id="chart-glow-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-green)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio, idx) => {
          const gridY = paddingY + ratio * (height - 2 * paddingY);
          return <line key={idx} x1="0" y1={gridY} x2={width} y2={gridY} className="chart-grid-line" />;
        })}
        <path d={fillPath} className="chart-fill" fill="url(#chart-glow-gradient)" />
        <path d={linePath} className="chart-line" />
        <text x="10" y={height + 15} className="chart-axis-text">00:00</text>
        <text x="75" y={height + 15} className="chart-axis-text">06:00</text>
        <text x="140" y={height + 15} className="chart-axis-text">12:00</text>
        <text x="205" y={height + 15} className="chart-axis-text">18:00</text>
        <text x="270" y={height + 15} className="chart-axis-text">24:00</text>
      </svg>
    );
  };

  // Filter, Sort, and Tab Display Logics
  const getDisplayedCoins = () => {
    let list = [...coins];

    // 1. Tab selection logic
    if (activeTab === 'New Listings') {
      list = list.filter((coin) => coin.isNewListing);
    } else if (activeTab === 'Top Gainers') {
      list.sort((a, b) => b.change24h - a.change24h);
    } else if (activeTab === 'Top Losers') {
      list.sort((a, b) => a.change24h - b.change24h);
    } else if (activeTab === '24h Volume') {
      list.sort((a, b) => b.volume24h - a.volume24h);
    }

    // 2. Category pill logic
    if (activeCategory !== 'All') {
      list = list.filter((coin) => coin.category?.includes(activeCategory));
    }

    // 3. Search text input logic
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
    }

    // 4. Header table sorting logic
    if (sortConfig.key) {
      list.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  };

  const displayedCoins = getDisplayedCoins();
  const visibleCoins = displayedCoins.slice(0, visibleLimit);

  // Toggle visible list size on View More / View Less click
  const handleViewMoreToggle = () => {
    if (visibleLimit >= displayedCoins.length) {
      setVisibleLimit(8); // Collapse back to default size
    } else {
      setVisibleLimit(displayedCoins.length); // Expand list to show all matching
    }
  };

  return (
    <div className="market-data-container container-fluid p-0">
      {/* ================= BINANCE NAVBAR ================= */}
      {!isSubComponent && (
        <nav className="binance-navbar">
          <div className="nav-left">
            <span className="binance-logo" style={{ cursor: 'pointer' }}>
              <span className="logo-icon"></span>
              <span>BINANCE</span>
            </span>
            <ul className="nav-menu">
              <li><span className="nav-link-item">Buy Crypto</span></li>
              <li><span className="nav-link-item">Markets</span></li>
              <li>
                <span className="nav-link-item">
                  Trade 
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </li>
              <li>
                <span className="nav-link-item">
                  Futures
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </li>
              <li><span className="nav-link-item">Earn</span></li>
              <li>
                <span className="nav-link-item">
                  Square
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </li>
              <li>
                <span className="nav-link-item">
                  More
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </li>
            </ul>
          </div>

          <div className="nav-right">
            <div className="nav-search-box">
              <svg className="nav-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" className="nav-search-input" placeholder="Search" />
            </div>
            <button className="btn-deposit">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Deposit
            </button>
            
            <button className="nav-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button className="nav-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            </button>
            <button className="nav-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </button>
            <button className="nav-icon-btn" style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {isSocketConnected && <span className="socket-connected-badge" title="Live WebSocket Active"></span>}
            </button>
            <button className="nav-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            </button>
            <button className="nav-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 3a9 9 0 1 0 9 9"/></svg>
            </button>
          </div>
        </nav>
      )}

      {/* ================= HERO HEADER ================= */}
      {!isSubComponent && (
        <MarketDataHeader isSocketConnected={isSocketConnected} />
      )}

      {/* ================= STATS TICKER GRID ================= */}
      <MarketDataTickerGrid 
        marketMetrics={marketMetrics} 
        renderSparkline={renderSparkline} 
      />

      {/* ================= DASHBOARD BODY ================= */}
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
}