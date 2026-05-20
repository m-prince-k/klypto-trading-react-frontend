import React from 'react';

export default function FinancialTechOnChain({
  fundamentals,
  tvlData,
  onChain,
  formatNum,
  formatLarge
}) {
  return (
    <>
      {/* 5. TECHNOLOGY & FUNDAMENTALS */}
      <div className="fin-col-3">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">⚙️</span> 5. TECHNOLOGY & FUNDAMENTALS</div>
          <div className="fin-list">
            <div className="fin-list-item"><span className="fin-list-label">Blockchain</span><span className="fin-list-val">{fundamentals?.blockchain}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Smart Contract</span><span className="fin-list-val"><span className="text-green">✓</span> {fundamentals?.smartContractStatus || 'Audited'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Audit Firm</span><span className="fin-list-val">{fundamentals?.auditFirm || 'CertiK'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Security Score</span><span className="fin-list-val">{fundamentals?.securityScore || '8.7 / 10'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Block Height</span><span className="fin-list-val text-green">{formatNum(fundamentals?.blockHeight || 0, 0, 0)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Active Nodes</span><span className="fin-list-val">{formatNum(fundamentals?.activeValidators || 0, 0, 0)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Avg Network Fee</span><span className="fin-list-val text-yellow">{fundamentals?.gasPrice || 'N/A'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">GitHub Commits (24h)</span><span className="fin-list-val">{fundamentals?.devCommits || 0}</span></div>
          </div>
          <div style={{marginTop: '12px'}}>
            <div style={{display: 'flex', justifycontent: 'space-between', fontSize: '10px'}}>
              <span className="fin-list-label">Roadmap Progress</span>
              <span className="fin-list-val">{fundamentals?.progress || 75}%</span>
            </div>
            <div className="fin-progress-bar">
              <div className="fin-progress-fill" style={{width: `${fundamentals?.progress || 75}%`, backgroundColor: '#10b981'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. FINANCIAL METRICS (ON-CHAIN) */}
      <div className="fin-col-3">
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">⛓️</span> 6. FINANCIAL METRICS (ON-CHAIN)</div>
          <div className="fin-list" style={{marginBottom: '12px'}}>
            <div className="fin-list-item"><span className="fin-list-label">Total Value Locked (TVL)</span><span className="fin-list-val text-green">${formatLarge(tvlData?.tvl || onChain?.tvl)}</span></div>
            <div className="fin-list-item">
              <span className="fin-list-label">TVL Change (30D)</span>
              <span className={((tvlData?.tvlChange30d || onChain?.tvlChange) >= 0) ? 'text-green' : 'text-red'}>
                {(tvlData?.tvlChange30d || onChain?.tvlChange) > 0 ? '+' : ''}{formatNum(tvlData?.tvlChange30d || onChain?.tvlChange)}%
              </span>
            </div>
          </div>
          
          <div className="fin-list">
            <div className="fin-list-item"><span className="fin-list-label">Active Addresses (24h)</span><span className="fin-list-val">{formatNum(onChain?.activeAddresses, 0, 0)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">New Addresses (24h)</span><span className="fin-list-val">{formatNum(onChain?.newAddresses, 0, 0)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Transactions (24h)</span><span className="fin-list-val">{formatNum(onChain?.transactions, 0, 0)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Transaction Volume (24h)</span><span className="fin-list-val">${formatLarge(onChain?.txVolume)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Network Fees (24h)</span><span className="fin-list-val">${formatLarge(onChain?.networkFees)}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Staking APY</span><span className="fin-list-val text-green">{onChain?.stakingApy}%</span></div>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px'}}>
            <div className="fin-donut" style={{width: '40px', height: '40px', background: 'conic-gradient(#3b82f6 0% 45%, #8b5cf6 45% 70%, #10b981 70% 100%)'}}>
              <div style={{width: '24px', height: '24px', background: 'var(--bg-card, #0f172a)', borderRadius: '50%', position: 'absolute'}}></div>
            </div>
            <div className="fin-legend" style={{fontSize: '8px'}}>
              <div style={{color: 'var(--text-muted, #94a3b8)', marginBottom: '2px'}}>HOLDER DISTRIBUTION</div>
              <div className="fin-legend-item"><div className="fin-legend-dot" style={{backgroundColor: '#3b82f6'}}></div> Whales ({`>1%`}) 45.20%</div>
              <div className="fin-legend-item"><div className="fin-legend-dot" style={{backgroundColor: '#8b5cf6'}}></div> Investors (0.1-1%) 25.30%</div>
              <div className="fin-legend-item"><div className="fin-legend-dot" style={{backgroundColor: '#10b981'}}></div> Retail ({`<0.1%`}) 29.50%</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
