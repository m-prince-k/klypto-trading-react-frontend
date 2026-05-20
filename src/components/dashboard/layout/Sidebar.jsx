import React from "react";

const Sidebar = ({ sidebarOpen, activeTab = "Overview", setActiveTab = () => { } }) => {
  return (
    <aside
      className={`sidebar-panel ${sidebarOpen ? "open" : "collapsed"}`}
      style={{
        width: sidebarOpen ? "240px" : "70px",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div>


        {/* Menu Links */}
        <nav className="nav-links">
          <a
            href="#overview"
            className={`nav-item ${activeTab === "Overview" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Overview");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Overview</span>
            </span>
          </a>

          <a
            href="#market-data"
            className={`nav-item ${activeTab === "Market Data" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Market Data");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Market Data</span>
            </span>
          </a>

          <a
            href="#onchain"
            className={`nav-item ${activeTab === "On-Chain (TVL)" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("On-Chain (TVL)");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>On-Chain (TVL)</span>
            </span>
          </a>

          <a
            href="/social-intelligence"
            className={`nav-item ${activeTab === "Social Intelligence" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Social Intelligence");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Social Intelligence</span>
            </span>
          </a>

          <a
            href="#sentiment"
            className={`nav-item ${activeTab === "Market Sentiment" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Market Sentiment");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Market Sentiment</span>
            </span>
          </a>

          <a
            href="#financials"
            className={`nav-item ${activeTab === "Financials" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Financials");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Financials</span>
            </span>
          </a>

          <a
            href="#arbitrage"
            className={`nav-item ${activeTab === "Arbitrage" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Arbitrage");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 1l4 4-4 4M21 5H9M7 23l-4-4 4-4M3 19h12" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Arbitrage</span>
            </span>
          </a>

          <a
            href="#watchlist"
            className={`nav-item ${activeTab === "Watchlist" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Watchlist");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Watchlist</span>
            </span>
          </a>

          <a
            href="#alerts"
            className={`nav-item ${activeTab === "Alerts" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Alerts");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Alerts</span>
            </span>
          </a>

          <a
            href="#api"
            className={`nav-item ${activeTab === "API Status" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("API Status");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>API Status</span>
            </span>
          </a>

          <a
            href="#settings"
            className={`nav-item ${activeTab === "Settings" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Settings");
            }}
          >
            <span className="nav-label-group">
              <span className="nav-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap" }}>Settings</span>
            </span>
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
