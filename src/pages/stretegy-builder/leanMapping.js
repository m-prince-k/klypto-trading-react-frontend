// LEAN / QuantConnect compatibility map.
//
// Goal: for every block in the registry, declare whether it has a 1:1 (or
// near-equivalent) implementation in LEAN's indicator/algo library. If it
// doesn't, surface a concrete `fix` so users can swap in a supported block.
//
// References (LEAN open-source engine):
//   - QuantConnect.Indicators namespace (SMA, EMA, RSI, MACD, ATR, BB, OBV, VWAP…)
//   - QCAlgorithm.Consolidate / History / Schedule
//   - Algorithm.Python templates
// We are intentionally conservative: only mark `supported` when LEAN has a
// drop-in implementation with the same semantics.

import { BLOCKS } from "../stretegy-builder/blockRegistry";

// ───────────────────────────────────────────────────────────────────────
// Curated LEAN equivalents for the well-known blocks. Anything not listed
// here will be reported as `unsupported` with a generic fix.
// ───────────────────────────────────────────────────────────────────────
const SUPPORTED = {
  // Sources
  src_close:    { leanName: "Bar.Close",   namespace: "QuantConnect.Data.Market", pyExample: "self.Securities[symbol].Close" },
  src_open:     { leanName: "Bar.Open",    namespace: "QuantConnect.Data.Market", pyExample: "bar.Open" },
  src_high:     { leanName: "Bar.High",    namespace: "QuantConnect.Data.Market", pyExample: "bar.High" },
  src_low:      { leanName: "Bar.Low",     namespace: "QuantConnect.Data.Market", pyExample: "bar.Low" },
  src_volume:   { leanName: "Bar.Volume",  namespace: "QuantConnect.Data.Market", pyExample: "bar.Volume" },
  ohlc:         { leanName: "TradeBar",    namespace: "QuantConnect.Data.Market", pyExample: "data[symbol]" },
  src_constant: { leanName: "ConstantIndicator", namespace: "QuantConnect.Indicators", pyExample: "ConstantIndicator[float]('k', 0.0)" },

  // Price transforms
  tx_typical: { leanName: "TypicalPrice",  namespace: "QuantConnect.Indicators", pyExample: "self.TP(symbol, Resolution.Daily)" },
  tx_hl2:     { leanName: "MedianPrice",   namespace: "QuantConnect.Indicators", note: "(H+L)/2" },
  tx_hlc3:    { leanName: "TypicalPrice",  namespace: "QuantConnect.Indicators", note: "(H+L+C)/3" },
  tx_ohlc4:   { leanName: "AveragePrice",  namespace: "QuantConnect.Indicators" },
  tx_median:  { leanName: "MedianPrice",   namespace: "QuantConnect.Indicators" },
  tx_weighted:{ leanName: "WeightedClose", namespace: "QuantConnect.Indicators", note: "(H+L+2C)/4" },

  // Returns
  tx_ret:    { leanName: "RateOfChange",          namespace: "QuantConnect.Indicators", pyExample: "self.ROC(symbol, 1)" },
  tx_logret: { leanName: "LogReturn",             namespace: "QuantConnect.Indicators", pyExample: "self.LOGR(symbol, 1)" },
  tx_cumret: { leanName: "CumulativeSum",         namespace: "Indicators.Composite", note: "Compose ROC + RunningSum" },

  // Scaling
  tx_zscore: { leanName: "Zscore",                namespace: "QuantConnect.Indicators" },
  tx_norm:   { leanName: "MinMaxNormalizer",      namespace: "Indicators.Composite", note: "Compose Min/Max + linear scale" },

  // Moving averages
  ind_sma:  { leanName: "SimpleMovingAverage",     namespace: "QuantConnect.Indicators", pyExample: "self.SMA(symbol, 20)" },
  ind_ema:  { leanName: "ExponentialMovingAverage",namespace: "QuantConnect.Indicators", pyExample: "self.EMA(symbol, 20)" },
  ind_wma:  { leanName: "WeightedMovingAverage",   namespace: "QuantConnect.Indicators", pyExample: "self.WMA(symbol, 20)" },
  ind_vwma: { leanName: "VolumeWeightedMovingAverage", namespace: "QuantConnect.Indicators" },
  ind_hma:  { leanName: "HullMovingAverage",       namespace: "QuantConnect.Indicators" },
  ind_rma:  { leanName: "WilderMovingAverage",     namespace: "QuantConnect.Indicators" },
  tx_dema:  { leanName: "DoubleExponentialMovingAverage", namespace: "QuantConnect.Indicators" },
  tx_tema:  { leanName: "TripleExponentialMovingAverage", namespace: "QuantConnect.Indicators" },
  tx_kama:  { leanName: "KaufmanAdaptiveMovingAverage",   namespace: "QuantConnect.Indicators" },
  tx_alma:  { leanName: "ArnaudLegouxMovingAverage",      namespace: "QuantConnect.Indicators" },
  tx_hma:   { leanName: "HullMovingAverage",       namespace: "QuantConnect.Indicators" },

  // Momentum
  ind_rsi:  { leanName: "RelativeStrengthIndex",   namespace: "QuantConnect.Indicators", pyExample: "self.RSI(symbol, 14)" },
  ind_macd: { leanName: "MovingAverageConvergenceDivergence", namespace: "QuantConnect.Indicators", pyExample: "self.MACD(symbol, 12, 26, 9)" },
  ind_roc:  { leanName: "RateOfChange",            namespace: "QuantConnect.Indicators" },

  // Volatility
  ind_atr:        { leanName: "AverageTrueRange",  namespace: "QuantConnect.Indicators", pyExample: "self.ATR(symbol, 14)" },
  tx_true_range:  { leanName: "TrueRange",         namespace: "QuantConnect.Indicators" },
  ind_bb:         { leanName: "BollingerBands",    namespace: "QuantConnect.Indicators", pyExample: "self.BB(symbol, 20, 2)" },
  var_stddev:     { leanName: "StandardDeviation", namespace: "QuantConnect.Indicators" },
  var_variance:   { leanName: "Variance",          namespace: "QuantConnect.Indicators" },
  tx_real_vol:    { leanName: "AnnualizedVolatility", namespace: "QuantConnect.Indicators", note: "Compose StdDev of log-returns × √N" },
  var_hist_vol:   { leanName: "HistoricalVolatility", namespace: "QuantConnect.Indicators" },

  // Volume
  ind_vwap: { leanName: "VolumeWeightedAveragePrice", namespace: "QuantConnect.Indicators", pyExample: "self.VWAP(symbol)" },
  ind_obv:  { leanName: "OnBalanceVolume",            namespace: "QuantConnect.Indicators" },

  // Smoothing (subset)
  tx_rolling_mean: { leanName: "SimpleMovingAverage", namespace: "QuantConnect.Indicators", note: "Equivalent to SMA(window)" },

  // Time-series tools
  tx_lag:            { leanName: "Delay",         namespace: "QuantConnect.Indicators" },
  tx_diff:           { leanName: "Momentum",      namespace: "QuantConnect.Indicators", note: "Momentum(period)=x[t]-x[t-period]" },
  tx_rolling_window: { leanName: "RollingWindow", namespace: "QuantConnect.Indicators" },

  // Operators (mapped to algo-side comparisons in LEAN)
  op_gt:  { leanName: ">",  namespace: "Algorithm", pyExample: "if a.Current.Value > b.Current.Value:" },
  op_lt:  { leanName: "<",  namespace: "Algorithm", pyExample: "if a.Current.Value < b.Current.Value:" },
  op_gte: { leanName: ">=", namespace: "Algorithm" },
  op_lte: { leanName: "<=", namespace: "Algorithm" },
  op_eq:  { leanName: "==", namespace: "Algorithm" },
  op_neq: { leanName: "!=", namespace: "Algorithm" },
  op_xup: { leanName: "IndicatorExtensions.CrossAbove", namespace: "QuantConnect.Indicators",  pyExample: "self.CrossAbove(fast, slow)" },
  op_xdn: { leanName: "IndicatorExtensions.CrossBelow", namespace: "QuantConnect.Indicators",  pyExample: "self.CrossBelow(fast, slow)" },
  op_add: { leanName: "Plus",     namespace: "IndicatorExtensions" },
  op_sub: { leanName: "Minus",    namespace: "IndicatorExtensions" },
  op_mul: { leanName: "Times",    namespace: "IndicatorExtensions" },
  op_div: { leanName: "Over",     namespace: "IndicatorExtensions" },
  op_min: { leanName: "Minimum",  namespace: "QuantConnect.Indicators" },
  op_max: { leanName: "Maximum",  namespace: "QuantConnect.Indicators" },
  op_highn: { leanName: "Maximum", namespace: "QuantConnect.Indicators", pyExample: "self.MAX(symbol, 20)" },
  op_lown:  { leanName: "Minimum", namespace: "QuantConnect.Indicators", pyExample: "self.MIN(symbol, 20)" },

  // Logic / signal / output (algo-level, not indicator-level)
  logic_and:   { leanName: "and", namespace: "Algorithm" },
  logic_or:    { leanName: "or",  namespace: "Algorithm" },
  logic_not:   { leanName: "not", namespace: "Algorithm" },
  sig_buy:     { leanName: "SetHoldings", namespace: "QCAlgorithm", pyExample: "self.SetHoldings(symbol, 1.0)" },
  sig_sell:    { leanName: "Liquidate",   namespace: "QCAlgorithm", pyExample: "self.Liquidate(symbol)" },
  sig_long:    { leanName: "MarketOrder", namespace: "QCAlgorithm", pyExample: "self.MarketOrder(symbol, qty)" },
  sig_short:   { leanName: "MarketOrder", namespace: "QCAlgorithm", pyExample: "self.MarketOrder(symbol, -qty)" },
  out_overlay: { leanName: "Plot",        namespace: "QCAlgorithm", pyExample: "self.Plot('chart', 'price', value)" },
  out_alert:   { leanName: "Notify.Email",namespace: "QCAlgorithm" },
  out_backtest:{ leanName: "Statistics",  namespace: "QCAlgorithm" },
  out_table:   { leanName: "Log",         namespace: "QCAlgorithm" },
  rule_entry:  { leanName: "OnData (entry branch)", namespace: "QCAlgorithm" },
  rule_exit:   { leanName: "OnData (exit branch)",  namespace: "QCAlgorithm" },
  cls_bullish: { leanName: "bool flag",   namespace: "Algorithm" },
  cls_bearish: { leanName: "bool flag",   namespace: "Algorithm" },
  der_boolean: { leanName: "bool",        namespace: "Algorithm" },
};

