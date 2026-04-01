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
import IndicatorBuildingListing from "./IndicatorBuilderListing";
import { operatorMap, timeframeMap, OPERATORS } from "../../util/common";

export default function IndicatorRuleBuilder({
  onClose,
  onOpen,
  rules,
  setRules,
  runScanTrigger,
  setRunScanTrigger,
  setListingTimeframe,
  listingTimeframe,
  selectedCurrencies,
  setSelectedCurrencies,
}) {
  const [timeframeOptions, setTimeframeOptions] = useState([]);
  const [scannerOptions, setScannerOptions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTimeframeModal, setShowTimeframeModal] = useState(false);
  const [availableTimeframes, setAvailableTimeframes] = useState([]);
  const [selectedTF, setSelectedTF] = useState("");
  const [logic, setLogic] = useState("AND");

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

      /* Always keep dropdown usable */
      // setCurrencies([{ label: "Select Currency", value: "" }]);
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
      prev.map((f) => (f.id === id ? { ...f, disabled: !f.disabled } : f)),
    );
  };

  /* Fetch once on mount OR when symbol changes */
  useEffect(() => {
    fetchCurrencies();
  }, []);

  /* ================= NATURAL LANGUAGE STATE ================= */
  const [input, setInput] = useState("");
  // console.log(input, "userinputttttttt")
  const [conditions, setConditions] = useState();

  /* ================= CLICK LOCK ================= */
  const clickLockRef = useRef(false);

  /* ================= OPERATOR MAP ================= */

  /* ================= PARSER ================= */
  function parseNaturalConditions(text) {
    if (!text || typeof text !== "string") return null;

    /* ✅ Normalize safely */
    const clean = text
      .toLowerCase()
      .replace(/^\s*(if|when|where)\s+/i, "") // remove starting keywords
      .trim();

    /* ✅ Split logical operators */
    const parts = clean.split(/\s+(?:and|or|also|&|\|)\s+/i);

    const results = [];

    for (const segment of parts) {
      let trimmed = segment.trim();

      /* ================= EXTRACT TIMEFRAME ================= */
      let timeframe = "1d"; // default

      for (const key in timeframeMap) {
        if (trimmed.includes(key)) {
          timeframe = timeframeMap[key];
          trimmed = trimmed.replace(key, "").trim(); // remove from text
          break;
        }
      }

      for (const phrase in operatorMap) {
        if (trimmed.includes(phrase)) {
          const pieces = trimmed.split(phrase);

          if (pieces.length !== 2) continue;

          /* ✅ Clean left side */
          const leftRaw = pieces[0]
            .replace(/\bis\b/g, "") // remove standalone "is"
            .trim();

          /* ✅ Clean right side */
          const rightRaw = pieces[1].trim();

          const value = isNaN(rightRaw) ? rightRaw : Number(rightRaw);

          results.push({
            timeframe,
            indicator: leftRaw.toUpperCase(),
            operator: operatorMap[phrase],
            value,
          });

          break; // stop checking phrases once matched
        }
      }
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
  const addCondition = () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();

    // Append to the conditions array
    setConditions(trimmedInput);

    const parsedConditions = parseNaturalConditions(input);

    if (!parsedConditions) {
      alert("Could not understand condition");
      return;
    }

    const generatedRules = parsedConditions.map((parsed) => {
      const selected = indicators.find((opt) => opt.value === parsed.indicator);

      return {
        id: Date.now() + Math.random(),
        timeframe: parsed.timeframe || "1d",
        indicator: parsed.indicator,
        length: 0,
        value: 0,
        operator: parsed.operator,
        compareIndicator: parsed.indicator,
        compareTimeframe: parsed.timeframe || "1d",
        scanner: "Number",
        compareLength: 0,
        compareValue: parsed.value,
        disabled: false,
      };
    });

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

  const handleTimeframeChange = (value) => {
    if (!value) return;

    // ✅ ONLY run for "n" options
    if (value.startsWith("n")) {
      const short = value[1]; // d, w, m, q, y

      const labelMap = {
        d: "days",
        w: "weeks",
        m: "months",
        q: "quarters",
        y: "years",
      };

      const unit = labelMap[short];

      const input = prompt(`Enter number of ${unit}:`);

      if (!input || isNaN(input) || Number(input) <= 0) return;

      const num = Number(input);

      const newOption = {
        label: `${num} ${unit} ago`,
        value: `${num}${short}_ago`,
      };

      // ✅ Insert BEFORE "n option"
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

      return newOption.value;
    }

    // ✅ normal values (1d_ago, 2d_ago etc.)
    return value;
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

      // console.log(flattened, "timeframeeeeeeeeeeeeee options");

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
      const quartersAgoOptions = generateAgoOptions(3, "quarter", "q");
      const yearsAgoOptions = generateAgoOptions(3, "year", "y");

      const finalOptions = [
        ...flattened,
        ...daysAgoOptions,
        ...weeksAgoOptions,
        ...monthsAgoOptions,
        ...quartersAgoOptions,
        ...yearsAgoOptions,
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
        ...(raw ?? []).map((item) => ({
          label: item.label,

          // ✅ use slug as value (IMPORTANT)
          value: item.slug,

          // optional (keep full object if needed)
          slug: item.slug,

          meta:
            typeof item.value === "object" && item.value !== null
              ? item.value
              : typeof item.value === "number"
                ? { length: item.value }
                : null,
        })),
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

  /* ================= UI ================= */

  return (
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
            const selectedIndicator = scannerOptions.find(
              (opt) => opt.value === rule.indicator,
            );

            const selectedScanner = scannerOptions.find(
              (opt) => opt.value === rule.scanner,
            );

            const indicatorHasParams =
              selectedIndicator?.meta &&
              Object.keys(selectedIndicator.meta).length > 0;

            const scannerHasParams =
              selectedScanner?.meta &&
              Object.keys(selectedScanner.meta).length > 0;

            const PRICE_FIELDS = [
              "Open",
              "High",
              "Low",
              "Close",
              "Volume",
              "% Change",
              "VWAP",
            ];

            const isIndicatorPriceField = PRICE_FIELDS.includes(rule.indicator);
            const isScannerPriceField = PRICE_FIELDS.includes(rule.scanner);

            return (
              <div
                key={rule.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  // background: "linear-gradient(135deg, #0f1923 0%, #111d2b 100%)",
                  // border: "1px solid #1e2d3d",
                  // boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  position: "relative",
                  // transition: "border-color 0.2s",
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
                    minWidth: "22px",
                    height: "22px",
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

                {(indicatorHasParams || isIndicatorPriceField) && (
                  <EditableSelect
                    value={rule.timeframe}
                    options={timeframeOptions}
                    onChange={(option) => {
                      const rawValue = option?.value || option;
                      const finalValue = handleTimeframeChange(rawValue);
                      if (finalValue)
                        updateField(rule.id, "timeframe", finalValue);
                    }}
                  />
                )}

                <EditableSelect
                  value={rule.indicator}
                  options={scannerOptions}
                  onChange={(v) => {
                    updateField(rule.id, "indicator", v);
                    const selected = scannerOptions.find(
                      (opt) => opt.value === v,
                    );
                    if (selected?.meta) {
                      const params = {};
                      Object.keys(selected.meta).forEach((key) => {
                        params[key] = selected.meta[key];
                      });
                      updateField(rule.id, "indicatorParams", params);
                    }
                  }}
                />

                {indicatorHasParams && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      color: "#4a7fa5",
                      fontSize: "13px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <span style={{ color: "#2a5070" }}>(</span>
                    {Object.entries(selectedIndicator.meta).map(
                      ([key], i, arr) => (
                        <span
                          key={key}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <EditableNumber
                            value={rule.indicatorParams?.[key] ?? ""}
                            onChange={(v) =>
                              setRules((prev) =>
                                prev.map((r) =>
                                  r.id === rule.id
                                    ? {
                                        ...r,
                                        indicatorParams: {
                                          ...r.indicatorParams,
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
                      ),
                    )}
                    <span style={{ color: "#2a5070" }}>)</span>
                  </span>
                )}

                {!indicatorHasParams && !isIndicatorPriceField && (
                  <EditableNumber
                    value={rule.value}
                    onChange={(v) => updateField(rule.id, "value", v)}
                  />
                )}

                {/* ═══════════ OPERATOR ═══════════ */}

                {/* Operator separator lines */}
                <div style={{ color: "#431e66", fontWeight: 600 }}>
                  <EditableSelect
                    value={rule.operator}
                    options={OPERATORS}
                    onChange={(v) => updateField(rule.id, "operator", v)}
                  />
                </div>

                {/* ═══════════ RIGHT SIDE ═══════════ */}

                {(scannerHasParams || isScannerPriceField) && (
                  <EditableSelect
                    value={rule.compareTimeframe}
                    options={timeframeOptions}
                    onChange={(option) => {
                      const rawValue = option?.value || option;
                      const finalValue = handleTimeframeChange(rawValue);
                      if (finalValue)
                        updateField(rule.id, "compareTimeframe", finalValue);
                    }}
                  />
                )}

                <div style={{ color: "#431e66", fontWeight: 600 }}>
                  <EditableSelect
                    value={rule.scanner}
                    options={scannerOptions}
                    onChange={(v) => {
                      updateField(rule.id, "scanner", v);
                      const selected = scannerOptions.find(
                        (opt) => opt.value === v,
                      );
                      if (selected?.meta) {
                        const params = {};
                        Object.keys(selected.meta).forEach((key) => {
                          params[key] = selected.meta[key];
                        });
                        updateField(rule.id, "scannerParams", params);
                      }
                    }}
                  />
                </div>

                {scannerHasParams && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      color: "#4a7fa5",
                      fontSize: "13px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <span style={{ color: "#2a5070" }}>(</span>
                    {Object.entries(selectedScanner.meta).map(
                      ([key], i, arr) => (
                        <span
                          key={key}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <EditableNumber
                            value={rule.scannerParams?.[key] ?? ""}
                            onChange={(v) =>
                              setRules((prev) =>
                                prev.map((r) =>
                                  r.id === rule.id
                                    ? {
                                        ...r,
                                        scannerParams: {
                                          ...r.scannerParams,
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
                      ),
                    )}
                    <span style={{ color: "#2a5070" }}>)</span>
                  </span>
                )}

                {!scannerHasParams && !isScannerPriceField && (
                  <EditableNumber
                    value={rule.compareValue}
                    onChange={(v) => updateField(rule.id, "compareValue", v)}
                  />
                )}

                {/* ═══════════ ACTIONS ═══════════ */}

                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    marginLeft: "auto",
                    paddingLeft: "8px",
                    alignItems: "center",
                    flexShrink: 0,
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
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <RiLoopLeftLine style={{ transition: "transform 0.35s ease" }} />
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
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
          conditions={conditions}
          timeframeOptions={timeframeOptions}
          setRunScanTrigger={setRunScanTrigger}
          onClose={onClose}
        />
      )}
    </Container>
  );
}
