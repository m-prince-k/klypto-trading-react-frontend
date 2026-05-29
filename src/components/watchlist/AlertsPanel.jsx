import React from "react";
import { IoCloseSharp } from "react-icons/io5";

export default function AlertsPanel({ alertsFeed, matchedCoins, scanner, onClose }) {
  return (
    <div
      className="flex flex-col h-full bg-white dark:bg-[#131722]"
      style={{
        color: "var(--text-main, #131722)",
        backgroundColor: "var(--bg-card, #ffffff)",
      }}
    >
      <div
        className="flex justify-between items-center px-4 py-3 border-b"
        style={{ borderColor: "var(--border-color, #e2e8f0)" }}
      >
        <h2 className="text-sm font-semibold m-0">Alerts</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-0 cursor-pointer">
          <IoCloseSharp size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {scanner && (
          <div
            className="p-3 rounded-lg border text-sm flex flex-col gap-1 mb-2"
            style={{
              borderColor: "#60a5fa",
              backgroundColor: "#eff6ff",
            }}
          >
            <div className="flex justify-between font-semibold">
              <span className="text-blue-700">Active Scanner</span>
              {scanner.expirationDate && (
                <span className="text-slate-500 text-xs">Expires: {new Date(scanner.expirationDate).toLocaleTimeString()}</span>
              )}
            </div>
            <div className="flex justify-between mt-1 items-center">
              <span className="text-blue-800 font-medium">Waiting for match...</span>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-200">
                {scanner.indicator} {scanner.condition} {scanner.value}
              </span>
            </div>
          </div>
        )}
        
        {matchedCoins && matchedCoins.length > 0 ? (
          matchedCoins.map((alert, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border text-sm flex flex-col gap-1"
              style={{
                borderColor: "var(--border-color, #e2e8f0)",
                backgroundColor: "var(--bg-main, #f8fafc)",
              }}
            >
              <div className="flex justify-between font-semibold">
                <span className="text-blue-600">{alert.symbol}</span>
                <span className="text-slate-500 text-xs">{alert.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>Value: <span className="font-medium">{alert.rsi}</span></span>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                  {alert.condition}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-500 text-sm mt-10">
            No alerts triggered yet
          </div>
        )}
      </div>
    </div>
  );
}
