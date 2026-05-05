// Curated strategy presets inspired by QuantConnect/LEAN's Algorithm.* template
// library and Stefan Jansen's ML4T patterns. Each template materialises into
// ready-to-run nodes + edges on the StrategyCanvas.
//
// Conventions used by builder:
//   - Node IDs are placeholders (`t_*`); StrategyCanvas remaps them to fresh IDs on load.
//   - Edges should target handle "in-0" unless a block has multiple inputs.

import { MarkerType } from "reactflow";

// Helper: spaced columns for a clean horizontal pipeline
const col = (i, y = 220) => ({ x: 40 + i * 240, y });

export const STRATEGY_TEMPLATES = [
  {
    id: "tpl_sma_cross",
    name: "SMA Crossover (Golden Cross)",
    tagline: "Buy when fast SMA crosses above slow SMA",
    category: "Trend",
    source: "LEAN",
    description:
      "Classic LEAN trend-following template. Two SMAs (fast 50, slow 200); long signal when fast crosses above slow.",
    nodes: [
      { id: "t_close", blockId: "src_close", position: col(0) },
      { id: "t_fast", blockId: "ind_sma", position: col(1, 120), values: { period: 50 } },
      { id: "t_slow", blockId: "ind_sma", position: col(1, 320), values: { period: 200 } },
      { id: "t_xup", blockId: "op_xup", position: col(2) },
      { id: "t_der", blockId: "der_boolean", position: col(3) },
      { id: "t_cls", blockId: "cls_bullish", position: col(4) },
      { id: "t_rule", blockId: "rule_entry", position: col(5) },
      { id: "t_logic", blockId: "logic_and", position: col(6) },
      { id: "t_buy", blockId: "sig_buy", position: col(7) },
      { id: "t_out", blockId: "out_overlay", position: col(8) },
    ],
    edges: [
      { source: "t_close", target: "t_fast", targetHandle: "in-0" },
      { source: "t_close", target: "t_slow", targetHandle: "in-0" },
      { source: "t_fast", target: "t_xup", targetHandle: "in-0" },
      { source: "t_slow", target: "t_xup", targetHandle: "in-1" },
      { source: "t_xup", target: "t_der", targetHandle: "in-0" },
      { source: "t_der", target: "t_cls", targetHandle: "in-0" },
      { source: "t_cls", target: "t_rule", targetHandle: "in-0" },
      { source: "t_rule", target: "t_logic", targetHandle: "in-0" },
      { source: "t_logic", target: "t_buy", targetHandle: "in-0" },
      { source: "t_buy", target: "t_out", targetHandle: "in-0" },
    ],
  },

  {
    id: "tpl_rsi_mr",
    name: "RSI Mean Reversion",
    tagline: "Buy oversold (RSI < 30), exit on neutral",
    category: "Mean Reversion",
    source: "Classic",
    description:
      "Bounce trade: long when RSI(14) drops below 30. Pairs naturally with a take-profit/stop in production.",
    nodes: [
      { id: "t_close", blockId: "src_close", position: col(0) },
      { id: "t_rsi", blockId: "ind_rsi", position: col(1), values: { period: 14 } },
      { id: "t_lt", blockId: "op_lt", position: col(2), values: { value: 30 } },
      { id: "t_der", blockId: "der_boolean", position: col(3) },
      { id: "t_cls", blockId: "cls_bullish", position: col(4) },
      { id: "t_rule", blockId: "rule_entry", position: col(5) },
      { id: "t_logic", blockId: "logic_and", position: col(6) },
      { id: "t_buy", blockId: "sig_buy", position: col(7) },
      { id: "t_out", blockId: "out_overlay", position: col(8) },
    ],
    edges: [
      { source: "t_close", target: "t_rsi", targetHandle: "in-0" },
      { source: "t_rsi", target: "t_lt", targetHandle: "in-0" },
      { source: "t_lt", target: "t_der", targetHandle: "in-0" },
      { source: "t_der", target: "t_cls", targetHandle: "in-0" },
      { source: "t_cls", target: "t_rule", targetHandle: "in-0" },
      { source: "t_rule", target: "t_logic", targetHandle: "in-0" },
      { source: "t_logic", target: "t_buy", targetHandle: "in-0" },
      { source: "t_buy", target: "t_out", targetHandle: "in-0" },
    ],
  },

  {
    id: "tpl_bb_breakout",
    name: "Bollinger Band Breakout",
    tagline: "Long when price breaks above upper band",
    category: "Breakout",
    source: "LEAN",
    description:
      "Volatility-expansion entry: price closes above Bollinger upper band (20, 2σ). Common LEAN breakout pattern.",
    nodes: [
      { id: "t_close", blockId: "src_close", position: col(0) },
      { id: "t_bb", blockId: "ind_bb", position: col(1), values: { period: 20, stddev: 2 } },
      { id: "t_brk", blockId: "op_breakout", position: col(2) },
      { id: "t_der", blockId: "der_boolean", position: col(3) },
      { id: "t_cls", blockId: "cls_bullish", position: col(4) },
      { id: "t_rule", blockId: "rule_entry", position: col(5) },
      { id: "t_logic", blockId: "logic_and", position: col(6) },
      { id: "t_buy", blockId: "sig_buy", position: col(7) },
      { id: "t_out", blockId: "out_overlay", position: col(8) },
    ],
    edges: [
      { source: "t_close", target: "t_bb", targetHandle: "in-0" },
      { source: "t_close", target: "t_brk", targetHandle: "in-0" },
      { source: "t_bb", target: "t_brk", targetHandle: "in-1" },
      { source: "t_brk", target: "t_der", targetHandle: "in-0" },
      { source: "t_der", target: "t_cls", targetHandle: "in-0" },
      { source: "t_cls", target: "t_rule", targetHandle: "in-0" },
      { source: "t_rule", target: "t_logic", targetHandle: "in-0" },
      { source: "t_logic", target: "t_buy", targetHandle: "in-0" },
      { source: "t_buy", target: "t_out", targetHandle: "in-0" },
    ],
  },

  {
    id: "tpl_macd_momentum",
    name: "MACD Momentum",
    tagline: "Long when MACD crosses above zero",
    category: "Momentum",
    source: "ML4T",
    description:
      "Momentum-regime filter from ML4T. Enter long when MACD line crosses above zero.",
    nodes: [
      { id: "t_close", blockId: "src_close", position: col(0) },
      { id: "t_macd", blockId: "ind_macd", position: col(1), values: { fast: 12, slow: 26, signal: 9 } },
      { id: "t_zero", blockId: "src_constant", position: col(1, 360), values: { value: 0 } },
      { id: "t_xup", blockId: "op_xup", position: col(2) },
      { id: "t_der", blockId: "der_boolean", position: col(3) },
      { id: "t_cls", blockId: "cls_bullish", position: col(4) },
      { id: "t_rule", blockId: "rule_entry", position: col(5) },
      { id: "t_logic", blockId: "logic_and", position: col(6) },
      { id: "t_buy", blockId: "sig_buy", position: col(7) },
      { id: "t_out", blockId: "out_overlay", position: col(8) },
    ],
    edges: [
      { source: "t_close", target: "t_macd", targetHandle: "in-0" },
      { source: "t_macd", target: "t_xup", targetHandle: "in-0" },
      { source: "t_zero", target: "t_xup", targetHandle: "in-1" },
      { source: "t_xup", target: "t_der", targetHandle: "in-0" },
      { source: "t_der", target: "t_cls", targetHandle: "in-0" },
      { source: "t_cls", target: "t_rule", targetHandle: "in-0" },
      { source: "t_rule", target: "t_logic", targetHandle: "in-0" },
      { source: "t_logic", target: "t_buy", targetHandle: "in-0" },
      { source: "t_buy", target: "t_out", targetHandle: "in-0" },
    ],
  },

  {
    id: "tpl_atr_breakout",
    name: "ATR Volatility Filter",
    tagline: "Trade only when ATR > threshold",
    category: "Volatility",
    source: "LEAN",
    description:
      "Volatility-gated entry. Combines an EMA trend signal with an ATR(14) > threshold filter via AND logic.",
    nodes: [
      { id: "t_close", blockId: "src_close", position: col(0) },
      { id: "t_ohlc", blockId: "ohlc", position: col(0, 420) },
      { id: "t_ema", blockId: "ind_ema", position: col(1, 120), values: { period: 20 } },
      { id: "t_atr", blockId: "ind_atr", position: col(1, 420), values: { period: 14 } },
      { id: "t_gt", blockId: "op_gt", position: col(2, 120) },
      { id: "t_atrgt", blockId: "op_gt", position: col(2, 420), values: { value: 1 } },
      { id: "t_der1", blockId: "der_boolean", position: col(3, 120) },
      { id: "t_der2", blockId: "der_boolean", position: col(3, 420) },
      { id: "t_cls", blockId: "cls_bullish", position: col(4) },
      { id: "t_rule", blockId: "rule_entry", position: col(5) },
      { id: "t_logic", blockId: "logic_and", position: col(6) },
      { id: "t_buy", blockId: "sig_buy", position: col(7) },
      { id: "t_out", blockId: "out_overlay", position: col(8) },
    ],
    edges: [
      { source: "t_close", target: "t_ema", targetHandle: "in-0" },
      { source: "t_ohlc", target: "t_atr", targetHandle: "in-0" },
      { source: "t_close", target: "t_gt", targetHandle: "in-0" },
      { source: "t_ema", target: "t_gt", targetHandle: "in-1" },
      { source: "t_atr", target: "t_atrgt", targetHandle: "in-0" },
      { source: "t_gt", target: "t_der1", targetHandle: "in-0" },
      { source: "t_atrgt", target: "t_der2", targetHandle: "in-0" },
      { source: "t_der1", target: "t_cls", targetHandle: "in-0" },
      { source: "t_cls", target: "t_rule", targetHandle: "in-0" },
      { source: "t_rule", target: "t_logic", targetHandle: "in-0" },
      { source: "t_der2", target: "t_logic", targetHandle: "in-1" },
      { source: "t_logic", target: "t_buy", targetHandle: "in-0" },
      { source: "t_buy", target: "t_out", targetHandle: "in-0" },
    ],
  },

  {
    id: "tpl_donchian",
    name: "Donchian Channel Breakout",
    tagline: "Turtle-style: break N-day high",
    category: "Breakout",
    source: "LEAN",
    description:
      "Turtle Trading-inspired entry. Long when close breaks the highest high of the last 20 bars.",
    nodes: [
      { id: "t_close", blockId: "src_close", position: col(0) },
      { id: "t_hn", blockId: "op_highn", position: col(1), values: { n: 20 } },
      { id: "t_xup", blockId: "op_xup", position: col(2) },
      { id: "t_der", blockId: "der_boolean", position: col(3) },
      { id: "t_cls", blockId: "cls_bullish", position: col(4) },
      { id: "t_rule", blockId: "rule_entry", position: col(5) },
      { id: "t_logic", blockId: "logic_and", position: col(6) },
      { id: "t_buy", blockId: "sig_buy", position: col(7) },
      { id: "t_out", blockId: "out_overlay", position: col(8) },
    ],
    edges: [
      { source: "t_close", target: "t_hn", targetHandle: "in-0" },
      { source: "t_close", target: "t_xup", targetHandle: "in-0" },
      { source: "t_hn", target: "t_xup", targetHandle: "in-1" },
      { source: "t_xup", target: "t_der", targetHandle: "in-0" },
      { source: "t_der", target: "t_cls", targetHandle: "in-0" },
      { source: "t_cls", target: "t_rule", targetHandle: "in-0" },
      { source: "t_rule", target: "t_logic", targetHandle: "in-0" },
      { source: "t_logic", target: "t_buy", targetHandle: "in-0" },
      { source: "t_buy", target: "t_out", targetHandle: "in-0" },
    ],
  },

  {
    id: "tpl_zscore_mr",
    name: "Z-Score Mean Reversion (ML4T)",
    tagline: "Fade extreme deviations from mean",
    category: "Mean Reversion",
    source: "ML4T",
    description:
      "Stefan Jansen's stat-arb building block. Computes 20-bar z-score of close; long when z < -2 (oversold).",
    nodes: [
      { id: "t_close", blockId: "src_close", position: col(0) },
      { id: "t_z", blockId: "tx_zscore", position: col(1), values: { period: 20 } },
      { id: "t_lt", blockId: "op_lt", position: col(2), values: { value: -2 } },
      { id: "t_der", blockId: "der_boolean", position: col(3) },
      { id: "t_cls", blockId: "cls_bullish", position: col(4) },
      { id: "t_rule", blockId: "rule_entry", position: col(5) },
      { id: "t_logic", blockId: "logic_and", position: col(6) },
      { id: "t_buy", blockId: "sig_buy", position: col(7) },
      { id: "t_out", blockId: "out_overlay", position: col(8) },
    ],
    edges: [
      { source: "t_close", target: "t_z", targetHandle: "in-0" },
      { source: "t_z", target: "t_lt", targetHandle: "in-0" },
      { source: "t_lt", target: "t_der", targetHandle: "in-0" },
      { source: "t_der", target: "t_cls", targetHandle: "in-0" },
      { source: "t_cls", target: "t_rule", targetHandle: "in-0" },
      { source: "t_rule", target: "t_logic", targetHandle: "in-0" },
      { source: "t_logic", target: "t_buy", targetHandle: "in-0" },
      { source: "t_buy", target: "t_out", targetHandle: "in-0" },
    ],
  },
];

/**
 * Materialise a template into ReactFlow {nodes, edges} with fresh IDs.
 * Returns the next id-counter so the canvas can keep its sequence.
 */
export function materializeTemplate(tpl, startCounter) {
  const idMap = new Map();
  let counter = startCounter;
  tpl.nodes.forEach((n) => {
    const newId = `n_${counter++}`;
    idMap.set(n.id, newId);
  });

  const nodes = tpl.nodes.map((n) => ({
    id: idMap.get(n.id),
    type: "strategy",
    position: n.position,
    data: { blockId: n.blockId, values: n.values ?? {} },
  }));

  const edges = tpl.edges.map((e, i) => ({
    id: `e_${tpl.id}_${i}_${idMap.get(e.source)}_${idMap.get(e.target)}`,
    source: idMap.get(e.source),
    target: idMap.get(e.target),
    targetHandle: e.targetHandle ?? "in-0",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

  return { nodes, edges, nextCounter: counter };
}