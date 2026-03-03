import React, { useState } from "react";

export default function Testing() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [drawingsPanel, setDrawingsPanel] = useState(true);
  const [language, setLanguage] = useState("English (India)");

  return (
    <div style={{ height: "100vh", background: dark ? "#111" : "#f5f5f5" }}>
      {/* ===== TOP BAR ===== */}
      <div style={styles.topBar}>
        <button onClick={() => setOpen(true)} style={styles.menuBtn}>☰</button>
        <b style={{ color: dark ? "#fff" : "#000" }}>TradingView</b>
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
        <Item label="🏠 Home" onClick={() => alert("Home")} />
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

      {/* ===== DEMO CONTENT ===== */}
      <div style={{ padding: 20, color: dark ? "#fff" : "#000" }}>
        <h2>Chart Area</h2>
        <p>Dark Mode: {dark ? "ON" : "OFF"}</p>
        <p>Drawings Panel: {drawingsPanel ? "Visible" : "Hidden"}</p>
        <p>Language: {language}</p>
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

const styles = {
  topBar: {
    height: 44,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 10px",
    borderBottom: "1px solid #ddd",
  },
  menuBtn: {
    fontSize: 18,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
  },
  drawer: {
    position: "fixed",
    top: 0,
    bottom: 0,
    width: 280,
    transition: "0.25s",
    padding: 12,
    zIndex: 10,
    boxShadow: "2px 0 6px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#9c27b0",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  item: {
    padding: "10px 6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontSize: 14,
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 20,
    position: "relative",
    cursor: "pointer",
  },
  knob: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#fff",
    position: "absolute",
    top: 2,
    transition: "0.2s",
  },
};
