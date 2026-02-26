import { useState, useEffect, useRef } from "react";
import { GoAlertFill } from "react-icons/go";
import EditableMultiSelect, {
  EditableSelect,
  EditableNumber,
  OPERATORS,
} from "./EditTableLabel";
import { HiOutlineSave } from "react-icons/hi";
import apiService from "../../services/apiServices";
import { IndicatorRuleModals } from "./indicatorModals/IndicatorRuleModals";
import { FaCirclePlay, FaPlus } from "react-icons/fa6";
import { RiLoopLeftLine } from "react-icons/ri";
import {
  Container,
  Card,
  Form,
  Button,
  Badge,
  Stack,
  CardHeader,
} from "react-bootstrap";
import { IoClose } from "react-icons/io5";

export default function IndicatorRuleBuilder({ onClose, onOpen }) {
  const [timeframeOptions, setTimeframeOptions] = useState([]);
  const [scannerOptions, setScannerOptions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);

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
        { label: "Select Currency", value: "" },
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
      setCurrencies([{ label: "Select Currency", value: "" }]);
    } finally {
      setLoading(false);
    }
  }

  /* Fetch once on mount OR when symbol changes */
  useEffect(() => {
    fetchCurrencies();
  }, []);

  /* ================= NATURAL LANGUAGE STATE ================= */
  const [input, setInput] = useState("");
  // console.log(input, "userinputttttttt")
  const [conditions, setConditions] = useState();

  /* ================= RULES (NO DEFAULT RULE) ================= */
  const [rules, setRules] = useState([]);

  /* ================= CLICK LOCK ================= */
  const clickLockRef = useRef(false);

  /* ================= OPERATOR MAP ================= */
  const operatorMap = {
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
    "=": "=",

    "greater than": ">",
    "is greater than": ">",
    "less than": "<",
    "is less than": "<",
    above: ">",
    below: "<",
    equals: "=",
    "is equal to": "=",
  };

  /* ================= PARSER ================= */
  function parseNaturalConditions(text) {
    if (!text || typeof text !== "string") return null;

    /* ✅ Normalize safely */
    const clean = text
      .toLowerCase()
      .replace(/^\s*(if|when|where)\s+/i, "") // remove starting keywords
      .trim();

    /* ✅ Split logical operators */
    const parts = clean.split(/\s+(?:and|or|also|\&\&|\|\|)\s+/i);

    const results = [];

    for (const segment of parts) {
      const trimmed = segment.trim();

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
      timeframe: "Daily",
      indicator: "",
      period: 14,
      operator: ">",
      scanner: "",
      value: 0,
    };
  }

  /* ================= ADD RULE FROM INPUT ================= */
  const addCondition = () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();

    // Append to the conditions array
    setConditions(trimmedInput);

    // console.log(trimmedInput, "conditionsssssssss");
    const parsedConditions = parseNaturalConditions(input);

    if (!parsedConditions) {
      alert("Could not understand condition");
      return;
    }

    const generatedRules = parsedConditions.map((parsed) => {
      const selected = indicators.find((opt) => opt.value === parsed.indicator);

      return {
        id: Date.now() + Math.random(), // ensure uniqueness
        timeframe: "Daily",
        indicator: parsed.indicator,
        period: selected?.period ?? 14,
        operator: parsed.operator,
        scanner: "",
        value: parsed.value,
      };
    });

    setRules((prev) => [...prev, ...generatedRules]);
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

  async function buildQueryPayload() {
    console.log(rules, "--------------------------------->>>>>>>>>>>>>>");
    let payload = { rules };

    // let payload =  {
    //   rules: rules.map((rule) => ({
    //     timeframe: rule.timeframe,
    //     indicator: rule.indicator,
    //     period: Number(rule.period),
    //     operator: rule.operator,
    //     scanner: rule.scanner,
    //     value: Number(rule.value),
    //   })),

    // };

    try {
      const data = await apiService.post(`scannerIndicator`, payload);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  /* ================= API CALLS ================= */

  async function fetchTimeframe() {
    setLoading(true);

    try {
      const response = await apiService.post("/api/getTimeFrames");
      const data = await response?.data;

      const flattened = [
        { label: "Daily", value: "1d" }, // ✅ ADD THIS
        ...(data.minutes || []),
        ...(data.hours || []),
        ...(data.days || []),
      ];

      setTimeframeOptions(flattened);
    } catch (err) {
      console.error(err);
      setTimeframeOptions([{ label: "Select Timeframe", value: "" }]); // safety
    } finally {
      setLoading(false);
    }
  }

  async function fetchIndicators() {
    try {
      const response = await apiService.post("/api/getIndicators");
      const raw = response.data;

      const formatted = [
        { label: "Add Indicator", value: "" },
        ...(raw ?? []).map((item) => ({
          label: item.label,
          value: item.label.toUpperCase(),
          period: item.value,
        })),
      ];

      setIndicators(formatted);
    } catch (err) {
      console.error("Indicator API Error:", err);
      setIndicators([{ label: "Add Indicator", value: "" }]); // optional safety
    }
  }

  async function fetchScanners() {
    try {
      const response = await apiService.get("/api/scanner");
      const raw = response.data;

      const formatted = [
        { label: "Select Scanner", value: "" }, // ⭐ DEFAULT OPTION
        ...(raw ?? []).map((item) => ({
          label: item.label, // adjust if API differs
          value: item.value ?? item.label, // safe fallback
        })),
      ];

      setScannerOptions(formatted);
    } catch (err) {
      console.error("Scanner API Error:", err);

      setScannerOptions([
        { label: "Select Scanner", value: "" }, // ⭐ SAFETY DEFAULT
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTimeframe();
    fetchIndicators();
    fetchScanners();
  }, []);

  /* ================= UI ================= */

  return (
    <Container
      className="p-0"
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
            <span className="text-secondary fw-medium small">
              Coins passes all of the below filters in
            </span>
            <EditableMultiSelect
              value={selectedCurrencies}
              options={currencies}
              onChange={setSelectedCurrencies}
              placeholder="Select Currency"
            />
            <span className="text-secondary fw-medium small">segment</span>
          </Stack>

          {/* EMPTY STATE */}
          {rules.length === 0 && (
            <p className="text-muted small mb-0">
              No rules added. Type a condition or click "Add Rule".
            </p>
          )}

          {/* RULES */}
          {rules.map((rule, index) => (
            <Stack
              key={rule.id}
              direction="horizontal"
              gap={2}
              className="flex-wrap align-items-center px-3 py-1"
            >
              <Badge
                bg="light"
                text="dark"
                className="font-monospace"
                style={{ width: "20px", textAlign: "center" }}
              >
                {index + 1}
              </Badge>

              <div
                style={{ width: "1px", height: "16px", background: "#374151" }}
              />

              <EditableSelect
                value={rule.timeframe}
                options={timeframeOptions}
                onChange={(v) => updateField(rule.id, "timeframe", v)}
              />

              <EditableSelect
                value={rule.indicator}
                options={indicators}
                onChange={(selectedValue) => {
                  const selected = indicators.find(
                    (opt) => opt.value === selectedValue,
                  );
                  updateField(rule.id, "indicator", selectedValue);
                  if (selected?.period !== undefined) {
                    updateField(rule.id, "period", selected.period);
                  }
                }}
              />

              <EditableNumber
                value={rule.period}
                onChange={(v) => updateField(rule.id, "period", Math.max(0, v))}
              />

              <Stack
                direction="horizontal"
                gap={2}
                className="px-2 py-1 rounded-3"
              >
                <EditableSelect
                  value={rule.operator}
                  options={OPERATORS}
                  onChange={(v) => updateField(rule.id, "operator", v)}
                />
              </Stack>

              <EditableSelect
                value={rule.scanner}
                options={scannerOptions}
                onChange={(v) => updateField(rule.id, "scanner", v)}
              />

              <EditableNumber
                value={rule.value}
                onChange={(v) => updateField(rule.id, "value", v)}
              />

              <Button
                variant="light"
                onClick={() => removeRule(rule.id)}
                className="p-0 border-0 bg-transparent text-secondary d-flex align-items-center justify-content-center"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                ×
              </Button>
            </Stack>
          ))}

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
              onClick={() => {
                const payload = buildQueryPayload();
                onClose();
              }}
              title="Execute the scan with current rules"
              className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold border-0"
              style={{
                background: "linear-gradient(to right, #9333ea, #4f46e5)",
                boxShadow: "0 4px 15px rgba(147,51,234,0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <FaCirclePlay />
              Run Scan
            </Button>

            <Button
              variant="outline-primary"
              title="Save this scan for future use"
              onClick={() => openModal("saveScan")}
              className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold"
              style={{ borderColor: "#e9d5ff", color: "#9333ea" }}
            >
              <HiOutlineSave />
              Save Scan
            </Button>

            <Button
              variant="outline-primary"
              title="View historical backtest results"
              onClick={() => openModal("backtestResult")}
              className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold"
              style={{ borderColor: "#c7d2fe", color: "#4f46e5" }}
            >
              <RiLoopLeftLine />
              Backtest Results
            </Button>

            <Button
              variant="outline-warning"
              title="Create alert based on these conditions"
              onClick={() => openModal("createAlert")}
              className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold"
              style={{ borderColor: "#fde68a", color: "#d97706" }}
            >
              <GoAlertFill />
              Create Alert
            </Button>
          </Stack>
        </Card.Body>
      </Card>

      {isModalOpen && (
        <IndicatorRuleModals
          type={modalType}
          onClose={closeModal}
          rules={rules}
          conditions = {conditions}
          timeframeOptions={timeframeOptions}
        />
      )}
    </Container>
  );
}
