import { FiPlus } from "react-icons/fi";
import { VscGraphLine } from "react-icons/vsc";
import { useState, useEffect } from "react";
import { ListingModal } from "./ListingModal";
import apiService from "../../services/apiServices";

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
    <div className="w-full justify-start flex flex-col gap-3  ">
      <div className="flex items-center gap-3 px-3 py-1  rounded-lg bg-white   ">
        {/* Name */}
        <button
          title={"Symbol Search"}
          onClick={() => openModal("Symbol Search")}
          className=" bg-slate-200 px-2 w-fit h-7 text-left text-xs font-semibold rounded-full text-slate-900"
        >
          {selectedCurrency || "ETHBTC"}
        </button>

        {/* TimeFrame */}
        <div title={timeframeValue} className="inline-flex items-center gap-1">
          <select
            value={timeframeValue}
            onChange={(e) => handleChange(e)}
            className="px-2 py-1 text-sm rounded-md bg-slate-50 text-slate-900 "
          >
            {timeframe &&
              Object.entries(timeframe)?.map(([group, items]) => (
                <optgroup
                  className="text-slate-500 border-t border-slate-400 text-sm mt-2 "
                  key={group}
                  label={group?.toUpperCase()}
                >
                  {items?.map((item) => (
                    <option
                      key={item?.seconds}
                      value={item?.value}
                      className="text-sm text-slate-900"
                    >
                      {item?.label}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </div>

        {/* Adding Charts */}
        <select
          title={chartType}
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="px-2 py-1 w-36 text-sm rounded-md bg-slate-50 text-slate-900"
        >
          <option value="candlestick">Candlestick</option>
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="area">Area</option>
          <option value="baseline">Baseline</option>
          {/* <option value="hollow">Hollow</option> */}
          <option value="hollowcandles">Hollow Candles</option>
          <option value="heikinashi">Heikin Ashi</option>
          <option value="histogram">Histogram</option>
        </select>

        {/* Indicator */}
        <button
          title="Indicators"
          onClick={() => openModal("Indicators")}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-500"
        >
          <VscGraphLine />
          Add indicator
        </button>

        {/* Alert */}
        <button
          title="Create Alert"
          onClick={() => openModal("Alerts")}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-purple-500"
        >
          <FiPlus className="text-md" />
          Alert
        </button>

        {/* Alert */}
        <button
          title="Simulation"
          onClick={() => openModal("Simulation")}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-purple-500"
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
