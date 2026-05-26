import React from 'react';

export default function FinancialSocialRisk({
  social,
  fundamentals,
  change24h,
  activeDepth,
  overallRisk,
  sentimentAngle,
  radarPoints,
  formatNum,
  formatLarge
}) {
  return (
    <>
      {/* 7. SOCIAL & COMMUNITY METRICS */}
      <div className="fin-col-6">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">💬</span> 7. SOCIAL & COMMUNITY METRICS</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '24px', marginTop: '8px' }}>
            <div>
              <div style={{ color: '#1da1f2', fontSize: '18px', marginBottom: '4px' }}>🐦</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Twitter</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px' }}>{formatLarge(social?.twitter) ?? 'N/A'}</div>
              <div style={{ fontSize: '9px', color: social?.twitterChange >= 0 ? '#10b981' : '#ef4444' }}>{social?.twitterChange != null ? `${social.twitterChange >= 0 ? '+' : ''}${social.twitterChange}` : 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: '#0088cc', fontSize: '18px', marginBottom: '4px' }}>✈️</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Telegram</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px' }}>{formatLarge(social?.telegram) ?? 'N/A'}</div>
              <div style={{ fontSize: '9px', color: social?.telegramChange >= 0 ? '#10b981' : '#ef4444' }}>{social?.telegramChange != null ? `${social.telegramChange >= 0 ? '+' : ''}${social.telegramChange}` : 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: '#5865F2', fontSize: '18px', marginBottom: '4px' }}>👾</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Discord</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px' }}>{formatLarge(social?.discord) ?? 'N/A'}</div>
              <div style={{ fontSize: '9px', color: social?.discordChange >= 0 ? '#10b981' : '#ef4444' }}>{social?.discordChange != null ? `${social.discordChange >= 0 ? '+' : ''}${social.discordChange}` : 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: '#ff4500', fontSize: '18px', marginBottom: '4px' }}>👽</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Reddit</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px' }}>{formatLarge(social?.reddit) ?? 'N/A'}</div>
              <div style={{ fontSize: '9px', color: social?.redditChange >= 0 ? '#10b981' : '#ef4444' }}>{social?.redditChange != null ? `${social.redditChange >= 0 ? '+' : ''}${social.redditChange}%` : 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', marginBottom: '10px' }}>Social Sentiment</div>
              <div className="fin-gauge">
                <div className="fin-gauge-needle" style={{ transform: `rotate(${sentimentAngle}deg)` }}></div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px' }}>{social?.sentiment}/100</div>
            </div>

            <div className="fin-list" style={{ flex: 1, marginLeft: '20px', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>Social Dominance</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)' }}>{social?.dominance != null ? `${social.dominance}%` : 'N/A'}</div>
                <div style={{ fontSize: '10px', color: social?.dominance > 5 ? '#10b981' : '#94a3b8' }}>{social?.dominance != null ? (social.dominance > 50 ? 'High' : 'Low') : 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>Developer Activity</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: fundamentals?.devActivity ? '#10b981' : '#94a3b8' }}>{fundamentals?.devActivity || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>Community</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: social?.community ? '#10b981' : '#94a3b8' }}>{social?.community || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. RISK ANALYSIS */}
      <div className="fin-col-6">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">🛡️</span> 8. RISK ANALYSIS</div>
          <div style={{ display: 'flex', flex: 1 }}>
            <div className="fin-list" style={{ flex: 1, paddingRight: '10px', borderRight: '1px solid var(--border-color, #1e293b)' }}>
              {/* All values read directly from backend depth/fundamentals — no frontend calculations */}
              <div className="fin-list-item">
                <span className="fin-list-label">Smart Contract Risk</span>
                <span className={activeDepth?.smartContractRisk === 'Low' ? 'text-green' : activeDepth?.smartContractRisk === 'High' ? 'text-red' : activeDepth?.smartContractRisk ? 'text-yellow' : 'fin-list-val'}>
                  {activeDepth?.smartContractRisk || 'N/A'}
                </span>
              </div>

              <div className="fin-list-item">
                <span className="fin-list-label">Liquidity Risk</span>
                <span className={activeDepth?.liquidityRisk === 'Low' ? 'text-green' : activeDepth?.liquidityRisk === 'High' ? 'text-red' : activeDepth?.liquidityRisk ? 'text-yellow' : 'fin-list-val'}>
                  {activeDepth?.liquidityRisk || 'N/A'}
                </span>
              </div>
              <div className="fin-list-item">
                <span className="fin-list-label">Regulatory Risk</span>
                <span className={activeDepth?.regulatoryRisk === 'Low' ? 'text-green' : activeDepth?.regulatoryRisk === 'High' ? 'text-red' : activeDepth?.regulatoryRisk ? 'text-yellow' : 'fin-list-val'}>
                  {activeDepth?.regulatoryRisk || 'N/A'}
                </span>
              </div>
              <div className="fin-list-item">
                <span className="fin-list-label">Best Bid</span>
                <span className="fin-list-val">{activeDepth?.bestBid != null ? `$${Number(activeDepth.bestBid).toLocaleString()}` : 'N/A'}</span>
              </div>
              <div className="fin-list-item">
                <span className="fin-list-label">Best Ask</span>
                <span className="fin-list-val">{activeDepth?.bestAsk != null ? `$${Number(activeDepth.bestAsk).toLocaleString()}` : 'N/A'}</span>
              </div>
              <div className="fin-list-item">
                <span className="fin-list-label">Bid Depth</span>
                <span className="fin-list-val">{activeDepth?.bidDepth != null ? formatNum(activeDepth.bidDepth, 2, 4) : 'N/A'}</span>
              </div>
              <div className="fin-list-item">
                <span className="fin-list-label">Bid/Ask Spread</span>
                <span className="fin-list-val">{activeDepth?.spreadPct != null ? `${(activeDepth.spreadPct * 100).toFixed(6)}%` : 'N/A'}</span>
              </div>

              <div className="fin-list-item" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color, #1e293b)' }}>
                <span className="fin-list-label" style={{ color: 'var(--text-main, #fff)', fontWeight: 'bold' }}>Overall Risk Score</span>
                <span className="fin-list-val" style={{ fontSize: '12px', fontWeight: 'bold' }}>{activeDepth?.overallRiskScore}</span>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: '-5px', width: '100%', textAlign: 'center', fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Security</div>
              <div style={{ position: 'absolute', right: '-5px', top: '45%', fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Liquidity</div>
              <div style={{ position: 'absolute', bottom: '15px', right: '5px', fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Adoption</div>
              <div style={{ position: 'absolute', bottom: '15px', left: '5px', fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Tokenomics</div>
              <div style={{ position: 'absolute', left: '-5px', top: '45%', fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Team</div>
              <div style={{ position: 'absolute', top: '15px', right: '5px', fontSize: '9px', color: 'var(--text-muted, #94a3b8)' }}>Technology</div>

              {/* SVG 6-Axis Radar Chart */}
              <div style={{ width: '90px', height: '90px', transform: 'rotate(-30deg)' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="var(--border-color, rgba(148, 163, 184, 0.2))" strokeWidth="0.8" />
                  <circle cx="50" cy="50" r="22" fill="none" stroke="var(--border-color, rgba(148, 163, 184, 0.2))" strokeWidth="0.8" />
                  <circle cx="50" cy="50" r="10" fill="none" stroke="var(--border-color, rgba(148, 163, 184, 0.2))" strokeWidth="0.8" />
                  {[0, 1, 2, 3, 4, 5].map(i => {
                    const angle = (i * 2 * Math.PI) / 6;
                    return <line key={i} x1="50" y1="50" x2={50 + 35 * Math.sin(angle)} y2={50 - 35 * Math.cos(angle)} stroke="var(--border-color, rgba(148, 163, 184, 0.2))" strokeWidth="0.8" />;
                  })}
                  <polygon points={radarPoints} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9. TEAM & INVESTORS */}
      <div className="fin-col-4">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">👥</span> 9. TEAM & INVESTORS</div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px', textTransform: 'uppercase' }}>CORE TEAM</div>
              <div className="fin-list" style={{ gap: '12px' }}>
                {fundamentals?.team?.slice(0, 4).map((member, i) => (
                  <div key={i} className="d-flex-center justify-content-between">
                    <div className="d-flex-center">
                      <div className="fin-team-avatar d-flex-center justify-content-center" style={{ fontSize: '12px' }}>👨‍💻</div>
                      <div className='text-left'>
                        <div style={{ color: 'var(--text-main, #fff)', fontSize: '11px', fontWeight: 'bold' }}>{member.name}</div>
                        <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '9px' }}>{member.role}</div>
                      </div>
                    </div>
                    <div style={{ color: 'var(--accent-color, #3b82f6)', background: 'var(--bg-card-hover, rgba(59, 130, 246, 0.1))', padding: '2px 4px', borderRadius: '4px', fontSize: '9px' }}>in</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px', textTransform: 'uppercase' }}>INVESTORS</div>
              <div className="fin-list" style={{ gap: '12px' }}>
                {fundamentals?.investors?.slice(0, 5).map((inv, i) => (
                  <div key={i} className="d-flex-center">
                    <span style={{ color: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e'][i % 5], marginRight: '6px' }}>{inv.charAt(0)}</span>
                    <span style={{ color: 'var(--text-main, #fff)', fontSize: '10px' }}>{inv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
