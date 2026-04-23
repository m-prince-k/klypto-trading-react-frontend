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

  Addition: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Mean + band width / Score1 + Score2 / Signal components",
    accepts: ["Mean + band width", "Score1 + Score2", "Signal components"],
    operations: ["Normalize", "Compare", "Threshold"],
    outputs: ["Overlay", "Oscillator", "Table"],
  }),

  // -----------------------------------------------------3rd Blob   K STARTS HERE------------------------------

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

  // ----------------------------------------------------------------4TH BLOCK STARTS HERE------------------------------
  ColumnSelect: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC -> Close/High/Low/Open/Volume",
    accepts: ["OHLC"],
    operations: ["Returns", "EMA", "Mean", "Std Dev", "RSI", "FFT", "AUC"],
    outputs: ["Overlay", "Oscillator", "Signal", "Table"],
  }),

  TypicalPrice: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC",
    accepts: ["OHLC"],
    operations: ["EMA", "Mean", "RSI", "Returns"],
    outputs: ["Overlay", "Oscillator"],
  }),

  WeightedPrice: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC",
    accepts: ["OHLC"],
    operations: ["EMA", "Compare", "Returns"],
    outputs: ["Overlay", "Oscillator"],
  }),

  MedianPrice: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC",
    accepts: ["OHLC"],
    operations: ["EMA", "Threshold", "Returns"],
    outputs: ["Overlay", "Oscillator"],
  }),

  HL2_HLC3_OHLC4: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC",
    accepts: ["OHLC"],
    operations: ["EMA", "Mean", "RSI", "ATR relations"],
    outputs: ["Overlay", "Oscillator"],
  }),

  ReturnsExtended: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Price series",
    accepts: ["Price series"],
    operations: [
      "Std Dev",
      "Historical Vol",
      "Realized Vol",
      "GARCH",
      "AUC",
      "Normalize",
      "Threshold",
    ],
    outputs: ["Oscillator", "Overlay", "Signal", "Table"],
  }),

  CumulativeReturns: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Returns",
    accepts: ["Returns"],
    operations: ["Overlay", "Compare", "Threshold"],
    outputs: ["Overlay", "Table", "Signal"],
  }),

  TrueRange: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC",
    accepts: ["OHLC"],
    operations: ["ATR", "AUC", "Compare"],
    outputs: ["Overlay", "Oscillator"],
  }),

  GapCalculation: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC",
    accepts: ["OHLC"],
    operations: ["Threshold", "Signal", "Event count"],
    outputs: ["Signal", "Table"],
  }),

  RollingNormalization: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Oscillator", "Signal"],
    outputs: ["Oscillator", "Signal"],
  }),

  RankPercentile: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / matrix",
    accepts: ["TS", "matrix"],
    operations: ["Threshold", "Heatmap", "Oscillator"],
    outputs: ["Oscillator", "Heatmap", "Table", "Signal"],
  }),

  Detrending: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["FFT", "Volatility", "Regression", "Oscillator"],
    outputs: ["Oscillator", "Overlay", "Regime"],
  }),

  Deseasonalization: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["ARIMA", "FFT", "Compare"],
    outputs: ["Overlay", "Oscillator", "Table"],
  }),

  // ---------------------------------------------5th BLOCK START HERE-------------------------------

  SMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Close, Typical Price, HLC3, RSI",
    accepts: ["Close", "Typical Price", "HLC3", "RSI"],
    operations: ["Crossovers", "Compare", "Overlay"],
    outputs: ["Overlay", "Signal"],
  }),

  EMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Close, RSI, MACD, other TS",
    accepts: ["Close", "RSI", "MACD", "TS"],
    operations: ["Crossovers", "Subtract", "Overlay", "Threshold"],
    outputs: ["Overlay", "Signal", "Oscillator"],
  }),

  WMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Crossovers", "Compare", "Overlay"],
    outputs: ["Overlay", "Signal"],
  }),

  VWMA: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Price + Volume",
    accepts: ["Price", "Volume"],
    operations: ["Compare", "Crossovers", "Overlay"],
    outputs: ["Overlay", "Signal"],
  }),

  RollingMean: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Std Dev", "Subtract", "Crossovers", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  MovingMedian: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare", "Threshold", "Overlay"],
    outputs: ["Overlay", "Oscillator", "Signal"],
  }),

  ExponentialSmoothing: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  GaussianSmoothing: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Derivative", "Compare", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  KernelSmoothing: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Derivative", "Compare", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  SavitzkyGolay: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Derivative", "Threshold", "Overlay"],
    outputs: ["Overlay", "Oscillator", "Signal"],
  }),

  HMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Crossovers", "Overlay"],
    outputs: ["Overlay", "Signal"],
  }),

  KAMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare", "Threshold", "Overlay"],
    outputs: ["Overlay", "Signal"],
  }),

  ALMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Crossovers", "Overlay"],
    outputs: ["Overlay", "Signal"],
  }),

  TMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare", "Overlay"],
    outputs: ["Overlay"],
  }),

  DEMA_TEMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Crossovers", "Compare", "Overlay"],
    outputs: ["Overlay", "Signal"],
  }),

  LowPassFilter: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare", "Derivative", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  KalmanFilter: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / matrix",
    accepts: ["TS", "matrix"],
    operations: ["Forecast", "Regime", "Overlay"],
    outputs: ["Overlay", "Regime", "Table"],
  }),

  MedianFilter: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare", "Threshold", "Overlay"],
    outputs: ["Overlay", "Signal"],
  }),

  AdaptiveSmoothing: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Crossovers", "Compare"],
    outputs: ["Overlay", "Signal"],
  }),

  LWRegressionSmoothing: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Derivative", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  // ---------------------------------------------6th BLOCK START HERE-------------------------------

  Variance: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Returns / Price / Vector",
    accepts: ["Returns", "Price", "Vector"],
    operations: ["Root", "Normalize", "Threshold"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  StandardDeviation: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Close / Returns / TS / Vector / Matrix",
    accepts: ["Close", "Returns", "TS", "Vector", "Matrix"],
    operations: ["Subtract", "Divide", "Multiply Const", "Bands", "Threshold"],
    outputs: ["Overlay", "Oscillator", "Signal", "Table"],
  }),

  MeanAbsoluteDeviation: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Normalize", "Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal", "Table"],
  }),

  BollingerBands: createNode({
    stage: "transform",
    inputCount: 3,
    inputPlaceholder: "Price + Mean + Std Dev",
    accepts: ["Price", "Mean", "Std Dev"],
    operations: ["Overlay", "Threshold", "Band Width"],
    outputs: ["Overlay", "Signal"],
  }),

  ATR: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC / True Range",
    accepts: ["OHLC", "True Range"],
    operations: ["Overlay", "Threshold", "Position Sizing"],
    outputs: ["Overlay", "Signal", "Table"],
  }),

  HistoricalVolatility: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Returns",
    accepts: ["Returns"],
    operations: ["Oscillator", "Threshold", "VaR"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  RealizedVolatility: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Returns",
    accepts: ["Returns"],
    operations: ["Oscillator", "Threshold", "Risk Blocks"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  ImpliedVolatility: createNode({
    stage: "transform",
    inputCount: 4, // (you can allow dynamic later)
    inputPlaceholder: "Price / Strike / Time / Rate",
    accepts: ["Price", "Strike", "Time", "Rate"],
    operations: ["Table", "Surface", "Compare"],
    outputs: ["Table", "Heatmap"],
  }),

  CoefficientOfVariation: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Mean + Spread",
    accepts: ["Mean", "Spread"],
    operations: ["Compare", "Threshold"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  Range: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / OHLC",
    accepts: ["TS", "OHLC"],
    operations: ["Threshold", "Compare", "Overlay"],
    outputs: ["Overlay", "Signal", "Table"],
  }),

  InterquartileRange: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Oscillator"],
  }),

  ParkinsonGKRS: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC",
    accepts: ["OHLC"],
    operations: ["Threshold", "Compare", "Vol Rank"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  VolatilityPercentile: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Volatility TS",
    accepts: ["Volatility"],
    operations: ["Threshold", "Oscillator", "Heatmap"],
    outputs: ["Oscillator", "Heatmap", "Signal"],
  }),

  EntropyDispersion: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / Distribution",
    accepts: ["TS", "Distribution"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Oscillator", "Signal"],
  }),

  RollingVarianceRatio: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Regime"],
    outputs: ["Oscillator", "Regime", "Signal"],
  }),

  // --------------------------------------------------------7TH BLOCK STARTS HERE------------------------------

  //////////////////////////////////////////////////
  // BLOCK-2 (MOMENTUM + OSCILLATORS - FIXED)
  //////////////////////////////////////////////////

  ROC: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Price TS",
    accepts: ["Price TS"],
    operations: ["Threshold", "Normalize", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  Momentum: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Price TS",
    accepts: ["Price TS"],
    operations: ["Threshold", "Normalize"],
    outputs: ["Oscillator", "Signal"],
  }),

  RSI: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Price TS",
    accepts: ["Price TS"],
    operations: ["Threshold", "Divergence", "Oscillator", "Signal"],
    outputs: ["Oscillator", "Signal"],
  }),

  StochasticOscillator: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "OHLC / Price TS",
    accepts: ["OHLC", "Price TS"],
    operations: ["Threshold", "Crossovers"],
    outputs: ["Oscillator", "Signal"],
  }),

  MACD: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "EMA Fast + EMA Slow (or Price TS)",
    accepts: ["EMA Fast", "EMA Slow", "Price TS"],
    operations: ["Signal EMA", "Histogram", "Threshold"],
    outputs: ["Oscillator", "Signal"],
  }),

  Acceleration: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Derivative / TS",
    accepts: ["TS", "Derivative"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  Jerk: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Acceleration / TS",
    accepts: ["Acceleration", "TS"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  SlopeAngle: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Compare"],
    outputs: ["Oscillator", "Signal"],
  }),

  VelocityNormalization: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  MomentumDivergenceDetector: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Price TS + RSI / MACD",
    accepts: ["Price TS", "RSI", "MACD"],
    operations: ["Signal markers", "Compare"],
    outputs: ["Signal", "Table"],
  }),

  RelativeMomentumRatio: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Momentum A + Momentum B",
    accepts: ["Momentum", "Momentum TS"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  MultiTimeframeMomentumFusion: createNode({
    stage: "transform",
    inputCount: 3,
    inputPlaceholder: "Momentum (TF1 + TF2 + TF3)",
    accepts: ["Momentum", "TS"],
    operations: ["Threshold", "Oscillator", "Signal"],
    outputs: ["Oscillator", "Signal"],
  }),

  ElasticMomentumScore: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Normalize", "Threshold"],
    outputs: ["Oscillator", "Signal"],
  }),

  MeanReversionDistanceScore: createNode({
    stage: "transform",
    inputCount: 3,
    inputPlaceholder: "Price + Mean + Spread",
    accepts: ["Price TS", "Mean", "Spread"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  ImpulseStrength: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Signal"],
    outputs: ["Oscillator", "Signal"],
  }),

  MomentumDecay: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Regime"],
    outputs: ["Oscillator", "Signal", "Regime"],
  }),

  // ------------------------------------------------------8th BLOCK STARTS HERE------------------------------

  FirstDerivative: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Smoothed Price / TS",
    accepts: ["TS", "Smoothed Price"],
    operations: ["Threshold", "Oscillator", "Overlay"],
    outputs: ["Oscillator", "Overlay", "Signal"],
  }),

  SecondDerivative: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Derivative / TS",
    accepts: ["TS", "Derivative"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  GradientCalculation: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Matrix / Surface",
    accepts: ["matrix", "surface"],
    operations: ["Table", "Heatmap", "Surface"],
    outputs: ["Table", "Heatmap", "3D"],
  }),

  AUC: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / Vector (usually after Abs)",
    accepts: ["TS", "vector"],
    operations: ["Normalize", "Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal", "Table"],
  }),

  CumulativeIntegration: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / Vector",
    accepts: ["TS", "vector"],
    operations: ["Overlay", "Oscillator"],
    outputs: ["Overlay", "Oscillator"],
  }),

  DefiniteIndefiniteIntegrals: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "Function Pack + Limits",
    accepts: ["function pack", "limits"],
    operations: ["Table", "Surface"],
    outputs: ["Table", "3D"],
  }),

  ODE: createNode({
    stage: "transform",
    inputCount: 3,
    inputPlaceholder: "State + Parameters + Time",
    accepts: ["state", "parameters", "time"],
    operations: ["Solve", "Table", "Overlay projection"],
    outputs: ["Table", "Overlay"],
  }),

  PDE: createNode({
    stage: "transform",
    inputCount: 3,
    inputPlaceholder: "Surface + Parameters + Time",
    accepts: ["surface", "parameters", "time"],
    operations: ["Surface", "Heatmap", "Table"],
    outputs: ["Heatmap", "3D", "Table"],
  }),

  HeatEquation: createNode({
    stage: "transform",
    inputCount: 3,
    inputPlaceholder: "Parameter Pack + TS/Matrix",
    accepts: ["parameters", "TS", "matrix"],
    operations: ["Surface", "Heatmap", "Overlay projection"],
    outputs: ["Heatmap", "3D", "Overlay"],
  }),

  BlackScholesPDE: createNode({
    stage: "transform",
    inputCount: 3,
    inputPlaceholder: "Pricing Pack",
    accepts: ["pricing inputs", "parameters", "market data"],
    operations: ["Surface", "Table", "Greeks"],
    outputs: ["Table", "Heatmap", "3D"],
  }),

  PartialDerivatives: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Function Pack",
    accepts: ["function pack"],
    operations: ["Table", "Surface"],
    outputs: ["Table", "3D"],
  }),

  DirectionalDerivatives: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Function Pack",
    accepts: ["function pack"],
    operations: ["Table", "Surface"],
    outputs: ["Table", "3D"],
  }),

  Laplacian: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Surface / Matrix",
    accepts: ["surface", "matrix"],
    operations: ["Heatmap", "Surface"],
    outputs: ["Heatmap", "3D"],
  }),

  Jacobian: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Function Pack",
    accepts: ["function pack"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  Hessian: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Function Pack",
    accepts: ["function pack"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  Curvature: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / Surface",
    accepts: ["TS", "surface"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  InflectionPointDetector: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Signal markers", "Threshold"],
    outputs: ["Signal", "Table"],
  }),

  NumericalDifferentiation: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / Vector",
    accepts: ["TS", "vector"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  NumericalIntegration: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / Vector",
    accepts: ["TS", "vector"],
    operations: ["Normalize", "Threshold"],
    outputs: ["Oscillator", "Signal", "Table"],
  }),

  TaylorSeriesExpansion: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Function Pack",
    accepts: ["function pack"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  GradientFlow: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Parameter Pack",
    accepts: ["parameters"],
    operations: ["Table", "Surface"],
    outputs: ["Table", "3D"],
  }),

  GradientDescent: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Objective + Parameters",
    accepts: ["objective", "parameters"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  EulerMethod: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "ODE Parameter Pack",
    accepts: ["ODE parameters"],
    operations: ["Table", "Overlay projection"],
    outputs: ["Table", "Overlay"],
  }),

  RungeKuttaMethods: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "ODE Parameter Pack",
    accepts: ["ODE parameters"],
    operations: ["Table", "Overlay projection"],
    outputs: ["Table", "Overlay"],
  }),

  // ------------------------------------------------------10th BLOCK STARTS HERE------------------------------

  Vectors: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "feature vector",
    accepts: ["feature vector"],
    operations: ["Dot", "Norm", "Projection", "Table"],
    outputs: ["Table"],
  }),

  Matrices: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "feature matrix",
    accepts: ["feature matrix"],
    operations: ["PCA", "SVD", "Inverse", "Heatmap"],
    outputs: ["Heatmap", "Table"],
  }),

  EigenvaluesEigenvectors: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["Table", "PCA-like analysis"],
    outputs: ["Table", "Heatmap"],
  }),

  MatrixMultiplication: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "matrix A + matrix B",
    accepts: ["matrix A", "matrix B"],
    operations: ["Projection", "Transform", "Table"],
    outputs: ["Table"],
  }),

  CovarianceMatrix: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["PCA", "Heatmap", "Inverse"],
    outputs: ["Heatmap", "Table"],
  }),

  PCA: createNode({
    stage: "transform",
    inputCount: 4,
    inputPlaceholder: "Feature1 + Feature2 + Feature3",
    accepts: ["Feature1", "Feature2", "Feature3"],
    operations: ["PC extraction", "Clustering", "Heatmap"],
    outputs: ["Oscillator", "Heatmap", "Table", "3D"],
  }),

  DotProduct: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "vector A + vector B",
    accepts: ["vector A", "vector B"],
    operations: ["Compare", "Table"],
    outputs: ["Table"],
  }),

  CrossProduct: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "vector A + vector B",
    accepts: ["vector A", "vector B"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  VectorNorm: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "vector",
    accepts: ["vector"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Signal"],
  }),

  Projection: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "vector/matrix + axis/basis",
    accepts: ["vector", "matrix", "axis", "basis"],
    operations: ["Oscillator", "Table"],
    outputs: ["Oscillator", "Table"],
  }),

  Orthogonality: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "vectors / matrix",
    accepts: ["vector", "matrix"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  MatrixInverse: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["Portfolio blocks", "Table"],
    outputs: ["Table", "Heatmap"],
  }),

  Determinant: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  Trace: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  SVD: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["Table", "Heatmap", "Feature reduction"],
    outputs: ["Table", "Heatmap"],
  }),

  QRDecomposition: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  LinearSystemSolver: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "matrix + vector",
    accepts: ["matrix", "vector"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  TensorOperations: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "tensor pack",
    accepts: ["tensor"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  FeatureSpaceTransformation: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["PCA", "ML", "Heatmap"],
    outputs: ["Heatmap", "Table", "Oscillator"],
  }),
};
