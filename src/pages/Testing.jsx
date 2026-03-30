import React, { useState, useMemo } from "react";
import ReactPaginate from "react-paginate";

/* ================= DATA ================= */

const dataSource = {
  "1d": [
    {
      symbol: "BTCUSDT",
      base: "BTC",
      time: 1618531200,
      open: 63158.74,
      high: 63520.61,
      low: 60000,
      close: 61334.8,
      volume: 91764.13,
      rsi: 56.84,
      status: true,
    },
    {
      symbol: "BTCUSDT",
      base: "BTC",
      time: 1618617600,
      open: 61334.81,
      high: 62506.05,
      low: 59580.91,
      close: 60006.66,
      volume: 58912.25,
      rsi: 52.38,
      status: true,
    }
  ],

  "6h": [
    {
      symbol: "BTCUSDT",
      base: "BTC",
      time: 1617364800,
      open: 59542.78,
      high: 59624.86,
      low: 58827.66,
      close: 59180.02,
      volume: 11557.49,
      ema: 58982.35,
      status: true,
    },
    {
      symbol: "BTCUSDT",
      base: "BTC",
      time: 1617386400,
      open: 59180.02,
      high: 59280.45,
      low: 58428.57,
      close: 58950.01,
      volume: 9445.69,
      ema: 58975.88,
      status: true,
    }
  ]
};

/* ================= SYMBOL LIST (🔥 ADD THIS) ================= */

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];

/* ================= COMPONENT ================= */

export default function OHLCVTable() {
  const [timeframe, setTimeframe] = useState("1d");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);

  const timeframes = Object.keys(dataSource);

  /* ================= MERGE + MULTI SYMBOL ================= */

  const mergedData = useMemo(() => {
    let finalData = [];

    const process = (arr, tf) =>
      arr.flatMap((item) =>
        symbols.map((sym) => ({
          ...item,
          symbol: sym, // 🔥 override symbol
          base: sym.replace("USDT", ""),
          timeframe: tf,
        }))
      );

    if (timeframe === "ALL") {
      timeframes.forEach((tf) => {
        finalData = [...finalData, ...process(dataSource[tf], tf)];
      });
    } else {
      finalData = process(dataSource[timeframe], timeframe);
    }

    return finalData.sort((a, b) => b.time - a.time);
  }, [timeframe]);

  /* ================= PAGINATION ================= */

  const totalRecords = mergedData.length;
  const totalPages = Math.ceil(totalRecords / limit);

  const paginatedData = useMemo(() => {
    const start = page * limit;
    return mergedData.slice(start, start + limit);
  }, [mergedData, page, limit]);

  /* ================= DYNAMIC COLUMNS ================= */

  const columns = useMemo(() => {
    const allKeys = new Set();

    mergedData.forEach((row) => {
      Object.keys(row).forEach((key) => allKeys.add(key));
    });

    return Array.from(allKeys);
  }, [mergedData]);

  /* ================= UI ================= */

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>

      <style>{`
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        .table th {
          background: #f5f5f5;
        }
        .controls {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        .pagination {
          display: flex;
          list-style: none;
          gap: 5px;
          padding: 0;
        }
        .page-link {
          padding: 6px 12px;
          border: 1px solid #ccc;
          cursor: pointer;
          background: white;
        }
        .active .page-link {
          background: #007bff;
          color: white;
        }
        .disabled .page-link {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <h2>OHLCV Data (Chartink Style)</h2>

      {/* CONTROLS */}
      <div className="controls">
        <select
          value={timeframe}
          onChange={(e) => {
            setTimeframe(e.target.value);
            setPage(0);
          }}
        >
          <option value="ALL">ALL</option>
          {timeframes.map((tf) => (
            <option key={tf} value={tf}>
              {tf}
            </option>
          ))}
        </select>

        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(0);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* TABLE */}
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, i) => (
            <tr
              key={i}
              style={{
                color: row.close > row.open ? "green" : "red",
              }}
            >
              {columns.map((col) => (
                <td key={col}>
                  {col === "time"
                    ? new Date(row[col] * 1000).toLocaleString()
                    : row[col] !== undefined && row[col] !== null
                    ? typeof row[col] === "number"
                      ? row[col].toFixed(2)
                      : row[col].toString()
                    : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* INFO */}
      <div style={{ marginTop: "10px" }}>
        Page <b>{page + 1}</b> of <b>{totalPages}</b> | Total:{" "}
        <b>{totalRecords}</b>
      </div>

      {/* PAGINATION */}
      <ReactPaginate
        previousLabel={"Prev"}
        nextLabel={"Next"}
        breakLabel={"..."}
        pageCount={totalPages}
        onPageChange={(e) => setPage(e.selected)}
        forcePage={page}
        containerClassName={"pagination"}
        pageLinkClassName={"page-link"}
        activeClassName={"active"}
        disabledClassName={"disabled"}
      />
    </div>
  );
}
