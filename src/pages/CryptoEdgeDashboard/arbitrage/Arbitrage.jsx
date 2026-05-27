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
import { Spinner } from "../../../components/tradingModals/Spinner";

export default function Arbitrage({ setActiveTab = () => { }, isSubComponent = false }) {
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
  const [loading, setLoading] = useState(true);

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


  useSocket({
    setPrices: () => { },
    setOrderBook: () => { },
    setFearGreed: () => { },
    setSocialStats: () => { },
    setTvlData: () => { },
    setFinancials: () => { },
    setAlerts: () => { },
    setOpportunities: (data) => {
      if (autoRefreshRef.current) {
        setOpportunities(data);
      }
    },
    setLoading,
    setPriceFlash: (data) => {
      if (autoRefreshRef.current) setPriceFlash(data);
    },
    setLastUpdated: (data) => {
      if (autoRefreshRef.current) setLastUpdated(data);
    },
    getBaseSymbol: (sym) => sym?.replace(/USDT|BUSD|USDC|BTC|ETH$/i, "") ?? "", // ← add this
  });

  // Data fetch and fallback loading timeout are now handled globally in useSocket.js

  useEffect(() => {
    if (opportunities.length > 0) {
      setLoading(false);
    }
  }, [opportunities]);


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

  const isLoading = loading;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999
        }}>
          <Spinner />
        </div>
      )}
      <div
        className={isSubComponent ? "arbitrage-main-sub" : "arbitrage-wrapper"}
        style={{
          filter: isLoading ? 'blur(4px)' : 'none',
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto'
        }}
      >
        <div className={isSubComponent ? "arbitrage-main-sub-content" : "arbitrage-main"}>

          {/* TOP BAR */}

          <header className="main-header">
            <div className="header-left">
              <div>
                <h1 className="header-title text-left">Arbitrage</h1>
                <p className="header-subtitle">Real-time cross-exchange arbitrage opportunities</p>
              </div>
            </div>
            <div className="header-right">

              <button className="header-refresh-btn" onClick={handleResetFilters}>
                <FiRefreshCw className="refresh-icon" />
                <span>Refresh</span>
              </button>
            </div>
          </header>


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
    </div>
  );
}