import { useState } from "react";
import { FaC } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

export default function IndicatorAlert({ onClose, value, symbol, liveOhlcv }) {
  console.log("Live OHLCV in Alert:", liveOhlcv);
  return (
      <div className="w-full h-[66px] overflow-y" style={{ color: "var(--text-main, #131722)" }}>
        <div>
          {/* Header */}

          {/* Tabs */}
          <div className="flex gap-4 sm:gap-6 border-b mb-4 text-xs sm:text-sm overflow-x-auto" style={{ borderColor: "var(--border-color, #e2e8f0)" }}>
            <button 
              className="pb-2 font-medium whitespace-nowrap"
              style={{ borderBottom: "2px solid var(--text-main, #000000)", color: "var(--text-main, #131722)", background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none" }}
            >
              Settings
            </button>
            <button className="pb-2 whitespace-nowrap" style={{ color: "var(--text-muted, #64748b)", background: "transparent", border: "none" }}>
              Message
            </button>
            <button className="pb-2 whitespace-nowrap" style={{ color: "var(--text-muted, #64748b)", background: "transparent", border: "none" }}>
              Notifications
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-3 text-left text-xs sm:text-sm">
            {/* Symbols */}
            <div className="flex justify-between gap-5 items-start">
              <label style={{ color: "var(--text-main, #131722)" }} className="mt-3">Symbols</label>
              <div 
                className="mt-1 w-[70%] border rounded-lg px-3 py-2"
                style={{
                  backgroundColor: "var(--bg-main, #f1f5f9)",
                  borderColor: "var(--border-color, #cbd5e1)",
                  color: "var(--text-main, #131722)"
                }}
              >
                {symbol}
              </div>
            </div>

            {/* Condition */}
            <div className="flex justify-between gap-2">
              <label style={{ color: "var(--text-main, #131722)" }} className="mt-3">Condition</label>
              <div className="w-[70%] flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <select 
                    className="border rounded-lg px-2 py-2"
                    style={{
                      backgroundColor: "var(--bg-card, #ffffff)",
                      borderColor: "var(--border-color, #cbd5e1)",
                      color: "var(--text-main, #131722)"
                    }}
                  >
                    <option>SMA (9, close)</option>
                  </select>
                  <select 
                    className="border rounded-lg px-2 py-2"
                    style={{
                      backgroundColor: "var(--bg-card, #ffffff)",
                      borderColor: "var(--border-color, #cbd5e1)",
                      color: "var(--text-main, #131722)"
                    }}
                  >
                    <option>MA</option>
                  </select>
                </div>

                {/* Crossing */}
                <select 
                  className="border rounded-lg px-2 py-2 w-full"
                  style={{
                    backgroundColor: "var(--bg-card, #ffffff)",
                    borderColor: "var(--border-color, #cbd5e1)",
                    color: "var(--text-main, #131722)"
                  }}
                >
                  <option>Crossing</option>
                </select>

                {/* Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select 
                    className="border rounded-lg px-2 py-2"
                    style={{
                      backgroundColor: "var(--bg-card, #ffffff)",
                      borderColor: "var(--border-color, #cbd5e1)",
                      color: "var(--text-main, #131722)"
                    }}
                  >
                    <option>Value</option>
                    <option>Price</option>
                  </select>
                  <input
                    type="number"
                    value={value}
                    className="border rounded-lg px-2 py-2"
                    style={{
                      backgroundColor: "var(--bg-card, #ffffff)",
                      borderColor: "var(--border-color, #cbd5e1)",
                      color: "var(--text-main, #131722)"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Interval */}
            <div className="flex justify-between gap-5 items-start">
              <label style={{ color: "var(--text-main, #131722)" }} className="mt-3">Interval</label>
              <div className=" w-[70%] flex flex-col gap-3">
                <select 
                  className="border rounded-lg px-2 py-2"
                  style={{
                    backgroundColor: "var(--bg-card, #ffffff)",
                    borderColor: "var(--border-color, #cbd5e1)",
                    color: "var(--text-main, #131722)"
                  }}
                >
                  <option>Same as chart</option>
                </select>
                {/* Add Condition */}
                <button className="text-blue-600 text-xs sm:text-sm w-fit" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                  + Add condition
                </button>
              </div>
            </div>

            {/* Trigger + Expiration */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-4 items-center">
                <label style={{ color: "var(--text-main, #131722)", width: "80px" }}>Trigger</label>
                <select 
                  className="px-2 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-card, #ffffff)",
                    borderColor: "var(--border-color, #cbd5e1)",
                    color: "var(--text-main, #131722)"
                  }}
                >
                  <option>Once only</option>
                </select>
              </div>

              <div className="flex gap-4 items-center">
                <label style={{ color: "var(--text-main, #131722)", width: "80px" }}>Expiration</label>
                <select 
                  className="px-2 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-card, #ffffff)",
                    borderColor: "var(--border-color, #cbd5e1)",
                    color: "var(--text-main, #131722)"
                  }}
                >
                  <option>March 14, 2026 at 11:24</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-5">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: "var(--bg-card, #ffffff)",
                borderColor: "var(--border-color, #e2e8f0)",
                color: "var(--text-main, #131722)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-card-hover, #f1f5f9)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--bg-card, #ffffff)"}
            >
              Cancel
            </button>

            <button 
              className="w-full sm:w-auto px-4 py-2 rounded-lg border-0 transition-opacity"
              style={{
                backgroundColor: "var(--text-main, #000000)",
                color: "var(--bg-card, #ffffff)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Create
            </button>
          </div>
        </div>
      </div>
  );
}
