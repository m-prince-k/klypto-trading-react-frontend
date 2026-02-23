import { useState, useEffect, useRef, useMemo } from "react";

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
export default function EditableMultiSelect({
  value = [],                 // [{label, value}]
  options = [],               // [{label, value}]
  onChange,
  placeholder = "Select",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* ---------------- FILTERED OPTIONS ---------------- */

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    return options.filter(opt =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  /* ---------------- HELPERS ---------------- */

  const isSelected = (opt) =>
    value.some(v => v.value === opt.value);

  function toggleOption(option) {
    let updated;

    if (isSelected(option)) {
      updated = value.filter(v => v.value !== option.value);
    } else {
      updated = [...value, option];
    }

    onChange?.(updated);
  }

  function toggleAll() {
    if (value.length === filteredOptions.length) {
      onChange?.([]);
    } else {
      onChange?.(filteredOptions);
    }
  }

  const allSelected =
    filteredOptions.length > 0 &&
    value.length === filteredOptions.length;

  /* ---------------- DISPLAY ---------------- */

  const display = value.length === 0
    ? placeholder
    : (
        <div className="flex flex-wrap gap-1">
          {value.map(item => (
            <span
              key={item.value}
              className="
                px-2 py-0.5 rounded-md text-xs font-medium
                bg-purple-100 text-purple-700
              "
            >
              {item.label}
            </span>
          ))}
        </div>
      );

  /* ---------------- RENDER ---------------- */

  return (
    <div ref={ref} className={`relative text-sm ${className}`}>
      {/* FIELD */}
      <div
        onClick={() => setOpen(o => !o)}
        className="
          min-h-[36px] w-fit px-3 py-1.5 rounded-lg cursor-pointer
          bg-white border border-slate-200
          hover:border-purple-300
          flex items-center
          transition
        "
      >
        <div className="flex-1 text-slate-700 font-semibold">
          {display}
        </div>

        <div
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </div>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute z-50 mt-1 w-xs bg-white
            border border-slate-200 rounded-lg shadow-lg
            overflow-hidden
          "
        >
          {/* SEARCH */}
          <div className="p-2 border-b border-slate-100">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="
                w-full px-2 py-1.5 rounded-md text-sm
                border border-slate-200
                focus:outline-none focus:ring-2 focus:ring-purple-500
              "
            />
          </div>

          {/* SELECT ALL */}
          <label
            className="
              flex items-center gap-2 px-3 py-2 cursor-pointer
              bg-slate-50 hover:bg-purple-50
              text-xs font-semibold text-slate-600
            "
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="accent-purple-600"
            />
            Select All
          </label>

          {/* OPTIONS */}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map(option => (
              <label
                key={option.value}
                className="
                  flex items-center gap-2 px-3 py-2 cursor-pointer
                  hover:bg-purple-50
                  text-slate-700
                  transition
                "
              >
                <input
                  type="checkbox"
                  checked={isSelected(option)}
                  onChange={() => toggleOption(option)}
                  className="accent-purple-600"
                />
                {option.label}
              </label>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-3 text-slate-400 text-xs">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
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

];
