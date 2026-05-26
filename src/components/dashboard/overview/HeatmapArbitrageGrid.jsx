import React, { useState } from "react";
import PriceCompassModal from "./PriceCompassModal";

const HeatmapArbitrageGrid = ({ socialStats, arbitrage, alerts }) => {
  const [isCompassModalOpen, setIsCompassModalOpen] = useState(false);

  // Mock priceCompass data to be used if not provided by backend yet
  const dummyPriceCompass = {
    deviation: "0.1700",
    prices: [
      {exchange: 'binance', price: 50000},
      {exchange: 'kraken', price: 50100},
      {exchange: 'bybit', price: 49950},
      {exchange: 'okx', price: 50049.99999999999}
    ]
  };

  const currentPriceCompass = arbitrage?.priceCompass || dummyPriceCompass;

  return (
    <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
        gap: "12px",
      }}
    >
      {/* Card 1: Narrative Heatmap bubbles */}
      <div className="premium-card" style={{ minHeight: "180px" }}>
        <div className="card-header-row">
          <h4 className="card-title-main">Narrative Heatmap</h4>
          <span className="glow-tag-purple">LUNARCRUSH</span>
        </div>

        {/* CSS Bubble floating layout inside custom wrapper */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "120px",
            overflow: "hidden",
            marginTop: "6px",
          }}
        >
          {Object.entries(socialStats?.narrativeScores || {}).slice(0, 5).map(([narrative, score], i) => {
            const configs = [
              { top: "10px", left: "10px", width: "48px", height: "48px", bg: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.05) 100%)", border: "#6366f1", shadow: "0 0 10px rgba(99,102,241,0.3)", valColor: "#a5b4fc" },
              { top: "48px", right: "15px", width: "44px", height: "44px", bg: "radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(167,139,250,0.05) 100%)", border: "#a78bfa", shadow: "0 0 10px rgba(167,139,250,0.3)", valColor: "#c7d2fe" },
              { bottom: "10px", left: "55px", width: "38px", height: "38px", bg: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)", border: "#f59e0b", shadow: "none", valColor: "#fcd34d" },
              { top: "5px", right: "65px", width: "40px", height: "40px", bg: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.05) 100%)", border: "#10b981", shadow: "none", valColor: "#6ee7b7" },
              { bottom: "15px", left: "115px", width: "36px", height: "36px", bg: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)", border: "#3b82f6", shadow: "none", valColor: "#93c5fd" },
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

      {/* Card 2: Top Arbitrage Opportunities */}
      <div
        className="premium-card"
        onClick={() =>
          (window.location.href = "/dashboard#arbitrage")
        }
      >
        <div className="card-header-row">
          <h4 className="card-title-main">Top Arbitrage</h4>
          <span className="glow-tag-green">CCXT PRICES</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "6px",
          }}
        >
          {arbitrage && arbitrage.length > 0 ? (
            arbitrage.slice(0, 3).map((arb, i) => (
              <div key={`arb-${i}`} className="compass-item-row">
                <div>
                  <span style={{ fontWeight: "bold", color: "var(--text-main)" }}>
                    {arb.symbol}
                  </span>
                  <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>
                    Binance ${arb.binance} | Bybit ${arb.bybit}
                  </div>
                </div>
                <span className="trade-action-badge">{arb.spread} Spread</span>
              </div>
            ))
          ) : (
            <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Scanning opportunities...
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Multi Exchange pricing compass */}
      <div 
        className="premium-card" 
        style={{ cursor: "pointer", transition: "transform 0.2s" }}
        onClick={() => setIsCompassModalOpen(true)}
        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
      >
        <div className="card-header-row">
          <h4 className="card-title-main">Price Compass</h4>
          <span className="glow-tag-green">CCXT</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          {/* Real 3D Mini Compass SVG */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            style={{ flexShrink: 0 }}
          >
            <defs>
              <linearGradient id="miniMetalBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="miniGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <radialGradient id="miniCenter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </radialGradient>
              <filter id="miniShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Outer Bezel */}
            <circle cx="32" cy="32" r="30" fill="#0b0f19" stroke="url(#miniMetalBezel)" strokeWidth="2.5" filter="url(#miniShadow)" />
            
            {/* Inner Ring */}
            <circle cx="32" cy="32" r="24" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="1 3" />
            <circle cx="32" cy="32" r="18" fill="none" stroke="#334155" strokeWidth="0.5" />

            {/* Dynamic Exchange Nodes (Calculate Green/Red inline based on avg price) */}
            {(() => {
              const prices = currentPriceCompass?.prices || [];
              const avg = prices.length ? prices.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / prices.length : 0;
              const isPos = (idx) => prices[idx] ? parseFloat(prices[idx].price) >= avg : true;
              
              const topC = isPos(0) ? "#10b981" : "#ef4444";
              const rightC = isPos(1) ? "#10b981" : "#ef4444";
              const bottomC = isPos(2) ? "#10b981" : "#ef4444";
              const leftC = isPos(3) ? "#10b981" : "#ef4444";

              return (
                <g>
                  {/* Top */}
                  <circle cx="32" cy="8" r="2.5" fill={topC} filter="url(#miniShadow)" />
                  <line x1="32" y1="12" x2="32" y2="18" stroke={topC} strokeWidth="1" strokeOpacity="0.5" />
                  
                  {/* Bottom */}
                  <circle cx="32" cy="56" r="2.5" fill={bottomC} filter="url(#miniShadow)" />
                  <line x1="32" y1="46" x2="32" y2="52" stroke={bottomC} strokeWidth="1" strokeOpacity="0.5" />
                  
                  {/* Left */}
                  <circle cx="8" cy="32" r="2.5" fill={leftC} filter="url(#miniShadow)" />
                  <line x1="12" y1="32" x2="18" y2="32" stroke={leftC} strokeWidth="1" strokeOpacity="0.5" />
                  
                  {/* Right */}
                  <circle cx="56" cy="32" r="2.5" fill={rightC} filter="url(#miniShadow)" />
                  <line x1="46" y1="32" x2="52" y2="32" stroke={rightC} strokeWidth="1" strokeOpacity="0.5" />
                </g>
              );
            })()}

            {/* Center Node */}
            <circle cx="32" cy="32" r="6" fill="url(#miniCenter)" filter="url(#miniShadow)" stroke="#60a5fa" strokeWidth="0.5" />
            <circle cx="32" cy="32" r="2" fill="#fff" />
            
            {/* Glass Overlay */}
            <circle cx="32" cy="32" r="29" fill="url(#miniGlass)" pointerEvents="none" />
          </svg>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              {currentPriceCompass.prices.slice(0, 4).map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", backgroundColor: "#1e293b", padding: "4px 6px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{p.exchange}</span>
                  <span style={{ color: "#fff", fontWeight: "bold" }}>${p.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: parseFloat(currentPriceCompass.deviation) < 0.5 ? "#10b981" : parseFloat(currentPriceCompass.deviation) < 1.0 ? "#f59e0b" : "#ef4444",
                  fontWeight: "bold",
                }}
              >
                Dev: {parseFloat(currentPriceCompass.deviation || 0).toFixed(2)}%
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsCompassModalOpen(true); }}
                style={{ 
                  backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.3)", 
                  padding: "4px 10px", borderRadius: "4px", fontSize: "9px", fontWeight: "bold", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s" 
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.25)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.15)"}
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Live Alerts Feed */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Alerts Feed</h4>
          <span className="glow-tag-yellow">SYSTEM STATUS</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "4px",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        >
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                display: "flex",
                gap: "6px",
                fontSize: "9.5px",
                borderBottom: "1px solid #0f1320",
                paddingBottom: "4px",
              }}
            >
              <span
                style={{
                  color:
                    alert.type === "whale"
                      ? "#f59e0b"
                      : alert.type === "tvl"
                        ? "#10b981"
                        : "#a78bfa",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                [{alert.type}]
              </span>
              <span style={{ color: "var(--text-main)" }}>{alert.msg}</span>
              <span
                style={{
                  color: "var(--text-muted)",
                  marginLeft: "auto",
                  flexShrink: 0,
                }}
              >
                {alert.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <PriceCompassModal 
      isOpen={isCompassModalOpen} 
      onClose={() => setIsCompassModalOpen(false)} 
      priceCompass={currentPriceCompass} 
      symbol={arbitrage?.symbol || "BTC/USDT"} 
    />
    </>
  );
};

export default HeatmapArbitrageGrid;
