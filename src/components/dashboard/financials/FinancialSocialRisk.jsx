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
      <div className="fin-col-3">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">💬</span> 7. SOCIAL & COMMUNITY METRICS</div>
          
          <div style={{display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '24px', marginTop: '8px'}}>
            <div>
              <div style={{color: '#1da1f2', fontSize: '18px', marginBottom: '4px'}}>🐦</div>
              <div style={{fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Twitter</div>
              <div style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px'}}>{formatLarge(social?.twitter)}</div>
              <div className="text-green" style={{fontSize: '9px'}}>+5.2%</div>
            </div>
            <div>
              <div style={{color: '#0088cc', fontSize: '18px', marginBottom: '4px'}}>✈️</div>
              <div style={{fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Telegram</div>
              <div style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px'}}>{formatLarge(social?.telegram)}</div>
              <div className="text-green" style={{fontSize: '9px'}}>+3.1%</div>
            </div>
            <div>
              <div style={{color: '#5865F2', fontSize: '18px', marginBottom: '4px'}}>👾</div>
              <div style={{fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Discord</div>
              <div style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px'}}>{formatLarge(social?.discord)}</div>
              <div className="text-green" style={{fontSize: '9px'}}>+4.5%</div>
            </div>
            <div>
              <div style={{color: '#ff4500', fontSize: '18px', marginBottom: '4px'}}>👽</div>
              <div style={{fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Reddit</div>
              <div style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px'}}>{formatLarge(social?.reddit)}</div>
              <div className="text-green" style={{fontSize: '9px'}}>+2.7%</div>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: '20px'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '10px', color: 'var(--text-muted, #94a3b8)', marginBottom: '10px'}}>Social Sentiment</div>
              <div className="fin-gauge">
                <div className="fin-gauge-needle" style={{transform: `rotate(${sentimentAngle}deg)`}}></div>
              </div>
              <div style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main, #fff)', marginTop: '4px'}}>{social?.sentiment}/100</div>
            </div>
            
            <div className="fin-list" style={{flex: 1, marginLeft: '20px', gap: '12px'}}>
              <div>
                <div style={{fontSize: '10px', color: 'var(--text-muted, #94a3b8)'}}>Social Dominance</div>
                <div style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)'}}>{social?.dominance}%</div>
                <div className="text-green" style={{fontSize: '10px'}}>High</div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted, #94a3b8)'}}>Developer Activity</div>
                  <div className="text-green" style={{fontSize: '12px', fontWeight: 'bold'}}>High</div>
                </div>
                <div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted, #94a3b8)'}}>Community</div>
                  <div className="text-green" style={{fontSize: '12px', fontWeight: 'bold'}}>Strong</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. RISK ANALYSIS */}
      <div className="fin-col-3">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">🛡️</span> 8. RISK ANALYSIS</div>
          <div style={{display: 'flex', height: '100%'}}>
            <div className="fin-list" style={{flex: 1, paddingRight: '10px', borderRight: '1px solid var(--border-color, #1e293b)'}}>
              <div className="fin-list-item"><span className="fin-list-label">Smart Contract Risk</span><span className="fin-list-val text-green">Low</span></div>
              <div className="fin-list-item"><span className="fin-list-label">Market Risk</span><span className={change24h < -5 ? 'text-red' : 'text-yellow'}>{change24h < -5 ? 'High' : 'Medium'}</span></div>
              <div className="fin-list-item"><span className="fin-list-label">Liquidity Risk</span><span className={activeDepth?.liquidityRisk === 'Low' ? 'text-green' : activeDepth?.liquidityRisk === 'High' ? 'text-red' : 'text-yellow'}>{activeDepth?.liquidityRisk || 'Low'}</span></div>
              <div className="fin-list-item"><span className="fin-list-label">Bid/Ask Spread</span><span className="fin-list-val">{activeDepth?.spreadPct ? formatNum(activeDepth.spreadPct, 3, 5) + '%' : 'N/A'}</span></div>
              <div className="fin-list-item"><span className="fin-list-label">Regulatory Risk</span><span className="fin-list-val text-yellow">Medium</span></div>
              
              <div className="fin-list-item" style={{marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color, #1e293b)'}}>
                <span className="fin-list-label" style={{color: 'var(--text-main, #fff)', fontWeight: 'bold'}}>Overall Risk Score</span>
                <span className="fin-list-val text-green" style={{fontSize: '14px', fontWeight: 'bold'}}>{overallRisk} / 10</span>
              </div>
            </div>
            
            <div style={{flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{position: 'absolute', top: '-5px', width: '100%', textAlign: 'center', fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Security</div>
              <div style={{position: 'absolute', right: '-5px', top: '45%', fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Liquidity</div>
              <div style={{position: 'absolute', bottom: '15px', right: '5px', fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Adoption</div>
              <div style={{position: 'absolute', bottom: '15px', left: '5px', fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Tokenomics</div>
              <div style={{position: 'absolute', left: '-5px', top: '45%', fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Team</div>
              <div style={{position: 'absolute', top: '15px', right: '5px', fontSize: '9px', color: 'var(--text-muted, #94a3b8)'}}>Technology</div>
              
              {/* SVG 6-Axis Radar Chart */}
              <div style={{width: '90px', height: '90px', transform: 'rotate(-30deg)'}}>
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="var(--border-color, #1e293b)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="22" fill="none" stroke="var(--border-color, #1e293b)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="10" fill="none" stroke="var(--border-color, #1e293b)" strokeWidth="0.5" />
                  {[0, 1, 2, 3, 4, 5].map(i => {
                    const angle = (i * 2 * Math.PI) / 6;
                    return <line key={i} x1="50" y1="50" x2={50 + 35 * Math.sin(angle)} y2={50 - 35 * Math.cos(angle)} stroke="var(--border-color, #1e293b)" strokeWidth="0.5" />;
                  })}
                  <polygon points={radarPoints} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
