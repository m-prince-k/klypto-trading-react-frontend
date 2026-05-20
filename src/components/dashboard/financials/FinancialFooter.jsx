import React from 'react';

export default function FinancialFooter() {
  return (
    <div className="fin-footer">
      <div className="fin-footer-title">KEY PARAMETERS TO JUDGE COIN MOVEMENT</div>
      <div className="fin-footer-grid">
        <div className="fin-footer-col">
          <h4>1. MARKET & LIQUIDITY</h4>
          <div className="fin-footer-list">
            <div className="fin-footer-item"><span className="text-green">✓</span> Market Cap</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> 24h Volume</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Liquidity Depth</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Bid/Ask Spread</div>
          </div>
        </div>
        <div className="fin-footer-col">
          <h4>2. TOKENOMICS</h4>
          <div className="fin-footer-list">
            <div className="fin-footer-item"><span className="text-green">✓</span> Total Supply</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Circulating Supply</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Token Utility</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Vesting Schedule</div>
          </div>
        </div>
        <div className="fin-footer-col">
          <h4>3. ON-CHAIN METRICS</h4>
          <div className="fin-footer-list">
            <div className="fin-footer-item"><span className="text-green">✓</span> TVL</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Active Addresses</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Transaction Volume</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Holder Distribution</div>
          </div>
        </div>
        <div className="fin-footer-col">
          <h4>4. TECHNOLOGY</h4>
          <div className="fin-footer-list">
            <div className="fin-footer-item"><span className="text-green">✓</span> Blockchain Infrastructure</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Smart Contract Security</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Code Quality</div>
            <div className="fin-footer-item"><span className="text-green">✓</span> Audit Reports</div>
          </div>
        </div>
        <div className="fin-footer-col" style={{flex: 1.2}}>
          <h4 style={{color: 'var(--text-main, #fff)', textAlign: 'center'}}>FINAL JUDGEMENT FACTORS</h4>
          <div className="fin-footer-list" style={{gap: '8px', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px'}}>
            <div className="fin-footer-item"><div style={{width:'14px', height:'14px', borderRadius:'50%', background:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontSize:'8px', fontWeight:'bold'}}>A</div> <span style={{color: 'var(--text-main, #fff)', fontSize: '9px'}}>Adoption Potential</span></div>
            <div className="fin-footer-item"><div style={{width:'14px', height:'14px', borderRadius:'50%', background:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontSize:'8px', fontWeight:'bold'}}>U</div> <span style={{color: 'var(--text-main, #fff)', fontSize: '9px'}}>Real Use Case</span></div>
            <div className="fin-footer-item"><div style={{width:'14px', height:'14px', borderRadius:'50%', background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontSize:'8px', fontWeight:'bold'}}>R</div> <span style={{color: 'var(--text-main, #fff)', fontSize: '9px'}}>Risk vs Reward</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
