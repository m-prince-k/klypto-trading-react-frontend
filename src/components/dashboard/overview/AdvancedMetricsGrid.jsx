import React from 'react';

const AdvancedMetricsGrid = ({ selectedSymbol = "SOL", marketMetrics, fearGreed, socialStats, prices, sentimentData }) => {
  const baseAsset = selectedSymbol.replace(/USDT|BUSD|USD/gi, '') || "SOL";

  // ── Social Dominance: from social-intel-update ──────────────────────────
  const twitterPct  = socialStats?.twitterPct  ?? socialStats?.twitter_pct  ?? null;
  const redditPct   = socialStats?.redditPct   ?? socialStats?.reddit_pct   ?? null;
  const telegramPct = socialStats?.telegramPct  ?? socialStats?.telegram_pct ?? null;

  // ── Market Cap Dominance: from binance-sentiment → metrics ─────────────
  // marketMetrics already gets btcDominance merged in useSocket.js (line 167)
  // ethDominance comes from sentimentData.metrics or marketMetrics directly
  const btcDom = marketMetrics?.btcDominance
    ?? sentimentData?.metrics?.btcDominance
    ?? null;
  const ethDom = marketMetrics?.ethDominance
    ?? sentimentData?.metrics?.ethDominance
    ?? null;

  const fgVal = Number(fearGreed?.value) || 50;
  const fgColor = fgVal <= 45 ? '#ef4444' : fgVal < 55 ? '#f59e0b' : '#10b981';

  const fmtPct = (val) => (val != null ? `${Number(val).toFixed(2)}%` : 'N/A');

  return (
    <div className="top-five-grid">

      {/* ── Card 1: Market Regime ─────────────────────────────────── */}
      <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header-row">
          <h4 className="card-title-main" style={{ whiteSpace: 'nowrap' }}>Market Regime</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flex: 1 }}>
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" fill="url(#regime-glow)" fillOpacity="0.15" stroke="#10b981" strokeWidth="1" />
            <path d="M18 42 L28 28 L36 34 L48 18" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points="48,18 42,22 46,26" fill="#10b981" />
            <defs>
              <radialGradient id="regime-glow" cx="0" cy="0" r="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🐂</span> BULL REGIME
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Strength: 72/100</div>
          </div>
        </div>
        <div className="regime-segments">
          <div className="regime-seg active"></div>
          <div className="regime-seg active"></div>
          <div className="regime-seg active"></div>
          <div className="regime-seg active"></div>
          <div className="regime-seg"></div>
        </div>
      </div>

      {/* ── Card 2: Fear & Greed ──────────────────────────────────── */}
      <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header-row">
          <h4 className="card-title-main" style={{ whiteSpace: 'nowrap' }}>Fear & Greed</h4>
        </div>

        {/* Gauge + value — grows to fill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flex: 1 }}>
          <svg width="70" height="35" viewBox="0 0 70 35">
            {/* Red segment */}
            <path d="M 5,35 A 30,30 0 0,1 65,35" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="30 94" strokeLinecap="round" />
            {/* Amber segment */}
            <path d="M 5,35 A 30,30 0 0,1 65,35" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="0 30 32 62" strokeLinecap="round" />
            {/* Green segment */}
            <path d="M 5,35 A 30,30 0 0,1 65,35" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="0 62 32 0" strokeLinecap="round" />
            {/* Needle */}
            <line
              x1="35" y1="35" x2="10" y2="35"
              stroke="var(--text-main)" strokeWidth="3" strokeLinecap="round"
              transform={`rotate(${((fearGreed?.value || 50) / 100) * 180}, 35, 35)`}
              style={{ transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            <circle cx="35" cy="35" r="4" fill="var(--text-main)" />
          </svg>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: 1 }}>{fearGreed?.value ?? '—'}</div>
            <div style={{ fontSize: '10px', color: fgColor, fontWeight: '700', marginTop: '2px' }}>{fearGreed?.label ?? ''}</div>
          </div>
        </div>

        {/* Yesterday / Last Week pinned to bottom */}
        <div className="fg-historical" style={{ marginTop: 'auto', paddingTop: '6px' }}>
          <div>Yesterday: <span>{fearGreed?.yesterday ?? '—'}</span></div>
          <div>Last Week: <span>{fearGreed?.lastWeek ?? '—'}</span></div>
        </div>
      </div>

      {/* ── Card 3: Social Dominance ──────────────────────────────── */}
      <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header-row">
          <h4 className="card-title-main" style={{ whiteSpace: 'nowrap' }}>Social Dominance</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px', flex: 1 }}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#1f2937" strokeWidth="1" />
            <circle cx="18" cy="18" r="10" fill="none" stroke="#1f2937" strokeWidth="1" />
            <circle cx="18" cy="3"  r="2"   fill="#a78bfa" />
            <circle cx="31" cy="23" r="2.5" fill="#a78bfa" />
            <circle cx="5"  cy="14" r="1.5" fill="#a78bfa" />
            <circle cx="18" cy="18" r="6" fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="1.5" />
          </svg>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#a78bfa' }}>{socialStats?.btcDominance ?? '—'}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 'bold' }}>BTC DOMINANCE</div>
          </div>
        </div>

        {/* Social platform breakdown — pinned to bottom, from social-intel-update */}
        <div style={{ fontSize: '8.5px', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '6px', textAlign: 'left' }}>
          {twitterPct  != null && <span>Twitter: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{fmtPct(twitterPct)}</span></span>}
          {twitterPct  != null && redditPct   != null && <span style={{ margin: '0 3px' }}>|</span>}
          {redditPct   != null && <span>Reddit: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{fmtPct(redditPct)}</span></span>}
          {redditPct   != null && telegramPct != null && <span style={{ margin: '0 3px' }}>|</span>}
          {telegramPct != null && <span>Telegram: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{fmtPct(telegramPct)}</span></span>}
          {twitterPct == null && redditPct == null && telegramPct == null && <span style={{ fontStyle: 'italic' }}>No platform data</span>}
        </div>
      </div>

      {/* ── Card 4: AltRank™ ─────────────────────────────────────── */}
      <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header-row">
          <h4 className="card-title-main" style={{ whiteSpace: 'nowrap' }}>AltRank™</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flex: 1 }}>
          <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
            <circle cx="22" cy="22" r="19" fill="none" stroke="#141c2c" strokeWidth="3" />
            <circle cx="22" cy="22" r="19" fill="none" stroke="#6366f1" strokeWidth="3.5" strokeDasharray="90 120" strokeDashoffset="10" strokeLinecap="round" />
            <text x="22" y="27.5" textAnchor="middle" fill="var(--text-main)" fontSize="16" fontWeight="bold">#</text>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: 1 }}>
                {socialStats?.altRank ?? '—'}
              </div>
              <div style={{ fontSize: '9px', color: '#6366f1', fontWeight: 'bold' }}>{baseAsset} RANK</div>
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
              Combined social + price<br/>performance vs. all assets
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 5: Market Cap ───────────────────────────────────── */}
      <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header-row">
          <h4 className="card-title-main" style={{ whiteSpace: 'nowrap' }}>Market Cap</h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flex: 1 }}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <rect x="3"  y="18" width="5" height="14" rx="1.5" fill="#10b981" />
            <rect x="11" y="10" width="5" height="22" rx="1.5" fill="#10b981" />
            <rect x="19" y="14" width="5" height="18" rx="1.5" fill="#10b981" />
            <rect x="27" y="4"  width="5" height="28" rx="1.5" fill="#10b981" fillOpacity="0.4" />
          </svg>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {marketMetrics?.totalMarketCap
                ? `$${marketMetrics.totalMarketCap}T`
                : prices?.TOTAL_MCAP?.val
                ? `$${prices.TOTAL_MCAP.val}`
                : '—'}
            </div>
            <div style={{
              fontSize: '9px',
              color: (marketMetrics?.totalMarketCapChange >= 0 || prices?.TOTAL_MCAP?.isUp) ? '#10b981' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {marketMetrics?.totalMarketCapChange != null
                ? `${marketMetrics.totalMarketCapChange >= 0 ? '▲' : '▼'} ${Math.abs(marketMetrics.totalMarketCapChange).toFixed(2)}% (24H)`
                : prices?.TOTAL_MCAP?.change
                ? `${prices.TOTAL_MCAP.isUp ? '▲' : '▼'} ${prices.TOTAL_MCAP.change} (24H)`
                : ''}
            </div>
          </div>
        </div>

        {/* BTC / ETH dominance — pinned to bottom, from binance-sentiment.metrics */}
        <div style={{
          fontSize: '8.5px', color: 'var(--text-muted)',
          marginTop: 'auto', paddingTop: '5px', textAlign: 'left'
        }}>
          Dominance:{' '}
          {btcDom != null
            ? <span style={{ fontWeight: 'bold' }}>BTC {fmtPct(btcDom)}</span>
            : <span style={{ fontStyle: 'italic' }}>BTC N/A</span>}
          {' | '}
          {ethDom != null
            ? <span style={{ fontWeight: 'bold' }}>ETH {fmtPct(ethDom)}</span>
            : <span style={{ fontStyle: 'italic' }}>ETH N/A</span>}
        </div>
      </div>

    </div>
  );
};

export default AdvancedMetricsGrid;
