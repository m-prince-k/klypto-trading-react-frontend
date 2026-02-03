import { FiClock, FiX, FiPlus } from "react-icons/fi";
import { VscGraphLine } from "react-icons/vsc";
import { BsBarChartFill } from "react-icons/bs";
import { useState } from "react";
import { ListingModal } from "./ListingModal";

const TIMEFRAMES = ["O:32", "H:33", "L:34", "C:31", "V:43"];

export default function ChartHeader({
  //   symbol = "BTC / USDT",
  exchange = "BIOFIlCHEM",
  price = 0,
  changePercent = 0,
  timeframe = "1m",
  onTimeframeChange,
}) {
  // const isPositive = changePercent >= 0;
  const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"];

  const TIMEFRAMES = [
    "Today",
    "1 Week",
    "1 Month",
    "3 Months",
    "6 Months",
    "1 Year",
  ];
  
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

  return (
    <div className="w-full justify-startflex flex-col items-center gap-3 py-1.5 bg-slate-950  ">
      <div className="flex gap-3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg  ">
        {/* Name */}
        <button
          onClick={() => openModal("Symbol Search", SYMBOLS)}
          className="flex items-center gap-1 text-xs bg-slate-300 text-slate-900 px-2 py-1 rounded-md hover:bg-slate-400"
        >
          Name
        </button>

        {/* TineFrame */}
        <button className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-purple-600/20 text-purple-400 border border-purple-500">
          <FiClock className="text-sm" />
          Timeframe{" "}
        </button>

        {/* Candlestick */}
        <button className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700">
          <BsBarChartFill className="text-sm" />
          Candlestick
        </button>

        {/* Indicator */}
        <button
          onClick={() => openModal("Indicators")}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-500"
        >
          <VscGraphLine />
          Add indicator
        </button>

        {/* Alert */}
        <button onClick={() => openModal("Alerts")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-purple-500">
          <FiPlus className="text-md" />
          Alert
        </button>

        {/* Alert */}
        

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
      />
    </div>
  );
}
