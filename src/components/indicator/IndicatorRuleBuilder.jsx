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

export default function IndicatorRuleBuilder() {
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
      let response = await apiService.post(`getCurrencies`);
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
  const [conditions, setConditions] = useState([]);

  /* ================= RULES (NO DEFAULT RULE) ================= */
  const [rules, setRules] = useState([]);

  /* ================= CLICK LOCK ================= */
  const clickLockRef = useRef(false);

  /* ================= OPERATOR MAP ================= */
  const operatorMap = {
    "greater than": ">",
    "more than": ">",
    above: ">",
    "less than": "<",
    below: "<",
    "equal to": "==",
    "not equal to": "!=",
  };

  /* ================= PARSER ================= */
  function parseNaturalConditions(text) {
    const clean = text.toLowerCase().replace("if", "").trim();

    // Split on " and "
    const parts = clean.split(/\s+and\s+/);

    const results = [];

    for (const segment of parts) {
      for (const phrase in operatorMap) {
        if (segment.includes(phrase)) {
          const pieces = segment.split(phrase);
          if (pieces.length !== 2) continue;

          const leftRaw = pieces[0].replace("is", "").trim();
          const rightRaw = pieces[1].trim();

          const value = isNaN(rightRaw) ? rightRaw : Number(rightRaw);

          results.push({
            indicator: leftRaw.toUpperCase(),
            operator: operatorMap[phrase],
            value,
          });
          break;
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
      const response = await apiService.post("getTimeFrames");
      const data = response.data;

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
      const response = await apiService.post("getIndicators");
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
      const response = await apiService.get("scanner");
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
    <div className="w-full max-w-5xl py-10 mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col gap-4">
          {/* INPUT */}
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCondition();
                }
              }}
              placeholder="Scan stocks using simple language like 'stocks up by 4% and rising volume'"
              className="
            flex-1 min-w-[320px]
            px-4 py-3 text-sm font-medium
            border-2 border-slate-200 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300
            bg-white shadow-sm
            placeholder:text-slate-400
            transition-all duration-200
            hover:border-slate-300
          "
            />

            <button
              title="Generate query from natural language"
              onClick={addCondition}
              className="
            group relative px-6 py-3 rounded-xl text-sm font-bold
            bg-gradient-to-r from-cyan-500 to-blue-500 text-white
            hover:from-cyan-600 hover:to-blue-600
            shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40
            transition-all duration-300 hover:-translate-y-0.5
            overflow-hidden
            flex items-center gap-2
          "
            >
              <svg
                className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
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
              <span className="relative z-10">Generate</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm  font-medium">
            <h2 className="text-slate-700">
              Stock passes all of the below filters in
            </h2>

            <EditableMultiSelect
              value={selectedCurrencies}
              options={currencies}
              onChange={setSelectedCurrencies}
              placeholder="Select Currency"
            />

            {/* <EditableSelect
              value={selectedCurrency}
              options={currencies}
              onChange={(v) => setSelectedCurrency(v)}
            /> */}

            <span className="text-slate-700">segment</span>
          </div>

          {/* EMPTY STATE */}
          {rules.length === 0 && (
            <div className="text-sm text-slate-400">
              No rules added. Type a condition or click "Add Rule".
            </div>
          )}

          {/* RULES */}
          {rules.map((rule, index) => (
            <div
              key={rule.id}
              className="group flex flex-wrap items-center gap-1.5 px-4 py-1"
            >
              {/* Row index badge */}
              <span className="text-xs font-mono text-gray-600 w-5 text-center select-none shrink-0">
                {index + 1}
              </span>

              <div className="w-px h-4 bg-gray-700 shrink-0" />

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

              {/* Operator divider */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg ">
                <EditableSelect
                  value={rule.operator}
                  options={OPERATORS}
                  onChange={(v) => updateField(rule.id, "operator", v)}
                />
              </div>

              <EditableSelect
                value={rule.scanner}
                options={scannerOptions}
                onChange={(v) => updateField(rule.id, "scanner", v)}
              />

              <EditableNumber
                value={rule.value}
                onChange={(v) => updateField(rule.id, "value", v)}
              />

              <button
                onClick={() => removeRule(rule.id)}
                className=" w-6 h-6 rounded-md text-gray-600 text-base leading-none border border-transparent bg-transparent"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={appendRule}
              title="Add new indicator rule"
              className="
              group flex items-center gap-2 px-4 py-2.5 rounded-xl 
              bg-gradient-to-r from-purple-600 to-indigo-600 
              hover:from-purple-700 hover:to-indigo-700
              text-white font-semibold text-sm
              shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
              transition-all duration-100 hover:-translate-y-0.5
              overflow-hidden
            "
            >
              <FaPlus />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={() => {
                const payload = buildQueryPayload();
                console.log(payload, "FINAL QUERY");
              }}
              title="Execute the scan with current rules"
              className="
            group relative px-6 py-3 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
            hover:from-purple-700 hover:to-indigo-700 
            transition-all duration-300
            shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
            hover:-translate-y-0.5
            overflow-hidden
            flex items-center gap-2
          "
            >
              <FaCirclePlay />
              <span className="relative z-10">Run Scan</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>

            {/* Save Scan  */}
            <button
              title="Save this scan for future use"
              onClick={() => openModal("saveScan")}
              className="
            px-6 py-3 rounded-xl text-sm font-semibold
            bg-white text-purple-600 border-2 border-purple-200
            hover:bg-purple-50 hover:border-purple-300
            transition-all duration-200
            flex items-center gap-2
          "
            >
              <HiOutlineSave />
              Save Scan
            </button>
            {/* Backtest Results */}
            <button
              title="View historical backtest results"
              onClick={() => openModal("backtestResult")}
              className=" px-6 py-3 rounded-xl text-sm font-semibold bg-white text-indigo-600 border-2 border-indigo-200
            hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 flex items-center gap-2"
            >
              <RiLoopLeftLine />
              Backtest Results
            </button>
            {/* Create Alert */}
            <button
              title="Create alert based on these conditions"
              onClick={() => openModal("createAlert")}
              className="
            px-6 py-3 rounded-xl text-sm font-semibold
            bg-white text-amber-600 border-2 border-amber-200
            hover:bg-amber-50 hover:border-amber-300
            transition-all duration-200
            flex items-center gap-2
          "
            >
              <GoAlertFill />
              Create Alert
            </button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <IndicatorRuleModals
          type={modalType}
          onClose={closeModal}
          rules={rules}
          timeframeOptions={timeframeOptions}
        />
      )}
    </div>
  );
}
