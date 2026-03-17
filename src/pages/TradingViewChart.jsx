import React, { useState } from "react";
import { Row, Col, Form, Modal, Button } from "react-bootstrap";
import { updateIndicatorStyle } from "../util/ChartFunctions";
import { getRowsByIndicator } from "../util/common";

export default function TradingViewChart({setIndicatorProperty,indicatorProperty,activeBarIndicator,indicatorConfigs,indicatorStyle,setIndicatorStyle,indicatorSeriesRef,}) {
  const [tempIndicatorConfig, setTempIndicatorConfig] = useState({});

  // console.log(indicatorStyle,"styleeeeeee")

  const handleIndicatorPropertyChange = () => {
    const style = indicatorStyle[activeBarIndicator];

    updateIndicatorStyle(
      activeBarIndicator,
      indicatorStyle,
      indicatorSeriesRef,
    );
    setIndicatorProperty(false);
  };

  const update = (section, key, value) => {
    setIndicatorStyle((prev) => ({
      ...prev,
      [activeBarIndicator]: {
        ...prev[activeBarIndicator],
        [section]: {
          ...prev[activeBarIndicator]?.[section],
          [key]: value,
        },
      },
    }));
  };

  const handleCancel = () => {
    setTempIndicatorConfig(indicatorConfigs[activeBarIndicator]);
    setIndicatorProperty(false);
  };

  const selectedStyle = indicatorStyle?.[activeBarIndicator];
  const rows = getRowsByIndicator(activeBarIndicator);
  return (
    <div>
      <Modal
        show={indicatorProperty}
        onHide={() => setIndicatorProperty(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{activeBarIndicator}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex flex-column p-3">
            {rows.map((row) => (
              <Row
                key={row.key}
                className="align-items-center py-2 border-bottom"
              >
                {/* LEFT - CHECKBOX */}
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    checked={
                      selectedStyle?.[row.key]?.visible ?? row.visible ?? true
                    }
                    onChange={(e) =>
                      update(row.key, "visible", e.target.checked)
                    }
                    label={row.label}
                  />
                </Col>

                {/* MIDDLE - COLOR + PREVIEW */}
                <Col md={2} className="d-flex align-items-center ">
                  <input
                    type="color"
                    value={
                      selectedStyle?.[row.key]?.color ?? row.color ?? "#2962ff"
                    }
                    onChange={(e) => update(row.key, "color", e.target.value)}
                    className="form-control form-control-color"
                  />
                </Col>
                <Col md={4} className="d-flex flex-column gap-2">
                  {/* VALUE INPUT (for bands like 70 / 50 / 30) */}
                  {row.value !== undefined && (
                    <div>
                      {/* <Form.Label className="small mb-1">Value</Form.Label> */}
                      <Form.Control
                        type="number"
                        value={
                          selectedStyle?.[row.key]?.value ?? row.value ?? ""
                        }
                        onChange={(e) =>
                          update(row.key, "value", Number(e.target.value))
                        }
                      />
                    </div>
                  )}

                  {/* WIDTH INPUT (for line indicators) */}
                  {row.type === "line" && (
                    <div className="d-flex gap-2 items-center">
                      <Form.Label className="small mb-1">Width</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        max={50}
                        value={
                          selectedStyle?.[row.key]?.width ?? row.width ?? 2
                        }
                        onChange={(e) => {
                          const width = Math.max(
                            1,
                            Math.min(50, Number(e.target.value)),
                          );
                          update(row.key, "width", width);
                        }}
                      />
                    </div>
                  )}
                </Col>

                {/* RIGHT - VALUE */}
                <Col md={4} className="d-flex align-items-start">
                  {row.showValue && (
                    <Form.Control
                      type="number"
                      value={selectedStyle?.[row.key]?.value ?? row.value ?? ""}
                      onChange={(e) =>
                        update(row.key, "value", Number(e.target.value))
                      }
                      style={{ width: "100%" }}
                    />
                  )}
                </Col>
              </Row>
            ))}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={handleCancel}>
            Cancel
          </Button>

          <Button variant="dark" onClick={handleIndicatorPropertyChange}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
