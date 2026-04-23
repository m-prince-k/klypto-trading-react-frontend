/////////////////////////////////////////////////////
// :fire: UNIFIED CONFIG (SOURCE + TRANSFORM LAYERS)
/////////////////////////////////////////////////////

const createNode = ({
  stage, // "source" | "transform"
  inputCount = 0,
  inputPlaceholder = "source only",
  accepts = [], // what it accepts from previous step
  operations = [], // next allowed operations
  outputs = [], // final outputs
}) => ({
  stage,
  inputCount,
  inputPlaceholder,
  accepts,
  col3: operations,
  col4: outputs,
});

/////////////////////////////////////////////////////
// :fire: FINAL PIPELINE CONFIG
/////////////////////////////////////////////////////

export const indicatorConfig = {
  //////////////////////////////////////////////////
  // :large_green_circle: SOURCE LAYER
  //////////////////////////////////////////////////

  OHLC: createNode({
    stage: "source",
    operations: [
      "Column Select",
      "Typical Price",
      "Median Price",
      "HL2",
      "HLC3",
      "OHLC4",
      "True Range",
      "ATR",
      "Returns",
      "Gap",
    ],
    outputs: ["Overlay", "Oscillator", "Signal", "Table"],
  }),

  Close: createNode({
    stage: "source",
    operations: [
      "Returns",
      "EMA",
      "SMA",
      "WMA",
      "VWMA",
      "Rolling Mean",
      "Std Dev",
      "RSI",
      "Momentum",
      "Normalize",
      "FFT",
      "Overlay",
    ],
    outputs: ["Overlay", "Oscillator", "Signal", "Regime"],
  }),

  Open: createNode({
    stage: "source",
    operations: ["Compare", "Returns", "Spread", "Normalize"],
    outputs: ["Overlay", "Signal", "Table"],
  }),

  High: createNode({
    stage: "source",
    operations: ["Compare", "Gap", "Threshold", "ATR logic"],
    outputs: ["Overlay", "Signal"],
  }),

  Low: createNode({
    stage: "source",
    operations: ["Compare", "Gap", "Threshold", "ATR logic"],
    outputs: ["Overlay", "Signal"],
  }),

  Volume: createNode({
    stage: "source",
    operations: [
      "Rolling Mean",
      "Normalize",
      "AUC",
      "Compare",
      "VWMA",
      "Threshold",
    ],
    outputs: ["Overlay", "Oscillator", "Signal", "Table"],
  }),

  //////////////////////////////////////////////////
  // BLOCK-2
  //////////////////////////////////////////////////

  AbsoluteValue: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "enter source",
    accepts: ["Returns", "Spread", "Deviation", "Momentum"],
    operations: ["AUC", "Normalize", "Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal", "Table"],
  }),

  SignFunction: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Returns / Momentum / Difference",
    accepts: ["Returns", "Momentum", "Difference"],
    operations: ["Compare", "Threshold", "Signal"],
    outputs: ["Signal", "Table"],
  }),

  FloorCeilRound: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "numeric only",
    accepts: ["Numeric outputs"],
    operations: ["Compare", "Table"],
    outputs: ["Table"],
  }),

  FractionalPart: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "numeric transforms",
    accepts: ["numeric transforms"],
    operations: ["Compare", "Table"],
    outputs: ["Table"],
  }),

  Reciprocal: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "ratio-style numeric",
    accepts: ["ratio-style numeric"],
    operations: ["Normalize", "Compare"],
    outputs: ["Oscillator", "Table"],
  }),

  Clamp: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "RSI / normalized values",
    accepts: ["RSI", "scores", "normalized values"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Table"],
  }),

  LogLnLog10: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "positive numeric series",
    accepts: ["Price", "returns", "positive numeric series"],
    operations: ["Normalize", "Compare", "Threshold", "Oscillator"],
    outputs: ["Oscillator", "Table"],
  }),

  Exponential: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "scores / transforms",
    accepts: ["scores", "transforms"],
    operations: ["Normalize", "Compare", "Overlay"],
    outputs: ["Overlay", "Table"],
  }),

  Power: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "numeric series",
    accepts: ["numeric series"],
    operations: ["Normalize", "Compare", "Threshold"],
    outputs: ["Oscillator", "Table"],
  }),

  Root: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "variance / positive numeric",
    accepts: ["Variance", "positive numeric"],
    operations: ["Normalize", "Compare"],
    outputs: ["Oscillator", "Table"],
  }),

  Factorial: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "integer only",
    accepts: ["integer input only"],
    operations: ["Probability blocks", "Table"],
    outputs: ["Table"],
  }),

  PermutationCombination: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "integer/discrete count inputs",
    accepts: ["integer/discrete count inputs"],
    operations: ["Binomial", "Probability", "Table"],
    outputs: ["Table"],
  }),

  //////////////////////////////////////////////////
  // 🔴 BLOCK-3 (BINARY OPERATIONS)
  //////////////////////////////////////////////////

  Addition: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Mean / Score / Signal components",
    accepts: ["Mean", "Band Width", "Score1", "Score2", "Signal"],
    operations: ["Normalize", "Compare", "Threshold", "Overlay", "Oscillator"],
    outputs: ["Overlay", "Oscillator", "Table"],
  }),

  Subtraction: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Price / EMA / Bands",
    accepts: [
      "Close",
      "Mean",
      "EMA",
      "Price A",
      "Price B",
      "Upper Band",
      "Lower Band",
    ],
    operations: [
      "Divide",
      "Abs",
      "Normalize",
      "Threshold",
      "Overlay",
      "Oscillator",
    ],
    outputs: ["Overlay", "Oscillator", "Signal", "Table"],
  }),

  Multiplication: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Std / Score / ATR",
    accepts: ["Std", "Constant", "Score", "Weight", "ATR", "Multiplier"],
    operations: ["Compare", "Normalize", "Overlay", "Oscillator"],
    outputs: ["Overlay", "Oscillator", "Table"],
  }),

  Division: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Ratios / Relative values",
    accepts: [
      "Close",
      "Mean",
      "Std",
      "Return",
      "ATR",
      "Volume",
      "AvgVolume",
      "Price A",
      "Price B",
    ],
    operations: ["Normalize", "Threshold", "Compare", "Oscillator"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  "Min/Max": createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Signal or constant",
    accepts: ["Signal", "Constant"],
    operations: ["Compare", "Threshold", "Overlay"],
    outputs: ["Overlay", "Table", "Signal"],
  }),

  GreaterThan: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "RSI / Price / Signal",
    accepts: ["RSI", "Threshold", "Price", "Mean", "Signal A", "Signal B"],
    operations: ["Signal markers", "Event count", "AND/OR"],
    outputs: ["Signal", "Table"],
  }),

  LessThan: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "RSI / Price / Signal",
    accepts: ["RSI", "Threshold", "Price", "Mean", "Signal A", "Signal B"],
    operations: ["Signal markers", "Event count", "AND/OR"],
    outputs: ["Signal", "Table"],
  }),

  Equal: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "numeric / boolean",
    accepts: ["Numeric", "Boolean"],
    operations: ["Signal markers", "Table"],
    outputs: ["Signal", "Table"],
  }),

  NotEqual: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "numeric / boolean",
    accepts: ["Numeric", "Boolean"],
    operations: ["Signal markers", "Table"],
    outputs: ["Signal", "Table"],
  }),

  GreaterThanOrEqual: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "numeric / boolean",
    accepts: ["Numeric", "Boolean"],
    operations: ["Signal markers", "Table"],
    outputs: ["Signal", "Table"],
  }),
  
  LessThanOrEqual: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "numeric / boolean",
    accepts: ["Numeric", "Boolean"],
    operations: ["Signal markers", "Table"],
    outputs: ["Signal", "Table"],
  }),

  Crossovers: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "EMA / MACD / RSI",
    accepts: ["EMA Fast", "EMA Slow", "MACD", "Signal", "RSI", "MA"],
    operations: ["Signal markers", "Debounce", "Persistence"],
    outputs: ["Signal", "Table"],
  }),

  Correlation: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Returns / Signals",
    accepts: ["Returns A", "Returns B", "Signal A", "Signal B"],
    operations: ["Heatmap", "Table", "Threshold", "Oscillator"],
    outputs: ["Heatmap", "Table", "Oscillator"],
  }),

  Covariance: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Series A / Series B",
    accepts: ["Series A", "Series B"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  Spread: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Price A / Price B",
    accepts: ["Price A", "Price B"],
    operations: ["Abs", "Normalize", "AUC", "Threshold"],
    outputs: ["Oscillator", "Overlay", "Signal"],
  }),

  RelativePriceRatio: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Price comparison",
    accepts: ["Price A", "Price B"],
    operations: ["Normalize", "Threshold", "Mean"],
    outputs: ["Oscillator", "Overlay", "Signal"],
  }),

  DotProduct: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Vector inputs",
    accepts: ["Vector A", "Vector B"],
    operations: ["Compare", "Table"],
    outputs: ["Table"],
  }),

  Distance: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Points / vectors",
    accepts: ["Vector A", "Vector B", "Point A", "Point B"],
    operations: ["Threshold", "Heatmap", "Table"],
    outputs: ["Heatmap", "Table", "Signal"],
  }),

  Regression: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "X and Y",
    accepts: ["X", "Y"],
    operations: ["Residual", "Overlay", "Table"],
    outputs: ["Overlay", "Table"],
  }),
};
