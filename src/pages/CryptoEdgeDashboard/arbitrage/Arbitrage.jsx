import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FiSearch, FiRefreshCw, FiMenu, FiBell, FiChevronDown, FiChevronUp,
  FiSliders, FiUsers, FiSettings, FiGrid, FiTrendingUp,
  FiPercent, FiClock, FiDownload, FiDollarSign, FiFilter,
  FiRotateCcw, FiChevronRight, FiChevronLeft, FiFileText
} from 'react-icons/fi';
import io from 'socket.io-client';
import './Arbitrage.css';
import socket from '../../../services/websocket/socket';
import ArbitrageStats from '../../../../src/components/dashboard/arbitrage/ArbitrageStats';
import ArbitrageFilters from '../../../../src/components/dashboard/arbitrage/ArbitrageFilters';
import ArbitrageTable from '../../../../src/components/dashboard/arbitrage/ArbitrageTable';
import { useSocket } from '../../../services/websocket/useSocket';

export default function Arbitrage({ setActiveTab = () => { }, isSubComponent = false, selectedSymbol = "" }) {
  const [activeMenu, setActiveMenu] = useState("Arbitrage");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [opportunities, setOpportunities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [priceFlash, setPriceFlash] = useState({});

  const [exchangeFilter, setExchangeFilter] = useState("All");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [instrumentFilter, setInstrumentFilter] = useState("All");
  const [minSpreadRs, setMinSpreadRs] = useState("");
  const [minSpreadPct, setMinSpreadPct] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const autoRefreshRef = useRef(autoRefresh);
  useEffect(() => {
    autoRefreshRef.current = autoRefresh;
  }, [autoRefresh]);

  const [appliedFilters, setAppliedFilters] = useState({
    exchange: "All",
    segment: "All",
    instrument: "All",
    minSpreadRs: "",
    minSpreadPct: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'spreadPct', direction: 'desc' });
  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedSymbol) {
      // Automatically extract the base asset (e.g., BTC from BTCUSDT) to filter the arbitrage table
      const baseAsset = selectedSymbol.replace(/USDT|BUSD|USD/gi, '');
      setInstrumentFilter(baseAsset);
      setAppliedFilters(prev => ({ ...prev, instrument: baseAsset }));
    }
  }, [selectedSymbol]);

  // useEffect(() => {
  //   console.log("🔌 Connecting to Klypto Arbitrage Real-Time WebSocket stream...");

  //   socket.emit("get-arbitrage");

  //   socket.on("arbitrage-response", (res) => {
  //     if (res && res.success && res.data) {
  //       setOpportunities(res.data);
  //       setLastUpdated(new Date().toLocaleTimeString());
  //     }
  //   });

  //   socket.on("arbitrage-update", (res) => {
  //     if (!autoRefreshRef.current) return;
  //     if (res && res.success && res.data) {
  //       setOpportunities(prev => {
  //         const flashes = {};
  //         res.data.forEach(newOpp => {
  //           const oldOpp = prev.find(o => o.id === newOpp.id);
  //           if (oldOpp) {
  //             if (newOpp.buyPrice !== oldOpp.buyPrice) {
  //               flashes[`${newOpp.id}-buy`] = newOpp.buyPrice > oldOpp.buyPrice ? 'up' : 'down';
  //             }
  //             if (newOpp.sellPrice !== oldOpp.sellPrice) {
  //               flashes[`${newOpp.id}-sell`] = newOpp.sellPrice > oldOpp.sellPrice ? 'up' : 'down';
  //             }
  //           }
  //         });
  //         if (Object.keys(flashes).length > 0) {
  //           setPriceFlash(prevFlashes => ({ ...prevFlashes, ...flashes }));
  //           setTimeout(() => {
  //             setPriceFlash(prevFlashes => {
  //               const copy = { ...prevFlashes };
  //               Object.keys(flashes).forEach(k => delete copy[k]);
  //               return copy;
  //             });
  //           }, 1000);
  //         }
  //         return res.data;
  //       });
  //       setLastUpdated(new Date().toLocaleTimeString());
  //     }
  //   });

  //   return () => {
  //     socket.off("arbitrage-response");
  //     socket.off("arbitrage-update");
  //     console.log("❌ Disconnected from Klypto Arbitrage stream.");
  //   };
  // }, []);
  useSocket({
    setPrices: () => { },
    setOrderBook: () => { },
    setFearGreed: () => { },
    setSocialStats: () => { },
    setTvlData: () => { },
    setFinancials: () => { },
    setAlerts: () => { },
    setOpportunities,
    setPriceFlash,
    setLastUpdated,
    getBaseSymbol: (sym) => sym?.replace(/USDT|BUSD|USDC|BTC|ETH$/i, "") ?? "", // ← add this
  });

  const handleApplyFilters = () => {
    setAppliedFilters({
      exchange: exchangeFilter,
      segment: segmentFilter,
      instrument: instrumentFilter,
      minSpreadRs: minSpreadRs,
      minSpreadPct: minSpreadPct
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setExchangeFilter("All");
    setSegmentFilter("All");
    setInstrumentFilter("All");
    setMinSpreadRs("");
    setMinSpreadPct("");
    setAppliedFilters({
      exchange: "All",
      segment: "All",
      instrument: "All",
      minSpreadRs: "",
      minSpreadPct: ""
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities.filter(opp => {
      if (searchTerm && !opp.instrument.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (appliedFilters.exchange !== "All") {
        if (appliedFilters.exchange === "Binance Spot" && opp.buyEx !== "Binance Spot" && opp.sellEx !== "Binance Spot") return false;
        if (appliedFilters.exchange === "Binance Futures" && opp.buyEx !== "Binance Futures" && opp.sellEx !== "Binance Futures") return false;
      }
      if (appliedFilters.segment !== "All" && opp.segment !== appliedFilters.segment) return false;
      if (appliedFilters.instrument !== "All" && !opp.instrument.includes(appliedFilters.instrument)) return false;
      if (appliedFilters.minSpreadRs && opp.spreadRs < parseFloat(appliedFilters.minSpreadRs)) return false;
      if (appliedFilters.minSpreadPct && opp.spreadPct < parseFloat(appliedFilters.minSpreadPct)) return false;
      return true;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [opportunities, searchTerm, appliedFilters, sortConfig]);

  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredOpportunities.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredOpportunities, currentPage]);

  const handleExportCSV = () => {
    if (filteredOpportunities.length === 0) return;
    const headers = ["Coin Pair", "Buy Exchange", "Buy Price ($)", "Sell Exchange", "Sell Price ($)", "Spread ($)", "Spread (%)", "Est. Size"];
    const csvRows = [headers.join(",")];
    filteredOpportunities.forEach(opp => {
      const row = [opp.instrument, opp.buyEx, opp.buyPrice, opp.sellEx, opp.sellPrice, opp.spreadRs, opp.spreadPct, opp.quantity];
      csvRows.push(row.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Arbitrage_Opportunities_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    if (filteredOpportunities.length === 0) {
      return { total: 0, bestRs: 0, bestRsSym: "-", bestPct: 0, bestPctSym: "-", totalSpreadSum: 0 };
    }
    const total = filteredOpportunities.length;
    let bestRs = -Infinity, bestRsSym = "-", bestPct = -Infinity, bestPctSym = "-", totalSpreadSum = 0;
    filteredOpportunities.forEach(opp => {
      totalSpreadSum += opp.spreadRs;
      if (opp.spreadRs > bestRs) { bestRs = opp.spreadRs; bestRsSym = opp.instrument; }
      if (opp.spreadPct > bestPct) { bestPct = opp.spreadPct; bestPctSym = opp.instrument; }
    });
    return {
      total,
      bestRs: bestRs === -Infinity ? 0 : bestRs,
      bestRsSym,
      bestPct: bestPct === -Infinity ? 0 : bestPct,
      bestPctSym,
      totalSpreadSum: parseFloat(totalSpreadSum.toFixed(4))
    };
  }, [filteredOpportunities]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc'
        ? <FiChevronUp className="ms-1 sort-icon-active" />
        : <FiChevronDown className="ms-1 sort-icon-active" />;
    }
    return <FiChevronDown className="ms-1 sort-icon-muted" />;
  };

  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={isSubComponent ? "arbitrage-main-sub" : "arbitrage-wrapper"}>
      <div className={isSubComponent ? "arbitrage-main-sub-content" : "arbitrage-main"}>

        {/* TOP BAR */}
        {!isSubComponent && (
          <header className="main-header">
            <div className="header-left">
              <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <FiMenu />
              </button>
              <h1 className="header-title">Crypto Arbitrage</h1>
            </div>
            <div className="header-right">
              <div className="notification-bell-container">
                <FiBell className="bell-icon" />
                <span className="bell-badge"></span>
              </div>
              <button className="header-refresh-btn" onClick={handleResetFilters}>
                <FiRefreshCw className="refresh-icon" />
                <span>Refresh</span>
              </button>
            </div>
          </header>
        )}

        <div className="content-container container-fluid p-0">

          {/* FILTERS PANEL */}
          <ArbitrageFilters
            exchangeFilter={exchangeFilter} setExchangeFilter={setExchangeFilter}
            segmentFilter={segmentFilter} setSegmentFilter={setSegmentFilter}
            instrumentFilter={instrumentFilter} setInstrumentFilter={setInstrumentFilter}
            minSpreadRs={minSpreadRs} setMinSpreadRs={setMinSpreadRs}
            minSpreadPct={minSpreadPct} setMinSpreadPct={setMinSpreadPct}
            autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh}
            handleResetFilters={handleResetFilters}
            handleApplyFilters={handleApplyFilters}
          />

          {/* STATS CARDS */}
          <ArbitrageStats stats={stats} lastUpdated={lastUpdated} />

          {/* TABLE CONTAINER */}
          <ArbitrageTable
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            currentPage={currentPage} setCurrentPage={setCurrentPage}
            handleExportCSV={handleExportCSV}
            handleSort={handleSort} renderSortIcon={renderSortIcon}
            paginatedData={paginatedData}
            filteredOpportunities={filteredOpportunities}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            getPaginationNumbers={getPaginationNumbers}
            priceFlash={priceFlash}
          />

        </div>
      </div>
    </div>
  );
}