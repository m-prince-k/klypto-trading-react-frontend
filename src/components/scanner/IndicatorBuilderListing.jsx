import React, { useState, useMemo, useEffect } from "react";
import apiService from "../../services/apiServices";
import ReactPaginate from "react-paginate";
import { Loader, ArrowUp, ArrowDown } from "lucide-react";
import {
  handleCopy,
  handleCSVDownload,
  handleExcelDownload,
} from "../../util/common";

export default function IndicatorBuildingListing({
  selectedCurrency,
  timeframeValue,
  rules,
  runScanTrigger,
  listingTimeframe,
}) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTF, setSelectedTF] = useState(listingTimeframe || "1d");
  const [limitValue, setLimitValue] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPreview, setShowPreview] = useState(true);

  const [sortKey, setSortKey] = useState({ key: "", order: "ASC" });
  const [active, setActive] = useState({
    isActive1: true,
    isActive2: true,
    isActive3: true,
    isActive4: true,
    isActive5: true,
  });

  /* ================= TIMEFRAMES FROM RULES ================= */
  const ruleTimeframes = useMemo(() => {
    if (!rules || !rules.length) return [];
    return [...new Set(rules.map((r) => r.timeframe))];
  }, [rules]);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchData();
  }, [runScanTrigger, currentPage, selectedTF]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const formattedRules = rules.map((rule) => ({
        indicator: rule.indicator.toLowerCase(),
        operator: rule.operator,
        value: rule.value,
        timeframe: rule.timeframe,
        length: rule.period,
      }));

      const response = await apiService.post(
        `/api/scannerDetail?symbol=${selectedCurrency}&interval=${timeframeValue}&page=${currentPage}&limit=${limitValue}`,
        { rules: formattedRules },
      );

      setData(response?.data || {});
    } catch (err) {
      console.error(err);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  /* ================= CURRENT DATA ================= */
  const tableData = useMemo(() => {
    if (!data) return [];

    if (selectedTF === "ALL") {
      let merged = [];

      Object.keys(data || {}).forEach((tf) => {
        if (Array.isArray(data[tf])) {
          merged.push(
            ...data[tf].map((item) => ({
              ...item,
              timeframe: tf,
            })),
          );
        }
      });

      return merged;
    }

    return data?.[selectedTF] || [];
  }, [data, selectedTF]);

  /* ================= PAGINATION ================= */
  const totalPages =
    selectedTF === "ALL"
      ? Math.ceil(tableData.length / limitValue)
      : data?.totalPages?.[selectedTF] || 0;

  const handlePageChange = (e) => {
    setCurrentPage(e.selected + 1);
  };

  /* ================= SORT ================= */
  const onSortChange = (key, order) => {
    setSortKey({ key, order: order === "ASC" ? "DESC" : "ASC" });
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="container-fluid p-0 m-0">
        <div className="row">
          <div className="col-md-12 mt-5">
            <h1 className="text-4xl font-bold text-purple-600">
              Crypto Market
            </h1>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl mt-4">
          {/* TOP BUTTONS */}
          <div className="flex justify-between p-4 border-b">
            {/* Export Buttons */}{" "}
            <div className="flex gap-3">
              {" "}
              <button
                onClick={() => handleCopy(data)}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
              >
                {" "}
                <span className="relative z-10">Copy</span>{" "}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />{" "}
              </button>{" "}
              <button
                onClick={() => handleCSVDownload(data)}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
              >
                {" "}
                <span className="relative z-10">CSV</span>{" "}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />{" "}
              </button>{" "}
              <button
                onClick={() => handleExcelDownload(data)}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
              >
                {" "}
                <span className="relative z-10">Excel</span>{" "}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />{" "}
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div style={{ padding: "20px", position: "relative" }}>
            {loading && (
              <div className="absolute w-full h-full flex justify-center items-center bg-white/60 z-10">
                <Loader className="animate-spin" />
              </div>
            )}

            <table
              border="1"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Symbol</th>
                  <th>Base</th>
                  <th>Close</th>
                  <th>High</th>
                  <th>Low</th>
                </tr>
              </thead>

              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{row.symbol}</td>
                      <td>{row.base}</td>
                      <td>{row.close}</td>
                      <td>{row.high}</td>
                      <td>{row.low}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No Data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ================= BOTTOM CONTROLS ================= */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "15px",
                alignItems: "center",
              }}
            >
              {/* LEFT DROPDOWNS */}
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  value={selectedTF}
                  onChange={(e) => {
                    setSelectedTF(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">ALL</option>
                  {ruleTimeframes.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>

                <select
                  value={limitValue}
                  onChange={(e) => {
                    setLimitValue(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[10, 25, 50, 100].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* RIGHT PAGINATION */}
              <ReactPaginate
                previousLabel={"<"}
                nextLabel={">"}
                pageCount={totalPages}
                onPageChange={handlePageChange}
                containerClassName={"pagination"}
                pageLinkClassName={"page-link"}
                activeClassName={"active"}
              />
            </div>

            {/* RECORD INFO */}
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              Showing <b>{tableData.length}</b> records
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
