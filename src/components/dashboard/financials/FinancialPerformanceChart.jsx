import React from 'react';

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
      <div className="fin-card">
        <div className="fin-card-title"><span className="icon">📊</span> 4. PRICE PERFORMANCE & CHARTS</div>
        <div className="fin-chart-filters">
          {['1D','7D','1M','3M','6M','1Y','ALL'].map(p => (
            <span 
              key={p} 
              className={`fin-chart-filter ${selectedPeriod === p ? 'active' : ''}`}
              style={{cursor:'pointer'}} 
              onClick={() => setSelectedPeriod(p)}
            >
              {p}
            </span>
          ))}
        </div>
        <div style={{position: 'absolute', right: '25px', top: '55px', textAlign: 'right'}}>
          <div style={{fontSize: '9px', color: '#94a3b8'}}>Current Price</div>
          <div style={{fontSize: '16px', fontWeight: 'bold'}} className={changeColor}>${formatNum(price, 2, 4)}</div>
        </div>

        {/* Real Klines SVG Chart */}
        <div className="fin-chart-mock" style={{marginTop: '8px'}}>
          {klines.length > 1 ? (() => {
            const closes = klines.map(k => k.close);
            const minP = Math.min(...closes), maxP = Math.max(...closes);
            const range = maxP - minP || 1;
            const pts = closes.map((c, i) => {
              const x = (i / (closes.length - 1)) * 100;
              const y = 38 - ((c - minP) / range) * 36;
              return `${x},${y}`;
            });
            const lineD = 'M' + pts.join(' L');
            const areaD = lineD + ` L100,40 L0,40 Z`;
            const stroke = closes[closes.length-1] >= closes[0] ? '#10b981' : '#ef4444';
            const fill   = closes[closes.length-1] >= closes[0] ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
            return (
              <svg className="fin-chart-svg" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d={areaD} fill={fill} />
                <path d={lineD} fill="none" stroke={stroke} strokeWidth="1.5" />
              </svg>
            );
          })() : (
            <div style={{color:'#334155', fontSize:'10px', textAlign:'center', paddingTop:'40px'}}>Loading chart...</div>
          )}
        </div>

        {/* X-axis dates */}
        {klines.length > 1 && (
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'8px', color:'#64748b', marginTop:'4px'}}>
            {[0, Math.floor(klines.length/4), Math.floor(klines.length/2), Math.floor(klines.length*3/4), klines.length-1]
              .map(i => (
                <span key={i}>
                  {new Date(klines[i].time * 1000).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                </span>
              ))}
          </div>
        )}

        {/* Real Volume Bars */}
        <div style={{height:'28px', marginTop:'10px', display:'flex', alignItems:'flex-end', gap:'1px'}}>
          {(klines.length > 1 ? klines : Array.from({length:45}, () => null)).map((k, i) => {
            const isGreen = k ? k.close >= k.open : Math.random() > 0.4;
            const vols = klines.map(x => x.volume);
            const maxV = Math.max(...vols, 1);
            const h = k ? Math.max(8, (k.volume / maxV) * 100) : Math.max(8, Math.random()*100);
            return <div key={i} style={{flex:1, backgroundColor: isGreen ? '#10b981' : '#ef4444', height:`${h}%`}}></div>;
          })}
        </div>
        <div style={{textAlign:'right', fontSize:'8px', color:'#94a3b8', marginTop:'2px'}}>
          24h Volume: ${formatLarge(volume24h)}
        </div>
      </div>
    </div>
  );
}
