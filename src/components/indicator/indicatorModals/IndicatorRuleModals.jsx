import { useState } from "react";
import { LuX } from "react-icons/lu";
import { Link } from "react-router-dom";

export function IndicatorRuleModals({
  type,
  onClose,
  categories,
  rules,
  timeframeOptions,
}) {
  const renderContent = () => {
    switch (type) {
      case "saveScan":
        return (
          <SaveScanContent
            categories={categories}
            onCancel={onClose}
            rules={rules}
            onSubmit={(data) => {
              console.log("SAVE SCAN:", data);
              onClose();
            }}
          />
        );

      case "backtestResult":
        return (
          <BacktestResultContent
            onCancel={onClose}
            timeframeOptions={timeframeOptions}
            rules={rules}
          />
        );

      case "createAlert":
        return <CreateAlertContent onCancel={onClose} />;

      default:
        return null;
    }
  };

  if (!type) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center 
        bg-black/50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          bg-white rounded-2xl shadow-2xl
          w-[60%] max-w-[95%]
          animate-in zoom-in-95 fade-in duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* SAVE SCAN CONTENT */
/* ------------------------------------------------ */

function SaveScanContent({ onSubmit, onCancel, categories = [], rules = [] }) {
  const [errors, setErrors] = useState({});
  const [scannerPayload, setscannerPayload] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
  });

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e?.stopPropagation?.();

    const isValid = validatingForm?.();

    console.log("VALIDATION RESULT:", isValid); // ⭐ DEBUG

    if (isValid === false) return;

    const payload = {
      ...form,
      rules: JSON.stringify(rules, null, 2),
    };

    console.log("SETTING PAYLOAD:", payload); // ⭐ DEBUG

    setscannerPayload(payload);
  };

  // console.log(JSON.stringify(rules,null,2), "stringifiesdddddddd")

  const validatingForm = () => {
    const errors = {};

    if (!form.name) {
      errors.name = "Name is required";
    } else if (form.name.length < 3) {
      errors.name = "Name must be more that 3 characters";
    }

    if (form.description.length < 10) {
      errors.description = "Add more description";
    }

    // if (!form.category) {
    //   errors.category = "Please select a category";
    // }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className=" bg-white rounded-2xl text-left ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Save Scan</h2>

        <button
          onClick={onCancel}
          className=" p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <LuX size={18} />
        </button>
      </div>

      <div className="py-4 px-4 bg-slate-50 rounded-b-2xl">
        {/* NAME */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            NAME:
          </label>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Enter scan name"
            className="
            w-full px-4 py-3 rounded-xl
            border border-slate-200 bg-white
            focus:outline-none 
            text-sm
          "
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            DESCRIPTION:
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Description for your scan"
            rows={3}
            className="
            w-full px-4 py-3 rounded-xl bg-white
            border border-slate-200 rows-1
            focus:outline-none 
            text-sm
          "
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* CATEGORY */}
        <div className="mb-6 flex gap-3 items-center">
          <label className="block text-xs font-semibold text-slate-500">
            SCAN CATEGORY:
          </label>

          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="
            w-[40%] px-4 py-3 rounded-xl
            border border-slate-200 bg-white
            focus:outline-none 
            text-sm text-slate-700
          "
          >
            <option value="">Select a scan category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-500 mt-1">{errors.category}</p>
          )}
        </div>

        {rules.length === 0 && (
          <span className=" flex justify-center text-red-500 mx-auto">
            No Scanner Found
          </span>
        )}

        {/* ACTIONS */}
        {rules.length !== 0 && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="
            px-5 py-2.5 rounded-xl text-sm font-semibold
            bg-slate-100 text-slate-600
            hover:bg-slate-200 transition
          "
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="
            px-5 py-2.5 rounded-xl text-sm font-semibold
            bg-purple-600 text-white
            hover:bg-purple-700 transition
          "
            >
              Submit
            </button>
          </div>
        )}

        {scannerPayload && (
          <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-sm">
              <b>Name:</b> {scannerPayload.name}
            </div>
            <div className="text-sm">
              <b>Description:</b> {scannerPayload.description}
            </div>
            <div className="text-sm">
              <b>Category:</b> {scannerPayload.category}
            </div>

            <div className="mt-2">
              <pre className="text-xs bg-slate-100 p-2 rounded-lg overflow-auto max-h-40">
                {scannerPayload.rules}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BacktestResultContent({
  onCancel,
  rules = [],
  timeframeOptions = [],
}) {
  const [activeFrames, setActiveFrames] = useState([]);

  function resolveTimeframeLabel(value) {
    const match = timeframeOptions.find((tf) => tf.value === value);
    return match?.label ?? value;
  }

  function toggleFrame(frame) {
    setActiveFrames(
      (prev) =>
        prev.includes(frame)
          ? prev.filter((f) => f !== frame) // remove
          : [...prev, frame], // add
    );
  }

  function isActive(frame) {
    return activeFrames.includes(frame);
  }

  return (
    <div className="bg-white rounded-2xl text-left">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Back Test Result
        </h2>

        <button
          onClick={onCancel}
          className="
            p-1.5 rounded-lg text-slate-400
            hover:bg-slate-100 hover:text-slate-600
            transition
          "
        >
          <LuX size={18} />
        </button>
      </div>

      <div className="p-5 bg-slate-50 rounded-b-2xl space-y-4">
        {rules.length === 0 && (
          <div className="flex justify-center text-red-500 text-sm">
            No Scanner Found
          </div>
        )}

        {/* ✅ Timeframe Buttons */}
        <div className="flex flex-wrap gap-2">
          {rules.map((rule, index) => {
            const frame = rule.timeframe;
            const active = isActive(frame);

            return (
              <Link
                key={rule.id ?? index}
                onClick={() => toggleFrame(frame)}
                className={`
                  px-3 py-1.5 rounded-lg font-semibold
                  border transition-all duration-150
                  ${
                    active
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-300"
                  }
                `}
              >
                {resolveTimeframeLabel(frame)}
              </Link>
            );
          })}

          {/* Show All Button */}
          <button
            onClick={() => setActiveFrames(rules.map((rule) => rule.timeframe))}
            className="
              px-4 py-1.5 rounded-lg font-semibold
              bg-slate-900 text-white
              hover:bg-slate-700 transition
            "
          >
            Show All
          </button>
        </div>

        {/* Footer Buttons */}
        {rules.length > 0 && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="
                px-5 py-2.5 rounded-xl text-sm font-semibold
                bg-slate-100 text-slate-600
                hover:bg-slate-200 transition
              "
            >
              Cancel
            </button>

            <button
              onClick={() => console.log(activeFrames)}
              className="
                px-5 py-2.5 rounded-xl bg-purple-600
                hover:bg-purple-700 text-white text-sm font-semibold
                transition
              "
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* CREATE ALERT */
/* ------------------------------------------------ */

function CreateAlertContent({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    alertName: "",
    condition: "",
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl text-left">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Create Alert</h2>

        <button
          onClick={onCancel}
          className="
      p-1.5 rounded-lg text-slate-400
      hover:bg-slate-100 hover:text-slate-600
      transition
    "
        >
          <LuX size={18} />
        </button>
      </div>

      <div className="p-5 bg-slate-50 rounded-b-2xl">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            ALERT NAME:
          </label>
          <input
            value={form.alertName}
            onChange={(e) => updateField("alertName", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            CONDITION:
          </label>
          <input
            value={form.condition}
            onChange={(e) => updateField("condition", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-200 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit?.({ ...form })}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm"
          >
            Create Alert
          </button>
        </div>
      </div>
    </div>
  );
}

export default IndicatorRuleModals;
