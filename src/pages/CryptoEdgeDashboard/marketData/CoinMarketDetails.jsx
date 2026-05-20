import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { createChart, AreaSeries } from "lightweight-charts";
import "./CoinMarketDetails.css";
import apiService from "../../../services/apiServices";
import socket from "../../../services/socket";
import { useTheme } from "../../../context/ThemeContext";

const CoinMarketDetails = () => {
  const { theme } = useTheme();
  const { symbol } = useParams();
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const lastChartTimeRef = useRef(null);

  const [coin, setCoin] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [flashState, setFlashState] = useState(null);
  const [activeTab, setActiveTab] = useState("Chart");
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  // ── STEP 1: API polling for initial coin state + periodic refresh ──
  useEffect(() => {
    let intervalId;

    async function fetchCoinData() {
      try {
        const response = await apiService.post(
          `api/listing?symbol=${symbol.toUpperCase()}USDT&interval=1m&limit=1000`,
        );

        const data = response?.data;

        if (!data || !Array.isArray(data)) {
          console.warn(
            "⚠️ CoinMarketDetails: unexpected response shape",
            response,
          );
          return;
        }

        const latest = data[data.length - 1];
        const newPrice = Number(latest.close);

        setCoin((prevCoin) => {
          // Only use API to build initial state — socket handles live updates after that
          if (!prevCoin) {
            return {
              symbol: symbol.toUpperCase(),
              name: symbol.toUpperCase(),
              price: newPrice,
              change24h: 0,
              volume24h: Number(latest.volume),
              high: Number(latest.high),
              low: Number(latest.low),
              history: data.map((d) => Number(d.close)),
              supply: 0,
              logoColor: "#6366f1",
            };
          }

          // After initial load, only update OHLCV from API — price comes from socket
          return {
            ...prevCoin,
            high: Number(latest.high),
            low: Number(latest.low),
            volume24h: Number(latest.volume),
            history: data.map((d) => Number(d.close)),
          };
        });
      } catch (err) {
        console.error("API fetch error:", err);
      }
    }

    fetchCoinData();
    intervalId = setInterval(fetchCoinData, 2000);

    return () => clearInterval(intervalId);
  }, [symbol]);

  // ── STEP 2: Socket.IO for live price ticks ─────────────────────────
  useEffect(() => {
    socket.on("connect", () => {
      setIsSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    // Handle initial coins list from server — seed coin state if API hasn't loaded yet
    socket.on("market-coins-init", (data) => {
      if (data && data.success) {
        const found = data.coins.find(
          (c) => c.symbol.toUpperCase() === symbol.toUpperCase(),
        );
        if (found) {
          setCoin((prevCoin) => {
            // Only use socket init if API hasn't populated state yet
            if (prevCoin) return prevCoin;
            return found;
          });
          // Seed chart with history if chart is already initialized
          if (areaSeriesRef.current && found.history) {
            const chartData = found.history.map((price, idx) => ({
              time:
                Math.floor(Date.now() / 1000) -
                (found.history.length - idx) * 10,
              value: price,
            }));
            areaSeriesRef.current.setData(chartData);
          }
        }
      }
    });

    socket.emit("subscribe-live-tick", {
      symbol: `${symbol.toUpperCase()}USDT`,
      interval: "5m",
    });

    // Handle live tick stream — this is the primary price update source
    socket.on("live-tick-update", (data) => {
      console.log("📡 LIVE CANDLE:", data);

      if (!data || !data.symbol || !data.ohlcv) return;

      const symbolKey = data.symbol.replace("USDT", "").toUpperCase();

      if (symbolKey !== symbol.toUpperCase()) return;

      const { open, high, low, close, volume } = data.ohlcv;

      const newPrice = Number(close);

      console.log("💰 Candle Close:", newPrice);

      setCoin((prevCoin) => {
        console.log("🧠 Prev Coin:", prevCoin);

        if (!prevCoin) return null;

        const oldPrice = prevCoin.price;

        console.log("📊 Old vs New:", oldPrice, newPrice);

        // Flash logic
        if (oldPrice > 0 && newPrice !== oldPrice) {
          const direction = newPrice >= oldPrice ? "up" : "down";
          setFlashState(direction);
          setTimeout(() => setFlashState(null), 800);
        }

        // ✅ Chart update (IMPORTANT CHANGE)
        if (areaSeriesRef.current) {
          const time = Math.floor(data.timestamp / 1000); // use backend timestamp

          console.log("📈 Chart Update:", time, newPrice);

          areaSeriesRef.current.update({
            time,
            value: newPrice,
          });

          lastChartTimeRef.current = time;
        }

        // ✅ Update history safely
        const updatedHistory = Array.isArray(prevCoin.history)
          ? [...prevCoin.history.slice(1), newPrice]
          : [newPrice];

        return {
          ...prevCoin,
          price: newPrice,
          change24h: Number(data.changePct ?? prevCoin.change24h),
          volume24h: Number(volume || prevCoin.volume24h),
          high: Number(high || prevCoin.high),
          low: Number(low || prevCoin.low),
          history: updatedHistory,
        };
      });
    });

    return () => {
      socket.off("live-tick-update");
      // socket.disconnect();
    };
  }, [symbol]);

  const isCoinLoaded = !!coin;

  // ── STEP 3: Initialize chart + fetch 365d historical data ──────────
  useEffect(() => {
    if (!isCoinLoaded || !chartContainerRef.current) return;
    if (chartRef.current) return;

    const isDark = theme === "dark";
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: 450,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: "#848e9c",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      leftPriceScale: {
        visible: true,
        borderColor: "#2b3139",
      },
      rightPriceScale: {
        visible: true,
        borderColor: "transparent",
      },
      timeScale: {
        borderColor: "#2b3139",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#f0b90b",
      topColor: "rgba(240, 185, 11, 0.5)",
      bottomColor: "rgba(240, 185, 11, 0.0)",
      lineWidth: 3,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: "#181a20",
      crosshairMarkerBackgroundColor: "#f0b90b",
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor: "rgba(240, 185, 11, 0.6)",
      priceLineStyle: 3, // dashed
      priceFormat: {
        type: "price",
        precision: symbol.toUpperCase() === "SHIB" ? 6 : 2,
        minMove: symbol.toUpperCase() === "SHIB" ? 0.000001 : 0.01,
      },
    });

    chartRef.current = chart;
    areaSeriesRef.current = areaSeries;

    const fetchHistoricalData = async () => {
      try {
        const response = await apiService.post(
          `api/listing?symbol=${symbol.toUpperCase()}USDT&interval=1d&limit=365`,
        );

        const json = response;

        if (json && json.data && Array.isArray(json.data)) {
          const formattedData = json.data
            .map((d) => ({
              // Auto-detect ms vs seconds timestamp
              time:
                Number(d.time) > 1e10
                  ? Math.floor(Number(d.time) / 1000)
                  : Number(d.time),
              value: Number(d.close),
            }))
            .sort((a, b) => a.time - b.time)
            .filter((v, i, a) => i === 0 || v.time !== a[i - 1].time);

          if (formattedData.length > 0) {
            areaSeries.setData(formattedData);
            lastChartTimeRef.current =
              formattedData[formattedData.length - 1].time;
            chart.timeScale().fitContent();
          }
        }
      } catch (err) {
        console.error("Failed to fetch historical data for detail chart:", err);
        // Fallback to polling history if API fails
        if (coin && coin.history) {
          const fallbackData = coin.history.map((price, idx) => ({
            time:
              Math.floor(Date.now() / 1000) - (coin.history.length - idx) * 10,
            value: price,
          }));
          areaSeries.setData(fallbackData);
        }
      }
    };

    fetchHistoricalData();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      areaSeriesRef.current = null;
    };
  }, [isCoinLoaded, symbol, theme]);

  if (!coin) {
    return (
      <div className="detail-loading-container">
        <div className="detail-spinner"></div>
        <p>Loading {symbol.toUpperCase()} live market details...</p>
      </div>
    );
  }

  const isUp = coin.change24h >= 0;

  const tabs = ["Chart", "Analysis", "News", "FAQ", "Trending Crypto", "Trading Pairs"];
  const timeframes = ["1D", "7D", "1M", "3M", "1Y", "YTD"];

  return (
    <div className="coin-detail-page">
      <main className="detail-page-body">
        {/* Coin Info Bar */}
        <section className="coin-header-top">
          <div
            className="coin-details-logo"
            style={{ backgroundColor: coin.logoColor || "#f7931a" }}
          >
            {coin.symbol === "BTC" ? "₿" : coin.symbol[0]}
          </div>
          <div className="coin-title-section">
            <div className="coin-name-row">
              <span className="coin-name-text">{coin.name} Price ({coin.symbol})</span>
              <span className="badge-hot">HOT</span>
            </div>
            <div className="coin-price-row">
              <h1 className={`price-display ${flashState === "up" ? "flash-up" : flashState === "down" ? "flash-down" : ""}`}>
                ${coin.price.toLocaleString(undefined, {
                  minimumFractionDigits: coin.price < 1 ? 4 : 2,
                  maximumFractionDigits: coin.price < 1 ? 4 : 2,
                })}
              </h1>
            </div>
            <div className="coin-portfolio-row">
              <span className={`change-text ${isUp ? "up" : "down"}`}>
                {isUp ? "+" : ""}{coin.change24h.toFixed(2)}% in the past 24 hrs
              </span>
              <span className="dot-separator">•</span>
              <span className="portfolio-text">
                You have 0 {coin.name} in portfolio <span className="add-now-link">Add Now</span>
              </span>
            </div>
          </div>
        </section>

        {/* Tabs Navigation */}
        <nav className="coin-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Live Chart Section */}
        <section className="detail-chart-wrapper">
          <div className="timeframe-controls">
            {timeframes.map((tf) => (
              <button
                key={tf}
                className={`time-btn ${activeTimeframe === tf ? "active" : ""}`}
                onClick={() => setActiveTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
            <div className="chart-right-header">USD</div>
          </div>
          <div
            className="lightweight-chart-container"
            ref={chartContainerRef}
          ></div>
        </section>

        {/* Market Stats Section */}
        <section className="market-stats-section">
          <h2 className="market-stats-title">{coin.name} Market Stats</h2>
          <div className="market-stats-grid">
            <div className="stat-item">
              <span className="stat-label">
                Popularity 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">#1</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Market Cap 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">$1.5T</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Volume (24hours) 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">
                ${(coin.volume24h / 1e9).toFixed(1)}B
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Circulation Supply 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">
                {(coin.supply / 1e6).toFixed(0)}M • 95.39%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Total Maximum Supply 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">21M</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Fully Diluted Market Cap 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="stat-value">$1.6T</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Issue Date</span>
              <span className="stat-value">3 Jan 2009</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CoinMarketDetails;
