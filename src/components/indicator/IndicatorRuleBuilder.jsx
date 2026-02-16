import { useState, useEffect } from "react";
import { EditableSelect, EditableNumber, OPERATORS } from "./EditTableLabel";
import EditableLabel from "../../components/indicator/EditTableLabel";
import apiService from "../../services/apiServices";

export default function IndicatorRuleBuilder() {
  const [timeframeOptions, setTimeframeOptions] = useState([]);
  const [scannerOptions, setScannerOptions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rules, setRules] = useState([
    {
      id: 1,
      timeframe: "Daily",
      indicator: "RSI",
      period: 14,
      operator: ">",
      scanners: "Select Scanner",
      value: 50,
    },
  ]);

  function newRule() {
    return {
      id: Date.now(),
      timeframe: "Daily",
      indicator: "RSI",
      period: 14,
      operator: ">",
      scanners: "",
      value: 50,
    };
  }

  function appendRule() {
    setRules((prev) => [...prev, newRule()]);
  }

  function prependRule() {
    setRules((prev) => [newRule(), ...prev]);
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
    return rules.map((rule) => ({
      timeframe: rule.timeframe,
      indicator: rule.indicator,
      period: Number(rule.period),
      operator: rule.operator,
      value: Number(rule.value),
    }));
  }
  async function fetchTimeframe() {
    setLoading(true);
    // setError(null);

    try {
      const response = await apiService.post("getTimeFrames");
      setTimeframeOptions(response.data);
    } catch (err) {
      console.error(err);
      //   setError(err?.message || "Failed to fetch timeframes");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTimeframe() {
    setLoading(true);

    try {
      const response = await apiService.post("getTimeFrames");

      const raw = response.data;

      console.log(raw, "timeframes raw");

      // ✅ Convert OBJECT → ARRAY
      const formatted = Object.entries(raw ?? {}).flatMap(([group, values]) =>
        (values ?? []).map((item) => {
          const val = item.value ?? item.interval ?? item.timeframe ?? item.id;

          const label = item.label ?? `${val} (${group})`;

          return {
            label,
            value: `${group}_${val}`, // still keep unique
          };
        }),
      );

      setTimeframeOptions(formatted);

      console.log(formatted, "timeframes formatted");
    } catch (err) {
      console.error("Timeframe API Error:", err);
      setTimeframeOptions([]);
    } finally {
      setLoading(false);
    }
  }

async function fetchIndicators() {
  setLoading(true);

  try {
    const response = await apiService.post("getIndicators");

    const raw = response.data;

    console.log(raw, "indicators raw");

    // ✅ API already returns array → use directly
    const formatted = (raw ?? []).map((item) => ({
      label: item.label,
      value: item.label,   // store label for select matching
      period: item.value,  // keep default period if needed
    }));

    setIndicators([
      { label: "Select Indicator", value: "" },
      ...formatted,
    ]);

    console.log(formatted, "indicators formatted");
  } catch (err) {
    console.error("Indicator API Error:", err);
    setIndicators([]);
  } finally {
    setLoading(false);
  }
}

 async function fetchScanners() {
  setLoading(true);

  try {
    const response = await apiService.get("scanner");

    const raw = response.data;

    console.log(raw, "scanner raw");

    // ✅ Directly use API result
    setScannerOptions(raw ?? []);

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
    // fetchScanners();

  }, []);

  return (
<div className="w-full max-w-5xl py-10 mx-auto">
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
    {/* Header */}
    <div className="mb-8">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
        Query Builder
      </h2>
      <p className="text-slate-600">Create custom trading rules and indicators</p>
    </div>

    <div className="flex flex-col gap-6">
      {/* Top Controls - Search with Generate Button */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl border border-slate-200/50">
        <input
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
          <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="relative z-10">Generate</span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </button>
      </div>

      {/* Rules - Stacked Vertically */}
      <div className="flex flex-col gap-2">
        {rules &&
          rules.map((rule, index) => (
            <div
              key={rule.id}
              className="group relative flex flex-wrap items-center gap-2 p-2 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-md"
              style={{
                animation: `fadeInSlide 0.4s ease-out ${index * 0.1}s both`
              }}
            >
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
                    (opt) => opt.value === selectedValue
                  );

                  updateField(rule.id, "indicator", selectedValue);

                  // ✅ Auto set period from indicator config
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

              <EditableSelect
                value={rule.scanners}
                options={scannerOptions}
                onChange={(v) => updateField(rule.id, "scanners", v)}
              />

              <EditableNumber
                value={rule.value}
                width="w-24"
                onChange={(v) => updateField(rule.id, "value", v)}
              />

              {/* Action Icons - Always Show */}
              <div className="ml-auto flex items-center gap-1">
                <button
                  title="Duplicate rule"
                  className="
                    w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500
                    hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600
                    transition-all duration-200
                    flex items-center justify-center
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                <button
                  title="Edit rule"
                  className="
                    w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500
                    hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600
                    transition-all duration-200
                    flex items-center justify-center
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button
                  title="Save rule"
                  className="
                    w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500
                    hover:bg-green-50 hover:border-green-300 hover:text-green-600
                    transition-all duration-200
                    flex items-center justify-center
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                {rules.length > 1 && (
                  <button
                    onClick={() => removeRule(rule.id)}
                    title="Remove rule"
                    className="
                      w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500
                      hover:bg-red-50 hover:border-red-300 hover:text-red-600
                      transition-all duration-200
                      flex items-center justify-center text-lg
                    "
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Add Query Button - Below all rules */}
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
              transition-all duration-300 hover:-translate-y-0.5
              overflow-hidden
            "
          >
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>

        </div>
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Create Alert
        </button>
      </div>
    </div>
  </div>

  <style jsx>{`
    @keyframes fadeInSlide {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `}</style>
</div>
);
}
