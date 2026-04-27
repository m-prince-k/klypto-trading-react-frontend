import React, { useState, useEffect } from "react";
// import { indicatorConfig } from "./CustomIndicatorConfig";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { BsLightningChargeFill, BsRocketTakeoffFill } from "react-icons/bs";
import Select from "react-select";
import apiService from "../../services/apiServices";

export default function ProIndicatorBuilder() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [inputs, setInputs] = useState([]);
  const [op, setOp] = useState("");
  const [output, setOutput] = useState("");
  const [payload, setPayload] = useState(null);
  const [indicatorConfig, setIndicatorConfig] = useState({});
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [errors, setErrors] = useState({});

  async function fetchIndicatorConfig() {
    setLoadingConfig(true);
    try {
      const response = await apiService.get("api/getIndicatorConfig");

      // API structure: { data: [ { config: {...} } ] }
      const config = (await response?.data?.[0]?.config) || {};

      console.log("CONFIG 👉", config);

      setIndicatorConfig(config);
    } catch (err) {
      setConfigError(err.message);
    } finally {
      setLoadingConfig(false);
    }
  }
  useEffect(() => {
    fetchIndicatorConfig();
  }, []);

  const current = indicatorConfig?.[type] || {};

  const sourceOptions = [
    { label: "Select", value: "" },
    ...Object.keys(indicatorConfig).map((k) => ({
      label: k,
      value: k,
    })),
  ];

  // 🔥 dynamic grid layout
  const gridCols = "grid-cols-1 md:grid-cols-5";

  // 🔥 sync inputs
  useEffect(() => {
    setInputs(Array(current.inputCount).fill(""));
    setErrors((prev) => ({ ...prev, inputs: [] }));
  }, [type]);

  const handleInputChange = (value, index) => {
    const updated = [...inputs];
    updated[index] = value;
    setInputs(updated);

    // clear that input's error
    const updatedErrors = [...(errors.inputs || [])];
    updatedErrors[index] = "";
    setErrors((prev) => ({ ...prev, inputs: updatedErrors }));
  };

  /* ================= VALIDATE ================= */
  const validate = () => {
    // Name
    if (!name.trim()) {
      setErrors({ name: "Name is required." });
      return false;
    }
    if (name.trim().length < 3) {
      setErrors({ name: "Name must be at least 3 characters." });
      return false;
    }
    if (name.trim().length > 100) {
      setErrors({ name: "Name cannot exceed 100 characters." });
      return false;
    }

    // Source
    if (!type) {
      setErrors({ type: "Please select a source." });
      return false;
    }

    // Inputs
    if (current.inputCount > 0) {
      for (let i = 0; i < inputs.length; i++) {
        if (!inputs[i] || inputs[i] === "") {
          setErrors({
            inputs: inputs.map((_, j) =>
              j === i ? `Input ${i + 1} is required.` : "",
            ),
          });
          return false;
        }
      }
    }

    // Operation
    if (!op) {
      setErrors({ op: "Please select an operation." });
      return false;
    }

    // Output
    if (!output) {
      setErrors({ output: "Please select an output." });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleDeploy = () => {
    if (!validate()) return;

    const finalPayload = {
      name,
      source: type,
      inputCount: current.inputCount,
      inputs,
      operation: op,
      output,
      operator: current.operator ? current.operator : "",
      timestamp: new Date().toISOString(),
    };

    setPayload(finalPayload);
  };

  const errText = (msg) =>
    msg ? (
      <p
        style={{
          color: "#f87171",
          fontSize: 11,
          marginTop: 4,
          marginBottom: 0,
        }}
      >
        {msg}
      </p>
    ) : null;

  const darkCard = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "1rem",
  };

  const darkControl = {
    background: "rgba(0,0,0,0.4)",
    border: "1px solid #374151",
    color: "#fff",
    borderRadius: 8,
  };

  return (
    <>
      <style>{`
        .white-placeholder::placeholder {
          color: #ffffff !important;
          opacity: 0.8 !important;
        }
      `}</style>
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center p-4"
        style={{
          background:
            "linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #2d2d2d 100%)",
        }}
      >
        <div className="w-100" style={{ maxWidth: 1400 }}>
          <div
            className="p-4 p-md-5 rounded-4"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <h1
              className="fw-bold mb-4 d-flex align-items-center gap-2 text-white"
              style={{ fontSize: "1.75rem" }}
            >
              <BsLightningChargeFill style={{ color: "#facc15" }} />
              Custom Indicator
            </h1>

            {/* Grid */}
            <Row className="g-3 mb-4 flex-nowrap overflow-x-auto pb-2">
              {/* Name */}
              <Col style={{ minWidth: 200 }}>
                <div style={darkCard} className="h-100">
                  <p
                    className="mb-2"
                    style={{ fontSize: 13, color: "#9ca3af" }}
                  >
                    Name
                  </p>
                  <Form.Control
                    value={name}
                    maxLength={100}
                    minLength={3}
                    placeholder="Name"
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className="white-placeholder"
                    style={{
                      ...darkControl,
                      borderColor: errors.name ? "#f87171" : "#374151",
                    }}
                  />
                  {errText(errors.name)}
                </div>
              </Col>

              {/* Source */}
              <Col style={{ minWidth: 200 }}>
                <div style={darkCard} className="h-100">
                  <p
                    className="mb-2"
                    style={{ fontSize: 13, color: "#9ca3af" }}
                  >
                    Source
                  </p>
                  <Select
                    options={sourceOptions}
                    value={type ? { label: type, value: type } : null}
                    onChange={(opt) => {
                      if (!opt.value) return; // ignore "Select"
                      setType(opt.value);
                    }}
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (b) => ({
                        ...b,
                        background: darkControl.background,
                        borderColor: errors.type ? "#f87171" : "#374151",
                        justifyContent: "flex-start",
                        textAlign: "left",
                        boxShadow: "none", // 🔥 removes blue glow
                        "&:hover": {
                          borderColor: errors.type ? "#f87171" : "#374151", // 🔥 same border on hover
                        },
                        borderRadius:8,
                      }),
                      placeholder: (b) => ({
                        ...b,
                        color: "#e5e7eb",
                      }),

                      menu: (b) => ({
                        ...b,
                        background: "#1f2937",
                        overflowX: "hidden",
                      }),

                      menuList: (b) => ({
                        ...b,
                        maxHeight: 200,
                        scrollbarWidth: "thin",
                        scrollbarColor: "#4b5563 #1f2937",
                        background: "#1f2937",
                      }),

                      option: (b, s) => ({
                        ...b,
                        background: s.isFocused ? "#374151" : "#1f2937",
                        color: "#e5e7eb",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }),

                      singleValue: (b) => ({
                        ...b,
                        color: "#e5e7eb",
                      }),

                      input: (b) => ({
                        ...b,
                        color: "#e5e7eb",
                      }),

                      menuPortal: (b) => ({
                        ...b,
                        zIndex: 999999,
                        minWidth: 200,
                        width: "21%",
                      }),
                    }}
                  />
                  {errText(errors.type)}
                </div>
              </Col>

              {current.inputCount > 0 && (
                <Col
                  style={{
                    minWidth: current.operator ? 400 : 200,
                    flex: current.operator ? 2 : 1,
                  }}
                >
                  <div style={darkCard} className="h-100">
                    <p
                      className="mb-2"
                      style={{ fontSize: 13, color: "#9ca3af" }}
                    >
                      Input
                    </p>

                    {/* CASE 1: operator exists → use SELECT + operator UI */}
                    {current.operator ? (
                      current.inputCount === 2 ? (
                        <>
                          <div className="d-flex align-items-start gap-3">
                            <div style={{ flex: 1 }}>
                              <Form.Select
                                value={inputs[0] || ""}
                                onChange={(e) =>
                                  handleInputChange(e.target.value, 0)
                                }
                                style={{
                                  ...darkControl,
                                  borderColor: errors.inputs?.[0]
                                    ? "#f87171"
                                    : "#374151",
                                }}
                              >
                                <option
                                  value=""
                                  disabled
                                  style={{ color: "#fafafaff" }}
                                >
                                  Select…
                                </option>
                                {current.accepts.map((item, i) => (
                                  <option key={i}>{item}</option>
                                ))}
                              </Form.Select>
                              {errText(errors.inputs?.[0])}
                            </div>

                            <div
                              style={{
                                color: "#facc15",
                                fontWeight: "bold",
                                fontSize: 20,
                              }}
                            >
                              {current.operator}
                            </div>

                            <div style={{ flex: 1 }}>
                              <Form.Select
                                value={inputs[1] || ""}
                                onChange={(e) =>
                                  handleInputChange(e.target.value, 1)
                                }
                                style={{
                                  ...darkControl,
                                  borderColor: errors.inputs?.[1]
                                    ? "#f87171"
                                    : "#374151",
                                }}
                              >
                                <option
                                  value=""
                                  disabled
                                  style={{ color: "#fafafaff" }}
                                >
                                  Select…
                                </option>
                                {current.accepts
                                  .filter((item) => item !== inputs[0])
                                  .map((item, i) => (
                                    <option key={i}>{item}</option>
                                  ))}
                              </Form.Select>
                              {errText(errors.inputs?.[1])}
                            </div>
                          </div>
                        </>
                      ) : (
                        inputs.map((val, i) => (
                          <div key={i}>
                            <Form.Select
                              value={val}
                              onChange={(e) =>
                                handleInputChange(e.target.value, i)
                              }
                              className="mb-1"
                              style={{
                                ...darkControl,
                                borderColor: errors.inputs?.[i]
                                  ? "#f87171"
                                  : "#374151",
                              }}
                            >
                              <option
                                value=""
                                disabled
                                style={{ color: "#fafafaff" }}
                              >
                                Select…
                              </option>
                              {current.accepts.map((item, j) => (
                                <option key={j}>{item}</option>
                              ))}
                            </Form.Select>
                            {errText(errors.inputs?.[i])}
                          </div>
                        ))
                      )
                    ) : (
                      /* CASE 2: NO operator → normal input boxes */
                      inputs.map((val, i) => (
                        <div key={i}>
                          <Form.Control
                            value={val}
                            placeholder={`${current.inputPlaceholder} ${i + 1}`}
                            onChange={(e) =>
                              handleInputChange(e.target.value, i)
                            }
                            className="mb-1 white-placeholder"
                            style={{
                              ...darkControl,
                              borderColor: errors.inputs?.[i]
                                ? "#f87171"
                                : "#374151",
                            }}
                          />
                          {errText(errors.inputs?.[i])}
                        </div>
                      ))
                    )}
                  </div>
                </Col>
              )}

              {/* Operation */}
              <Col style={{ minWidth: 200 }}>
                <div style={darkCard} className="h-100">
                  <p
                    className="mb-2"
                    style={{ fontSize: 13, color: "#9ca3af" }}
                  >
                    Operation
                  </p>
                  <Form.Select
                    value={op}
                    onChange={(e) => {
                      setOp(e.target.value);
                      setErrors((prev) => ({ ...prev, op: "" }));
                    }}
                    style={{
                      ...darkControl,
                      borderColor: errors.op ? "#f87171" : "#374151",
                    }}
                  >
                    <option value="" disabled style={{ color: "#fafafaff" }}>
                      Select…
                    </option>
                    {(current.operations || []).map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </Form.Select>
                  {errText(errors.op)}
                </div>
              </Col>

              {/* Output */}
              <Col style={{ minWidth: 200 }}>
                <div style={darkCard} className="h-100 pb-3">
                  <p
                    className="mb-2"
                    style={{ fontSize: 13, color: "#9ca3af" }}
                  >
                    Output
                  </p>
                  <Form.Select
                    value={output}
                    onChange={(e) => {
                      setOutput(e.target.value);
                      setErrors((prev) => ({ ...prev, output: "" }));
                    }}
                    style={{
                      ...darkControl,
                      borderColor: errors.output ? "#f87171" : "#374151",
                    }}
                  >
                    <option value="" disabled style={{ color: "#fafafaff" }}>
                      Select…
                    </option>
                    {(current.outputs || []).map((item, i) => (
                      <option key={i} value={item}>
                        {item}
                      </option>
                    ))}
                  </Form.Select>
                  {errText(errors.output)}
                </div>
              </Col>
            </Row>

            {/* Preview */}
            <div
              className="rounded-3 p-4 mb-4"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <p
                className="mb-0 font-monospace"
                style={{ fontSize: "1rem", color: "#60a5fa" }}
              >
                {name || "Unnamed"} → {type} →{" "}
                {inputs.length ? inputs.join(", ") : "source"} → {op || "..."} →{" "}
                {output || "..."}
              </p>
            </div>

            {/* Deploy */}
            <Button
              onClick={handleDeploy}
              className="w-50 py-2 mx-auto d-flex align-items-center justify-content-center gap-2"
              style={{
                background: "linear-gradient(90deg, #3b82f6 0%, #9333ea 100%)",
                border: "none",
              }}
            >
              <BsRocketTakeoffFill />
              Deploy Indicator
            </Button>

            {/* Payload */}
            {payload && (
              <pre
                className="mt-3 mb-0"
                style={{ fontSize: 12, color: "#86efac" }}
              >
                {JSON.stringify(payload, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
