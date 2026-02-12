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
      <div className=" flex items-center px-3 py-1.5 bg-white">
        {/* Name */}
        <button
          title={"Symbol Search"}
          onClick={() => openModal("Symbol Search")}
          className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-full transition-colors"
        >
          {selectedCurrency || "BTCUSDT"}
        </button>
        {/* TimeFrame */}
        <div title={timeframeValue} className="inline-flex items-center">
          <div className="relative inline-block">
            <select
              value={timeframeValue ? timeframeValue : "1m"}
              onChange={(e) => setTimeframeValue(e.target.value)}
              className="
                appearance-none h-8 px-3 pr-8 text-sm rounded-md bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-200 cursor-pointer transition-all mx-1"
            >
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
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-900">
              {timeframeValue? "": '1m'} ▾
            </div>
          </div>
        </div>
        {/* Adding Charts */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="h-8 z-99 flex items-center gap-2 px-3 rounded-md bg-white 
          border border-slate-200 hover:bg-slate-50 hover:border-slate-300
          text-sm text-slate-800 transition-colors focus:outline-none"
            >
              {active?.icon && <active.icon size={16} />}
              <span>{active?.label}</span>
              <FiChevronDown size={14} className="text-slate-400" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={6}
              className="min-w-44 bg-white rounded-md border border-slate-200 
          shadow-lg p-1 animate-in fade-in zoom-in-95"
            >
              {chartOptions.map((item) => (
                <DropdownMenu.Item
                  key={item.value}
                  onClick={() => setChartType(item.value)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md
              text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                >
                  <item.icon size={16} />

                  <span className="flex-1">{item.label}</span>

                  {chartType === item.value && (
                    <span className="text-xs text-slate-400">✓</span>
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {/* Indicator */}
        <button
          title="Indicators"
          onClick={() => openModal("Indicators")}
          className="
            h-8 px-3
            flex items-center gap-2
            rounded-md
            hover:bg-slate-100
            text-slate-700 hover:text-slate-900
            transition-colors mx-1"
        >
          <VscGraphLine className="text-md" />
          Indicators
        </button>
        {/* Alert */}
        <button
          title="Create Alert"
          onClick={() => openModal("Alerts")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        >
          <MdAlarmAdd className="text-md" />
          Alert
        </button>
        {/* Alert */}
        <button
          title="Simulation"
          onClick={() => openModal("Simulation")}
          className="flex items-center gap-1 hover:bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 hover:text-slate-900"
        >
          <FiPlus className="text-md" />
          Simulation
        </button>
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
        loadIndicator={loadIndicator}
      />
    </div>
  );
}
