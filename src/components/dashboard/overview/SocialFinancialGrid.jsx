import React from 'react';

const SocialFinancialGrid = ({ alerts, socialStats, financials }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>

      

      {/* Card 2: Social Radar (LunarCrush) */}
      <div
        className="premium-card"
        style={{ cursor: 'pointer' }}
        onClick={() => window.location.href = '/dashboard#social-intelligence'}
      >
        <div className="card-header-row">
          <h4 className="card-title-main" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Social Intelligence <span style={{ fontSize: '10px', color: '#a78bfa' }}>↗</span>
          </h4>
        </div>

        {/* Purple Radar Spider web SVG */}
        <div style={{ height: '90px', width: '100%', position: 'relative', margin: '6px 0' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {/* Pentagon Grid lines */}
            <polygon points="50,10 88,38 73,83 27,83 12,38" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />
            <polygon points="50,25 78.5,46 67.5,72 32.5,72 21.5,46" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />
            <polygon points="50,40 69,54 62.5,63.5 37.5,63.5 31,54" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />
            {/* Center axis lines */}
            <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
            <line x1="50" y1="50" x2="88" y2="38" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
            <line x1="50" y1="50" x2="73" y2="83" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
            <line x1="50" y1="50" x2="27" y2="83" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />
            <line x1="50" y1="50" x2="12" y2="38" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.8" />

            {/* Glowing radar polygon */}
            <polygon points="50,18 80,41 68,78 34,75 22,42" fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="1.5" />
            {/* Point nodes */}
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
          </div>  </div>
      </div>

      {/* Card 3: Financial Double-Donut */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Crypto Financials</h4>
        </div>

        {/* Concentric Double Donut SVG */}
        <div style={{ height: '90px', width: '100%', position: 'relative', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="84" height="84" viewBox="0 0 36 36">
            {/* Inner gray ring */}
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg-secondary, #121824)" strokeWidth="2.5" />
            {/* Outer gray ring */}
            <circle cx="18" cy="18" r="10" fill="none" stroke="var(--bg-secondary, #121824)" strokeWidth="2" />

            {/* Outer Concentric segment (Revenue) */}
            <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="70 100" strokeDashoffset="15" strokeLinecap="round" />
            {/* Inner Concentric segment (Expenses) */}
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

      {/* Card 4: Whale Buying / Smart Money flow split donut */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Market Movers</h4>
        </div>

        {/* Slit Donut Pie SVG */}
        <div style={{ height: '90px', width: '100%', position: 'relative', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="84" height="84" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="12.5" fill="none" stroke="var(--bg-secondary, #121824)" strokeWidth="3.5" />
            {/* Green Buyer arc (Whales buying) */}
            <circle cx="18" cy="18" r="12.5" fill="none" stroke="#10b981" strokeWidth="3.8" strokeDasharray="68 100" strokeDashoffset="0" strokeLinecap="round" />
            {/* Red Seller arc (Whales selling) */}
            <circle cx="18" cy="18" r="12.5" fill="none" stroke="#ef4444" strokeWidth="3.8" strokeDasharray="28 100" strokeDashoffset="-70" strokeLinecap="round" />

            <text x="18" y="20.5" textAnchor="middle" fill="var(--text-main, #ffffff)" fontSize="6.2" fontWeight="bold">FLOW</text>
          </svg>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>Buy: {financials?.whaleBuy}</span>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Sell: {financials?.whaleSell}</span>
        </div>
      </div>

      {/* Card 4: Live Alerts Feed */}
      <div className="premium-card">
        <div className="card-header-row">
          <h4 className="card-title-main">Alerts Feed</h4>
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
          {alerts && alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                display: "flex",
                gap: "6px",
                fontSize: "9.5px",
                borderBottom: "1px solid var(--border-color, #0f1320)",
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
  );
};

export default SocialFinancialGrid;
