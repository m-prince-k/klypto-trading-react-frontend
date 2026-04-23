import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// 🔥 BULK STATIC DATA GENERATOR (realistic pattern)
const generateBacktestData = () => {
  const data = [];
  const start = new Date("2024-01-01");

  const sectors = ["defi", "bank", "energy", "fmcg"];

  let base = {
    defi: 0,
    bank: 0,
    energy: 0,
    fmcg: 0,
  };

  for (let i = 0; i < 120; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);

    // simulate pnl movement (trend + noise)
    base.defi += Math.sin(i / 5) * 0.8 + (Math.random() - 0.5);
    base.bank += Math.cos(i / 6) * 0.6 + (Math.random() - 0.5);
    base.energy += Math.sin(i / 8) * 0.5 + (Math.random() - 0.5);
    base.fmcg += Math.cos(i / 10) * 0.4 + (Math.random() - 0.5);

    data.push({
      date: d.toISOString().split("T")[0],
      defi: Number(base.defi.toFixed(2)),
      bank: Number(base.bank.toFixed(2)),
      energy: Number(base.energy.toFixed(2)),
      fmcg: Number(base.fmcg.toFixed(2)),
    });
  }

  return data;
};
const sectorColors = {
  defi: "#6EC1E4",
  bank: "#5DADE2",
  energy: "#2ECC71",
  fmcg: "#FF4D6D",
};
const rawData = generateBacktestData();

const BacktestResults = () => {
  const [selectedSector, setSelectedSector] = useState(null);

  const sectors = ["defi", "bank", "energy", "fmcg"];

  const chartData = useMemo(() => {
    if (!selectedSector) return rawData;

    return rawData.map((d) => ({
      date: d.date,
      [selectedSector]: d[selectedSector],
    }));
  }, [selectedSector]);

  return (
    <div style={{ padding: 20 }}>
      <h3>Backtest Results (Static Data)</h3>

      {/* 🔹 Filters */}
      <div style={{ marginBottom: 15 }}>
        <button onClick={() => setSelectedSector(null)}>All</button>

        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSector(s)}
            style={{
              marginLeft: 8,
              background: selectedSector === s ? "#333" : "#eee",
              color: selectedSector === s ? "#fff" : "#000",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 🔹 Chart */}
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} barSize={6}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" interval={15} />
            <YAxis />
            <Tooltip />

           {selectedSector ? (
  <Bar
    dataKey={selectedSector}
    fill={sectorColors[selectedSector]}
  />
) : (
  Object.keys(sectorColors).map((sector) => (
    <Bar
      key={sector}
      dataKey={sector}
      stackId="a"
      fill={sectorColors[sector]}
    />
  ))
)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BacktestResults;