// Generic per-category fix suggestion when a block has no LEAN equivalent.
const CATEGORY_FIX = {
  source:     { suggestion: "Use Close / OHLC — LEAN feeds these natively via TradeBar.",                  swap: ["src_close", "ohlc"] },
  transform:  { suggestion: "Swap to a LEAN-shipped indicator (SMA, EMA, RSI, MACD, ATR, BB, VWAP).",      swap: ["ind_sma", "ind_ema", "ind_rsi", "ind_atr", "ind_bb"] },
  operator:   { suggestion: "Use a basic comparison or LEAN cross helper instead.",                        swap: ["op_gt", "op_lt", "op_xup", "op_xdn"] },
  derived:    { suggestion: "Coerce to a boolean — LEAN logic branches need bool flags.",                   swap: ["der_boolean"] },
  classifier: { suggestion: "Use Bullish/Bearish classifier (maps to a bool in OnData).",                  swap: ["cls_bullish", "cls_bearish"] },
  rule:       { suggestion: "Use Entry/Exit rule — these map to LEAN's OnData branches.",                  swap: ["rule_entry", "rule_exit"] },
  logic:      { suggestion: "Use AND / OR / NOT — they translate directly to Python boolean ops.",         swap: ["logic_and", "logic_or", "logic_not"] },
  signal:     { suggestion: "Use Buy/Sell/Long/Short — they map to SetHoldings / MarketOrder / Liquidate.",swap: ["sig_buy", "sig_sell", "sig_long", "sig_short"] },
  output:     { suggestion: "Use Overlay/Alert/Backtest/Table — these map to Plot / Notify / Statistics.", swap: ["out_overlay", "out_alert", "out_backtest", "out_table"] },
};

