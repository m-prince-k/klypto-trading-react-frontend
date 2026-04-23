import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import html2canvas from "html2canvas";
import { Dropdown, Container, Card, Button } from "react-bootstrap";
import apiService from "../../services/apiServices";

// sectors
const sectorsMap = [
  { key: "industrials", color: "#6EC1E4" },
  { key: "indices", color: "#FF6F91" },
  { key: "financials", color: "#7ED957" },
  { key: "reality", color: "#F6A623" },
  { key: "metals", color: "#7B7FD1" },
  { key: "fmcg", color: "#FF4D6D" },
  { key: "chemicals", color: "#F8E16C" },
  { key: "services", color: "#4DB6AC" },
  { key: "energy", color: "#2ECC71" },
  { key: "bank", color: "#5DADE2" },
];

// large dataset
const generateData = () => {
  const data = [];
  const start = new Date("2023-08-26");

  for (let i = 0; i < 200; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);

    const base =
      Math.sin(i / 6) * 25 + Math.cos(i / 12) * 10 + 60 + Math.random() * 10;

    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      industrials: Math.round(base * 0.12),
      indices: Math.round(base + Math.random() * 30),
      financials: Math.round(base * 0.08),
      reality: Math.round(base * 0.05),
      metals: Math.round(base * 0.06),
      fmcg: Math.round(base * 0.1),
      chemicals: Math.round(base * 0.05),
      services: Math.round(base * 0.06),
      energy: Math.round(base * 0.07),
      bank: Math.round(base * 0.15),
    });
  }

  return data;
};

const rawData = generateData();

const BacktestResults = () => {
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectors, setSectors] = useState(sectorsMap);
  const [openDropdown, setOpenDropdown] = useState(false);
  const chartRef = useRef(); // filter logic
  const [sectorsLoading, setSectorsLoading] = useState(true);

  async function fetchSectors() {
  try {
    const response = await apiService.post("/api/sectors");
    const raw = response?.data;

    const formatted = (raw ?? []).map((item) => ({
      key: item.key || item.slug || item.name,
      color: item.color || "#cccccc",
    }));

    setSectors(formatted);
  } catch (err) {
    console.error("Sectors API Error:", err);
    setSectors([]);
  } finally {
    setSectorsLoading(false);
  }
}

useEffect(() => {
  fetchSectors();
}, []);

  const chartData = useMemo(() => {
    if (!selectedSector) return rawData;

    return rawData.map((item) => ({
      date: item.date,
      [selectedSector]: item[selectedSector],
    }));
  }, [selectedSector]); // :small_blue_diamond: CSV DOWNLOAD

  const downloadCSV = () => {
    const headers = Object.keys(chartData[0]);
    const rows = chartData.map((row) => headers.map((h) => row[h]).join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backtest.csv";
    a.click();
  }; // :small_blue_diamond: TIMELINE JSON DOWNLOAD

  const downloadTimeline = () => {
    const blob = new Blob([JSON.stringify(chartData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline.json";
    a.click();
  }; // :small_blue_diamond: CHART IMAGE DOWNLOAD

  const downloadChartImage = async () => {
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const menuItems = [
    {
      label: "Download CSV",
      onClick: downloadCSV,
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="2"
            y="1"
            width="10"
            height="12"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M4.5 5h5M4.5 7.5h5M4.5 10h3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Download Chart",
      onClick: downloadChartImage,
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 11.5V9l2.5-2.5 2.5 2.5L11.5 4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Download Timeline",
      onClick: downloadTimeline,
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle
            cx="7"
            cy="7"
            r="5.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M7 4v3.2l2 1.3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const chipStyle = {
    cursor: "pointer",
    padding: "7px 16px",
    borderRadius: "999px",
    border: "1.5px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.01em",
    transition: "all 0.18s ease",
    userSelect: "none",
  };

  const inactiveStyle = {
    ...chipStyle,
    background: "#F4F4F4",
    color: "#555",
    borderColor: "#D8D8D8",
  };

  const activeStyle = (color) => ({
    ...chipStyle,
    background: color,
    color: "#fff",
    borderColor: "transparent",
  });

  return (
    <Container fluid className="pb-4 px-4" style={{ background: "#F8F9FA" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0 fw-semibold text-dark">Backtest Results</h4>

        {/* Download Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-secondary" size="sm">
            Download
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{
              border: "1px solid #E8E8E8",
              borderRadius: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              padding: "4px 0",
              minWidth: 172,
            }}
          >
            {menuItems.map(({ label, onClick, icon }) => (
              <Dropdown.Item
                key={label}
                onClick={onClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F5F5F5";
                  e.currentTarget.style.color = "#111";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#333";
                }}
              >
                <span style={{ color: "#888", display: "flex" }}>{icon}</span>
                {label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          {/* Top Bar */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            {/* Chips */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: "0.75rem",
                }}
              >
                Filter by sector
              </p>

              <div className="d-flex flex-wrap gap-2">
                {sectors.map((s) => {
                  const isActive = selectedSector === s.key;
                  return (
                    <span
                      key={s.key}
                      style={isActive ? activeStyle(s.color) : inactiveStyle}
                      onClick={() => setSelectedSector(isActive ? null : s.key)}
                      role="button"
                      aria-pressed={isActive}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#aaa";
                          e.currentTarget.style.color = "#222";
                          e.currentTarget.style.background = "#fff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#D8D8D8";
                          e.currentTarget.style.color = "#555";
                          e.currentTarget.style.background = "#F4F4F4";
                        }
                      }}
                    >
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: isActive
                            ? "rgba(255,255,255,0.85)"
                            : s.color,
                          boxShadow: isActive
                            ? "0 0 0 2px rgba(255,255,255,0.3)"
                            : "none",
                        }}
                      />
                      {s.key}
                    </span>
                  );
                })}
              </div>

              {selectedSector && (
                <p
                  style={{ marginTop: "0.85rem", fontSize: 13, color: "#666" }}
                >
                  Showing results for{" "}
                  <strong style={{ color: "#222" }}>{selectedSector}</strong>
                  <span
                    onClick={() => setSelectedSector(null)}
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: "#aaa",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Clear
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Chart */}
          <div ref={chartRef} style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={4}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" interval={20} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                {selectedSector ? (
                  <Bar
                    dataKey={selectedSector}
                    fill={sectors.find((s) => s.key === selectedSector).color}
                  />
                ) : (
                  sectors.map((s) => (
                    <Bar
                      key={s.key}
                      dataKey={s.key}
                      stackId="a"
                      fill={s.color}
                    />
                  ))
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BacktestResults;
