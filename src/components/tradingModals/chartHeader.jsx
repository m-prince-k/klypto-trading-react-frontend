import { FiPlus } from "react-icons/fi";
import { VscGraphLine } from "react-icons/vsc";
import { useState, useEffect } from "react";
import { ListingModal } from "./ListingModal";
import apiService from "../../services/apiServices";
import { MdAlarmAdd } from "react-icons/md";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FiChevronDown } from "react-icons/fi";
import { chartOptions } from "../../util/common";

export default function ChartHeader({
  timeframeValue,
  setTimeframeValue,
  selectedCurrency,
  selectedIndicator,
  setSelectedIndicator,
  setSelectedCurrency,
  toggleIndicator,
  setChartType,
  chartType,
  loadIndicator,
}) {
  const [timeframe, setTimeframe] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const active = chartOptions.find((c) => c.value === chartType);

  const [modalConfig, setModalConfig] = useState({
    open: false,
    title: "",
    items: [],
  });

  const openModal = (title, items) => {
    setModalConfig({
      open: true,
      title,
      items,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, open: false }));
  };

  async function fetchTimeframe() {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post("getTimeFrames");
      setTimeframe(response.data);
      
      setTimeframeValue(timeframeValue);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch timeframes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTimeframe();
  }, []);

return (
  <div className="w-full justify-start flex flex-col gap-3 text-sm">
    <div className="flex items-center gap-2 px-6 py-2 bg-white shadow-sm ">
      {/* Name/Symbol Button */}
      <button
        title={"Symbol Search"}
        onClick={() => openModal("Symbol Search")}
        className="group relative h-10 px-5 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-900 font-bold rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-slate-200/50 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          {selectedCurrency || "BTCUSDT"}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
      </button>

      {/* Divider */}
      <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

      {/* TimeFrame Dropdown */}
      <div title={timeframeValue} className="inline-flex items-center">
        <div className="relative inline-block group">
          <select
            value={timeframeValue ? timeframeValue : "1m"}
            onChange={(e) => setTimeframeValue(e.target.value)}
            className="
              appearance-none h-10 pl-4 pr-10 text-sm font-semibold rounded-xl 
              bg-white text-slate-900 
              border-2 border-slate-200 
              hover:border-purple-300 hover:bg-purple-50/30
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300
              cursor-pointer transition-all duration-200
              shadow-sm hover:shadow-md"
          >
            {!timeframe && <option value="1m">1 Minute</option>}

            {/* ✅ Fallback if API returned empty object */}
            {timeframe && Object.keys(timeframe).length === 0 && (
              <option value="1m">1 Minute</option>
            )}
            {timeframe &&
              Object.entries(timeframe)?.map(([group, items]) => (
                <optgroup
                  className="text-slate-500 text-xs font-semibold"
                  key={group}
                  label={`${group?.toUpperCase()} `}
                >
                  {items?.map((item) => (
                    <option key={item?.seconds} value={item?.value}>
                      {item?.label}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>

          {/* Custom Arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-600 group-hover:text-purple-600 transition-colors duration-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

      {/* Chart Type Dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="group h-10 z-0 flex items-center gap-2 px-4 rounded-xl bg-white 
              border-2 border-slate-200 hover:bg-purple-50/30 hover:border-purple-300
              text-sm font-semibold text-slate-800 hover:text-purple-700
              transition-all duration-200 focus:outline-none
              shadow-sm hover:shadow-md"
          >
            {active?.icon && <active.icon size={16} />}
            <span>{active?.label}</span>
            <FiChevronDown size={14} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            className="min-w-48 bg-white/95 backdrop-blur-xl rounded-xl border-2 border-slate-200/50 
              shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200"
          >
            {chartOptions.map((item) => (
              <DropdownMenu.Item
                key={item.value}
                onClick={() => setChartType(item.value)}
                className="group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg
                  text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50
                  hover:text-purple-700 cursor-pointer outline-none transition-all duration-150"
              >
                <item.icon size={16} className="group-hover:scale-110 transition-transform" />

                <span className="flex-1">{item.label}</span>

                {chartType === item.value && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-500/30">
                    ✓
                  </span>
                )}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Divider */}
      <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Indicators Button */}
        <button
          title="Indicators"
          onClick={() => openModal("Indicators")}
          className="
            group h-10 px-4
            flex items-center gap-2
            rounded-xl font-semibold
            bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50
            text-slate-700 hover:text-purple-700
            border-2 border-transparent hover:border-purple-200
            transition-all duration-200
            shadow-sm hover:shadow-md"
        >
          <VscGraphLine className="text-lg group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Indicators</span>
        </button>

        {/* Alert Button */}
        <button
          title="Create Alert"
          onClick={() => openModal("Alerts")}
          className="group h-10 px-4 flex items-center gap-2 rounded-xl font-semibold
            bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50
            text-slate-700 hover:text-amber-700
            border-2 border-transparent hover:border-amber-200
            transition-all duration-200
            shadow-sm hover:shadow-md"
        >
          <MdAlarmAdd className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-all" />
          <span className="hidden sm:inline">Alert</span>
        </button>

        {/* Simulation Button */}
        <button
          title="Simulation"
          onClick={() => openModal("Simulation")}
          className="group h-10 px-4 flex items-center gap-2 rounded-xl font-semibold
            bg-gradient-to-r from-purple-600 to-indigo-600
            hover:from-purple-700 hover:to-indigo-700
            text-white
            transition-all duration-200
            shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
            hover:-translate-y-0.5"
        >
          <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">Simulation</span>
        </button>
      </div>
    </div>

    {/* MODAL */}
    <ListingModal
      isOpen={modalConfig.open}
      onClose={closeModal}
      title={modalConfig.title}
      selectedCurrency={selectedCurrency}
      setSelectedCurrency={setSelectedCurrency}
      selectedIndicator={selectedIndicator}
      setSelectedIndicator={setSelectedIndicator}
      toggleIndicator={toggleIndicator}
      loadIndicator={loadIndicator}
    />
  </div>
);
}
