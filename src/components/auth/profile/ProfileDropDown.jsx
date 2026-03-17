import React, { useState } from "react";
import { styles } from "./style";
import { useNavigate } from "react-router-dom";

export default function ProfileDropDown() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [drawingsPanel, setDrawingsPanel] = useState(true);
  const [language, setLanguage] = useState("English (India)");
  const navigate = useNavigate();

  return (
    <div>
      {/* ===== TOP BAR ===== */}
      <div className="custom-toggle-bar" style={styles.topBar}>
        <button onClick={() => setOpen(true)} >☰</button>
      
      </div>

      {/* ===== DRAWER OVERLAY ===== */}
      {open && (
        <div style={styles.overlay} onClick={() => setOpen(false)} />
      )}

      {/* ===== DRAWER ===== */}
      <div
        style={{
          ...styles.drawer,
          left: open ? 0 : -300,
          background: dark ? "#0e0e0e" : "#fff",
          color: dark ? "#fff" : "#000",
        }}
      >
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.avatar}>S</div>
          <div>
            <div style={{ fontWeight: 600 }}>sm954341</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>View profile</div>
          </div>
        </div>

        <Divider />

        {/* MENU ITEMS */}
         <Item label="🏠 Home" onClick={() => navigate("/home")} />
        <Item label="❓ Help Center" onClick={() => alert("Help Center")} />
        <Item label="⚡ What's new" onClick={() => alert("What's new")} />

        <Divider />

        {/* TOGGLES */}
        <Toggle
          label="🌙 Dark theme"
          value={dark}
          onChange={() => setDark(!dark)}
        />

        <Toggle
          label="📐 Drawings panel"
          value={drawingsPanel}
          onChange={() => setDrawingsPanel(!drawingsPanel)}
        />

        {/* LANGUAGE */}
        <Item
          label={`🌐 Language`}
          right={language}
          onClick={() =>
            setLanguage(
              language === "English (India)" ? "English (US)" : "English (India)"
            )
          }
        />

        {/* SHORTCUT */}
        <Item
          label="⌨ Keyboard shortcuts"
          right="Ctrl + /"
          onClick={() => alert("Show shortcuts")}
        />

        {/* DESKTOP */}
        <Item
          label="🖥 Get desktop app"
          onClick={() =>
            window.open("https://www.tradingview.com/desktop/", "_blank")
          }
        />

        <Divider />

        {/* SIGN OUT */}
        <Item
          label="🚪 Sign out"
          danger
          onClick={() => alert("Signed out")}
        />
      </div>

    </div>
  );
}

/* =====================
   UI COMPONENTS
===================== */

const Item = ({ label, right, onClick, danger }) => (
  <div
    onClick={onClick}
    style={{
      ...styles.item,
      color: danger ? "#ff4d4f" : "inherit",
    }}
  >
    <span>{label}</span>
    {right && <span style={{ opacity: 0.6 }}>{right}</span>}
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <div style={styles.item}>
    <span>{label}</span>
    <div
      onClick={onChange}
      style={{
        ...styles.toggle,
        background: value ? "#4caf50" : "#ccc",
      }}
    >
      <div
        style={{
          ...styles.knob,
          left: value ? 18 : 2,
        }}
      />
    </div>
  </div>
);

const Divider = () => (
  <div style={{ height: 1, background: "#ddd", margin: "8px 0" }} />
);

/* =====================
   STYLES
===================== */

