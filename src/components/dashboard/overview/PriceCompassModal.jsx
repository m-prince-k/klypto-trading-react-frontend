import React from "react";
import { FiX, FiArrowDownCircle, FiArrowUpCircle, FiRepeat, FiShuffle, FiInfo } from "react-icons/fi";

const PriceCompassModal = ({ isOpen, onClose, priceCompass, symbol }) => {
  if (!isOpen || !priceCompass || !priceCompass.prices || priceCompass.prices.length === 0) return null;

  // Process data
  const prices = priceCompass.prices;
  const deviation = parseFloat(priceCompass.deviation || 0);

  // Calculate Avg, Min, Max
  const sum = prices.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
  const avgPrice = sum / prices.length;

  let lowest = prices[0];
  let highest = prices[0];

  prices.forEach(p => {
    if (parseFloat(p.price) < parseFloat(lowest.price)) lowest = p;
    if (parseFloat(p.price) > parseFloat(highest.price)) highest = p;
  });

  const spread = parseFloat(highest.price) - parseFloat(lowest.price);
  const spreadPct = (spread / parseFloat(lowest.price)) * 100;

  // Prepare the 4 directions (Top, Right, Bottom, Left)
  // We'll map the exchanges. If there are exactly 4, we use them. Otherwise we pad or slice.
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

  // Pad with empty if less than 4
  while (displayNodes.length < 4) {
    displayNodes.push({ exchange: "-", price: 0, pctDiff: 0, isPositive: true });
  }

  const topNode = displayNodes[0];
  const rightNode = displayNodes[1];
  const bottomNode = displayNodes[2];
  const leftNode = displayNodes[3];

  const formatPrice = (val) => {
    return val >= 1000 ? val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : val.toFixed(4);
  };

  // Determine secure status
  const devStatus = deviation < 0.5 ? "Secure" : deviation < 1.0 ? "Moderate" : "High Risk";
  const devColor = deviation < 0.5 ? "#10b981" : deviation < 1.0 ? "#f59e0b" : "#ef4444";

  // Bar indicator pos (0 to 1% mapped to 0-100%)
  const pinPos = Math.min((deviation / 1.0) * 100, 100);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: "#0d1117", border: "1px solid #1f2937", borderRadius: "16px",
        width: "800px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", padding: "16px 20px", position: "relative",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)", color: "#fff", fontFamily: "inherit"
      }}>
        {/* Close btn */}
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px", background: "none",
          border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "20px"
        }}><FiX /></button>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold", letterSpacing: "-0.5px" }}>Price Compass</h2>
              <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "10px", fontWeight: "bold", padding: "4px 8px", borderRadius: "6px" }}>CCXT</span>
            </div>
            <div style={{ color: "#9ca3af", fontSize: "13px", maxWidth: "250px", lineHeight: "1.5", textAlign: 'left' }}>
              Center dial aligns price deviations between top exchanges.
            </div>
          </div>

          {/* DEVIATION CARD */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #1f2937", borderRadius: "12px", padding: "12px 16px", width: "300px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", marginBottom: "2px", letterSpacing: "0.5px" }}>Compass Deviation</div>
                <div style={{ fontSize: "24px", color: devColor, fontWeight: "bold", lineHeight: "1" }}>{deviation.toFixed(2)}%</div>
              </div>
              <div style={{ backgroundColor: `rgba(${devColor === '#10b981' ? '16, 185, 129' : devColor === '#f59e0b' ? '245, 158, 11' : '239, 68, 68'}, 0.15)`, color: devColor, fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                {devStatus}
              </div>
            </div>
            
            {/* Bar */}
            <div style={{ paddingTop: "2px" }}>
              <div style={{ position: "relative", height: "5px", background: "linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)", borderRadius: "3px", marginBottom: "6px" }}>
                <div style={{ position: "absolute", top: "-3px", left: `${pinPos}%`, transform: "translateX(-50%)", width: "3px", height: "11px", backgroundColor: "#fff", borderRadius: "2px", boxShadow: "0 0 6px rgba(0,0,0,0.6)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#9ca3af", fontWeight: "bold" }}>
                <span>0%</span><span>0.5%</span><span>1%+</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COMPASS */}
        <div style={{ position: "relative", width: "460px", height: "260px", margin: "0 auto 12px", display: "flex", justifyContent: "center" }}>
          
          {/* Compass SVG background */}
          <svg width="260" height="260" style={{ position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)" }}>
            <defs>
              {/* 3D Radial Gradients */}
              <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
              <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </radialGradient>
              
              {/* Realistic Materials */}
              <linearGradient id="metalBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              
              <linearGradient id="glassReflection" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              
              {/* Drop Shadows */}
              <filter id="shadow3D" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Background 3D Metal Bezel */}
            <circle cx="130" cy="130" r="124" fill="#0b0f19" stroke="url(#metalBezel)" strokeWidth="6" filter="url(#shadow3D)" />
            
            {/* Precision Degree Ticks */}
            <circle cx="130" cy="130" r="114" fill="none" stroke="#334155" strokeWidth="4" strokeDasharray="2 10" />
            <circle cx="130" cy="130" r="106" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="1 5" />
            
            <circle cx="130" cy="130" r="75" fill="none" stroke="#374151" strokeWidth="2" filter="url(#shadow3D)" />
            
            {/* Cross lines */}
            <line x1="130" y1="16" x2="130" y2="55" stroke="#374151" strokeWidth="1" />
            <line x1="130" y1="205" x2="130" y2="244" stroke="#374151" strokeWidth="1" />
            <line x1="16" y1="130" x2="55" y2="130" stroke="#374151" strokeWidth="1" />
            <line x1="205" y1="130" x2="244" y2="130" stroke="#374151" strokeWidth="1" />
            
            {/* Compass ticks */}
            <text x="130" y="24" fill="#6b7280" fontSize="10" fontWeight="bold" textAnchor="middle">0.05%</text>
            <text x="130" y="244" fill="#6b7280" fontSize="10" fontWeight="bold" textAnchor="middle">-0.05%</text>
            <text x="18" y="133" fill="#6b7280" fontSize="10" fontWeight="bold" textAnchor="start">-0.05%</text>
            <text x="242" y="133" fill="#6b7280" fontSize="10" fontWeight="bold" textAnchor="end">+0.05%</text>

            {/* Glowing Connections (polygons) */}
            <polygon points="130,95 126,130 134,130" fill="rgba(16, 185, 129, 0.15)" />
            <polygon points="130,165 126,130 134,130" fill="rgba(16, 185, 129, 0.15)" />
            <polygon points="95,130 130,126 130,134" fill="rgba(239, 68, 68, 0.15)" />
            <polygon points="165,130 130,126 130,134" fill="rgba(239, 68, 68, 0.15)" />
            
            {/* Center glow & 3D Node */}
            <circle cx="130" cy="130" r="45" fill="url(#glowBlue)" />
            <circle cx="130" cy="130" r="32" fill="url(#centerGrad)" stroke="#3b82f6" strokeWidth="2.5" filter="url(#shadow3D)" />
            
            {/* Glass Lens Reflection Overlay */}
            <circle cx="130" cy="130" r="120" fill="url(#glassReflection)" pointerEvents="none" />
          </svg>

          {/* Center Text */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 10, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
            <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "bold", letterSpacing: "0.5px" }}>{symbol || "BTC/USDT"}</div>
            <div style={{ fontSize: "17px", fontWeight: "bold", color: "#fff", margin: "3px 0" }}>${formatPrice(avgPrice)}</div>
            <div style={{ fontSize: "8.5px", color: "#cbd5e1", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>Avg Price</div>
          </div>

          {/* Top Node */}
          <div style={{ position: "absolute", top: "8px", left: "50%", transform: "translateX(-50%)", textAlign: "center", width: "90px" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", textShadow: "0 1px 2px #000", marginBottom: "2px" }}>{topNode.exchange}</div>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: topNode.isPositive ? "#10b981" : "#ef4444" }}>${formatPrice(topNode.price)}</div>
            <div style={{ fontSize: "11px", color: topNode.isPositive ? "#10b981" : "#ef4444", marginBottom: "6px" }}>{topNode.isPositive ? "+" : ""}{topNode.pctDiff.toFixed(3)}%</div>
            {topNode.isPositive ? (
              <div style={{ width: "0", height: "0", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "7px solid #10b981", margin: "0 auto 6px" }} />
            ) : (
              <div style={{ width: "0", height: "0", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid #ef4444", margin: "0 auto 6px" }} />
            )}
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: topNode.isPositive ? "#10b981" : "#ef4444", margin: "0 auto", boxShadow: `0 0 12px ${topNode.isPositive ? "#10b981" : "#ef4444"}, inset 0 -2px 4px rgba(0,0,0,0.4)` }} />
          </div>

          {/* Bottom Node */}
          <div style={{ position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)", textAlign: "center", width: "90px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: bottomNode.isPositive ? "#10b981" : "#ef4444", margin: "0 auto 6px", boxShadow: `0 0 12px ${bottomNode.isPositive ? "#10b981" : "#ef4444"}, inset 0 2px 4px rgba(0,0,0,0.4)` }} />
            {bottomNode.isPositive ? (
              <div style={{ width: "0", height: "0", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid #10b981", margin: "0 auto 6px" }} />
            ) : (
              <div style={{ width: "0", height: "0", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "7px solid #ef4444", margin: "0 auto 6px" }} />
            )}
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", textShadow: "0 1px 2px #000", marginBottom: "2px" }}>{bottomNode.exchange}</div>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: bottomNode.isPositive ? "#10b981" : "#ef4444" }}>${formatPrice(bottomNode.price)}</div>
            <div style={{ fontSize: "11px", color: bottomNode.isPositive ? "#10b981" : "#ef4444" }}>{bottomNode.isPositive ? "+" : ""}{bottomNode.pctDiff.toFixed(3)}%</div>
          </div>

          {/* Left Node */}
          <div style={{ position: "absolute", top: "50%", left: "0", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", textShadow: "0 1px 2px #000", marginBottom: "2px" }}>{leftNode.exchange}</div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: leftNode.isPositive ? "#10b981" : "#ef4444" }}>${formatPrice(leftNode.price)}</div>
              <div style={{ fontSize: "11px", color: leftNode.isPositive ? "#10b981" : "#ef4444" }}>{leftNode.isPositive ? "+" : ""}{leftNode.pctDiff.toFixed(3)}%</div>
            </div>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: leftNode.isPositive ? "#10b981" : "#ef4444", boxShadow: `0 0 12px ${leftNode.isPositive ? "#10b981" : "#ef4444"}, inset -2px 0 4px rgba(0,0,0,0.4)` }} />
            {leftNode.isPositive ? (
              <div style={{ width: "0", height: "0", borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "7px solid #10b981" }} />
            ) : (
              <div style={{ width: "0", height: "0", borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "7px solid #ef4444" }} />
            )}
          </div>

          {/* Right Node */}
          <div style={{ position: "absolute", top: "50%", right: "0", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "10px" }}>
            {rightNode.isPositive ? (
              <div style={{ width: "0", height: "0", borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "7px solid #10b981" }} />
            ) : (
              <div style={{ width: "0", height: "0", borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "7px solid #ef4444" }} />
            )}
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: rightNode.isPositive ? "#10b981" : "#ef4444", boxShadow: `0 0 12px ${rightNode.isPositive ? "#10b981" : "#ef4444"}, inset 2px 0 4px rgba(0,0,0,0.4)` }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", textShadow: "0 1px 2px #000", marginBottom: "2px" }}>{rightNode.exchange}</div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: rightNode.isPositive ? "#10b981" : "#ef4444" }}>${formatPrice(rightNode.price)}</div>
              <div style={{ fontSize: "11px", color: rightNode.isPositive ? "#10b981" : "#ef4444" }}>{rightNode.isPositive ? "+" : ""}{rightNode.pctDiff.toFixed(3)}%</div>
            </div>
          </div>
        </div>

        {/* BOTTOM METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.5fr 1fr", gap: "12px", marginBottom: "8px" }}>
          {/* Lowest */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #1f2937", borderRadius: "10px", padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "10px", fontWeight: "bold", marginBottom: "8px", letterSpacing: "0.5px" }}>
              <FiArrowDownCircle color="#ef4444" size={12} /> LOWEST PRICE
            </div>
            <div style={{ color: "#ef4444", fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>${formatPrice(parseFloat(lowest.price))}</div>
            <div style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "500" }}>{lowest.exchange.charAt(0).toUpperCase() + lowest.exchange.slice(1)}</div>
          </div>
          
          {/* Highest */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #1f2937", borderRadius: "10px", padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "10px", fontWeight: "bold", marginBottom: "8px", letterSpacing: "0.5px" }}>
              <FiArrowUpCircle color="#10b981" size={12} /> HIGHEST PRICE
            </div>
            <div style={{ color: "#10b981", fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>${formatPrice(parseFloat(highest.price))}</div>
            <div style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "500" }}>{highest.exchange.charAt(0).toUpperCase() + highest.exchange.slice(1)}</div>
          </div>

          {/* Spread */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #1f2937", borderRadius: "10px", padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "10px", fontWeight: "bold", marginBottom: "8px", letterSpacing: "0.5px" }}>
              <FiRepeat color="#3b82f6" size={12} /> SPREAD
            </div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>${formatPrice(spread)}</div>
            <div style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "500" }}>{spreadPct.toFixed(2)}%</div>
          </div>

          {/* Route */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #1f2937", borderRadius: "10px", padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "10px", fontWeight: "bold", marginBottom: "8px", letterSpacing: "0.5px" }}>
              <FiShuffle color="#a78bfa" size={12} /> BEST ROUTE
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fff", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>
              <span style={{ color: "#ef4444" }}>Buy {lowest.exchange.charAt(0).toUpperCase() + lowest.exchange.slice(1)}</span>
              <span style={{ color: "#6b7280" }}>→</span>
            </div>
            <div style={{ color: "#10b981", fontSize: "13px", fontWeight: "bold" }}>
              Sell {highest.exchange.charAt(0).toUpperCase() + highest.exchange.slice(1)}
            </div>
          </div>

          {/* Updated */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #1f2937", borderRadius: "10px", padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "10px", fontWeight: "bold", marginBottom: "8px", letterSpacing: "0.5px" }}>
              <FiInfo color="#60a5fa" size={12} /> UPDATED
            </div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>Live</div>
            <div style={{ color: "#10b981", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 6px #10b981" }} />
              Streaming
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCompassModal;
