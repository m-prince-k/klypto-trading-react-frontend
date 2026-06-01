import React, { useState } from 'react';
import PriceCompassModal from "./PriceCompassModal";

const SocialFinancialGrid = ({ alerts, socialStats, financials, priceCompass }) => {
  const [isCompassModalOpen, setIsCompassModalOpen] = useState(false);
  const currentPriceCompass = priceCompass || { deviation: "0", prices: [] };

  const prices = currentPriceCompass?.prices || [];
  const sum = prices.reduce((acc, curr) => acc + parseFloat(curr?.price || 0), 0);
  const avgPrice = sum / (prices.length || 1);

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

  const topNode = displayNodes[0];
  const rightNode = displayNodes[1];
  const bottomNode = displayNodes[2];
  const leftNode = displayNodes[3];

  const formatPrice = (val) => val >= 1000 ? val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : val.toFixed(4);

  const nodeExchangeStyle = { fontSize: "10px", fontWeight: "600", color: "var(--text-main)", marginBottom: "1px", whiteSpace: "nowrap" };
  const nodePriceStyle = (isPositive) => ({ fontSize: "11px", fontWeight: "600", color: isPositive ? "#10b981" : "#ef4444", whiteSpace: "nowrap" });
  const nodePctStyle = (isPositive) => ({ fontSize: "9px", color: isPositive ? "#10b981" : "#ef4444", whiteSpace: "nowrap" });
  const dotStyle = (isPositive) => ({ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: isPositive ? "#10b981" : "#ef4444", boxShadow: `0 0 6px ${isPositive ? "#10b981" : "#ef4444"}`, flexShrink: 0 });
  const triUp = (c) => ({ width: "0", height: "0", borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderBottom: `4px solid ${c}`, flexShrink: 0 });
  const triDown = (c) => ({ width: "0", height: "0", borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderTop: `4px solid ${c}`, flexShrink: 0 });
  const triRight = (c) => ({ width: "0", height: "0", borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: `4px solid ${c}`, flexShrink: 0 });
  const triLeft = (c) => ({ width: "0", height: "0", borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderRight: `4px solid ${c}`, flexShrink: 0 });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: '16px', marginBottom: '16px' }}>
        
        {/* Left Column: Price Compass (narrower) */}
        <div
          className="premium-card clickable"
          onClick={() => setIsCompassModalOpen(true)}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div className="card-header-row">
            <h4 className="card-title-main">Price Compass</h4>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
              width: "100%",
              paddingTop: "20px"
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%" }}>
              {/* Top node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginBottom: "4px" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "75px", justifyContent: "flex-end", paddingRight: "6px" }}>
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

                {/* SVG Compass with central dial */}
                <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
                  <svg width="120" height="120" viewBox="0 0 260 260">
                    <defs>
                      <radialGradient id="centerGradOverview" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                        <stop offset="0%"   stopColor="#1e3a8a" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </radialGradient>
                      <radialGradient id="glowBlueOverview" cx="50%" cy="50%" r="50%">
                        <stop offset="0%"   stopColor="rgba(59,130,246,0.5)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                      </radialGradient>
                      <linearGradient id="metalBezelOverview" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="var(--text-muted, #94a3b8)" />
                        <stop offset="50%"  stopColor="var(--border-color, #334155)" />
                        <stop offset="100%" stopColor="var(--bg-main, #0f172a)" />
                      </linearGradient>
                      <linearGradient id="glassReflectionOverview" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%"  stopColor="rgba(255,255,255,0.12)" />
                        <stop offset="40%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>
                      <filter id="shadow3DOverview" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#000" floodOpacity="0.7" />
                      </filter>
                    </defs>
                    <circle cx="130" cy="130" r="124" fill="var(--bg-main, #0b0f19)" stroke="url(#metalBezelOverview)" strokeWidth="6" filter="url(#shadow3DOverview)" />
                    <circle cx="130" cy="130" r="114" fill="none" stroke="var(--border-color, #334155)" strokeWidth="4" strokeDasharray="2 10" />
                    <circle cx="130" cy="130" r="106" fill="none" stroke="var(--border-color, #1e293b)" strokeWidth="2" strokeDasharray="1 5" />
                    <circle cx="130" cy="130" r="75"  fill="none" stroke="var(--border-color, #374151)" strokeWidth="2" filter="url(#shadow3DOverview)" />
                    <line x1="130" y1="16"  x2="130" y2="55"  stroke="var(--border-color, #374151)" strokeWidth="1" />
                    <line x1="130" y1="205" x2="130" y2="244" stroke="var(--border-color, #374151)" strokeWidth="1" />
                    <line x1="16"  y1="130" x2="55"  y2="130" stroke="var(--border-color, #374151)" strokeWidth="1" />
                    <line x1="205" y1="130" x2="244" y2="130" stroke="var(--border-color, #374151)" strokeWidth="1" />
                    <text x="130" y="24"  fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="middle">+0.05%</text>
                    <text x="130" y="244" fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="middle">-0.05%</text>
                    <text x="18"  y="133" fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="start">-0.05%</text>
                    <text x="242" y="133" fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="end">+0.05%</text>
                    <circle cx="130" cy="130" r="44" fill="url(#glowBlueOverview)" />
                    <circle cx="130" cy="130" r="32" fill="url(#centerGradOverview)" stroke="var(--text-muted, #3b82f6)" strokeWidth="2.5" filter="url(#shadow3DOverview)" />
                    <circle cx="130" cy="130" r="120" fill="url(#glassReflectionOverview)" pointerEvents="none" />
                  </svg>

                  {/* Center text */}
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center", pointerEvents: "none",
                  }}>
                    <div style={{ fontSize: "6px", color: "var(--text-muted)", fontWeight: "bold", opacity: 0.8, marginBottom: "1px" }}>BTC/USDT</div>
                    <div style={{ fontSize: "10px", fontWeight: "900", color: "#ffffff", letterSpacing: "0.5px", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                      ${formatPrice(avgPrice)}
                    </div>
                    <div style={{ fontSize: "5px", color: "var(--text-muted)", fontWeight: "bold", marginTop: "1px" }}>AVG PRICE</div>
                  </div>
                </div>

                {/* Right node */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "75px", justifyContent: "flex-start", paddingLeft: "6px" }}>
                  {rightNode.exchange !== "-" && (
                    <>
                      <div style={rightNode.isPositive ? triLeft("#10b981") : triRight("#ef4444")} />
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
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginTop: "4px" }}>
                {bottomNode.exchange !== "-" && (
                  <>
                    <div style={dotStyle(bottomNode.isPositive)} />
                    <div style={bottomNode.isPositive ? triDown("#10b981") : triUp("#ef4444")} />
                    <div style={nodePctStyle(bottomNode.isPositive)}>{bottomNode.isPositive ? "+" : ""}{bottomNode.pctDiff.toFixed(3)}%</div>
                    <div style={nodePriceStyle(bottomNode.isPositive)}>${formatPrice(bottomNode.price)}</div>
                    <div style={nodeExchangeStyle}>{bottomNode.exchange}</div>
                  </>
                )}
              </div>
            </div>

            {/* 2x2 Prices Grid under the compass */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {(currentPriceCompass?.prices || []).map((p, i) => (
                  <div key={i} className="compass-item-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", padding: "8px 12px", borderRadius: "6px", backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
                    <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{p.exchange}</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "bold" }}>${Number(p.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dev / View row */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: parseFloat(currentPriceCompass.deviation) < 0.5 ? "#10b981" : parseFloat(currentPriceCompass.deviation) < 1.0 ? "#f59e0b" : "#ef4444",
                  fontWeight: "bold",
                }}
              >
                Dev: {parseFloat(currentPriceCompass.deviation || 0).toFixed(2)}%
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsCompassModalOpen(true); }}
                style={{
                  backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#6366f1", border: "1px solid rgba(99, 102, 241, 0.3)",
                  padding: "6px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.25)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.15)"}
              >
                View
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 2x2 Grid of Social/Financial Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Card: Social Radar */}
          <div
            className="premium-card"
            style={{ cursor: 'pointer', display: "flex", flexDirection: "column" }}
            onClick={() => window.location.href = '/dashboard#social-intelligence'}
          >
            <div className="card-header-row">
              <h4 className="card-title-main" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Social Intelligence <span style={{ fontSize: '10px', color: '#a78bfa' }}>↗</span>
              </h4>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ height: '90px', width: '100%', position: 'relative', margin: '6px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <polygon points="50,10 88,38 73,83 27,83 12,38" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />
                  <polygon points="50,25 78.5,46 67.5,72 32.5,72 21.5,46" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />
                  <polygon points="50,40 69,54 62.5,63.5 37.5,63.5 31,54" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />
                  <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
                  <line x1="50" y1="50" x2="88" y2="38" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
                  <line x1="50" y1="50" x2="73" y2="83" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
                  <line x1="50" y1="50" x2="27" y2="83" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
                  <line x1="50" y1="50" x2="12" y2="38" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
                  <polygon points="50,18 80,41 68,78 34,75 22,42" fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="1.5" />
                  <circle cx="50" cy="18" r="2.5" fill="#a78bfa" />
                  <circle cx="80" cy="41" r="2.5" fill="#a78bfa" />
                  <circle cx="68" cy="78" r="2.5" fill="#a78bfa" />
                  <circle cx="34" cy="75" r="2.5" fill="#a78bfa" />
                  <circle cx="22" cy="42" r="2.5" fill="#a78bfa" />
                </svg>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                <div>
                  Social Vol:{" "}
                  <span style={{ color: "var(--text-main)", fontWeight: "bold" }}>
                    {socialStats?.radarValues?.vol ?? 0}%
                  </span>
                </div>
                <div>
                  Engagement:{" "}
                  <span style={{ color: "var(--text-main)", fontWeight: "bold" }}>
                    {socialStats?.radarValues?.eng ?? 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Financials */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header-row">
              <h4 className="card-title-main">Crypto Financials</h4>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ height: '90px', width: '100%', position: 'relative', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="84" height="84" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg-secondary, #121824)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="10" fill="none" stroke="var(--bg-secondary, #121824)" strokeWidth="2" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="70 100" strokeDashoffset="15" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="10" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="50 100" strokeDashoffset="45" strokeLinecap="round" />
                  <text x="18" y="20.5" textAnchor="middle" fill="var(--text-main, #ffffff)" fontSize="6.5" fontWeight="bold">REV</text>
                </svg>
                <div style={{ position: 'absolute', right: '0', top: '15px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9px' }}>
                  <div style={{ color: '#f97316', fontWeight: '600' }}>Revenues</div>
                  <div style={{ color: '#3b82f6', fontWeight: '600' }}>Fees</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Total 30D Revenue: <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{financials?.revenue}</span>
              </div>
            </div>
          </div>

          {/* Card: Market Movers */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header-row">
              <h4 className="card-title-main">Market Movers</h4>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ height: '90px', width: '100%', position: 'relative', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="84" height="84" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="12.5" fill="none" stroke="var(--bg-secondary, #121824)" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="12.5" fill="none" stroke="#10b981" strokeWidth="3.8" strokeDasharray="68 100" strokeDashoffset="0" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="12.5" fill="none" stroke="#ef4444" strokeWidth="3.8" strokeDasharray="32 100" strokeDashoffset="-68" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="4" fill="var(--bg-secondary, #121824)" />
                  <path d="M 18 10 L 21 16 L 15 16 Z" fill="#10b981" transform="rotate(45 18 18) translate(0,-6)" />
                </svg>
                <div style={{ position: 'absolute', right: '0', top: '15px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9px' }}>
                  <div style={{ color: '#10b981', fontWeight: '600' }}>68% Buy</div>
                  <div style={{ color: '#ef4444', fontWeight: '600' }}>32% Sell</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Whale Activity (Last 24h)
              </div>
            </div>
          </div>

          {/* Card: Alerts */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header-row">
              <h4 className="card-title-main">Alerts Feed</h4>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "8px",
                height: "100px",
                overflowY: "auto",
                paddingRight: "4px"
              }}
            >
              {alerts && alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <div key={`alert-${idx}`} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                      backgroundColor: alert.type === 'bullish' ? '#10b981' : alert.type === 'bearish' ? '#ef4444' : '#3b82f6'
                    }} />
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.2' }}>{alert.msg}</div>
                      <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>{alert.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '10px', marginTop: '20px' }}>No active alerts</div>
              )}
            </div>
          </div>

        </div>
      </div>

      <PriceCompassModal
        isOpen={isCompassModalOpen}
        onClose={() => setIsCompassModalOpen(false)}
        priceCompass={currentPriceCompass}
        symbol="BTC/USDT"
      />
    </>
  );
};

export default SocialFinancialGrid;
