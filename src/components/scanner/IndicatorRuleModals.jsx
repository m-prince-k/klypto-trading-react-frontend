import { useState, useEffect } from "react";
import { LuX } from "react-icons/lu";
import { Link } from "react-router-dom";
import {
  ButtonGroup,
  ToggleButton,
  Button,
  Dropdown,
  Form,
} from "react-bootstrap";
import { FaEnvelope, FaSms } from "react-icons/fa";
import { toast } from "react-toastify";
import apiService from "../../services/apiServices";
import { scanCategories, tfToMinutes } from "../../util/common";
import AlertModal from "./ScannerModals";
import { buildCondition } from "../../util/scannerFunctions";

export function IndicatorRuleModals({
  type,
  closeModal,
  rules,
  setSaveScan,
  saveScan,
  finalRules,
  timeframeOptions,
  setRunScanTrigger,
  dataSource,
}) {
  const renderContent = () => {
    switch (type) {
      case "saveScan":
        return (
          <SaveScanContent
            closeModal={closeModal}
            rules={rules}
            finalRules={finalRules}
            setSaveScan={setSaveScan}
            dataSource={dataSource}
            onSubmit={(data) => {
              console.log("SAVE SCAN:", data);
              closeModal();
            }}
          />
        );

      case "backtestResult":
        return (
          <BacktestResultContent
            closeModal={closeModal}
            timeframeOptions={timeframeOptions}
            rules={finalRules}
            setRunScanTrigger={setRunScanTrigger}
            setSaveScan={setSaveScan}
            saveScan={saveScan}
          />
        );

      case "createAlert":
        return (
          <CreateAlertContent
            closeModal={closeModal}
            rules={rules}
            finalRules={finalRules}
            setSaveScan={setSaveScan}
            saveScan={saveScan}
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
          closeModal();
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

function SaveScanContent({
  onSubmit,
  closeModal,
  rules = [],
  finalRules,
  setSaveScan,
  dataSource,
}) {
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
      const payload = {
        label: form?.name?.trim?.(),
        description: form?.description?.trim?.(),
        condition: buildCondition({ rules: finalRules }),
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

      if (response.statusCode === 200) {
        setSaveScan(true);
      }

      toast?.success?.("Scanner saved successfully ✅");
      closeModal();
    } catch (error) {
      console.error("SAVE FAILED:", error);

      toast?.error?.(
        error?.response?.data?.message ?? "Failed to save scanner ❌",
      );
    }
  };
  // ✅ Guard: Block saving if scan hasn't been run (dataSource is empty)
  const isDataEmpty =
    !dataSource ||
    (Array.isArray(dataSource) && dataSource.length === 0) ||
    (typeof dataSource === "object" &&
      !Array.isArray(dataSource) &&
      Object.keys(dataSource).length === 0);

  if (isDataEmpty) {
    return (
      <div className="bg-white rounded-2xl text-left">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800">Save Scan</h4>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <LuX size={18} />
          </button>
        </div>
        <div className="py-6 flex justify-center font-semibold text-slate-700">
          Please run the scan first!
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-white rounded-2xl text-left ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h4 className=" font-semibold text-slate-800">Save Scan</h4>

        <button
          onClick={closeModal}
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
              onClick={closeModal}
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

          {/* PAYLOAD PREVIEW
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
          )} */}
        </div>
      )}
    </div>
  );
}

function BacktestResultContent({
  closeModal,
  rules = [],
  timeframeOptions = [],
  setRunScanTrigger,
  saveScan,
}) {
  const [activeFrames, setActiveFrames] = useState([]);
  const [modalMessage, setModalMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Guard: trigger alert if scan not saved
  useEffect(() => {
    if (saveScan === false) {
      setModalMessage(
        "Please save the scan first before viewing backtest results!",
      );
      setModalOpen(true);
    }
  }, [saveScan]);

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
  const getMaxTfFromRule = (rule) => {
    const tfs = [];

    // ✅ case 1: direct timeframe (your old logic)
    if (rule.timeframe) {
      tfs.push(rule.timeframe);
    }

    // ✅ case 2: nested objects
    ["object1", "object2", "object3"].forEach((key) => {
      if (rule[key]?.timeframe) {
        tfs.push(rule[key].timeframe);
      }
    });

    if (!tfs.length) return null;

    return tfs.reduce((max, curr) =>
      tfToMinutes(curr) > tfToMinutes(max) ? curr : max,
    );
  };

  // ✅ When scan not saved: show blocking message
  if (!saveScan) {
    return (
      <div className="bg-white rounded-2xl text-left">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800">Back Test Result</h4>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <LuX size={18} />
          </button>
        </div>
        <div className="py-6 flex justify-center font-semibold text-slate-700">
          Please save the scan first before viewing backtest results!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl text-left">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h4 className=" font-semibold text-slate-800">Back Test Result</h4>

        <button
          onClick={closeModal}
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
            {rules?.map((rule, index) => {
              const frame = getMaxTfFromRule(rule); // ✅ changed
              const active = isActive(frame);

              if (!frame) return null;

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
              onClick={closeModal}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              className="fw-semibold rounded-3 px-4 py-2"
              style={{ background: "#9333ea", borderColor: "#9333ea" }}
              onClick={() => {
                setRunScanTrigger(true);
                closeModal();
              }}
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

function CreateAlertContent({
  onSubmit,
  closeModal,
  rules,
  finalRules,
  setSaveScan,
  saveScan,
}) {
  const [mode, setMode] = useState("email");

  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [alertName, setAlertName] = useState("");
  const [sentPhone, setSentPhone] = useState("");

  // ✅ Guard: show alert if scan not saved yet
  useEffect(() => {
    if (saveScan === false) {
      setModalMessage("Please save the scan first before creating an alert!");
      setModalOpen(true);
    }
  }, [saveScan]);

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

    const name = (alertName ?? "").trim();

    if (!name) {
      errors.alertName = "Alert name is required";
    } else if (name.length < 3) {
      errors.alertName = "Alert name must be at least 3 characters";
    }

    if (mode === "email") {
      if (!email) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.email = "Invalid email address";
    }

    if (mode === "sms") {
      if (!otpSent && !phone) errors.phone = "Phone number required";
  //     else if (phone.length < 8 || phone.length > 15) {
  //   errors.phone = "Enter valid phone number";
  // }

      if (otpSent && (!otp || !/^\d{6}$/.test(otp))) {
        errors.otp = "OTP must be 6 digits";
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGetOtp = async () => {
    if (!validate()) return;

    if (!form.phone || errors.phone) {
      toast.error("Enter a valid phone number first");
      return;
    }
    let payload;
    if (mode === "email") {
      payload = { type: "email", email: form.email };
    } else if (mode === "sms") {
      payload = { type: "sms", mobile: form.phone ,
        // mobile: `+${form.phone}`
      };
    }
    // console.log(payload, "payloaddddddddd");

    setLoadingOtp(true);
    try {
      const response = await apiService.post("/api/indicatorAlert", payload);
      console.log(response, "response otp");

      if (response?.success) {
        toast.success(response.message || "OTP sent ✅");
        setSentPhone(form.phone);
        updateField("phone", "");
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
        payload = {
          alert_name: alertName,
          type: "email",
          email: form.email,
          condition: buildCondition({ rules: finalRules }),
        };
      } else if (mode === "sms") {
        payload = {
          alert_name: alertName,
          type: "verified",
          mobile: sentPhone,
          //  mobile: `+${form.phone}`, // 🔥 important
          otp: form.otp,
          rule: buildCondition({ rules: finalRules }),
        };
      }
      console.log(payload, "payloaddddddddd");

      const response = await apiService.post("/api/indicatorAlert", payload);

      if (response.success == 200) {
        toast.success("Alert created ✅");
        closeModal();
        onSubmit?.({ ...form, phone: sentPhone, mode, rules });
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
    setSentPhone("");
    setOtpMessage("");
  }, [mode]);

  function handlePhoneChange(value) {
    value = value.replace(/[^\d+]/g, "");
    if (value.indexOf("+") > 0) return;
    if (value.length > 13) return;
    updateField("phone", value);
  }
  // ✅ When scan not saved: show only the alert modal + close button
  if (!saveScan) {
    return (
      <div className="bg-white rounded-2xl text-left">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h6 className="font-semibold text-slate-800">Create Alert</h6>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <LuX size={18} />
          </button>
        </div>
        <div className="py-6 flex justify-center font-semibold text-slate-700">
          Please save the scan first before creating an alert!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl text-left">
      <div className="flex items-center justify-between px-4 py-3">
        <h6 className="font-semibold">
          {mode === "email" ? "Alert via Email" : "Alert via SMS"}
        </h6>
        <button onClick={closeModal}>
          <LuX size={18} />
        </button>
      </div>

      {finalRules.length === 0 ? (
        /* ---------- EMPTY STATE ---------- */

        <div className="py-4 flex justify-center font-semibold text-slate-700">
          Atleast Add one Condition and Save it to create an alert!
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-b-2xl">
          {/* ALERT NAME */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600">
              ALERT NAME:
            </label>
            <Form.Control
              type="text"
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder="Enter alert name"
              className="mt-2"
            />
            {errors.alertName && (
              <div className="text-xs text-red-500 mt-1">
                {errors.alertName}
              </div>
            )}
          </div>
          <div>
            <p style={{ fontSize: 14, color: "#334155" }}>
              <p>{buildCondition({ rules: finalRules })}</p>
            </p>
          </div>

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

              {/* <div className="mb-2">
  <label className="text-xs font-semibold">PHONE NUMBER</label>

  <PhoneInput
    country={"in"} // default India
    enableSearch={true}
    value={form.phone}
    onChange={(value) => updateField("phone", value)}
    inputClass="w-full"
    containerClass="w-full"
    inputStyle={{
      width: "100%",
      height: "48px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
    }}
    buttonStyle={{
      borderTopLeftRadius: "12px",
      borderBottomLeftRadius: "12px",
    }}
    disabled={otpSent}
  />

  {errors.phone && (
    <div className="text-xs text-red-500 mt-1">{errors.phone}</div>
  )}
</div> */}
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
                  <div className="text-xs text-red-500 mt-1">
                    {errors.phone}
                  </div>
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
              onClick={closeModal}
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
      )}
    </div>
  );
}

export default IndicatorRuleModals;
