import React, { useState, useMemo, useEffect } from "react";
import ReactPaginate from "react-paginate";
import apiService from "../../services/apiServices";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Form, Table, Spinner, Badge, Card } from "react-bootstrap";
import {
  handleCopy,
  handleCSVDownload,
  handleExcelDownload,
} from "../../util/common";

/* ================= SYMBOL LIST ================= */
const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];

/* ================= COMPONENT ================= */
export default function OHLCVTable({
  selectedCurrency,
  timeframeValue,
  rules,
  runScanTrigger,
  listingTimeframe,
}) {
  const [timeframe, setTimeframe] = useState("1d");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState({});
  const [search, setSearch] = useState("");

  const timeframes = useMemo(() => {
    return dataSource && typeof dataSource === "object"
      ? Object.keys(dataSource)
      : [];
  }, [dataSource]);

  useEffect(() => {
    fetchData();
  }, [runScanTrigger, selectedCurrency, timeframeValue]);

  const fetchData = async () => {
    setLoading(true);
    const formattedRules = rules?.map((rule) => ({
      indicator: rule.indicator.toLowerCase(),
      operator: rule.operator,
      value: rule.value,
      timeframe: rule.timeframe,
      length: rule.period,
    }));
    try {
      const response = await apiService.post(
        `/api/scannerDetail?symbol=${selectedCurrency}&interval=${timeframeValue}`,
        { rules: formattedRules },
      );
      const fullData = response?.data || {};
      setDataSource(fullData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataSource({});
    } finally {
      setLoading(false);
    }
  };

  /* ================= MERGED DATA ================= */
  const mergedData = useMemo(() => {
    if (!dataSource || typeof dataSource !== "object") return [];
    let finalData = [];
    const process = (arr, tf) =>
      arr?.flatMap((item) =>
        symbols.map((sym) => ({
          ...item,
          symbol: sym,
          base: sym.replace("USDT", ""),
          timeframe: tf,
        })),
      );
    if (timeframe === "ALL") {
      timeframes.forEach((tf) => {
        if (dataSource[tf]) {
          finalData = [...finalData, ...process(dataSource[tf], tf)];
        }
      });
    } else {
      finalData = process(dataSource[timeframe], timeframe) || [];
    }
    return finalData.sort((a, b) => b.time - a.time);
  }, [dataSource, timeframe, timeframes]);

  /* ================= PAGINATION ================= */
  const filteredData = useMemo(() => {
    if (!search.trim()) return mergedData;
    const q = search.trim().toLowerCase();
    return mergedData.filter((row) =>
      Object.values(row).some((val) =>
        val !== null && val !== undefined && val.toString().toLowerCase().includes(q)
      )
    );
  }, [mergedData, search]);

  const totalRecords = filteredData?.length || 0;
  const totalPages = Math.ceil(totalRecords / limit);
  const paginatedData = useMemo(() => {
    if (!filteredData) return [];
    const start = page * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  /* ================= COLUMNS ================= */
  const columns = useMemo(() => {
    if (!mergedData || !Array.isArray(mergedData)) return [];
    const allKeys = new Set();
    mergedData.forEach((row) => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((key) => allKeys.add(key));
      }
    });
    return Array.from(allKeys);
  }, [mergedData]);

  useEffect(() => {
    setPage(0);
  }, [limit, timeframe, search]);

  return (
    <Container fluid className="py-4 px-4" style={{ background: "#f0f2f5", minHeight: "100vh" }}>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-0 fw-semibold text-dark">OHLCV Data</h4>

        </div>

        {/* Export Buttons */}
        <div className="d-flex gap-2">
          <button
            onClick={() => handleCopy(dataSource)}
            className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
          >
            <span className="relative z-10">Copy</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => handleCSVDownload(dataSource)}
            className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
          >
            <span className="relative z-10">CSV</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => handleExcelDownload(dataSource)}
            className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 font-medium"
          >
            <span className="relative z-10">Excel</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">

          {/* Controls Row */}
          <div className="d-flex align-items-center gap-3 px-3 py-3 border-bottom bg-white rounded-top">
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 200 }}
            />
            <Form.Select
              size="sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{ maxWidth: 130 }}
            >
              <option value="ALL">All Timeframes</option>
              {timeframes.map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </Form.Select>

            <Form.Select
              size="sm"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{ maxWidth: 110 }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={30}>30 / page</option>
            </Form.Select>

            <small className="text-muted ms-auto">
              Page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong>
              &nbsp;&middot;&nbsp;
              <strong>{totalRecords}</strong> total
            </small>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle" style={{ fontSize: "0.875rem" }}>
              <thead style={{ background: "#212529", color: "#fff" }}>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="fw-semibold py-3 px-3"
                      style={{ whiteSpace: "nowrap", letterSpacing: "0.03em", fontSize: "0.75rem" }}
                    >
                      {col.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-5">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span className="text-muted">Loading data…</span>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-5 text-muted">
                      No data available
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, i) => {
                    const isBullish = row?.close > row?.open;
                    return (
                      <tr
                        key={i}
                        style={{
                          color: isBullish ? "#198754" : "#dc3545",
                          background: i % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        {columns.map((col) => (
                          <td key={col} className="px-3 py-2" style={{ whiteSpace: "nowrap" }}>
                            {col === "time"
                              ? row[col]
                                ? new Date(row[col] * 1000).toLocaleString()
                                : "-"
                              : row[col] !== undefined && row[col] !== null
                                ? typeof row[col] === "number"
                                  ? row[col].toFixed(2)
                                  : row[col].toString()
                                : "-"}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-end px-3 py-3 border-top bg-white rounded-bottom">
            <ReactPaginate
              previousLabel={"← Prev"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={totalPages || 1}
              onPageChange={(e) => setPage(e.selected)}
              forcePage={page}
              containerClassName={"pagination mb-0"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              activeClassName={"active"}
              disabledClassName={"disabled"}
            />
          </div>

        </Card.Body>
      </Card>
    </Container>
  );
}