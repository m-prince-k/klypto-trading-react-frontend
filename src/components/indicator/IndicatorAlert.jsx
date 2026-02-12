import { useState } from "react";
import { FaC } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
export default function IndicatorAlert({ onClose, value, symbol, liveOhlcv }) {
  console.log("Live OHLCV in Alert:", liveOhlcv);
  return (
    <div className="fixed inset-0 z-99 flex items-center mx-auto justify-center bg-black/40 p-3">
      <div className="w-full max-w-[520px] bg-white rounded-md shadow-xl">
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">
              Create alert on {symbol}
            </h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <IoMdClose className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 sm:gap-6 border-b mb-4 text-xs sm:text-sm overflow-x-auto">
            <button className="pb-2 border-b-2 border-black font-medium whitespace-nowrap">
              Settings
            </button>
            <button className="pb-2 text-gray-500 whitespace-nowrap">
              Message
            </button>
            <button className="pb-2 text-gray-500 whitespace-nowrap">
              Notifications
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-3 text-left text-xs sm:text-sm">
            {/* Symbols */}
            <div className="flex justify-between gap-5 items-start">
              <label className="text-gray-800 mt-3">Symbols</label>
              <div className="mt-1 w-[70%] border border-slate-300 bg-slate-100 rounded-lg px-3 py-2">
                {symbol}
              </div>
            </div>

            {/* Condition */}
            <div className="flex justify-between gap-2">
              <label className="text-gray-800 mt-3">Condition</label>
              <div className="w-[70%] flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <select className="border border-slate-300 rounded-lg px-2 py-2">
                    <option>SMA (9, close)</option>
                  </select>
                  <select className="border border-slate-300 rounded-lg px-2 py-2">
                    <option>MA</option>
                  </select>
                </div>

                {/* Crossing */}
                <select className="border border-slate-300 rounded-lg px-2 py-2 w-full">
                  <option>Crossing</option>
                </select>

                {/* Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select className="border border-slate-300 rounded-lg px-2 py-2">
                    <option>Value</option>
                    <option>Price</option>
                  </select>
                  <input
                    type="number"
                    value={value.toFixed(2)}
                    // onChange={(e) => setValue(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Interval */}
            <div className="flex justify-between gap-5 items-start">
              <label className="text-gray-800 mt-3">Interval</label>
              <div className=" w-[70%] flex flex-col gap-3">
                <select className="border border-slate-300 rounded-lg px-2 py-2 ">
                  <option>Same as chart</option>
                </select>
                {/* Add Condition */}
                <button className="text-blue-600 text-xs sm:text-sm w-fit">
                  + Add condition
                </button>
              </div>
            </div>

            {/* Trigger + Expiration */}
            <div className="flex flex-col">
              <div className="flex gap-22 items-center">
                <label className="text-gray-800 ">Trigger</label>
                <select className=" w-[fit] px-2 py-2 ">
                  <option>Once only</option>
                </select>
              </div>

              <div className="flex gap-18 items-center">
                <label className="text-gray-800 ">Expiration</label>
                <select className="w-fit px-1.5 py-2 ">
                  <option>March 14, 2026 at 11:24</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-5">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancel
            </button>

            <button className="w-full sm:w-auto px-4 py-2 rounded-lg bg-black text-white hover:opacity-90">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
