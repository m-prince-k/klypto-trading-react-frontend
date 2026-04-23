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
  }), //////////////////////////////////////////////////
  // :large_blue_circle: TRANSFORM LAYER
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
};
