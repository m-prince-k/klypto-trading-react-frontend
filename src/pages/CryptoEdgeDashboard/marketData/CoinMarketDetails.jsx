// ... ALL YOUR IMPORTS SAME
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { createChart, AreaSeries } from "lightweight-charts";
import "./CoinMarketDetails.css";
import socket from "../../../services/socket";
import apiService from "../../../services/apiServices";

const CoinMarketDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const lastChartTimeRef = useRef(null);

  const [coin, setCoin] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [flashState, setFlashState] = useState(null);

  // ✅ YOUR EXISTING API POLLING (UNCHANGED)
  useEffect(() => {
    let intervalId;

    async function fetchCoinData() {
      try {
        const response = await apiService.post(
          `api/listing?symbol=${symbol.toUpperCase()}USDT&interval=1m&limit=1000`,
        );

        const data = response?.data?.data;

        if (!data || !Array.isArray(data)) return;

        const latest = data[data.length - 1];
        const newPrice = Number(latest.close);

        setCoin((prevCoin) => {
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

          const oldPrice = prevCoin.price;

          if (oldPrice && newPrice !== oldPrice) {
            const direction = newPrice >= oldPrice ? "up" : "down";
            setFlashState(direction);
            setTimeout(() => setFlashState(null), 800);
          }

          if (areaSeriesRef.current) {
            const time = Math.floor(Date.now() / 1000);
            areaSeriesRef.current.update({
              time,
              value: newPrice,
            });
          }

          return {
            ...prevCoin,
            price: newPrice,
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

    return () => {
      clearInterval(intervalId);
    };
  }, [symbol]);

  const isCoinLoaded = !!coin;

  // ✅ ONLY CHANGE DONE HERE (fetch → apiService)
  useEffect(() => {
    if (!isCoinLoaded || !chartContainerRef.current) return;
    if (chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: 450,
      layout: {
        background: { color: "#181a20" },
        textColor: "#848e9c",
      },
      grid: {
        vertLines: { color: "rgba(43, 49, 57, 0.5)" },
        horzLines: { color: "rgba(43, 49, 57, 0.5)" },
      },
      rightPriceScale: {
        borderColor: "#2b3139",
        autoScale: true,
      },
      timeScale: {
        borderColor: "#2b3139",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#f0b90b",
      topColor: "rgba(240, 185, 11, 0.3)",
      bottomColor: "rgba(240, 185, 11, 0)",
      lineWidth: 2,
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

        const json = response?.data;
        console.log(json, "resssssssss");

        if (json && json.data && Array.isArray(json.data)) {
          const formattedData = json.data
            .map((d) => ({
              time: Number(d.time),
              value: Number(d.close),
            }))
            .sort((a, b) => a.time - b.time);

          const uniqueData = formattedData.filter(
            (v, i, a) => a.findIndex((t) => t.time === v.time) === i,
          );

          if (uniqueData.length > 0) {
            areaSeries.setData(uniqueData);
            lastChartTimeRef.current = uniqueData[uniqueData.length - 1].time;
            chart.timeScale().fitContent();
          }
        }
      } catch (err) {
        console.error("Failed to fetch historical data for detail chart:", err);

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
  }, [isCoinLoaded, symbol]);

  if (!coin) {
    return (
      <div className="detail-loading-container">
        <div className="detail-spinner"></div>
        <p>Loading {symbol.toUpperCase()} live market details...</p>
      </div>
    );
  }

  const isUp = coin.change24h >= 0;

  return (
    <div className="coin-detail-page">
      {/* Detail Header Navigation */}
      <header className="detail-page-header">
        <button className="btn-back" onClick={() => navigate("/market")}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Markets
        </button>
        <div className="live-status">
          <span
            className={`live-dot ${isSocketConnected ? "animate-pulse" : ""}`}
            style={{
              backgroundColor: isSocketConnected
                ? "var(--color-green)"
                : "var(--color-red)",
            }}
          ></span>
          <span className="live-status-text">
            {isSocketConnected ? "Live Connection" : "Reconnecting..."}
          </span>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="detail-page-body">
        {/* Coin Info Bar */}
        <section className="coin-info-bar">
          <div className="coin-info-left">
            <div
              className="coin-details-logo"
              style={{ backgroundColor: coin.logoColor }}
            >
              {coin.symbol[0]}
            </div>
            <div className="coin-details-title">
              <h1 className="coin-details-name">{coin.name}</h1>
              <span className="coin-details-symbol">{coin.symbol}/USDT</span>
            </div>
          </div>

          <div className="coin-info-right-grid">
            <div className="info-stat-box">
              <span className="info-stat-label">Live Price</span>
              <span
                className={`info-stat-value price-display ${flashState === "up" ? "flash-up" : flashState === "down" ? "flash-down" : ""}`}
              >
                $
                {coin.price.toLocaleString(undefined, {
                  minimumFractionDigits: coin.price < 1 ? 4 : 2,
                  maximumFractionDigits: coin.price < 1 ? 4 : 2,
                })}
              </span>
            </div>
            <div className="info-stat-box">
              <span className="info-stat-label">24h Change</span>
              <span
                className={`info-stat-value percentage-text ${isUp ? "up" : "down"}`}
              >
                {isUp ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(2)}%
              </span>
            </div>
            <div className="info-stat-box">
              <span className="info-stat-label">24h High</span>
              <span className="info-stat-value">
                $
                {(coin.high || coin.price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="info-stat-box">
              <span className="info-stat-label">24h Low</span>
              <span className="info-stat-value">
                $
                {(coin.low || coin.price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="info-stat-box">
              <span className="info-stat-label">24h Volume(USDT)</span>
              <span className="info-stat-value">
                $
                {coin.volume24h.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="info-stat-box">
              <span className="info-stat-label">Circulating Supply</span>
              <span className="info-stat-value">
                {coin.supply.toLocaleString()} {coin.symbol}
              </span>
            </div>
          </div>
        </section>

        {/* Live Chart Section */}
        <section className="detail-chart-wrapper">
          <div className="chart-header-bar">
            <span className="chart-header-title">Live Ticker Area Chart</span>
            <div className="chart-controls">
              <span className="control-badge">Real-time Stream</span>
            </div>
          </div>
          <div
            className="lightweight-chart-container"
            ref={chartContainerRef}
          ></div>
        </section>
      </main>
    </div>
  );
};

export default CoinMarketDetails;
