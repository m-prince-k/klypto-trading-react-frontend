import React, { useState, useMemo, useEffect } from "react";
import ReactPaginate from "react-paginate";
import apiService from "../../services/apiServices";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Badge } from "react-bootstrap";
import { Container, Table, Spinner, Card, Form } from "react-bootstrap";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import {
  handleCopy,
  handleCSVDownload,
  handleExcelDownload,
  symbols,
} from "../../util/common";
import { comma } from "postcss/lib/list";

/* ================= SYMBOL LIST ================= */

export default function OHLCVTable({
  selectedCurrency,
  timeframeValue,
  rules,
  runScanTrigger,
  listingTimeframe,
  selectedCurrencies,
}) {
  const [timeframe, setTimeframe] = useState("ALL"); // default ALL
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState({});
  const [search, setSearch] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const timeframes = useMemo(() => {
    return dataSource && typeof dataSource === "object"
      ? Object.keys(dataSource)
      : [];
  }, [dataSource]);

  useEffect(() => {
    fetchData();
  }, [runScanTrigger, selectedCurrency, timeframeValue]);

  const isAgoTimeframe = (tf = "") => {
    const value = tf.toLowerCase();

    console.log("Checking timeframe:", value);

    return /(\d+)(d|w|m|y|mo|q)_ago/.test(value);
  };

  const fetchData = async () => {
    setLoading(true);

    const extractAgoNumber = (tf = "") => {
      const match = tf.toLowerCase().match(/^(\d+)(d|w|m|y|mo|q)_ago$/);
      return match ? Number(match[1]) : null;
    };
    const convertTimeframe = (tf = "") => {
      const match = tf.toLowerCase().match(/^(\d+)(d|w|m|y|mo|q)_ago$/);
      if (match) {
        return `${match[1]}${match[2]}`; // e.g. 3d_ago → 3d
      }
      return tf; // e.g. daily stays daily
    };

    const formattedRules = rules?.map((rule) => {
      const isNumberRule = rule.scanner === "Number";
      const compareParams = rule.scannerParams || {};

      const basePayload = {
        indicator: rule.indicator.toLowerCase(),
        length: rule.period,
        operator: rule.operator,
        timeframe: convertTimeframe(rule.timeframe),
      };

      if (isNumberRule) {
        const agoValue = extractAgoNumber(rule.timeframe);

        return {
          ...basePayload,
          value: rule.value,
          ...(agoValue !== null && { ago: agoValue }),
        };
      }

      const agoValue = extractAgoNumber(rule.timeframe);
      const compareAgoValue = extractAgoNumber(rule.compareTimeframe);

      return {
        ...basePayload,
        ...(agoValue !== null && { ago: agoValue }),

        compareIndicator: rule.scanner?.toLowerCase(),
        compareTimeframe: convertTimeframe(rule.compareTimeframe),
        compareLength: Object.keys(compareParams).length
          ? compareParams
          : undefined,
        ...(compareAgoValue !== null && { compareAgo: compareAgoValue }),
      };
    });

    console.log("Formatted Rules:", formattedRules);

    try {
      const response = await apiService.post(
        `/api/scannerDetail?symbol=${selectedCurrency}&interval=${timeframeValue}`,
        { rules: formattedRules },
      );

      setDataSource(response?.data || {});
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataSource({});
    } finally {
      setLoading(false);
    }
  };

  const getBase = (symbol) => {
    if (symbol.endsWith("USDT")) return symbol.replace("USDT", "");
    if (symbol.endsWith("BTC")) return symbol.replace("BTC", "");
    if (symbol.endsWith("ETH")) return symbol.replace("ETH", "");
    return symbol;
  };
  /* ================= MERGED DATA ================= */
  const mergedData = useMemo(() => {
    if (!dataSource || typeof dataSource !== "object") return [];
    let finalData = [];

    console.log(selectedCurrencies, "curenciesssssssss");

    const activeCurrencies =
      selectedCurrencies && selectedCurrencies.length > 0
        ? selectedCurrencies.map((sym) => sym.value)
        : symbols;

    const process = (arr, tf) =>
      arr?.flatMap((item) =>
        activeCurrencies?.map((sym) => {
          const value = sym.value;

          const { indicators, ...rest } = item;

          return {
            ...rest, // 👈 removes indicators completely
            ...(indicators && typeof indicators === "object" ? indicators : {}),
            symbol: value,
            base: getBase(value),
            timeframe: tf,
          };
        }),
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

  /* ================= SEARCH ================= */
  const filteredData = useMemo(() => {
    if (!search.trim()) return mergedData;
    const q = search.trim().toLowerCase();
    return mergedData.filter((row) =>
      Object.values(row).some(
        (val) =>
          val !== null &&
          val !== undefined &&
          val.toString().toLowerCase().includes(q),
      ),
    );
  }, [mergedData, search]);

  /* ================= SORTING ================= */
  const sortedData = useMemo(() => {
    let data = [...filteredData].map((row, index) => ({
      ...row,
      sno: index + 1,
    }));

    if (!sortConfig.key) return data;

    return data.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });
  }, [filteredData, sortConfig]);

  const totalRecords = sortedData?.length || 0;
  const totalPages = Math.ceil(totalRecords / limit);

  const paginatedData = useMemo(() => {
    const start = page * limit;
    return sortedData.slice(start, start + limit);
  }, [sortedData, page, limit]);

  /* ================= COLUMNS ================= */
  const columns = useMemo(() => {
    if (!mergedData.length) return [];

    const priorityOrder = [
      "symbol",
      "base",
      "time",
      "open",
      "high",
      "low",
      "close",
      "volume",
    ];

    // get all keys from data
    const allKeys = new Set();
    mergedData.forEach((row) => {
      Object.keys(row || {}).forEach((key) => allKeys.add(key));
    });

    // ❌ remove unwanted
    allKeys.delete("status");
    allKeys.delete("sno");

    // ✅ indicators = everything else
    const indicatorCols = Array.from(allKeys).filter(
      (key) => !priorityOrder.includes(key) && key !== "timeframe",
    );

    return [...priorityOrder, ...indicatorCols, "timeframe"];
  }, [mergedData]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  useEffect(() => {
    setPage(0);
  }, [limit, timeframe, search]);

  return (
    <Container
      fluid
      className="py-4 px-4"
      style={{ background: "#f0f2f5", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0 fw-semibold text-dark">OHLCV Data</h4>

        <div className="d-flex gap-2">
          <button onClick={() => handleCopy(dataSource)}>Copy</button>
          <button onClick={() => handleCSVDownload(dataSource)}>CSV</button>
          <button onClick={() => handleExcelDownload(dataSource)}>Excel</button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {/* Controls */}
          <div className="d-flex align-items-center gap-3 px-3 py-3 border-bottom bg-white rounded-top">
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 200 }}
            />

            <Dropdown onSelect={(val) => setTimeframe(val)}>
              <Dropdown.Toggle size="sm" variant="light">
                {timeframe === ""
                  ? "Select Timeframe"
                  : timeframe === "ALL"
                    ? "All Timeframes"
                    : timeframe}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item eventKey="">Select Timeframe</Dropdown.Item>
                <Dropdown.Item eventKey="ALL">All Timeframes</Dropdown.Item>

                {timeframes.map((tf) => {
                  const indicatorsForTf = rules
                    ?.filter((r) => r.timeframe === tf)
                    ?.map((r) => r.indicator);

                  return (
                    <Dropdown.Item key={tf} eventKey={tf}>
                      <div className="d-flex justify-content-between w-100">
                        <span>{tf}</span>
                        <div className="d-flex gap-1">
                          {indicatorsForTf?.map((ind, i) => (
                            <Badge bg="secondary" key={i}>
                              {ind?.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>

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
              Page <strong>{page + 1}</strong> of{" "}
              <strong>{totalPages || 1}</strong>
              &nbsp;&middot;&nbsp;
              <strong>{totalRecords}</strong> total
            </small>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <Table
              hover
              className="mb-0 align-middle"
              style={{ fontSize: "0.875rem" }}
            >
              <thead style={{ background: "#212529", color: "#fff" }}>
                <tr>
                  {paginatedData.length > 0 && (
                    <th
                      onClick={() => handleSort("sno")}
                      style={{ cursor: "pointer" }}
                    >
                      Sno
                    </th>
                  )}

                  {columns.map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      style={{ cursor: "pointer", textAlign: "center" }} // optional fallback
                    >
                      <div className="d-flex align-items-center justify-content-center w-100">
                        <span>{col.toUpperCase()}</span>

                        {sortConfig.key === col &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortUp
                              style={{ marginLeft: 4, marginTop: -4 }}
                            />
                          ) : (
                            <FaSortDown
                              style={{ marginLeft: 4, marginBottom: -4 }}
                            />
                          ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center py-5"
                    >
                      <Spinner animation="border" size="sm" />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center py-5"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, i) => (
                    <tr key={i}>
                      <td>{page * limit + i + 1}</td>

                      {columns.map((col) => (
                        <td key={col}>
                          {col === "time"
                            ? new Date(row[col] * 1000).toLocaleString()
                            : typeof row[col] === "boolean"
                              ? row[col]
                                ? "True"
                                : "False"
                              : typeof row[col] === "object"
                                ? JSON.stringify(row[col]) // or "-"
                                : row[col]}
                        </td>
                      ))}
                    </tr>
                  ))
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
