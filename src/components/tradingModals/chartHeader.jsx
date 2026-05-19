import { FiPlus } from "react-icons/fi";
import { VscGraphLine } from "react-icons/vsc";
import { useState, useEffect } from "react";
import { ListingModal } from "./ListingModal";
import apiService from "../../services/apiServices";
import { MdAlarmAdd } from "react-icons/md";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FiChevronDown } from "react-icons/fi";
import { chartOptions } from "../../util/common";
import { EditableNumber } from "../indicator/EditTableLabel";
import { isAuthenticated, logout } from "../../pages/auth/protected";
import { Navigate, useNavigate } from "react-router-dom";
import ProfileDropDown from "../auth/profile/ProfileDropDown";

export default function ChartHeader({
  timeframeValue,
  setTimeframeValue,
  selectedCurrency,
  selectedIndicator,
  setSelectedIndicator,
  setSelectedCurrency,
  toggleIndicator,
  setChartType,
  chartType,
}) {
  const navigate = useNavigate();


  const [timeframe, setTimeframe] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const active = chartOptions.find((c) => c.value === chartType);

  const [modalConfig, setModalConfig] = useState({
    open: false,
    title: "",
    items: [],
  });

  const openModal = (title, items) => {
    setModalConfig({
      open: true,
      title,
      items,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, open: false }));
  };

  async function fetchTimeframe() {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post("/api/getTimeFrames");
      setTimeframe(response.data);

      setTimeframeValue(timeframeValue);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch timeframes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTimeframe();
  }, []);

  return (
    <div className="w-100 d-flex flex-column gap-3 small">
      <div className="d-flex align-items-center gap-3 px-3 py-2 shadow-sm" style={{ background: "var(--bg-card, #ffffff)", borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
        {/* Name/Symbol Button */}
        <ProfileDropDown /> 
        <button
          title="Symbol Search"
          onClick={() => openModal("Symbol Search")}
          className="btn fw-bold rounded-pill px-4"
          style={{ height: 40, backgroundColor: "var(--bg-main, #f4f6f8)", color: "var(--text-main, #131722)", border: "1px solid var(--border-color, #e2e8f0)" }}
        >
          {selectedCurrency || "BTCUSDT"}
        </button>

        {/* Divider */}
        <div className="vr" style={{ backgroundColor: "var(--border-color, #e2e8f0)" }} />

        {/* TimeFrame Dropdown */}
        <div title={timeframeValue}>
          <select
            value={timeframeValue ? timeframeValue : "1m"}
            onChange={(e) => setTimeframeValue(e.target.value)}
            className="form-select form-select-sm"
            style={{ height: 40, width: 120, backgroundColor: "var(--bg-main, #f4f6f8)", color: "var(--text-main, #131722)", borderColor: "var(--border-color, #e2e8f0)" }}
          >
            {!timeframe && <option value="1m">1 Minute</option>}

            {timeframe && Object.keys(timeframe).length === 0 && (
              <option value="1m">1 Minute</option>
            )}

            {timeframe &&
              Object.entries(timeframe)?.map(([group, items]) => (
                <optgroup key={group} label={group?.toUpperCase()} style={{ backgroundColor: "var(--bg-card, #ffffff)", color: "var(--text-main, #131722)" }}>
                  {items?.map((item) => (
                    <option key={item?.seconds} value={item?.value}>
                      {item?.label}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </div>

        {/* Divider */}
        <div className="vr" style={{ backgroundColor: "var(--border-color, #e2e8f0)" }} />

        {/* Chart Type Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="btn d-flex align-items-center gap-2" style={{ height: 40, backgroundColor: "var(--bg-main, #f4f6f8)", color: "var(--text-main, #131722)", border: "1px solid var(--border-color, #e2e8f0)" }}>
              {active?.icon && <active.icon size={16} />}
              <span>{active?.label}</span>
              <FiChevronDown size={14} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              className="border rounded shadow z-999 p-2"
              style={{ backgroundColor: "var(--bg-card, #ffffff)", color: "var(--text-main, #131722)", borderColor: "var(--border-color, #e2e8f0)" }}
            >
              {chartOptions.map((item) => (
                <DropdownMenu.Item
                  key={item.value}
                  onClick={() => setChartType(item.value)}
                  className="d-flex align-items-center gap-2 px-3 py-2 rounded"
                  style={{ color: "var(--text-main, #131722)", cursor: "pointer" }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "var(--bg-card-hover, #f1f5f9)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  <item.icon size={16} />
                  <span className="flex-grow-1">{item.label}</span>

                  {chartType === item.value && (
                    <span className="badge bg-primary">✓</span>
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Divider */}
        <div className="vr" style={{ backgroundColor: "var(--border-color, #e2e8f0)" }} />

        {/* Action Buttons */}
        <div className="d-flex align-items-center w-full gap-2">
          {/* Indicators */}
          <button
            title="Indicators"
            onClick={() => openModal("Indicators")}
            className="btn d-flex align-items-center gap-2"
            style={{ height: 40, backgroundColor: "var(--bg-main, #f4f6f8)", color: "var(--text-main, #131722)", border: "1px solid var(--border-color, #e2e8f0)" }}
          >
            <VscGraphLine />
            <span>Indicators</span>
          </button>

          {/* Alert */}
          <button
            title="Create Alert"
            onClick={() => openModal("Alerts")}
            className="btn d-flex align-items-center gap-2"
            style={{ height: 40, backgroundColor: "var(--bg-main, #f4f6f8)", color: "var(--text-main, #131722)", border: "1px solid var(--border-color, #e2e8f0)" }}
          >
            <MdAlarmAdd />
            <span>Alert</span>
          </button>

          {/* Simulation */}
          <button
            title="Simulation"
            onClick={() => openModal("Simulation")}
            className="btn btn-primary d-flex align-items-center gap-2"
            style={{ height: 40 }}
          >
            <FiPlus />
            <span>Simulation</span>
          </button>
        </div>
        <div className="flex justify-end ">
          {isAuthenticated ? (
            <button
              title="Logout"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn btn-primary d-flex align-items-center gap-2"
              style={{ height: 40 }}
            >
              <span>Logout</span>
            </button>
          ) : (
            <button
              title="Signup"
              onClick={() => {
                navigate("/signup");
              }}
              className="btn btn-primary d-flex align-items-center gap-2"
              style={{ height: 40 }}
            >
              <span>Signup</span>
            </button>
          )}
        </div>
          
      </div>

      {/* MODAL (UNCHANGED) */}
      <ListingModal
        isOpen={modalConfig.open}
        onClose={closeModal}
        title={modalConfig.title}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        selectedIndicator={selectedIndicator}
        setSelectedIndicator={setSelectedIndicator}
        toggleIndicator={toggleIndicator}
      />
    </div>
  );
}
