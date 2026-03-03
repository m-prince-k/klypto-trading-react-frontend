import React, { useEffect, useState } from "react";
import { Modal, Button, Tabs, Tab } from "react-bootstrap";
import IndicatorStyle from "./indicatorModals/IndicatorStyle";

export default function IndicatorPropertyDialog({
  indicatorProperty,
  setIndicatorProperty,
  activeBarIndicator,
}) {
  /* =========================
     PER-INDICATOR CONFIG STATE
  ========================== */

  const [indicatorConfigs, setIndicatorConfigs] = useState({
    SMA: {
      length: 9,
      source: "Close",
      offset: 0,
      smoothing: {
        type: "SMA + Bollinger Bands",
        length: 14,
        bbStdDev: 2,
      },
    },

    EMA: {
      length: 9,
      source: "Close",
      offset: 0,
    },

    WMA: {
      length: 9,
      source: "Close",
      offset: 0,
    },

    HMA: {
      length: 9,
      source: "Close",
    },

    DEMA: {
      length: 9,
      source: "Close",
    },

    TEMA: {
      length: 9,
    },

    KAMA: {
      ERlength: 10,
      fastLength: 2,
      slowLength: 30,
      source: "Close",
    },

    "Ichimoku Cloud": {
      conversionLength: 9,
      baseLength: 26,
      spanBLength: 52,
      laggingSpan: 26,
    },
    "Parabolic SAR": {
      start: 0.02,
      increment: 0.02,
      maxValue: 0.02,
    },
    SuperTrend: {
      atrLength: 10,
      factor: 3,
    },

    Aroon: {
      length: 14,
    },
    "Aroon Oscillator": {
      length: 14,
    },
    ADX: {
      smoothing: 14,
      diLength: 14,
    },

    "Chande Kroll Stop": {
      atrLength: 10, // default p
      atrCoefficient: 1, // default x
      stopLength: 9, // default q
    },

    RSI: {
      length: 14,
      source: "Close",
      smoothing: {
        type: "SMA",
        length: 14,
        bbStdDev: 2,
      },
    },

    Stochastic: {
      kLength: 14, // %K Length
      kSmoothing: 1, // %K Smoothing
      dSmoothing: 3, // %D Smoothing
    },

    "Stochastic RSI": {
      rsiLength: 14, // RSI period
      rsiSource: "Close", // RSI source (dropdown)
      stochasticLength: 14, // %K length of Stochastic
      kSmoothing: 3, // %K smoothing
      dSmoothing: 3, // %D smoothing
    },

    MACD: {
      source: "Close",
      fastLength: 12, // Fast EMA/SMA
      slowLength: 26, // Slow EMA/SMA
      signalLength: 9, // Signal line length
      oscillatorMAType: "EMA", // dropdown: "EMA" or "SMA"
      signalMAType: "EMA",
    },

    CCI: {
      length: 20,
      source: "HLC3",
      smoothing: {
        type: "SMA",
        length: 14,
        bbStdDev: 2,
      },
    },
    Momentum: {
      length: 10,
      source: "Close",
    },
    ROC: {
      length: 9,
      source: "Close",
    },
    "Williams %R": {
      length: 14,
      source: "Close",
    },
    "Ultimate Oscillator": {
      fastLength: 7, // Fast period
      middleLength: 14, // Middle period
      slowLength: 28, // Slow period
    },
    "Chande Momentum Oscillator": {
      length: 9,
      source: "Close",
    },
    TRIX: {
      length: 18,
    },
    "Fisher Transform": {
      length: 9,
    },
    "ATR":{
      length: 14, 
      smoothing: "RMA",
    }
  });

  const [indicatorStyle, setIndicatorStyle] = useState({
    visible: true,
    color: "#2962ff",
    width: 2,
  });

  /* =========================
     CURRENT CONFIG
  ========================== */

  const currentConfig = indicatorConfigs[activeBarIndicator] || {};

  /* =========================
     UPDATE PROPERTY
  ========================== */

  const updateProperty = (key, value) => {
    setIndicatorConfigs((prev) => ({
      ...prev,
      [activeBarIndicator]: {
        ...prev[activeBarIndicator],
        [key]: value,
      },
    }));
  };

  const updateSmoothing = (key, value) => {
    setIndicatorConfigs((prev) => ({
      ...prev,
      [activeBarIndicator]: {
        ...prev[activeBarIndicator],
        smoothing: {
          ...prev[activeBarIndicator].smoothing,
          [key]: value,
        },
      },
    }));
  };

  /* =========================
     OK BUTTON
  ========================== */

  const handleIndicatorPropertyChange = () => {
    const indicatorName = activeBarIndicator;
    const fullConfig = indicatorConfigs[indicatorName];

    if (!fullConfig) return;

    // Separate smoothing if exists
    const { smoothing, ...properties } = fullConfig;

    const payload = {
      indicatorName,
      properties,
    };

    // Only attach smoothing if it exists
    if (smoothing) {
      payload.smoothing = smoothing;
    }

    console.log(payload);

    setIndicatorProperty(false);
  };

  /* =========================
     BASE SETTINGS COMPONENT
  ========================== */

  function BaseSettings({
    showLength = true,
    showSource = true,
    showOffset = true,
  }) {
    return (
      <section>
        {showLength && currentConfig?.length !== undefined && (
          <div className="mb-3">
            <label className="form-label">Length</label>
            <input
              type="number"
              className="form-control"
              value={currentConfig.length}
              onChange={(e) => updateProperty("length", Number(e.target.value))}
            />
          </div>
        )}

        {showSource && currentConfig?.source !== undefined && (
          <div className="mb-3">
            <label className="form-label">Source</label>
            <select
              className="form-select"
              value={currentConfig.source}
              onChange={(e) => updateProperty("source", e.target.value)}
            >
              {["Close", "Open", "High", "Low", "HL2", "HLC3", "OHLC4"].map(
                (opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ),
              )}
            </select>
          </div>
        )}

        {showOffset && currentConfig?.offset !== undefined && (
          <div className="mb-3">
            <label className="form-label">Offset</label>
            <input
              type="number"
              className="form-control"
              value={currentConfig.offset}
              onChange={(e) => updateProperty("offset", Number(e.target.value))}
            />
          </div>
        )}
      </section>
    );
  }

  function SmoothingSection() {
    if (!currentConfig?.smoothing) return null;

    return (
      <>
        <hr />
        <section>
          <div className="mb-3">
            <label className="form-label">Smoothing Type</label>
            <select
              className="form-select"
              value={currentConfig.smoothing.type}
              onChange={(e) => updateSmoothing("type", e.target.value)}
            >
              {[
                "SMA",
                "EMA",
                "WMA",
                "SMA + Bollinger Bands",
                "VWMA",
                "SMMA (RMA)",
              ].map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Length</label>
            <input
              type="number"
              className="form-control"
              value={currentConfig.smoothing.length}
              onChange={(e) =>
                updateSmoothing("length", Number(e.target.value))
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">BB Std Dev</label>
            <input
              type="number"
              className="form-control"
              value={currentConfig.smoothing.bbStdDev}
              disabled={
                currentConfig.smoothing.type !== "SMA + Bollinger Bands"
              }
              onChange={(e) =>
                updateSmoothing("bbStdDev", Number(e.target.value))
              }
            />
          </div>
        </section>
      </>
    );
  }

  /* =========================
     RENDER PER INDICATOR
  ========================== */

  function renderIndicatorSetting() {
    switch (activeBarIndicator) {
      case "SMA":
      case "EMA":
        return (
          <>
            <BaseSettings />
            <SmoothingSection />
          </>
        );
      case "WMA":
        return <BaseSettings />;

      case "HMA":
      case "DEMA":
        return <BaseSettings showOffset={false} />;

      case "TEMA":
      case "TRIX":
      case "Fisher Transform":
        return <BaseSettings showOffset={false} showSource={false} />;

      case "KAMA":
        return (
          <>
            <BaseSettings showOffset={false} showLength={false} />

            <div className="mb-3">
              <label className="form-label">ER Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.ERlength}
                onChange={(e) =>
                  updateProperty("ERlength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Fast Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.fastLength}
                onChange={(e) =>
                  updateProperty("fastLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Slow Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.slowLength}
                onChange={(e) =>
                  updateProperty("slowLength", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "Ichimoku Cloud":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Conversion Line</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.conversionLength}
                onChange={(e) =>
                  updateProperty("conversionLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Base Line</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.baseLength}
                onChange={(e) =>
                  updateProperty("baseLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Span B Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.spanBLength}
                onChange={(e) =>
                  updateProperty("spanBLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Lagging Span</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.laggingSpan}
                onChange={(e) =>
                  updateProperty("laggingSpan", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "Parabolic SAR":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Start</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.start}
                onChange={(e) =>
                  updateProperty("start", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Increment</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.increment}
                onChange={(e) =>
                  updateProperty("increment", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Max Value</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.maxValue}
                onChange={(e) =>
                  updateProperty("maxValue", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "SuperTrend":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">ATR Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.atrLength}
                onChange={(e) =>
                  updateProperty("atrLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Factor</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.factor}
                onChange={(e) =>
                  updateProperty("factor", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "Aroon":
        return <BaseSettings showOffset={false} showSource={false} />;

      case "Aroon Oscillator":
        return <BaseSettings showOffset={false} showSource={false} />;

      case "ADX":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Smoothing</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.smoothing}
                onChange={(e) =>
                  updateProperty("smoothing", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">DI Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.diLength}
                onChange={(e) =>
                  updateProperty("diLength", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "Chande Kroll Stop":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">ATR Length (p)</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.atrLength}
                onChange={(e) =>
                  updateProperty("atrLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">ATR Coefficient (x)</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.atrCoefficient}
                onChange={(e) =>
                  updateProperty("atrCoefficient", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Stop Length (q)</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.stopLength}
                onChange={(e) =>
                  updateProperty("stopLength", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "RSI":
        return (
          <>
            <BaseSettings showOffset={false} />
            <SmoothingSection />
          </>
        );

      case "Stochastic":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">%K Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.kLength}
                onChange={(e) =>
                  updateProperty("kLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">%K Smoothing</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.kSmoothing}
                onChange={(e) =>
                  updateProperty("kSmoothing", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">%D Smoothing</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.dSmoothing}
                onChange={(e) =>
                  updateProperty("dSmoothing", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "Stochastic RSI":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">K</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.kSmoothing}
                onChange={(e) =>
                  updateProperty("kSmoothing", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">D</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.dSmoothing}
                onChange={(e) =>
                  updateProperty("dSmoothing", Number(e.target.value))
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Stochastic Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.stochasticLength}
                onChange={(e) =>
                  updateProperty("stochasticLength", Number(e.target.value))
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">RSI Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.rsiLength}
                onChange={(e) =>
                  updateProperty("rsiLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">RSI Source</label>
              <select
                className="form-control"
                value={currentConfig.rsiSource}
                onChange={(e) => updateProperty("rsiSource", e.target.value)}
              >
                <option value="Close">Close</option>
                <option value="Open">Open</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </>
        );

      case "MACD":
        return (
          <>
            <BaseSettings showLength={false} showOffset={false} />
            <div className="mb-3">
              <label className="form-label">Fast Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.fastLength}
                onChange={(e) =>
                  updateProperty("fastLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Slow Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.slowLength}
                onChange={(e) =>
                  updateProperty("slowLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Signal Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.signalLength}
                onChange={(e) =>
                  updateProperty("signalLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Oscillator MA Type</label>
              <select
                className="form-control"
                value={currentConfig.oscillatorMAType}
                onChange={(e) =>
                  updateProperty("oscillatorMAType", e.target.value)
                }
              >
                <option value="EMA">EMA</option>
                <option value="SMA">SMA</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Signal MA Type</label>
              <select
                className="form-control"
                value={currentConfig.signalMAType}
                onChange={(e) => updateProperty("signalMAType", e.target.value)}
              >
                <option value="EMA">EMA</option>
                <option value="SMA">SMA</option>
              </select>
            </div>
          </>
        );

      case "CCI": {
        return (
          <>
            <BaseSettings showOffset={false} />
            <SmoothingSection />
          </>
        );
      }
      case "Momentum": {
        return <BaseSettings showOffset={false} />;
      }
      case "ROC": {
        return <BaseSettings showOffset={false} />;
      }
      case "Williams %R": {
        return <BaseSettings showOffset={false} />;
      }
      case "Ultimate Oscillator":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Fast Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.fastLength}
                onChange={(e) =>
                  updateProperty("fastLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Middle Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.middleLength}
                onChange={(e) =>
                  updateProperty("middleLength", Number(e.target.value))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Slow Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.slowLength}
                onChange={(e) =>
                  updateProperty("slowLength", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "Chande Momentum Oscillator": {
        return <BaseSettings showOffset={false} />;
      }

      case "ATR":
        return (
          <>
            <BaseSettings showOffset={false} showSource={false} />

            <div className="mb-3">
              <label className="form-label">Smoothing</label>
              <select
                className="form-control"
                value={currentConfig.smoothing}
                onChange={(e) => updateProperty("smoothing", e.target.value)}
              >
                <option value="RMA">RMA</option>
                <option value="SMA">SMA</option>
                <option value="EMA">EMA</option>
                <option value="WMA">WMA</option>
              </select>
            </div>
          </>
        );

      default:
        return <p className="text-muted text-center">No settings available</p>;
    }
  }

  /* =========================
     RETURN
  ========================== */

  return (
    <Modal
      show={indicatorProperty}
      onHide={() => setIndicatorProperty(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{activeBarIndicator}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs defaultActiveKey="inputs">
          <Tab eventKey="inputs" title="Inputs">
            {renderIndicatorSetting()}
          </Tab>

          <Tab eventKey="style" title="Style">
            <IndicatorStyle
              style={indicatorStyle}
              setStyle={setIndicatorStyle}
              activeBarIndicator={activeBarIndicator}
            />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={() => setIndicatorProperty(false)}>
          Cancel
        </Button>

        <Button variant="dark" onClick={handleIndicatorPropertyChange}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
