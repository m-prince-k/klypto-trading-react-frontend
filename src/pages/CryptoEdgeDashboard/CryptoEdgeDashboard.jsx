import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './CryptoEdgeDashboard.css';

const CryptoEdgeDashboard = () => {
  // -------------------------------------------------------------
  // Dynamic Real-time States
  // -------------------------------------------------------------
  const [selectedSymbol, setSelectedSymbol] = useState('BTC'); // 'BTC', 'ETH', 'SOL'
  const [prices, setPrices] = useState({
    BTC: { price: '68,430.10', change: '+1.32%', high: '69,120.00', low: '67,580.00', volume: '116.42B', isUp: true },
    ETH: { price: '3,715.62', change: '+2.65%', high: '3,790.00', low: '3,650.00', volume: '45.10B', isUp: true },
    SOL: { price: '152.21', change: '+3.21%', high: '155.80', low: '148.10', volume: '12.80B', isUp: true },
    TOTAL_MCAP: { val: '2.45T', change: '+2.35%', isUp: true },
    VOL_24H: { val: '116.42B', change: '+6.12%', isUp: true }
  });

  const [candles, setCandles] = useState([
    { time: Math.floor(Date.now() / 1000) - 10 * 60, open: 68100, high: 68300, low: 68000, close: 68250, volume: 15 },
    { time: Math.floor(Date.now() / 1000) - 9 * 60, open: 68250, high: 68450, low: 68200, close: 68300, volume: 10 },
    { time: Math.floor(Date.now() / 1000) - 8 * 60, open: 68300, high: 68500, low: 68250, close: 68450, volume: 18 },
    { time: Math.floor(Date.now() / 1000) - 7 * 60, open: 68450, high: 68600, low: 68400, close: 68550, volume: 14 },
    { time: Math.floor(Date.now() / 1000) - 6 * 60, open: 68550, height: 68650, low: 68450, close: 68500, volume: 16 },
    { time: Math.floor(Date.now() / 1000) - 5 * 60, open: 68500, high: 68700, low: 68480, close: 68650, volume: 12 },
    { time: Math.floor(Date.now() / 1000) - 4 * 60, open: 68650, high: 68800, low: 68600, close: 68750, volume: 22 },
    { time: Math.floor(Date.now() / 1000) - 3 * 60, open: 68750, high: 68850, low: 68700, close: 68780, volume: 25 },
    { time: Math.floor(Date.now() / 1000) - 2 * 60, open: 68780, high: 68900, low: 68750, close: 68820, volume: 16 },
    { time: Math.floor(Date.now() / 1000) - 1 * 60, open: 68820, high: 68950, low: 68800, close: 68880, volume: 20 }
  ]);

  const tvContainerRef = React.useRef(null);

  const getDefaultOrderBook = (symbol) => {
    if (symbol === 'ETH') {
      return {
        asks: [
          { price: '3,718.50', size: '4.250', total: '4.250' },
          { price: '3,717.90', size: '10.120', total: '14.370' },
          { price: '3,717.10', size: '6.540', total: '20.910' },
          { price: '3,716.50', size: '12.420', total: '33.330' },
          { price: '3,716.00', size: '8.150', total: '41.480' },
          { price: '3,715.50', size: '15.890', total: '57.370' }
        ],
        bids: [
          { price: '3,714.80', size: '8.500', total: '8.500' },
          { price: '3,714.20', size: '14.200', total: '22.700' },
          { price: '3,713.80', size: '9.660', total: '32.360' },
          { price: '3,713.10', size: '23.110', total: '55.470' },
          { price: '3,712.50', size: '12.980', total: '68.450' },
          { price: '3,712.00', size: '18.150', total: '86.600' }
        ],
        spread: '0.70 (0.018%)'
      };
    } else if (symbol === 'SOL') {
      return {
        asks: [
          { price: '152.65', size: '45.200', total: '45.200' },
          { price: '152.55', size: '120.500', total: '165.700' },
          { price: '152.45', size: '89.100', total: '254.800' },
          { price: '152.35', size: '154.200', total: '409.000' },
          { price: '152.28', size: '75.400', total: '484.400' },
          { price: '152.22', size: '210.800', total: '695.200' }
        ],
        bids: [
          { price: '152.18', size: '95.500', total: '95.500' },
          { price: '152.12', size: '140.200', total: '235.700' },
          { price: '152.05', size: '189.600', total: '425.300' },
          { price: '151.98', size: '310.100', total: '735.400' },
          { price: '151.90', size: '150.900', total: '886.300' },
          { price: '151.85', size: '280.150', total: '1166.450' }
        ],
        spread: '0.04 (0.026%)'
      };
    } else {
      return {
        asks: [
          { price: '68,434.20', size: '0.850', total: '0.850' },
          { price: '68,433.80', size: '1.120', total: '1.970' },
          { price: '68,433.10', size: '0.540', total: '2.510' },
          { price: '68,432.50', size: '1.240', total: '3.750' },
          { price: '68,431.90', size: '0.415', total: '4.165' },
          { price: '68,431.10', size: '2.890', total: '7.055' }
        ],
        bids: [
          { price: '68,429.10', size: '0.850', total: '0.850' },
          { price: '68,428.50', size: '1.420', total: '2.270' },
          { price: '68,427.80', size: '0.660', total: '2.930' },
          { price: '68,427.20', size: '3.110', total: '6.040' },
          { price: '68,426.90', size: '0.980', total: '7.020' },
          { price: '68,426.10', size: '1.150', total: '8.170' }
        ],
        spread: '2.00 (0.003%)'
      };
    }
  };

  // Dynamically load the Official TradingView Technical Analysis Widget
  useEffect(() => {
    let script = document.getElementById('tradingview-widget-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.async = true;
      document.head.appendChild(script);
    }

    const initWidget = () => {
      if (typeof window.TradingView !== 'undefined' && tvContainerRef.current) {
        tvContainerRef.current.innerHTML = ''; // Clear prior embedded chart
        const tvDivId = `tv-embed-${selectedSymbol.toLowerCase()}`;
        const tvDiv = document.createElement('div');
        tvDiv.id = tvDivId;
        tvDiv.style.width = '100%';
        tvDiv.style.height = '100%';
        tvContainerRef.current.appendChild(tvDiv);

        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${selectedSymbol}USDT`,
          interval: "1", // 1-minute interval for ultra-fast, live tick updates
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1", // Candlesticks style
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: false, // Show technical analysis side tools
          allow_symbol_change: true, // Allow user to search and change symbols!
          container_id: tvDivId,
          studies: [
            "RSI@tv-basicstudies",
            "MASimple@tv-basicstudies"
          ],
          show_popup_button: false,
          backgroundColor: "#07090e",
          gridColor: "rgba(255, 255, 255, 0.02)",
        });
      }
    };

    if (window.TradingView) {
      initWidget();
    } else {
      script.addEventListener('load', initWidget);
    }
  }, [selectedSymbol]);

  const [orderBook, setOrderBook] = useState({
    asks: [
      { price: '68,434.20', size: '0.850', total: '0.850' },
      { price: '68,433.80', size: '1.120', total: '1.970' },
      { price: '68,433.10', size: '0.540', total: '2.510' },
      { price: '68,432.50', size: '1.240', total: '3.750' },
      { price: '68,431.90', size: '0.415', total: '4.165' },
      { price: '68,431.10', size: '2.890', total: '7.055' },
      { price: '68,430.80', size: '0.912', total: '7.967' },
      { price: '68,430.50', size: '1.500', total: '9.467' }
    ],
    bids: [
      { price: '68,429.10', size: '0.850', total: '0.850' },
      { price: '68,428.50', size: '1.420', total: '2.270' },
      { price: '68,427.80', size: '0.660', total: '2.930' },
      { price: '68,427.20', size: '3.110', total: '6.040' },
      { price: '68,426.90', size: '0.980', total: '7.020' },
      { price: '68,426.10', size: '1.150', total: '8.170' },
      { price: '68,425.50', size: '0.450', total: '8.620' },
      { price: '68,425.00', size: '2.300', total: '10.920' }
    ],
    spread: '1.40 (0.002%)'
  });

  const [fearGreed, setFearGreed] = useState({
    value: 72,
    label: 'Greed',
    yesterday: 68,
    lastWeek: 61
  });

  const [socialStats, setSocialStats] = useState({
    btcDominance: '35.4%',
    altRank: '#25',
    narrativeScores: { DeFi: 82, AI: 76, Memecoons: 69, Layer2: 71, RWA: 64, Gaming: 58, NFT: 42 },
    radarValues: { vol: 88, dom: 74, eng: 81, mktDom: 65, sent: 78 }
  });

  const [tvlData, setTvlData] = useState({
    total: '$84.62B',
    chains: [
      { name: 'Ethereum', val: '49.82B', pct: 58.8, color: '#6366f1' },
      { name: 'Tron', val: '9.14B', pct: 10.8, color: '#3b82f6' },
      { name: 'BSC', val: '6.45B', pct: 7.6, color: '#10b981' },
      { name: 'Arbitrum', val: '3.21B', pct: 3.8, color: '#a78bfa' },
      { name: 'Solana', val: '2.84B', pct: 3.3, color: '#f59e0b' },
      { name: 'Others', val: '13.16B', pct: 15.7, color: '#f97316' }
    ],
    protocols: [
      { name: 'Lido Finance', cat: 'Liquid Staking', val: 27.18, change: 4.12, icon: 'L', color: '#627eea' },
      { name: 'AAVE', cat: 'Lending', val: 12.42, change: -1.05, icon: 'A', color: '#4a6da7' },
      { name: 'EigenLayer', cat: 'Restaking', val: 11.85, change: 8.41, icon: 'E', color: '#3b82f6' },
      { name: 'MakerDAO', cat: 'CDP / Stable', val: 9.12, change: 0.50, icon: 'M', color: '#ff5a00' }
    ]
  });

  const [financials, setFinancials] = useState({
    revenue: '$3.24M',
    whaleBuy: '342.7M',
    whaleSell: '157.3M'
  });

  const [arbitrage, setArbitrage] = useState([
    { symbol: 'BTC/USDT', binance: '68,430.10', bybit: '68,431.50', okx: '68,429.80', spread: '+1.70' },
    { symbol: 'ETH/USDT', binance: '3,715.62', bybit: '3,716.20', okx: '3,715.10', spread: '+1.10' },
    { symbol: 'SOL/USDT', binance: '152.21', bybit: '152.45', okx: '152.10', spread: '+0.35' }
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'whale', msg: 'Whale alert: 1,200 BTC ($82.1M) moved from unknown wallet to Binance.', time: '1m ago' },
    { id: 2, type: 'tvl', msg: 'TVL surge: Lido Finance TVL increased by $1.2B (+3.2%) in the last 4 hours.', time: '14m ago' },
    { id: 3, type: 'social', msg: 'Social spike: LunarCrush alerts #AI narrative dominance up by 14.2%.', time: '28m ago' }
  ]);

  // Synchronize Ref with State to keep socket event listeners always updated
  const selectedSymbolRef = React.useRef(selectedSymbol);
  useEffect(() => {
    selectedSymbolRef.current = selectedSymbol;
    // Instantly reset the order book when active symbol switches
    setOrderBook(getDefaultOrderBook(selectedSymbol));
  }, [selectedSymbol]);

  // -------------------------------------------------------------
  // WebSocket Connection & Real-time Listeners
  // -------------------------------------------------------------
  useEffect(() => {
    // Connect to Backend Socket.IO Server
    const socket = io('http://localhost:7000');

    console.log("🔌 Initialized WebSocket Client Connection to Backend...");

    // 1. Live Ticker Updates
    socket.on('binance-ticker', (data) => {
      setPrices(prev => {
        const symbolKey = data.symbol === 'BTCUSDT' ? 'BTC' : (data.symbol === 'ETHUSDT' ? 'ETH' : 'SOL');
        const formattedPrice = Number(data.price).toLocaleString(undefined, { minimumFractionDigits: 2 });
        const pctChangeNum = Number(data.changePct);
        const formattedChange = (pctChangeNum >= 0 ? '+' : '') + pctChangeNum.toFixed(2) + '%';
        const formattedHigh = Number(data.high || data.price * 1.01).toLocaleString(undefined, { maximumFractionDigits: 2 });
        const formattedLow = Number(data.low || data.price * 0.99).toLocaleString(undefined, { maximumFractionDigits: 2 });
        const formattedVol = (Number(data.volume || 1000) / 1000).toFixed(2) + 'K';

        const updated = { ...prev };
        updated[symbolKey] = {
          price: formattedPrice,
          change: formattedChange,
          high: formattedHigh,
          low: formattedLow,
          volume: formattedVol,
          isUp: pctChangeNum >= 0
        };

        // Dynamically shift Total Mcap and Vol 24h as well
        if (data.symbol === 'BTCUSDT') {
          const btcMcap = (Number(data.price) * 19.7) / 1000000;
          updated.TOTAL_MCAP = {
            val: (2.4 + (btcMcap - 1.34) * 0.05).toFixed(2) + 'T',
            change: formattedChange,
            isUp: pctChangeNum >= 0
          };
        }

        return updated;
      });
    });

    // 2. Live Order Book Updates
    socket.on('binance-orderbook', (data) => {
      if (!data || !Array.isArray(data.asks) || !Array.isArray(data.bids)) return;

      const activeSymbol = selectedSymbolRef.current;
      const targetSocketSymbol = `${activeSymbol}USDT`;
      
      // Filter ticks matching the active symbol
      if (data.symbol !== targetSocketSymbol) return;

      const formattedAsks = data.asks.slice(0, 8).map((ask, index, arr) => {
        const price = Number(ask[0]);
        const size = Number(ask[1]);
        const total = arr.slice(0, index + 1).reduce((sum, item) => sum + Number(item[1]), 0);
        return { price: price.toFixed(2), size: size.toFixed(3), total: total.toFixed(3) };
      });

      const formattedBids = data.bids.slice(0, 8).map((bid, index, arr) => {
        const price = Number(bid[0]);
        const size = Number(bid[1]);
        const total = arr.slice(0, index + 1).reduce((sum, item) => sum + Number(item[1]), 0);
        return { price: price.toFixed(2), size: size.toFixed(3), total: total.toFixed(3) };
      });

      const rawSpread = Number(data.asks[0][0]) - Number(data.bids[0][0]);
      const spreadPct = (rawSpread / Number(data.bids[0][0])) * 100;
      const formattedSpread = `${rawSpread.toFixed(2)} (${spreadPct.toFixed(4)}%)`;

      setOrderBook({
        asks: formattedAsks,
        bids: formattedBids,
        spread: formattedSpread
      });

      // Update Arbitrage metrics dynamically based on live prices for all symbols
      setArbitrage(prev => {
        return prev.map(item => {
          const sym = item.symbol.split('/')[0]; // 'BTC', 'ETH', 'SOL'
          if (data.symbol === `${sym}USDT`) {
            const basePrice = Number(data.asks[0][0]);
            return {
              symbol: `${sym}/USDT`,
              binance: basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
              bybit: (basePrice + (sym === 'BTC' ? 1.20 : sym === 'ETH' ? 0.60 : 0.25)).toLocaleString(undefined, { minimumFractionDigits: 2 }),
              okx: (basePrice - (sym === 'BTC' ? 0.90 : sym === 'ETH' ? 0.50 : 0.15)).toLocaleString(undefined, { minimumFractionDigits: 2 }),
              spread: `+${(sym === 'BTC' ? 2.10 : sym === 'ETH' ? 1.10 : 0.40).toFixed(2)}`
            };
          }
          return item;
        });
      });
    });

    // 3. Live Indicator Signal Changes (Simulated crosses or calculated data stream)
    socket.on('binance-kline', (data) => {
      const activeSymbol = selectedSymbolRef.current;
      const targetSocketSymbol = `${activeSymbol}USDT`;
      
      if (data.symbol === targetSocketSymbol) {
        const c = data.candle;
        const newCandle = {
          time: c.time,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume)
        };

        setCandles(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].time === newCandle.time) {
            updated[updated.length - 1] = newCandle;
          } else {
            updated.push(newCandle);
          }
          return updated.slice(-10);
        });
      }

      // Trigger live alert feed updates dynamically on new kline cycles
      if (data.candle && data.candle.isFinal) {
        const randAlert = {
          id: Date.now(),
          type: Math.random() > 0.5 ? 'tvl' : 'whale',
          msg: `Live Signal Triggered: ${data.symbol} completed candle volume spike at $${Number(data.candle.close).toFixed(2)}`,
          time: 'Just now'
        };
        setAlerts(prev => [randAlert, ...prev.slice(0, 4)]);
      }
    });

    // 4. Live Sentiment Updates
    socket.on('binance-sentiment', (data) => {
      setFearGreed(data.fearGreed);
      setSocialStats(data.socialStats);
      setTvlData(data.tvlData);
      setFinancials(data.financials);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const minPrice = Math.min(...candles.map(c => c.low)) * 0.9995;
  const maxPrice = Math.max(...candles.map(c => c.high)) * 1.0005;
  const range = maxPrice - minPrice || 1;

  const getY = (price) => {
    return 135 - ((price - minPrice) / range) * 115;
  };

  return (

    <div className="crypto-dashboard container-fluid p-0">
      <div className="dashboard-wrapper">

        {/* ================= PANEL 1: LEFT SIDEBAR ================= */}
        <aside className="sidebar-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            {/* Logo */}
            <div className="brand-logo-section">
              <div className="brand-title">
                {/* Premium glowing double-accent vector logo */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6366f1" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>CryptoEdge</span>
              </div>
              <div className="brand-subtitle">All Markets. One Edge.</div>
            </div>

            {/* Menu Links with exact icons and items */}
            <nav className="nav-links">
              <a href="#overview" className="nav-item active">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </span>
                  Overview
                </span>
              </a>

              <a href="#market-data" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </span>
                  Market Data
                </span>
              </a>

              <a href="#onchain" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  On-Chain (TVL)
                </span>
              </a>

              <a href="#social" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                  </span>
                  Social Intelligence
                </span>
              </a>

              <a href="#sentiment" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </span>
                  Market Sentiment
                </span>
              </a>

              <a href="#financials" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  Financials
                </span>
              </a>

              <a href="#arbitrage" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 1l4 4-4 4M21 5H9M7 23l-4-4 4-4M3 19h12" />
                    </svg>
                  </span>
                  Arbitrage
                </span>
              </a>

              <a href="#watchlist" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  Watchlist
                </span>
              </a>

              <a href="#alerts" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </span>
                  Alerts
                </span>
              </a>

              <a href="#api" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                    </svg>
                  </span>
                  API Status
                </span>
              </a>

              <a href="#settings" className="nav-item">
                <span className="nav-label-group">
                  <span className="nav-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </span>
                  Settings
                </span>
              </a>
            </nav>
          </div>

          <div>
            {/* System Status Panel (Real-Time Live) */}
            <div className="system-status-panel" style={{ margin: '10px 12px 0 12px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div className="sys-header">
                <span>SYSTEM STATUS</span>
                <div className="sys-dot-live"></div>
              </div>
              <div className="sys-status-text" style={{ marginBottom: '6px', fontSize: '9.5px' }}>All Systems Operational</div>
              <div className="sys-item" style={{ fontSize: '9px', padding: '3px 0' }}>
                <span>API Gateway</span>
                <span className="sys-val-ok">Operational</span>
              </div>
              <div className="sys-item" style={{ fontSize: '9px', padding: '3px 0' }}>
                <span>CCXT Stream</span>
                <span className="sys-val-ok">Operational</span>
              </div>
              <div className="sys-item" style={{ fontSize: '9px', padding: '3px 0' }}>
                <span>DefiLlama Core</span>
                <span className="sys-val-ok">Operational</span>
              </div>
              <div className="sys-item" style={{ fontSize: '9px', padding: '3px 0' }}>
                <span>LunarCrush API</span>
                <span className="sys-val-ok">Operational</span>
              </div>
              <div className="sys-item" style={{ fontSize: '9px', padding: '3px 0' }}>
                <span>Terminal Sync</span>
                <span className="sys-val-ok">Operational</span>
              </div>
              <div className="sys-item" style={{ fontSize: '9px', padding: '3px 0' }}>
                <span>Scanner DB</span>
                <span className="sys-val-ok">Operational</span>
              </div>
            </div>

            {/* Upgrade to Pro Premium Card */}
            <div className="upgrade-pro-card" style={{ margin: '10px 12px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(167, 139, 250, 0.05) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '60px', height: '60px', borderRadius: '50%', background: '#6366f1', filter: 'blur(30px)', opacity: 0.3 }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px' }}>🚀</span>
                <h5 style={{ margin: 0, fontSize: '11.5px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '0.3px' }}>Upgrade to Pro</h5>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '9px', color: '#8f9cae', lineHeight: '1.4' }}>
                Unlock advanced metrics, custom alerts, and more.
              </p>
              <button style={{ width: '100%', padding: '6.5px', fontSize: '9.5px', fontWeight: 'bold', color: '#ffffff', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)' }} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={(e) => e.currentTarget.style.filter = 'none'}>
                Upgrade Now
              </button>
            </div>
          </div>
        </aside>

        {/* ================= PANEL 2: MAIN DASHBOARD CORE ================= */}
        <main className="main-workspace">

          {/* Upper Tickers Tickerbar */}
          <div className="top-tickers-bar">
            <div className="ticker-item">
              <span className="ticker-name">BTC/USDT</span>
              <span className="ticker-val">${prices.BTC.price}</span>
              <span className="ticker-change-pct" style={{ color: prices.BTC.isUp ? '#10b981' : '#ef4444' }}>{prices.BTC.change}</span>
            </div>
            <div className="ticker-item">
              <span className="ticker-name">ETH/USDT</span>
              <span className="ticker-val">${prices.ETH.price}</span>
              <span className="ticker-change-pct" style={{ color: prices.ETH.isUp ? '#10b981' : '#ef4444' }}>{prices.ETH.change}</span>
            </div>
            <div className="ticker-item">
              <span className="ticker-name">SOL/USDT</span>
              <span className="ticker-val">${prices.SOL.price}</span>
              <span className="ticker-change-pct" style={{ color: prices.SOL.isUp ? '#10b981' : '#ef4444' }}>{prices.SOL.change}</span>
            </div>
            <div className="ticker-item" style={{ borderLeft: '1px solid #131826', paddingLeft: '12px' }}>
              <span className="ticker-name" style={{ color: '#a78bfa' }}>TOTAL MARKET CAP</span>
              <span className="ticker-val">${prices.TOTAL_MCAP.val}</span>
              <span className="ticker-change-pct" style={{ color: prices.TOTAL_MCAP.isUp ? '#10b981' : '#ef4444' }}>{prices.TOTAL_MCAP.change}</span>
            </div>
            <div className="ticker-item">
              <span className="ticker-name" style={{ color: '#a78bfa' }}>24H VOLUME</span>
              <span className="ticker-val">${prices.VOL_24H.val}</span>
              <span className="ticker-change-pct" style={{ color: prices.VOL_24H.isUp ? '#10b981' : '#ef4444' }}>{prices.VOL_24H.change}</span>
            </div>
          </div>

          {/* Main Top Header Controls */}
          <div className="workspace-header-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="search-container">
                <input type="text" className="search-input" placeholder="Search tokens, protocols, metrics..." />
                <svg className="search-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Premium Asset Selector Dropdown */}
              <div className="premium-dropdown-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0e121b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px', padding: '2px 14px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>ACTIVE PAIR:</span>
                <select 
                  value={selectedSymbol} 
                  onChange={(e) => setSelectedSymbol(e.target.value)} 
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '4px 0px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="BTC" style={{ background: '#0e121b', color: '#ffffff' }}>BTC/USDT</option>
                  <option value="ETH" style={{ background: '#0e121b', color: '#ffffff' }}>ETH/USDT</option>
                  <option value="SOL" style={{ background: '#0e121b', color: '#ffffff' }}>SOL/USDT</option>
                </select>
              </div>
            </div>
            <div className="header-actions">
              <div style={{ color: '#f59e0b', fontSize: '13px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                ★ <span style={{ fontSize: '10.5px', color: '#64748b', marginLeft: '4px', fontWeight: 'bold' }}>FAVORITES</span>
              </div>
              <div className="bell-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <div className="bell-badge">3</div>
              </div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'white' }}>
                U
              </div>
            </div>
          </div>

          {/* Scrollable Main Workspace */}
          <div className="scrollable-content-area">

            <div className="subheader-row">
              <div className="update-stamp">
                <div className="update-stamp-dot"></div>
                <span>Updated: Just now</span>
              </div>
              <button className="customize-btn">
                <span>⚙</span> Customize Workspace
              </button>
            </div>

            {/* ================= ROW 1: 5 ADVANCED METRIC CARDS ================= */}
            <div className="top-five-grid">

              {/* Card 1: Market Regime */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Market Regime</h4>
                  <span className="glow-tag-yellow">ALTERNATIVE.ME</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="30" fill="url(#regime-glow)" fillOpacity="0.15" stroke="#10b981" strokeWidth="1" />
                    <path d="M18 42 L28 28 L36 34 L48 18" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <polygon points="48,18 42,22 46,26" fill="#10b981" />
                    <defs>
                      <radialGradient id="regime-glow" cx="0" cy="0" r="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></radialGradient>
                    </defs>
                  </svg>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>🐂</span> BULL REGIME
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Strength: 72/100</div>
                  </div>
                </div>
                {/* Segment meter */}
                <div className="regime-segments">
                  <div className="regime-seg active"></div>
                  <div className="regime-seg active"></div>
                  <div className="regime-seg active"></div>
                  <div className="regime-seg active"></div>
                  <div className="regime-seg"></div>
                </div>
              </div>

              {/* Card 2: Fear & Greed Index */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Fear & Greed</h4>
                  <span className="glow-tag-yellow">ALTERNATIVE.ME</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  {/* Gauge Arc SVG */}
                  <svg width="40" height="24" viewBox="0 0 40 20">
                    <path d="M 5,20 A 15,15 0 0,1 35,20" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="14 30" strokeLinecap="round" />
                    <path d="M 5,20 A 15,15 0 0,1 35,20" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="0 14 14 14" strokeLinecap="round" />
                    <path d="M 5,20 A 15,15 0 0,1 35,20" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="0 28 14 0" strokeLinecap="round" />
                    {/* Dial Needle */}
                    <line x1="20" y1="20" x2="30" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="20" cy="20" r="2.5" fill="#ffffff" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '19px', fontWeight: 'bold', color: '#ffffff' }}>{fearGreed.value}</div>
                    <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '700' }}>{fearGreed.label}</div>
                  </div>
                </div>
                <div className="fg-historical">
                  <div>Yesterday: <span>{fearGreed.yesterday}</span></div>
                  <div>Last Week: <span>{fearGreed.lastWeek}</span></div>
                </div>
              </div>

              {/* Card 3: Social Dominance */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Social Dominance</h4>
                  <span className="glow-tag-purple">LUNARCRUSH</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                  <svg width="36" height="36" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#1f2937" strokeWidth="1" />
                    <circle cx="18" cy="18" r="10" fill="none" stroke="#1f2937" strokeWidth="1" />
                    {/* Radiating nodes */}
                    <circle cx="18" cy="3" r="2" fill="#a78bfa" />
                    <circle cx="31" cy="23" r="2.5" fill="#a78bfa" />
                    <circle cx="5" cy="14" r="1.5" fill="#a78bfa" />
                    {/* Inner Dominant core */}
                    <circle cx="18" cy="18" r="6" fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="1.5" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#a78bfa' }}>{socialStats.btcDominance}</div>
                    <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold' }}>BTC DOMINANCE</div>
                  </div>
                </div>
                <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '6px', textAlign: 'center' }}>
                  Twitter: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>44.1%</span> | Reddit: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>21.6%</span>
                </div>
              </div>

              {/* Card 4: AltRank™ */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">AltRank™</h4>
                  <span className="glow-tag-purple">LUNARCRUSH</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <svg width="34" height="34" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#141c2c" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#6366f1" strokeWidth="3.5" strokeDasharray="75 100" strokeDashoffset="10" strokeLinecap="round" />
                    <text x="18" y="21.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">#1</text>
                  </svg>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#ffffff' }}>{socialStats.altRank}</div>
                    <div style={{ fontSize: '9px', color: '#6366f1', fontWeight: 'bold' }}>SOLANA RANK</div>
                  </div>
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '6px', textAlign: 'center' }}>
                  Out of <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>4,821 active tokens</span>
                </div>
              </div>

              {/* Card 5: Market Cap */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Market Cap</h4>
                  <span className="glow-tag-green">CCXT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  {/* Miniature 3D bar chart */}
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <rect x="3" y="18" width="5" height="14" rx="1.5" fill="#10b981" />
                    <rect x="11" y="10" width="5" height="22" rx="1.5" fill="#10b981" />
                    <rect x="19" y="14" width="5" height="18" rx="1.5" fill="#10b981" />
                    <rect x="27" y="4" width="5" height="28" rx="1.5" fill="#10b981" fillOpacity="0.4" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#ffffff' }}>${prices.TOTAL_MCAP.val}</div>
                    <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 'bold' }}>▲ {prices.TOTAL_MCAP.change} (24H)</div>
                  </div>
                </div>
                <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '5px', textAlign: 'center' }}>
                  Dominance: <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>BTC 55.4%</span> | <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>ETH 17.8%</span>
                </div>
              </div>

            </div>

            {/* ================= ROW 2: LIVE CHART & ORDER BOOK ================= */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.9fr 0.9fr', gap: '12px', marginBottom: '12px' }}>

              {/* Card 1: Candlestick chart overview */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Live Market Overview</h4>
                  <span className="glow-tag-green">CCXT (BINANCE)</span>
                </div>
                <div style={{ fontSize: '10px', color: '#8f9cae', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{selectedSymbol}/USDT</span> | 1D INTERVAL | CURRENT PRICE: <span style={{ color: prices[selectedSymbol]?.isUp ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>${prices[selectedSymbol]?.price}</span>
                </div>
                {/* Official TradingView Candlestick Chart Widget */}
                <div style={{ width: '100%', height: '460px', background: '#07090e', borderRadius: '8px', overflow: 'hidden' }}>
                  <div id="tradingview_btc" ref={tvContainerRef} style={{ width: '100%', height: '100%' }} />
                </div>
              </div>

              {/* Card 2: Live Order Book */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Order Book</h4>
                  <span className="glow-tag-green">BINANCE</span>
                </div>
                <table className="ob-table">
                  <thead>
                    <tr>
                      <th align="left">Price (USDT)</th>
                      <th align="right">Size</th>
                      <th align="right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Asks (Sell Orders) */}
                    {orderBook.asks.map((ask, i) => (
                      <tr key={`ask-${i}`} className="ob-ask-row">
                        <td align="left">{ask.price}</td>
                        <td align="right">{ask.size}</td>
                        <td align="right">{ask.total}</td>
                      </tr>
                    ))}
                    {/* Live spread divider */}
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan="3" align="center" style={{ fontSize: '9px', fontWeight: 'bold', color: '#8f9cae', padding: '4px 0' }}>
                        Spread: {orderBook.spread}
                      </td>
                    </tr>
                    {/* Bids (Buy Orders) */}
                    {orderBook.bids.map((bid, i) => (
                      <tr key={`bid-${i}`} className="ob-bid-row">
                        <td align="left">{bid.price}</td>
                        <td align="right">{bid.size}</td>
                        <td align="right">{bid.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card 3: DefiLlama TVL stacked waves */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Total Value Locked</h4>
                  <span className="glow-tag-green">DEFILLAMA</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>{tvlData.total}</div>
                <div style={{ fontSize: '9.5px', color: '#10b981', fontWeight: 'bold', marginTop: '-3px' }}>▲ +2.34% (7D growth)</div>

                {/* Rainbow stacked area wave SVG */}
                <div style={{ height: '115px', width: '100%', marginTop: '6px' }}>
                  <svg width="100%" height="100%" viewBox="0 0 160 115" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="wave-grad-eth" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" /></linearGradient>
                      <linearGradient id="wave-grad-tron" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
                      <linearGradient id="wave-grad-bsc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.4" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient>
                    </defs>
                    {/* Layer 1 (BSC) */}
                    <path d="M 0,110 Q 40,88 80,98 T 160,90 L 160,115 L 0,115 Z" fill="url(#wave-grad-bsc)" />
                    <path d="M 0,110 Q 40,88 80,98 T 160,90" fill="none" stroke="#10b981" strokeWidth="1" />

                    {/* Layer 2 (Tron) */}
                    <path d="M 0,90 Q 40,65 80,75 T 160,65 L 160,115 L 0,115 Z" fill="url(#wave-grad-tron)" />
                    <path d="M 0,90 Q 40,65 80,75 T 160,65" fill="none" stroke="#3b82f6" strokeWidth="1" />

                    {/* Layer 3 (Ethereum) */}
                    <path d="M 0,65 Q 40,35 80,45 T 160,35 L 160,115 L 0,115 Z" fill="url(#wave-grad-eth)" />
                    <path d="M 0,65 Q 40,35 80,45 T 160,35" fill="none" stroke="#6366f1" strokeWidth="1" />
                  </svg>
                </div>

                {/* Micro-list for distributions */}
                <div className="tvl-stack-side-list">
                  {tvlData.chains.map((chain, i) => (
                    <div key={`tvl-chain-${i}`} className="tvl-stack-item">
                      <div className="tvl-item-label">
                        <div className="tvl-item-dot" style={{ backgroundColor: chain.color }}></div>
                        <span>{chain.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span className="tvl-item-val">${chain.val}</span>
                        <span className="tvl-item-change">{chain.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ================= ROW 3: DETAILED TABLE & RADARS ================= */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>

              {/* Card 1: TVL Protocol Table */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Top Protocols by TVL</h4>
                  <span className="glow-tag-green">DEFILLAMA</span>
                </div>
                <table className="custom-crypto-table">
                  <thead>
                    <tr>
                      <th align="left">Protocol</th>
                      <th align="left">Category</th>
                      <th align="right">TVL</th>
                      <th align="right">7D Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tvlData.protocols ? tvlData.protocols.map((proto, index) => {
                      const isUp = proto.change >= 0;
                      return (
                        <tr key={`tvl-proto-${index}`}>
                          <td align="left">
                            <div className="coin-icon-small" style={{ backgroundColor: proto.color }}>{proto.icon}</div>
                            {proto.name}
                          </td>
                          <td align="left" style={{ color: '#8f9cae' }}>{proto.cat}</td>
                          <td align="right" style={{ fontWeight: 'bold' }}>${proto.val.toFixed(2)}B</td>
                          <td align="right" style={{ color: isUp ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                            {isUp ? '▲ +' : '▼ '}{proto.change.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="4" align="center">Loading protocols...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Card 2: Social Radar (LunarCrush) */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Social Intelligence</h4>
                  <span className="glow-tag-purple">LUNARCRUSH</span>
                </div>

                {/* Purple Radar Spider web SVG */}
                <div style={{ height: '90px', width: '100%', position: 'relative', margin: '6px 0' }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    {/* Pentagon Grid lines */}
                    <polygon points="50,10 88,38 73,83 27,83 12,38" fill="none" stroke="#141c2c" strokeWidth="1" />
                    <polygon points="50,25 78.5,46 67.5,72 32.5,72 21.5,46" fill="none" stroke="#141c2c" strokeWidth="1" />
                    <polygon points="50,40 69,54 62.5,63.5 37.5,63.5 31,54" fill="none" stroke="#141c2c" strokeWidth="1" />
                    {/* Center axis lines */}
                    <line x1="50" y1="50" x2="50" y2="10" stroke="#141c2c" strokeWidth="0.8" />
                    <line x1="50" y1="50" x2="88" y2="38" stroke="#141c2c" strokeWidth="0.8" />
                    <line x1="50" y1="50" x2="73" y2="83" stroke="#141c2c" strokeWidth="0.8" />
                    <line x1="50" y1="50" x2="27" y2="83" stroke="#141c2c" strokeWidth="0.8" />
                    <line x1="50" y1="50" x2="12" y2="38" stroke="#141c2c" strokeWidth="0.8" />

                    {/* Glowing radar polygon */}
                    <polygon points="50,18 80,41 68,78 34,75 22,42" fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="1.5" />
                    {/* Point nodes */}
                    <circle cx="50" cy="18" r="2.5" fill="#a78bfa" />
                    <circle cx="80" cy="41" r="2.5" fill="#a78bfa" />
                    <circle cx="68" cy="78" r="2.5" fill="#a78bfa" />
                    <circle cx="34" cy="75" r="2.5" fill="#a78bfa" />
                    <circle cx="22" cy="42" r="2.5" fill="#a78bfa" />
                  </svg>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9.5px', color: '#8f9cae', textAlign: 'center' }}>
                  <div>Social Vol: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{socialStats.radarValues.vol}%</span></div>
                  <div>Engagement: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{socialStats.radarValues.eng}%</span></div>
                </div>
              </div>

              {/* Card 3: Financial Double-Donut */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Crypto Financials</h4>
                  <span className="glow-tag-orange">TOKEN TERMINAL</span>
                </div>

                {/* Concentric Double Donut SVG */}
                <div style={{ height: '90px', width: '100%', position: 'relative', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="84" height="84" viewBox="0 0 36 36">
                    {/* Inner gray ring */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#121824" strokeWidth="2.5" />
                    {/* Outer gray ring */}
                    <circle cx="18" cy="18" r="10" fill="none" stroke="#121824" strokeWidth="2" />

                    {/* Outer Concentric segment (Revenue) */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="70 100" strokeDashoffset="15" strokeLinecap="round" />
                    {/* Inner Concentric segment (Expenses) */}
                    <circle cx="18" cy="18" r="10" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="50 100" strokeDashoffset="45" strokeLinecap="round" />

                    <text x="18" y="20.5" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold">REV</text>
                  </svg>
                  <div style={{ position: 'absolute', right: '0', top: '15px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9px' }}>
                    <div style={{ color: '#f97316', fontWeight: '600' }}>Revenues</div>
                    <div style={{ color: '#3b82f6', fontWeight: '600' }}>Fees</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', textAlign: 'center', color: '#cbd5e1' }}>
                  Total 30D Revenue: <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{financials.revenue}</span>
                </div>
              </div>

              {/* Card 4: Whale Buying / Smart Money flow split donut */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Market Movers</h4>
                  <span className="glow-tag-orange">TOKEN TERMINAL</span>
                </div>

                {/* Slit Donut Pie SVG */}
                <div style={{ height: '90px', width: '100%', position: 'relative', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="84" height="84" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="12.5" fill="none" stroke="#121824" strokeWidth="3.5" />
                    {/* Green Buyer arc (Whales buying) */}
                    <circle cx="18" cy="18" r="12.5" fill="none" stroke="#10b981" strokeWidth="3.8" strokeDasharray="68 100" strokeDashoffset="0" strokeLinecap="round" />
                    {/* Red Seller arc (Whales selling) */}
                    <circle cx="18" cy="18" r="12.5" fill="none" stroke="#ef4444" strokeWidth="3.8" strokeDasharray="28 100" strokeDashoffset="-70" strokeLinecap="round" />

                    <text x="18" y="20.5" textAnchor="middle" fill="#ffffff" fontSize="6.2" fontWeight="bold">FLOW</text>
                  </svg>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>Buy: ${financials.whaleBuy}</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Sell: ${financials.whaleSell}</span>
                </div>
              </div>

            </div>

            {/* ================= ROW 4: HEATMAPS & ARBITRAGE ================= */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px' }}>

              {/* Card 1: Narrative Heatmap bubbles */}
              <div className="premium-card" style={{ minHeight: '180px' }}>
                <div className="card-header-row">
                  <h4 className="card-title-main">Narrative Heatmap</h4>
                  <span className="glow-tag-purple">LUNARCRUSH</span>
                </div>

                {/* CSS Bubble floating layout inside custom wrapper */}
                <div style={{ position: 'relative', width: '100%', height: '120px', overflow: 'hidden', marginTop: '6px' }}>
                  {/* Bubble 1: DeFi */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', width: '48px', height: '48px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.05) 100%)', border: '1.5px solid #6366f1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}>
                    <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#ffffff' }}>DeFi</span>
                    <span style={{ fontSize: '8.5px', color: '#a5b4fc', fontWeight: 'bold' }}>{socialStats.narrativeScores.DeFi}</span>
                  </div>

                  {/* Bubble 2: AI */}
                  <div style={{ position: 'absolute', top: '48px', right: '15px', width: '44px', height: '44px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(167,139,250,0.05) 100%)', border: '1.5px solid #a78bfa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(167,139,250,0.3)' }}>
                    <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#ffffff' }}>AI</span>
                    <span style={{ fontSize: '8.5px', color: '#c7d2fe', fontWeight: 'bold' }}>{socialStats.narrativeScores.AI}</span>
                  </div>

                  {/* Bubble 3: Memecoons */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '55px', width: '38px', height: '38px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)', border: '1.2px solid #f59e0b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#ffffff' }}>MEME</span>
                    <span style={{ fontSize: '8px', color: '#fcd34d', fontWeight: 'bold' }}>{socialStats.narrativeScores.Memecoons}</span>
                  </div>

                  {/* Bubble 4: Layer 2 */}
                  <div style={{ position: 'absolute', top: '5px', right: '65px', width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.05) 100%)', border: '1.2px solid #10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#ffffff' }}>L2</span>
                    <span style={{ fontSize: '8px', color: '#6ee7b7', fontWeight: 'bold' }}>{socialStats.narrativeScores.Layer2}</span>
                  </div>

                  {/* Bubble 5: RWA */}
                  <div style={{ position: 'absolute', bottom: '15px', left: '115px', width: '36px', height: '36px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)', border: '1.2px solid #3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#ffffff' }}>RWA</span>
                    <span style={{ fontSize: '8px', color: '#93c5fd', fontWeight: 'bold' }}>{socialStats.narrativeScores.RWA}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Top Arbitrage Opportunities */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Top Arbitrage</h4>
                  <span className="glow-tag-green">CCXT PRICES</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {arbitrage.map((arb, i) => (
                    <div key={`arb-${i}`} className="compass-item-row">
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{arb.symbol}</span>
                        <div style={{ fontSize: '8px', color: '#64748b' }}>Binance ${arb.binance} | Bybit ${arb.bybit}</div>
                      </div>
                      <span className="trade-action-badge">{arb.spread} Spread</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Multi Exchange pricing compass */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Price Compass</h4>
                  <span className="glow-tag-green">CCXT</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                  {/* Bitcoin glowing dial SVG */}
                  <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#131826" strokeWidth="1.5" />
                    <circle cx="32" cy="32" r="24" fill="none" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.4" />
                    {/* Compass divisions */}
                    <line x1="32" y1="4" x2="32" y2="8" stroke="#cbd5e1" strokeWidth="1.5" />
                    <line x1="32" y1="60" x2="32" y2="56" stroke="#cbd5e1" strokeWidth="1.5" />
                    <line x1="4" y1="32" x2="8" y2="32" stroke="#cbd5e1" strokeWidth="1.5" />
                    <line x1="60" y1="32" x2="56" y2="32" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Dial pointer */}
                    <polygon points="32,32 30,12 34,12" fill="#ef4444" />
                    <polygon points="32,32 29,48 35,48" fill="#64748b" />

                    {/* Center orange glowing BTC node */}
                    <circle cx="32" cy="32" r="4.5" fill="#f59e0b" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#8f9cae', lineHeight: '1.4' }}>
                      Center dial aligns price deviations between top 4 exchanges.
                    </div>
                    <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 'bold', marginTop: '3px' }}>
                      Compass Deviation: 0.04% (Secure)
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Live Alerts Feed */}
              <div className="premium-card">
                <div className="card-header-row">
                  <h4 className="card-title-main">Alerts Feed</h4>
                  <span className="glow-tag-yellow">SYSTEM STATUS</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                  {alerts.map((alert) => (
                    <div key={alert.id} style={{ display: 'flex', gap: '6px', fontSize: '9.5px', borderBottom: '1px solid #0f1320', paddingBottom: '4px' }}>
                      <span style={{
                        color: alert.type === 'whale' ? '#f59e0b' : (alert.type === 'tvl' ? '#10b981' : '#a78bfa'),
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        flexShrink: 0
                      }}>
                        [{alert.type}]
                      </span>
                      <span style={{ color: '#cbd5e1' }}>{alert.msg}</span>
                      <span style={{ color: '#64748b', marginLeft: 'auto', flexShrink: 0 }}>{alert.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </main>



      </div>
    </div>
  );
};

export default CryptoEdgeDashboard;
