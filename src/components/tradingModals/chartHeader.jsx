import { FiPlus } from "react-icons/fi";
import { VscGraphLine } from "react-icons/vsc";
import { useState, useEffect } from "react";
import { ListingModal } from "./ListingModal";
import apiService from "../../services/apiServices";
import { MdAlarmAdd } from "react-icons/md";

export default function ChartHeader({
  exchange = "BIOFIlCHEM",
  timeframeValue,
  setTimeframeValue,
  setRangeValue,
  rangeValue,
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
  const RANGES = [1, 10, 100, 1000];

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

  const handleChange = (e) => {
    setTimeframeValue(e.target.value);
  };
  return (
    <div className="w-full justify-start flex flex-col gap-3 text-sm">
      <div className=" flex items-center px-3 py-1.5 bg-white divide-x divide-slate-200">
        {" "}
        {/* Name */}
        <button
          title={"Symbol Search"}
          onClick={() => openModal("Symbol Search")}
          className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-full transition-colors"
        >
          {selectedCurrency || "ETHBTC"}
        </button>
        {/* TimeFrame */}
        <div title={timeframeValue} className="inline-flex items-center">
          <div className="relative inline-block">
            <select
              value={timeframeValue}
              onChange={(e) => handleChange(e)}
              className="
                appearance-none h-8 px-3 pr-8 text-sm rounded-md bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-200 cursor-pointer transition-all mx-1">
              {timeframe &&
                Object.entries(timeframe)?.map(([group, items]) => (
                  <optgroup
                    className="text-slate-500 text-xs font-semibold"
                    key={group}
                    label={`${group?.toUpperCase()} ————`}
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
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
              ▾
            </div>
          </div>
        </div>
        {/* Adding Charts */}
        <select
          title={chartType}
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="
  appearance-none
  h-8
  px-3 pr-8
  text-sm
  rounded-md
  bg-white
  text-slate-900
  border border-slate-200
  hover:border-slate-300
  hover:bg-slate-50
  focus:outline-none
  focus:ring-2 focus:ring-slate-200
  cursor-pointer
  transition-all mx-1
"
        >
          <option value="candlestick">🕯️ Candlestick</option>
          <option value="line">📈 Line</option>
          <option value="bar">📊 Bar</option>
          <option value="area">🌊 Area</option>
          <option value="baseline">📉 Baseline</option>
          <option value="hollowcandles">⭕ Hollow Candles</option>
          <option value="heikinashi">🔁 Heikin Ashi</option>
          <option value="histogram">📶 Histogram</option>
        </select>
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
            transition-colors mx-1">
          <VscGraphLine className="text-md" />
          Indicators
        </button>
        {/* Alert */}
        <button
          title="Create Alert"
          onClick={() => openModal("Alerts")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-slate-700 hover:text-slate-900"
        >
          <MdAlarmAdd className="text-md" />
          Alert
        </button>
        {/* Alert */}
        <button
          title="Simulation"
          onClick={() => openModal("Simulation")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-slate-700 hover:text-slate-900"
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
