import React, { useState, useEffect } from "react";
import { indicatorConfig } from "./CustomIndicatorConfig";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { BsLightningChargeFill, BsRocketTakeoffFill } from "react-icons/bs";

export default function ProIndicatorBuilder() {
  const [name, setName] = useState("");
  const [type, setType] = useState("OHLC");
  const [inputs, setInputs] = useState([]);
  const [op, setOp] = useState("");
  const [output, setOutput] = useState("");
  const [payload, setPayload] = useState(null);

  const current = indicatorConfig[type];

  // 🔥 dynamic grid layout
  const gridCols = "grid-cols-1 md:grid-cols-5";

  // 🔥 sync inputs
  useEffect(() => {
    setInputs(Array(current.inputCount).fill(""));
  }, [type]);

  const handleInputChange = (value, index) => {
    const updated = [...inputs];
    updated[index] = value;
    setInputs(updated);
  };

  const handleDeploy = () => {
    const finalPayload = {
      name,
      source: type,
      inputCount: current.inputCount,
      inputs,
      operation: op,
      output,
      timestamp: new Date().toISOString(),
    };

    setPayload(finalPayload);
  };
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

  const getOperatorSymbol = (type) => {
    switch (type) {
      case "Addition":
        return "+";
      case "Subtraction":
        return "-";
      case "Multiplication":
        return "×";
      case "Division":
        return "÷";
      case "Min/Max":
        return "+";
      case "GreaterThan":
        return ">";
      case "LessThan":
        return "<";
      case "NotEqual":
        return "≠";
      case "GreaterThanOrEqual":
        return ">=";
      case "LessThanOrEqual":
        return "<=";
      default:
        return "+";
    }
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
      <div className="w-100" style={{ maxWidth: 1200 }}>
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
                <p className="mb-2" style={{ fontSize: 13, color: "#9ca3af" }}>Name</p>
                <Form.Control
                  value={name}
                  placeholder="Indicator Name"
                  onChange={(e) => setName(e.target.value)}
                  className="white-placeholder"
                  style={darkControl}
                />
              </div>
            </Col>

            {/* Source */}
            <Col style={{ minWidth: 200 }}>
              <div style={darkCard} className="h-100">
                <p className="mb-2" style={{ fontSize: 13, color: "#9ca3af" }}>Source</p>
                <Form.Select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setOp("");
                    setOutput("");
                  }}
                  style={darkControl}
                >
                  {Object.keys(indicatorConfig).map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            {current.inputCount > 0 && (
              <Col style={{ minWidth: current.operator ? 400 : 200, flex: current.operator ? 2 : 1 }}>
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
                      <div className="d-flex align-items-center gap-3">
                        <Form.Select
                          value={inputs[0] || ""}
                          onChange={(e) => handleInputChange(e.target.value, 0)}
                          style={{ ...darkControl, flex: 1 }}
                        >
                          <option value="">Select</option>
                          {current.accepts.map((item, i) => (
                            <option key={i}>{item}</option>
                          ))}
                        </Form.Select>

                        <div
                          style={{
                            color: "#facc15",
                            fontWeight: "bold",
                            fontSize: 20,
                          }}
                        >
                          {current.operator}
                        </div>

                        <Form.Select
                          value={inputs[1] || ""}
                          onChange={(e) => handleInputChange(e.target.value, 1)}
                          style={{ ...darkControl, flex: 1 }}
                        >
                          <option value="">Select</option>
                          {current.accepts
                            .filter((item) => item !== inputs[0])
                            .map((item, i) => (
                              <option key={i}>{item}</option>
                            ))}
                        </Form.Select>
                      </div>
                    ) : (
                      inputs.map((val, i) => (
                        <Form.Select
                          key={i}
                          value={val}
                          onChange={(e) => handleInputChange(e.target.value, i)}
                          className="mb-2"
                          style={darkControl}
                        >
                          <option value="">Select</option>
                          {current.accepts.map((item, j) => (
                            <option key={j}>{item}</option>
                          ))}
                        </Form.Select>
                      ))
                    )
                  ) : (
                    /* CASE 2: NO operator → normal input boxes */
                    inputs.map((val, i) => (
                      <Form.Control
                        key={i}
                        value={val}
                        placeholder={`${current.inputPlaceholder} ${i + 1}`}
                        onChange={(e) => handleInputChange(e.target.value, i)}
                        className="mb-2 white-placeholder"
                        style={darkControl}
                      />
                    ))
                  )}
                </div>
              </Col>
            )}

            {/* Operation */}
            <Col style={{ minWidth: 200 }}>
              <div style={darkCard} className="h-100">
                <p className="mb-2" style={{ fontSize: 13, color: "#9ca3af" }}>Operation</p>
                <Form.Select
                  value={op}
                  onChange={(e) => setOp(e.target.value)}
                  style={darkControl}
                >
                  <option value="">Select</option>
                  {current.col3.map((item, i) => (
                    <option key={i}>{item}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            {/* Output */}
            <Col style={{ minWidth: 200 }}>
              <div style={darkCard} className="h-100">
                <p className="mb-2" style={{ fontSize: 13, color: "#9ca3af" }}>Output</p>
                <Form.Select
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  style={darkControl}
                >
                  <option value="">Select</option>
                  {current.col4.map((item, i) => (
                    <option key={i}>{item}</option>
                  ))}
                </Form.Select>
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
