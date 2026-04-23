import { useState, useEffect, useRef } from "react";
import { GoAlertFill } from "react-icons/go";
import EditableMultiSelect, {
  EditableSelect,
  EditableNumber,
} from "../indicator/EditTableLabel";
import { Copy, Trash2, Ban, Files } from "lucide-react";
import { HiOutlineSave } from "react-icons/hi";
import apiService from "../../services/apiServices";
import { IndicatorRuleModals } from "./IndicatorRuleModals";
import { FaCirclePlay, FaPlus } from "react-icons/fa6";
import { RiLoopLeftLine } from "react-icons/ri";
import { Dropdown } from "react-bootstrap";
import { SlCalculator } from "react-icons/sl";

import {
  Container,
  Card,
  Form,
  Button,
  Badge,
  Stack,
  Modal,
} from "react-bootstrap";
import { IoClose } from "react-icons/io5";
import {
  operatorMap,
  timeframeMap,
  OPERATORS,
  getTimeframeLabel,
} from "../../util/common";
import AlertModal from "./ScannerModals";
import { toast } from "react-toastify";

export default function IndicatorRuleBuilder({
  onClose,
  onOpen,
  rules,
  setRules,
  logic,
  setLogic,
  runScanTrigger,
  setRunScanTrigger,
  selectedCurrencies,
  setSelectedCurrencies,
  scannerOptions,
  setScannerOptions,
  finalRules,
}) {
  const [timeframeOptions, setTimeframeOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  async function fetchCurrencies() {
    setLoading(true);
    setError(null);

    try {
      let response = await apiService.post(`/api/getCurrencies`);
      const raw = response?.data ?? [];

      const formatted = [
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

  const copyToClipboard = (filter) => {
    let values = {
      id: filter.id,
      indicator: filter.indicator,
      disabled: filter.disabled,
      operator: filter.operator,
      length: filter.length,
      scanner: filter.scanner,
      timeframe: filter.timeframe,
      compareTimeframe: filter.compareTimeframe,
      compareLength: filter.compareLength,
      compareAgo: filter.compareAgo,
      value: filter.value,
    };
    // console.log(values, "---------------------->>>>>>");
    navigator.clipboard.writeText(JSON.stringify(values));
    alert("Copied: " + filter.indicator);
  };

  const duplicateFilter = (filter) => {
    const newFilter = {
      ...filter,
      id: Date.now(),
      name: filter.indicator + " (copy)",
    };
    setRules((prev) => [...prev, newFilter]);
  };

  const toggleDisable = (id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, disabled: !r.disabled } : r)),
    );
  };

  /* Fetch once on mount OR when symbol changes */
  useEffect(() => {
    fetchCurrencies();
  }, []);

  /* ================= NATURAL LANGUAGE STATE ================= */
  const [input, setInput] = useState("");
  const [conditions, setConditions] = useState();

  /* ================= CLICK LOCK ================= */
  const clickLockRef = useRef(false);

  /* ================= OPERATOR MAP ================= */

  /* ================= PARSER ================= */
  function parseNaturalConditions(text, scannerOptions = []) {
    if (!text || typeof text !== "string") return null;

    const clean = text
      .toLowerCase()
      .replace(/^\s*(if|when|where)\s+/i, "")
      .trim();

    const parts = clean.split(/\s+(?:and|or|also|&|\|)\s+/i);

    const results = [];

    const extractTimeframe = (str) => {
      for (const key in timeframeMap) {
        if (str.includes(key)) {
          return {
            timeframe: timeframeMap[key],
            rest: str.replace(key, "").trim(),
          };
        }
      }
      return { timeframe: "1d", rest: str };
    };

    const extractNumber = (str) => {
      const match = str.match(/\d+(\.\d+)?/);
      return match ? Number(match[0]) : null;
    };

    const findIndicator = (word) => {
      if (!word) return null;

      return scannerOptions.find(
        (opt) =>
          opt.label?.toLowerCase() === word || opt.slug?.toLowerCase() === word,
      );
    };

    const getDefaultLength = (meta) => {
      if (!meta) return 0;

      if (typeof meta === "number") return meta;
      if (typeof meta === "object") {
        const firstKey = Object.keys(meta)[0];
        return meta[firstKey] ?? 0;
      }

      return 0;
    };

    const parseSide = (rawStr) => {
      let sideStr = rawStr;
      let op = null;
      let obj2 = null;
      let params = {};
      let tf2 = "1d";

      const mathMatch = sideStr.match(/([+\-*/])\s*([a-z0-9_]+)/i);

      if (mathMatch) {
        op = mathMatch[1];
        const word2 = mathMatch[2];
        const match2 = findIndicator(word2);

        if (match2) {
          obj2 = match2.slug || match2.label.toLowerCase();
          params = { length: getDefaultLength(match2.meta) };
          // assume MA_INDICATORS exists in outer scope or module
          if (typeof MA_INDICATORS !== "undefined" && MA_INDICATORS.includes(obj2)) {
            params.source = "close";
          }
        }
        sideStr = sideStr.replace(mathMatch[0], "").trim();
      }

      const tfRes = extractTimeframe(sideStr);
      let tf = tfRes.timeframe;
      let rest = tfRes.rest;

      let indicator = "number";
      let length = 0;
      let value = 0;

      const num = extractNumber(rest);
      const word = rest.split(" ")[0];
      const match = findIndicator(word);

      if (match) {
        indicator = match.slug || match.label.toLowerCase();
        length = getDefaultLength(match.meta);
        if (num !== null) length = num;
      } else if (num !== null) {
        indicator = "number";
        value = num;
      }

      return { indicator, tf, length, value, op, obj2, params, tf2 };
    };

    for (const segment of parts) {
      let trimmed = segment.trim();

      /* ================= STEP 1: FIND MAIN OPERATOR ================= */
      let operator = null;
      let leftRaw = "";
      let rightRaw = "";

      for (const phrase in operatorMap) {
        if (trimmed.includes(phrase)) {
          const split = trimmed.split(phrase);
          if (split.length !== 2) continue;

          operator = operatorMap[phrase];
          leftRaw = split[0].replace(/\bis\b/g, "").trim();
          rightRaw = split[1].trim();
          break;
        }
      }

      if (!operator) continue;

      /* ================= LEFT ================= */
      const leftSide = parseSide(leftRaw);

      /* ================= RIGHT ================= */
      const rightSide = parseSide(rightRaw);

      /* ================= FINAL ================= */
      results.push({
        id: Date.now() + Math.random(),

        timeframe: leftSide.tf,
        indicator: leftSide.indicator,
        indicatorParams: { length: leftSide.length },
        value: leftSide.value,

        operator,

        compareTimeframe: rightSide.tf,
        scanner: rightSide.indicator,
        scannerParams: { length: rightSide.length },
        compareValue: rightSide.value,

        // ✅ operator2 support
        operator2: leftSide.op,
        scanner2: leftSide.obj2,
        params2: leftSide.params,
        timeframe2: leftSide.tf2,

        // ✅ operator3 support
        operator3: rightSide.op,
        scanner3: rightSide.obj2,
        params3: rightSide.params,
        timeframe3: rightSide.tf2,
      });
    }

    return results.length ? results : null;
  }

  /* ================= RULE FACTORY ================= */
  function newRule() {
    return {
      id: Date.now(),
      timeframe: "1d",
      indicator: "Select Scanner",
      length: 0,
      value: 0,
      operator: "Select Operation",
      compareTimeframe: "1d",
      scanner: "Select Scanner",
      compareLength: 0,
      compareValue: 0,
    };
  }

  /* ================= ADD RULE FROM INPUT ================= */
  const MAX_RULES = 30;

  const addCondition = () => {
    if (!input.trim()) return;
    if (rules.length >= MAX_RULES) {
      setModalMessage("Maximum 30 rules allowed!");
      setModalOpen(true);
      return;
    }

    const trimmedInput = input.trim();

    // Append to the conditions array
    setConditions(trimmedInput);

    const parsedConditions = parseNaturalConditions(input);

    if (!parsedConditions) {
      alert("Could not understand condition");
      return;
    }

    const generatedRules = parsedConditions.map((parsed) => ({
      id: Date.now() + Math.random(),

      timeframe: parsed.timeframe,
      indicator: parsed.indicator,
      indicatorParams: parsed.indicatorParams,

      operator: parsed.operator,

      compareTimeframe: parsed.compareTimeframe,
      scanner: parsed.scanner,
      compareValue: parsed.compareValue,

      // ✅ NEW
      operator2: parsed.operator2,
      scanner2: parsed.scanner2,
      params2: parsed.params2,
      timeframe2: parsed.timeframe2,
      disabled: false,
    }));

    setRules((prev) => [
      ...prev,
      ...generatedRules.map((rule) => ({
        ...rule,
        disabled: false,
      })),
    ]);
    setInput("");
  };

  /* ================= APPEND EMPTY RULE (+ BUTTON) ================= */

  function appendRule() {
    if (clickLockRef.current) return;

    // 🚫 limit check
    if (rules.length >= MAX_RULES) {
      setModalMessage("Maximum 30 rules allowed at one time!");
      setModalOpen(true);
      return;
    }

    clickLockRef.current = true;

    setRules((prev) => [...prev, newRule()]);

    setTimeout(() => {
      clickLockRef.current = false;
    }, 250);
  }

  function removeRule(id) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function updateField(id, field, value) {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)),
    );
  }

  const [timeframePromptConfig, setTimeframePromptConfig] = useState({
    isOpen: false,
  });
  const [timeframePromptInput, setTimeframePromptInput] = useState("");

  const handleTimeframeChange = (value, ruleId, field) => {
    if (!value) return;

    if (value.startsWith("n")) {
      const short = value[1];
      const labelMap = {
        d: "days",
        w: "weeks",
        m: "months",
        // q: "quarters",
        // y: "years",
      };
      const unit = labelMap[short];

      setTimeframePromptConfig({
        isOpen: true,
        unit,
        short,
        value,
        ruleId,
        field,
      });
      setTimeframePromptInput("");
      return null;
    }

    return value;
  };

  const submitTimeframePrompt = () => {
    const { unit, short, value, ruleId, field } = timeframePromptConfig;
    if (
      !timeframePromptInput ||
      isNaN(timeframePromptInput) ||
      Number(timeframePromptInput) <= 0
    ) {
      toast.info("Please enter a valid positive number");
      return;
    } else if (Number(timeframePromptInput) > 50) {
      toast.info("Enter a number less than 50");
      return;
    }

    const num = Number(timeframePromptInput);
    const newOption = {
      label: `${num} ${unit} ago`,
      value: `${num}${short}_ago`,
    };

    setTimeframeOptions((prev) => {
      const exists = prev.some((opt) => opt.value === newOption.value);
      if (exists) return prev;
      const index = prev.findIndex((opt) => opt.value === value);
      const updated = [...prev];
      if (index !== -1) {
        updated.splice(index, 0, newOption);
      } else {
        updated.push(newOption);
      }
      return updated;
    });

    updateField(ruleId, field, newOption.value);
    setTimeframePromptConfig({ isOpen: false });
  };

  /* ================= API CALLS ================= */

  async function fetchTimeframe() {
    setLoading(true);

    try {
      const response = await apiService.post("/api/getTimeFrames");
      const data = await response?.data;

      /* ================= LABEL OVERRIDE ================= */
      const labelMap = {
        "1 day": { label: "Daily", value: "1d" },
      };

      const transformOptions = (arr = []) =>
        arr.map((item) => {
          const mapped = labelMap[item.label?.toLowerCase()];

          return {
            ...item,
            label: mapped?.label || item.label,
            value: mapped?.value || item.value,
          };
        });

      /* ================= ORIGINAL FLATTEN ================= */
      const flattened = [
        ...transformOptions(data.minutes || []),
        ...transformOptions(data.hours || []),
        ...transformOptions(data.days || []),
        ...transformOptions(data.weeks || []),
      ];

      /* ================= ADD EXTRA TIMEFRAMES ================= */
      const extraTimeframes = [
        { label: "Weekly", value: "1w" },
        { label: "Monthly", value: "1M" },
      ];

      const mergedTimeframes = [...flattened, ...extraTimeframes];

      const uniqueTimeframes = Array.from(
        new Map(mergedTimeframes.map((item) => [item.value, item])).values(),
      );

      /* ================= YOUR EXISTING LOGIC ================= */
      const generateAgoOptions = (count, unit, short) => {
        const options = Array.from({ length: count }, (_, i) => {
          const num = i + 1;
          return {
            label: `${num} ${unit}${num > 1 ? "s" : ""} ago`,
            value: `${num}${short}_ago`,
          };
        });

        // 👇 add "n" option at the end
        options.push({
          label: `n ${unit}s ago`,
          value: `n${short}_ago`,
        });

        return options;
      };

      const daysAgoOptions = generateAgoOptions(3, "day", "d");
      const weeksAgoOptions = generateAgoOptions(3, "week", "w");
      const monthsAgoOptions = generateAgoOptions(3, "month", "m");
      // const quartersAgoOptions = generateAgoOptions(3, "quarter", "q");
      // const yearsAgoOptions = generateAgoOptions(3, "year", "y");

      const finalOptions = [
        ...uniqueTimeframes,
        ...daysAgoOptions,
        ...weeksAgoOptions,
        ...monthsAgoOptions,
        // ...quartersAgoOptions,
        // ...yearsAgoOptions,
      ];

      setTimeframeOptions(finalOptions);
    } catch (err) {
      console.error(err);
      setTimeframeOptions([{ label: "Select Timeframe", value: "" }]); // safety
    } finally {
      setLoading(false);
    }
  }
  async function fetchScanners() {
    try {
      const response = await apiService.post("/api/scanner");
      const raw = await response?.data;

      const formatted = [
        { label: "Select Scanner", value: "" },
        ...(raw ?? []).map((item) => {
          let fallbackValue = item.slug || item.label;

          // ✅ ONLY HANDLE MACD CASE
          if (item.slug === "macd") {
            const label = item.label.toLowerCase();

            if (label.includes("histogram")) {
              fallbackValue = "macd histogram";
            } else if (label.includes("signal")) {
              fallbackValue = "macd signal";
            } else {
              fallbackValue = "macd";
            }
          }

          if (item.slug === "adx") {
            const label = item.label.toLowerCase();
            const key = (item.key || "").toLowerCase(); // assuming backend gives key

            if (key === "plusdi" || label.includes("positive")) {
              fallbackValue = "plus di";
            } else if (key === "minusdi" || label.includes("negative")) {
              fallbackValue = "minus di";
            } else {
              fallbackValue = "adx";
            }
          }

          if (item.slug === "kvo") {
            const label = item.label.toLowerCase();
            const key = (item.key || "").toLowerCase();

            if (key.includes("signal") || label.includes("signal")) {
              fallbackValue = "klinger signal line";
            } else {
              fallbackValue = "kvo";
            }
          }

          if (item.slug === "ichimoku") {
            const label = item.label.toLowerCase();

            if (label.includes("base")) {
              fallbackValue = "ichimoku base line";
            } else if (label.includes("conversion")) {
              fallbackValue = "ichimoku conversion line";
            } else if (label.includes("span a")) {
              fallbackValue = "ichimoku lead line 1";
            } else if (label.includes("span b")) {
              fallbackValue = "ichimoku lead line 2";
            } else if (label.includes("cloud top")) {
              fallbackValue = "ichimoku cloud top";
            } else if (label.includes("cloud bottom")) {
              fallbackValue = "ichimoku cloud bottom";
            } else {
              fallbackValue = "ichimoku";
            }
          }

          if (item.slug === "kc") {
            const label = item.label.toLowerCase();

            if (label.includes("upper")) {
              fallbackValue = "keltner channels upper";
            } else if (label.includes("lower")) {
              fallbackValue = "keltner channels lower";
            } else if (label.includes("middle")) {
              fallbackValue = "keltner channels middle";
            } else {
              fallbackValue = "keltner";
            }
          }

          if (item.slug === "bb") {
            const label = item.label.toLowerCase();

            if (label.includes("%b")) {
              fallbackValue = "bollinger bands percentage b";
            } else if (label.includes("upper")) {
              fallbackValue = "bollinger bands upper";
            } else if (label.includes("lower")) {
              fallbackValue = "bollinger bands lower";
            } else if (label.includes("middle")) {
              fallbackValue = "bollinger bands basis";
            } else if (label.includes("width")) {
              fallbackValue = "bollinger bands width";
            } else {
              fallbackValue = "bollinger bands";
            }
          }

          if (item.slug === "dc") {
            const label = item.label.toLowerCase();

            if (label.includes("upper")) {
              fallbackValue = "donchian channels upper";
            } else if (label.includes("lower")) {
              fallbackValue = "donchian channels lower";
            } else {
              fallbackValue = "donchian channels";
            }
          }

          if (item.slug === "pivot") {
            const label = item.label.toLowerCase();

            if (label.includes("r1")) {
              fallbackValue = "Pivot Point R1";
            } else if (label.includes("r2")) {
              fallbackValue = "Pivot Point R2";
            } else if (label.includes("s1")) {
              fallbackValue = "Pivot Point S1";
            } else if (label.includes("s2")) {
              fallbackValue = "Pivot Point S2";
            } else if (label.includes("point")) {
              fallbackValue = "Pivot Point P";
            } else {
              fallbackValue = "Pivot Point";
            }
          }

          if (item.slug === "aroon") {
            const label = item.label.toLowerCase();

            if (label.includes("up")) {
              fallbackValue = "aroon up";
            } else if (label.includes("down")) {
              fallbackValue = "aroon down";
            } else {
              fallbackValue = "aroon";
            }
          }

          // console.log(scannerOptions, "optionsssss");

          return {
            label: item.label,
            value: fallbackValue,
            slug: item.slug || null,
            meta:
              typeof item.value === "object" && item.value !== null
                ? item.value
                : typeof item.value === "number"
                  ? { length: item.value }
                  : null,
          };
        }),
      ];

      setScannerOptions(formatted);
    } catch (err) {
      console.error("Scanner API Error:", err);
      setScannerOptions([{ label: "Select Scanner", value: "" }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTimeframe();
    fetchScanners();
  }, []);

  const PRICE_FIELDS = [
    "Open",
    "High",
    "Low",
    "Close",
    "Volume",
    "Accumulation / Distribution",
    "Volume Oscillator",
    "Pivot Point",
    "OBV",
    "Session Volume Profile",
  ];

  const getScannerMeta = (value) => {
    const selected = scannerOptions.find((opt) => opt.value === value);

    const meta = selected?.meta || {};

    // ❌ remove timeframe from param check
    const { timeframe, ...restMeta } = meta;

    const hasParams = Object.keys(restMeta).length > 0;

    const isPriceField = PRICE_FIELDS.some(
      (field) => field.toLowerCase() === (value || "").toLowerCase(),
    );

    return {
      selected,
      hasParams,
      isPriceField,
      timeframe: timeframe || null, // ✅ always available
    };
  };

  const MA_INDICATORS = [
    "sma",
    "ema",
    "tema",
    "wma",
    "hma",
    "stddev",
    "wpr",
    "vwma",
    "rma",
  ];

  const ohlcv_dropdown = [
    { label: "Open", value: "open" },
    { label: "High", value: "high" },
    { label: "Low", value: "low" },
    { label: "Close", value: "close" },
    { label: "Volume", value: "volume" },
  ];


  const isMATypeFn = (value = "") =>
    MA_INDICATORS.includes(value.toLowerCase());

  const renderScannerBlock = (rule, config) => {
    const {
      labelField,
      paramsField,
      timeframeField,
      sourceField,
      valueField,
      operatorField,
      isIndicatorField = false,
      isRightSideMain = false,
      sourceOptions = ohlcv_dropdown,
      wrapper = false,
    } = config;

    const currentVal = rule[labelField];
    if (currentVal === undefined) return null;

    const { selected, hasParams, isPriceField } = getScannerMeta(currentVal);
    const isMA = isMATypeFn(currentVal);
    const selectedMeta = selected?.meta || {};

    const content = (
      <>
        {operatorField && (
          <div style={{ color: "#863ccc", fontWeight: 600 }}>
            <EditableSelect
              value={rule[operatorField]}
              options={OPERATORS}
              onChange={(v) => updateField(rule.id, operatorField, v)}
            />
          </div>
        )}

        {String(currentVal).toLowerCase() !== "number" && (
          <EditableSelect
            value={rule[timeframeField] || "1d"}
            options={timeframeOptions}
            onChange={(option) => {
              const raw = option?.value || option;
              const final = handleTimeframeChange(raw, rule.id, timeframeField);
              if (final) updateField(rule.id, timeframeField, final);
            }}
          />
        )}

        <div style={{ color: "#000", fontWeight: 500 }}>
          <EditableSelect
            value={currentVal}
            options={scannerOptions}
            onChange={(v) => {
              if (isIndicatorField || isRightSideMain) {
                updateField(rule.id, labelField, v);
                const { selected: sel } = getScannerMeta(v);
                let params = {};
                if (sel?.meta) {
                  Object.keys(sel.meta).forEach((key) => {
                    params[key] = sel.meta[key];
                  });
                }
                updateField(rule.id, paramsField, params);

                // ✅ Initialize nested fields for Max/Min
                if (v?.toLowerCase() === "max" || v?.toLowerCase() === "min") {
                  updateField(rule.id, `${labelField}NestedIndicator`, "rsi");
                  updateField(rule.id, `${labelField}NestedParams`, {
                    length: 14,
                  });
                  updateField(rule.id, `${labelField}NestedTimeframe`, "1d");
                }

                if (isIndicatorField && sel) {
                  updateField(rule.id, "indicatorType", sel.type);
                }
              } else {
                const { selected: sel } = getScannerMeta(v);
                let params = {};
                if (sel?.meta) {
                  Object.keys(sel.meta).forEach((key) => {
                    params[key] = sel.meta[key];
                  });
                }
                setRules((prev) =>
                  prev.map((r) => {
                    if (r.id === rule.id) {
                      const updated = {
                        ...r,
                        [labelField]: v,
                        [paramsField]: params,
                        [timeframeField]: "1d",
                        [valueField]: 20,
                      };
                      // ✅ Initialize nested fields for Max/Min
                      if (
                        v?.toLowerCase() === "max" ||
                        v?.toLowerCase() === "min"
                      ) {
                        updated[`${labelField}NestedIndicator`] = "rsi";
                        updated[`${labelField}NestedParams`] = { length: 14 };
                        updated[`${labelField}NestedTimeframe`] = "1d";
                      }
                      return updated;
                    }
                    return r;
                  }),
                );
              }
            }}
          />
        </div>

        {hasParams &&
          (isMA ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "#4a7fa5",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span style={{ color: "#2a5070" }}>(</span>

              <span style={{ margin: "0 2px" }}>
                {getTimeframeLabel(rule[timeframeField])}
              </span>

              <EditableSelect
                value={rule[sourceField] || "Close"}
                options={sourceOptions}
                onChange={(v) => updateField(rule.id, sourceField, v)}
              />

              <EditableNumber
                value={
                  rule[paramsField]?.length ??
                  Object.values(selectedMeta)[0] ??
                  20
                }
                onChange={(v) =>
                  setRules((prev) =>
                    prev.map((r) =>
                      r.id === rule.id
                        ? {
                            ...r,
                            [paramsField]: {
                              ...r[paramsField],
                              length: Math.max(0, v),
                            },
                          }
                        : r,
                    ),
                  )
                }
              />

              <span style={{ color: "#2a5070" }}>)</span>
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "#4a7fa5",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span style={{ color: "#2a5070" }}>(</span>

              {currentVal?.toLowerCase() === "max" ||
              currentVal?.toLowerCase() === "min" ? (
                <>
                  <EditableNumber
                    value={rule[paramsField]?.length ?? 20}
                    onChange={(v) =>
                      updateField(rule.id, paramsField, {
                        ...rule[paramsField],
                        length: Math.max(0, v),
                      })
                    }
                  />
                  <span style={{ color: "#2a5070" }}>,</span>
                  {renderScannerBlock(rule, {
                    labelField: `${labelField}NestedIndicator`,
                    paramsField: `${labelField}NestedParams`,
                    timeframeField: `${labelField}NestedTimeframe`,
                    sourceField: `${labelField}NestedSource`,
                    valueField: `${labelField}NestedValue`,
                    isIndicatorField: config.isIndicatorField,
                    isRightSideMain: config.isRightSideMain,
                    sourceOptions: config.sourceOptions,
                    isNestedBlock: true,
                  })}
                </>
              ) : (
                <>
                  {Object.entries(selectedMeta).map(([key], i, arr) => (
                    <span
                      key={key}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      <EditableNumber
                        value={rule[paramsField]?.[key] ?? ""}
                        onChange={(v) =>
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === rule.id
                                ? {
                                    ...r,
                                    [paramsField]: {
                                      ...r[paramsField],
                                      [key]: Math.max(0, v),
                                    },
                                  }
                                : r,
                            ),
                          )
                        }
                      />
                      {i < arr.length - 1 && (
                        <span style={{ color: "#2a5070" }}>,</span>
                      )}
                    </span>
                  ))}
                </>
              )}

              <span style={{ color: "#2a5070" }}>)</span>
            </span>
          ))}
        {String(currentVal).toLowerCase() === "number" && (
          <EditableNumber
            value={rule[valueField] !== undefined ? rule[valueField] : 0}
            onChange={(v) => updateField(rule.id, valueField, v)}
          />
        )}
      </>
    );

    if (wrapper) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          {content}
        </div>
      );
    }

    return content;
  };

  /* ================= UI ================= */

  return (
    <>
      <Container
        className="p-0 overflow-y-auto"
        style={{
          zIndex: 1050,
          height: "100vh",
          transition: "transform 0.5s ease",
          transform: onOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <Card className="border-0 shadow-none p-0">
          <Card.Header className="bg-slate-50 border-0 d-flex align-items-center justify-content-between py-3 px-4">
            <h5 className="mb-0 fs-4  fw-semibold text-dark">Scanner</h5>

            <Button
              variant="light"
              onClick={onClose}
              className="d-flex align-items-center justify-content-center p-1 rounded-circle"
              style={{
                width: "32px",
                height: "32px",
              }}
            >
              <IoClose size={18} />
            </Button>
          </Card.Header>
          <Card.Body className="d-flex flex-column gap-3">
            {/* INPUT */}
            <Stack direction="horizontal" gap={3}>
              <Form.Control
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCondition();
                  }
                }}
                placeholder="Scan coins using simple language like 'coins up by 4% and rising volume'"
                className="flex-grow-1 py-2 px-3 rounded-3 border-2 fw-medium"
                style={{ minWidth: "320px" }}
              />

              <Button
                title="Generate query from natural language"
                onClick={addCondition}
                className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold border-0"
                style={{
                  background: "linear-gradient(to right, #06b6d4, #3b82f6)",
                  boxShadow: "0 4px 15px rgba(6,182,212,0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate
              </Button>
            </Stack>

            {/* FILTER HEADER */}
            <Stack
              direction="horizontal"
              gap={2}
              className="align-items-center flex-wrap"
            >
              <Dropdown onSelect={(val) => setLogic(val)}>
                <Dropdown.Toggle variant="light" size="sm">
                  {logic}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item eventKey="AND">AND</Dropdown.Item>
                  <Dropdown.Item eventKey="OR">OR</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <span className="text-secondary fw-medium small">
                Coins passes all of the below filters in
              </span>
              <EditableMultiSelect
                value={selectedCurrencies}
                options={currencies}
                onChange={setSelectedCurrencies}
                placeholder="Select Currency"
              />
              <span className="text-secondary fw-medium small">Segment</span>
            </Stack>

            {/* EMPTY STATE */}
            {rules.length === 0 && (
              <p className="text-muted small mb-0">
                No rules added. Type a condition or click "Add Rule".
              </p>
            )}

            {/* RULES */}
            {rules.map((rule, index) => {
              return (
                <div
                  key={rule.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1px",
                    padding: "1px",
                    borderRadius: "6px",
                    position: "relative",
                    flex: 1,
                    opacity: rule.disabled ? 0.5 : 1, // ✅ fade
                    pointerEvents: rule.disabled ? "none" : "auto", // ✅ disable interaction
                    background: rule.disabled ? "#f5f5f5" : "transparent", // optional
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#2a4060")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#1e2d3d")
                  }
                >
                  {/* ── Row number pill ── */}
                  <span
                    style={{
                      minWidth: "20px",
                      height: "20px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      background: "#bfc0c0",
                      color: "#1a2840",
                      fontSize: "11px",
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      letterSpacing: "0.02em",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>

                  {/* ── Divider ── */}
                  <div
                    style={{
                      width: "1px",
                      height: "18px",
                      background: "#1e3050",
                      flexShrink: 0,
                    }}
                  />

                  {/* ═══════════ LEFT SIDE ═══════════ */}
                  {renderScannerBlock(rule, {
                    labelField: "indicator",
                    paramsField: "indicatorParams",
                    timeframeField: "timeframe",
                    sourceField: "source",
                    valueField: "value",
                    isIndicatorField: true,
                    sourceOptions: ohlcv_dropdown,
                  })}

                  {/* ═══════════ OPERATOR ═══════════ */}

                  {/* Operator separator lines */}
                  <div style={{ color: "#863ccc", fontWeight: 600 }}>
                    <EditableSelect
                      value={rule.operator}
                      options={OPERATORS}
                      onChange={(v) => updateField(rule.id, "operator", v)}
                    />
                  </div>

                  {/* ═══════════ RIGHT SIDE ═══════════ */}
                  {renderScannerBlock(rule, {
                    labelField: "scanner",
                    paramsField: "scannerParams",
                    timeframeField: "compareTimeframe",
                    sourceField: "scannerSource",
                    valueField: "compareValue",
                    isRightSideMain: true,
                    sourceOptions: ohlcv_dropdown,
                  })}

                  {renderScannerBlock(rule, {
                    labelField: "scanner2",
                    paramsField: "params2",
                    timeframeField: "timeframe2",
                    sourceField: "source2",
                    valueField: "value2",
                    operatorField: "operator2",
                    sourceOptions: ohlcv_dropdown,
                    wrapper: true,
                  })}

                  {renderScannerBlock(rule, {
                    labelField: "scanner3",
                    paramsField: "params3",
                    timeframeField: "timeframe3",
                    sourceField: "source3",
                    valueField: "value3",
                    operatorField: "operator3",
                    sourceOptions: ohlcv_dropdown,
                    wrapper: true,
                  })}

                  {/* ═══════════ ACTIONS ═══════════ */}

                  {!rule.scanner3 && (
                    <span
                      style={{
                        cursor: "pointer",
                        color: "#4a7fa5",
                        fontWeight: 600,
                        marginLeft: "6px",
                        userSelect: "none",
                      }}
                      onClick={() => {
                        setRules((prev) =>
                          prev.map((r) => {
                            if (r.id !== rule.id) return r;

                            if (!r.scanner2) {
                              return {
                                ...r,
                                scanner2: "Number",
                                operator2: "Select Operation",
                                timeframe2: "1d",
                                params2: {},
                                value2: 0,
                              };
                            }

                            if (!r.scanner3) {
                              return {
                                ...r,
                                scanner3: "Number",
                                operator3: "Select Operation",
                                timeframe3: "1d",
                                params3: {},
                                value3: 0,
                              };
                            }

                            return r;
                          }),
                        );
                      }}
                    >
                      <SlCalculator />
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: "2px",
                      alignItems: "center",
                      flexShrink: 0,
                      pointerEvents: "auto",
                    }}
                  >
                    {[
                      {
                        title: "Copy to clipboard",
                        icon: <Copy size={14} />,
                        onClick: () => copyToClipboard(rule),
                        hoverColor: "#3b82f6",
                      },
                      {
                        title: "Duplicate filter",
                        icon: <Files size={14} />,
                        onClick: () => duplicateFilter(rule),
                        hoverColor: "#22c55e",
                      },
                      {
                        title: "Toggle disable",
                        icon: <Ban size={14} />,
                        onClick: () => toggleDisable(rule.id),
                        hoverColor: "#eab308",
                      },
                      {
                        title: "Delete",
                        icon: <Trash2 size={14} />,
                        onClick: () => removeRule(rule?.id),
                        hoverColor: "#ef4444",
                      },
                    ].map(({ title, icon, onClick, hoverColor }) => (
                      <button
                        key={title}
                        title={title}
                        onClick={onClick}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "26px",
                          height: "26px",
                          borderRadius: "5px",
                          border: "1px solid transparent",
                          background: "transparent",
                          color: "#3a5570",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          padding: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = hoverColor;
                          e.currentTarget.style.background = hoverColor + "18";
                          e.currentTarget.style.borderColor = hoverColor + "40";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#3a5570";
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* ADD RULE */}
            <div>
              <Button
                onClick={appendRule}
                title="Add new indicator rule"
                disabled={rules.length >= 30}
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold border-0"
                style={{
                  background: "linear-gradient(to right, #9333ea, #4f46e5)",
                  boxShadow: "0 4px 15px rgba(147,51,234,0.3)",
                  transition: "all 0.1s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <FaPlus />
              </Button>
            </div>

            {/* ACTION BUTTONS */}
            <Stack direction="horizontal" gap={3} className="pt-3 flex-wrap">
              <Button
                size="18"
                onClick={() => {
                  setRunScanTrigger((prev) => !prev);
                  onClose();
                }}
                title="Execute the scan with current rules"
                className="d-flex align-items-center gap-2 px-4 py-2 fw-semibold border-0"
                style={{
                  background: "linear-gradient(135deg, #9333ea, #4f46e5)",
                  boxShadow: "0 4px 15px rgba(147,51,234,0.3)",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  letterSpacing: "0.01em",
                  color: "#fff",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 22px rgba(147,51,234,0.45)";
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #a855f7, #6366f1)";
                  e.currentTarget.querySelector("svg").style.transform =
                    "scale(1.2) rotate(-10deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(147,51,234,0.3)";
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #9333ea, #4f46e5)";
                  e.currentTarget.querySelector("svg").style.transform =
                    "scale(1) rotate(0deg)";
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.97)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
              >
                <FaCirclePlay style={{ transition: "transform 0.25s ease" }} />
                Run Scan
              </Button>

              <Button
                variant="outline-primary"
                title="Save this scan for future use"
                onClick={() => openModal("saveScan")}
                className="d-flex align-items-center gap-2 px-4 py-2 fw-semibold"
                style={{
                  borderColor: "#d8b4fe",
                  color: "#7c3aed",
                  background: "#faf5ff",
                  borderRadius: "12px",
                  borderWidth: "1.5px",
                  fontSize: "0.875rem",
                  letterSpacing: "0.01em",
                  boxShadow:
                    "0 1px 3px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a855f7";
                  e.currentTarget.style.color = "#6d28d9";
                  e.currentTarget.style.background = "#f3e8ff";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.9)";
                  e.currentTarget.querySelector("svg").style.transform =
                    "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d8b4fe";
                  e.currentTarget.style.color = "#7c3aed";
                  e.currentTarget.style.background = "#faf5ff";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";
                  e.currentTarget.querySelector("svg").style.transform =
                    "scale(1)";
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.97)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <HiOutlineSave style={{ transition: "transform 0.22s ease" }} />
                Save Scan
              </Button>

              <Button
                variant="outline-primary"
                title="View historical backtest results"
                onClick={() => openModal("backtestResult")}
                className="d-flex align-items-center gap-2 px-4 py-2 fw-semibold"
                style={{
                  borderColor: "#c7d2fe",
                  color: "#4338ca",
                  background: "#f5f7ff",
                  borderRadius: "12px",
                  borderWidth: "1.5px",
                  fontSize: "0.875rem",
                  letterSpacing: "0.01em",
                  boxShadow:
                    "0 1px 3px rgba(67,56,202,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#818cf8";
                  e.currentTarget.style.color = "#3730a3";
                  e.currentTarget.style.background = "#e0e7ff";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(67,56,202,0.18), inset 0 1px 0 rgba(255,255,255,0.9)";
                  e.currentTarget.querySelector("svg").style.transform =
                    "rotate(-180deg) scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#c7d2fe";
                  e.currentTarget.style.color = "#4338ca";
                  e.currentTarget.style.background = "#f5f7ff";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(67,56,202,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";
                  e.currentTarget.querySelector("svg").style.transform =
                    "rotate(0deg) scale(1)";
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.97)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <RiLoopLeftLine
                  style={{ transition: "transform 0.35s ease" }}
                />
                Backtest Results
              </Button>

              <Button
                variant="outline-warning"
                title="Create alert based on these conditions"
                onClick={() => openModal("createAlert")}
                className="d-flex align-items-center gap-2 px-4 py-2 fw-semibold"
                style={{
                  borderColor: "#fcd34d",
                  color: "#b45309",
                  background: "#fffbeb",
                  borderRadius: "12px",
                  borderWidth: "1.5px",
                  fontSize: "0.875rem",
                  letterSpacing: "0.01em",
                  boxShadow:
                    "0 1px 3px rgba(180,83,9,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#f59e0b";
                  e.currentTarget.style.color = "#92400e";
                  e.currentTarget.style.background = "#fef3c7";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(180,83,9,0.16), inset 0 1px 0 rgba(255,255,255,0.9)";
                  e.currentTarget.querySelector("svg").style.transform =
                    "scale(1.2) rotate(-8deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#fcd34d";
                  e.currentTarget.style.color = "#b45309";
                  e.currentTarget.style.background = "#fffbeb";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(180,83,9,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";
                  e.currentTarget.querySelector("svg").style.transform =
                    "scale(1) rotate(0deg)";
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.97)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <GoAlertFill style={{ transition: "transform 0.3s ease" }} />
                Create Alert
              </Button>
            </Stack>
          </Card.Body>
        </Card>

        {isModalOpen && (
          <IndicatorRuleModals
            type={modalType}
            closeModal={closeModal}
            rules={rules}
            finalRules={finalRules}
            timeframeOptions={timeframeOptions}
            setRunScanTrigger={setRunScanTrigger}
            onClose={onClose}
          />
        )}
      </Container>
      <AlertModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />

      <Modal
        show={timeframePromptConfig.isOpen}
        onHide={() => setTimeframePromptConfig({ isOpen: false })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Enter Number of {timeframePromptConfig.unit || ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-medium">
              Number of {timeframePromptConfig.unit || ""}:
            </Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={50}
              value={timeframePromptInput}
              onChange={(e) => {
                let val = e.target.value;

                // allow empty (for backspace)
                if (val === "") {
                  setTimeframePromptInput("");
                  return;
                }

                val = Number(val);

                // ❌ block > 50
                if (val > 50) {
                  setTimeframePromptInput(50);
                  return;
                }

                // ❌ block < 1
                if (val < 1) {
                  setTimeframePromptInput(1);
                  return;
                }

                setTimeframePromptInput(val);
              }}
              onKeyDown={(e) => e.key === "Enter" && submitTimeframePrompt()}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setTimeframePromptConfig({ isOpen: false })}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            style={{
              background: "linear-gradient(to right, #06b6d4, #3b82f6)",
              border: "none",
            }}
            onClick={submitTimeframePrompt}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
