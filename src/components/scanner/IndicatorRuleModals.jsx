import { useState, useEffect } from "react";
import { LuX } from "react-icons/lu";
import { Link } from "react-router-dom";
import { ButtonGroup, ToggleButton, Button } from "react-bootstrap";
import { FaEnvelope, FaSms } from "react-icons/fa";
import { toast } from "react-toastify";
import apiService from "../../services/apiServices";
import { scanCategories } from "../../util/common";

export function IndicatorRuleModals({
  type,
  onClose,
  categories,
  rules,
  conditions,
  timeframeOptions,
}) {
  const renderContent = () => {
    switch (type) {
      case "saveScan":
        return (
          <SaveScanContent
            categories={categories}
            onClose={onClose}
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
            onClose={onClose}
            timeframeOptions={timeframeOptions}
            rules={rules}
          />
        );

      case "createAlert":
        return (
          <CreateAlertContent
            onClose={onClose}
            rules={rules}
            conditions={conditions}
          />
        );

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

function SaveScanContent({ onSubmit, onClose, categories = [], rules = [] }) {
  const [errors, setErrors] = useState({});
  const [scannerPayload, setscannerPayload] = useState("");
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

  const validatingForm = () => {
    const errors = {};

    const name = form?.name?.trim?.(); // ⭐ SAFE chaining

    if (!name) {
      errors.name = "Name is required";
    } else if (name.length < 3) {
      errors.name = "Name must be more than 3 characters";
    }

    if (!form?.category?.key) {
      // ⭐ SAFE object check
      errors.category = "Please select a scan category";
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    const isValid = validatingForm();
    if (!isValid) return;

    if (!rules?.length) {
      toast?.error?.("No scan condition found ❌");
      return;
    }

    try {
      const condition = await rules?.map((rule) => ({
        indicator: rule?.indicator,
        operator: rule?.operator,
        value: rule?.value,
      }));

      const payload = {
        label: form?.name?.trim?.(),
        description: form?.description?.trim?.(),
        condition, // ⭐ ALL RULES HERE
        categoryKey: form?.category?.key, // ⭐ FROM SELECTED CATEGORY
        categoryLabel: form?.category?.label,
      };

      setscannerPayload?.(payload);

      console.log("SETTING PAYLOAD:", payload);
      const response = await apiService?.post?.(
        "api/addCustomIndicator",
        payload,
      );

      console.log("API RESPONSE:", response);
      toast?.success?.("Scanner saved successfully ✅");
      onClose();
    } catch (error) {
      console.error("SAVE FAILED:", error);

      toast?.error?.(
        error?.response?.data?.message ?? "Failed to save scanner ❌",
      );
    }
  };

  return (
    <div className=" bg-white rounded-2xl text-left ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h4 className=" font-semibold text-slate-800">Save Scan</h4>

        <button
          onClick={onClose}
          className=" p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <LuX size={18} />
        </button>
      </div>
      {rules.length === 0 ? (
        /* ---------- EMPTY STATE ---------- */

        <div className="py-4 flex justify-center font-semibold text-slate-700">
          Atleast Add one Condition
        </div>
      ) : (
        /* ---------- FULL MODAL UI ---------- */

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
          border border-slate-200
          focus:outline-none 
          text-sm
        "
            />
          </div>

          {/* CATEGORY */}
          <div className="mb-6 flex gap-3 items-center">
            <label className="block text-xs font-semibold text-slate-500">
              SCAN CATEGORY:
            </label>

            <select
              value={form.category?.key || ""}
              onChange={(e) => {
                const selectedKey = e.target.value;

                const selectedCategory = scanCategories.find(
                  (cat) => cat.key === selectedKey,
                );

                updateField("category", selectedCategory);
              }}
            >
              <option value="">Select a scan category</option>

              {scanCategories.map((cat) => (
                <option key={cat.id} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>

            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="
          px-5 py-2.5 rounded-4 text-sm font-semibold
          bg-slate-100 text-slate-600
          hover:bg-slate-200 transition
        "
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="
          px-5 py-2.5 rounded-4 text-sm font-semibold
          bg-purple-600 text-white
          hover:bg-purple-700 transition
        "
            >
              Submit
            </button>
          </div>

          {/* PAYLOAD PREVIEW */}
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
                  {JSON.stringify(scannerPayload.rules, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BacktestResultContent({ onClose, rules = [], timeframeOptions = [] }) {
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
        <h4 className=" font-semibold text-slate-800">Back Test Result</h4>

        <button
          onClick={onClose}
          className="
            p-1.5 rounded-lg text-slate-400
            hover:bg-slate-100 hover:text-slate-600
            transition
          "
        >
          <LuX size={18} />
        </button>
      </div>

      {rules.length === 0 ? (
        /* ---------- EMPTY STATE ---------- */

        <div className="py-4 flex justify-center font-semibold text-gray-700">
          Atleast Add one Condition
        </div>
      ) : (
        /* ---------- FULL UI ---------- */

        <div className="p-4 bg-light rounded-bottom">
          {/* Timeframe Buttons */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {rules.map((rule, index) => {
              const frame = rule.timeframe;
              const active = isActive(frame);

              return (
                <Link
                  key={rule.id ?? index}
                  onClick={() => toggleFrame(frame)}
                  className="text-decoration-none"
                >
                  <Button
                    size="sm"
                    variant={active ? "primary" : "outline-secondary"}
                    className="fw-semibold rounded-3 px-3 py-1"
                    style={
                      active
                        ? { background: "#9333ea", borderColor: "#9333ea" }
                        : {
                            background: "#fff",
                            color: "#334155",
                            borderColor: "#e2e8f0",
                          }
                    }
                  >
                    {resolveTimeframeLabel(frame)}
                  </Button>
                </Link>
              );
            })}

            {/* Show All Button */}
            <Button
              size="sm"
              variant="dark"
              className="fw-semibold rounded-3 px-3 py-1"
              onClick={() =>
                setActiveFrames(rules.map((rule) => rule.timeframe))
              }
            >
              Show All
            </Button>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="fw-semibold rounded-3 px-4 py-2"
              style={{
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
              }}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              className="fw-semibold rounded-3 px-4 py-2"
              style={{ background: "#9333ea", borderColor: "#9333ea" }}
              onClick={() => console.log(activeFrames)}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* CREATE ALERT */
/* ------------------------------------------------ */

function CreateAlertContent({ onSubmit, onClose, rules, conditions }) {
  const [mode, setMode] = useState("email");

  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});
  const [otpMessage, setOtpMessage] = useState(""); // To display OTP from API

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const validate = () => {
    const errors = {};

    const email = (form.email ?? "").trim();
    const phone = (form.phone ?? "").trim();
    const otp = (form.otp ?? "").trim();

    if (mode === "email") {
      if (!email) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.email = "Invalid email address";
    }

    if (mode === "sms") {
      if (!phone) errors.phone = "Phone number required";
      else if (!/^\+91\d{10}$/.test(phone))
        errors.phone = "Enter valid number (+91XXXXXXXXXX)";

      if (otpSent && (!otp || !/^\d{6}$/.test(otp))) {
        errors.otp = "OTP must be 6 digits";
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGetOtp = async () => {
    if (!form.phone || errors.phone) {
      toast.error("Enter a valid phone number first");
      return;
    }
    let payload;
    if (mode === "email") {
      payload = { type: "email", email: form.email };
    } else if (mode === "sms") {
      payload = { type: "sms", mobile: form.phone };
    }
    console.log(payload, "payloaddddddddd");

    setLoadingOtp(true);
    try {
      const response = await apiService.post("/api/indicatorAlert", payload);
      console.log(response, "response otp");

      if (response?.success) {
        toast.success(response.message || "OTP sent ✅");
        setOtpSent(true);
        setOtpMessage(`OTP: ${response.otp || "Check your phone"}`);
      } else {
        toast.error(response?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP Error:", error);
      toast.error("Server error. Try again.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoadingSubmit(true);

    try {
      let payload;
      if (mode === "email") {
        payload = { type: "email", email: form.email, rule: conditions };
      } else if (mode === "sms") {
        payload = {
          type: "sms",
          mobile: form.phone,
          otp: form.otp,
          rule: conditions,
        };
      }
      console.log(payload, "payloaddddddddd");

      const response = await apiService.post("/api/indicatorAlert", payload);

      if (response?.success) {
        toast.success("Alert created ✅");
        onClose();
        onSubmit?.({ ...form, mode, rules });
      } else {
        toast.error(response?.message || "Failed to create alert");
      }
    } catch (error) {
      console.error("Alert API Error:", error);
      toast.error("Server error. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    setForm((f) => ({
      ...f,
      email: mode === "email" ? f.email : "",
      phone: mode === "sms" ? f.phone : "",
      otp: mode === "sms" ? f.otp : "",
    }));
    setErrors({});
    setOtpSent(false);
    setOtpMessage("");
  }, [mode]);

  function handlePhoneChange(value) {
    value = value.replace(/[^\d+]/g, "");
    if (value.indexOf("+") > 0) return;
    if (value.length > 13) return;
    updateField("phone", value);
  }

  if (!rules?.length) {
    return (
      <div className="py-4 flex justify-center font-semibold text-slate-700">
        At least add one condition
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl text-left">
      <div className="flex items-center justify-between px-4 py-3">
        <h6 className="font-semibold">
          {mode === "email" ? "Alert via Email" : "Alert via SMS"}
        </h6>
        <button onClick={onClose}>
          <LuX size={18} />
        </button>
      </div>

      <div className="p-5 bg-slate-50 rounded-b-2xl">
        <ButtonGroup
          className="mb-4"
          style={{
            background: "#f0e6ff",
            borderRadius: "50px",
            padding: "4px",
          }}
        >
          <ToggleButton
            id="toggle-email"
            type="radio"
            name="mode"
            value="email"
            checked={mode === "email"}
            onChange={() => setMode("email")}
            style={{
              borderRadius: "50px",
              border: "none",
              padding: "6px 20px",
              background: mode === "email" ? "#7c3aed" : "transparent",
              color: mode === "email" ? "#f8fafc" : "#7c3aed",
              fontWeight: 500,
              boxShadow:
                mode === "email" ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
            }}
          >
            Email
          </ToggleButton>
          <ToggleButton
            id="toggle-sms"
            type="radio"
            name="mode"
            value="sms"
            checked={mode === "sms"}
            onChange={() => setMode("sms")}
            style={{
              borderRadius: "50px",
              border: "none",
              padding: "6px 20px",
              background: mode === "sms" ? "#7c3aed" : "transparent",
              color: mode === "sms" ? "#f8fafc" : "#7c3aed",
              fontWeight: 500,
              boxShadow:
                mode === "sms" ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
            }}
          >
            SMS
          </ToggleButton>
        </ButtonGroup>

        {mode === "email" && (
          <div className="mb-4">
            <label className="text-xs font-semibold">EMAIL</label>
            <input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border"
            />
            {errors.email && (
              <div className="text-xs text-red-500 mt-1">{errors.email}</div>
            )}
          </div>
        )}

        {mode === "sms" && (
          <>
            {otpMessage && (
              <div className="mb-2 text-green-700 font-medium">
                {otpMessage}
              </div>
            )}

            <div className="mb-2">
              <label className="text-xs font-semibold">PHONE NUMBER</label>
              <input
                type="tel"
                placeholder="+91XXXXXXXXXX"
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border"
                disabled={otpSent} // disable after OTP sent
              />
              {errors.phone && (
                <div className="text-xs text-red-500 mt-1">{errors.phone}</div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGetOtp}
                disabled={loadingOtp || otpSent}
                className="px-4 py-2 mb-3 bg-purple-600 text-white rounded-3"
              >
                {loadingOtp
                  ? "Sending OTP..."
                  : otpSent
                    ? "OTP Sent"
                    : "Get OTP"}
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold">OTP VERIFY</label>
              <input
                value={form.otp}
                onChange={(e) =>
                  updateField("otp", e.target.value.replace(/\D/g, ""))
                }
                className="w-full px-4 py-3 rounded-xl border"
                disabled={!otpSent} // enable only after OTP sent
              />
              {errors.otp && (
                <div className="text-xs text-red-500 mt-1">{errors.otp}</div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 rounded-3 py-2.5 bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loadingSubmit || (mode === "sms" && !otpSent)}
            className="px-5 py-2.5 rounded-3 bg-purple-600 text-white"
          >
            {loadingSubmit ? "Submitting..." : "Create Alert"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IndicatorRuleModals;
