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

  return (
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
          <Row className="g-3 mb-4">

            {/* Name */}
            <Col>
              <div className="bg-white bg-opacity-5 p-3 rounded border border-white border-opacity-10">
                <p className="text-muted small mb-2">Name</p>
                <Form.Control
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid #374151",
                    color: "#fff",
                  }}
                />
              </div>
            </Col>

            {/* Source */}
            <Col>
              <div className="bg-white bg-opacity-5 p-3 rounded border border-white border-opacity-10">
                <p className="text-muted small mb-2">Source</p>
                <Form.Select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setOp("");
                    setOutput("");
                  }}
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid #374151",
                    color: "#fff",
                  }}
                >
                  {Object.keys(indicatorConfig).map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            {/* Inputs */}
            {current.inputCount > 0 && (
              <Col>
                <div className="bg-white bg-opacity-5 p-3 rounded border border-white border-opacity-10">
                  <p className="text-muted small mb-2">Input</p>

                  {inputs.map((val, i) => (
                    <Form.Control
                      key={i}
                      value={val}
                      placeholder={`${current.inputPlaceholder} ${i + 1}`}
                      onChange={(e) =>
                        handleInputChange(e.target.value, i)
                      }
                      className="mb-2"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid #374151",
                        color: "#fff",
                      }}
                    />
                  ))}
                </div>
              </Col>
            )}

            {/* Operation */}
            <Col>
              <div className="bg-white bg-opacity-5 p-3 rounded border border-white border-opacity-10">
                <p className="text-muted small mb-2">Operation</p>
                <Form.Select
                  value={op}
                  onChange={(e) => setOp(e.target.value)}
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid #374151",
                    color: "#fff",
                  }}
                >
                  <option value="">Select</option>
                  {current.col3.map((item, i) => (
                    <option key={i}>{item}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            {/* Output */}
            <Col>
              <div className="bg-white bg-opacity-5 p-3 rounded border border-white border-opacity-10">
                <p className="text-muted small mb-2">Output</p>
                <Form.Select
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid #374151",
                    color: "#fff",
                  }}
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
              {inputs.length ? inputs.join(", ") : "source"} →{" "}
              {op || "..."} → {output || "..."}
            </p>
          </div>

          {/* Deploy */}
          <Button
            onClick={handleDeploy}
            className="w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            style={{
              background:
                "linear-gradient(90deg, #3b82f6 0%, #9333ea 100%)",
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
  );
}