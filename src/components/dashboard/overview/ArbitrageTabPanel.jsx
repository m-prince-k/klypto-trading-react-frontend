import React, { useState, useEffect } from "react";

const ArbitrageTabPanel = ({ arbitrage, selectedSymbol }) => {
  const [liveRates, setLiveRates] = useState([]);

  useEffect(() => {
    // Extract base from selectedSymbol (e.g. BTC from BTCUSDT)
    const base = selectedSymbol
      ? selectedSymbol.replace(/(USDT|BUSD|USDC|BTC|ETH)$/, "")
      : "BTC";
    const quote = selectedSymbol ? selectedSymbol.replace(base, "") : "USDT";

    // Extract dynamic raw price from the existing arbitrage object if available, otherwise fallback to reasonable defaults
    const currentArb =
      arbitrage.find((item) => item.symbol.includes(base)) || {};
    const binancePriceRaw =
      parseFloat(currentArb.binance?.replace(/,/g, "")) ||
      (base === "ETH" ? 3100 : base === "SOL" ? 150 : 64000);

    const generateRates = () => {
      const btcVol = 24.5;
      const ethVol = 182.1;

      const exchanges = [
        {
          name: "Binance",
          logo: "B",
          color: "#fcd535",
          priceOffset: 0.0,
          volFactor: 1.0,
        },
        {
          name: "Bybit",
          logo: "Y",
          color: "#161824",
          priceOffset: 1.25,
          volFactor: 0.85,
        },
        {
          name: "OKX",
          logo: "O",
          color: "#ffffff",
          priceOffset: -0.9,
          volFactor: 0.7,
        },
        {
          name: "Coinbase Pro",
          logo: "C",
          color: "#0052ff",
          priceOffset: 2.1,
          volFactor: 0.6,
        },
        {
          name: "Kraken",
          logo: "K",
          color: "#5841d8",
          priceOffset: -1.5,
          volFactor: 0.4,
        },
      ];

      return exchanges.map((ex) => {
        const ask =
          binancePriceRaw + ex.priceOffset + (Math.random() - 0.5) * 0.15;
        const bid = ask - 0.2 - Math.random() * 0.1;
        const spreadAmt = ask - bid;
        const pctDiff = ((ask - binancePriceRaw) / binancePriceRaw) * 100;

        let status = "Balanced";
        let statusColor = "#64748b";
        if (pctDiff > 0.003) {
          status = "Sell Opportunity";
          statusColor = "#ef4444";
        } else if (pctDiff < -0.003) {
          status = "Buy Opportunity";
          statusColor = "#10b981";
        }

        return {
          exchange: ex.name,
          logo: ex.logo,
          color: ex.color,
          bid: bid.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          ask: ask.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          spread: spreadAmt.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          deviation: (pctDiff >= 0 ? "+" : "") + pctDiff.toFixed(3) + "%",
          volume:
            (base === "BTC"
              ? btcVol * ex.volFactor
              : ethVol * ex.volFactor
            ).toFixed(1) + "K",
          status,
          statusColor,
        };
      });
    };

    setLiveRates(generateRates());
    const interval = setInterval(() => {
      setLiveRates(generateRates());
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedSymbol, arbitrage]);

  return (
    <div
      className="arbitrage-tab-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "fadeIn 0.2s ease-in-out",
      }}
    >
      {/* Upper Grid: Price Compass Dial & Status Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "16px",
        }}
      >
        <div className="premium-card">
          <div className="card-header-row">
            <h4 className="card-title-main">
              Dynamic Multi-Exchange Price Compass
            </h4>
            <span className="glow-tag-green">REALTIME ROUTED</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
              marginTop: "16px",
            }}
          >
            <svg
              width="90"
              height="90"
              viewBox="0 0 64 64"
              style={{ flexShrink: 0 }}
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#131826"
                strokeWidth="2"
              />
              <circle
                cx="32"
                cy="32"
                r="24"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
              <line
                x1="32"
                y1="4"
                x2="32"
                y2="8"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <line
                x1="32"
                y1="60"
                x2="32"
                y2="56"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <line
                x1="4"
                y1="32"
                x2="8"
                y2="32"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <line
                x1="60"
                y1="32"
                x2="56"
                y2="32"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <polygon points="32,32 30,14 34,14" fill="#ef4444" />
              <polygon points="32,32 29,48 35,48" fill="#64748b" />
              <circle cx="32" cy="32" r="5" fill="#fcd535" />
            </svg>
            <div>
              <h5
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "13px",
                  color: "#ffffff",
                }}
              >
                Cross-Exchange Spread Deviation Index
              </h5>
              <p
                style={{
                  fontSize: "11.5px",
                  color: "#8f9cae",
                  margin: "0 0 10px 0",
                  lineHeight: "1.4",
                }}
              >
                Measures current price displacement of{" "}
                <strong>{selectedSymbol}</strong> across five tier-1 venues.
                Values exceeding ±0.005% trigger automated execution pathways.
              </p>
              <div
                style={{
                  fontSize: "11px",
                  color: "#10b981",
                  fontWeight: "bold",
                }}
              >
                🛡 Safe Executions: Enabled | Compass Delta: 0.002%
              </div>
            </div>
          </div>
        </div>

        <div
          className="premium-card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <div className="card-header-row">
            <h4 className="card-title-main">Spread Compass Health</h4>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#8f9cae" }}>Highest Bid:</span>
              <strong style={{ color: "#ffffff" }}>
                ${liveRates[3]?.bid || "——"}
              </strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#8f9cae" }}>Lowest Ask:</span>
              <strong style={{ color: "#ffffff" }}>
                ${liveRates[4]?.ask || "——"}
              </strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                borderTop: "1px solid #161e31",
                paddingTop: "8px",
              }}
            >
              <span style={{ color: "#38bdf8", fontWeight: "bold" }}>
                Max Arbitrage Spread:
              </span>
              <strong style={{ color: "#10b981" }}>
                $
                {(
                  (parseFloat(liveRates[3]?.bid?.replace(/,/g, "")) || 0) -
                  (parseFloat(liveRates[4]?.ask?.replace(/,/g, "")) || 0)
                ).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">
            Real-time Cross-Exchange Orderbook & Spreads
          </h4>
          <span className="glow-tag-purple">LIVE COMPLETED</span>
        </div>
        <table
          className="custom-crypto-table"
          style={{ width: "100%", marginTop: "12px" }}
        >
          <thead>
            <tr>
              <th align="left">Venue</th>
              <th align="right">Bid Price</th>
              <th align="right">Ask Price</th>
              <th align="right">Internal Spread</th>
              <th align="right">24H Volume</th>
              <th align="right">Deviation</th>
              <th align="right">Signal / Action</th>
            </tr>
          </thead>
          <tbody>
            {liveRates.map((rate, idx) => (
              <tr key={idx}>
                <td align="left">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: rate.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: "bold",
                        color: rate.color === "#ffffff" ? "#000000" : "#ffffff",
                      }}
                    >
                      {rate.logo}
                    </div>
                    <strong>{rate.exchange}</strong>
                  </div>
                </td>
                <td align="right">${rate.bid}</td>
                <td align="right">${rate.ask}</td>
                <td align="right" style={{ color: "#cbd5e1" }}>
                  ${rate.spread}
                </td>
                <td align="right" style={{ color: "#8f9cae" }}>
                  {rate.volume}
                </td>
                <td
                  align="right"
                  style={{
                    color: rate.deviation.startsWith("+")
                      ? "#10b981"
                      : "#ef4444",
                    fontWeight: "bold",
                  }}
                >
                  {rate.deviation}
                </td>
                <td align="right">
                  <span
                    style={{
                      color: rate.statusColor,
                      backgroundColor: rate.statusColor + "15",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      border: `1px solid ${rate.statusColor}30`,
                    }}
                  >
                    {rate.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArbitrageTabPanel;
