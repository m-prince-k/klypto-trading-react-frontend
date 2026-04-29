import React from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileSection from "../../components/auth/profile/ProfileSection";
import ScansSection from "../../components/auth/profile/ScanSection";
import AlertSection from "../../components/auth/profile/AlertSection";
import Navbar from "../../components/Navbar";

// ─── Icons ───────────────────────────────────────────────────────────────────

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

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { to: "/scan_dashboard",  icon: <ScansIcon />,   label: "Scans" },
  { to: "/alert_dashboard", icon: <AlertsIcon />,  label: "Alerts" },
  { to: "/profile",         icon: <ProfileIcon />, label: "Profile" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    backgroundColor: "#f5f5f2",
    color: "#1a1a1a",
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderBottom: "0.5px solid rgba(0,0,0,0.12)",
    borderRadius: "5px",
    padding: "0 24px",
    margin: "20px 25px 2px 25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "52px",
    boxSizing: "border-box",
  },
  tabLeft: { display: "flex", gap: "4px" },
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
    textDecoration: "none",
  },
};

// ─── Shared layout ────────────────────────────────────────────────────────────

function PageLayout({ children }) {
  const { pathname } = useLocation();

  return (
    <div style={styles.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #bbb; }
        button:hover { opacity: 0.88; }
      `}</style>

      <Navbar />

      <div style={styles.tabBar}>
        <div style={styles.tabLeft}>
          {TABS.map(({ to, icon, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: active ? 500 : 400,
                  color: active ? "#185FA5" : "#777",
                  background: active ? "#E6F1FB" : "transparent",
                  textDecoration: "none",
                }}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </div>
        <Link to="/scannerBuilder" style={styles.btnPrimary}>
          <PlusIcon /> Create scanner
        </Link>
      </div>

      {children}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

export function ScansPage() {
  return <PageLayout><ScansSection /></PageLayout>;
}

export function AlertsPage() {
  return <PageLayout><AlertSection /></PageLayout>;
}

export function ProfilePage() {
  return <PageLayout><ProfileSection /></PageLayout>;
}

export default ProfilePage;