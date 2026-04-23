import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { BsLightningChargeFill, BsRocketTakeoffFill } from "react-icons/bs";
import { indicatorConfig } from "./CustomIndicatorConfig";

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

export default function ProIndicatorBuilder() {
  const [name, setName] = useState("");
  const [type, setType] = useState("OHLC");
  const [inputs, setInputs] = useState([]);
  const [op, setOp] = useState("");
  const [output, setOutput] = useState("");
  const [payload, setPayload] = useState(null);

  const current = indicatorConfig[type];

  useEffect(() => {
    setInputs(Array(current.inputCount).fill(""));
  }, [type]);

  const handleInputChange = (value, index) => {
    const updated = [...inputs];
    updated[index] = value;
    setInputs(updated);
  };

  const handleDeploy = () => {
    setPayload({
      name,
      source: type,
      inputCount: current.inputCount,
      inputs,
      operation: op,
      output,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #2d2d2d 100%)",
      }}
    >
      <div className="w-100" style={{ maxWidth: 1000 }}>
        <div
          className="rounded-4 p-4 p-md-5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h1
            className="fw-bold mb-4 d-flex align-items-center gap-2"
            style={{ fontSize: "1.75rem", color: "#fff" }}
          >
            <BsLightningChargeFill style={{ color: "#facc15", fontSize: 22 }} />
            Custom Indicator
          </h1>

          <Row className="g-3 mb-4">

            {/* Name */}
            <Col xs={12} md={6} lg>
              <div style={darkCard}>
                <p className="mb-2" style={{ fontSize: 13, color: "#9ca3af" }}>Name</p>
                <Form.Control
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={darkControl}
                />
              </div>
            </Col>

            {/* Source */}
            <Col xs={12} md={6} lg>
              <div style={darkCard}>
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

            {/* Input */}
            {current.inputCount > 0 && (
              <Col xs={12} md={6} lg>
                <div style={darkCard}>
                  <p className="mb-2" style={{ fontSize: 13, color: "#9ca3af" }}>Input</p>
                  {inputs.map((val, i) => (
                    <Form.Control
                      key={i}
                      value={val}
                      placeholder={`${current.inputPlaceholder} ${i + 1}`}
                      onChange={(e) => handleInputChange(e.target.value, i)}
                      className="mb-2"
                      style={darkControl}
                    />
                  ))}
                </div>
              </Col>
            )}

            {/* Operation */}
            <Col xs={12} md={6} lg>
              <div style={darkCard}>
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
            <Col xs={12} md={6} lg>
              <div style={darkCard}>
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
            <p className="mb-0 font-monospace" style={{ fontSize: "1rem", color: "#60a5fa" }}>
              {name || "Unnamed"} → {type} →{" "}
              {inputs.length ? inputs.join(", ") : "source"} →{" "}
              {op || "..."} → {output || "..."}
            </p>
          </div>

          {/* Deploy */}
          <Button
            onClick={handleDeploy}
            className="w-100 py-2 fw-semibold border-0 rounded-3 d-flex align-items-center justify-content-center gap-2"
            style={{
              background: "linear-gradient(90deg, #3b82f6 0%, #9333ea 100%)",
              fontSize: 15,
            }}
          >
            <BsRocketTakeoffFill style={{ fontSize: 15 }} />
            Deploy Indicator
          </Button>

          {/* Payload */}
          {payload && (
            <pre className="mt-3 mb-0" style={{ fontSize: 12, color: "#86efac" }}>
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}

        </div>
      </div>
    </Container>
  );
}