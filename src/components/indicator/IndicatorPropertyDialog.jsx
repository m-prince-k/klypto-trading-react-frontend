import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import { IoClose, IoChevronDown } from "react-icons/io5";
import { FiInfo } from "react-icons/fi";

function SelectField({ label, options, value, onChange }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <label className="text-sm text-gray-700">{label}</label>

      <div className="relative w-[140px]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 rounded-sm text-gray-800 text-sm h-[30px] pl-2.5 pr-7 outline-none focus:border-blue-500 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs" />
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, info }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <label className="flex items-center gap-1 text-sm text-gray-700">
        {label}
        {info && <FiInfo className="text-gray-400 text-xs" title={info} />}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-[140px] bg-white border border-gray-300 rounded-sm text-gray-800 text-sm h-[30px] px-2.5 outline-none focus:border-blue-500"
      />
    </div>
  );
}

export default function IndicatorPropertyDialog({
  indicatorProperty,
  selectedIndicator,
  setIndicatorProperty,
}) {
  /* ------------------ MAIN COMPONENT ------------------ */

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
          {/* Section Title */}
          <p className="text-uppercase text-muted fw-bold small mb-3">
            {selectedIndicator} Settings
          </p>
          <NumberField
            label={`${selectedIndicator} Length`}
            value={indicatorConfig.properties.length}
            onChange={(val) => updateProperty("length", val)}
          />

            <div>
              <SelectField
                label="Source"
                value={indicatorConfig.properties.source}
                options={[
                  "Close",
                  "Open",
                  "High",
                  "Low",
                  "HL2",
                  "HLC3",
                  "OHLC4",
                ]}
                onChange={(val) => updateProperty("source", val)}
              />

              <hr />

              {/* Smoothing */}
              <p className="text-uppercase text-muted fw-bold small mb-3">
                Smoothing
              </p>

              <SelectField
                label="Type"
                value={indicatorConfig.properties.smoothing.type}
                options={["SMA", "EMA", "WMA", "VWMA", "SMMA (RMA)"]}
                onChange={(val) => updateSmoothing("type", val)}
              />
            </div>
       

          <NumberField
            label="Length"
            value={indicatorConfig.properties.smoothing.length}
            onChange={(val) => updateProperty("length", val)}
          />


            <NumberField
              label="BB StdDev"
              value={indicatorConfig.properties.smoothing.bbStdDev}
              info="Bollinger Band Standard Deviation"
              onChange={(val) => updateSmoothing("bbStdDev", val)}
            />
         
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
    </div>
  );
}
