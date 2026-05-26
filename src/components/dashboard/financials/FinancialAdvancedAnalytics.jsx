import React from "react";

export default function FinancialAdvancedAnalytics({
  price,
  change24h,
  fundamentals,
  indicators,
  predictions,
  outlook,
  starsStr,
  ratingVal,
  ratingText,
  onChain,
  formatNum,
  formatLarge,
}) {
  return (
    <>
      {/* 10. ADVANCED ANALYTICS & INDICATORS */}
      <div className="fin-col-7">
        <div className="fin-card">
          <div className="fin-card-title">
            <span className="icon">📈</span> 10. ADVANCED ANALYTICS & INDICATORS
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>INDICATOR</th>
                    <th style={{ textAlign: "left" }}>VALUE</th>
                    <th style={{ textAlign: "left" }}>SIGNAL</th>
                  </tr>
                </thead>
                <tbody>
                  {indicators && (
                    <>
                      <tr style={{ textAlign: "left" }}>
                        <td>RSI (14)</td>
                        <td>{indicators.rsi}</td>
                        <td
                          className={
                            indicators.rsiSignal.includes("Bullish")
                              ? "text-green"
                              : indicators.rsiSignal.includes("Bearish") ||
                                  indicators.rsiSignal.includes("Overbought")
                                ? "text-red"
                                : "text-yellow"
                          }
                        >
                          {indicators.rsiSignal}
                        </td>
                      </tr>
                      <tr style={{ textAlign: "left" }}>
                        <td>MACD</td>
                        <td>
                          {parseFloat(indicators.macd).toFixed(2)}
                        </td>
                        <td
                          className={
                            indicators.macdSignal === "Bullish"
                              ? "text-green"
                              : indicators.macdSignal === "Bearish"
                                ? "text-red"
                                : "text-yellow"
                          }
                        >
                          {indicators.macdSignal}
                        </td>
                      </tr>
                      <tr style={{ textAlign: "left" }}>
                        <td>Moving Avg (50)</td>
                        <td>
                          ${formatNum(indicators.sma50, 2, 4)}
                        </td>
                        <td
                          className={
                            Number(price) > Number(indicators.sma50)
                              ? "text-green"
                              : "text-red"
                          }
                        >
                          {Number(price) > Number(indicators.sma50)
                            ? "Above"
                            : "Below"}
                        </td>
                      </tr>
                      <tr style={{ textAlign: "left" }}>
                        <td>Moving Avg (200)</td>
                        <td>
                          ${formatNum(indicators.sma200, 2, 4)}
                        </td>
                        <td
                          className={
                            Number(price) > Number(indicators.sma200)
                              ? "text-green"
                              : "text-red"
                          }
                        >
                          {Number(price) > Number(indicators.sma200)
                            ? "Above"
                            : "Below"}
                        </td>
                      </tr>
                      {indicators.bbUpper && (
                        <tr style={{ textAlign: "left" }}>
                          <td>Bollinger Bands</td>
                          <td>
                            ${formatNum(indicators.bbUpper, 2, 4)}
                          </td>
                          <td
                            className={
                              indicators.bbSignal === "Bullish"
                                ? "text-green"
                                : indicators.bbSignal === "Overbought"
                                  ? "text-red"
                                  : "text-yellow"
                            }
                          >
                            {indicators.bbSignal}
                          </td>
                        </tr>
                      )}
                      {indicators.adx && (
                        <tr style={{ textAlign: "left" }}>
                          <td>ADX (14)</td>
                          <td>
                            {indicators.adx}
                          </td>
                          <td
                            className={
                              indicators.adxSignal === "Strong"
                                ? "text-green"
                                : "text-yellow"
                            }
                          >
                            {indicators.adxSignal}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                flex: 1,
                borderLeft: "1px solid var(--border-color, #1e293b)",
                paddingLeft: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "var(--text-muted, #94a3b8)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                PRICE PREDICTION MODEL
              </div>
              {predictions && (
                <table className="fin-table">
                  <thead>
                    <tr>
                      <th>TIME FRAME</th>
                      <th style={{ textAlign: "left" }}>MIN PRICE</th>
                      <th style={{ textAlign: "left" }}>AVG PRICE</th>
                      <th style={{ textAlign: "left" }}>MAX PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>7 Days</td>
                      <td style={{ textAlign: "left" }}>
                        ${formatNum(predictions.p7d.min, 2, 4)}
                      </td>
                      <td style={{ textAlign: "left" }} className="text-green">
                        ${formatNum(predictions.p7d.avg, 2, 4)}
                      </td>
                      <td style={{ textAlign: "left" }}>
                        ${formatNum(predictions.p7d.max, 2, 4)}
                      </td>
                    </tr>
                    <tr>
                      <td>30 Days</td>
                      <td style={{ textAlign: "left" }}>
                        ${formatNum(predictions.p30d.min, 2, 4)}
                      </td>
                      <td style={{ textAlign: "left" }} className="text-green">
                        ${formatNum(predictions.p30d.avg, 2, 4)}
                      </td>
                      <td style={{ textAlign: "left" }}>
                        ${formatNum(predictions.p30d.max, 2, 4)}
                      </td>
                    </tr>
                    <tr>
                      <td>90 Days</td>
                      <td style={{ textAlign: "left" }}>
                        ${formatNum(predictions.p90d.min, 2, 4)}
                      </td>
                      <td style={{ textAlign: "left" }} className="text-green">
                        ${formatNum(predictions.p90d.avg, 2, 4)}
                      </td>
                      <td style={{ textAlign: "left" }}>
                        ${formatNum(predictions.p90d.max, 2, 4)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--text-muted, #94a3b8)",
                    textTransform: "uppercase",
                  }}
                >
                  CONFIDENCE LEVEL
                </span>
                <span
                  style={{
                    color: "var(--text-main, #fff)",
                    fontWeight: "bold",
                  }}
                >
                  N/A
                </span>
              </div>
              <div
                className="fin-progress-bar"
                style={{ height: "8px", marginTop: "6px" }}
              >
                <div
                  className="fin-progress-fill"
                  style={{ width: "0%", backgroundColor: "#f59e0b" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 11. SUMMARY & OUTLOOK */}
      <div className="fin-col-5">
        <div className="fin-card">
          <div className="fin-card-title">
            <span className="icon">📋</span> 11. SUMMARY & OUTLOOK
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1.5 }}>
              <div
                style={{
                  fontSize: "9px",
                  color: "var(--text-muted, #94a3b8)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                }}
              >
                KEY HIGHLIGHTS
              </div>
              <div className="fin-list" style={{ gap: "12px", textAlign: "left" }}>
                <div className="d-flex-center">
                  <span className="text-green" style={{ marginRight: "8px" }}>
                    ✓
                  </span>{" "}
                  <span
                    style={{
                      color: "var(--text-main, #e2e8f0)",
                      fontSize: "11px",
                    }}
                  >
                    Consensus: {fundamentals?.consensus} (
                    {fundamentals?.blockchain})
                  </span>
                </div>
                <div className="d-flex-center">
                  <span className="text-green" style={{ marginRight: "8px" }}>
                    ✓
                  </span>{" "}
                  <span
                    style={{
                      color: "var(--text-main, #e2e8f0)",
                      fontSize: "11px",
                    }}
                  >
                    On-Chain: {formatNum(onChain?.transactions, 0, 0)} live tx /{" "}
                    {formatNum(onChain?.activeAddresses, 0, 0)} active users
                  </span>
                </div>
                <div className="d-flex-center">
                  <span className="text-green" style={{ marginRight: "8px" }}>
                    ✓
                  </span>{" "}
                  <span
                    style={{
                      color: "var(--text-main, #e2e8f0)",
                      fontSize: "11px",
                    }}
                  >
                    Dev Activity: {fundamentals?.devActivity} (
                    {fundamentals?.devCommits} Commits)
                  </span>
                </div>
                <div className="d-flex-center">
                  <span className="text-green" style={{ marginRight: "8px" }}>
                    ✓
                  </span>{" "}
                  <span
                    style={{
                      color: "var(--text-main, #e2e8f0)",
                      fontSize: "11px",
                    }}
                  >
                    Key Investor: {fundamentals?.investors?.[0] || "Tier-1 VCs"}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                borderLeft: "1px solid var(--border-color, #1e293b)",
                paddingLeft: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "var(--text-muted, #94a3b8)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                }}
              >
                OUTLOOK
              </div>
              <div className="fin-list" style={{ gap: "12px" }}>
                <div className="fin-list-item">
                  <span style={{ color: "var(--text-muted, #cbd5e1)", fontSize: "10px" }}>Short Term</span>
                  <span
                    className={
                      outlook?.shortTerm?.toLowerCase().includes('bull') ? 'text-green'
                      : outlook?.shortTerm?.toLowerCase().includes('bear') ? 'text-red'
                      : 'text-yellow'
                    }
                    style={{ fontWeight: "bold", fontSize: "11px" }}
                  >
                    {outlook?.shortTerm || 'N/A'}
                  </span>
                </div>
                <div className="fin-list-item">
                  <span style={{ color: "var(--text-muted, #cbd5e1)", fontSize: "10px" }}>Mid Term</span>
                  <span
                    className={
                      outlook?.midTerm?.toLowerCase().includes('bull') ? 'text-green'
                      : outlook?.midTerm?.toLowerCase().includes('bear') ? 'text-red'
                      : 'text-yellow'
                    }
                    style={{ fontWeight: "bold", fontSize: "11px" }}
                  >
                    {outlook?.midTerm || 'N/A'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "30px" }}>
                <div
                  style={{
                    fontSize: "9px",
                    color: "var(--text-muted, #94a3b8)",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  OVERALL RATING
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#f59e0b", fontSize: "14px" }}>
                    {outlook?.overallRating != null
                      ? '★'.repeat(Math.floor(Number(outlook.overallRating))) + (Number(outlook.overallRating) % 1 >= 0.4 ? '½' : '') + '☆'.repeat(5 - Math.floor(Number(outlook.overallRating)) - (Number(outlook.overallRating) % 1 >= 0.4 ? 1 : 0))
                      : starsStr}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--text-main, #fff)", fontWeight: "bold", fontSize: "14px" }}>
                      {outlook?.overallRating != null ? `${Number(outlook.overallRating).toFixed(1)} / 5` : (ratingVal != null ? `${ratingVal.toFixed(1)} / 5` : 'N/A')}
                    </div>
                    <div
                      style={{ fontSize: "10px", fontWeight: "bold", color: outlook?.action ? '#10b981' : 'var(--text-muted, #94a3b8)' }}
                    >
                      {outlook?.action || ratingText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
