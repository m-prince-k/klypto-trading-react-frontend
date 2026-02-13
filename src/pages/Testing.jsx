import React, { useState, useRef, useEffect } from "react";

/* ---------------- Editable Select ---------------- */

function EditableSelect({ value, options, onChange }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  if (editing) {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        className="px-2 py-1 text-sm border border-slate-200 rounded-md bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  const label =
    options.find((o) => o.value === value)?.label ?? value;

  return (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer text-sm px-2 py-1 rounded-md hover:bg-slate-100 transition"
    >
      {label}
    </span>
  );
}

/* ---------------- Editable Number ---------------- */

function EditableNumber({ value, onChange, width = "w-20" }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={ref}
        type="number"
        defaultValue={value}
        onBlur={(e) => {
          onChange(Number(e.target.value));
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(Number(e.target.value));
            setEditing(false);
          }
        }}
        className={`${width} px-2 py-1 text-sm border border-slate-200 rounded-md`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`${width} cursor-pointer text-sm px-2 py-1 rounded-md hover:bg-slate-100 transition text-center`}
    >
      {value}
    </span>
  );
}

/* ---------------- Operators ---------------- */

const OPERATORS = [
  { label: "Greater Than (>)", value: ">" },
  { label: "Less Than (<)", value: "<" },
  { label: "Greater Than or Equal (≥)", value: ">=" },
  { label: "Less Than or Equal (≤)", value: "<=" },
  { label: "Equal (=)", value: "=" },
  { label: "Not Equal (≠)", value: "!=" },
  { label: "Crosses Above ⤴", value: "crosses_above" },
  { label: "Crosses Below ⤵", value: "crosses_below" },
  { label: "Rising ↗", value: "rising" },
  { label: "Falling ↘", value: "falling" },
  { label: "Between ⇄", value: "between" },
];

/* ---------------- Main Component ---------------- */

export default function Testing() {
  const [rules, setRules] = useState([
    {
      id: 1,
      timeframe: "Daily",
      indicator: "RSI",
      period: 14,
      operator: ">",
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
      prev.map((rule) =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">

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
          onClick={prependRule}
          className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 transition"
        >
          ↑
        </button>

        <button
          onClick={appendRule}
          className="w-10 h-10 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          +
        </button>
      </div>

      {/* Rules */}
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-4"
        >
          <div className="flex flex-wrap items-center gap-2">

            <EditableSelect
              value={rule.timeframe}
              options={[
                { label: "Daily", value: "Daily" },
                { label: "Weekly", value: "Weekly" },
                { label: "Monthly", value: "Monthly" },
              ]}
              onChange={(v) => updateField(rule.id, "timeframe", v)}
            />

            <EditableSelect
              value={rule.indicator}
              options={[
                { label: "RSI", value: "RSI" },
                { label: "SMA", value: "SMA" },
                { label: "EMA", value: "EMA" },
                { label: "Bollinger Bands", value: "BB" },
              ]}
              onChange={(v) => updateField(rule.id, "indicator", v)}
            />

            {/* Period as label-style number */}
            <EditableNumber
              value={rule.period}
              onChange={(v) => updateField(rule.id, "period", v)}
            />

            <EditableSelect
              value={rule.operator}
              options={OPERATORS}
              onChange={(v) => updateField(rule.id, "operator", v)}
            />

            {/* Value as label-style number */}
            <EditableNumber
              value={rule.value}
              width="w-24"
              onChange={(v) => updateField(rule.id, "value", v)}
            />

            {rules.length > 1 && (
              <button
                onClick={() => removeRule(rule.id)}
                className="w-9 h-9 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                −
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Run Button */}
      <button
        className="
          w-full px-4 py-3 rounded-xl text-sm font-medium
          bg-purple-600 text-white hover:bg-purple-700
          active:scale-[0.98] transition
        "
      >
        Run Query
      </button>
    </div>
  );
}
