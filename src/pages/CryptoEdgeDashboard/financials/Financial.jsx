import React, { useState, useEffect, useCallback } from 'react';
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


  // Sync selected symbol from prop
  useEffect(() => {
    if (selectedSymbolProp) {
      setSelectedSymbol(cleanSymbol(selectedSymbolProp));
    }
  }, [selectedSymbolProp]);

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

  if (!liveData) {
    return (
      <div className="finance-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: isSubComponent ? '100%' : '100vh', flexDirection: 'column' }}>
        <Spinner />
      </div>
    );
  }


  const {
    symbol, name, price, change24h, volume24h, high24h, low24h, marketCap, fdv,
    fundamentals, depth, onChain, social, indicators, predictions
  } = liveData;

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
  const sentimentAngle = (Number(social?.sentiment || 50) / 100) * 180 - 90;

  const contractRisk = 2.0;
  const marketRisk = change24h < -5 ? 8.0 : change24h < 0 ? 5.0 : 3.0;
  const liqRisk = activeDepth?.liquidityRisk === 'High' ? 7.0 : activeDepth?.liquidityRisk === 'Medium' ? 4.5 : 2.0;
  const regRisk = selectedSymbol === 'BTC' ? 3.0 : 5.0;
  const overallRisk = ((contractRisk + marketRisk + liqRisk + regRisk) / 4).toFixed(1);

  // 6-axis Radar chart points (Security, Technology, Liquidity, Adoption, Tokenomics, Team)
  const axes = [
    parseFloat(fundamentals?.securityScore) || 8.5, // Security
    (fundamentals?.progress || 75) / 10,           // Technology
    10 - liqRisk,                                   // Liquidity
    (social?.sentiment || 50) / 10,                 // Adoption
    7.8,                                            // Tokenomics
    7.5                                             // Team
  ];
  const radarPoints = axes.map((val, i) => {
    const angle = (i * 2 * Math.PI) / 6;
    const dist = (val / 10) * 35; // max radius 35
    const x = 50 + dist * Math.sin(angle);
    const y = 50 - dist * Math.cos(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');


  // Rating and star calculations
  let ratingBase = 3.5;
  if (change24h > 0) ratingBase += 0.4;
  else ratingBase -= 0.3;
  if (indicators?.rsi > 50 && indicators?.rsi < 70) ratingBase += 0.3;
  if (indicators?.macdSignal === 'Bullish') ratingBase += 0.3;
  if (Number(price) > Number(indicators?.sma50)) ratingBase += 0.3;
  if (Number(price) > Number(indicators?.sma200)) ratingBase += 0.2;
  const ratingVal = Math.min(5, Math.max(1, ratingBase));
  const fullStars = Math.floor(ratingVal);
  const halfStar = ratingVal - fullStars >= 0.4 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  const starsStr = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  const ratingText = ratingVal >= 4.5 ? 'Strong Buy' : ratingVal >= 3.8 ? 'Buy' : ratingVal >= 2.8 ? 'Hold' : 'Underperform';

  return (
    <div className="finance-dashboard">
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
          starsStr={starsStr}
          ratingVal={ratingVal}
          ratingText={ratingText}
          onChain={onChain}
          formatNum={formatNum}
          formatLarge={formatLarge}
        />
      </div>
    </div>
  );
}