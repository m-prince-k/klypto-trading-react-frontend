import { useEffect, useState } from "react";
import socket from "../services/websocket/socket";
import EVENTS from "../services/websocket/socketEvents";

// Global State
let scanner = null;
let matchedCoins = [];
let alertsFeed = [];

// Global Refs
const previousRsiRef = {};
const triggeredRef = {};
const rsiMapRef = {};

const listeners = new Set();
const notifyListeners = () => listeners.forEach((fn) => fn());

const resetRefs = () => {
  for (let key in triggeredRef) delete triggeredRef[key];
};

const addAlert = (data) => {
  console.log("[Alerts] Creating alert with payload:", data);
  scanner = data;
  matchedCoins = [];
  alertsFeed = [];
  resetRefs();
  notifyListeners();
};

const removeCoin = (symbol) => {
  matchedCoins = matchedCoins.filter((item) => item.symbol !== symbol);
  notifyListeners();
};

const clearAllCoins = () => {
  matchedCoins = [];
  alertsFeed = [];
  scanner = null;
  resetRefs();
  notifyListeners();
};

const checkAlert = (symbol, currentValue, indicatorType) => {
  try {
    const currentScanner = scanner;
    const prevKey = `${symbol}-${indicatorType}`;

    if (!currentScanner || typeof currentValue !== "number" || currentScanner.indicator !== indicatorType) {
      previousRsiRef[prevKey] = currentValue;
      return;
    }

    if (currentScanner.expirationDate && new Date() > new Date(currentScanner.expirationDate)) {
      scanner = null;
      previousRsiRef[prevKey] = currentValue;
      notifyListeners();
      return;
    }

    const previousValue = previousRsiRef[prevKey];
    let matched = false;

    if (currentScanner.condition === "crossesAbove") {
      matched =
        typeof previousValue === "number" &&
        previousValue < Number(currentScanner.value) &&
        currentValue >= Number(currentScanner.value);
    } else if (currentScanner.condition === "crossesBelow") {
      matched =
        typeof previousValue === "number" &&
        previousValue > Number(currentScanner.value) &&
        currentValue <= Number(currentScanner.value);
    } else if (currentScanner.condition === "greaterThan" || currentScanner.condition === ">") {
      matched = currentValue > Number(currentScanner.value);
    } else if (currentScanner.condition === "lessThan" || currentScanner.condition === "<") {
      matched = currentValue < Number(currentScanner.value);
    }

    previousRsiRef[prevKey] = currentValue;

    if (matched && !triggeredRef[symbol]) {
      const payload = {
        symbol: symbol.toUpperCase(),
        rsi: currentValue.toFixed(2), // Keeping key as rsi for backwards compatibility in UI if needed
        indicator: indicatorType,
        condition: `${currentScanner.condition} ${currentScanner.value}`,
        timestamp: new Date().toLocaleTimeString(),
      };

      console.log(`[Alert Triggered] ${indicatorType} Matched Coin:`, payload);

      if (!matchedCoins.find((item) => item.symbol === payload.symbol)) {
        matchedCoins = [payload, ...matchedCoins];
      }
      alertsFeed = [payload, ...alertsFeed];
      triggeredRef[symbol] = true;
      notifyListeners();

      if (Notification.permission === "granted") {
        new Notification(payload.symbol, { body: `${indicatorType} ${payload.condition}` });
      }

      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (e) {
    console.error("[useAlerts] Error in checkAlert:", e);
  }
};

const extractValue = (tick, type) => {
  const typeLower = type.toLowerCase();
  if (tick.latestTick) {
    let val = tick.latestTick[typeLower] ?? tick.latestTick[type] ?? tick.latestTick.value;
    if (val != null) return Number(val);
    for (const k in tick.latestTick) {
      if (k !== "time" && typeof tick.latestTick[k] === "number") return tick.latestTick[k];
    }
  } else if (tick.data && Array.isArray(tick.data) && tick.data.length > 0) {
    let val = tick.data[0][typeLower] ?? tick.data[0][type] ?? tick.data[0].value;
    if (val != null) return Number(val);
  }
  return null;
};

// --- Socket Handlers ---
const handleStocks = (data) => {
  const stocksArray = Array.isArray(data) ? data : data?.stocks || [];
  stocksArray.forEach((s) => {
    if (s.name && s.rsi != null) {
      checkAlert(s.name, Number(s.rsi), "RSI");
    }
  });
};

const handleStockUpdate = (stock) => {
  if (stock?.name && stock.rsi != null) {
    checkAlert(stock.name, Number(stock.rsi), "RSI");
  }
};

const handleLiveTick = (tick) => {
  const type = tick?.indicatorType || tick?.type;
  if (type) {
    const sym = tick.symbol || tick.name;
    const val = extractValue(tick, type);

    if (sym && Number.isFinite(val)) {
      console.log(`[Indicator Live Tick] Symbol: ${sym}, Type: ${type}, Value: ${val}, Prev: ${previousRsiRef[`${sym}-${type}`]}`);
      checkAlert(sym, val, type);
    }
    return;
  }

  const sym = tick?.symbol || tick?.name;
  if (sym && tick.rsi != null) {
    checkAlert(sym, Number(tick.rsi), "RSI");
  }
};

const handleIndicatorTick = (tick) => {
  const type = tick?.indicatorType || tick?.type;
  if (!type) return;

  const sym = tick.symbol || tick.name;
  const val = extractValue(tick, type);

  if (sym && Number.isFinite(val)) {
    console.log(`[Indicator Tick] Symbol: ${sym}, Type: ${type}, Value: ${val}, Prev: ${previousRsiRef[`${sym}-${type}`]}`);
    checkAlert(sym, val, type);
  }
};

// Bind statically so they don't get duplicated on multiple hook mounts
socket.on(EVENTS.INDICATORS.TICK_UPDATE, handleIndicatorTick);
socket.on(EVENTS.LISTING.RESPONSE, handleStocks);
socket.on(EVENTS.KLINE.LISTING_UPDATE, handleStockUpdate);
socket.on(EVENTS.LIVE_TICK.UPDATE, handleLiveTick);

export default function useAlerts() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return {
    alertsFeed,
    matchedCoins,
    scanner,
    addAlert,
    removeCoin,
    clearAllCoins,
  };
}