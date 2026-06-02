import { useState } from "react";
import { IoMdClose } from "react-icons/io";

export default function IndicatorAlert({ onClose, value, symbol, liveOhlcv, addAlert, activeIndicators = [] }) {
  const uniqueIndicators = Array.from(
    new Set(activeIndicators.map((slug) => slug.split('_')[0]))
  );
  const defaultIndicator = uniqueIndicators.length > 0 ? uniqueIndicators[0] : "RSI";
  const [alertIndicator, setAlertIndicator] = useState(defaultIndicator);
  const [alertCondition, setAlertCondition] = useState("crossesAbove");
  const [alertValue, setAlertValue] = useState(value || "");
  const [alertExpiration, setAlertExpiration] = useState("");

  // console.log("IndicatorAlert render: addAlert is:", addAlert, "type:", typeof addAlert);

  const handleCreate = () => {
    if (!alertValue) {
      console.error("Failed to create alert: Alert value is empty!");
      return;
    }

    try {
      if (typeof addAlert === "function") {
        addAlert({
          indicator: alertIndicator,
          condition: alertCondition,
          value: alertValue,
          expirationDate: alertExpiration,
        });
        console.log("Successfully created the alert with value:", alertValue);
      } else {
        console.error("Failed to create alert: addAlert is not a function!");
      }

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (err) {
      console.error("Failed to create alert:", err);
    }
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--text-muted, #64748b)",
    flexShrink: 0,
    width: "76px",
    paddingTop: "9px",
    textAlign: "left",
  };

  const selectStyle = {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid var(--border-color, #cbd5e1)",
    backgroundColor: "var(--bg-card, #f8fafc)",
    color: "var(--text-main, #131722)",
    fontSize: "13px",
    width: "100%",
  };

  const disabledSelectStyle = {
    ...selectStyle,
    backgroundColor: "var(--bg-card, #f1f5f9)",
    color: "var(--text-muted, #94a3b8)",
    cursor: "not-allowed",
  };

  const rowStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "50px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(90vh - 80px)",
        maxHeight: "560px",
        color: "var(--text-main, #131722)",
      }}
    >
      {/* Tabs */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: "24px",
          borderBottom: "1px solid var(--border-color, #e2e8f0)",
          marginBottom: "16px",
        }}
      >
        {["Settings", "Message", "Notifications"].map((tab) => (
          <button
            key={tab}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === "Settings" ? "2px solid var(--text-main, #131722)" : "2px solid transparent",
              color: tab === "Settings" ? "var(--text-main, #131722)" : "var(--text-muted, #64748b)",
              padding: "8px 0",
              fontSize: "13px",
              fontWeight: tab === "Settings" ? 500 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          paddingRight: "4px",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border-color, #cbd5e1) transparent",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>

          {/* Condition row */}
          <div style={rowStyle}>
            <label style={labelStyle}>Condition</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <select
                value={alertIndicator}
                onChange={(e) => setAlertIndicator(e.target.value)}
                style={selectStyle}
              >
                {uniqueIndicators.length > 0 ? (
                  uniqueIndicators.map((indicator) => (
                    <option key={indicator} value={indicator}>
                      {indicator}
                    </option>
                  ))
                ) : (
                  <option value="RSI">RSI</option>
                )}
              </select>

              <select
                value={alertCondition}
                onChange={(e) => setAlertCondition(e.target.value)}
                style={selectStyle}
              >
                <option value="crossesAbove">Crosses Above</option>
                <option value="crossesBelow">Crosses Below</option>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
              </select>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <select style={selectStyle}>
                  <option>Value</option>
                </select>
                <input
                  type="number"
                  value={alertValue}
                  onChange={(e) => setAlertValue(e.target.value)}
                  placeholder="e.g. 70"
                  style={selectStyle}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color, #e2e8f0)", margin: 0 }} />

          {/* Interval row */}
          <div style={rowStyle}>
            <label style={labelStyle}>Interval</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              <select disabled style={disabledSelectStyle}>
                <option>Same as chart</option>
              </select>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#378ADD",
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "2px 0",
                  textAlign: "left",
                  width: "fit-content",
                }}
              >
                + Add condition
              </button>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color, #e2e8f0)", margin: 0 }} />

          {/* Trigger row */}
          <div style={rowStyle}>
            <label style={labelStyle}>Trigger</label>
            <div style={{ width: "180px" }}>
              <select disabled style={disabledSelectStyle}>
                <option>Once only</option>
              </select>
            </div>
          </div>

          {/* Expiration row */}
          <div style={rowStyle}>
            <label style={labelStyle}>Expiration</label>
            <div style={{ width: "180px" }}>
              <input
                type="datetime-local"
                value={alertExpiration}
                onChange={(e) => setAlertExpiration(e.target.value)}
                style={selectStyle}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          paddingTop: "12px",
          marginTop: "4px",
          borderTop: "1px solid var(--border-color, #e2e8f0)",
        }}
      >
        <button
          onClick={() => {
            if (typeof onClose === "function") onClose();
          }}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "1px solid var(--border-color, #e2e8f0)",
            backgroundColor: "var(--bg-card, #ffffff)",
            color: "var(--text-main, #131722)",
            fontSize: "13px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover, #f1f5f9)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card, #ffffff)")}
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--text-main, #000000)",
            color: "var(--bg-card, #ffffff)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Create
        </button>
      </div>
    </div>
  );
}