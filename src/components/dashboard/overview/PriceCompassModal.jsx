import React from "react";
import { FiX, FiArrowDownCircle, FiArrowUpCircle, FiRepeat, FiShuffle, FiInfo } from "react-icons/fi";

const PriceCompassModal = ({ isOpen, onClose, priceCompass, symbol }) => {
  if (!isOpen || !priceCompass || !priceCompass?.prices || priceCompass?.prices?.length === 0) return null;

  // Process data
  const prices = priceCompass?.prices;
  const deviation = parseFloat(priceCompass?.deviation);

  // Calculate Avg, Min, Max
  const sum = prices?.reduce((acc, curr) => acc + parseFloat(curr?.price), 0);
  const avgPrice = sum / prices?.length;

  let lowest = prices?.[0];
  let highest = prices?.[0];

  prices.forEach(p => {
    if (parseFloat(p.price) < parseFloat(lowest.price)) lowest = p;
    if (parseFloat(p.price) > parseFloat(highest.price)) highest = p;
  });

  const spread = parseFloat(highest.price) - parseFloat(lowest.price);
  const spreadPct = (spread / parseFloat(lowest.price)) * 100;

  // Prepare the 4 directions (Top, Right, Bottom, Left)
  const displayNodes = prices.slice(0, 4).map(p => {
    const val = parseFloat(p.price);
    const diff = val - avgPrice;
    const pctDiff = (diff / avgPrice) * 100;
    return {
      exchange: p.exchange.charAt(0).toUpperCase() + p.exchange.slice(1),
      price: val,
      pctDiff: pctDiff,
      isPositive: diff >= 0
    };
  });

  while (displayNodes.length < 4) {
    displayNodes.push({ exchange: "-", price: 0, pctDiff: 0, isPositive: true });
  }

  const topNode    = displayNodes[0];
  const rightNode  = displayNodes[1];
  const bottomNode = displayNodes[2];
  const leftNode   = displayNodes[3];

  const formatPrice = (val) => {
    return val >= 1000
      ? val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      : val.toFixed(4);
  };

  const devStatus = deviation < 0.5 ? "Secure" : deviation < 1.0 ? "Moderate" : "High Risk";
  const devColor  = deviation < 0.5 ? "#10b981" : deviation < 1.0 ? "#f59e0b" : "#ef4444";
  const pinPos    = Math.min((deviation / 1.0) * 100, 100);

  // ── Shared node styles ─────────────────────────────────────────────────────
  const nodeExchangeStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-main)",
    marginBottom: "2px",
    whiteSpace: "nowrap",
  };

  const nodePriceStyle = (isPositive) => ({
    fontSize: "13px",
    fontWeight: "600",
    color: isPositive ? "#10b981" : "#ef4444",
    whiteSpace: "nowrap",
  });

  const nodePctStyle = (isPositive) => ({
    fontSize: "11px",
    color: isPositive ? "#10b981" : "#ef4444",
    whiteSpace: "nowrap",
  });

  const dotStyle = (isPositive) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: isPositive ? "#10b981" : "#ef4444",
    boxShadow: `0 0 10px ${isPositive ? "#10b981" : "#ef4444"}`,
    flexShrink: 0,
  });

  const triUp    = (c) => ({ width: "0", height: "0", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `7px solid ${c}`, flexShrink: 0 });
  const triDown  = (c) => ({ width: "0", height: "0", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop:    `7px solid ${c}`, flexShrink: 0 });
  const triRight = (c) => ({ width: "0", height: "0", borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft:  `7px solid ${c}`, flexShrink: 0 });
  const triLeft  = (c) => ({ width: "0", height: "0", borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: `7px solid ${c}`, flexShrink: 0 });

  // ── Metric card shared style ───────────────────────────────────────────────
  const metricCard = {
    backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
    border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
    borderRadius: "10px",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  };

  const metricLabel = {
    display: "flex", alignItems: "center", gap: "5px",
    color: "#9ca3af", fontSize: "9px", fontWeight: "bold",
    marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase",
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/*
        ── Outer modal shell ──────────────────────────────────────────────────
        Two-column layout:
          LEFT  → title + compass (with nodes above/below/left/right)
          RIGHT → deviation card + 5 metric cards stacked
        Everything fits in one screen height — no scroll unless viewport < 600px.
      */}
      <div
        className="premium-card"
        style={{
          width: "900px",
          maxWidth: "96vw",
          maxHeight: "96vh",
          overflowY: "auto",       // scroll only when viewport is tiny
          padding: "18px 20px",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Close btn */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "14px", right: "14px",
            background: "none", border: "none", color: "#9ca3af",
            cursor: "pointer", fontSize: "20px", lineHeight: 1, zIndex: 10,
          }}
        >
          <FiX />
        </button>

        {/* ── TWO-COLUMN BODY ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ════════════════════════════════════════════════════════════════
              LEFT COLUMN — title + compass
          ════════════════════════════════════════════════════════════════ */}
          <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column" }}>

            {/* Title */}
            <div style={{ marginBottom: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", letterSpacing: "-0.5px", color: "var(--text-main)", textAlign: 'left' }}>
                Price Compass
              </h2>
              <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "3px", lineHeight: "1.4" , textAlign: 'left'}}>
                Center dial aligns price deviations between top exchanges.
              </div>
            </div>

            {/* ── COMPASS STAGE ────────────────────────────────────────────
                Layout:
                  [top-node centered]
                  [left-node] [SVG dial] [right-node]
                  [bottom-node centered]
            ─────────────────────────────────────────────────────────────── */}

            {/* Top node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", marginBottom: "8px" }}>
              {topNode.exchange !== "-" && (
                <>
                  <div style={nodeExchangeStyle}>{topNode.exchange}</div>
                  <div style={nodePriceStyle(topNode.isPositive)}>${formatPrice(topNode.price)}</div>
                  <div style={nodePctStyle(topNode.isPositive)}>{topNode.isPositive ? "+" : ""}{topNode.pctDiff.toFixed(3)}%</div>
                  <div style={topNode.isPositive ? triUp("#10b981") : triDown("#ef4444")} />
                  <div style={dotStyle(topNode.isPositive)} />
                </>
              )}
            </div>

            {/* Middle row */}
            <div style={{ display: "flex", alignItems: "center" }}>

              {/* Left node */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "120px", justifyContent: "flex-end", paddingRight: "12px" }}>
                {leftNode.exchange !== "-" && (
                  <>
                    <div style={{ textAlign: "right" }}>
                      <div style={nodeExchangeStyle}>{leftNode.exchange}</div>
                      <div style={nodePriceStyle(leftNode.isPositive)}>${formatPrice(leftNode.price)}</div>
                      <div style={nodePctStyle(leftNode.isPositive)}>{leftNode.isPositive ? "+" : ""}{leftNode.pctDiff.toFixed(3)}%</div>
                    </div>
                    <div style={dotStyle(leftNode.isPositive)} />
                    <div style={leftNode.isPositive ? triRight("#10b981") : triLeft("#ef4444")} />
                  </>
                )}
              </div>

              {/* Compass SVG */}
              <div style={{ position: "relative", width: "240px", height: "240px", flexShrink: 0 }}>
                <svg width="240" height="240" viewBox="0 0 260 260">
                  <defs>
                    <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                      <stop offset="0%"   stopColor="#1e3a8a" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </radialGradient>
                    <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor="rgba(59,130,246,0.5)" />
                      <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                    </radialGradient>
                    <linearGradient id="metalBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor="var(--text-muted, #94a3b8)" />
                      <stop offset="50%"  stopColor="var(--border-color, #334155)" />
                      <stop offset="100%" stopColor="var(--bg-main, #0f172a)" />
                    </linearGradient>
                    <linearGradient id="glassReflection" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"  stopColor="rgba(255,255,255,0.12)" />
                      <stop offset="40%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                    <filter id="shadow3D" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#000" floodOpacity="0.7" />
                    </filter>
                  </defs>
                  <circle cx="130" cy="130" r="124" fill="var(--bg-main, #0b0f19)" stroke="url(#metalBezel)" strokeWidth="6" filter="url(#shadow3D)" />
                  <circle cx="130" cy="130" r="114" fill="none" stroke="var(--border-color, #334155)" strokeWidth="4" strokeDasharray="2 10" />
                  <circle cx="130" cy="130" r="106" fill="none" stroke="var(--border-color, #1e293b)" strokeWidth="2" strokeDasharray="1 5" />
                  <circle cx="130" cy="130" r="75"  fill="none" stroke="var(--border-color, #374151)" strokeWidth="2" filter="url(#shadow3D)" />
                  <line x1="130" y1="16"  x2="130" y2="55"  stroke="var(--border-color, #374151)" strokeWidth="1" />
                  <line x1="130" y1="205" x2="130" y2="244" stroke="var(--border-color, #374151)" strokeWidth="1" />
                  <line x1="16"  y1="130" x2="55"  y2="130" stroke="var(--border-color, #374151)" strokeWidth="1" />
                  <line x1="205" y1="130" x2="244" y2="130" stroke="var(--border-color, #374151)" strokeWidth="1" />
                  <text x="130" y="24"  fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="middle">+0.05%</text>
                  <text x="130" y="244" fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="middle">-0.05%</text>
                  <text x="18"  y="133" fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="start">-0.05%</text>
                  <text x="242" y="133" fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="end">+0.05%</text>
                  <circle cx="130" cy="130" r="44" fill="url(#glowBlue)" />
                  <circle cx="130" cy="130" r="32" fill="url(#centerGrad)" stroke="var(--text-muted, #3b82f6)" strokeWidth="2.5" filter="url(#shadow3D)" />
                  <circle cx="130" cy="130" r="120" fill="url(#glassReflection)" pointerEvents="none" />
                </svg>

                {/* Center text */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center", pointerEvents: "none",
                }}>
                  <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "bold", letterSpacing: "0.5px" }}>
                    {symbol || "BTC/USDT"}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-main)", margin: "3px 0" }}>
                    ${formatPrice(avgPrice)}
                  </div>
                  <div style={{ fontSize: "8px", color: "#cbd5e1", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Avg Price
                  </div>
                </div>
              </div>

              {/* Right node */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "120px", justifyContent: "flex-start", paddingLeft: "12px" }}>
                {rightNode.exchange !== "-" && (
                  <>
                    <div style={rightNode.isPositive ? triRight("#10b981") : triLeft("#ef4444")} />
                    <div style={dotStyle(rightNode.isPositive)} />
                    <div style={{ textAlign: "left" }}>
                      <div style={nodeExchangeStyle}>{rightNode.exchange}</div>
                      <div style={nodePriceStyle(rightNode.isPositive)}>${formatPrice(rightNode.price)}</div>
                      <div style={nodePctStyle(rightNode.isPositive)}>{rightNode.isPositive ? "+" : ""}{rightNode.pctDiff.toFixed(3)}%</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", marginTop: "8px" }}>
              {bottomNode.exchange !== "-" && (
                <>
                  <div style={dotStyle(bottomNode.isPositive)} />
                  <div style={bottomNode.isPositive ? triDown("#10b981") : triUp("#ef4444")} />
                  <div style={nodeExchangeStyle}>{bottomNode.exchange}</div>
                  <div style={nodePriceStyle(bottomNode.isPositive)}>${formatPrice(bottomNode.price)}</div>
                  <div style={nodePctStyle(bottomNode.isPositive)}>{bottomNode.isPositive ? "+" : ""}{bottomNode.pctDiff.toFixed(3)}%</div>
                </>
              )}
            </div>

          </div>
          {/* END LEFT COLUMN */}

          {/* ════════════════════════════════════════════════════════════════
              RIGHT COLUMN — deviation card + metric cards
          ════════════════════════════════════════════════════════════════ */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", paddingTop: "44px", minWidth: 0 }}>

            {/* DEVIATION CARD */}
            <div style={{
              backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
              border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
              borderRadius: "12px", padding: "14px 16px",
              display: "flex", flexDirection: "column", gap: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.5px" }}>
                    Compass Deviation
                  </div>
                  <div style={{ fontSize: "26px", color: devColor, fontWeight: "bold", lineHeight: "1",marginBottom: "12px" }}>
                    {deviation.toFixed(2)}%
                  </div>
                </div>
                <div style={{
                  backgroundColor: `rgba(${devColor === '#10b981' ? '16,185,129' : devColor === '#f59e0b' ? '245,158,11' : '239,68,68'}, 0.15)`,
                  color: devColor, fontSize: "11px", fontWeight: "bold",
                  padding: "4px 10px", borderRadius: "20px",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {devStatus}
                </div>
              </div>
              <div>
                <div style={{
                  position: "relative", height: "5px",
                  background: "linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)",
                  borderRadius: "3px", marginBottom: "6px",
                }}>
                  <div style={{
                    position: "absolute", top: "-4px", left: `${pinPos}%`,
                    transform: "translateX(-50%)", width: "3px", height: "13px",
                    backgroundColor: "#fff", borderRadius: "2px",
                    boxShadow: "0 0 6px rgba(0,0,0,0.6)",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#9ca3af", fontWeight: "bold" }}>
                  <span>0%</span><span>0.5%</span><span>1%+</span>
                </div>
              </div>
            </div>

            {/* METRIC CARDS — 2×2 grid + 1 spanning full width */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>

              {/* Lowest */}
              <div style={metricCard}>
                <div style={metricLabel}><FiArrowDownCircle color="#ef4444" size={11} /> Lowest Price</div>
                <div style={{ color: "#ef4444", fontSize: "15px", fontWeight: "bold", marginBottom: "3px" }}>
                  ${formatPrice(parseFloat(lowest.price))}
                </div>
                <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "500" }}>
                  {lowest.exchange.charAt(0).toUpperCase() + lowest.exchange.slice(1)}
                </div>
              </div>

              {/* Highest */}
              <div style={metricCard}>
                <div style={metricLabel}><FiArrowUpCircle color="#10b981" size={11} /> Highest Price</div>
                <div style={{ color: "#10b981", fontSize: "15px", fontWeight: "bold", marginBottom: "3px" }}>
                  ${formatPrice(parseFloat(highest.price))}
                </div>
                <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "500" }}>
                  {highest.exchange.charAt(0).toUpperCase() + highest.exchange.slice(1)}
                </div>
              </div>

              {/* Spread */}
              <div style={metricCard}>
                <div style={metricLabel}><FiRepeat color="#3b82f6" size={11} /> Spread</div>
                <div style={{ color: "var(--text-main)", fontSize: "15px", fontWeight: "bold", marginBottom: "3px" }}>
                  ${formatPrice(spread)}
                </div>
                <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "500" }}>
                  {spreadPct.toFixed(2)}%
                </div>
              </div>

              {/* Updated */}
              <div style={metricCard}>
                <div style={metricLabel}><FiInfo color="#60a5fa" size={11} /> Updated</div>
                <div style={{ color: "var(--text-main)", fontSize: "15px", fontWeight: "bold", marginBottom: "3px" }}>Live</div>
                <div style={{ color: "#10b981", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                  Streaming
                </div>
              </div>

            </div>

            {/* Best Route — full width */}
            <div style={metricCard}>
              <div style={metricLabel}><FiShuffle color="#a78bfa" size={11} /> Best Route</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#ef4444", fontSize: "13px", fontWeight: "bold" }}>
                  Buy {lowest.exchange.charAt(0).toUpperCase() + lowest.exchange.slice(1)}
                </span>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>→</span>
                <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "bold" }}>
                  Sell {highest.exchange.charAt(0).toUpperCase() + highest.exchange.slice(1)}
                </span>
              </div>
            </div>

          </div>
          {/* END RIGHT COLUMN */}

        </div>
        {/* END TWO-COLUMN BODY */}

      </div>
    </div>
  );
};

export default PriceCompassModal;