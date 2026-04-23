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
import { Dropdown, Container, Card } from "react-bootstrap";

// 🔥 Color map (fallback safe)
const sectorColors = {
  store: "#F5B041",
  l1: "#5DADE2",
  exchange: "#FF6F91",
  payments: "#58D68D",
  l2: "#AF7AC5",
  defi: "#F4D03F",
  infra: "#48C9B0",
  gaming: "#EB984E",
  alt: "#85929E",
};

const getColor = (key) => sectorColors[key] || "#999";

const BacktestResults = () => {
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [rawData, setRawData] = useState([]);
  const chartRef = useRef();

  // ===============================
  // 🔥 FETCH API
  // ===============================
  useEffect(() => {
    fetch("http://localhost:5000/api/backtest")
      .then((res) => res.json())
      .then((data) => {
        setRawData(data.chart || []);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  // ===============================
  // 🔥 AUTO-DETECT SECTORS
  // ===============================
  const allSectors = useMemo(() => {
    if (!rawData.length) return [];

    return Object.keys(rawData[0]).filter((k) => k !== "date");
  }, [rawData]);

  // ===============================
  // 🔥 TOGGLE LOGIC (Chartink style)
  // ===============================
  const toggleSector = (key) => {
    if (isAllSelected) {
      setSelectedSectors([key]);
      setIsAllSelected(false);
      return;
    }

    setSelectedSectors((prev) => {
      if (prev.includes(key)) {
        const updated = prev.filter((s) => s !== key);

        if (updated.length === 0) {
          setIsAllSelected(true);
          return [];
        }

        return updated;
      }

      return [...prev, key];
    });
  };

  // ===============================
  // 🔥 ACTIVE SECTORS
  // ===============================
  const activeSectors = isAllSelected ? allSectors : selectedSectors;

  // ===============================
  // 🔥 CHART DATA
  // ===============================
  const chartData = useMemo(() => {
    return rawData.map((d) => {
      const obj = { date: d.date };

      activeSectors.forEach((s) => {
        const val = d[s];

        // ❗ hide negative values (your requirement)
        obj[s] = val > 0 ? val : 0;
      });

      return obj;
    });
  }, [rawData, activeSectors]);

  // ===============================
  // 🔹 DOWNLOAD
  // ===============================
  const downloadChartImage = async () => {
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Container fluid className="py-4 px-4" style={{ background: "#F8F9FA" }}>
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h4>Backtest Results</h4>

        <Dropdown align="end">
          <Dropdown.Toggle size="sm">Download</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={downloadChartImage}>
              Download Chart
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {/* 🔥 LEGEND */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {allSectors.map((key) => {
              const isActive = activeSectors.includes(key);
              const color = getColor(key);

              return (
                <span
                  key={key}
                  onClick={() => toggleSector(key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    cursor: "pointer",
                    background: isActive ? color : "#eee",
                    color: isActive ? "#fff" : "#444",
                    fontSize: 13,
                  }}
                >
                  ● {key}
                </span>
              );
            })}
          </div>

          {/* 🔥 CHART */}
          <div ref={chartRef} style={{ height: 420 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, "auto"]} />
                

                {/* 🔥 TOOLTIP (ONLY HOVERED BAR) */}
                <Tooltip
                  shared={false}
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0)
                      return null;

                    // 🔥 Find the bar actually hovered (value > 0)
                    const item = payload.find((p) => p.value > 0);

                    if (!item) return null; // no bar hovered

                    return (
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #ddd",
                          padding: "8px 12px",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {item.payload.date}
                        </div>

                        <div style={{ color: item.color }}>
                          {item.name}: {item.value.toFixed(2)}%
                        </div>
                      </div>
                    );
                  }}
                />

                {/* 🔥 BARS */}
                {activeSectors.map((s) => (
                  <Bar key={s} dataKey={s} isAnimationActive={false} stackId="a" fill={getColor(s)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BacktestResults;
