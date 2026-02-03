import {
  FiEyeOff,
  FiClock,
  FiX,
  FiTrendingUp,
  FiPlus,
} from "react-icons/fi";
import { BsBarChartFill } from "react-icons/bs";

const TIMEFRAMES = ["O:32", "H:33", "L:34", "C:31", "V:43"];

export default function ChartHeader({
//   symbol = "BTC / USDT",
  exchange = "BIOFIlCHEM",
  price = 0,
  changePercent = 0,
  timeframe = "1m",
  onTimeframeChange,
}) {
  const isPositive = changePercent >= 0;

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-1.5  bg-slate-950  ">
       <div className="flex items-center gap-5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg w-full max-w-4xl">
      
      {/* LEFT */}
      <button className="flex items-center gap-1 text-xs text-slate-300 hover:text-white">
        <FiEyeOff className="text-sm" />
        Hide chart pop-up
      </button>

      {/* CENTER */}
      <div className="flex items-center gap-2">
        {/* Timeframe Filter */}
        <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-purple-600/20 text-purple-400 border border-purple-500">
          <FiClock className="text-sm" />
          Timeframe : Filters
          <FiX className="ml-1 cursor-pointer hover:text-purple-300" />
        </div>

        {/* Candlestick */}
        <button className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700">
          <BsBarChartFill className="text-sm" />
          Candlestick
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-500">
          <FiPlus className="text-sm" />
          Add indicator
        </button>

        <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-blue-600 rounded-md">
          71
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 justify-start">
         {/* LEFT: Symbol */}
      <div>
        {/* <div className="text-sm font-semibold text-slate-100">
          {symbol}
        </div> */}
        <div className="text-[11px] text-slate-400">
          {exchange} : DAILY: 
        </div>
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

      {/* RIGHT: Price
      <div className="text-right">
        <div className="text-sm font-semibold text-slate-100">
          ${price.toLocaleString()}
        </div>
        <div
          className={`text-xs font-medium ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? "+" : ""}
          {changePercent}%
        </div>
      </div> */}

    </div>
   
      
    </div>
  );
}
