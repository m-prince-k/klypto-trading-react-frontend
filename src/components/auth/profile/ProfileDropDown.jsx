import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiHelpCircle,
  FiZap,
  FiMoon,
  FiLayout,
  FiGlobe,
  FiMonitor,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";
import { FaRegKeyboard } from "react-icons/fa";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null");
  } catch {
    return null;
  }
};

export default function ProfileDropDown() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [drawingsPanel, setDrawingsPanel] = useState(true);
  const [language, setLanguage] = useState("English (India)");
  const navigate = useNavigate();

  const user = getUser();
  const userEmail = user?.email || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <>
      {/* ===== TRIGGER BUTTON ===== */}
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "1px solid #dee2e6",
          borderRadius: 8,
          padding: "6px 10px",
          cursor: "pointer",
          color: "#495057",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
        }}
      >
        <FiMenu size={16} />
      </button>

      {/* ===== OVERLAY — very light, no blur ===== */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.10)",
            zIndex: 1040,
          }}
        />
      )}

      {/* ===== DRAWER ===== */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : -300,
          width: 264,
          height: "100vh",
          background: "#ffffff",
          boxShadow: "2px 0 16px rgba(0,0,0,0.10)",
          zIndex: 1050,
          display: "flex",
          flexDirection: "column",
          transition: "left 0.22s cubic-bezier(.4,0,.2,1)",
          overflowY: "auto",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #185FA5 0%, #2179c4 100%)",
            padding: "18px 16px 16px",
            position: "relative",
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.18)",
              border: "none",
              borderRadius: 6,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              padding: 0,
            }}
          >
            <FiX size={13} />
          </button>

          {/* Avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.20)",
              border: "2px solid rgba(255,255,255,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {userInitial}
          </div>

          <div className="align-items-start text-left">
            <div
              style={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                // marginBottom: 4,
                lineHeight: 1.3,
              }}
            >
              {userEmail}
            </div>
            <Link
              to="/profile"
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.78)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <FiUser size={10} />
              View profile
            </Link>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, paddingTop: 4, paddingBottom: 12 }}>
          <SectionLabel label="Navigation" />
          <Item
            icon={<FiHome size={14} />}
            label="Home"
            onClick={() => navigate("/home")}
          />
          <Item
            icon={<FiHelpCircle size={14} />}
            label="Help Center"
            onClick={() => alert("Help Center")}
          />
          <Item
            icon={<FiZap size={14} />}
            label="What's new"
            badge="New"
            onClick={() => alert("What's new")}
          />

          <Divider />

          <SectionLabel label="Preferences" />
          <ToggleItem
            icon={<FiMoon size={14} />}
            label="Dark theme"
            value={dark}
            onChange={() => setDark(!dark)}
          />
          <ToggleItem
            icon={<FiLayout size={14} />}
            label="Drawings panel"
            value={drawingsPanel}
            onChange={() => setDrawingsPanel(!drawingsPanel)}
          />
          <Item
            icon={<FiGlobe size={14} />}
            label="Language"
            right={
              <span
                style={{
                  fontSize: 11.5,
                  color: "#6c757d",
                  whiteSpace: "nowrap",
                }}
              >
                {language}
              </span>
            }
            onClick={() =>
              setLanguage(
                language === "English (India)"
                  ? "English (US)"
                  : "English (India)",
              )
            }
          />
          <Item
            icon={<FaRegKeyboard size={14} />}
            label="Keyboard shortcuts"
            right={
              <kbd
                style={{
                  fontSize: 11,
                  background: "#f1f3f5",
                  border: "1px solid #dee2e6",
                  borderRadius: 4,
                  padding: "1px 5px",
                  color: "#495057",
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                }}
              >
                Ctrl + /
              </kbd>
            }
            onClick={() => alert("Show shortcuts")}
          />

          <Divider />

          <SectionLabel label="App" />
          <Item
            icon={<FiMonitor size={14} />}
            label="Get desktop app"
            onClick={() =>
              window.open("https://www.tradingview.com/desktop/", "_blank")
            }
          />

          <Divider />

          <Item
            icon={<FiLogOut size={14} />}
            label="Sign out"
            danger
            onClick={() => alert("Signed out")}
          />
        </div>
      </div>
    </>
  );
}

/* =====================
   SUB-COMPONENTS
===================== */

const SectionLabel = ({ label }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      color: "#adb5bd",
      letterSpacing: "0.85px",
      textTransform: "uppercase",
      padding: "10px 16px 3px",
      textAlign: "left",
    }}
  >
    {label}
  </div>
);

const Item = ({ icon, label, right, onClick, danger, badge }) => (
  <div
    onClick={onClick}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    style={{
      display: "flex",
      alignItems: "center",
      padding: "7px 16px",
      cursor: "pointer",
      color: danger ? "#dc3545" : "#212529",
      fontSize: 13,
      gap: 0,
      userSelect: "none",
      transition: "background 0.1s",
    }}
  >
    {/* Icon column — fixed width, left-aligned */}
    <span
      style={{
        width: 28,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        color: danger ? "#dc3545" : "#868e96",
      }}
    >
      {icon}
    </span>

    {/* Label — takes remaining space, left-aligned */}
    <span style={{ flex: 1, textAlign: "left" }}>{label}</span>

    {/* Right slot */}
    {badge && (
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          background: "#185FA5",
          color: "#fff",
          borderRadius: 4,
          padding: "2px 6px",
          flexShrink: 0,
        }}
      >
        {badge}
      </span>
    )}
    {right && !badge && <span style={{ flexShrink: 0 }}>{right}</span>}
    {!right && !badge && (
      <FiChevronRight size={12} style={{ color: "#ced4da", flexShrink: 0 }} />
    )}
  </div>
);

const ToggleItem = ({ icon, label, value, onChange }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "7px 16px",
      fontSize: 13,
      color: "#212529",
      userSelect: "none",
      gap: 0,
    }}
  >
    {/* Icon column — fixed width, left-aligned */}
    <span
      style={{
        width: 28,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        color: "#868e96",
      }}
    >
      {icon}
    </span>

    {/* Label */}
    <span style={{ flex: 1, textAlign: "left" }}>{label}</span>

    {/* Toggle switch */}
    <div
      onClick={onChange}
      style={{
        width: 34,
        height: 18,
        borderRadius: 999,
        background: value ? "#185FA5" : "#dee2e6",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.18s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: value ? 15 : 2,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          transition: "left 0.18s",
        }}
      />
    </div>
  </div>
);

const Divider = () => (
  <div style={{ height: 1, background: "#f1f3f5", margin: "3px 0" }} />
);
