// Public-API paper-trading engine for the strategy graph.
// Supports Binance Spot (api.binance.com) and Delta Exchange India (api.india.delta.exchange).
// No auth required — purely public market data.

import { getBlock } from "../stretegy-builder/blockRegistry";

// Data fetching

export async function fetchCandles(cfg) {
  if (cfg.exchange === "binance") return fetchBinance(cfg);
  return fetchDelta(cfg);
}

async function fetchBinance(cfg) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(
    cfg.symbol
  )}&interval=${cfg.interval}&limit=${cfg.limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.map((k) => ({
    time: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

const DELTA_RES_MAP = {
  "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1h": "1h", "4h": "4h", "1d": "1d",
};

async function fetchDelta(cfg) {
  const resolution = DELTA_RES_MAP[cfg.interval] ?? "5m";
  const now = Math.floor(Date.now() / 1000);
  const intervalSec = {
    "1m": 60, "5m": 300, "15m": 900, "30m": 1800,
    "1h": 3600, "4h": 14400, "1d": 86400,
  };
  const span = (intervalSec[cfg.interval] ?? 300) * cfg.limit;
  const start = now - span;
  const url = `https://api.india.delta.exchange/v2/history/candles?resolution=${resolution}&symbol=${encodeURIComponent(
    cfg.symbol
  )}&start=${start}&end=${now}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Delta ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const result = json.result ?? [];
  return result
    .map((c) => ({
      time: c.time * 1000,
      open: +c.open, high: +c.high, low: +c.low, close: +c.close, volume: +c.volume,
    }))
    .sort((a, b) => a.time - b.time);
}

// Indicator helpers

const sma = (xs, p) => {
  const out = new Array(xs.length).fill(null);
  let sum = 0;
  let count = 0;
  const buf = [];
  for (let i = 0; i < xs.length; i++) {
    const v = xs[i];
    if (v == null) { out[i] = null; continue; }
    buf.push(v); sum += v; count++;
    if (buf.length > p) sum -= buf.shift();
    if (buf.length === p) out[i] = sum / p;
  }
  return out;
};

const ema = (xs, p) => {
  const out = new Array(xs.length).fill(null);
  const k = 2 / (p + 1);
  let prev = null;
  for (let i = 0; i < xs.length; i++) {
    const v = xs[i];
    if (v == null) { out[i] = prev; continue; }
    prev = prev == null ? v : v * k + prev * (1 - k);
    out[i] = i >= p - 1 ? prev : null;
  }
  return out;
};

const rsi = (xs, p = 14) => {
  const out = new Array(xs.length).fill(null);
  let avgG = 0, avgL = 0;
  for (let i = 1; i < xs.length; i++) {
    const a = xs[i - 1], b = xs[i];
    if (a == null || b == null) continue;
    const ch = b - a;
    const g = Math.max(ch, 0), l = Math.max(-ch, 0);
    if (i <= p) { avgG += g / p; avgL += l / p; if (i === p) out[i] = 100 - 100 / (1 + avgG / (avgL || 1e-9)); }
    else {
      avgG = (avgG * (p - 1) + g) / p;
      avgL = (avgL * (p - 1) + l) / p;
      out[i] = 100 - 100 / (1 + avgG / (avgL || 1e-9));
    }
  }
  return out;
};

const num = (v, d = 0) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return isFinite(n) ? n : d;
};

// Graph evaluation

function topoOrder(nodes, edges) {
  const indeg = new Map();
  const adj = new Map();
  nodes.forEach((n) => indeg.set(n.id, 0));
  edges.forEach((e) => {
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
    adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]);
  });
  const q = [];
  indeg.forEach((d, id) => { if (d === 0) q.push(id); });
  const order = [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  while (q.length) {
    const id = q.shift();
    const n = byId.get(id);
    if (n) order.push(n);
    (adj.get(id) ?? []).forEach((t) => {
      indeg.set(t, (indeg.get(t) ?? 0) - 1);
      if (indeg.get(t) === 0) q.push(t);
    });
  }
  return order;
}

function inputsFor(nodeId, edges) {
  return edges.filter((e) => e.target === nodeId).map((e) => ({ source: e.source, targetHandle: e.targetHandle ?? null }));
}

export function evaluateGraph(nodes, edges, candles) {
  const ctx = { candles, series: {}, bool: {}, warnings: [] };
  const closeSeries = candles.map((c) => c.close);
  const openSeries = candles.map((c) => c.open);
  const highSeries = candles.map((c) => c.high);
  const lowSeries = candles.map((c) => c.low);
  const volumeSeries = candles.map((c) => c.volume);

  const order = topoOrder(nodes, edges);
  for (const n of order) {
    const block = getBlock(n.data.blockId);
    if (!block) continue;
    const ins = inputsFor(n.id, edges);
    const inSeries = (idx = 0) => {
      const sorted = [...ins].sort((a, b) => (a.targetHandle ?? "").localeCompare(b.targetHandle ?? ""));
      const src = sorted[idx];
      return src ? ctx.series[src.source] ?? null : null;
    };
    const inBool = (idx = 0) => {
      const sorted = [...ins].sort((a, b) => (a.targetHandle ?? "").localeCompare(b.targetHandle ?? ""));
      const src = sorted[idx];
      return src ? ctx.bool[src.source] ?? null : null;
    };
    const v = n.data.values ?? {};

    switch (block.id) {
      case "src_close": ctx.series[n.id] = closeSeries; break;
      case "src_open": ctx.series[n.id] = openSeries; break;
      case "src_high": ctx.series[n.id] = highSeries; break;
      case "src_low": ctx.series[n.id] = lowSeries; break;
      case "src_volume": ctx.series[n.id] = volumeSeries; break;
      case "ohlc": ctx.series[n.id] = closeSeries; break;
      case "src_constant": {
        const c = num(v.value, 0);
        ctx.series[n.id] = candles.map(() => c);
        break;
      }
      case "ind_sma": {
        const x = inSeries(0) ?? closeSeries;
        ctx.series[n.id] = sma(x, num(v.period, 20));
        break;
      }
      case "ind_ema": {
        const x = inSeries(0) ?? closeSeries;
        ctx.series[n.id] = ema(x, num(v.period, 20));
        break;
      }
      case "ind_rsi": {
        const x = inSeries(0) ?? closeSeries;
        ctx.series[n.id] = rsi(x, num(v.period, 14));
        break;
      }
      case "tx_ret": {
        const x = inSeries(0) ?? closeSeries;
        ctx.series[n.id] = x.map((c, i) => (i === 0 || c == null || x[i - 1] == null) ? null : ((c - x[i - 1]) / x[i - 1]) * 100);
        break;
      }
      // Arithmetic operators
      case "op_add":
      case "op_sub":
      case "op_mul":
      case "op_div": {
        const a = inSeries(0); const b = inSeries(1);
        const constVal = num(v.value, 0);
        const left = a ?? closeSeries;
        const right = b ?? candles.map(() => constVal);
        const fn = block.id === "op_add" ? (x, y) => x + y
          : block.id === "op_sub" ? (x, y) => x - y
          : block.id === "op_mul" ? (x, y) => x * y
          : (x, y) => (y === 0 ? NaN : x / y);
        ctx.series[n.id] = left.map((x, i) => x == null || right[i] == null ? null : fn(x, right[i]));
        break;
      }
      // Comparison operators -> bool
      case "op_gt":
      case "op_lt":
      case "op_gte":
      case "op_lte":
      case "op_eq": {
        const a = inSeries(0) ?? closeSeries;
        const b = inSeries(1) ?? candles.map(() => num(v.value, 0));
        const cmp = (x, y) => block.id === "op_gt" ? x > y
          : block.id === "op_lt" ? x < y
          : block.id === "op_gte" ? x >= y
          : block.id === "op_lte" ? x <= y
          : Math.abs(x - y) < 1e-9;
        ctx.bool[n.id] = a.map((x, i) => x != null && b[i] != null ? cmp(x, b[i]) : false);
        break;
      }
      // Crossover operators
      case "op_cross_above":
      case "op_xup":
      case "op_cross_below":
      case "op_xdn": {
        const a = inSeries(0) ?? closeSeries;
        const b = inSeries(1) ?? closeSeries;
        const above = block.id === "op_cross_above" || block.id === "op_xup";
        ctx.bool[n.id] = a.map((x, i) => {
          if (i === 0 || x == null || b[i] == null || a[i - 1] == null || b[i - 1] == null) return false;
          return above
            ? a[i - 1] <= b[i - 1] && x > b[i]
            : a[i - 1] >= b[i - 1] && x < b[i];
        });
        break;
      }
      // Logic gates
      case "logic_and":
      case "logic_or":
      case "logic_not": {
        const a = inBool(0) ?? candles.map(() => false);
        const b = inBool(1) ?? candles.map(() => false);
        ctx.bool[n.id] = a.map((x, i) =>
          block.id === "logic_and" ? x && b[i]
          : block.id === "logic_or" ? x || b[i]
          : !x
        );
        break;
      }
      // Signal blocks
      case "sig_buy":
      case "sig_sell":
      case "sig_long":
      case "sig_short":
      // Rule blocks (pass-through boolean)
      case "rule_entry":
      case "rule_exit":
      case "rule_filter":
      case "rule_risk":
      case "rule_position":
      case "rule_session":
      case "rule_universe":
      case "rule_confirmation":
      case "rule_rejection":
      case "rule_watchlist":
      case "rule_regime":
      case "rule_stoploss":
      case "rule_takeprofit":
      // Classifier blocks (pass-through boolean)
      case "cls_bullish":
      case "cls_bearish":
      case "cls_neutral":
      case "cls_breakout":
      case "cls_breakdown":
      case "cls_reversal":
      case "cls_continuation":
      case "cls_high_vol":
      case "cls_low_vol":
      case "cls_volatile":
      case "cls_quiet":
      case "cls_overbought":
      case "cls_oversold":
      case "cls_strong_trend":
      case "cls_weak_trend":
      case "cls_sideways":
      case "cls_risky":
      case "cls_no_trade":
      // Derived blocks (pass-through boolean)
      case "der_event":
      case "der_boolean":
      case "der_numeric":
      case "der_distance":
      case "der_spread":
      case "der_band":
      case "der_channel":
      case "der_zone":
      case "der_support":
      case "der_resistance":
      case "der_pivot":
      case "der_regime":
      case "der_score":
      case "der_rank":
      case "der_probability":
      case "der_risk":
      case "der_feature":
      {
        const passB = inBool(0);
        if (passB) { ctx.bool[n.id] = passB; break; }
        const passNum = inSeries(0);
        if (passNum) { ctx.series[n.id] = passNum; break; }
        break;
      }
      default: {
        if (ins.length > 0) {
          const passNum = inSeries(0);
          if (passNum) { ctx.series[n.id] = passNum; break; }
          const passB = inBool(0);
          if (passB) { ctx.bool[n.id] = passB; break; }
        }
        ctx.warnings.push(`Block "${block.label}" (${block.id}) not implemented in dry-run; skipped.`);
      }
    }
  }
  return ctx;
}

// Backtest

export function runBacktest(candles, ctx, nodes, cfg) {
  // Find signal nodes
  const buyIds = nodes.filter((n) => ["sig_buy", "sig_long"].includes(getBlock(n.data.blockId)?.id ?? "")).map((n) => n.id);
  const sellIds = nodes.filter((n) => ["sig_sell", "sig_short"].includes(getBlock(n.data.blockId)?.id ?? "")).map((n) => n.id);

  const isBuy = (i) => buyIds.some((id) => ctx.bool[id]?.[i]);
  const isSell = (i) => sellIds.some((id) => ctx.bool[id]?.[i]);

  const ruleIds = buyIds.length === 0 && sellIds.length === 0
    ? nodes.filter((n) => ["rule_entry", "cls_bullish", "logic_and", "logic_or", "op_cross_above", "op_gt"].includes(getBlock(n.data.blockId)?.id ?? "")).map((n) => n.id)
    : [];
  const ruleTrue = (i) => ruleIds.some((id) => ctx.bool[id]?.[i]);

  const fee = cfg.feeBps / 10000;
  let cash = cfg.capital;
  let qty = 0;
  let entryPrice = 0;
  const trades = [];
  const signals = [];
  const equityCurve = [];
  let peak = cash;
  let maxDD = 0;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const buy = buyIds.length ? isBuy(i) : ruleTrue(i);
    const sell = sellIds.length ? isSell(i) : (qty > 0 && !ruleTrue(i) && ruleIds.length > 0);

    if (qty === 0 && buy) {
      const price = c.close;
      qty = (cash * (1 - fee)) / price;
      entryPrice = price;
      cash = 0;
      trades.push({ side: "BUY", time: c.time, price, qty, reason: "Signal" });
      signals.push({ time: c.time, type: "BUY", price });
    } else if (qty > 0 && (sell || (sellIds.length === 0 && ruleIds.length > 0 && !ruleTrue(i)))) {
      const price = c.close;
      const proceeds = qty * price * (1 - fee);
      const pnl = proceeds - qty * entryPrice;
      cash = proceeds;
      trades.push({ side: "SELL", time: c.time, price, qty, pnl, reason: sell ? "Signal" : "Exit" });
      signals.push({ time: c.time, type: "SELL", price });
      qty = 0;
    }

    const eq = cash + qty * c.close;
    equityCurve.push({ time: c.time, equity: eq });
    peak = Math.max(peak, eq);
    maxDD = Math.max(maxDD, (peak - eq) / peak);
  }

  if (qty > 0) {
    const last = candles[candles.length - 1];
    const proceeds = qty * last.close * (1 - fee);
    const pnl = proceeds - qty * entryPrice;
    trades.push({ side: "SELL", time: last.time, price: last.close, qty, pnl, reason: "Close at end" });
    cash = proceeds;
    qty = 0;
  }

  const endEquity = cash;
  const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length;
  const closed = trades.filter((t) => t.side === "SELL").length;

  return {
    trades,
    signals,
    equityCurve,
    summary: {
      startEquity: cfg.capital,
      endEquity,
      pnl: endEquity - cfg.capital,
      pnlPct: ((endEquity - cfg.capital) / cfg.capital) * 100,
      trades: closed,
      winRate: closed ? (wins / closed) * 100 : 0,
      maxDrawdownPct: maxDD * 100,
    },
  };
}

export async function runDryRun(nodes, edges, cfg) {
  const candles = await fetchCandles(cfg);
  if (!candles.length) throw new Error("No candle data returned from exchange");
  const ctx = evaluateGraph(nodes, edges, candles);
  const bt = runBacktest(candles, ctx, nodes, cfg);
  return { config: cfg, candles, series: ctx.series, ...bt, warnings: ctx.warnings };
}