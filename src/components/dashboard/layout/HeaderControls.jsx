import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../util/common";
import apiService from "../../../services/apiServices";
import { logout } from "../../../pages/auth/protected";
import { useTheme } from "../../../context/ThemeContext";
import { GlobalSearchModal } from "../../tradingModals/GlobalSearchModal";

const HeaderControls = ({ selectedSymbol, setSelectedSymbol, sidebarOpen, setSidebarOpen, activeTab }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const user = getUser();
  const userEmail = user?.email || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const [currencies, setCurrencies] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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

        {/* Logo */}
        <div className="brand-logo-section">
          <div className="brand-title">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginRight: "8px" }}
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6366f1" />
              <path
                d="M2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#a78bfa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>CryptoEdge</span>
          </div>
          <div className="brand-subtitle">All Markets. One Edge.</div>
        </div>

        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          style={{
            background: "transparent",
            border: "1px solid var(--border-color)",
            color: "var(--text-main)",
            borderRadius: "8px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          ☰
        </button>


        {/* Premium Asset Selector Dropdown */}
        {!(activeTab && ['settings', 'watchlist', 'arbitrage', 'market sentiment'].includes(activeTab.toLowerCase())) && (
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
        )}

        <div className="search-container" onClick={() => setIsSearchModalOpen(true)} style={{ cursor: "pointer" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search tokens, protocols, metrics..."
            readOnly
            style={{ cursor: "pointer" }}
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
            onClick={() => navigate("/candleStick")}
            style={{
              background: "none", border: "1px solid #7F77DD", color: "#7F77DD",
              fontSize: "12px", fontWeight: "500", borderRadius: "20px",
              padding: "5px 16px", cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(127,119,221,0.08)"}
            onMouseOut={e => e.currentTarget.style.background = "none"}
          >
            Chart
          </button>

          <button
            onClick={() => navigate("/scan_dashboard")}
            style={{
              background: "none", border: "1px solid #EF9F27", color: "#EF9F27",
              fontSize: "12px", fontWeight: "500", borderRadius: "20px",
              padding: "5px 16px", cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(239,159,39,0.08)"}
            onMouseOut={e => e.currentTarget.style.background = "none"}
          >
            Scan dashboard
          </button>

          <button
            onClick={() => navigate("/alert_dashboard")}
            style={{
              background: "none", border: "1px solid #7F77DD", color: "#7F77DD",
              fontSize: "12px", fontWeight: "500", borderRadius: "20px",
              padding: "5px 16px", cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(127,119,221,0.08)"}
            onMouseOut={e => e.currentTarget.style.background = "none"}
          >
            Alert dashboard
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
                  minWidth: "170px",
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
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover, #21262d)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Profile Page
                </button>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: "var(--border-color, #21262d)", margin: "4px 0" }} />

                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover, #21262d)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {theme === "dark" ? "🌙" : "☀️"}
                    {theme === "dark" ? "Dark" : "Light"}
                  </span>
                  {/* Pill toggle */}
                  <div
                    style={{
                      width: "32px",
                      height: "16px",
                      borderRadius: "8px",
                      backgroundColor: theme === "dark" ? "#6366f1" : "#d1d5db",
                      position: "relative",
                      transition: "background-color 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: theme === "dark" ? "18px" : "2px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        transition: "left 0.2s",
                      }}
                    />
                  </div>
                </button>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: "var(--border-color, #21262d)", margin: "4px 0" }} />

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
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover, #21262d)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
};

export default HeaderControls;