export function getLeanInfo(blockId) {
  const mapping = SUPPORTED[blockId];
  if (mapping) {
    return { blockId, support: "supported", mapping };
  }
  const block = BLOCKS.find((b) => b.id === blockId);
  if (!block) {
    return {
      blockId,
      support: "unsupported",
      fix: { suggestion: "Unknown block. Replace it from the palette." },
    };
  }
  const cf = CATEGORY_FIX[block.category];
  return {
    blockId,
    support: "unsupported",
    fix: {
      suggestion:
        cf?.suggestion ??
        "No LEAN equivalent — replace with a supported block from the same stage.",
      swapToBlockIds: cf?.swap,
    },
  };
}

export function isLeanSupported(blockId) {
  return SUPPORTED[blockId] !== undefined;
}

/** Quick coverage stats for a strategy graph. */
export function leanCoverage(blockIds) {
  let supported = 0;
  const unsupportedIds = [];
  for (const id of blockIds) {
    if (isLeanSupported(id)) supported++;
    else unsupportedIds.push(id);
  }
  const total = blockIds.length;
  return {
    supported,
    unsupported: unsupportedIds.length,
    total,
    ratio: total === 0 ? 0 : supported / total,
    unsupportedIds,
  };
}

/** Helper: given a swap-target block id, render its label. */
export function getBlockLabel(blockId) {
  return BLOCKS.find((b) => b.id === blockId)?.label ?? blockId;
}

export { BLOCKS as _BLOCKS_REF };