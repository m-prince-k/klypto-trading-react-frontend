import React, { useState, useMemo, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import apiService from "../../services/apiServices";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Badge } from "react-bootstrap";
import { Container, Table, Card, Form } from "react-bootstrap";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import {
  getAllTimeframes,
  getMaxTimeframe,
  handleCopy,
  handleCSVDownload,
  handleExcelDownload,
  symbols,
  useDebounce,
  tfToMinutes,
} from "../../util/common";
import { toast } from "react-toastify";
import axios from "axios";
import { Spinner } from "../tradingModals/Spinner";
import EditableMultiSelect from "../indicator/EditTableLabel";
import AlertModal from "./ScannerModals";

/* ================= SYMBOL LIST ================= */

export default function OHLCVTable({
  selectedCurrency,
  rules,
  logic,
  runScanTrigger,
  listingTimeframe,
  selectedCurrencies,
  setSelectedCurrencies,
  setRules,
}) {
  const [timeframe, setTimeframe] = useState(null); // null = ALL
  const [limit, setLimit] = useState(10); // actual data limit
  const [selectedLimit, setSelectedLimit] = useState(""); // dropdown UI
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState({});
  const [search, setSearch] = useState("");
  const [days, setDays] = useState(1);
  const [currencies, setCurrencies] = useState([]);
  const [error, setError] = useState(null);
  const [months, setMonths] = useState(null);
  const debouncedCurrencies = useDebounce(selectedCurrencies, 1000);
  const [fetchTimeframe, setFetchTimeframe] = useState([]);
  const [timeframeValue, setTimeframeValue] = useState("");
  const [payloadRules, setPayloadRules] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // ✅ Tracks whether the user manually picked a TF from dropdown 1
  // When true, fetchData will NOT override timeframeValue with maxTF
  const userPickedTf = useRef(false);

  // ✅ Stores a pending TF override {indicator, oldTf, newTf}
  // Applied inside fetchData so it survives the formattedRules rebuild
  const manualTfOverride = useRef(null);
  const isFetching = useRef(false);

  const timeframes = useMemo(() => {
    return dataSource && typeof dataSource === "object"
      ? Object.keys(dataSource)
      : [];
  }, [dataSource]);

  // ✅ Reset UI and tracking variables when a fresh scan is executed
  useEffect(() => {
    userPickedTf.current = false;
    manualTfOverride.current = null;
    setTimeframe({ tf: "ALL", indicator: "ALL" });
    setTimeframeValue("");
  }, [runScanTrigger]);

  useEffect(() => {
    fetchData();
  }, [
    runScanTrigger,
    selectedCurrency,
    debouncedCurrencies,
    timeframeValue,
    listingTimeframe,
    days,
    months,
  ]);

  async function fetchListingCurrencies() {
    setLoading(true);
    setError(null);

    try {
      let response = await apiService.post(`/api/getCurrencies`);
      const raw = response?.data ?? [];

      const formatted = [
        // { label: "Select Currency", value: "" },
        ...raw.map((item) => ({
          label: item.label ?? item.name ?? item.symbol,
          value: item.value ?? item.symbol ?? item.label,
        })),
      ];

      setCurrencies(formatted);
    } catch (err) {
      console.error("Currency API Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  async function fetchListingTimeframe() {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post("/api/getTimeFrames");

      const data = response?.data || {};

      setFetchTimeframe(data);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch timeframes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListingCurrencies();
    fetchListingTimeframe();
  }, []);

  const convertToDays = (tf = "") => {
    const match = tf.toLowerCase().match(/^(\d+)(d|w|m|mo|q|y)_ago$/);
    if (!match) return null;

    const value = Number(match[1]);
    const unit = match[2];

    const map = {
      d: 1,
      w: 7,
      m: 30,
      mo: 30,
      q: 90,
      y: 365,
    };

    return value * (map[unit] || 1);
  };

  const MA_INDICATORS = ["sma", "ema", "tema", "wma", "hma", "stddev", "wpr"];

  const buildObject = ({
    indicator,
    timeframe,
    params = {},
    value,
    source,
    type,
  }) => {
    const offset = convertToDays(timeframe);

    const indicatorKey = indicator?.toLowerCase();
    const isMA = MA_INDICATORS.includes(indicatorKey);

    // ✅ STRICT VALUE CHECK (NO LEAK)
    const hasValue =
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(typeof value === "number" && isNaN(value));

    // 🚀 ONLY use value if indicator is number OR explicitly entered
    if (indicatorKey === "number" && hasValue) {
      return {
        indicator: "number",
        value,
      };
    }

    // 🚀 DO NOT allow accidental value override
    if (hasValue && indicatorKey === "number") {
      return {
        indicator: indicatorKey,
        value,
      };
    }

    // 🚀 NORMAL FLOW (RSI, SMA etc)
    const obj = {
      indicator: indicatorKey,
    };

    console.log(timeframeValue, "timeeeeeeeeeeeeeeeeeeeeeeee");

    if (offset !== null) {
      obj.offset = offset;
      obj.timeframe = timeframe; // ✅ use global
    } else if (timeframe) {
      obj.timeframe = timeframe;
    }

    if (params && Object.keys(params).length > 0) {
      obj.length = {
        ...params,
        ...(isMA ? { source: (source || "close").toLowerCase() } : {}),
      };
    }

    return obj;
  };

  const fetchData = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      /* ================= VALIDATION ================= */

      let errorMessage = "";
      const comparisonOps = new Set([
        ">",
        "<",
        ">=",
        "<=",
        "==",
        "!=",
        "cross_above",
        "cross_below",
      ]);

      const hasInvalidRule = rules?.some((rule, index) => {
        const ruleNum = index + 1;

        // 1. Basic field selection checks
        if (!rule?.indicator || rule.indicator === "Select Scanner") {
          errorMessage = `Rule ${ruleNum}: Indicator not selected`;
          return true;
        }

        if (!rule?.operator || rule.operator === "Select Operation") {
          errorMessage = `Rule ${ruleNum}: Operator not selected`;
          return true;
        }

        if (!rule?.scanner || rule.scanner === "Select Scanner") {
          errorMessage = `Rule ${ruleNum}: Compare scanner not selected`;
          return true;
        }

        if (rule.operator2 === "Select Operation") {
          errorMessage = `Rule ${ruleNum}: Operator not selected`;
          return true;
        }

        if (rule.scanner2 === "Select Scanner") {
          errorMessage = `Rule ${ruleNum}: Compare scanner not selected`;
          return true;
        }

        // 2. Comparison operator count check
        let compCount = 0;
        if (comparisonOps.has(rule.operator)) compCount++;
        if (comparisonOps.has(rule.operator2)) compCount++;

        if (compCount === 0) {
          errorMessage = `Rule ${ruleNum}: One comparison operator (<, >, =, etc.) is required`;
          return true;
        }
        if (compCount > 1) {
          errorMessage = `Rule ${ruleNum}: Only one comparison operator is allowed per rule`;
          return true;
        }

        return false;
      });

      if (hasInvalidRule) {
        setAlertMsg(errorMessage);
        setShowAlert(true);
        return;
      }
      const activeRules = rules.filter((r) => !r.disabled);
      /* ================= FORMATTING ================= */

      const formattedRules = activeRules.map((rule) => {
        // ✅ helper to avoid repetition
        const createObject = (config, condition = true) =>
          condition ? buildObject({ ...config }) : null;

        const object1 = createObject({
          indicator: rule.indicator,
          timeframe: rule.timeframe,
          params: rule.indicatorParams,
          value: rule.value,
          source: rule.source,
          type: "object1",
        });

        const object2 = createObject({
          indicator: rule.scanner,
          timeframe: rule.compareTimeframe,
          params: rule.scannerParams,
          value: rule.compareValue,
          source: rule.scannerSource,
          type: "object2",
        });

        const object3 = createObject(
          {
            indicator: rule.scanner2,
            timeframe: rule.timeframe2,
            params: rule.params2,
            value: rule.value2,
            source: rule.source2,
            type: "object3",
          },
          rule.scanner2 !== undefined,
        );

        return {
          logic: rule.logic,
          object1,
          operator1: rule.operator,

          ...(object2 && { object2 }),
          ...(rule.operator2 && { operator2: rule.operator2 }),
          ...(object3 && { object3 }),
        };
      });

      // ✅ Apply manual TF override BEFORE storing payloadRules
      // Match by indicator only — oldTf goes stale when dropdown 2 is changed multiple times
      const patchedRules = manualTfOverride.current
        ? formattedRules.map((rule) => {
            const { indicator, newTf } = manualTfOverride.current;
            const updated = { ...rule };
            ["object1", "object2", "object3"].forEach((key) => {
              if (updated[key] && updated[key].indicator === indicator) {
                updated[key] = { ...updated[key], timeframe: newTf };
              }
            });
            return updated;
          })
        : formattedRules;

      // ✅ Clear override AFTER applying — prevent it from sticking on next fetchData call
      manualTfOverride.current = null;

      setPayloadRules(patchedRules);

      console.log(patchedRules, "patchedRules");

      const allTFs = getAllTimeframes(patchedRules);
      const maxTF = getMaxTimeframe(allTFs);

      // ✅ Only auto-set maxTF if user hasn't manually picked a timeframe
      if (maxTF && !userPickedTf.current) {
        setTimeframeValue(maxTF);
      }
      console.log("✅ Final Payload:", patchedRules);

      /* ================= API ================= */

      // ✅ cleaner calculation
      const totalDays = days ? days : months ? Math.round(months * 30) : null;

      if (!totalDays || !timeframeValue) return;

      const { data: result = {} } = await apiService.post(
        `/api/scannerDetail?&interval=${timeframeValue}&day=${totalDays}`,
        {
          currencies: (debouncedCurrencies || []).map((c) => c.value),
          rules: patchedRules, // ✅ use patched rules, not original formattedRules
          logic: logic,
        },
      );

      console.log("API Result:", result);

      setDataSource(result);

      const isEmpty =
        !result ||
        (Array.isArray(result) && result.length === 0) ||
        (typeof result === "object" && !Object.keys(result).length);

      if (isEmpty) {
        toast.error("No data found ❌");
      } else {
        toast.success("Scan executed successfully ✅");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataSource({});
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const flatTimeframes = useMemo(() => {
    if (!payloadRules?.length) return [];

    const list = [];

    payloadRules.forEach((rule, ruleIndex) => {
      ["object1", "object2", "object3"].forEach((key) => {
        const obj = rule[key];
        if (!obj) return;

        // ✅ Skip non-indicator types (price fields, numbers, plain values)
        const SKIP_INDICATORS = new Set([
          "number",
          "open",
          "high",
          "low",
          "close",
          "volume",
        ]);
        if (!obj.indicator || SKIP_INDICATORS.has(obj.indicator.toLowerCase()))
          return;

        // ✅ Skip objects without a timeframe (e.g. pure value comparisons)
        if (!obj.timeframe) return;

        list.push({
          tf: obj.timeframe,
          indicator: obj.indicator,
          ruleIndex, // ✅ track which rule this belongs to (for divider)
        });
      });
    });

    return list;
  }, [payloadRules]);

  const getBaseFromSymbol = (symbol = "") => {
    if (!symbol) return "";

    // Common quote assets (can expand automatically later)
    const commonQuotes = [
      "USDT",
      "BUSD",
      "USDC",
      "BTC",
      "ETH",
      "BNB",
      "TRY",
      "EUR",
      "GBP",
      "INR",
      "AUD",
    ];

    // 🔍 Step 1: try matching known quotes
    for (let quote of commonQuotes) {
      if (symbol.endsWith(quote)) {
        return symbol.slice(0, -quote.length);
      }
    }

    return symbol.slice(0, symbol.length - 4);
  };

  /* ================= MERGED DATA ================= */

  const mergedData = useMemo(() => {
    if (!dataSource || typeof dataSource !== "object") return [];

    let finalData = [];

    Object.entries(dataSource).forEach(([tf, symbolsObj]) => {
      if (!symbolsObj) return;

      Object.entries(symbolsObj).forEach(([symbol, candles]) => {
        if (!Array.isArray(candles)) return;

        candles.forEach((candle) => {
          const { indicators, ...rest } = candle || {};

          const upperSymbol = symbol.toUpperCase();

          finalData.push({
            ...rest,
            ...(indicators && typeof indicators === "object" ? indicators : {}),
            symbol: upperSymbol,
            base: getBaseFromSymbol(upperSymbol), // ✅ dynamic
            timeframe: tf,
          });
        });
      });
    });

    return finalData.sort((a, b) => b.time - a.time);
    // return finalData;
  }, [dataSource]);

  /* ================= SEARCH ================= */
  const filteredData = useMemo(() => {
    let data = mergedData;

    // ✅ APPLY FILTER ONLY WHEN a specific (non-ALL) TF+indicator is selected
    if (timeframe?.tf && timeframe?.indicator && timeframe.tf !== "ALL") {
      const indLower = timeframe.indicator.toLowerCase();
      const tfLower = timeframe.tf.toLowerCase();

      data = data.filter((row) =>
        Object.keys(row).some((k) => {
          const lowerK = k.toLowerCase();
          return lowerK.includes(indLower) && lowerK.includes(tfLower);
        }),
      );
    }

    if (!search.trim()) return data;

    const q = search.trim().toLowerCase();

    return data.filter((row) =>
      Object.values(row).some(
        (val) =>
          val !== null &&
          val !== undefined &&
          val.toString().toLowerCase().includes(q),
      ),
    );
  }, [mergedData, search, timeframe]);

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

    return data; // ✅ no sorting at all
  }, [filteredData, sortConfig]);

  const totalRecords = mergedData.length;
  const totalPages = Math.ceil(totalRecords / limit);

  const paginatedData = useMemo(() => {
    const start = page * limit;
    return sortedData.slice(start, start + limit);
  }, [sortedData, page, limit]);

  /* ================= COLUMNS ================= */
  const columns = useMemo(() => {
    if (!mergedData.length) return [];

    const baseColumns = [
      "symbol",
      "base",
      "datetime",
      "open",
      "high",
      "low",
      "close",
      "volume",
    ];

    const ignore = new Set([...baseColumns, "timeframe", "time"]);

    const indicatorCols = Array.from(
      new Set(
        mergedData.flatMap((row) =>
          Object.keys(row).filter((key) => {
            if (ignore.has(key)) return false;

            // ✅ Filter columns to match selected timeframe/indicator (skip when ALL)
            if (
              timeframe?.tf &&
              timeframe?.indicator &&
              timeframe.tf !== "ALL"
            ) {
              const lowerKey = key.toLowerCase();
              return (
                lowerKey.includes(timeframe.indicator.toLowerCase()) &&
                lowerKey.includes(timeframe.tf.toLowerCase())
              );
            }

            return true;
          }),
        ),
      ),
    );

    return [...baseColumns, ...indicatorCols, "timeframe"];
  }, [mergedData, timeframe]);

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

            <Dropdown
              onSelect={(val) => {
                const selected = JSON.parse(val);

                // ✅ HANDLE ALL — show "ALL" in toggle, set dropdown 2 to max TF
                if (selected.tf === "ALL") {
                  setTimeframe({ tf: "ALL", indicator: "ALL" });
                  // Set dropdown 2 to the current max timeframe from payloadRules
                  const allTFs = getAllTimeframes(payloadRules);
                  const maxTF = getMaxTimeframe(allTFs);
                  if (maxTF) setTimeframeValue(maxTF);
                  return;
                }

                setTimeframe(selected);

                // ✅ Mark that user manually selected a TF — block auto-override
                userPickedTf.current = true;

                // ✅ Strip "_ago" suffix so it matches dropdown 2 option values
                // e.g. "1h_ago" → "1h", "1d_ago" → "1d"
                const normalizedTf = selected.tf
                  ? selected.tf.replace(/_ago$/i, "")
                  : selected.tf;
                setTimeframeValue(normalizedTf); // sync with dropdown 2
              }}
            >
              <Dropdown.Toggle
                size="sm"
                variant="light"
                className="d-flex align-items-center justify-content-between"
                style={{ height: 32, width: 135, fontSize: 13 }}
              >
                {!timeframe ? (
                  "Select Timeframe"
                ) : timeframe.tf === "ALL" ? (
                  <span>ALL Timeframes</span>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <span>{timeframe.tf}</span>
                    <Badge
                      bg=""
                      style={{
                        fontSize: 10,
                        padding: "2px 5px",
                        background: "var(--bs-secondary-bg)",
                        color: "var(--bs-secondary-color)",
                        border: "0.5px solid var(--bs-border-color)",
                      }}
                    >
                      {timeframe.indicator?.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ fontSize: 13, minWidth: 180 }}>
                {/* ✅ ALL OPTION */}
                <Dropdown.Item
                  eventKey={JSON.stringify({ tf: "ALL", indicator: "ALL" })}
                >
                  <div className="d-flex justify-content-between w-100">
                    <span>ALL</span>
                    <Badge
                      bg=""
                      style={{
                        fontSize: 10,
                        padding: "2px 5px",
                        background: "var(--bs-secondary-bg)",
                        color: "var(--bs-secondary-color)",
                        border: "0.5px solid var(--bs-border-color)",
                      }}
                    >
                      ALL
                    </Badge>
                  </div>
                </Dropdown.Item>

                {/* ✅ DYNAMIC OPTIONS — grouped by rule with dividers */}
                {flatTimeframes.map((item, i) => {
                  const prevItem = flatTimeframes[i - 1];
                  const showDivider =
                    i > 0 && item.ruleIndex !== prevItem?.ruleIndex;

                  return (
                    <React.Fragment key={i}>
                      {showDivider && <Dropdown.Divider />}
                      <Dropdown.Item
                        eventKey={JSON.stringify({
                          tf: item.tf,
                          indicator: item.indicator,
                        })}
                      >
                        <div className="d-flex justify-content-between w-100">
                          <span>{item.tf}</span>
                          <Badge
                            bg=""
                            style={{
                              fontSize: 10,
                              padding: "2px 5px",
                              background: "var(--bs-secondary-bg)",
                              color: "var(--bs-secondary-color)",
                              border: "0.5px solid var(--bs-border-color)",
                            }}
                          >
                            {item.indicator?.toUpperCase()}
                          </Badge>
                        </div>
                      </Dropdown.Item>
                    </React.Fragment>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>

            {/* ================= DAYS ================= */}
            <Dropdown
              onToggle={(isOpen) => {
                if (isOpen && months !== null) {
                  setMonths(null);
                }
              }}
              onSelect={(val) => {
                const num = Number(val);
                setDays(num === 0 ? null : num);
              }}
            >
              <Dropdown.Toggle
                size="sm"
                variant="light"
                style={{
                  opacity: months !== null ? 0.5 : 1,
                  backgroundColor: months !== null ? "#e9ecef" : "",
                  color: months !== null ? "#6c757d" : "",
                  borderColor: months !== null ? "#dee2e6" : "",
                  cursor: months !== null ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {days ? `${days} Day${days > 15 ? "s" : ""}` : "Select Days"}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ maxHeight: "200px", overflowY: "auto" }}>
                <Dropdown.Item eventKey={0}>Select Days</Dropdown.Item>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <Dropdown.Item key={d} eventKey={d}>
                    {d}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {/* ================= MONTHS ================= */}
            <Dropdown
              onToggle={(isOpen) => {
                if (isOpen && days !== null) {
                  setDays(null);
                }
              }}
              onSelect={(val) => {
                const num = Number(val);
                setMonths(num === 0 ? null : num);
              }}
            >
              <Dropdown.Toggle
                size="sm"
                variant="light"
                style={{
                  opacity: days !== null ? 0.5 : 1,
                  backgroundColor: days !== null ? "#e9ecef" : "",
                  color: days !== null ? "#6c757d" : "",
                  borderColor: days !== null ? "#dee2e6" : "",
                  cursor: days !== null ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {months
                  ? `${months} Month${months > 1 ? "s" : ""}`
                  : "Select Months"}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ maxHeight: "200px", overflowY: "auto" }}>
                <Dropdown.Item eventKey={0}>Select Months</Dropdown.Item>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <Dropdown.Item key={m} eventKey={m}>
                    {m}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {/* Currencies */}
            <EditableMultiSelect
              value={selectedCurrencies}
              options={currencies}
              onChange={setSelectedCurrencies}
              placeholder="Select Currency"
            />

            {/* timeframe */}
            <div title={timeframeValue}>
              <select
                value={timeframeValue || ""}
                onChange={(e) => {
                  const newTf = e.target.value;
                  setTimeframeValue(newTf);
                  userPickedTf.current = true;

                  let targetIndicator = null;

                  // ✅ CASE 1: Specific indicator selected
                  if (
                    timeframe?.tf &&
                    timeframe?.indicator &&
                    timeframe.tf !== "ALL"
                  ) {
                    targetIndicator = timeframe.indicator;
                  }
                  // ✅ CASE 2: "ALL Timeframes" selected — target the LARGEST timeframe indicator
                  else if (
                    timeframe?.tf === "ALL" &&
                    flatTimeframes.length > 0
                  ) {
                    let maxMins = -1;
                    flatTimeframes.forEach((item) => {
                      const mins = tfToMinutes(item.tf);
                      if (mins > maxMins) {
                        maxMins = mins;
                        targetIndicator = item.indicator;
                      }
                    });
                  }

                  if (targetIndicator) {
                    // ✅ Save override so fetchData uses it when rebuilding payload
                    manualTfOverride.current = {
                      indicator: targetIndicator,
                      newTf,
                    };

                    setPayloadRules((prev) =>
                      prev.map((rule) => {
                        const updated = { ...rule };
                        ["object1", "object2", "object3"].forEach((key) => {
                          if (
                            updated[key] &&
                            updated[key].indicator === targetIndicator
                          ) {
                            updated[key] = {
                              ...updated[key],
                              timeframe: newTf,
                            };
                          }
                        });
                        return updated;
                      }),
                    );

                    // ✅ Sync dropdown 1 label to reflect the new TF (only if not in ALL mode)
                    if (timeframe.tf !== "ALL") {
                      setTimeframe({ tf: newTf, indicator: targetIndicator });
                    }

                    // ✅ SYNC TO MASTER RULES (for IndicatorRuleBuilder UI)
                    if (setRules) {
                      setRules((prev) =>
                        prev.map((r) => {
                          const updated = { ...r };
                          const matches = (v) =>
                            v &&
                            v.toLowerCase() === targetIndicator.toLowerCase();

                          if (matches(updated.indicator))
                            updated.timeframe = newTf;
                          if (matches(updated.scanner))
                            updated.compareTimeframe = newTf;
                          if (matches(updated.scanner2))
                            updated.timeframe2 = newTf;

                          return updated;
                        }),
                      );
                    }
                  }
                }}
                className="form-select form-select-sm"
                style={{ height: 35, width: 170 }}
                onClick={() => {
                  if (
                    !fetchTimeframe ||
                    Object.keys(fetchTimeframe).length === 0
                  ) {
                    fetchListingTimeframe(); // ✅ lazy fetch
                  }
                }}
              >
                <option value="" disabled>
                  Select Timeframe
                </option>
                {/* ✅ Default fallback */}
                {!fetchTimeframe && <option value="1m">1 Minute</option>}

                {/* ✅ Empty fallback */}
                {fetchTimeframe && Object.keys(fetchTimeframe).length === 0 && (
                  <option value="1m">1 Minute</option>
                )}

                {/* ✅ Actual data */}
                {fetchTimeframe &&
                  Object.entries(fetchTimeframe).map(([group, items]) => (
                    <optgroup key={group} label={group?.toUpperCase()}>
                      {Array.isArray(items) &&
                        items.map((item, i) => (
                          <option key={item?.value || i} value={item?.value}>
                            {item?.label}
                          </option>
                        ))}
                    </optgroup>
                  ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div style={{ position: "relative" }}>
            {/* 🔥 LOADER OVERLAY */}
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(255,255,255,0.1)",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(1px)",
                }}
              >
                <Spinner />
              </div>
            )}

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
                        style={{ cursor: "pointer", textAlign: "center" }}
                      >
                        <div className="d-flex align-items-center justify-content-center w-100">
                          <span>{col.toUpperCase()}</span>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginLeft: 4,
                              lineHeight: "8px",
                            }}
                          >
                            <FaSortUp
                              style={{
                                color:
                                  sortConfig.key === col &&
                                  sortConfig.direction === "asc"
                                    ? "#000"
                                    : "#ccc",
                                marginBottom: "-4px",
                              }}
                            />

                            <FaSortDown
                              style={{
                                color:
                                  sortConfig.key === col &&
                                  sortConfig.direction === "desc"
                                    ? "#000"
                                    : "#ccc",
                                marginTop: "-4px",
                              }}
                            />
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* ❌ removed loading condition from here */}

                  {paginatedData.length === 0 ? (
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
                                  ? JSON.stringify(row[col])
                                  : row[col]}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 justify-content-end px-3 py-2">
            <Form.Select
              size="sm"
              value={selectedLimit}
              onChange={(e) => {
                const val = e.target.value;

                setSelectedLimit(val); // UI value
                setLimit(Number(val)); // actual limit
              }}
              style={{ maxWidth: 150 }}
            >
              {/* Placeholder (disabled after selection) */}
              <option value="" disabled={selectedLimit !== ""}>
                Show Records
              </option>

              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>

            <small className="text-muted ms-auto">
              Page <strong>{page + 1}</strong> of{" "}
              <strong>{totalPages || 1}</strong>
              &nbsp;&middot;&nbsp;
              <strong>{totalRecords}</strong> total
            </small>
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

      <AlertModal
        isOpen={showAlert}
        message={alertMsg}
        onClose={() => setShowAlert(false)}
      />
    </Container>
  );
}
