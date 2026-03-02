import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import { IoClose, IoChevronDown } from "react-icons/io5";
import { FiInfo } from "react-icons/fi";


export default function IndicatorPropertyDialog({indicatorProperty,selectedIndicator,setIndicatorProperty,activeBarIndicator}) {





  const [open, setOpen] = useState(true);

  //   const [rsiProperty, setRsiProperty] = useState({
  //     rsiPeriod: 14,
  //     rsiSource: "Close",
  //   });

  //   const [smoothing, setSmoothing] = useState({
  //     type: "WMA",
  //     length: 14,
  //     bbStdDev: 2,
  //   });

  const [indicatorConfig, setIndicatorConfig] = useState({
    type: "sma",
    properties: {
      length: 9,
      source: "Close",
      offset: 0,

      smoothing: {
        type: "SMA + Bollinger Bands",
        length: 14,
        bbStdDev: 2,
      },
    },
  });

  const updateProperty = (key, value) => {
    setIndicatorConfig((prev) => ({
      ...prev,
      properties: {
        ...prev.properties,
        [key]: value,
      },
    }));
  };

  const updateSmoothing = (key, value) => {
    setIndicatorConfig((prev) => ({
      ...prev,
      properties: {
        ...prev.properties,
        smoothing: {
          ...prev.properties.smoothing,
          [key]: value,
        },
      },
    }));
  };

  const handleIndicatorPropertyChange = (e) => {
    console.log(indicatorConfig, "000000000");
  };
  // -------------------------------------indicator property rendering as per selected ----------------------------------
  function commonIndicator() {
    return (
      <>
        <section className="sma-setting">
          <p className="text-uppercase text-muted fw-bold small mb-3">
            Settings
          </p>

          <div className="mb-3">
            <label className="form-label">
              {selectedIndicator} Length
            </label>
            <input
              type="number"
              className="form-control"
              value={indicatorConfig.properties.length}
              onChange={(e) =>
                updateProperty("length", Number(e.target.value))
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Source</label>
            <select
              className="form-select"
              value={indicatorConfig.properties.source}
              onChange={(e) =>
                updateProperty("source", e.target.value)
              }
            >
              {["Close", "Open", "High", "Low", "HL2", "HLC3", "OHLC4"].map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">offset</label>
            <input
              type="number"
              className="form-control"
              value={indicatorConfig.properties.length}
              onChange={(e) =>
                updateProperty("length", Number(e.target.value))
              }
            />
          </div>

        </section>
      </>
    )
  }


  function renderIndicatorSetting() {
    // console.log(selectedIndicator,"----------------0987657890")
    switch (activeBarIndicator) {
      case "SMA":
        console.log("first call is here-------------------------------------------")
        return (
          <>
          {commonIndicator()}
            <hr />

            <section className="smoothing">
              <p className="text-uppercase text-muted fw-bold small mb-3">
                Smoothing
              </p>

              <div className="mb-3">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={indicatorConfig.properties.smoothing.type}
                  onChange={(e) =>
                    updateSmoothing("type", e.target.value)
                  }
                >
                  {["SMA", "EMA", "WMA", "VWMA", "SMMA (RMA)"].map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Length</label>
                <input
                  type="number"

                  className="form-control"
                  value={indicatorConfig.properties?.smoothing?.length}
                  onChange={(e) =>
                    updateSmoothing("length", Number(e.target.value))
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  BB StdDev
                </label>
                <small className="text-muted d-block mb-1">
                  Bollinger Band Standard Deviation
                </small>
                <input
                  type="number"
                  disabled
                  className="form-control"
                  value={indicatorConfig.properties.smoothing.bbStdDev}
                  onChange={(e) =>
                    updateSmoothing("bbStdDev", Number(e.target.value))
                  }
                />
              </div>
            </section>
          </>
        )
        break;
      case "RSI" :
           return (
            <>
            <h1>Hello RSI</h1>
            </>
          )
          
      default:
        return (
          <p className="text-muted text-center">
            No settings available for this indicator
          </p>
        );
    }
  }



  return (
    <div>
      <Modal
        show={indicatorProperty}
        onHide={() => setIndicatorProperty(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedIndicator}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
         {renderIndicatorSetting()}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setIndicatorProperty(false)}
          >
            Cancel
          </Button>

          <Button
            variant="dark"
            onClick={handleIndicatorPropertyChange}
          >
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
