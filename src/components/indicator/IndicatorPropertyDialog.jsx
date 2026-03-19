import { Modal, Button, Tabs, Tab, Row, Col, Form } from "react-bootstrap";
import IndicatorStyle from "./IndicatorStyle";
import apiService from "../../services/apiServices";
import useChartFunctions from "../../util/useChartFunctions";
import { updateIndicatorFromInput } from "./IndicatorIndex";
import { useState } from "react";

export default function IndicatorPropertyDialog({
  setIndicatorProperty,
  indicatorProperty,
  activeBarIndicator,
  setIndicatorConfigs,
  indicatorConfigs,
  indicatorStyle,
  setIndicatorStyle,
  indicatorSeriesRef,
  selectedCurrency,
  timeframeValue,
  chartRef,
  addSeries,
  latestIndicatorValuesRef,
}) {
  const labelStyle = {
    display: "inline-block",
    width: "150px",
    textAlign: "left",
    marginRight: "1rem",
  };

  const normalizedType = activeBarIndicator.replace(/[\s/%]+/g, "");
  const currentConfig = indicatorConfigs[normalizedType];
  const [indicatorLoading, setIndicatorLoading] = useState(false);

  const updateProperty = (key, value) => {
    setIndicatorConfigs((prev) => ({
      ...prev,
      [normalizedType]: {
        ...prev[normalizedType],
        [key]: value,
      },
    }));
  };

  const updateNestedProperty = (parentKey, childKey, value) => {
    setIndicatorConfigs((prev) => ({
      ...prev,
      [activeBarIndicator]: {
        ...prev[activeBarIndicator],
        [parentKey]: {
          ...prev[activeBarIndicator][parentKey],
          [childKey]: value,
        },
      },
    }));
  };

  const updateNestedDoubleProperty = (parentKey, childKey, fieldKey, value) => {
    setIndicatorConfigs((prev) => ({
      ...prev,
      [activeBarIndicator]: {
        ...prev[activeBarIndicator],
        [parentKey]: {
          ...prev[activeBarIndicator][parentKey],
          [childKey]: {
            ...prev[activeBarIndicator][parentKey][childKey],
            [fieldKey]: value,
          },
        },
      },
    }));
  };

  const updateSmoothing = (key, value) => {
    setIndicatorConfigs((prev) => {
      const currentIndicatorConfig = prev?.[normalizedType] || {};

      return {
        ...prev,
        [normalizedType]: {
          ...currentIndicatorConfig,
          [key]: value,
        },
      };
    });
  };
  /* =========================
     OK BUTTON
  ========================== */
  const handleIndicatorPropertyChange = async () => {
    const config = indicatorConfigs?.[normalizedType] || {};
    const { maType } = config;

    const payload = {
      type: normalizedType,
      ...config,
    };

    console.log(payload, "payloadddddddddd");
    setIndicatorLoading(true);
    try {
      setIndicatorLoading(true); // START LOADER

      const response = await apiService.post(
        `/api/updateIndicator?symbol=${selectedCurrency}&interval=${timeframeValue}`,
        payload,
      );

      console.log("Indicator updated:", response);

      updateIndicatorFromInput(
        normalizedType,
        response,
        indicatorSeriesRef,
        latestIndicatorValuesRef,
        maType,
      );

      setIndicatorProperty(false);
    } catch (error) {
      if (error.response) {
        console.error("Server responded with error:");
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      } else if (error.request) {
        console.error("No response received from server");
        console.error(error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
    } finally {
      setIndicatorLoading(false); // STOP LOADER
    }
  };

  const handleCancel = () => {
    setIndicatorConfigs((prev) => ({
      ...prev,
      [activeBarIndicator]: indicatorConfigs[activeBarIndicator],
    }));
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
      <section className="mt-3 px-3">
        {/* LENGTH */}
        {showLength && currentConfig?.length !== undefined && (
          <div className="mb-3">
            <label className="form-label">Length</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={currentConfig.length}
              onChange={(e) => {
                const value =
                  e.target.value === ""
                    ? ""
                    : Math.max(1, Number(e.target.value));
                updateProperty("length", value);
              }}
            />
          </div>
        )}

        {/* SOURCE */}
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
                  <option key={opt} value={opt.toLowerCase()}>
                    {opt}
                  </option>
                ),
              )}
            </select>
          </div>
        )}

        {/* OFFSET */}
        {showOffset && currentConfig?.offset !== undefined && (
          <div className="mb-3">
            <label className="form-label">Offset</label>
            <input
              type="number"
              className="form-control"
              min="0"
              value={currentConfig.offset}
              onChange={(e) => {
                const value =
                  e.target.value === ""
                    ? ""
                    : Math.max(0, Number(e.target.value));
                updateProperty("offset", value);
              }}
            />
          </div>
        )}
      </section>
    );
  }

  /* =========================
   SMOOTHING SECTION
========================== */
  function SmoothingSection() {
    if (!currentConfig) return null;

    const smoothingTypes = [
      "None",
      "SMA",
      "EMA",
      "WMA",
      "SMA + Bollinger Bands",
      "VWMA",
      "SMMA (RMA)",
    ];

    return (
      <>
        <hr />
        <section className="px-3">
          {/* TYPE */}
          <div className="mb-3">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={currentConfig.maType || "none"}
              onChange={(e) => updateProperty("maType", e.target.value)}
            >
              {smoothingTypes.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* LENGTH */}
          <div className="mb-3">
            <label className="form-label">Length</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={currentConfig.maLength}
              onChange={(e) => {
                const value =
                  e.target.value === ""
                    ? ""
                    : Math.max(1, Number(e.target.value));
                updateProperty("maLength", value);
              }}
            />
          </div>

          {/* BB STD DEV */}
          <div className="mb-3">
            <label className="form-label">BB Std Dev</label>
            <input
              type="number"
              className="form-control"
              min="0"
              disabled={currentConfig.maType !== "SMA + Bollinger Bands"}
              value={currentConfig.bbStdDev}
              onChange={(e) => {
                const value =
                  e.target.value === ""
                    ? ""
                    : Math.max(0, Number(e.target.value));
                updateProperty("bbStdDev", value);
              }}
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
    switch (normalizedType) {
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
                min="1"
                value={currentConfig.ERlength}
                onChange={(e) => {
                  const value =
                    e.target.value === ""
                      ? ""
                      : Math.max(1, Number(e.target.value));
                  updateProperty("ERlength", value);
                }}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  }
  /* =========================
     RENDER PER INDICATOR
  ========================== */

  function renderIndicatorSetting() {
    switch (normalizedType) {
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
                min="0"
                value={currentConfig.ERlength}
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value));
                  updateProperty("ERlength", value);
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Fast Length</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={currentConfig.fastLength}
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value));
                  updateProperty("fastLength", value);
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Slow Length</label>
              <input
                type="number"
                className="form-control"
                min=""
                value={currentConfig.slowLength}
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value));
                  updateProperty("slowLength", value);
                }}
              />
            </div>
          </>
        );

      case "ICHIMOKU":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Conversion Line</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig?.conversionLength}
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
                value={currentConfig?.baseLength}
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
                value={currentConfig?.spanBLength}
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
                value={currentConfig?.laggingSpan}
                onChange={(e) =>
                  updateProperty("laggingSpan", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "PSAR":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Start</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig?.start}
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
                value={currentConfig?.increment}
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
                value={currentConfig?.maxValue}
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

      case "AROON":
        return <BaseSettings showOffset={false} showSource={false} />;

      case "AO":
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
      case "MOM": {
        return <BaseSettings showOffset={false} />;
      }
      case "ROC": {
        return <BaseSettings showOffset={false} />;
      }
      case "WPR": {
        return <BaseSettings showOffset={false} />;
      }
      case "UltimateOscillator":
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

      case "CMO": {
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
      case "BB":
        return (
          <>
            <BaseSettings />
            <div className="mb-3">
              <label className="form-label">Basic MA Type</label>
              <select
                className="form-control"
                value={currentConfig.maType}
                onChange={(e) => updateProperty("maType", e.target.value)}
              >
                <option value="SMA">SMA</option>
                <option value="EMA">EMA</option>
                <option value="SMMA">SMMA</option>
                <option value="WMA">WMA</option>
                <option value="VWMA">VWMA</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Standard Deviation</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.stdDev}
                onChange={(e) =>
                  updateProperty("stdDev", Number(e.target.value))
                }
              />
            </div>
          </>
        );

      case "BBW":
        return (
          <>
            <BaseSettings showOffset={false} />
            <div className="mb-3">
              <label className="form-label">Standard Deviation</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig?.stdDev}
                onChange={(e) =>
                  updateProperty("stdDev", Number(e.target.value))
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Highest Expansion Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig?.highestExpansionLength}
                onChange={(e) =>
                  updateProperty(
                    "highestExpansionLength",
                    Number(e.target.value),
                  )
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Lowest Contraction Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.lowestContractionLength}
                onChange={(e) =>
                  updateProperty(
                    "lowestContractionLength",
                    Number(e.target.value),
                  )
                }
              />
            </div>
          </>
        );

      case "HV":
        return (
          <>
            <BaseSettings showOffset={false} showSource={false} />
          </>
        );

      case "KC":
        return (
          <>
            <BaseSettings showOffset={false} />
            <div className="mb-3">
              <label className="form-label">Multiplier</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.multiplier}
                onChange={(e) =>
                  updateProperty("multiplier", Number(e.target.value))
                }
              />
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="useEMA"
                checked={currentConfig.useEMA}
                onChange={(e) => updateProperty("useEMA", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="useEMA">
                Use Exponential MA
              </label>
            </div>

            <div className="mb-3">
              <label className="form-label">Bands Style</label>
              <select
                className="form-control"
                value={currentConfig.bandsStyle}
                onChange={(e) => updateProperty("bandsStyle", e.target.value)}
              >
                <option value="Average True Range">Average True Range</option>
                <option value="True Range">True Range</option>
                <option value="Range">Range</option>
              </select>
            </div>

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
          </>
        );

      case "DC":
        return (
          <>
            <BaseSettings showSource={false} />
          </>
        );
      case "CHOP":
        return (
          <>
            <BaseSettings showSource={false} />
          </>
        );
      case "STDDEV":
        return (
          <>
            <BaseSettings showOffset={false} />
          </>
        );

      case "VOL":
        return (
          <>
            <div className="mb-3">
              <label className="form-label">MA Length</label>
              <input
                type="number"
                className="form-control"
                value={currentConfig.maLength}
                onChange={(e) =>
                  updateProperty("maLength", Number(e.target.value))
                }
              />
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="colorByPrevious"
                checked={currentConfig.colorByPrevious}
                onChange={(e) =>
                  updateProperty("colorByPrevious", e.target.checked)
                }
              />
              <label className="form-check-label" htmlFor="colorByPrevious">
                Color Based on Previous Bar
              </label>
            </div>
          </>
        );



      case "OBV":
        return (
          <>
            <SmoothingSection />
          </>
        );

      case "PVO":
        return (
          <>
            {/* Fast Length */}
            <Form.Group
              as={Row}
              className="mb-3 align-items-center"
              controlId="fastLength"
            >
              <Form.Label style={labelStyle} className="mb-0">
                Fast Length
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.fastLength}
                  onChange={(e) =>
                    updateProperty("fastLength", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>

            {/* Slow Length */}
            <Form.Group
              as={Row}
              className="mb-3 align-items-center"
              controlId="slowLength"
            >
              <Form.Label style={labelStyle} className="mb-0">
                Slow Length
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.slowLength}
                  onChange={(e) =>
                    updateProperty("slowLength", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>

            {/* Signal Length */}
            <Form.Group
              as={Row}
              className="mb-3 align-items-center"
              controlId="signalLength"
            >
              <Form.Label style={labelStyle} className="mb-0">
                Signal Length
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.signalLength}
                  onChange={(e) =>
                    updateProperty("signalLength", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>

            {/* Oscillator MA Type */}
            <Form.Group
              as={Row}
              className="mb-3 align-items-center"
              controlId="oscMaType"
            >
              <Form.Label style={labelStyle} className="mb-0">
                Oscillator MA Type
              </Form.Label>
              <Col>
                <Form.Select
                  value={currentConfig.oscMaType}
                  onChange={(e) => updateProperty("oscMaType", e.target.value)}
                >
                  <option value="EMA">EMA</option>
                  <option value="SMA">SMA</option>
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Signal MA Type */}
            <Form.Group
              as={Row}
              className="mb-3 align-items-center"
              controlId="signalMaType"
            >
              <Form.Label style={labelStyle} className="mb-0">
                Signal MA Type
              </Form.Label>
              <Col>
                <Form.Select
                  value={currentConfig.signalMaType}
                  onChange={(e) =>
                    updateProperty("signalMaType", e.target.value)
                  }
                >
                  <option value="EMA">EMA</option>
                  <option value="SMA">SMA</option>
                </Form.Select>
              </Col>
            </Form.Group>
          </>
        );

      case "Chaikin Money Flow":
        return (
          <>
            <BaseSettings showOffset={false} showSource={false} />
          </>
        );

      case "MFI":
        return (
          <>
            <BaseSettings showOffset={false} showSource={false} />
          </>
        );

      case "EOM":
        return (
          <>
            <BaseSettings showOffset={false} showSource={false} />

            {/* Divisor */}
            <Form.Group
              as={Row}
              className="mb-3 align-items-center"
              controlId="eomDivisor"
            >
              <Form.Label style={labelStyle} className="mb-0">
                Divisor
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.divisor}
                  onChange={(e) =>
                    updateProperty("divisor", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>
          </>
        );

      case "Negative Volume Index":
        return (
          <>
            <Form.Group
              as={Row}
              className="mb-3 align-items-center"
              controlId="nviEmaLength"
            >
              <Form.Label style={labelStyle} className="mb-0">
                EMA Length
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.emaLength}
                  onChange={(e) =>
                    updateProperty("emaLength", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>
          </>
        );

      case "Positive Volume Index":
        return (
          <>
            <Form.Group
              as={Row}
              className="mb-3 align-items-center"
              controlId="pviEmaLength"
            >
              <Form.Label style={labelStyle} className="mb-0">
                EMA Length
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.emaLength}
                  onChange={(e) =>
                    updateProperty("emaLength", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>
          </>
        );

      case "CKS":
        return (
          <>
            {/* Base Settings */}
            <BaseSettings />

            <hr />
            <h6 className="mb-3">Chande Kroll Stop Settings</h6>

            {/* ATR Length */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                ATR Length
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.atrLength}
                  onChange={(e) =>
                    updateProperty("atrLength", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>

            {/* ATR Multiplier */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                ATR Multiplier
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={currentConfig.atrMultiplier}
                  onChange={(e) =>
                    updateProperty("atrMultiplier", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>

            {/* Stop Length */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Stop Length
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.stopLength}
                  onChange={(e) =>
                    updateProperty("stopLength", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>

            {/* Source */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Source
              </Form.Label>
              <Col>
                <Form.Select
                  value={currentConfig.source}
                  onChange={(e) =>
                    updateProperty("source", e.target.value)
                  }
                >
                  <option value="close">Close</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                  <option value="hl2">HL2</option>
                  <option value="hlc3">HLC3</option>
                  <option value="ohlc4">OHLC4</option>
                </Form.Select>
              </Col>
            </Form.Group>
          </>
        );
      case "CMF":
        return (
          <>
            {/* Base Settings */}
            <BaseSettings />

            <hr />
            <h6 className="mb-3">Chaikin Money Flow Settings</h6>

            {/* CMF Period */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                CMF Period
              </Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.period}
                  onChange={(e) =>
                    updateProperty("period", Number(e.target.value))
                  }
                />
              </Col>
            </Form.Group>

            {/* Source */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Source
              </Form.Label>
              <Col>
                <Form.Select
                  value={currentConfig.source}
                  onChange={(e) =>
                    updateProperty("source", e.target.value)
                  }
                >
                  <option value="close">Close</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                  <option value="hl2">HL2</option>
                  <option value="hlc3">HLC3</option>
                  <option value="ohlc4">OHLC4</option>
                </Form.Select>
              </Col>
            </Form.Group>
          </>
        );
      case "NVI":
        return (
          <>
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">Signal EMA Length</Form.Label>
              <Col>
                <Form.Control
                  type="number"
                  value={currentConfig.signal.length || 255} // default 255 agar undefined ho
                  onChange={(e) => updateProperty("signal.length", Number(e.target.value))}
                />
              </Col>
            </Form.Group>
          </>
        )


      case "VWAP":
        return (
          <>
            {/* Hide VWAP */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Hide on 1D or Above
              </Form.Label>
              <Col>
                <Form.Check
                  type="checkbox"
                  checked={currentConfig.hideOnDailyOrAbove}
                  onChange={(e) =>
                    updateProperty("hideOnDailyOrAbove", e.target.checked)
                  }
                />
              </Col>
            </Form.Group>

            {/* Anchor Period */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Anchor Period
              </Form.Label>
              <Col>
                <Form.Select
                  value={currentConfig.anchorPeriod}
                  onChange={(e) =>
                    updateProperty("anchorPeriod", e.target.value)
                  }
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </Form.Select>
              </Col>
            </Form.Group>

            <BaseSettings showLength={false} />

            {/* ========================= */}
            {/* Band Settings Section */}
            {/* ========================= */}

            <hr />
            <h6 className="mb-3">Band Settings</h6>

            {/* Band Calculation Mode */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Band Calculation Mode
              </Form.Label>
              <Col>
                <Form.Select
                  value={currentConfig.bandSettings.calculationMode}
                  onChange={(e) =>
                    updateNestedProperty(
                      "bandSettings",
                      "calculationMode",
                      e.target.value,
                    )
                  }
                >
                  <option>Standard Deviation</option>
                  <option>Percentage</option>
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Band Multiplier #1 */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Band Multiplier #1
              </Form.Label>
              <Col className="d-flex align-items-center gap-3">
                <Form.Check
                  type="checkbox"
                  checked={currentConfig.bandSettings.band1.enabled}
                  onChange={(e) =>
                    updateNestedDoubleProperty(
                      "bandSettings",
                      "band1",
                      "enabled",
                      e.target.checked,
                    )
                  }
                />
                <Form.Control
                  type="number"
                  style={{ maxWidth: "120px" }}
                  value={currentConfig.bandSettings.band1.multiplier}
                  onChange={(e) =>
                    updateNestedDoubleProperty(
                      "bandSettings",
                      "band1",
                      "multiplier",
                      Number(e.target.value),
                    )
                  }
                />
              </Col>
            </Form.Group>

            {/* Band Multiplier #2 */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Band Multiplier #2
              </Form.Label>
              <Col className="d-flex align-items-center gap-3">
                <Form.Check
                  type="checkbox"
                  checked={currentConfig.bandSettings.band2.enabled}
                  onChange={(e) =>
                    updateNestedDoubleProperty(
                      "bandSettings",
                      "band2",
                      "enabled",
                      e.target.checked,
                    )
                  }
                />
                <Form.Control
                  type="number"
                  style={{ maxWidth: "120px" }}
                  value={currentConfig.bandSettings.band2.multiplier}
                  onChange={(e) =>
                    updateNestedDoubleProperty(
                      "bandSettings",
                      "band2",
                      "multiplier",
                      Number(e.target.value),
                    )
                  }
                />
              </Col>
            </Form.Group>

            {/* Band Multiplier #3 */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label style={labelStyle} className="mb-0">
                Band Multiplier #3
              </Form.Label>
              <Col className="d-flex align-items-center gap-3">
                <Form.Check
                  type="checkbox"
                  checked={currentConfig.bandSettings.band3.enabled}
                  onChange={(e) =>
                    updateNestedDoubleProperty(
                      "bandSettings",
                      "band3",
                      "enabled",
                      e.target.checked,
                    )
                  }
                />
                <Form.Control
                  type="number"
                  style={{ maxWidth: "120px" }}
                  value={currentConfig.bandSettings.band3.multiplier}
                  onChange={(e) =>
                    updateNestedDoubleProperty(
                      "bandSettings",
                      "band3",
                      "multiplier",
                      Number(e.target.value),
                    )
                  }
                />
              </Col>
            </Form.Group>
          </>
        );

      case "ZigZag":
        return (
          <>
            {/* Price Deviation */}
            <div className="row mb-3 align-items-center">
              <div className="col-6">
                <label className="form-label">
                  Price Deviation for Reversal (%)
                </label>
              </div>
              <div className="col-6">
                <input
                  type="number"
                  className="form-control"
                  value={indicatorConfigs.properties.priceDeviation}
                  onChange={(e) =>
                    updateProperty("priceDeviation", Number(e.target.value))
                  }
                />
              </div>
            </div>

            {/* Pivot Legs */}
            <div className="row mb-3 align-items-center">
              <div className="col-6">
                <label className="form-label">Pivot Legs</label>
              </div>
              <div className="col-6">
                <input
                  type="number"
                  className="form-control"
                  value={indicatorConfigs.properties.pivotLegs}
                  onChange={(e) =>
                    updateProperty("pivotLegs", Number(e.target.value))
                  }
                />
              </div>
            </div>

            {/* Line Color */}
            <div className="row mb-3 align-items-center">
              <div className="col-6">
                <label className="form-label">Line Color</label>
              </div>
              <div className="col-6">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={indicatorConfigs.properties.lineColor}
                  onChange={(e) => updateProperty("lineColor", e.target.value)}
                />
              </div>
            </div>

            {/* Extend to Last Bar */}
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={indicatorConfigs.properties.extendToLastBar}
                onChange={(e) =>
                  updateProperty("extendToLastBar", e.target.checked)
                }
              />
              <label className="form-check-label">Extend to Last Bar</label>
            </div>

            {/* Display Reversal Price */}
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={indicatorConfigs.properties.displayReversalPrice}
                onChange={(e) =>
                  updateProperty("displayReversalPrice", e.target.checked)
                }
              />
              <label className="form-check-label">Display Reversal Price</label>
            </div>

            {/* Display Cumulative Volume */}
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={indicatorConfigs.properties.displayCumulativeVolume}
                onChange={(e) =>
                  updateProperty("displayCumulativeVolume", e.target.checked)
                }
              />
              <label className="form-check-label">
                Display Cumulative Volume
              </label>
            </div>

            {/* Display Reversal Price Change Mode */}
            <div className="row mb-3 align-items-center">
              <div className="col-6">
                <label className="form-label">
                  Display Reversal Price Change
                </label>
              </div>
              <div className="col-6">
                <select
                  className="form-select"
                  value={indicatorConfigs?.properties.reversalPriceChangeMode}
                  onChange={(e) =>
                    updateProperty("reversalPriceChangeMode", e.target.value)
                  }
                >
                  <option value="absolute">Absolute</option>
                  <option value="percent">Percent</option>
                </select>
              </div>
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
      contentClassName="border-0 shadow-lg"
      style={{ borderRadius: 16 }}
    >
      <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
        <Modal.Title
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.2px",
          }}
        >
          {activeBarIndicator}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-0 pt-0 pb-0">
        <Tabs
          defaultActiveKey="inputs"
          className="px-4 mb-0"
          style={{
            borderBottom: "1.5px solid #f0f0f0",
            gap: 4,
          }}
        >
          {["inputs", "style", "visibility"].map(
            (key) =>
              // We still use Tab components, styling via CSS below
              null,
          )}

          <Tab
            eventKey="inputs"
            title={
              <span style={{ fontSize: 14, fontWeight: 600, padding: "0 2px" }}>
                Inputs
              </span>
            }
          >
            <div className="px-4 py-3">{renderIndicatorSetting()}</div>
          </Tab>

          <Tab
            eventKey="style"
            title={
              <span style={{ fontSize: 14, fontWeight: 600, padding: "0 2px" }}>
                Style
              </span>
            }
          >
            <div className="px-4 py-3">
              <IndicatorStyle
                indicatorStyle={indicatorStyle}
                setIndicatorStyle={setIndicatorStyle}
                activeBarIndicator={activeBarIndicator}
                indicatorConfigs={indicatorConfigs}
              />
            </div>
          </Tab>
        </Tabs>

        {/* Inline style overrides for Bootstrap nav-tabs */}
        <style>{`
      .nav-tabs {
        border-bottom: 1.5px solid #f0f0f0 !important;
      }
      .nav-tabs .nav-link {
        border: none !important;
        border-bottom: 2.5px solid transparent !important;
        color: #9ca3af !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        padding: 10px 14px !important;
        margin-bottom: -1.5px !important;
        border-radius: 0 !important;
        background: transparent !important;
        transition: color 0.15s ease, border-color 0.15s ease !important;
      }
      .nav-tabs .nav-link:hover {
        color: #374151 !important;
        border-bottom-color: #d1d5db !important;
      }
      .nav-tabs .nav-link.active {
        color: #111827 !important;
        border-bottom: 2.5px solid #111827 !important;
        background: transparent !important;
      }
      .tab-content {
        border: none !important;
      }
    `}</style>
      </Modal.Body>

      <Modal.Footer className="border-0 px-4 pb-4 pt-2" style={{ gap: 8 }}>
        <Button
          variant="light"
          onClick={handleCancel}
          style={{
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 8,
            padding: "8px 20px",
            border: "1.5px solid #e5e7eb",
            color: "#374151",
            background: "#f9fafb",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="dark"
          onClick={handleIndicatorPropertyChange}
          style={{
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 8,
            padding: "8px 20px",
            background: "#111827",
            border: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          }}
        >
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
