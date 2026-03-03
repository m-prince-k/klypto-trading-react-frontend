import React, { useState, useRef, useEffect } from "react";
import { styles } from "./style";
/* =====================
   RIGHT SIDEBAR TABS
===================== */
const RIGHT_TABS = {
  OBJECTS: "objects",
  ALERTS: "alerts",
  IDEAS: "ideas",
  CHAT: "chat",
  WATCHLIST: "watchlist",
  SCREENER: "screener",
  ALERT_LOG: "alert_log",
  LAYOUT: "layout",
  HELP: "help",
};

export default function ChartRightSidebar() {
  const containerRef = useRef(null);

  const [activeTab, setActiveTab] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* Dummy data (future backend ready) */
  const [alerts, setAlerts] = useState([]);
  const [ideas, setIdeas] = useState("");
  const [chat, setChat] = useState([]);
  const [watchlist] = useState(["BTCUSDT", "ETHUSDT", "BNBUSDT"]);

  /* =====================
     FULLSCREEN LOGIC
  ===================== */
  const toggleFullscreen = () => {
    const el = containerRef.current;

    if (!document.fullscreenElement) {
      el.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /* ESC / manual exit sync */
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () =>
      document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        height: "100vh",
        background: "#fff",
      }}
    >
      {/* ===== MAIN CHART AREA ===== */}
      <div style={{ flex: 1, borderRight: "1px solid #ddd" }}>
        <h3 style={{ padding: 10 }}>
          📈 Chart Area (Your drawing canvas yahan rahega)
        </h3>
      </div>

      {/* ===== RIGHT ICON BAR ===== */}
      <div style={styles.iconBar}>
        <Icon title="Objects" onClick={() => setActiveTab(RIGHT_TABS.OBJECTS)}>📄</Icon>
        <Icon title="Alerts" onClick={() => setActiveTab(RIGHT_TABS.ALERTS)}>🕘</Icon>
        <Icon title="Ideas" onClick={() => setActiveTab(RIGHT_TABS.IDEAS)}>📚</Icon>
        <Icon title="Chat" onClick={() => setActiveTab(RIGHT_TABS.CHAT)}>💬</Icon>
        <Icon title="Watchlist" onClick={() => setActiveTab(RIGHT_TABS.WATCHLIST)}>🎯</Icon>
        <Icon title="Screener" onClick={() => setActiveTab(RIGHT_TABS.SCREENER)}>📐</Icon>
        <Icon title="Alert Log" onClick={() => setActiveTab(RIGHT_TABS.ALERT_LOG)}>🔔</Icon>
        <Icon title="Layout" onClick={() => setActiveTab(RIGHT_TABS.LAYOUT)}>🧱</Icon>

        {/* FULLSCREEN ICON */}
        <Icon title="Fullscreen" onClick={toggleFullscreen}>
          {isFullscreen ? "🡼" : "⛶"}
        </Icon>

        <Icon title="Help" onClick={() => setActiveTab(RIGHT_TABS.HELP)}>❓</Icon>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      {activeTab && (
        <div style={styles.panel}>
          {activeTab === RIGHT_TABS.OBJECTS && (
            <>
              <h4>📄 Objects</h4>
              <p>Drawings list yahan show hogi</p>
            </>
          )}

          {activeTab === RIGHT_TABS.ALERTS && (
            <>
              <h4>🕘 Alerts</h4>
              <button
                onClick={() =>
                  setAlerts([...alerts, `Alert @ ${new Date().toLocaleTimeString()}`])
                }
              >
                ➕ Create Alert
              </button>
              <ul>{alerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </>
          )}

          {activeTab === RIGHT_TABS.IDEAS && (
            <>
              <h4>📚 Ideas</h4>
              <textarea
                placeholder="Write your trading idea..."
                value={ideas}
                onChange={(e) => setIdeas(e.target.value)}
                style={{ width: "100%", height: 120 }}
              />
            </>
          )}

          {activeTab === RIGHT_TABS.CHAT && (
            <>
              <h4>💬 Chat</h4>
              <button onClick={() => setChat([...chat, "New comment"])}>
                ➕ Comment
              </button>
              <ul>{chat.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </>
          )}

          {activeTab === RIGHT_TABS.WATCHLIST && (
            <>
              <h4>🎯 Watchlist</h4>
              <ul>{watchlist.map((s) => <li key={s}>{s}</li>)}</ul>
            </>
          )}

          {activeTab === RIGHT_TABS.SCREENER && (
            <>
              <h4>📐 Screener</h4>
              <p>Indicators & filters (future ready)</p>
            </>
          )}

          {activeTab === RIGHT_TABS.ALERT_LOG && (
            <>
              <h4>🔔 Alert Log</h4>
              <p>Triggered alerts history</p>
            </>
          )}

          {activeTab === RIGHT_TABS.LAYOUT && (
            <>
              <h4>🧱 Layout</h4>
              <button onClick={() => alert("Layout JSON saved")}>
                💾 Save Layout
              </button>
            </>
          )}

          {activeTab === RIGHT_TABS.HELP && (
            <>
              <h4>❓ Help</h4>
              <p>TradingView-style chart usage help</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* =====================
   UI COMPONENTS
===================== */
const Icon = ({ children, onClick, title }) => (
  <div title={title} onClick={onClick} style={styles.icon}>
    {children}
  </div>
);


