import React, { useState } from "react";

const HeatmapArbitrageGrid = ({ socialStats, arbitrage, tvlData }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "16px",
        marginBottom: "16px",
      }}
    >
      {/* Left Col: Top Arbitrage */}
      <div
        className="premium-card clickable"
        onClick={() => (window.location.href = "/dashboard#arbitrage")}
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div className="card-header-row">
          <h4 className="card-title-main">Top Arbitrage</h4>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "6px",
            flex: 1,
            overflowY: "auto"
          }}
        >
          {arbitrage && arbitrage.length > 0 ? (
            arbitrage?.slice(0, 5).map((arb, i) => (
              <div 
                key={`arb-${i}`} 
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: "rgba(99, 102, 241, 0.06)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                  borderRadius: "6px",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                  <span style={{ fontWeight: "bold", color: "var(--text-main)", fontSize: "13px" }}>
                    {arb.symbol}
                  </span>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    Buy: {arb.buyEx} (${Number(arb.buyPrice).toFixed(4)})<br/>
                    Sell: {arb.sellEx} (${Number(arb.sellPrice).toFixed(4)})
                  </div>
                </div>
                <div 
                  style={{ 
                    padding: "4px 8px", 
                    fontSize: "11px", 
                    fontWeight: "bold", 
                    color: "#10b981", 
                    backgroundColor: "rgba(16, 185, 129, 0.1)", 
                    border: "1px solid rgba(16, 185, 129, 0.25)", 
                    borderRadius: "4px" 
                  }}
                >
                  {Number(arb.spreadPct).toFixed(2)}% Spread
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Scanning opportunities...
            </div>
          )}
        </div>
      </div>

      {/* Right Col: Stack of TVL and Heatmap */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* TVL Table (Reduced Height) */}
        <div className="premium-card" style={{ flex: 1, overflowY: "auto", minHeight: "180px" }}>
          <div className="card-header-row">
            <h4 className="card-title-main">Top Protocols by TVL</h4>
          </div>
          <table className="custom-crypto-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Protocol</th>
                <th style={{ textAlign: 'left' }}>Category</th>
                <th style={{ textAlign: 'right' }}>TVL</th>
                <th style={{ textAlign: 'right' }}>7D Change</th>
              </tr>
            </thead>
            <tbody>
              {tvlData?.protocols ? tvlData?.protocols?.slice(0, 7).map((proto, index) => {
                const isUp = proto.change >= 0;
                return (
                  <tr key={`tvl-proto-${index}`}>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="coin-icon-small" style={{ backgroundColor: proto.color, flexShrink: 0, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>{proto.icon}</div>
                        <span>{proto.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'left', color: 'var(--text-muted)' }}>{proto.cat}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${proto.val.toFixed(2)}B</td>
                    <td style={{ textAlign: 'right', color: isUp ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {isUp ? '▲ +' : '▼ '}{Number(proto.change).toFixed(2)}%
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="4" align="center">Loading protocols...</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Narrative Heatmap */}
        <div className="premium-card" style={{ height: "150px" }}>
          <div className="card-header-row">
            <h4 className="card-title-main">Narrative Heatmap</h4>
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              marginTop: "6px",
            }}
          >
            {Object.entries(socialStats?.narrativeScores || {}).slice(0, 5).map(([narrative, score], i) => {
              const configs = [
                { top: "5px", left: "10%", width: "48px", height: "48px", bg: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.05) 100%)", border: "#6366f1", shadow: "0 0 10px rgba(99,102,241,0.3)", valColor: "#a5b4fc" },
                { top: "35px", right: "15%", width: "44px", height: "44px", bg: "radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(167,139,250,0.05) 100%)", border: "#a78bfa", shadow: "0 0 10px rgba(167,139,250,0.3)", valColor: "#c7d2fe" },
                { bottom: "5px", left: "25%", width: "38px", height: "38px", bg: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)", border: "#f59e0b", shadow: "none", valColor: "#fcd34d" },
                { top: "10px", right: "35%", width: "40px", height: "40px", bg: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.05) 100%)", border: "#10b981", shadow: "none", valColor: "#6ee7b7" },
                { bottom: "10px", right: "10%", width: "36px", height: "36px", bg: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)", border: "#3b82f6", shadow: "none", valColor: "#93c5fd" },
              ];
              const cfg = configs[i];

              return (
                <div
                  key={narrative}
                  style={{
                    position: "absolute",
                    top: cfg.top, left: cfg.left, right: cfg.right, bottom: cfg.bottom,
                    width: cfg.width, height: cfg.height,
                    borderRadius: "50%",
                    background: cfg.bg,
                    border: `1.2px solid ${cfg.border}`,
                    boxShadow: cfg.shadow,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "7.5px", fontWeight: "bold", color: "var(--text-main)", textAlign: "center", width: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {narrative === "Memecoins" ? "MEME" : narrative === "Layer2" ? "L2" : narrative}
                  </span>
                  <span style={{ fontSize: "8px", color: cfg.valColor, fontWeight: "bold" }}>
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeatmapArbitrageGrid;
