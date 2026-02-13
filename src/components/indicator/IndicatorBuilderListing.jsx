import React, { useState, useMemo, useEffect } from "react";
import apiService from "../../services/apiServices";


const PAGE_SIZE = 5;

export default function IndicatorBuildingListing({ selectedCurrency, timeframeValue}) {
  const [sortField, setSortField] = useState("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [openNewCharts, setOpenNewCharts] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const [DUMMY_DATA,setDUMMY_DATA]=useState("");

async function fetchBinanceData(){
  try {
    const response = await apiService.post(`listing?symbol=${selectedCurrency}&interval=${timeframeValue}&limit=1000`);
    console.log(response,"========================-0987564567876543567865434567865435678");
    
    setDUMMY_DATA(response?.data);
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
}
  useEffect(() => {
    fetchBinanceData();
  },[]);

  function handleSort(field) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  console.log(DUMMY_DATA,"========================-0987564567876543567865434567865435678");

  const sortedData = useMemo(() => {
    return [...DUMMY_DATA].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === "string") {
        return sortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortAsc ? valA - valB : valB - valA;
    });
  }, [sortField, sortAsc]);

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);

  const paginatedData = sortedData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4">

      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

        {/* Export Buttons */}
        <div className="flex gap-2">
          {["Copy", "CSV", "Excel"].map((btn) => (
            <button
              key={btn}
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 transition"
            >
              {btn}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Toggle
            label="Open New Charts"
            enabled={openNewCharts}
            setEnabled={setOpenNewCharts}
          />
          <Toggle
            label="Show Charts Preview"
            enabled={showPreview}
            setEnabled={setShowPreview}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm dark">
          <thead>
            <tr className="text-slate-500 border-b">
              <Header label="Sr." onClick={() => handleSort("id")} />
              <Header label="Stock Name" onClick={() => handleSort("name")} />
              <Header label="Symbol" onClick={() => handleSort("symbol")} />
           
              <Header label="Price" onClick={() => handleSort("price")} />
              <Header label="Volume" onClick={() => handleSort("volume")} />
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id} className="border-b last:border-none hover:bg-slate-50">
                <td className="py-2">{row.id}</td>
                <td className="py-2 font-medium text-blue-600">{row.name}</td>
                <td className="py-2 text-blue-500">{row.symbol}</td>
                <td className="py-2 text-blue-500">P&F | F.A</td>
                <td className={`py-2 ${row.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {row.change}%
                </td>
                <td className="py-2">{row.price}</td>
                <td className="py-2">{row.volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 rounded-lg bg-slate-100 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-slate-500">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded-lg bg-slate-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ---------------- Header Cell ---------------- */

function Header({ label, onClick }) {
  return (
    <th
      onClick={onClick}
      className="py-2 text-left cursor-pointer hover:text-black transition"
    >
      {label}
    </th>
  );
}

/* ---------------- Toggle ---------------- */

function Toggle({ label, enabled, setEnabled }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => setEnabled(!enabled)}
        className={`
          w-10 h-5 flex items-center rounded-full p-1 transition
          ${enabled ? "bg-purple-600" : "bg-slate-300"}
        `}
      >
        <div
          className={`
            bg-white w-4 h-4 rounded-full shadow-md transform transition
            ${enabled ? "translate-x-5" : ""}
          `}
        />
      </div>
      {label}
    </label>
  );
}
