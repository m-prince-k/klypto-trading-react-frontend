import React, { useState } from "react";
import ProfileSection from "../../components/auth/profile/ProfileSection";
import ScansSection from "../../components/auth/profile/ScanSection";

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6.5" cy="6.5" r="4" />
    <line x1="10" y1="10" x2="14" y2="14" />
  </svg>
);

const ScansIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="12" height="12" rx="2" />
    <line x1="5" y1="5.5" x2="11" y2="5.5" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="10.5" x2="9" y2="10.5" />
  </svg>
);

const AlertsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2a5 5 0 015 5v2l1.5 2.5H1.5L3 9V7a5 5 0 015-5z" />
    <path d="M6.5 12.5a1.5 1.5 0 003 0" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="5.5" r="2.5" />
    <path d="M3 13c0-2.761 2.239-4 5-4s5 1.239 5 4" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="2" x2="8" y2="14" />
    <line x1="2" y1="8" x2="14" y2="8" />
  </svg>
);

const BellLargeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2a7 7 0 017 7v3l2 3.5H3L5 12V9a7 7 0 017-7z" />
    <path d="M9.5 18a2.5 2.5 0 005 0" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const mockScans = [
  {
    name: "DDD",
    description: "",
    clause: "( cash ( daily rsi(14) > 40 ) )",
    created: "4/7/2026",
  },
  {
    name: "Breakout",
    description: "High breakout",
    clause: "( close > highest(high, 20) )",
    created: "4/6/2026",
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  // Layout
  wrapper: {
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    backgroundColor: "#f5f5f2",
    color: "#1a1a1a",
  },

  // Nav
  nav: {
    backgroundColor: "#ffffff",
    borderBottom: "0.5px solid rgba(0,0,0,0.12)",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "52px",
    boxSizing: "border-box",
  },
  navLeft: {
    display: "flex",
    gap: "4px",
  },

  // Buttons
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    backgroundColor: "#185FA5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "7px 16px",
    fontSize: "13.5px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnGhost: {
    border: "0.5px solid rgba(0,0,0,0.22)",
    backgroundColor: "#ffffff",
    color: "#555",
    borderRadius: "8px",
    padding: "7px 14px",
    fontSize: "13.5px",
    fontWeight: 400,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Page
  page: {
    padding: "24px",
  },

  // Stats
  statsStrip: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "0.5px solid rgba(0,0,0,0.1)",
    borderRadius: "10px",
    padding: "14px 18px",
    flex: 1,
  },
  statLabel: {
    fontSize: "11.5px",
    color: "#888",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "4px",
  },

  // Scans header
  scansHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    border: "0.5px solid rgba(0,0,0,0.2)",
    borderRadius: "8px",
    padding: "7px 12px",
    width: "260px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: "13.5px",
    color: "#1a1a1a",
    width: "100%",
  },

  // Table
  tableCard: {
    backgroundColor: "#ffffff",
    border: "0.5px solid rgba(0,0,0,0.1)",
    borderRadius: "14px",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13.5px",
  },
  th: {
    padding: "11px 16px",
    textAlign: "left",
    fontWeight: 500,
    fontSize: "12px",
    color: "#888",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    borderBottom: "0.5px solid rgba(0,0,0,0.1)",
  },
  td: {
    padding: "13px 16px",
    verticalAlign: "middle",
    borderBottom: "0.5px solid rgba(0,0,0,0.07)",
  },

  // Profile
  profileCard: {
    backgroundColor: "#ffffff",
    border: "0.5px solid rgba(0,0,0,0.1)",
    borderRadius: "14px",
    padding: "28px",
    maxWidth: "620px",
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
    paddingBottom: "24px",
    borderBottom: "0.5px solid rgba(0,0,0,0.1)",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #E6F1FB",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px 20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  formLabel: {
    fontSize: "11.5px",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "5px",
  },
  formInput: {
    border: "0.5px solid rgba(0,0,0,0.2)",
    borderRadius: "8px",
    padding: "9px 13px",
    fontFamily: "inherit",
    fontSize: "14px",
    color: "#1a1a1a",
    backgroundColor: "#f8f8f6",
    outline: "none",
  },
  profileActions: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },

  // Empty state
  emptyState: {
    backgroundColor: "#ffffff",
    border: "0.5px solid rgba(0,0,0,0.1)",
    borderRadius: "14px",
    padding: "60px 32px",
    textAlign: "center",
    maxWidth: "440px",
    margin: "0 auto",
  },
  emptyIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#FAEEDA",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#BA7517",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavTab({ active, onClick, icon, label, dot }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "6px 14px",
        borderRadius: "8px",
        fontSize: "13.5px",
        fontWeight: active ? 500 : 400,
        cursor: "pointer",
        color: active ? "#185FA5" : "#777",
        background: active ? "#E6F1FB" : "transparent",
        border: "none",
        fontFamily: "inherit",
        position: "relative",
      }}
    >
      {icon}
      {label}
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#D85A30",
            display: "inline-block",
          }}
        />
      )}
    </button>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    blue: "#185FA5",
    green: "#1D9E75",
    amber: "#BA7517",
    default: "#1a1a1a",
  };
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div
        style={{
          fontSize: color === "green" ? "16px" : "22px",
          fontWeight: 500,
          paddingTop: color === "green" ? "3px" : 0,
          color: colorMap[color] || colorMap.default,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ClausePill({ text }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "#f5f5f2",
        border: "0.5px solid rgba(0,0,0,0.12)",
        borderRadius: "6px",
        padding: "3px 9px",
        fontFamily: "'Space Mono', 'Courier New', monospace",
        fontSize: "11px",
        color: "#666",
        maxWidth: "240px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      title={text}
    >
      {text}
    </span>
  );
}

function ActionButton({ label, type }) {
  const styles = {
    share: { color: "#1D9E75", borderColor: "#9FE1CB", background: "#E1F5EE" },
    edit: { color: "#185FA5", borderColor: "#B5D4F4", background: "#E6F1FB" },
    del: { color: "#D85A30", borderColor: "#F5C4B3", background: "#FAECE7" },
  };
  return (
    <button
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        border: `0.5px solid ${styles[type].borderColor}`,
        color: styles[type].color,
        background: styles[type].background,
      }}
    >
      {label}
    </button>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────



function AlertsSection() {
  return (
    <div style={styles.page}>
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <BellLargeIcon />
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "6px" }}>
          No alerts configured
        </h3>
        <p
          style={{
            fontSize: "13.5px",
            color: "#777",
            lineHeight: 1.6,
            marginBottom: "20px",
          }}
        >
          Set up price alerts on your scanners to get notified when conditions
          are triggered.
        </p>
        <button style={{ ...styles.btnPrimary, margin: "0 auto" }}>
          <PlusIcon />
          Create a scanner first
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div style={styles.wrapper}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #bbb; }
        button:hover { opacity: 0.88; }
      `}</style>

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <NavTab
            active={activeTab === "scans"}
            onClick={() => setActiveTab("scans")}
            icon={<ScansIcon />}
            label="Scans"
          />
          <NavTab
            active={activeTab === "alerts"}
            onClick={() => setActiveTab("alerts")}
            icon={<AlertsIcon />}
            label="Alerts"
            dot
          />
          <NavTab
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<ProfileIcon />}
            label="Profile"
          />
        </div>

        <button style={styles.btnPrimary}>
          <PlusIcon />
          Create scanner
        </button>
      </nav>

      {/* Pages */}
      {activeTab === "scans" && <ScansSection />}
      {activeTab === "alerts" && <AlertsSection />}
      {activeTab === "profile" && <ProfileSection />}
    </div>
  );
}