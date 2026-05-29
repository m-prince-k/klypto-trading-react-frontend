import React, { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiGlobe,
} from "react-icons/fi";
import socket from "../../services/websocket/socket";
import SocketEvents from "../../services/websocket/socketEvents";
import { useSocket } from "../../services/websocket/useSocket";
export default function DetailsPanel({ onClose, symbol, isFutures }) {
  const [priceData, setPriceData] = useState({
    lastPrice: 0,
    change: 0,
    changePercent: 0,
    high: 0,
    low: 0,
    volume: 0,
    open: 0,
  });

  const [flashClass, setFlashClass] = useState("");
  const prevPriceRef = useRef(0);

  // Parse coin name from symbol (e.g. BTCUSDT -> BTC / USDT)
  const safeSymbol = symbol ? symbol.toUpperCase() : "";
  const baseAsset = safeSymbol ? safeSymbol.replace("USDT", "").replace("USD", "") : "";
  const quoteAsset = safeSymbol ? safeSymbol.slice(baseAsset.length) : "";

  // Common handler for price updates (from either watchlist or live-tick)
  const handlePriceUpdate = (payload) => {
    if (!payload) return;

    let tick = payload;
    if (Array.isArray(payload)) {
      tick = payload.find((t) => t.symbol?.toUpperCase() === safeSymbol);
      if (!tick) return;
    }

    if (!tick.symbol || tick.symbol.toUpperCase() !== safeSymbol) return;

    // Normalize API fields
    const ohlcv = tick.ohlcv ?? tick.liveOHLCV ?? {};
    const normalized = {
      lastPrice: tick.price ?? tick.lastPrice ?? tick.close ?? ohlcv.close ?? ohlcv.lastPrice,
      change: tick.change ?? ohlcv.change,
      changePercent: tick.changePct ?? tick.changePercent ?? ohlcv.changePercent ?? ohlcv.changePct,
    };

    setPriceData((prev) => {
      const nextPrice = normalized.lastPrice ?? prev.lastPrice;

      if (prevPriceRef.current && nextPrice !== prevPriceRef.current) {
        const isUp = nextPrice > prevPriceRef.current;
        setFlashClass(isUp ? "flash-up-text" : "flash-down-text");
        setTimeout(() => setFlashClass(""), 600);
      }
      prevPriceRef.current = nextPrice;

      return {
        ...prev,
        lastPrice: nextPrice,
        change: normalized.change ?? prev.change,
        changePercent: normalized.changePercent ?? prev.changePercent,
      };
    });
  };

  useSocket({
    handleWatchlistUpdate: handlePriceUpdate,
    handleLiveTickUpdate: handlePriceUpdate,
  });

  useEffect(() => {
    if (!symbol) return;

    // Reset price state when symbol changes
    setPriceData({
      lastPrice: 0,
      change: 0,
      changePercent: 0,
      high: 0,
      low: 0,
      volume: 0,
      open: 0,
    });
    prevPriceRef.current = 0;
  }, [safeSymbol]);

  if (!symbol) {
    return (
      <div
        className="d-flex flex-column h-100 justify-content-center align-items-center"
        style={{
          backgroundColor: "var(--bg-card, #ffffff)",
          color: "var(--text-main, #131722)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <FiActivity
          size={48}
          className="text-muted mb-3"
          style={{ opacity: 0.5 }}
        />
        <h5 className="fw-semibold mb-1">No Symbol Selected</h5>
        <p className="text-secondary small">
          Select a trading asset from the watchlist or sidebar to view real-time
          market statistics.
        </p>
      </div>
    );
  }

  const isUp = priceData.change >= 0;
  const priceColor = isUp ? "#089981" : "#f23645";

  // Generate a signal based on changePercent
  const getRating = () => {
    const val = priceData.changePercent;
    if (val > 1.5) return { text: "Strong Buy", color: "#089981", percent: 85 };
    if (val > 0.2) return { text: "Buy", color: "#26a69a", percent: 65 };
    if (val < -1.5)
      return { text: "Strong Sell", color: "#f23645", percent: 15 };
    if (val < -0.2) return { text: "Sell", color: "#ff5252", percent: 35 };
    return { text: "Neutral", color: "#787b86", percent: 50 };
  };

  const rating = getRating();

  return (
    <div
      className="d-flex flex-column h-100 details-scroll"
      style={{
        backgroundColor: "var(--bg-card, #ffffff)",
        color: "var(--text-main, #131722)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <style>{`
        @keyframes green-text-pulse {
          0% { color: #089981; }
          100% { color: inherit; }
        }
        @keyframes red-text-pulse {
          0% { color: #f23645; }
          100% { color: inherit; }
        }
        .flash-up-text { animation: green-text-pulse 0.6s ease-out; }
        .flash-down-text { animation: red-text-pulse 0.6s ease-out; }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color, #f1f3f6);
          font-size: 13px;
        }
        .detail-label { color: var(--text-muted, #787b86); }
        .detail-val { font-weight: 500; color: var(--text-main, inherit); }
        /* SAME scrollbar as watchlist */
.details-scroll {
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #dde1eb transparent;
}

.details-scroll::-webkit-scrollbar {
  width: 4px;
}

.details-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.details-scroll::-webkit-scrollbar-thumb {
  background: #dde1eb;
  border-radius: 2px;
}
      `}</style>

      <div className="flex-1 p-3">
        {/* Coin Title */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2962ff 0%, #1e40af 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: "0 2px 4px rgba(41,98,255,0.2)",
              }}
            >
              {baseAsset.charAt(0)}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5
                  className="mb-0 fw-bold"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {symbol}
                </h5>
                <span
                  className="badge"
                  style={{
                    backgroundColor: "var(--bg-main, #f1f3f6)",
                    color: "var(--text-muted, #475569)",
                    fontSize: "10px",
                    fontWeight: "600",
                  }}
                >
                  {isFutures ? "FUTURES" : "SPOT"}
                </span>
              </div>
              <div className="text-muted" style={{ fontSize: "11px" }}>
                {baseAsset} / {quoteAsset} &bull; Real-Time
              </div>
            </div>
          </div>
          <FiGlobe className="text-secondary" style={{ opacity: 0.7 }} />
        </div>

        {/* Price Widget */}
        <div
          className="p-3 rounded-3 mb-3"
          style={{ backgroundColor: "var(--bg-main, #f8f9fa)" }}
        >
          <div className="d-flex align-items-baseline gap-2">
            <h2
              className={`mb-0 fw-bold ${flashClass}`}
              style={{
                fontSize: "28px",
                letterSpacing: "-1px",
                transition: "color 0.1s",
              }}
            >
              {priceData.lastPrice > 0
                ? priceData.lastPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })
                : "---"}
            </h2>
            <span className="text-secondary small fw-medium">{quoteAsset}</span>
          </div>

          <div className="d-flex align-items-center gap-2 mt-2">
            <span
              className="d-flex align-items-center gap-1 px-2 rounded"
              style={{
                backgroundColor: isUp
                  ? "rgba(8,153,129,0.1)"
                  : "rgba(242,54,69,0.1)",
                color: priceColor,
                fontSize: "12px",
                fontWeight: "600",
                padding: "3px 8px",
              }}
            >
              {isUp ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
              {isUp ? "+" : ""}
              {priceData.change?.toFixed(4)}
            </span>
            <span
              style={{
                backgroundColor: isUp
                  ? "rgba(8,153,129,0.1)"
                  : "rgba(242,54,69,0.1)",
                color: priceColor,
                fontSize: "12px",
                fontWeight: "600",
                padding: "3px 8px",
                borderRadius: "4px",
              }}
            >
              {isUp ? "+" : ""}
              {priceData.changePercent?.toFixed(2)}%
            </span>
            <span className="text-muted" style={{ fontSize: "11px" }}>
              24H
            </span>
          </div>
        </div>

        {/* Signal Gauge */}
        <div
          className="p-3 border rounded-3 mb-3"
          style={{ borderColor: "var(--border-color, #e0e3eb)" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="fw-semibold text-secondary"
              style={{ fontSize: "12px" }}
            >
              SIGNAL
            </span>
            <span
              className="badge"
              style={{
                fontSize: "10px",
                backgroundColor: "var(--bg-main, #f8f9fa)",
                color: "var(--text-muted, #131722)",
              }}
            >
              Based on Chg%
            </span>
          </div>
          <div className="text-center py-1">
            <div
              className="fs-5 fw-bold mb-2"
              style={{ color: rating.color, transition: "color 0.3s" }}
            >
              {rating.text}
            </div>
            <div
              style={{
                height: "4px",
                backgroundColor: "var(--bg-main, #f1f3f6)",
                borderRadius: "2px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${rating.percent}%`,
                  backgroundColor: rating.color,
                  borderRadius: "2px",
                  transition: "width 0.5s ease-out, background-color 0.5s",
                }}
              />
            </div>
            <div
              className="d-flex justify-content-between text-secondary mt-1"
              style={{ fontSize: "10px" }}
            >
              <span>Strong Sell</span>
              <span>Neutral</span>
              <span>Strong Buy</span>
            </div>
          </div>
        </div>

        {/* Stats: only the 3 fields we receive */}
        <h6 className="fw-bold mb-2" style={{ fontSize: "13px" }}>
          Stats
        </h6>
        <div className="mb-3">
          <div className="detail-row">
            <span className="detail-label">Last Price</span>
            <span className="detail-val" style={{ color: priceColor }}>
              {priceData.lastPrice > 0
                ? priceData.lastPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })
                : "---"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Change</span>
            <span className="detail-val" style={{ color: priceColor }}>
              {priceData.change !== 0
                ? `${isUp ? "+" : ""}${priceData.change?.toFixed(4)}`
                : "---"}
            </span>
          </div>
          <div className="detail-row" style={{ borderBottom: "none" }}>
            <span className="detail-label">Change %</span>
            <span className="detail-val" style={{ color: priceColor }}>
              {priceData.changePercent !== 0
                ? `${isUp ? "+" : ""}${priceData.changePercent?.toFixed(2)}%`
                : "---"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
