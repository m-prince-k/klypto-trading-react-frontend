import React from 'react';
import SharedCandlestickChart from '../../chart/SharedCandlestickChart';

export default function FinancialPerformanceChart({
  price,
  change24h,
  klines,
  selectedPeriod,
  setSelectedPeriod,
  volume24h,
  formatNum,
  formatLarge,
  changeColor
}) {
  return (
    <div className="fin-col-4">
      <div className="fin-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="fin-card-title"><span className="icon">📊</span> 4. PRICE PERFORMANCE & CHARTS</div>
        <div className="fin-chart-filters" style={{ marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['15m','1h','4h','1d','1w','1M'].map(p => (
            <span 
              key={p} 
              className={`fin-chart-filter ${selectedPeriod === p ? 'active' : ''}`}
              style={{
                cursor: 'pointer', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '10px',
                fontWeight: selectedPeriod === p ? '600' : '500',
                backgroundColor: selectedPeriod === p ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                color: selectedPeriod === p ? '#ffffff' : '#94a3b8',
                border: '1px solid',
                borderColor: selectedPeriod === p ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase'
              }} 
              onClick={() => setSelectedPeriod(p)}
            >
              {p}
            </span>
          ))}
        </div>

        {/* Shared Lightweight Chart */}
        <SharedCandlestickChart 
          klines={klines} 
          minHeight="300px" 
        />

        <div style={{textAlign:'right', fontSize:'10px', color:'#94a3b8', marginTop:'8px'}}>
          24h Volume: ${formatLarge(volume24h)}
        </div>
      </div>
    </div>
  );
}
