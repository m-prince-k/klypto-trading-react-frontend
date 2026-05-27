import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import './Financial.css';

// Import split subcomponents
import FinancialHeader from '../../../../src/components/dashboard/financials/FinancialHeader';
import FinancialOverviewSupply from '../../../../src/components/dashboard/financials/FinancialOverviewSupply';
import FinancialPerformanceChart from '../../../../src/components/dashboard/financials/FinancialPerformanceChart';
import FinancialTechOnChain from '../../../../src/components/dashboard/financials/FinancialTechOnChain';
import FinancialSocialRisk from '../../../../src/components/dashboard/financials/FinancialSocialRisk';
import FinancialAdvancedAnalytics from '../../../../src/components/dashboard/financials/FinancialAdvancedAnalytics';
import FinancialFooter from '../../../../src/components/dashboard/financials/FinancialFooter';
import apiService from '../../../services/apiServices';
import socket from '../../../services/websocket/socket';
import { useSocket } from '../../../services/websocket/useSocket';
import { Spinner } from "../../../components/tradingModals/Spinner";


const cleanSymbol = (sym) => {
  if (!sym) return 'BTC';
  return sym.replace(/USDT|BUSD|USD/gi, '').toUpperCase();
};

export default function Financial({ setActiveTab = () => { }, isSubComponent = false, selectedSymbol: selectedSymbolProp = "" }) {
  const [selectedSymbol, setSelectedSymbol] = useState(cleanSymbol(selectedSymbolProp));
  const [selectedPeriod, setSelectedPeriod] = useState('1d');
  const [data, setData] = useState(null);
  const [klines, setKlines] = useState([]);
  const [marketExtra, setMarketExtra] = useState(null);
  const [tvlData, setTvlData] = useState(null);
  const [depthData, setDepthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const hasLoadedOnce = useRef(false);


  // Sync selected symbol from prop
  useEffect(() => {
    if (selectedSymbolProp) {
      const cleaned = cleanSymbol(selectedSymbolProp);
      if (cleaned !== selectedSymbol) {
        setSelectedSymbol(cleaned);
        // Don't clear data — keep stale data visible while new data loads
        setIsUpdating(true);
        setKlines([]);
        setMarketExtra(null);
        setDepthData(null);
      }
    }
  }, [selectedSymbolProp, selectedSymbol]);

  // ── Fetch REST APIs on symbol/period change ─────────────────────────
  // const fetchRESTData = useCallback(async (sym, period) => {
  //   try {
  //     const [klinesRes, marketRes, depthRes] = await Promise.allSettled([
  //       apiService.get(`/financial/klines?symbol=${sym}&period=${period}`),
  //       apiService.get(`/financial/market?symbol=${sym}`),
  //       apiService.get(`/financial/orderbook-depth?symbol=${sym}`),
  //     ]);

  //     if (klinesRes.status === 'fulfilled' && klinesRes.value.success)
  //       setKlines(klinesRes.value.klines || []);

  //     if (marketRes.status === 'fulfilled' && marketRes.value.success)
  //       setMarketExtra(marketRes.value);

  //     if (depthRes.status === 'fulfilled' && depthRes.value.success)
  //       setDepthData(depthRes.value);

  //     // TVL (separate, CoinGecko-independent)
  //     const tvlProtocol = TVL_PROTOCOL_MAP[sym];
  //     if (tvlProtocol) {
  //       apiService.get(`/financial/tvl?protocol=${tvlProtocol}`)
  //         .then(d => { if (d.success) setTvlData(d); })
  //         .catch(() => { });
  //     }
  //   } catch (e) {
  //     console.error('REST fetch error:', e);
  //   }
  // }, []);

  // useEffect(() => {
  //   setLoading(true);
  //   fetchRESTData(selectedSymbol, selectedPeriod);
  // }, [selectedSymbol, selectedPeriod, fetchRESTData]);

  useSocket({
  selectedSymbol,
  cleanSymbol,
  selectedPeriod,
  setTvlData,
  setKlines,
  setDepthData,
  setMarketExtra,
  setFinanceData: (newData) => {
    setData(newData);
    hasLoadedOnce.current = true;
    setLoading(false);
    setIsUpdating(false);
  },
  // selectedSymbolRef,
  // getBaseSymbol,
  // no-ops for unused handlers
  setPrices: () => {},
  setOrderBook: () => {},
  setSocialStats: () => {},
  setFinancials: () => {},
  setAlerts: () => {},
});

  // ── Mock fallback data so tab renders without backend ─────────────


  // ── Socket.IO for live updates ────
  useEffect(() => {
    if (data) {
      setIsUpdating(true);
    }
  }, [selectedSymbol]);

  // Use real data
  const liveData = data;
  const isLoading = loading || !liveData;


  const {
    symbol, name, price, change24h, volume24h, high24h, low24h, marketCap, fdv,
    fundamentals, depth, onChain, social, indicators, predictions, outlook
  } = liveData || {};

  const isUp = change24h >= 0;
  const changeColor = isUp ? 'text-green' : 'text-red';
  const changeSign = isUp ? '+' : '';

  const formatNum = (num, min = 2, max = 2) => Number(num).toLocaleString(undefined, { minimumFractionDigits: min, maximumFractionDigits: max });
  const formatLarge = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return formatNum(num);
  };

  const activeDepth = depth || depthData || {};

  // ── Dynamic Computations for Gauge, Radar & Ratings ─────────────────
  const sentimentAngle = social?.sentiment != null ? (Number(social.sentiment) / 100) * 180 - 90 : 0;

  // All risk values come from backend only — no frontend calculations
  const overallRisk = null; // not provided by backend

  // 6-axis Radar chart — only use real backend data, zero for missing
  const axes = [
    parseFloat(fundamentals?.securityScore) || 0,  // Security (e.g. "9.8 / 10" → 9.8)
    fundamentals?.progress != null ? fundamentals.progress / 10 : 0, // Technology
    activeDepth?.liquidityRisk === 'Low' ? 8 : activeDepth?.liquidityRisk === 'Medium' ? 5 : activeDepth?.liquidityRisk === 'High' ? 2 : 0, // Liquidity from depth
    social?.sentiment != null ? social.sentiment / 10 : 0, // Adoption
    fundamentals?.tokenomicsScore != null ? fundamentals.tokenomicsScore / 10 : 0, // Tokenomics
    fundamentals?.teamScore != null ? fundamentals.teamScore / 10 : 0             // Team
  ];
  const radarPoints = axes.map((val, i) => {
    const angle = (i * 2 * Math.PI) / 6;
    const dist = (val / 10) * 35;
    const x = 50 + dist * Math.sin(angle);
    const y = 50 - dist * Math.cos(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Rating — only compute when we have enough real signals
  const hasRatingData = indicators?.rsi != null || indicators?.macdSignal != null;
  let ratingVal = null;
  let starsStr = 'N/A';
  let ratingText = 'N/A';
  if (hasRatingData) {
    let ratingBase = 2.5; // neutral starting point
    if (change24h > 0) ratingBase += 0.4; else ratingBase -= 0.3;
    if (indicators?.rsi > 50 && indicators?.rsi < 70) ratingBase += 0.3;
    if (indicators?.macdSignal === 'Bullish') ratingBase += 0.3;
    if (Number(price) > Number(indicators?.sma50)) ratingBase += 0.3;
    if (Number(price) > Number(indicators?.sma200)) ratingBase += 0.2;
    ratingVal = Math.min(5, Math.max(1, ratingBase));
    const fullStars = Math.floor(ratingVal);
    const halfStar = ratingVal - fullStars >= 0.4 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    starsStr = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    ratingText = ratingVal >= 4.5 ? 'Strong Buy' : ratingVal >= 3.8 ? 'Buy' : ratingVal >= 2.8 ? 'Hold' : 'Underperform';
  }

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
        className="finance-dashboard"
        style={{
          filter: isLoading ? 'blur(4px)' : 'none',
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto'
        }}
      >
      {/* HEADER */}
      {/* <FinancialHeader
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        name={name}
        symbol={symbol}
        price={price}
        change24h={change24h}
        volume24h={volume24h}
        marketCap={marketCap}
        fundamentals={fundamentals}
        formatNum={formatNum}
        formatLarge={formatLarge}
        changeColor={changeColor}
        changeSign={changeSign}
      /> */}

      {/* ROW 1 */}
      <div className="fin-grid-row">
        <FinancialOverviewSupply
          name={name}
          symbol={symbol}
          price={price}
          change24h={change24h}
          volume24h={volume24h}
          marketCap={marketCap}
          fdv={fdv}
          fundamentals={fundamentals}
          marketExtra={marketExtra}
          formatNum={formatNum}
          formatLarge={formatLarge}
          changeColor={changeColor}
          changeSign={changeSign}
        />
      </div>

      {/* ROW 2 */}
      <div className="fin-grid-row">
        <FinancialPerformanceChart
          price={price}
          change24h={change24h}
          klines={klines}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          volume24h={volume24h}
          formatNum={formatNum}
          formatLarge={formatLarge}
          changeColor={changeColor}
        />

        <FinancialTechOnChain
          fundamentals={fundamentals}
          tvlData={tvlData}
          onChain={onChain}
          formatNum={formatNum}
          formatLarge={formatLarge}
        />
      </div>

      {/* ROW 3 */}
      <div className="fin-grid-row">
        <FinancialSocialRisk
          social={social}
          fundamentals={fundamentals}
          change24h={change24h}
          activeDepth={activeDepth}
          overallRisk={overallRisk}
          sentimentAngle={sentimentAngle}
          radarPoints={radarPoints}
          formatNum={formatNum}
          formatLarge={formatLarge}
        />
      </div>

      {/* ROW 4 */}
      <div className="fin-grid-row">
        <FinancialAdvancedAnalytics
          price={price}
          change24h={change24h}
          fundamentals={fundamentals}
          indicators={indicators}
          predictions={predictions}
          outlook={outlook}
          starsStr={starsStr}
          ratingVal={ratingVal}
          ratingText={ratingText}
          onChain={onChain}
          formatNum={formatNum}
          formatLarge={formatLarge}
        />
      </div>
      </div>
    </div>
  );
}