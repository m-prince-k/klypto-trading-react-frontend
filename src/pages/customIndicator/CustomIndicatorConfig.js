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
  operator,
}) => ({
  stage,
  inputCount,
  inputPlaceholder,
  accepts,
  col3: operations,
  col4: outputs,
  operator,
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


  // -----------------------------------------------------3rd BLOCK STARTS HERE------------------------------

  Addition: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
    inputPlaceholder: "Mean / Score / Signal components",
    accepts: ["Mean", "Band Width", "Score1", "Score2", "Signal"],
    operations: ["Normalize", "Compare", "Threshold", "Overlay", "Oscillator"],
    outputs: ["Overlay", "Oscillator", "Table"],
  }),

  Subtraction: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "-",
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
    operator: "*",
    inputPlaceholder: "Std / Score / ATR",
    accepts: ["Std", "Constant", "Score", "Weight", "ATR", "Multiplier"],
    operations: ["Compare", "Normalize", "Overlay", "Oscillator"],
    outputs: ["Overlay", "Oscillator", "Table"],
  }),

  Division: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "/",
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
    operator: "+",
    inputCount: 2,
    inputPlaceholder: "Signal or constant",
    accepts: ["Signal", "Constant"],
    operations: ["Compare", "Threshold", "Overlay"],
    outputs: ["Overlay", "Table", "Signal"],
  }),

  GreaterThan: createNode({
    stage: "transform",
    inputCount: 2,
    operator: ">",
    inputPlaceholder: "RSI / Price / Signal",
    accepts: ["RSI", "Threshold", "Price", "Mean", "Signal A", "Signal B"],
    operations: ["Signal markers", "Event count", "AND/OR"],
    outputs: ["Signal", "Table"],
  }),

  LessThan: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "<",
    inputPlaceholder: "RSI / Price / Signal",
    accepts: ["RSI", "Threshold", "Price", "Mean", "Signal A", "Signal B"],
    operations: ["Signal markers", "Event count", "AND/OR"],
    outputs: ["Signal", "Table"],
  }),

  Equal: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "=",
    inputPlaceholder: "numeric / boolean",
    accepts: ["Numeric", "Boolean"],
    operations: ["Signal markers", "Table"],
    outputs: ["Signal", "Table"],
  }),

  NotEqual: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "!=",
    inputPlaceholder: "numeric / boolean",
    accepts: ["Numeric", "Boolean"],
    operations: ["Signal markers", "Table"],
    outputs: ["Signal", "Table"],
  }),

  GreaterThanOrEqual: createNode({
    stage: "transform",
    inputCount: 2,
    operator: ">=",
    inputPlaceholder: "numeric / boolean",
    accepts: ["Numeric", "Boolean"],
    operations: ["Signal markers", "Table"],
    outputs: ["Signal", "Table"],
  }),

  LessThanOrEqual: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "<=",
    inputPlaceholder: "numeric / boolean",
    accepts: ["Numeric", "Boolean"],
    operations: ["Signal markers", "Table"],
    outputs: ["Signal", "Table"],
  }),

  Crossovers: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
    inputPlaceholder: "EMA / MACD / RSI",
    accepts: ["EMA Fast", "EMA Slow", "MACD", "Signal", "RSI", "MA"],
    operations: ["Signal markers", "Debounce", "Persistence"],
    outputs: ["Signal", "Table"],
  }),

  Correlation: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
    inputPlaceholder: "Returns / Signals",
    accepts: ["Returns A", "Returns B", "Signal A", "Signal B"],
    operations: ["Heatmap", "Table", "Threshold", "Oscillator"],
    outputs: ["Heatmap", "Table", "Oscillator"],
  }),

  Covariance: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
    inputPlaceholder: "Series A / Series B",
    accepts: ["Series A", "Series B"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  Spread: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
    inputPlaceholder: "Price A / Price B",
    accepts: ["Price A", "Price B"],
    operations: ["Abs", "Normalize", "AUC", "Threshold"],
    outputs: ["Oscillator", "Overlay", "Signal"],
  }),

  RelativePriceRatio: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
    inputPlaceholder: "Price comparison",
    accepts: ["Price A", "Price B"],
    operations: ["Normalize", "Threshold", "Mean"],
    outputs: ["Oscillator", "Overlay", "Signal"],
  }),

  DotProduct: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
    inputPlaceholder: "Vector inputs",
    accepts: ["Vector A", "Vector B"],
    operations: ["Compare", "Table"],
    outputs: ["Table"],
  }),

  Distance: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
    inputPlaceholder: "Points / vectors",
    accepts: ["Vector A", "Vector B", "Point A", "Point B"],
    operations: ["Threshold", "Heatmap", "Table"],
    outputs: ["Heatmap", "Table", "Signal"],
  }),

  Regression: createNode({
    stage: "transform",
    inputCount: 2,
    operator: "+",
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

  //-------------------------------------------------------9th BLOCK STARTS HERE------------------------------
  Mean: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS/vector/matrix",
    accepts: ["TS", "vector", "matrix"],
    operations: ["Compare", "Threshold", "Overlay"],
    outputs: ["Overlay", "Table", "Oscillator"],
  }),

  Median: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS/vector",
    accepts: ["TS", "vector"],
    operations: ["Compare", "Threshold"],
    outputs: ["Table", "Oscillator"],
  }),

  Mode: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "vector/sample",
    accepts: ["vector", "sample"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  Skewness: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "sample / rolling TS",
    accepts: ["sample", "TS"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  Kurtosis: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "sample / rolling TS",
    accepts: ["sample", "TS"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Table"],
  }),

  ConditionalProbability: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "boolean event + sample/event set",
    accepts: ["boolean", "sample", "event set"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Signal"],
  }),

  BayesTheorem: createNode({
    stage: "transform",
    inputCount: 4,
    inputPlaceholder: "prior + likelihood + evidence + extra",
    accepts: ["prior", "likelihood", "evidence"],
    operations: ["Table", "Probability curve"],
    outputs: ["Table", "Distribution curve"],
  }),

  JointDistributions: createNode({
    stage: "transform",
    inputCount: 3,
    inputPlaceholder: "paired samples",
    accepts: ["samples", "pairs"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  StatDistributionPack: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "samples/params",
    accepts: ["samples", "params"],
    operations: ["PDF", "CDF", "Quantile", "Table"],
    outputs: ["Distribution curve", "Table", "Heatmap"],
  }),

  Covariance: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "pair/matrix",
    accepts: ["pair", "matrix"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  Correlation: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "pair/matrix",
    accepts: ["pair", "matrix"],
    operations: ["Heatmap", "Threshold", "Table", "Oscillator"],
    outputs: ["Heatmap", "Table", "Oscillator", "Signal"],
  }),

  Regression: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "X + Y",
    accepts: ["X", "Y"],
    operations: ["Overlay", "Residual", "Table"],
    outputs: ["Overlay", "Table"],
  }),

  HypothesisTesting: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "sample pack",
    accepts: ["sample"],
    operations: ["p-value", "Threshold", "Table"],
    outputs: ["Table", "Signal"],
  }),

  ConfidenceIntervals: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "statistic/sample",
    accepts: ["statistic", "sample"],
    operations: ["Table", "Overlay if rolling"],
    outputs: ["Table", "Overlay"],
  }),

  ZScore: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS/vector",
    accepts: ["TS", "vector"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  DistributionFamily: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "samples / params",
    accepts: ["samples", "params"],
    operations: ["PDF", "CDF", "Quantile"],
    outputs: ["Distribution curve", "Table"],
  }),

  PDF_CDF: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "distribution",
    accepts: ["distribution"],
    operations: ["Threshold", "Curve", "Table"],
    outputs: ["Distribution curve", "Table", "Signal"],
  }),

  LikelihoodMLE: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "sample pack + model",
    accepts: ["sample", "model"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  KDE: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "samples",
    accepts: ["samples"],
    operations: ["Distribution curve", "Quantile"],
    outputs: ["Distribution curve", "Table"],
  }),

  QuantilesPercentiles: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "sample / distribution / rolling TS",
    accepts: ["sample", "distribution", "TS"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Signal", "Oscillator"],
  }),

  MAD: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS/vector",
    accepts: ["TS", "vector"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Table"],
  }),

  RobustStatistics: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "sample pack",
    accepts: ["sample"],
    operations: ["Table", "Threshold"],
    outputs: ["Table", "Signal"],
  }),

  AutoCorrelation: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "TS / pair TS",
    accepts: ["TS"],
    operations: ["Oscillator", "Table", "Heatmap"],
    outputs: ["Oscillator", "Table", "Heatmap"],
  }),

  ANOVA: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "grouped samples",
    accepts: ["samples"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  PValueEngine: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "test result",
    accepts: ["test result"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Signal"],
  }),

  BootstrapResampling: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "sample pack",
    accepts: ["sample"],
    operations: ["CI", "Table"],
    outputs: ["Table"],
  }),

  MonteCarlo: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "simulation/sample pack",
    accepts: ["simulation", "sample"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Signal"],
  }),

  ExpectedValue: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "distribution/sample",
    accepts: ["distribution", "sample"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  VarianceReturns: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "returns TS",
    accepts: ["returns"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Table"],
  }),

  SharpeScore: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "returns + vol + benchmark",
    accepts: ["returns", "vol", "benchmark"],
    operations: ["Threshold", "Table", "Heatmap"],
    outputs: ["Table", "Heatmap", "Signal"],
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
  // ------------------------------------------------------11th BLOCK STARTS HERE------------------------------

  FourierTransform: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "evenly sampled TS",
    accepts: ["TS"],
    operations: ["Spectral analysis", "Dominant frequency"],
    outputs: ["Table", "Oscillator", "Regime"],
  }),

  FFT: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "evenly sampled TS",
    accepts: ["TS"],
    operations: [
      "Dominant frequency",
      "Signal energy",
      "Band-pass",
      "Cycle extraction",
    ],
    outputs: ["Oscillator", "Overlay", "Table", "Heatmap", "Regime"],
  }),

  WaveletTransform: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Energy by scale", "Denoise", "Threshold"],
    outputs: ["Heatmap", "Overlay", "Oscillator", "Signal"],
  }),

  HilbertTransform: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Envelope", "Phase", "Threshold"],
    outputs: ["Oscillator", "Overlay", "Signal"],
  }),

  SpectralAnalysis: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "frequency object",
    accepts: ["frequency object"],
    operations: ["Dominant frequency", "Heatmap"],
    outputs: ["Table", "Heatmap", "Regime"],
  }),

  NoiseFiltering: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  BandPassFilter: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS/frequency object",
    accepts: ["TS", "frequency object"],
    operations: ["Inverse/reconstruction", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  HighPassFilter: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Overlay"],
    outputs: ["Overlay", "Oscillator", "Signal"],
  }),

  MovingWindowConvolution: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "TS + kernel/filter",
    accepts: ["TS", "kernel"],
    operations: ["Compare", "Overlay"],
    outputs: ["Overlay", "Oscillator"],
  }),

  Deconvolution: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "TS + signal pair",
    accepts: ["TS", "signal"],
    operations: ["Table", "Overlay"],
    outputs: ["Table", "Overlay"],
  }),

  EnvelopeDetection: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  PhaseAnalysis: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Oscillator", "Threshold"],
    outputs: ["Oscillator", "Signal"],
  }),

  FrequencyDomainSmoothing: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "frequency object",
    accepts: ["frequency object"],
    operations: ["Dominant frequency", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  SignalEnergy: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS/frequency object",
    accepts: ["TS", "frequency object"],
    operations: ["Normalize", "Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  SignalPower: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS/frequency object",
    accepts: ["TS", "frequency object"],
    operations: ["Normalize", "Threshold"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  CrossSpectralDensity: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "pair TS",
    accepts: ["TS", "TS"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  Coherence: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "pair TS",
    accepts: ["TS", "TS"],
    operations: ["Heatmap", "Threshold"],
    outputs: ["Heatmap", "Signal", "Table"],
  }),

  PeakDetection: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Signal markers", "Threshold"],
    outputs: ["Signal", "Table"],
  }),

  CycleExtraction: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS/frequency object",
    accepts: ["TS", "frequency object"],
    operations: ["Overlay", "Regime", "Oscillator"],
    outputs: ["Overlay", "Regime", "Oscillator"],
  }),

  DominantFrequencyEstimator: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "frequency object",
    accepts: ["frequency object"],
    operations: ["Regime bands", "Table"],
    outputs: ["Regime", "Table"],
  }),

  // ------------------------------------------------------12th BLOCK STARTS HERE------------------------------

  AR: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Forecast", "Residual", "Table"],
    outputs: ["Overlay", "Table"],
  }),

  MA_Model: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Forecast", "Residual"],
    outputs: ["Overlay", "Table"],
  }),

  ARMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Forecast", "Residual", "Threshold"],
    outputs: ["Overlay", "Table", "Oscillator", "Signal"],
  }),

  GARCH: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Returns TS",
    accepts: ["Returns TS"],
    operations: ["Forecast variance", "VaR", "Threshold"],
    outputs: ["Overlay", "Oscillator", "Table", "Signal", "Regime"],
  }),

  SeasonalDecomposition: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Overlay", "Residual analysis"],
    outputs: ["Overlay", "Table", "Oscillator"],
  }),

  StationarityADF: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Table", "Signal"],
    outputs: ["Table", "Signal"],
  }),

  SARIMA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Forecast", "Table"],
    outputs: ["Overlay", "Table"],
  }),

  EGARCH_TGARCH: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "Returns TS",
    accepts: ["Returns TS"],
    operations: ["Forecast variance", "Threshold"],
    outputs: ["Overlay", "Table", "Signal"],
  }),

  HMM: createNode({
    stage: "transform",
    inputCount: 4,
    inputPlaceholder: "TS / matrix",
    accepts: ["TS", "matrix"],
    operations: ["Regime probability", "Regime bands"],
    outputs: ["Regime", "Table", "Signal"],
  }),

  MarkovChains: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "state / probability pack",
    accepts: ["state", "probability"],
    operations: ["Table", "Regime"],
    outputs: ["Table", "Regime"],
  }),

  StateSpaceModels: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "TS / matrix",
    accepts: ["TS", "matrix"],
    operations: ["Forecast", "State estimate"],
    outputs: ["Overlay", "Table", "Regime"],
  }),

  KalmanStateEstimation: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / matrix",
    accepts: ["TS", "matrix"],
    operations: ["Smoothed state", "Forecast", "Regime"],
    outputs: ["Overlay", "Table", "Regime"],
  }),

  Cointegration: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "multi-series TS",
    accepts: ["TS A", "TS B"],
    operations: ["Spread", "Threshold"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  JohansenTest: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  VAR: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix TS",
    accepts: ["matrix TS"],
    operations: ["Forecast", "Table", "Heatmap"],
    outputs: ["Table", "Overlay", "Heatmap"],
  }),

  GrangerCausality: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "pair / matrix TS",
    accepts: ["TS A", "TS B"],
    operations: ["Table", "Heatmap", "Threshold"],
    outputs: ["Table", "Heatmap", "Signal"],
  }),

  ChangePointDetection: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Signal markers", "Regime bands"],
    outputs: ["Signal", "Regime", "Table"],
  }),

  RegimeDetection: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS / matrix",
    accepts: ["TS", "matrix"],
    operations: ["Regime bands", "Signal"],
    outputs: ["Regime", "Signal", "Table"],
  }),

  TrendCycleDecomposition: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Overlay", "Oscillator"],
    outputs: ["Overlay", "Oscillator", "Table"],
  }),
  
  // ------------------------------------------------------13th BLOCK STARTS HERE------------------------------
  FractalDimension: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Table", "Oscillator"],
    outputs: ["Oscillator", "Table", "Signal"],
  }),

  HurstExponent: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Regime bands"],
    outputs: ["Oscillator", "Regime", "Signal"],
  }),

  ChaosTheory: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "TS / system pack",
    accepts: ["TS", "system pack"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  LyapunovExponent: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Signal"],
  }),

  MultifractalSpectrum: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  SelfSimilarityScore: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Oscillator"],
    outputs: ["Oscillator", "Signal"],
  }),

  StrangeAttractorLogic: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "TS / embedded matrix",
    accepts: ["TS", "matrix"],
    operations: ["Heatmap", "3D"],
    outputs: ["Heatmap", "3D"],
  }),

  RecurrencePlotLogic: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "TS / embedded matrix",
    accepts: ["TS", "matrix"],
    operations: ["Heatmap"],
    outputs: ["Heatmap", "Table"],
  }),

  RecurrenceQuantificationAnalysis: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "recurrence matrix",
    accepts: ["matrix"],
    operations: ["Table", "Threshold"],
    outputs: ["Table", "Signal"],
  }),

  NonlinearDynamicalStabilityScore: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Threshold", "Regime"],
    outputs: ["Oscillator", "Regime", "Signal"],
  }),

  // ------------------------------------------------------14th BLOCK STARTS HERE------------------------------

  EuclideanGeometry: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "vector/matrix",
    accepts: ["vector", "matrix"],
    operations: ["Distance", "Slope", "Table"],
    outputs: ["Table"],
  }),

  DistanceMetrics: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "vector/matrix pair",
    accepts: ["vector", "matrix"],
    operations: ["Threshold", "Heatmap"],
    outputs: ["Heatmap", "Table", "Signal"],
  }),

  CurveFitting: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "TS / x-y pair",
    accepts: ["TS", "xy"],
    operations: ["Overlay", "Residual"],
    outputs: ["Overlay", "Table"],
  }),

  ManifoldLearning: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["Heatmap", "Clustering"],
    outputs: ["Heatmap", "Table", "3D"],
  }),

  TDA: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix / embedded TS",
    accepts: ["matrix", "TS"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  CoordinateGeometry: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "vector / x-y pair",
    accepts: ["vector", "xy"],
    operations: ["Slope", "Distance", "Line"],
    outputs: ["Table", "Overlay"],
  }),

  CoordinateOperations2D3D: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "x-y / x-y-z",
    accepts: ["xy", "xyz"],
    operations: ["Table", "Surface"],
    outputs: ["Table", "3D"],
  }),

  DistanceBetweenTwoPoints: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "x-y pair",
    accepts: ["xy"],
    operations: ["Table", "Threshold"],
    outputs: ["Table", "Signal"],
  }),

  MidpointSectionFormula: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "point pair",
    accepts: ["point"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  SlopeBetweenTwoPoints: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "point pair",
    accepts: ["point"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Signal"],
  }),

  EquationOfLine: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "point/params",
    accepts: ["point", "params"],
    operations: ["Overlay", "Table"],
    outputs: ["Overlay", "Table"],
  }),

  ParallelPerpendicularDetection: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "line params",
    accepts: ["line"],
    operations: ["Signal", "Table"],
    outputs: ["Table", "Signal"],
  }),

  AngleBetweenLines: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "line params",
    accepts: ["line"],
    operations: ["Table", "Threshold"],
    outputs: ["Table", "Signal"],
  }),

  ConicSections: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "params / points",
    accepts: ["params", "point"],
    operations: ["Table", "Surface", "Overlay"],
    outputs: ["Table", "3D", "Overlay"],
  }),

  ConicSectionAnalysis: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "params / points",
    accepts: ["params", "point"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  VectorGeometry: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "vectors",
    accepts: ["vector"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  PolygonGeometry: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "polygon vertices",
    accepts: ["polygon"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  ConvexHull: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "points matrix",
    accepts: ["matrix"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  SurfaceGeometry: createNode({
    stage: "transform",
    inputCount: 1,
    inputPlaceholder: "matrix/surface",
    accepts: ["matrix"],
    operations: ["Heatmap", "3D"],
    outputs: ["Heatmap", "3D"],
  }),

  GeodesicDistance: createNode({
    stage: "transform",
    inputCount: 2,
    inputPlaceholder: "matrix / graph pair",
    accepts: ["matrix", "graph"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  // ------------------------------------------------------15th BLOCK STARTS HERE------------------------------
  IfElse: createNode({
    stage: "logic",
    inputCount: 3,
    inputPlaceholder: "condition + output A + output B",
    accepts: ["condition", "signal", "signal"],
    operations: ["Signal", "Overlay/Oscillator selected branch"],
    outputs: ["Signal", "Overlay", "Oscillator", "Table"],
  }),

  AndOrNot: createNode({
    stage: "logic",
    inputCount: 2,
    inputPlaceholder: "boolean signals",
    accepts: ["boolean"],
    operations: ["Debounce", "Persistence", "Signal markers"],
    outputs: ["Signal", "Regime", "Table"],
  }),

  GreaterThanLessThan: createNode({
    stage: "logic",
    inputCount: 2,
    inputPlaceholder: "numeric pair",
    accepts: ["number"],
    operations: ["Signal markers", "Event count"],
    outputs: ["Signal", "Table"],
  }),

  Crossovers: createNode({
    stage: "logic",
    inputCount: 2,
    inputPlaceholder: "two TS",
    accepts: ["TS"],
    operations: ["Signal markers", "Debounce"],
    outputs: ["Signal", "Table"],
  }),

  ThresholdTriggers: createNode({
    stage: "logic",
    inputCount: 2,
    inputPlaceholder: "signal + level",
    accepts: ["signal", "number"],
    operations: ["Signal markers", "Persistence", "State machine"],
    outputs: ["Signal", "Regime", "Table"],
  }),

  XorNandNor: createNode({
    stage: "logic",
    inputCount: 2,
    inputPlaceholder: "boolean pair",
    accepts: ["boolean"],
    operations: ["Signal"],
    outputs: ["Signal", "Table"],
  }),

  SwitchCaseLogic: createNode({
    stage: "logic",
    inputCount: 4,
    inputPlaceholder: "category/condition set",
    accepts: ["category", "condition"],
    operations: ["Table", "Regime"],
    outputs: ["Table", "Regime"],
  }),

  WindowConditionLogic: createNode({
    stage: "logic",
    inputCount: 2,
    inputPlaceholder: "TS / boolean TS",
    accepts: ["TS", "boolean"],
    operations: ["Threshold", "Signal"],
    outputs: ["Signal", "Table"],
  }),

  LagOperator: createNode({
    stage: "logic",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare", "Crossovers"],
    outputs: ["Overlay", "Oscillator", "Signal"],
  }),

  LeadOperator: createNode({
    stage: "logic",
    inputCount: 1,
    inputPlaceholder: "TS",
    accepts: ["TS"],
    operations: ["Compare"],
    outputs: ["Table"],
  }),

  SequenceDetector: createNode({
    stage: "logic",
    inputCount: 1,
    inputPlaceholder: "boolean/event TS",
    accepts: ["TS", "event"],
    operations: ["Signal markers", "Event count"],
    outputs: ["Signal", "Table"],
  }),

  StateMachineLogic: createNode({
    stage: "logic",
    inputCount: 2,
    inputPlaceholder: "boolean/state input",
    accepts: ["boolean", "state"],
    operations: ["Regime bands", "Event count"],
    outputs: ["Regime", "Table", "Signal"],
  }),

  TriggerPersistenceLogic: createNode({
    stage: "logic",
    inputCount: 1,
    inputPlaceholder: "boolean TS",
    accepts: ["boolean"],
    operations: ["Signal markers", "Regime"],
    outputs: ["Signal", "Regime", "Table"],
  }),

  DebounceLogic: createNode({
    stage: "logic",
    inputCount: 1,
    inputPlaceholder: "boolean TS",
    accepts: ["boolean"],
    operations: ["Signal markers"],
    outputs: ["Signal", "Table"],
  }),

  EventCountingLogic: createNode({
    stage: "logic",
    inputCount: 1,
    inputPlaceholder: "boolean TS",
    accepts: ["boolean"],
    operations: ["Table", "Small panel"],
    outputs: ["Table"],
  }),

  // ------------------------------------------------------16th BLOCK STARTS HERE------------------------------

  RegressionModels: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix + target/training context",
    accepts: ["matrix", "target", "context"],
    operations: ["Forecast", "Confidence", "Overlay"],
    outputs: ["Overlay", "Table"],
  }),

  ClassificationModels: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix + labels",
    accepts: ["matrix", "labels"],
    operations: ["Probability", "Threshold", "Signal markers"],
    outputs: ["Signal", "Table", "Heatmap"],
  }),

  KMeansClustering: createNode({
    stage: "ml",
    inputCount: 1,
    inputPlaceholder: "feature matrix",
    accepts: ["matrix"],
    operations: ["Heatmap", "Labels", "Regime bands"],
    outputs: ["Heatmap", "Regime", "Table"],
  }),

  ReinforcementLearningBlocks: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "state/action pack",
    accepts: ["state", "action", "context"],
    operations: ["Table", "Signal", "Policy summary"],
    outputs: ["Table", "Signal"],
  }),

  NeuralNetworkLayers: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature/sequence matrix",
    accepts: ["matrix", "sequence"],
    operations: ["Model", "Forecast", "Probability"],
    outputs: ["Overlay", "Table", "Signal"],
  }),

  DecisionTrees: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix + target",
    accepts: ["matrix", "target"],
    operations: ["Prediction", "Feature importance"],
    outputs: ["Table", "Signal", "Heatmap"],
  }),

  RandomForest: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix + target",
    accepts: ["matrix", "target"],
    operations: ["Prediction", "Feature importance"],
    outputs: ["Table", "Signal", "Heatmap"],
  }),

  GradientBoostingXGBoost: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix + target",
    accepts: ["matrix", "target"],
    operations: ["Prediction", "Probability", "Importance"],
    outputs: ["Table", "Signal", "Heatmap"],
  }),

  SVM: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix + target",
    accepts: ["matrix", "target"],
    operations: ["Prediction", "Margin score"],
    outputs: ["Table", "Signal"],
  }),

  NaiveBayes: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix + target",
    accepts: ["matrix", "target"],
    operations: ["Probability", "Threshold"],
    outputs: ["Signal", "Table"],
  }),

  KNN: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix + target",
    accepts: ["matrix", "target"],
    operations: ["Prediction", "Distance info"],
    outputs: ["Table", "Signal"],
  }),

  PCAReducer: createNode({
    stage: "ml",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["PCA / transformed features"],
    outputs: ["Oscillator", "Heatmap", "Table"],
  }),

  Autoencoder: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "matrix / sequence",
    accepts: ["matrix", "sequence"],
    operations: ["Anomaly score", "Heatmap"],
    outputs: ["Heatmap", "Table", "Signal"],
  }),

  LSTMBlock: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "sequence data + training context",
    accepts: ["sequence", "context"],
    operations: ["Forecast", "Threshold"],
    outputs: ["Overlay", "Signal", "Table"],
  }),

  TransformerBlock: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "sequence data + training context",
    accepts: ["sequence", "context"],
    operations: ["Forecast", "Probability"],
    outputs: ["Overlay", "Signal", "Table"],
  }),

  FeatureImportanceBlock: createNode({
    stage: "ml",
    inputCount: 1,
    inputPlaceholder: "fitted ML model",
    accepts: ["model"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  AnomalyDetection: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "feature matrix",
    accepts: ["matrix"],
    operations: ["Threshold", "Signal", "Heatmap"],
    outputs: ["Signal", "Heatmap", "Table"],
  }),

  EnsembleVoting: createNode({
    stage: "ml",
    inputCount: 3,
    inputPlaceholder: "multiple model outputs",
    accepts: ["model_output"],
    operations: ["Threshold", "Signal"],
    outputs: ["Signal", "Table"],
  }),

  Stacking: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "model outputs/features",
    accepts: ["model_output", "features"],
    operations: ["Prediction", "Probability"],
    outputs: ["Table", "Signal"],
  }),

  OnlineLearning: createNode({
    stage: "ml",
    inputCount: 4,
    inputPlaceholder: "stream features",
    accepts: ["stream"],
    operations: ["Prediction", "Threshold"],
    outputs: ["Signal", "Table"],
  }),

  ModelConfidenceScore: createNode({
    stage: "ml",
    inputCount: 1,
    inputPlaceholder: "model output",
    accepts: ["model_output"],
    operations: ["Threshold", "Table"],
    outputs: ["Table", "Signal"],
  }),

  HyperparameterTuning: createNode({
    stage: "ml",
    inputCount: 3,
    inputPlaceholder: "model + search space",
    accepts: ["model", "space"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  // ------------------------------------------------------17th BLOCK STARTS HERE------------------------------

  OptionPayoffBuilder: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "spot grid + strike + option type",
    accepts: ["grid", "number", "option_type"],
    operations: ["Table", "Line chart", "Heatmap", "3D"],
    outputs: ["Line chart", "Heatmap", "3D", "Table"],
  }),

  Greeks: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack",
    accepts: ["pricing_pack"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  BinomialModel: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack",
    accepts: ["pricing_pack"],
    operations: ["Table", "Tree/price output"],
    outputs: ["Table"],
  }),

  MonteCarloSimulation: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing/simulation pack",
    accepts: ["simulation_pack"],
    operations: ["Probability cone", "Table", "Surface"],
    outputs: ["Probability cone", "Table", "Heatmap", "3D"],
  }),

  JumpDiffusion: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack",
    accepts: ["pricing_pack"],
    operations: ["Table", "Surface"],
    outputs: ["Table", "Heatmap", "3D"],
  }),

  VolatilitySurface: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing grid",
    accepts: ["grid"],
    operations: ["Heatmap", "3D", "Contour"],
    outputs: ["Heatmap", "3D", "Contour"],
  }),

  CRRTree: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack",
    accepts: ["pricing_pack"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  TrinomialTree: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack",
    accepts: ["pricing_pack"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  BlackScholesModel: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "spot + strike + time + rate + vol + option type",
    accepts: ["pricing_pack"],
    operations: ["Greeks", "Table", "Surface compare"],
    outputs: ["Table", "Heatmap", "3D"],
  }),

  LocalVolatilityModel: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing surface pack",
    accepts: ["surface_pack"],
    operations: ["Surface", "Table"],
    outputs: ["Heatmap", "3D", "Table"],
  }),

  StochasticVolatilityModel: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack",
    accepts: ["pricing_pack"],
    operations: ["Surface", "Table"],
    outputs: ["Heatmap", "3D", "Table"],
  }),

  HestonStyleLogic: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack",
    accepts: ["pricing_pack"],
    operations: ["Surface", "Table"],
    outputs: ["Heatmap", "3D", "Table"],
  }),

  BarrierAsianLookbackPayoff: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack/grid",
    accepts: ["grid", "pricing_pack"],
    operations: ["Table", "Line", "Heatmap", "3D"],
    outputs: ["Line chart", "Heatmap", "3D", "Table"],
  }),

  RiskNeutralProbability: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "pricing pack",
    accepts: ["pricing_pack"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  DiscountedCashFlow: createNode({
    stage: "derivatives",
    inputCount: 4,
    inputPlaceholder: "cashflow pack",
    accepts: ["cashflow_pack"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  PresentValueFutureValue: createNode({
    stage: "derivatives",
    inputCount: 3,
    inputPlaceholder: "cashflow/rate/time pack",
    accepts: ["cashflow_pack"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  ExpectedShortfall: createNode({
    stage: "risk",
    inputCount: 2,
    inputPlaceholder: "returns + distribution/risk level",
    accepts: ["returns", "distribution"],
    operations: ["Table", "Threshold"],
    outputs: ["Table", "Signal"],
  }),

  ValueAtRisk: createNode({
    stage: "risk",
    inputCount: 2,
    inputPlaceholder: "returns + confidence/distribution",
    accepts: ["returns", "distribution"],
    operations: ["Table", "Threshold", "Heatmap"],
    outputs: ["Table", "Heatmap", "Signal"],
  }),

  KellyCriterion: createNode({
    stage: "risk",
    inputCount: 3,
    inputPlaceholder: "edge/probability inputs",
    accepts: ["probability", "edge"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  PortfolioVariance: createNode({
    stage: "risk",
    inputCount: 2,
    inputPlaceholder: "weights + covariance",
    accepts: ["weights", "covariance"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  BetaAlpha: createNode({
    stage: "risk",
    inputCount: 2,
    inputPlaceholder: "returns pair/matrix",
    accepts: ["returns"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  CAPM: createNode({
    stage: "risk",
    inputCount: 4,
    inputPlaceholder: "returns/risk inputs",
    accepts: ["returns", "risk"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  EfficientFrontier: createNode({
    stage: "risk",
    inputCount: 4,
    inputPlaceholder: "returns + covariance + weights constraints",
    accepts: ["returns", "covariance", "constraints"],
    operations: ["Heatmap", "3D", "Table"],
    outputs: ["Heatmap", "3D", "Table"],
  }),

  PositionSizingEngine: createNode({
    stage: "risk",
    inputCount: 3,
    inputPlaceholder: "risk + volatility + sizing params",
    accepts: ["risk", "volatility", "params"],
    operations: ["Table", "Risk flag"],
    outputs: ["Table", "Signal"],
  }),
  // ------------------------------------------------------18th BLOCK STARTS HERE------------------------------

  OverlayOnPriceChart: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "EMA, Mean, Bands, ATR line, Forecast, Denoised price",
    accepts: ["TS", "indicator", "forecast"],
    operations: ["terminal only"],
    outputs: ["Overlay"],
  }),

  OscillatorPanel: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder:
      "RSI, MACD, Z-score, ROC, Vol rank, normalized AUC, Hurst",
    accepts: ["TS"],
    operations: ["terminal only"],
    outputs: ["Oscillator"],
  }),

  Heatmaps: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder:
      "correlation matrix, clustering, wavelet scales, payoff surface",
    accepts: ["matrix"],
    operations: ["terminal only"],
    outputs: ["Heatmap"],
  }),

  Surface3D: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "vol surface, payoff surface, PDE output, frontier",
    accepts: ["matrix", "surface"],
    operations: ["terminal only"],
    outputs: ["3D"],
  }),

  ProbabilityCones: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "Monte Carlo / probabilistic forecast",
    accepts: ["simulation", "forecast"],
    operations: ["terminal only"],
    outputs: ["Probability cone"],
  }),

  SignalMarkers: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "threshold output, crossover output, debounced boolean",
    accepts: ["signal"],
    operations: ["terminal only"],
    outputs: ["Signal"],
  }),

  Histogram: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "samples/vector",
    accepts: ["vector"],
    operations: ["terminal only"],
    outputs: ["Histogram"],
  }),

  ScatterPlot: createNode({
    stage: "visualization",
    inputCount: 2,
    inputPlaceholder: "pair vector/TS",
    accepts: ["vector", "TS"],
    operations: ["terminal only"],
    outputs: ["Scatter"],
  }),

  CorrelationMatrixView: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "matrix",
    accepts: ["matrix"],
    operations: ["terminal only"],
    outputs: ["Heatmap/Table hybrid"],
  }),

  DistributionCurve: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "distribution",
    accepts: ["distribution"],
    operations: ["terminal only"],
    outputs: ["Distribution curve"],
  }),

  MultiAxisChart: createNode({
    stage: "visualization",
    inputCount: 3,
    inputPlaceholder: "multiple TS",
    accepts: ["TS"],
    operations: ["terminal only"],
    outputs: ["Multi-axis chart"],
  }),

  ContourPlot: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "surface matrix",
    accepts: ["matrix", "surface"],
    operations: ["terminal only"],
    outputs: ["Contour"],
  }),

  VectorFieldView: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "vector/surface data",
    accepts: ["vector", "surface"],
    operations: ["terminal only"],
    outputs: ["Vector field"],
  }),

  SurfaceMesh: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "surface matrix",
    accepts: ["matrix", "surface"],
    operations: ["terminal only"],
    outputs: ["Surface mesh"],
  }),

  RegimeColorBands: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "boolean/state/regime labels",
    accepts: ["regime", "state"],
    operations: ["terminal only"],
    outputs: ["Regime"],
  }),

  VolatilityClouds: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "volatility TS/bands",
    accepts: ["TS", "bands"],
    operations: ["terminal only"],
    outputs: ["Overlay zone"],
  }),

  SignalStrengthGradient: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "score TS",
    accepts: ["TS"],
    operations: ["terminal only"],
    outputs: ["Overlay/sub-panel gradient"],
  }),

  RiskRewardZonePlotting: createNode({
    stage: "visualization",
    inputCount: 1,
    inputPlaceholder: "trade/risk params",
    accepts: ["risk", "trade"],
    operations: ["terminal only"],
    outputs: ["Overlay", "Table"],
  }),

  // ------------------------------------------------------19th BLOCK STARTS HERE------------------------------

  NumericalMethods: createNode({
    stage: "advanced_math",
    inputCount: 2,
    inputPlaceholder: "numeric pack",
    accepts: ["numeric"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  OptimizationTheory: createNode({
    stage: "advanced_math",
    inputCount: 3,
    inputPlaceholder: "objective + constraints",
    accepts: ["objective", "constraints"],
    operations: ["Table", "Surface"],
    outputs: ["Table", "3D"],
  }),

  InformationTheory: createNode({
    stage: "advanced_math",
    inputCount: 1,
    inputPlaceholder: "distribution / samples",
    accepts: ["distribution", "samples"],
    operations: ["Table", "Threshold"],
    outputs: ["Table", "Signal"],
  }),

  FuzzyLogic: createNode({
    stage: "advanced_math",
    inputCount: 3,
    inputPlaceholder: "fuzzy inputs",
    accepts: ["fuzzy"],
    operations: ["Signal", "Table"],
    outputs: ["Signal", "Table"],
  }),

  GameTheory: createNode({
    stage: "advanced_math",
    inputCount: 2,
    inputPlaceholder: "payoff/game pack",
    accepts: ["game", "payoff"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  ControlSystems: createNode({
    stage: "advanced_math",
    inputCount: 2,
    inputPlaceholder: "state-space pack",
    accepts: ["state_space"],
    operations: ["Overlay after projection", "Table"],
    outputs: ["Overlay", "Table", "Regime"],
  }),

  GraphTheory: createNode({
    stage: "advanced_math",
    inputCount: 1,
    inputPlaceholder: "graph data",
    accepts: ["graph"],
    operations: ["Heatmap", "Table"],
    outputs: ["Heatmap", "Table"],
  }),

  Combinatorics: createNode({
    stage: "advanced_math",
    inputCount: 1,
    inputPlaceholder: "integer/sample pack",
    accepts: ["integer", "sample"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  MeasureTheoryProbabilityEngine: createNode({
    stage: "advanced_math",
    inputCount: 2,
    inputPlaceholder: "advanced probability pack",
    accepts: ["probability_pack"],
    operations: ["Table"],
    outputs: ["Table"],
  }),

  FunctionalAnalysisTransforms: createNode({
    stage: "advanced_math",
    inputCount: 2,
    inputPlaceholder: "function/signal pack",
    accepts: ["function", "signal"],
    operations: ["Table", "Surface"],
    outputs: ["Table", "3D"],
  }),

  FractionalCalculus: createNode({
    stage: "advanced_math",
    inputCount: 1,
    inputPlaceholder: "TS / function pack",
    accepts: ["TS", "function"],
    operations: ["Oscillator after projection", "Table"],
    outputs: ["Oscillator", "Table"],
  }),

  TensorCalculus: createNode({
    stage: "advanced_math",
    inputCount: 2,
    inputPlaceholder: "tensor pack",
    accepts: ["tensor"],
    operations: ["Table", "Heatmap"],
    outputs: ["Table", "Heatmap"],
  }),

  StochasticCalculusItoLevy: createNode({
    stage: "advanced_math",
    inputCount: 2,
    inputPlaceholder: "process pack",
    accepts: ["process"],
    operations: ["Table", "Surface", "Probability cone"],
    outputs: ["Table", "3D", "Probability cone"],
  }),
};
