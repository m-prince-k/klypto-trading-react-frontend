import React, { useState, useMemo, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import apiService from "../../services/apiServices";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Badge } from "react-bootstrap";
import { Container, Table, Card, Form, Button } from "react-bootstrap";
import { FiCopy, FiDownload } from "react-icons/fi";
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
  comparisonOps,
  normalizeIndicator,
  INDICATOR_DAYS_MAP,
  normalizeData,
} from "../../util/common";
import { toast } from "react-toastify";
import { Spinner } from "../tradingModals/Spinner";
import EditableMultiSelect from "../indicator/EditTableLabel";
import AlertModal from "./ScannerModals";
import { INDICATOR_ALIASES, MA_INDICATORS } from "../../util/scannerFunctions";

/* ================= SYMBOL LIST ================= */

export default function IndicatorBuilderListing({
  rules,
  logic,
  runScanTrigger,
  listingTimeframe,
  selectedCurrencies,
  setSelectedCurrencies,
  setRules,
  setFinalRules,
  dataSource,
  setDataSource,
}) {
  const [timeframe, setTimeframe] = useState(null); // null = ALL
  const [limit, setLimit] = useState(10); // actual data limit
  const [selectedLimit, setSelectedLimit] = useState(""); // dropdown UI
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [days, setDays] = useState(30);
  const [currencies, setCurrencies] = useState([]);
  const [error, setError] = useState(null);
  const [months, setMonths] = useState(null);
  const debouncedCurrencies = useDebounce(selectedCurrencies, 1000);
  const [fetchTimeframe, setFetchTimeframe] = useState([]);
  const [timeframeValue, setTimeframeValue] = useState("1d");
  const [payloadRules, setPayloadRules] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  console.log(dataSource, "dataSource");

  const hasData = normalizeData(dataSource).length > 0;
  // ✅ Tracks whether the user manually picked a TF from dropdown 1
  // When true, fetchData will NOT override timeframeValue with maxTF
  const userPickedTf = useRef(false);

  // ✅ Stores a pending TF override {indicator, oldTf, newTf}
  // Applied inside fetchData so it survives the formattedRules rebuild
  const manualTfOverride = useRef(null);
  const isFetching = useRef(false);

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
    debouncedCurrencies,
    timeframeValue,
    listingTimeframe,
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

      const data = (await response?.data) || {};

      // ✅ ADD CUSTOM TIMEFRAMES
      const extendedData = {
        ...data,

        month: [
          ...(data.month || []),
          {
            label: "1 Month",
            value: "1M",
            seconds: 2592000, // approx 30 days
          },
        ],

        // quarter: [
        //   ...(data.quarter || []),
        //   {
        //     label: "1 quarter",
        //     value: "1q",
        //     seconds: 7776000, // 90 days
        //   },
        // ],

        // year: [
        //   ...(data.year || []),
        //   {
        //     label: "1 year",
        //     value: "1y",
        //     seconds: 31536000, // 365 days
        //   },
        // ],
      };

      setFetchTimeframe(extendedData);

      // setFetchTimeframe(data);

      // console.log(fetchTimeframe, "timeframee")
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
    const match = tf.toLowerCase().match(/^(\d+)(d|w|m|mo|mth|q|y)_ago$/);
    if (!match) return null;

    const value = Number(match[1]);
    const unit = match[2];

    const map = {
      d: 1,
      w: 7,
      m: 30, // timeframe 'M' becomes 'm' after toLowerCase()
      mo: 30,
      mth: 30,
      q: 90,
      y: 365,
    };

    return value * (map[unit] || 1);
  };


  const normalizeTfForDropdown = (tf) => {
    if (!tf) return "";
    const lower = tf.toLowerCase();
    //
    // if (lower === "90d" || lower === "1q") return "1q";
    // if (lower === "365d" || lower === "1y") return "1y";

    if (lower.includes("_ago")) {
      // if (/y|yr|year/i.test(lower)) return "1y";
      // if (/q|quarter/i.test(lower)) return "1q";
      if (/mo|mth|month/i.test(lower) || tf.includes("M")) return "1M";
      if (/w|week/i.test(lower)) return "1w";
      if (/d|day/i.test(lower)) return "1d";
      return tf.replace(/_ago$/i, "");
    }
    return tf.replace(/_ago$/i, "");
  };

 

  const isIndicatorMatch = (key, indicator, tf) => {
    if (!key || !indicator || !tf) return false;
    const lowerKey = key.toLowerCase();
    const lowerInd = indicator.toLowerCase();
    const lowerTf = tf.toLowerCase();

    // 1. Direct includes match (works for rsi (14) 1d, ema (20) 1d etc.)
    if (lowerKey.includes(lowerInd) && lowerKey.includes(lowerTf)) return true;

    // 2. Alias match
    const aliases = INDICATOR_ALIASES[lowerInd] || [];
    for (const alias of aliases) {
      if (lowerKey.includes(alias.toLowerCase()) && lowerKey.includes(lowerTf))
        return true;
    }

    // 3. Fallback for composite names (e.g. "Bollinger Upper Band" vs "bb_upper")
    if (lowerInd.includes("bollinger") && lowerKey.includes("bb")) {
      if (lowerInd.includes("upper") && lowerKey.includes("upper"))
        return lowerKey.includes(lowerTf);
      if (lowerInd.includes("lower") && lowerKey.includes("lower"))
        return lowerKey.includes(lowerTf);
      if (
        lowerInd.includes("basis") &&
        (lowerKey.includes("basis") || lowerKey.includes("middle"))
      )
        return lowerKey.includes(lowerTf);
    }

    return false;
  };
  const getTotalDays = (patchedRules) => {
    const daysArray = patchedRules.flatMap((rule) =>
      ["object1", "object2", "object3", "object4"].map((key) => {
        const raw = rule[key]?.indicator;
        const ind = normalizeIndicator(raw);

        return INDICATOR_DAYS_MAP[ind] || INDICATOR_DAYS_MAP.default;
      }),
    );

    return daysArray.length
      ? Math.max(...daysArray)
      : INDICATOR_DAYS_MAP.default;
  };


  /* ================= CONSTANTS ================= */

  const OBJECT_KEYS = ["object1", "object2", "object3", "object4"];

  /* ================= BUILD OBJECT ================= */

  const buildObject = ({
    indicator,
    timeframe,
    params = {},
    value,
    source,
    inputIndicator, // ✅ renamed from nested
  }) => {
    const indicatorKey = indicator?.toLowerCase();
    const normalizedSource = (source || "close").toLowerCase();
    let overrideOffset = null;
    if (timeframe === "90d") overrideOffset = 90;
    else if (timeframe === "365d") overrideOffset = 365;

    const offset =
      overrideOffset !== null ? overrideOffset : convertToDays(timeframe);
    const isMA = MA_INDICATORS.includes(indicatorKey);

    const hasValue =
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(typeof value === "number" && isNaN(value));

    // ✅ number shortcut
    if (indicatorKey === "number" && hasValue) {
      return {
        obj: { indicator: "number", value },
        on: null,
      };
    }

    const obj = { indicator: indicatorKey };

    // ✅ timeframe / offset
    if (offset !== null) {
      obj.offset = offset;

      // The user requested that for quarterly and yearly with 'ago',
      // timeframe should be '1d'. For monthly and weekly, we can also default to '1d' or keep specific handling.
      // But preserving existing codebase logic, we pass "1d" when offset is present.
      obj.timeframe = "1d";
      obj.originalTimeframe = timeframe;
    } else if (timeframe) {
      if (
        typeof timeframe === "string" &&
        (timeframe.toLowerCase() === "1q" || timeframe.toLowerCase() === "1y")
      ) {
        obj.timeframe = "1d";
        obj.originalTimeframe = timeframe;
      } else {
        obj.timeframe = timeframe;
      }
    }

    // ✅ params handling
    if (indicatorKey !== "volume" && params && Object.keys(params).length) {
      const isVolumeMA = isMA && normalizedSource === "volume";

      let finalParams = params;

      if (isVolumeMA && params.length !== undefined) {
        finalParams = { ...params, length: params.length };
        delete finalParams.length;
      }

      obj.length = {
        ...finalParams,
        ...(isMA && { source: normalizedSource }),
        ...(isVolumeMA && { inputIndicator: "volume" }),
      };
    }

    // ✅ Handle nesting for max/min using inputIndicator key
    if ((indicatorKey === "max" || indicatorKey === "min") && inputIndicator) {
      const { obj: nestedObj, on: nestedOn } = buildObject(inputIndicator);
      obj.inputIndicator = nestedObj;
    }

    const on = isMA && normalizedSource === "volume" ? "volume" : null;

    return { obj, on };
  };

  /* ================= VALIDATION ================= */

  const validateRules = (rules) => {
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const ruleNum = i + 1;

      const checks = [
        [
          !rule?.indicator || rule.indicator === "Select Scanner",
          "Scanner not selected",
        ],
        [
          !rule?.operator || rule.operator === "Select Operation",
          "Operator not selected",
        ],
        [
          !rule?.scanner || rule.scanner === "Select Scanner",
          "Scanner not selected",
        ],
        [rule.operator2 === "Select Operation", "Operator not selected"],
        [rule.scanner2 === "Select Scanner", "Scanner not selected"],
        [rule.operator3 === "Select Operation", "Operator not selected"],
        [rule.scanner3 === "Select Scanner", "Scanner not selected"],
      ];

      for (const [condition, message] of checks) {
        if (condition) return `Rule ${ruleNum}: ${message}`;
      }

      const compCount =
        (comparisonOps.has(rule.operator) ? 1 : 0) +
        (comparisonOps.has(rule.operator2) ? 1 : 0) +
        (comparisonOps.has(rule.operator3) ? 1 : 0);

      if (compCount === 0) {
        return `Rule ${ruleNum}: One comparison operator required`;
      }

      if (compCount > 1) {
        return `Rule ${ruleNum}: Only one comparison operator allowed`;
      }
    }

    return null;
  };

  /* ================= TRANSFORM ================= */

  const transformRules = (rules) => {
    return rules
      .filter((r) => !r.disabled)
      .map((rule) => {
        const o1 = buildObject({
          indicator: rule.indicator,
          timeframe: rule.timeframe,
          params: rule.indicatorParams,
          value: rule.value,
          source: rule.source,
          // ✅ Pass nested fields as inputIndicator
          inputIndicator: rule.indicatorNestedIndicator
            ? {
                indicator: rule.indicatorNestedIndicator,
                timeframe: rule.indicatorNestedTimeframe,
                params: rule.indicatorNestedParams,
                source: rule.indicatorNestedSource,
                value: rule.indicatorNestedValue,
              }
            : null,
        });

        const o2 = buildObject({
          indicator: rule.scanner,
          timeframe: rule.compareTimeframe,
          params: rule.scannerParams,
          value: rule.compareValue,
          source: rule.scannerSource,
          inputIndicator: rule.scannerNestedIndicator
            ? {
                indicator: rule.scannerNestedIndicator,
                timeframe: rule.scannerNestedTimeframe,
                params: rule.scannerNestedParams,
                source: rule.scannerNestedSource,
                value: rule.scannerNestedValue,
              }
            : null,
        });

        const o3 = rule.scanner2
          ? buildObject({
              indicator: rule.scanner2,
              timeframe: rule.timeframe2,
              params: rule.params2,
              value: rule.value2,
              source: rule.source2,
              inputIndicator: rule.scanner2NestedIndicator
                ? {
                    indicator: rule.scanner2NestedIndicator,
                    timeframe: rule.scanner2NestedTimeframe,
                    params: rule.scanner2NestedParams,
                    source: rule.scanner2NestedSource,
                    value: rule.scanner2NestedValue,
                  }
                : null,
            })
          : null;

        const o4 = rule.scanner3
          ? buildObject({
              indicator: rule.scanner3,
              timeframe: rule.timeframe3,
              params: rule.params3,
              value: rule.value3,
              source: rule.source3,
              inputIndicator: rule.scanner3NestedIndicator
                ? {
                    indicator: rule.scanner3NestedIndicator,
                    timeframe: rule.scanner3NestedTimeframe,
                    params: rule.scanner3NestedParams,
                    source: rule.scanner3NestedSource,
                    value: rule.scanner3NestedValue,
                  }
                : null,
            })
          : null;

        const on = o1.on || o2.on || o3?.on || o4?.on;

        return {
          logic: rule.logic,
          object1: o1.obj,
          operator1: rule.operator,

          ...(o2?.obj && { object2: o2.obj }),
          ...(rule.operator2 && { operator2: rule.operator2 }),
          ...(o3?.obj && { object3: o3.obj }),
          ...(rule.operator3 && { operator3: rule.operator3 }),
          ...(o4?.obj && { object4: o4.obj }),

          ...(on && { inputIndicator: on }),
        };
      });
  };

  /* ================= PATCH ================= */

  const applyTimeframeOverride = (rules, override) => {
    if (!override) return rules;

    const { indicator, ruleIndex, objectKey, newTf } = override;

    return rules.map((rule, idx) => {
      if (ruleIndex !== undefined && idx !== ruleIndex) return rule;

      const updated = { ...rule };

      if (objectKey && updated[objectKey]) {
        updated[objectKey] = { ...updated[objectKey], timeframe: newTf };
      } else {
        OBJECT_KEYS.forEach((key) => {
          if (updated[key]?.indicator === indicator) {
            updated[key] = { ...updated[key], timeframe: newTf };
          }
        });
      }

      return updated;
    });
  };

  /* ================= FETCH ================= */

  const fetchData = async () => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      /* ===== VALIDATION ===== */
      const error = validateRules(rules);
      if (error) {
        setAlertMsg(error);
        setShowAlert(true);
        return;
      }

      /* ===== TRANSFORM ===== */
      const formattedRules = transformRules(rules);

      /* ===== PATCH ===== */
      const patchedRules = applyTimeframeOverride(
        formattedRules,
        manualTfOverride.current,
      );

      manualTfOverride.current = null;

      setPayloadRules(patchedRules);

      /* ===== TIMEFRAME ===== */
      const allTFs = getAllTimeframes(patchedRules);
      const maxTF = getMaxTimeframe(allTFs);

      if (maxTF && !userPickedTf.current) {
        setTimeframeValue(normalizeTfForDropdown(maxTF));
      }

      /* ===== DAYS ===== */
      let totalDays = getTotalDays(patchedRules);

      let apiInterval = timeframeValue;

      // if (apiInterval === "1q" || apiInterval === "90d") {
      //   apiInterval = "1d";
      // } else if (apiInterval === "1y" || apiInterval === "365d") {
      //   apiInterval = "1d";
      // }
      if (apiInterval === "1M" || apiInterval === "30d") {
        apiInterval = "1M";
      } else if (apiInterval === "1w" || apiInterval === "7d") {
        apiInterval = "1w";
      }

      console.log(rules, "------rules");

      if (!totalDays || !timeframeValue) return;

      /* ===== API ===== */

      const cleanRules = JSON.parse(JSON.stringify(patchedRules));
      cleanRules.forEach((rule) => {
        ["object1", "object2", "object3", "object4"].forEach((key) => {
          if (rule[key]) delete rule[key].originalTimeframe;
        });
      });

      const payload = {
        currencies: (debouncedCurrencies || []).map((c) => c.value),
        rules: cleanRules,
        logic,
      };
      setFinalRules(cleanRules);

      const { data: result = {} } = await apiService.post(
        `/api/scannerDetail?interval=${apiInterval}&day=${totalDays}`,
        payload,
      );

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
      // toast.error("Something went wrong ❌");
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
          tf: obj.originalTimeframe || obj.timeframe,
          indicator: obj.indicator,
          params: obj.params || obj.length,
          ruleIndex, // ✅ track which rule this belongs to (for divider)
          objectKey: key, // ✅ track which object it comes from
        });
      });
    });

    // console.log(list, "list");

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

    // ✅ APPLY DAYS/MONTHS FILTER (CLIENT-SIDE)
    const limitDays = months ? months * 30 : days ? days : 30;
    if (data.length > 0) {
      const isSeconds = data[0].time && data[0].time < 1e11;
      const now = Date.now();
      const cutoffTime = isSeconds
        ? Math.floor(now / 1000) - limitDays * 86400
        : now - limitDays * 86400 * 1000;

      data = data.filter((row) => row.time >= cutoffTime);
    }

    // ✅ APPLY FILTER ONLY WHEN a specific (non-ALL) TF+indicator is selected
    if (timeframe?.tf && timeframe?.indicator && timeframe.tf !== "ALL") {
      data = data.filter((row) =>
        Object.keys(row).some((k) =>
          isIndicatorMatch(k, timeframe.indicator, timeframe.tf),
        ),
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
  }, [mergedData, search, timeframe, days, months]);

  /* ================= SORTING ================= */

  const sortedData = useMemo(() => {
    let data = [...filteredData].map((row, index) => ({
      ...row,
      sno: index + 1,
    }));

    if (!sortConfig.key) return data;

    return data.sort((a, b) => {
      let sortKey = sortConfig.key;

      // ✅ Use numeric 'time' property instead of 'datetime' string when sorting by date
      if (
        sortKey === "datetime" &&
        a.time !== undefined &&
        b.time !== undefined
      ) {
        sortKey = "time";
      }

      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? aVal
            .toString()
            .localeCompare(bVal.toString(), undefined, { numeric: true })
        : bVal
            .toString()
            .localeCompare(aVal.toString(), undefined, { numeric: true });
    });
  }, [filteredData, sortConfig]);

  const totalRecords = sortedData.length;
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

    const ignore = new Set([
      ...baseColumns,
      "timeframe",
      "time",
      "upperbandrsi",
    ]);

    // const indicatorCols = Array.from(
    //   new Set(
    //     mergedData.flatMap((row) =>
    //       Object.keys(row).filter((key) => {
    //         if (ignore.has(key)) return false;

    //         // ✅ Filter columns to match selected timeframe/indicator (skip when ALL)
    //         if (
    //           timeframe?.tf &&
    //           timeframe?.indicator &&
    //           timeframe.tf !== "ALL"
    //         ) {
    //           return isIndicatorMatch(key, timeframe.indicator, timeframe.tf);
    //         }

    //         return true;
    //       }),
    //     ),
    //   ),
    // );

    // return [...baseColumns, ...indicatorCols, "timeframe"];
    return [...baseColumns];
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

  // ✅ helper (ADD THIS ABOVE RETURN OR IN SAME FILE)
  const formatIndicatorLabel = (item) => {
    if (!item?.indicator) return "";

    let label = item.indicator.toUpperCase();
    // console.log(item.params, "prams");

    // ✅ append params if present
    if (item.params && Object.keys(item.params).length > 0) {
      const paramStr = Object.values(item.params).join(",");
      label += ` (${paramStr})`;
    }

    return label;
  };

  useEffect(() => {
    setPage(0);
  }, [limit, timeframe, search, days, months]);

  return (
    <Container
      fluid
      className="py-4 px-4 bg-slate-50"
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0 fw-semibold text-dark">OHLCV Data</h4>

        <div className="d-flex gap-2">
          <Button
            size="sm"
            title="Copy data to clipboard"
            onClick={() => handleCopy(dataSource)}
            className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            style={{
              borderColor: "#d8b4fe",
              color: "#7c3aed",
              background: "#faf5ff",
              borderRadius: "10px",
              borderWidth: "1.5px",
              fontSize: "0.8rem",
              letterSpacing: "0.01em",
              cursor: !dataSource ? "not-allowed" : "pointer", // 👈
              opacity: !dataSource ? 0.55 : 1,
              boxShadow:
                "0 1px 3px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              if (!dataSource.length) return;
              e.currentTarget.style.borderColor = "#a855f7";
              e.currentTarget.style.color = "#6d28d9";
              e.currentTarget.style.background = "#f3e8ff";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.9)";
              e.currentTarget.querySelector("svg").style.transform =
                "scale(1.2)";
            }}
            onMouseLeave={(e) => {
              if (!dataSource.length) return;
              e.currentTarget.style.borderColor = "#d8b4fe";
              e.currentTarget.style.color = "#7c3aed";
              e.currentTarget.style.background = "#faf5ff";
              e.currentTarget.style.boxShadow =
                "0 1px 3px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";
              e.currentTarget.querySelector("svg").style.transform = "scale(1)";
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FiCopy size={13} style={{ transition: "transform 0.22s ease" }} />
            Copy
          </Button>

          <Button
            size="sm"
            title="Download as CSV"
            disabled={!dataSource}
            onClick={() => handleCSVDownload(dataSource)}
            className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            style={{
              borderColor: "#6ee7b7",
              color: "#065f46",
              background: "#f0fdf9",
              borderRadius: "10px",
              borderWidth: "1.5px",
              fontSize: "0.8rem",
              letterSpacing: "0.01em",
              boxShadow:
                "0 1px 3px rgba(6,95,70,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: !dataSource ? "not-allowed" : "pointer", // 👈
              opacity: !dataSource ? 0.55 : 1, // 👈 optional but recommended
            }}
            onMouseEnter={(e) => {
              if (!dataSource) return; // 👈 guard hover when disabled
              e.currentTarget.style.borderColor = "#34d399";
              e.currentTarget.style.color = "#064e3b";
              e.currentTarget.style.background = "#d1fae5";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(6,95,70,0.16), inset 0 1px 0 rgba(255,255,255,0.9)";
              e.currentTarget.querySelector("svg").style.transform =
                "translateY(2px)";
            }}
            onMouseLeave={(e) => {
              if (!dataSource) return; // 👈 guard hover when disabled
              e.currentTarget.style.borderColor = "#6ee7b7";
              e.currentTarget.style.color = "#065f46";
              e.currentTarget.style.background = "#f0fdf9";
              e.currentTarget.style.boxShadow =
                "0 1px 3px rgba(6,95,70,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";
              e.currentTarget.querySelector("svg").style.transform =
                "translateY(0px)";
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FiDownload
              size={13}
              style={{ transition: "transform 0.22s ease" }}
            />
            CSV
          </Button>

          <Button
            size="sm"
            title="Download as Excel"
            onClick={() => handleExcelDownload(dataSource)}
            className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            style={{
              borderColor: "#93c5fd",
              color: "#1d4ed8",
              background: "#eff6ff",
              borderRadius: "10px",
              borderWidth: "1.5px",
              fontSize: "0.8rem",
              letterSpacing: "0.01em",
              cursor: !dataSource ? "not-allowed" : "pointer", // 👈
              opacity: !dataSource ? 0.55 : 1,
              boxShadow:
                "0 1px 3px rgba(29,78,216,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              if (!dataSource) return;
              e.currentTarget.style.borderColor = "#60a5fa";
              e.currentTarget.style.color = "#1e40af";
              e.currentTarget.style.background = "#dbeafe";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(29,78,216,0.16), inset 0 1px 0 rgba(255,255,255,0.9)";
              e.currentTarget.querySelector("svg").style.transform =
                "translateY(2px)";
            }}
            onMouseLeave={(e) => {
              if (!dataSource) return;
              e.currentTarget.style.borderColor = "#93c5fd";
              e.currentTarget.style.color = "#1d4ed8";
              e.currentTarget.style.background = "#eff6ff";
              e.currentTarget.style.boxShadow =
                "0 1px 3px rgba(29,78,216,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";
              e.currentTarget.querySelector("svg").style.transform =
                "translateY(0px)";
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FiDownload
              size={13}
              style={{ transition: "transform 0.22s ease" }}
            />
            Excel
          </Button>
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

                  const allTFs = getAllTimeframes(payloadRules);
                  const maxTF = getMaxTimeframe(allTFs);
                  if (maxTF) setTimeframeValue(normalizeTfForDropdown(maxTF));
                  return;
                }
                setTimeframe(selected);

                // ✅ Mark that user manually selected a TF — block auto-override
                userPickedTf.current = true;

                // ✅ normalize tf
                const normalizedTf = normalizeTfForDropdown(selected.tf);

                setTimeframeValue(normalizedTf);
              }}
            >
              <Dropdown.Toggle
                size="sm"
                variant="light"
                className="d-inline-flex align-items-center justify-content-between"
                style={{
                  height: 32,
                  minWidth: 160,
                  width: "auto",
                  fontSize: 13,
                }}
              >
                {!timeframe ? (
                  "Select Timeframe"
                ) : timeframe.tf === "ALL" ? (
                  <span>ALL Timeframes</span>
                ) : (
                  <div className="d-flex gap-2 align-items-center justify-content-between w-100">
                    <span>{timeframe.tf}</span>

                    {/* ✅ BADGE IN PLACEHOLDER */}
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
                      {formatIndicatorLabel(timeframe)}
                    </Badge>
                  </div>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ fontSize: 13, minWidth: 180 }}>
                {/* ✅ ALL OPTION */}
                <Dropdown.Item
                  eventKey={JSON.stringify({ tf: "ALL", indicator: "ALL" })}
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <span>ALL</span>
                    {/* <Badge
                      bg=""
                      style={{
                        fontSize: 10,
                        padding: "2px 4px",
                        background: "var(--bs-secondary-bg)",
                        color: "var(--bs-secondary-color)",
                        border: "0.5px solid var(--bs-border-color)",
                      }}
                    >
                      ALL
                    </Badge> */}
                  </div>
                </Dropdown.Item>

                {/* ✅ DYNAMIC OPTIONS */}
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
                          params: item.params, // ✅ PASS PARAMS
                          ruleIndex: item.ruleIndex,
                          objectKey: item.objectKey,
                        })}
                      >
                        <div className="d-flex gap-2 align-items-center justify-content-between w-100">
                          <span>{item.tf}</span>

                          <Badge
                            bg=""
                            style={{
                              fontSize: 10,
                              padding: "2px 4px",
                              background: "var(--bs-secondary-bg)",
                              color: "var(--bs-secondary-color)",
                              border: "0.5px solid var(--bs-border-color)",
                            }}
                          >
                            {formatIndicatorLabel(item)}
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
                if (num > 0) {
                  toast.success(
                    `Records filtered for ${num} Day${num > 1 ? "s" : ""}`,
                  );
                }
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
                if (num > 0) {
                  toast.success(
                    `Records filtered for ${num} Month${num > 1 ? "s" : ""}`,
                  );
                }
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
                  let targetRuleIndex = undefined;
                  let targetObjectKey = null;

                  // ✅ CASE 1: Specific indicator selected
                  if (
                    timeframe?.tf &&
                    timeframe?.indicator &&
                    timeframe.tf !== "ALL"
                  ) {
                    targetIndicator = timeframe.indicator;
                    targetRuleIndex = timeframe.ruleIndex;
                    targetObjectKey = timeframe.objectKey;
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
                        targetRuleIndex = item.ruleIndex;
                        targetObjectKey = item.objectKey;
                      }
                    });
                  }

                  if (targetIndicator || targetObjectKey) {
                    // ✅ Save override so fetchData uses it when rebuilding payload
                    manualTfOverride.current = {
                      indicator: targetIndicator,
                      ruleIndex: targetRuleIndex,
                      objectKey: targetObjectKey,
                      newTf,
                    };

                    setPayloadRules((prev) =>
                      prev.map((rule, idx) => {
                        if (
                          targetRuleIndex !== undefined &&
                          idx !== targetRuleIndex
                        )
                          return rule;

                        const updated = { ...rule };

                        if (targetObjectKey && updated[targetObjectKey]) {
                          updated[targetObjectKey] = {
                            ...updated[targetObjectKey],
                            timeframe: newTf,
                          };
                        } else {
                          ["object1", "object2", "object3", "object4"].forEach(
                            (key) => {
                              if (
                                updated[key] &&
                                updated[key].indicator === targetIndicator
                              ) {
                                updated[key] = {
                                  ...updated[key],
                                  timeframe: newTf,
                                };
                              }
                            },
                          );
                        }
                        return updated;
                      }),
                    );

                    // ✅ Sync dropdown 1 label to reflect the new TF (only if not in ALL mode)
                    if (timeframe.tf !== "ALL") {
                      setTimeframe({ ...timeframe, tf: newTf });
                    }

                    // ✅ SYNC TO MASTER RULES (for IndicatorRuleBuilder UI)
                    if (setRules) {
                      setRules((prev) =>
                        prev.map((r, idx) => {
                          if (
                            targetRuleIndex !== undefined &&
                            idx !== targetRuleIndex
                          )
                            return r;

                          const updated = { ...r };

                          if (targetObjectKey === "object1") {
                            updated.timeframe = newTf;
                          } else if (targetObjectKey === "object2") {
                            updated.compareTimeframe = newTf;
                          } else if (targetObjectKey === "object3") {
                            updated.timeframe2 = newTf;
                          } else if (targetObjectKey === "object4") {
                            updated.timeframe3 = newTf;
                          } else {
                            const matches = (v) =>
                              v &&
                              v.toLowerCase() ===
                                targetIndicator?.toLowerCase();

                            if (matches(updated.indicator))
                              updated.timeframe = newTf;
                            if (matches(updated.scanner))
                              updated.compareTimeframe = newTf;
                            if (matches(updated.scanner2))
                              updated.timeframe2 = newTf;
                            if (matches(updated.scanner3))
                              updated.timeframe3 = newTf;
                          }

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
