import React from "react";

const OnChainStats = ({ data, displayTvl, displayTvlChange }) => {
  const statsConfig = [
    {
      title: "Total Value Locked",
      value: `$${displayTvl}B`,
      change: Number(displayTvlChange),
      changeText: `${Math.abs(parseFloat(displayTvlChange)).toFixed(2)}%`,
      subtitle: "vs. previous 30 days",
      stroke: "#8b5cf6",
      fill: "rgba(139, 92, 246, 0.1)",
      path: "M0,25 C10,20 20,28 30,22 C40,16 50,25 60,15 C70,5 80,18 100,5",
    },
    {
      title: "Active Chains",
      value: data.stats.activeChains,
      change: Number(data.stats.activeChainsChange),
      changeText: Math.abs(data.stats.activeChainsChange),
      subtitle: "vs. previous 30 days",
      stroke: "#3b82f6",
      fill: "rgba(59, 130, 246, 0.1)",
      path: "M0,22 C15,25 25,18 35,20 C45,22 55,10 65,15 C75,20 85,8 100,10",
    },
    {
      title: "Protocols",
      value: data.stats.protocols,
      change: Number(data.stats.protocolsChange),
      changeText: Math.abs(data.stats.protocolsChange),
      subtitle: "vs. previous 30 days",
      stroke: "#ec4899",
      fill: "rgba(236, 72, 153, 0.1)",
      path: "M0,28 C20,28 30,22 40,24 C50,26 60,15 70,18 C80,20 90,5 100,8",
    },
    {
      title: "Addresses",
      value: `${data.stats.addresses}M`,
      change: Number(data.stats.addressesChange),
      changeText: `${Math.abs(data.stats.addressesChange)}%`,
      subtitle: "vs. previous 30 days",
      stroke: "#10b981",
      fill: "rgba(16, 185, 129, 0.1)",
      path: "M0,20 C15,15 25,22 40,15 C55,8 65,18 80,10 C90,5 95,12 100,5",
    },
    {
      title: "24h Change",
      value: `$${Number(data.stats.change24hValue) >= 0 ? "+" : ""}${data.stats.change24hValue}B`,
      change: Number(data.stats.change24hPct),
      changeText: `${Math.abs(data.stats.change24hPct)}%`,
      subtitle: "vs. previous 24h",
      stroke: "#10b981",
      fill: "rgba(16, 185, 129, 0.1)",
      path: "M0,25 C20,20 30,22 50,15 C70,8 80,12 100,5",
    },
  ];

  return (
    <div className="stats-grid">
      {statsConfig.map((item, index) => (
        <div className="stat-card" key={index}>
          <div className="stat-title">{item.title}</div>

          <div className="stat-value-row">
            <div className="stat-value">{item.value}</div>

            <div
              className={`stat-change ${
                item.change >= 0 ? "up" : "down"
              }`}
            >
              {item.change >= 0 ? "▲" : "▼"} {item.changeText}
            </div>
          </div>

          <div className="stat-subtitle">{item.subtitle}</div>

          <div className="stat-sparkline">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none">
              <path
                d={item.path}
                fill="none"
                stroke={item.stroke}
                strokeWidth="2"
              />
              <path
                d={`${item.path} L100,30 L0,30 Z`}
                fill={item.fill}
                stroke="none"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OnChainStats;