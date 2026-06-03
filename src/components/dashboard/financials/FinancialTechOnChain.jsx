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
      <div className="fin-col-5" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* 6. FINANCIAL METRICS (ON-CHAIN) */}
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">⛓️</span> 5. FINANCIAL METRICS (ON-CHAIN)</div>
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
          </div>
        </div>

        {/* 5. TECHNOLOGY & FUNDAMENTALS */}
        <div className="fin-card">
          <div className="fin-card-title"><span className="icon">⚙️</span> 6. TECHNOLOGY & FUNDAMENTALS</div>
          <div className="fin-list">
            <div className="fin-list-item"><span className="fin-list-label">Blockchain</span><span className="fin-list-val">{fundamentals?.blockchain || 'N/A'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Smart Contract</span><span className="fin-list-val">{fundamentals?.smartContractStatus && fundamentals.smartContractStatus !== 'N/A (L1 Asset)' && <span className="text-green">✓ </span>}{fundamentals?.smartContractStatus || 'N/A'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Audit Firm</span><span className="fin-list-val">{fundamentals?.auditFirm || 'N/A'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Security Score</span><span className="fin-list-val">{fundamentals?.securityScore || 'N/A'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Block Height</span><span className="fin-list-val text-green">{fundamentals?.blockHeight != null ? formatNum(fundamentals.blockHeight, 0, 0) : 'N/A'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Active Nodes</span><span className="fin-list-val">{fundamentals?.activeValidators != null ? formatNum(fundamentals.activeValidators, 0, 0) : 'N/A'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">Avg Network Fee</span><span className="fin-list-val text-yellow">{fundamentals?.gasPrice || 'N/A'}</span></div>
            <div className="fin-list-item"><span className="fin-list-label">GitHub Commits (24h)</span><span className="fin-list-val">{fundamentals?.devCommits != null ? fundamentals.devCommits : 'N/A'}</span></div>
          </div>
          <div style={{marginTop: '12px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px'}}>
              <span className="fin-list-label">Roadmap Progress</span>
              <span className="fin-list-val">{fundamentals?.progress}%</span>
            </div>
            <div className="fin-progress-bar">
              <div className="fin-progress-fill" style={{width: `${fundamentals?.progress}%`, backgroundColor: '#10b981'}}></div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
