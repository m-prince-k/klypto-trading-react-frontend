import React, { useState, useEffect } from 'react';
import { Spinner } from "../../../components/tradingModals/Spinner"
import * as XLSX from 'xlsx';
import './onChain.css';

import apiService from '../../../services/apiServices';
import OnChainHeader from '../../../components/dashboard/onChain/OnChainHeader';
import OnChainStats from '../../../components/dashboard/onChain/OnChainStats';
import OnChainCharts from '../../../components/dashboard/onChain/OnChainCharts';
import OnChainTables from '../../../components/dashboard/onChain/OnChainTables';
import OnChainModals from '../../../components/dashboard/onChain/OnChainModals';
import { useSocket } from '../../../services/websocket/useSocket';

const OnChain = ({ isSubComponent = false }) => {
  const [data, setData] = useState(null);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState('All Chains');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'chains' | 'protocols' | 'history' | null
  const [modalSearch, setModalSearch] = useState('');

  // Date Picker States
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState('Last 30 Days'); // 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'Custom'
  const [customStartDate, setCustomStartDate] = useState('2024-05-18');
  const [customEndDate, setCustomEndDate] = useState('2024-06-18');

  useEffect(() => {
    // 1. Fetch initial data dynamically from backend REST API
    apiService.post('/api/onchain/data')
      .then(json => {
        if (json && json.success) {
          setData(json.data);
        }
      })
      .catch(err => console.error("Error fetching initial on-chain data:", err));
  }, []);

  useSocket({
    setOnchainData: setData
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.closest('.dropdown') || e.target.closest('.date-picker')) {
        return;
      }
      setChainDropdownOpen(false);
      setExportDropdownOpen(false);
      setDatePickerOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleExport = (format) => {
    if (!data) return;

    const chainsData = data.chains.map(c => ({
      Rank: c.n,
      Chain: c.chain,
      TVL_Billion: c.tvl,
      Change_24h: c.c24,
      Change_7d: c.c7,
      Change_30d: c.c30,
      Dominance: c.dom
    }));

    const protocolsData = data.protocols.map(p => ({
      Rank: p.n,
      Protocol: p.name,
      TVL_Billion: p.val
    }));

    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ chains: chainsData, protocols: protocolsData }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `defi_onchain_metrics_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (format === 'csv') {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Chains TVL Table\n";
      csvContent += "Rank,Chain,TVL(B),24h Change,7d Change,30d Change,Dominance\n";
      chainsData.forEach(row => {
        csvContent += `${row.Rank},${row.Chain},${row.TVL_Billion},${row.Change_24h},${row.Change_7d},${row.Change_30d},${row.Dominance}\n`;
      });
      csvContent += "\nProtocols TVL Table\n";
      csvContent += "Rank,Protocol,TVL(B)\n";
      protocolsData.forEach(row => {
        csvContent += `${row.Rank},${row.Protocol},${row.TVL_Billion}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute("download", `defi_onchain_metrics_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (format === 'xlsx') {
      const wsChains = XLSX.utils.json_to_sheet(chainsData);
      const wsProtocols = XLSX.utils.json_to_sheet(protocolsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsChains, "Chains TVL");
      XLSX.utils.book_append_sheet(wb, wsProtocols, "Protocols TVL");
      XLSX.writeFile(wb, `defi_onchain_metrics_${Date.now()}.xlsx`);
    }
  };

  // Show a loading screen until the backend data is retrieved
  if (!data) {
    return (
      <div className={isSubComponent ? "onchain-wrapper-sub" : "onchain-layout"} style={{ justifyContent: 'center', alignItems: 'center', height: isSubComponent ? '100%' : '100vh', flexDirection: 'column' }}>
        <Spinner />
      </div>
    );
  }

  // Dynamic Filtering Logic
  const chainsList = ['All Chains', ...data.chains.slice(0, 8).map(c => c.chain)];
  const isFiltered = selectedChain !== 'All Chains';
  const filteredChainObj = isFiltered ? data.chains.find(c => c.chain === selectedChain) : null;

  const displayTvl = isFiltered && filteredChainObj ? filteredChainObj.tvl : data.stats.tvl;
  const displayTvlChange = isFiltered && filteredChainObj ? filteredChainObj.c24 : data.stats.tvlChange;
  const displayChains = isFiltered && filteredChainObj ? [filteredChainObj] : data.chains.slice(0, 5);

  // Calculate conic gradient dynamically for the Donut Chart
  const conicParts = displayChains.map((c, idx, arr) => {
    const pct = isFiltered ? 100 : parseFloat(c.dom);
    const start = isFiltered ? 0 : (idx === 0 ? 0 : arr.slice(0, idx).reduce((sum, ch) => sum + parseFloat(ch.dom), 0));
    return `${c.color} ${start}% ${start + pct}%`;
  });

  if (!isFiltered) {
    let accumulatedPercent = data.chains.reduce((sum, c) => sum + parseFloat(c.dom), 0);
    conicParts.push(`var(--color-opt) ${accumulatedPercent}% ${accumulatedPercent + 2.4}%`);
    accumulatedPercent += 2.4;
    conicParts.push(`var(--color-oth) ${accumulatedPercent}% 100%`);
  }

  const donutStyle = {
    background: `conic-gradient(${conicParts.join(', ')})`
  };

  // Scale historical TVL values dynamically based on selected chain dominance
  const displayHistory = isFiltered && filteredChainObj
    ? data.tvlHistory.map((pt, idx) => {
      const dominanceFactor = parseFloat(filteredChainObj.dom) / 100;
      const drift = 1 + Math.sin(idx / 3) * 0.02;
      return {
        ...pt,
        tvl: (parseFloat(pt.tvl) * dominanceFactor * drift).toFixed(2)
      };
    })
    : data.tvlHistory;

  // Filter historical series by selected date picker presets/ranges
  let filteredHistory = displayHistory || [];

  if (dateRangePreset === 'Last 7 Days') {
    filteredHistory = displayHistory.slice(-7);
  } else if (dateRangePreset === 'Last 30 Days') {
    filteredHistory = displayHistory.slice(-30);
  } else if (dateRangePreset === 'Last 90 Days') {
    filteredHistory = displayHistory;
  } else if (dateRangePreset === 'Custom') {
    const startMs = new Date(customStartDate).getTime();
    const endMs = new Date(customEndDate).getTime();
    filteredHistory = displayHistory.filter(h => {
      const currentYear = new Date().getFullYear();
      const pointMs = new Date(`${h.date}, ${currentYear}`).getTime();
      return (!startMs || pointMs >= startMs) && (!endMs || pointMs <= endMs);
    });
    if (filteredHistory.length === 0) {
      filteredHistory = displayHistory;
    }
  }

  const history = filteredHistory;
  let linePath = "M0,150 L500,150";
  let areaPath = "M0,150 L500,150 L500,200 L0,200 Z";
  let lastCircleX = 500;
  let lastCircleY = 150;
  let xAxisLabels = [];
  let yAxisLabels = [];

  if (history.length > 0) {
    const tvlValues = history
      .map(h => parseFloat(h.tvl))
      .filter(v => !isNaN(v) && isFinite(v));

    if (tvlValues.length > 0) {
      const maxTvl = Math.max(...tvlValues) * 1.05;
      const minTvl = Math.max(0, Math.min(...tvlValues) * 0.95);
      const range = maxTvl - minTvl || 1;

      const points = history.map((h, idx) => {
        const val = parseFloat(h.tvl);
        const cleanVal = isNaN(val) ? minTvl : val;
        const x = (idx / (history.length - 1)) * 500;
        const y = 190 - ((cleanVal - minTvl) / range) * 170;
        return { x, y };
      });

      linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      areaPath = `${linePath} L500,200 L0,200 Z`;

      const lastPt = points[points.length - 1];
      lastCircleX = lastPt.x;
      lastCircleY = lastPt.y;

      yAxisLabels = Array.from({ length: 6 }, (_, i) => {
        const val = maxTvl - (i * (maxTvl - minTvl) / 5);
        return `$${val.toFixed(1)}B`;
      });

      const step = Math.floor(history.length / 6) || 1;
      for (let i = 0; i < history.length; i += step) {
        if (xAxisLabels.length < 6 && history[i]) {
          xAxisLabels.push(history[i].date);
        }
      }
      if (xAxisLabels.length < 7 && history[history.length - 1]) {
        xAxisLabels.push(history[history.length - 1].date);
      }
    }
  }

  return (
    <div className={isSubComponent ? "onchain-wrapper-sub" : "onchain-layout"}>
      <main className="onchain-main">
        {/* Header */}
        <OnChainHeader
          chainsList={chainsList}
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          dateRangePreset={dateRangePreset}
          setDateRangePreset={setDateRangePreset}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          chainDropdownOpen={chainDropdownOpen}
          setChainDropdownOpen={setChainDropdownOpen}
          datePickerOpen={datePickerOpen}
          setDatePickerOpen={setDatePickerOpen}
          exportDropdownOpen={exportDropdownOpen}
          setExportDropdownOpen={setExportDropdownOpen}
          handleExport={handleExport}
        />

        {/* Stats Grid */}
        <OnChainStats
          data={data}
          displayTvl={displayTvl}
          displayTvlChange={displayTvlChange}
        />

        {/* Middle Charts Row */}
        <OnChainCharts
          dateRangePreset={dateRangePreset}
          setDateRangePreset={setDateRangePreset}
          yAxisLabels={yAxisLabels}
          areaPath={areaPath}
          linePath={linePath}
          lastCircleX={lastCircleX}
          lastCircleY={lastCircleY}
          xAxisLabels={xAxisLabels}
          history={history}
          displayTvl={displayTvl}
          donutStyle={donutStyle}
          data={data}
          displayChains={displayChains}
          isFiltered={isFiltered}
          setActiveModal={setActiveModal}
          setModalSearch={setModalSearch}
        />

        {/* Bottom Tables Row */}
        <OnChainTables
          data={data}
          setActiveModal={setActiveModal}
          setModalSearch={setModalSearch}
        />
      </main>

      {/* Dynamic Popups/Modals */}
      <OnChainModals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        modalSearch={modalSearch}
        setModalSearch={setModalSearch}
        data={data}
      />
    </div>
  );
};

export default OnChain;