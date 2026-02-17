import { useState, useEffect, useRef } from "react";
import { EditableSelect, EditableNumber, OPERATORS } from "./EditTableLabel";
import EditableLabel from "../../components/indicator/EditTableLabel";
import apiService from "../../services/apiServices";

export default function IndicatorRuleBuilder() {
  const [timeframeOptions, setTimeframeOptions] = useState([]);
  const [scannerOptions, setScannerOptions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

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
  function parseNaturalCondition(text) {
    const clean = text.toLowerCase().replace("if", "").trim();

    for (const phrase in operatorMap) {
      if (clean.includes(phrase)) {
        const parts = clean.split(phrase);
        if (parts.length !== 2) return null;

        const leftRaw = parts[0].replace("is", "").trim();
        const rightRaw = parts[1].trim();

        const value = isNaN(rightRaw) ? rightRaw : Number(rightRaw);

        return {
          indicator: leftRaw.toUpperCase(),
          operator: operatorMap[phrase],
          value,
        };
      }
    }

    return null;
  }

  /* ================= RULE FACTORY ================= */
  function newRule() {
    return {
      id: Date.now(),
      timeframe: "Daily",
      indicator: "",
      period: 14,
      operator: ">",
      scanners: "",
      value: 50,
    };
  }

  /* ================= ADD RULE FROM INPUT ================= */
  const addCondition = () => {
    if (!input.trim()) return;

    const parsed = parseNaturalCondition(input);

    if (!parsed) {
      alert("Could not understand condition");
      return;
    }

    const selected = indicators.find((opt) => opt.value === parsed.indicator);

    const newGeneratedRule = {
      id: Date.now(),
      timeframe: "Daily",
      indicator: parsed.indicator,
      period: selected?.period ?? 14,
      operator: parsed.operator,
      value: parsed.value,
    };

    setRules((prev) => [...prev, newGeneratedRule]);
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

  function buildQueryPayload() {
    return {
      rules: rules.map((rule) => ({
        timeframe: rule.timeframe,
        indicator: rule.indicator,
        period: Number(rule.period),
        operator: rule.operator,
        value: Number(rule.value),
      })),
    };
  }

  /* ================= API CALLS ================= */

  async function fetchTimeframe() {
    try {
      const response = await apiService.post("getTimeFrames");
      const raw = response.data;

      const formatted = Object.entries(raw ?? {}).flatMap(([group, values]) =>
        (values ?? []).map((item) => {
          const val = item.value ?? item.interval ?? item.timeframe ?? item.id;

          return {
            label: item.label ?? `${val} (${group})`,
            value: `${group}_${val}`,
          };
        }),
      );

      setTimeframeOptions(formatted);
    } catch (err) {
      console.error("Timeframe API Error:", err);
      setTimeframeOptions([]);
    }
  }

  async function fetchIndicators() {
    try {
      const response = await apiService.post("getIndicators");
      const raw = response.data;

      const formatted = (raw ?? []).map((item) => ({
        label: item.label,
        value: item.label.toUpperCase(),
        period: item.value,
      }));

      setIndicators(formatted);
    } catch (err) {
      console.error("Indicator API Error:", err);
      setIndicators([]);
    }
  }

  async function fetchScanners() {
    try {
      const response = await apiService.get("scanner");
      setScannerOptions(response.data ?? []);
    } catch (err) {
      console.error("Scanner API Error:", err);
      setScannerOptions([]);
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

          {/* EMPTY STATE */}
          {rules.length === 0 && (
            <div className="text-sm text-slate-400">
              No rules added. Type a condition or click "Add Rule".
            </div>
          )}

          {/* RULES */}
          {rules.map((rule) => (
            <div key={rule.id} className="flex flex-wrap gap-2">
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

              <EditableSelect
                value={rule.operator}
                options={OPERATORS}
                onChange={(v) => updateField(rule.id, "operator", v)}
              />

              <EditableNumber
                value={rule.value}
                onChange={(v) => updateField(rule.id, "value", v)}
              />

              <button onClick={() => removeRule(rule.id)}>×</button>
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
              <svg
                className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="relative z-10">Run Scan</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>

            <button
              title="Save this scan for future use"
              className="
            px-6 py-3 rounded-xl text-sm font-semibold
            bg-white text-purple-600 border-2 border-purple-200
            hover:bg-purple-50 hover:border-purple-300
            transition-all duration-200
            flex items-center gap-2
          "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save Scan
            </button>

            <button
              title="View historical backtest results"
              className="
            px-6 py-3 rounded-xl text-sm font-semibold
            bg-white text-indigo-600 border-2 border-indigo-200
            hover:bg-indigo-50 hover:border-indigo-300
            transition-all duration-200
            flex items-center gap-2
          "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Backtest Results
            </button>

            <button
              title="Create alert based on these conditions"
              className="
            px-6 py-3 rounded-xl text-sm font-semibold
            bg-white text-amber-600 border-2 border-amber-200
            hover:bg-amber-50 hover:border-amber-300
            transition-all duration-200
            flex items-center gap-2
          "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Create Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
