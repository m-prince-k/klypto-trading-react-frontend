import React, { useState, useMemo, useEffect } from "react";
import apiService from "../../services/apiServices";

const PAGE_SIZE = 5;

export default function IndicatorBuildingListing({
  selectedCurrency,
  timeframeValue,
}) {
  const [sortField, setSortField] = useState("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  // const [openNewCharts, setOpenNewCharts] = useState(true);
  // const [showPreview, setShowPreview] = useState(true);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
  const QUOTES = ["USDT", "BTC", "ETH", "BNB", "FDUSD", "TRY"];
function splitSymbol(symbol) {
  const quote = QUOTES.find((q) => symbol.endsWith(q));
  if (!quote) return { base: symbol, quote: "UNKNOWN" };

  return {
    base: symbol.slice(0, -quote.length),
    quote,
  };
}

 async function fetchAllSymbols() {
  const res = await fetch("https://api.binance.com/api/v3/exchangeInfo");
  const data = await res.json();

  return data.symbols
    .filter((s) => s.status === "TRADING")
    .map((s) => s.symbol);
}

  // 2️⃣ Fetch OHLC for single symbol
  async function fetchOHLC(symbol) {
    const endTime = Date.now();
    const startTime = endTime - ONE_YEAR;

    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&startTime=${startTime}&endTime=${endTime}`;

    const res = await fetch(url);
    const data = await res.json();

    return data.map((k) => ({
      time: new Date(k[0]).toISOString().split("T")[0],
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
    }));
  }

  // 3️⃣ Fetch ALL coins + OHLC
  async function loadAllCoins() {
    try {
      setLoading(true);

      const symbols = await fetchAllSymbols();

      /* ✅ Browser safety limit */
      const SAFE_LIMIT = 40;
      const limitedSymbols = symbols.slice(0, SAFE_LIMIT);

      const finalData = [];

      for (const symbol of limitedSymbols) {
        try {
          const ohlc = await fetchOHLC(symbol);
          const { base, quote } = splitSymbol(symbol);

          finalData.push({
            symbol,
            baseCurrency: base,
            quoteCurrency: quote,
            ohlc,
          });
        } catch (err) {
          console.error("Failed:", symbol);
        }
      }

      setCoins(finalData);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllCoins();
  }, []);

  function handleSort(field) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  const formattedData = useMemo(() => {
    if (!coins.length) return []; // ✅ NEVER return undefined

    return coins.map((item, index) => {
      const lastCandle = item.ohlc?.[item.ohlc.length - 1];
      console.log()

      return {
        id: index + 1,
        name: item.baseCurrency,
        quote: item.quoteCurrency,
        symbol: item.symbol,
        price: Number(lastCandle?.close ?? 0),
        volume: Number(lastCandle?.volume ?? 0),
      };
    });
  }, [coins]);

  const sortedData = useMemo(() => {
    if (!formattedData.length) return [];

    return [...formattedData].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortAsc ? valA - valB : valB - valA;
    });
  }, [formattedData, sortField, sortAsc]);

  const ITEMS_PER_PAGE = 20;

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    if (!sortedData.length) return [];

    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedData, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent pb-2">
            Crypto Market
          </h1>
          <p className="text-slate-600">
            Real-time cryptocurrency trading data
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Top Controls */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-gradient-to-r from-white to-slate-50/30">
            {/* Export Buttons */}
            <div className="flex gap-3">
              {["Copy", "CSV", "Excel"].map((btn) => (
                <button
                  key={btn}
                  className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
                >
                  <span className="relative z-10">{btn}</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </button>
              ))}
            </div>

            {/* Toggles */}
            {/* <div className="flex gap-6">
            <Toggle label="Show Favorites" />
            <Toggle label="Dark Mode"  />
          </div> */}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                  <Header label="ID" onClick={() => handleSort("id")} />
                  <Header label="Name" onClick={() => handleSort("name")} />
                  <Header label="Symbol" onClick={() => handleSort("symbol")} />
                  <Header label="Price" onClick={() => handleSort("price")} />
                  <Header label="Volume" onClick={() => handleSort("volume")} />
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr
                    key={row.id}
                    className="group border-b border-slate-100 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold text-sm group-hover:from-purple-100 group-hover:to-indigo-100 group-hover:text-purple-700 transition-all duration-200">
                        {row.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30">
                          {(row.name ?? "--").slice(0, 2)}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-base">
                            {row.name}
                          </span>
                          <span className="text-slate-300 font-light">/</span>
                          <span className="text-slate-600 font-medium">
                            {row.quote}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 rounded-lg hover:from-purple-200 hover:to-purple-100 transition-all duration-200 border border-purple-200/50 hover:shadow-md hover:shadow-purple-500/20 hover:-translate-y-0.5">
                          {row.symbol}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <span className="font-bold text-slate-900 ">
                        ${row.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-semibold">
                          {row.volume.toLocaleString()}
                        </span>
                        {/* <span className="text-xs text-slate-500">Volume</span> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-slate-50/50 to-white border-t border-slate-200/50">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="group px-5 py-2.5 rounded-xl bg-white border-2 border-slate-200 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-slate-700 hover:text-purple-600 disabled:hover:text-slate-700 hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Prev
              </span>
            </button>

            <div className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30">
              Page {page} / {totalPages}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="group px-5 py-2.5 rounded-xl bg-white border-2 border-slate-200 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-slate-700 hover:text-purple-600 disabled:hover:text-slate-700 hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <span className="flex items-center gap-2">
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );

  /* ---------------- Header Cell ---------------- */
  function Header({ label, onClick }) {
    return (
      <th
        onClick={onClick}
        className="group px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-purple-600 transition-all duration-200 select-none"
      >
        <div className="flex items-center gap-2">
          {label}
          <svg
            className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-all duration-200 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </div>
      </th>
    );
  }

  /* ---------------- Toggle ---------------- */
  function Toggle({ label, enabled, setEnabled }) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setEnabled(!enabled)}
          className={`
          relative w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out
          ${
            enabled
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/40"
              : "bg-slate-300 shadow-inner"
          }
          hover:scale-105 active:scale-95
        `}
        >
          <div
            className={`
            w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out
            ${enabled ? "translate-x-7" : "translate-x-0"}
          `}
          >
            <div
              className={`
            absolute inset-0 rounded-full transition-opacity duration-300
            ${enabled ? "opacity-100" : "opacity-0"}
          `}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 blur-sm opacity-50" />
            </div>
          </div>
        </button>
        <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
          {label}
        </span>
      </div>
    );
  }
}
