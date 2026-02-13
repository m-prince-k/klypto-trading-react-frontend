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
    fetchScanners();

  }, []);

  return (
    <div className="w-full max-w-5xl py-20 mx-auto flex flex-col gap-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Search indicator or rule..."
          className="
            flex-1 min-w-[220px]
            px-3 py-2 text-sm
            border border-slate-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-purple-500
          "
        />

        <button
          onClick={appendRule}
          className="w-10 h-10 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          +
        </button>
      </div>

      {/* Rules */}
      {rules &&
        rules.map((rule) => (
          <div
            key={rule.id}
            className=" flex flex-wrap items-center gap-2 pb-3 last:border-none last:pb-0
      "
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
            

            {rules.length > 1 && (
              <button
                onClick={() => removeRule(rule.id)}
                className="
            w-9 h-9 rounded-lg bg-red-500 text-white
            hover:bg-red-600 transition
          "
              >
                −
              </button>
            )}
          </div>
        ))}
      {/* Run Button */}
      <button
        onClick={() => {
          const payload = buildQueryPayload();
          console.log(payload, "FINAL QUERY");
        }}
        className=" w-fit px-4 py-3 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 "
      >
        Run Query
      </button>
    </div>
  );
}
