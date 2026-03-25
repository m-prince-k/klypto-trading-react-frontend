import React, { useState, useMemo, useEffect } from "react";
import apiService from "../../services/apiServices";
import { Spinner } from "../tradingModals/Spinner";
import MiniChart from "./MiniChart";
import { handleCopy, handleCSVDownload, handleExcelDownload } from "../../util/common";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { Loader,ArrowUp ,ArrowDown } from "lucide-react";


export default function IndicatorBuildingListing({
  selectedCurrency,
  timeframeValue,
}) {

  const [data, setData] = useState([]);
  const itemsPerPage = 10;

  const [pageCount, setPageCount] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [itemOffset, setItemOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [limit] = useState(10);
  const [showPreview, setShowPreview] = useState(true);
  const [coins, setCoins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRec, setTotalRec] = useState(0);
    const [sortKey, setSortKey] = useState({ key: "", order: "ASC" });
  const [active, setActive] = useState({
    isActive1: true,
    isActive2: true,
    isActive3: true,
    isActive4: true,
    isActive5: true,
  });



  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      let response;
       if (sortKey?.key && sortKey?.order) {
        response =  response = await axios.post(
          `https://loiteringly-homeliest-breana.ngrok-free.dev/api/scannerDetail?symbol=${selectedCurrency}&interval=${timeframeValue}&page=${currentPage}&limit=${itemsPerPage}&sortField=${sortKey.key}&sortOrder=${sortKey?.order}`,
          {
            rules: [
              { indicator: "rsi", operator: "<", value: 30 }
            ]
          }
        );
      } else {
        response = await axios.post(
          `https://loiteringly-homeliest-breana.ngrok-free.dev/api/scannerDetail?symbol=${selectedCurrency}&interval=${timeframeValue}&page=${currentPage}&limit=${itemsPerPage}`,
          {
            rules: [
              { indicator: "rsi", operator: "<", value: 30 }
            ]
          }
        );
      }

      console.log(response?.data?.data, "-----------------------09657898567_______________________")

      setData(await response?.data?.data || []);
      setTotalRec(await response.data.totalPages || 0);
      // setCurrentPage(await response.data.page || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchData(currentPage);
  }, [selectedCurrency, timeframeValue, currentPage, itemsPerPage,sortKey?.key, sortKey?.order]);

  const onSortChange = (key, order) => {
    if (order == "ASC" && key == "symbol") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "DESC",
      }));

      setActive((prev) => ({ ...prev, isActive1: false }));
    } else if (order == "DESC" && key == "symbol") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "ASC",
      }));
      setActive((prev) => ({ ...prev, isActive1: true }));
    }


    if (order == "ASC" && key == "base") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "DESC",
      }));

      setActive((prev) => ({ ...prev, isActive2: false }));
    } else if (order == "DESC" && key == "base") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "ASC",
      }));
      setActive((prev) => ({ ...prev, isActive2: true }));
    }


     if (order == "ASC" && key == "close") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "DESC",
      }));

      setActive((prev) => ({ ...prev, isActive3: false }));
    } else if (order == "DESC" && key == "close") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "ASC",
      }));
      setActive((prev) => ({ ...prev, isActive3: true }));
    }


      if (order == "ASC" && key == "high") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "DESC",
      }));

      setActive((prev) => ({ ...prev, isActive4: false }));
    } else if (order == "DESC" && key == "high") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "ASC",
      }));
      setActive((prev) => ({ ...prev, isActive4: true }));
    }


     if (order == "ASC" && key == "low") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "DESC",
      }));

      setActive((prev) => ({ ...prev, isActive5: false }));
    } else if (order == "DESC" && key == "low") {
      setSortKey((prevState) => ({
        ...prevState,
        key: key,
        order: "ASC",
      }));
      setActive((prev) => ({ ...prev, isActive5: true }));
    }


  };




  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(data?.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(totalRec / itemsPerPage));
  }, [itemOffset, itemsPerPage, data]);

  const handlePageClick = (event) => {
    const nextPage = event.selected + 1;
    const newOffset = (nextPage * itemsPerPage) % data?.length;
    setItemOffset(newOffset);
    setCurrentPage(nextPage);
  };

  // useEffect(() => {
  //   loadAllCoins();
  // }, []);

  // useEffect(() => {
  //   async function scan() {
  //     const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];
  //     const out = [];

  //     for (let s of symbols) {
  //       const candles = await fetchOHLC(s);
  //       const closes = candles.map((c) => c.close);
  //       const rsi = calcRSI(closes);

  //       if (rsi >= 10) {
  //         const last = candles[candles.length - 1];
  //         out.push({
  //           symbol: s,
  //           rsi: rsi.toFixed(2),
  //           ...last,
  //         });
  //       }
  //     }
  //     setRows(out);
  //   }
  //   scan();
  // }, []);

  // function calcRSI(closes, period = 14) {
  //   let gain = 0,
  //     loss = 0;
  //   for (let i = closes.length - period; i < closes.length; i++) {
  //     const diff = closes[i] - closes[i - 1];
  //     diff >= 0 ? (gain += diff) : (loss -= diff);
  //   }
  //   if (loss === 0) return 100;
  //   const rs = gain / loss;
  //   return 100 - 100 / (1 + rs);
  // }

  // const formattedData = useMemo(() => {
  //   if (!coins.length) return []; // ✅ NEVER return undefined

  //   return coins.map((item, index) => {
  //     const lastCandle = item.ohlc?.[item.ohlc.length - 1];

  //     return {
  //       id: index + 1,
  //       name: item.baseCurrency,
  //       quote: item.quoteCurrency,
  //       symbol: item.symbol,
  //       price: Number(lastCandle?.close ?? 0),
  //       volume: Number(lastCandle?.volume ?? 0),
  //     };
  //   });
  // }, [coins]);


  return (
    <>


      <div className="container-fluid p-0 m-0">
        <div className="row">
          <div className="col-md-12 mt-5">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent pb-2">
                Crypto Market
              </h1>
              <p className="text-slate-600">
                Real-time cryptocurrency trading data
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Top Controls */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-gradient-to-r from-white to-slate-50/30">
                {/* Export Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopy(data)}
                    className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
                  >
                    <span className="relative z-10">Copy</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </button>

                  <button
                    onClick={() => handleCSVDownload(data)}
                    className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
                  >
                    <span className="relative z-10">CSV</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </button>

                  <button
                    onClick={() => handleExcelDownload(data)}
                    className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
                  >
                    <span className="relative z-10">Excel</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </button>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  {/* <Toggle label="Open New Charts" /> */}
                  <Toggle
                    label="Show Chart Preview"
                    enabled={showPreview}
                    setEnabled={setShowPreview}
                  />
                </div>
              </div>

              {/* dummy dataa */}
              <div style={{ padding: "20px" }}>
                <h2>Scanner Data</h2>

                <div className="table-wrapper" style={{ position: "relative" }}>
                  {/* Loader Overlay */}
                  {loading && (
                    <div
                      className="loader-overlay"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(255,255,255,0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                      }}
                    >
                      <Loader size={48} className="animate-spin" />
                    </div>
                  )}

                  {/* Table */}
                  <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>Sr.</th>
                        <th>Symbol
                          {active?.isActive1 ? (
                       <ArrowUp size={16}  onClick={() => onSortChange("symbol", "ASC")} />
                      ) : (
                        <ArrowDown size={16} onClick={() => onSortChange("symbol", "DESC")} />
                      )}
                        </th>
                        <th>Base
                          {active?.isActive2 ? (
                       <ArrowUp size={16} onClick={() => onSortChange("base", "ASC")} />
                      ) : (
                        <ArrowDown size={16} onClick={() => onSortChange("base", "DESC")} />
                      )}
                        </th>
                        <th>Close
                          {active?.isActive3 ? (
                       <ArrowUp size={16} onClick={() => onSortChange("symbol", "ASC")} />
                      ) : (
                        <ArrowDown size={16} onClick={() => onSortChange("symbol", "DESC")} />
                      )}
                        </th>
                        <th>High
                          {active?.isActive4 ? (
                       <ArrowUp size={16} onClick={() => onSortChange("high", "ASC")} />
                      ) : (
                        <ArrowDown size={16} onClick={() => onSortChange("high", "DESC")} />
                      )}
                        </th>
                        <th>Low
                          {active?.isActive5 ? (
                       <ArrowUp size={16} onClick={() => onSortChange("low", "ASC")} />
                      ) : (
                        <ArrowDown size={16} onClick={() => onSortChange("low", "DESC")} />
                      )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && data?.length > 0 ? (
                        data.map((row, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{row.symbol}</td>
                            <td>{row.base}</td>
                            <td>{row.close}</td>
                            <td>{row.high}</td>
                            <td>{row.low}</td>
                          </tr>
                        ))
                      ) : (
                        !loading && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", color: "red", padding: "20px" }}>
                              <strong>Data Not Found</strong>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {!loading && data?.length > 0 && (
                    <ul className="flex justify-end mt-4 pagination">
                      <ReactPaginate
                        nextLabel="Next>"
                        onPageChange={(event) => handlePageClick(event)}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={2}
                        pageCount={pageCount}
                        previousLabel="< Previous"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
                        breakLabel="..."
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
                        containerClassName="pagination"
                        activeClassName="active"
                        renderOnZeroPageCount={null}
                      />
                    </ul>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>


      {/* <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-8"> */}
      {/* <div className="max-w-7xl mx-auto"> */}
      {/* Header Section */}



      {/* </div> */}

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
      {/* </div> */}
    </>
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
          relative w-14 h-7 flex items-center rounded-5 p-1 transition-all duration-300 ease-in-out
          ${enabled
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/40"
              : "bg-slate-300 shadow-inner"
            }
          hover:scale-105 active:scale-95
        `}
        >
          <div
            className={`
            w-5 h-5 bg-white rounded-5 shadow-lg transition-all duration-300 ease-in-out
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
