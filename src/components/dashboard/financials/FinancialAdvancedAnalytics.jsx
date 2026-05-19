import React from 'react';

export default function FinancialAdvancedAnalytics({
  price,
  change24h,
  fundamentals,
  indicators,
  predictions,
  starsStr,
  ratingVal,
  ratingText,
  onChain,
  formatNum,
  formatLarge
}) {
  return (
    <>
      {/* 9. TEAM & INVESTORS */}
      <div className="fin-col-3">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">👥</span> 9. TEAM & INVESTORS</div>
          
          <div style={{display: 'flex', gap: '16px'}}>
            <div style={{flex: 1}}>
              <div style={{fontSize: '9px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase'}}>CORE TEAM</div>
              <div className="fin-list" style={{gap: '12px'}}>
                {fundamentals?.team?.slice(0, 4).map((member, i) => (
                  <div key={i} className="d-flex-center justify-content-between">
                    <div className="d-flex-center">
                      <div className="fin-team-avatar d-flex-center justify-content-center" style={{fontSize:'12px'}}>👨‍💻</div>
                      <div>
                        <div style={{color: '#fff', fontSize: '11px', fontWeight: 'bold'}}>{member.name}</div>
                        <div style={{color: '#94a3b8', fontSize: '9px'}}>{member.role}</div>
                      </div>
                    </div>
                    <div style={{color: '#3b82f6', background: '#1e3a8a', padding: '2px 4px', borderRadius: '4px', fontSize: '9px'}}>in</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{flex: 1}}>
              <div style={{fontSize: '9px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase'}}>INVESTORS</div>
              <div className="fin-list" style={{gap: '12px'}}>
                {fundamentals?.investors?.slice(0, 5).map((inv, i) => (
                  <div key={i} className="d-flex-center">
                    <span style={{color: ['#f59e0b','#3b82f6','#8b5cf6','#10b981','#f43f5e'][i%5], marginRight: '6px'}}>{inv.charAt(0)}</span> 
                    <span style={{color: '#fff', fontSize: '10px'}}>{inv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. ADVANCED ANALYTICS & INDICATORS */}
      <div className="fin-col-5">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">📈</span> 10. ADVANCED ANALYTICS & INDICATORS</div>
          <div style={{display: 'flex', gap: '20px'}}>
            <div style={{flex: 1}}>
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>INDICATOR</th>
                    <th style={{textAlign: 'right'}}>VALUE</th>
                    <th style={{textAlign: 'right'}}>SIGNAL</th>
                  </tr>
                </thead>
                <tbody>
                  {indicators && (
                    <>
                      <tr>
                        <td>RSI (14)</td>
                        <td style={{textAlign: 'right'}}>{indicators.rsi}</td>
                        <td style={{textAlign: 'right'}} className={indicators.rsiSignal.includes('Bullish') ? 'text-green' : (indicators.rsiSignal.includes('Bearish') || indicators.rsiSignal.includes('Overbought') ? 'text-red' : 'text-yellow')}>{indicators.rsiSignal}</td>
                      </tr>
                      <tr>
                        <td>MACD</td>
                        <td style={{textAlign: 'right'}}>{parseFloat(indicators.macd).toFixed(2)}</td>
                        <td style={{textAlign: 'right'}} className={indicators.macdSignal === 'Bullish' ? 'text-green' : indicators.macdSignal === 'Bearish' ? 'text-red' : 'text-yellow'}>{indicators.macdSignal}</td>
                      </tr>
                      <tr>
                        <td>Moving Avg (50)</td>
                        <td style={{textAlign: 'right'}}>${formatNum(indicators.sma50, 2, 4)}</td>
                        <td style={{textAlign: 'right'}} className={Number(price) > Number(indicators.sma50) ? 'text-green' : 'text-red'}>{Number(price) > Number(indicators.sma50) ? 'Above' : 'Below'}</td>
                      </tr>
                      <tr>
                        <td>Moving Avg (200)</td>
                        <td style={{textAlign: 'right'}}>${formatNum(indicators.sma200, 2, 4)}</td>
                        <td style={{textAlign: 'right'}} className={Number(price) > Number(indicators.sma200) ? 'text-green' : 'text-red'}>{Number(price) > Number(indicators.sma200) ? 'Above' : 'Below'}</td>
                      </tr>
                      {indicators.bbUpper && (
                        <tr>
                          <td>Bollinger Bands</td>
                          <td style={{textAlign: 'right'}}>${formatNum(indicators.bbUpper, 2, 4)}</td>
                          <td style={{textAlign: 'right'}} className={indicators.bbSignal === 'Bullish' ? 'text-green' : indicators.bbSignal === 'Overbought' ? 'text-red' : 'text-yellow'}>{indicators.bbSignal}</td>
                        </tr>
                      )}
                      {indicators.adx && (
                        <tr>
                          <td>ADX (14)</td>
                          <td style={{textAlign: 'right'}}>{indicators.adx}</td>
                          <td style={{textAlign: 'right'}} className={indicators.adxSignal === 'Strong' ? 'text-green' : 'text-yellow'}>{indicators.adxSignal}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            
            <div style={{flex: 1, borderLeft: '1px solid #1e293b', paddingLeft: '20px'}}>
              <div style={{fontSize: '9px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase'}}>PRICE PREDICTION MODEL</div>
              {predictions && (
                <table className="fin-table">
                  <thead>
                    <tr>
                      <th>TIME FRAME</th>
                      <th style={{textAlign: 'right'}}>MIN PRICE</th>
                      <th style={{textAlign: 'right'}}>AVG PRICE</th>
                      <th style={{textAlign: 'right'}}>MAX PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>7 Days</td>
                      <td style={{textAlign: 'right'}}>${formatNum(predictions.p7d.min, 2, 4)}</td>
                      <td style={{textAlign: 'right'}} className="text-green">${formatNum(predictions.p7d.avg, 2, 4)}</td>
                      <td style={{textAlign: 'right'}}>${formatNum(predictions.p7d.max, 2, 4)}</td>
                    </tr>
                    <tr>
                      <td>30 Days</td>
                      <td style={{textAlign: 'right'}}>${formatNum(predictions.p30d.min, 2, 4)}</td>
                      <td style={{textAlign: 'right'}} className="text-green">${formatNum(predictions.p30d.avg, 2, 4)}</td>
                      <td style={{textAlign: 'right'}}>${formatNum(predictions.p30d.max, 2, 4)}</td>
                    </tr>
                    <tr>
                      <td>90 Days</td>
                      <td style={{textAlign: 'right'}}>${formatNum(predictions.p90d.min, 2, 4)}</td>
                      <td style={{textAlign: 'right'}} className="text-green">${formatNum(predictions.p90d.avg, 2, 4)}</td>
                      <td style={{textAlign: 'right'}}>${formatNum(predictions.p90d.max, 2, 4)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
              
              <div style={{marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase'}}>CONFIDENCE LEVEL</span>
                <span style={{color: '#fff', fontWeight: 'bold'}}>78%</span>
              </div>
              <div className="fin-progress-bar" style={{height: '8px', marginTop: '6px'}}>
                <div className="fin-progress-fill" style={{width: '78%', backgroundColor: '#f59e0b'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 11. SUMMARY & OUTLOOK */}
      <div className="fin-col-4">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">📋</span> 11. SUMMARY & OUTLOOK</div>
          
          <div style={{display: 'flex', gap: '20px'}}>
            <div style={{flex: 1.5}}>
              <div style={{fontSize: '9px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase'}}>KEY HIGHLIGHTS</div>
              <div className="fin-list" style={{gap: '12px'}}>
                <div className="d-flex-center"><span className="text-green" style={{marginRight: '8px'}}>✓</span> <span style={{color: '#e2e8f0', fontSize: '11px'}}>Consensus: {fundamentals?.consensus} ({fundamentals?.blockchain})</span></div>
                <div className="d-flex-center"><span className="text-green" style={{marginRight: '8px'}}>✓</span> <span style={{color: '#e2e8f0', fontSize: '11px'}}>On-Chain: {formatNum(onChain?.transactions, 0, 0)} live tx / {formatNum(onChain?.activeAddresses, 0, 0)} active users</span></div>
                <div className="d-flex-center"><span className="text-green" style={{marginRight: '8px'}}>✓</span> <span style={{color: '#e2e8f0', fontSize: '11px'}}>Dev Activity: {fundamentals?.devActivity || 'High'} ({fundamentals?.progress || 75}% Progress)</span></div>
                <div className="d-flex-center"><span className="text-green" style={{marginRight: '8px'}}>✓</span> <span style={{color: '#e2e8f0', fontSize: '11px'}}>Key Investor: {fundamentals?.investors?.[0] || 'Tier-1 VCs'}</span></div>
              </div>
            </div>
            
            <div style={{flex: 1, borderLeft: '1px solid #1e293b', paddingLeft: '20px'}}>
              <div style={{fontSize: '9px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase'}}>OUTLOOK</div>
              <div className="fin-list" style={{gap: '12px'}}>
                <div className="fin-list-item"><span style={{color: '#cbd5e1', fontSize: '10px'}}>Short Term</span><span className={change24h > 0 ? "text-green" : "text-red"} style={{fontWeight: 'bold', fontSize: '11px'}}>{change24h > 0 ? 'Bullish' : 'Bearish'}</span></div>
                <div className="fin-list-item"><span style={{color: '#cbd5e1', fontSize: '10px'}}>Mid Term</span><span className={indicators?.macdSignal === 'Bullish' || change24h > 2 ? "text-green" : "text-yellow"} style={{fontWeight: 'bold', fontSize: '11px'}}>{indicators?.macdSignal === 'Bullish' || change24h > 2 ? 'Bullish' : 'Neutral'}</span></div>
              </div>
              
              <div style={{marginTop: '30px'}}>
                <div style={{fontSize: '9px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase'}}>OVERALL RATING</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{color: '#f59e0b', fontSize: '14px'}}>{starsStr}</div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{color: '#fff', fontWeight: 'bold', fontSize: '14px'}}>{ratingVal.toFixed(1)} / 5</div>
                    <div className="text-green" style={{fontSize: '10px', fontWeight: 'bold'}}>{ratingText}</div>
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
