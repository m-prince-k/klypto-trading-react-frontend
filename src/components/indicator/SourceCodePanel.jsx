import React from "react";
import { IoCloseSharp } from "react-icons/io5";

export default function SourceCodePanel({ show, onClose, indicator }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex transition-opacity duration-300 ${
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className="flex-1 bg-black/30 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`w-[450px] h-full bg-white shadow-xl p-4 overflow-auto
        transform transition-transform duration-300 ease-in-out
        ${show ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <h5 className="font-semibold">{indicator} Source Code</h5>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            <IoCloseSharp size={22} />
          </button>
        </div>

        {/* Source Code */}
        <pre
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            padding: "12px",
            borderRadius: "6px",
            fontSize: "12px",
            overflowX: "auto",
          }}
        >
{`// ${indicator} Indicator Example

function calculate${indicator}(data) {
  // indicator logic here
}
`}
        </pre>
      </div>
    </div>
  );
}