import { FiPlus } from "react-icons/fi";
import { VscGraphLine } from "react-icons/vsc";
import { BsBarChartFill } from "react-icons/bs";
import { useState, useEffect } from "react";
import { ListingModal } from "./ListingModal";
import apiService from "../../services/apiServices";

const TIMEFRAMES = ["O:32", "H:33", "L:34", "C:31", "V:43"];

export default function ChartHeader({
  exchange = "BIOFIlCHEM",
  onTimeframeChange,
  setTimeframeValue,
  setRangeValue,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [timeframe, setTimeframe] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(100);
  const [selectedCurrency, setSelectedCurrency] = useState("BTC")

  const RANGES = [1, 10, 100, 1000];
  const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"];

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

      console.log("timeframe response", response);

      setTimeframe(response.data);
      setTimeframeValue(value);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch timeframes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open === true) return;
    fetchTimeframe();
  }, []);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="w-full justify-startflex flex-col items-center gap-3 py-1.5 bg-slate-950  ">
      <div className="flex gap-3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg  ">
        {/* Name */}
        <button
          onClick={() => openModal("Symbol Search")}
          className=" bg-slate-900 px-2 w-10 text-xs rounded-md text-white border"
        >
          {selectedCurrency}
        </button>

        {/* TimeFrame */}
        <div className="inline-flex items-center gap-1">
          <select
            value={value}
            onChange={(e) => handleChange(e)}
            className="px-2 py-1 w-36 text-sm rounded-md bg-slate-50 text-slate-900 border"
          >
            <option value="" disabled>
              Timeframe
            </option>

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
                      value={item?.seconds}
                      className="text-sm text-slate-900"
                    >
                      {item?.label}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>

          {RANGES?.map((r, i) => (
            <>
              <small className="badge badge-success text-white">
                {i === 0
                  ? "1 Range"
                  : i === 1
                    ? "10 Range"
                    : i === 2
                      ? "100 Range"
                      : "1000 Range"}
              </small>
              <button
                key={i}
                onClick={(e) => setRangeValue(r)}
                style={{
                  padding: "4px 10px",
                  background: range === r ? "#2563eb" : "#1e293b",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            </>
          ))}
        </div>
        {/* -------------------------------------------------------------ADD CANDLE charts------------------- */}
        {/* Candlestick */}
        {/* <select
                value={"line"}
                onChange={(e) => setChartType("line")}
                style={{ marginBottom: "10px" }}
            >
                <option value="candlestick">Candlestick</option>
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="area">Area</option>
                <option value="baseline">Baseline</option>
                <option value="histogram">Histogram (Volume)</option>
                  <option value="custom">Custom Series</option>
            </select> */}

        {/* Indicator */}
        <button
          onClick={() => openModal("Indicators")}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-500"
        >
          <VscGraphLine />
          Add indicator
        </button>

        {/* Alert */}
        <button
          onClick={() => openModal("Alerts")}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-purple-500"
        >
          <FiPlus className="text-md" />
          Alert
        </button>

        {/* Alert */}
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-purple-500">
          <FiPlus className="text-md" />
          Simulation
        </button>
      </div>

      <div className="flex px-2 items-center gap-2 justify-start">
        {/* LEFT: Symbol */}
        <div>
          <div className="text-sm text-slate-400">{exchange} : DAILY:</div>
        </div>

        {/* CENTER: Timeframes */}
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-1 text-xs transition
              ${
                tf === timeframe
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <ListingModal
        isOpen={modalConfig.open}
        onClose={closeModal}
        title={modalConfig.title}
        items={modalConfig.items}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}

      />
    </div>
  );
}
