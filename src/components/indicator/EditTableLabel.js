import { useState, useEffect, useRef } from "react";

export function EditableSelect({ value, options, onChange }) {
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
        {options.map((opt,index) => (
          <option key={index} value={opt.value}>
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

export function EditableNumber({ value, onChange, width = "w-20" }) {
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
        min={0}
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

export const OPERATORS = [
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
