import React, { useState, useMemo, useRef } from "react";
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

// sectors
const sectors = [
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
      Math.sin(i / 6) * 25 +
      Math.cos(i / 12) * 10 +
      60 +
      Math.random() * 10;

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

const BacktestChart = () => {
  const [selectedSector, setSelectedSector] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const chartRef = useRef();

  // filter logic
  const chartData = useMemo(() => {
    if (!selectedSector) return rawData;

    return rawData.map((item) => ({
      date: item.date,
      [selectedSector]: item[selectedSector],
    }));
  }, [selectedSector]);

  // :small_blue_diamond: CSV DOWNLOAD
  const downloadCSV = () => {
    const headers = Object.keys(chartData[0]);
    const rows = chartData.map((row) =>
      headers.map((h) => row[h]).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backtest.csv";
    a.click();
  };

  // :small_blue_diamond: TIMELINE JSON DOWNLOAD
  const downloadTimeline = () => {
    const blob = new Blob([JSON.stringify(chartData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline.json";
    a.click();
  };

  // :small_blue_diamond: CHART IMAGE DOWNLOAD
  const downloadChartImage = async () => {
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div style={{ width: "100%", height: 500 }}>

      {/* :small_blue_diamond: Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>

        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {sectors.map((s) => (
            <div
              key={s.key}
              onClick={() =>
                setSelectedSector(selectedSector === s.key ? null : s.key)
              }
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "20px",
                background:
                  selectedSector === s.key ? s.color : "#F1F1F1",
                color: selectedSector === s.key ? "#fff" : "#000",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: s.color,
                }}
              />
              {s.key}
            </div>
          ))}
        </div>

        {/* :arrow_down_small: Download Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            Download :arrow_down:
          </button>

          {openDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "110%",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 10,
                minWidth: 150,
              }}
            >
              <div
                onClick={downloadCSV}
                style={{ padding: 10, cursor: "pointer" }}
              >
                :page_facing_up: Download CSV
              </div>
              <div
                onClick={downloadChartImage}
                style={{ padding: 10, cursor: "pointer" }}
              >
                :bar_chart: Download Chart
              </div>
              <div
                onClick={downloadTimeline}
                style={{ padding: 10, cursor: "pointer" }}
              >
                :clock3: Download Timeline
              </div>
            </div>
          )}
        </div>
      </div>

      {/* :small_blue_diamond: Chart */}
      <div ref={chartRef} style={{ width: "100%", height: "100%" }}>
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
    </div>
  );
};

export default BacktestChart;