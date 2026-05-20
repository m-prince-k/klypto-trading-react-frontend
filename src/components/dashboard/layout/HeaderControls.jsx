import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../util/common";
import apiService from "../../../services/apiServices";
import { logout } from "../../../pages/auth/protected";

const HeaderControls = ({ selectedSymbol, setSelectedSymbol }) => {
  const navigate = useNavigate();

  const user = getUser();
  const userEmail = user?.email || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const [currencies, setCurrencies] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const res = await apiService.post("/api/getCurrencies"); // 🔁 your API
        setCurrencies(res?.data || []);
      } catch (err) {
        console.error("Error fetching currencies:", err);
      }
    }

    fetchCurrencies();
  }, []);

  return (
    <div className="workspace-header-controls">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
       

        {/* Premium Asset Selector Dropdown */}
        <div
          className="premium-dropdown-wrapper"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--header-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "20px",
            padding: "2px 14px",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: "bold",
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
            }}
          >
            ACTIVE PAIR:
          </span>

          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-main)",
              fontSize: "11.5px",
              fontWeight: "bold",
              cursor: "pointer",
              outline: "none",
              padding: "4px 0px",
              fontFamily: "inherit",
            }}
          >
            {currencies.map((item) => (
              <option
                key={item.symbol}
                value={item.symbol}
                style={{ background: "var(--bg-card)", color: "var(--text-main)" }}
              >
                {item.label || item.symbol}
              </option>
            ))}
          </select>
        </div>

         <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search tokens, protocols, metrics..."
          />
          <svg
            className="search-icon-svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Navigation buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => navigate("/scan_dashboard")}
            style={{
              background: "none",
              border: "1px solid #2563eb",
              color: "#2563eb",
              fontSize: "11px",
              fontWeight: "600",
              borderRadius: "16px",
              padding: "5px 14px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Scan Dashboard
          </button>

          <button
            onClick={() => navigate("/alert_dashboard")}
            style={{
              background: "none",
              border: "1px solid #d97706",
              color: "#d97706",
              fontSize: "11px",
              fontWeight: "600",
              borderRadius: "16px",
              padding: "5px 14px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Alert Dashboard
          </button>
        </div>
      </div>
      <div className="header-actions">
        <div
          style={{
            color: "#f59e0b",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          ★{" "}
          <span
            style={{
              fontSize: "10.5px",
              color: "var(--text-muted)",
              marginLeft: "4px",
              fontWeight: "bold",
            }}
          >
            FAVORITES
          </span>
        </div>
        <div className="bell-icon-wrapper">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div className="bell-badge">3</div>
        </div>
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "12px",
              color: "white",
              cursor: "pointer", // ✅ makes it clickable
            }}
          >
            {userInitial}
          </div>

          {dropdownOpen && (
            <>
              <div
                onClick={() => setDropdownOpen(false)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                  cursor: "default",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "34px",
                  right: 0,
                  backgroundColor: "var(--bg-card, #161b22)",
                  border: "1px solid var(--border-color, #21262d)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  minWidth: "120px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "4px 0",
                }}
              >
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-main, #ffffff)",
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: "12px",
                    cursor: "pointer",
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--bg-card-hover, #21262d)")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  Profile Page
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: "12px",
                    cursor: "pointer",
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--bg-card-hover, #21262d)")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderControls;
