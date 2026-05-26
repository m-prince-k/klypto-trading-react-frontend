import React from 'react';

const OnChainCharts = ({
  dateRangePreset,
  setDateRangePreset,
  yAxisLabels,
  areaPath,
  linePath,
  lastCircleX,
  lastCircleY,
  xAxisLabels,
  history,
  displayTvl,
  donutStyle,
  data,
  displayChains,
  isFiltered,
  setActiveModal,
  setModalSearch
}) => {
  return (
    <div className="charts-row">
      {/* Chart 1: TVL Over Time */}
      <div className="chart-card tvl-over-time">
        <div className="card-header">
          <div className="card-title">TVL Over Time <i className="icon-info"></i></div>
          <div className="chart-filters">
            <span
              className={dateRangePreset === 'Last 7 Days' ? 'active' : ''}
              onClick={() => setDateRangePreset('Last 7 Days')}
            >
              7D
            </span>
            <span
              className={dateRangePreset === 'Last 30 Days' ? 'active' : ''}
              onClick={() => setDateRangePreset('Last 30 Days')}
            >
              30D
            </span>
            <span
              className={dateRangePreset === 'Last 90 Days' ? 'active' : ''}
              onClick={() => setDateRangePreset('Last 90 Days')}
            >
              90D
            </span>
            <span
              className={dateRangePreset === 'Custom' ? 'active' : ''}
            >
              Custom
            </span>
          </div>
        </div>
        <div className="chart-body">
          {/* Mocking the Area Chart with SVG */}
          <div className="y-axis">
            {yAxisLabels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
          <div className="chart-area">
            <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="main-area-chart">
              <defs>
                <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
                  <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#tvlGradient)" />
              <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="3" />

              <circle cx={lastCircleX} cy={lastCircleY} r="4" fill="#6366f1" stroke="#fff" strokeWidth="2" />
            </svg>
            <div className="x-axis">
              {xAxisLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
            {/* Tooltip Mock */}
            <div className="chart-tooltip">
              <div className="tooltip-date">{history[history.length - 1]?.date || 'Today'}</div>
              <div className="tooltip-value"><span className="dot"></span> TVL: ${displayTvl}B</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: TVL by Chain */}
      <div className="chart-card tvl-by-chain">
        <div className="card-header">
          <div className="card-title">TVL by Chain 
          </div>
        </div>
        <div className="donut-body">
          <div className="donut-chart-wrapper">
            <div className="donut-chart" style={donutStyle}>
              {/* CSS Donut Chart */}
            </div>
            <div className="donut-center">
              <div className="donut-value">${data?.stats?.tvl}B</div>
              <div className="donut-label">Total</div>
            </div>
          </div>
          <div className="donut-legend">
            {displayChains.map((c, i) => (
              <div className="legend-item" key={i}>
                <span className="dot" style={{ backgroundColor: c.color }}></span>
                <span className="l-name">{c.chain}</span>
                <span className="l-pct">{c.dom}</span>
                <span className="l-val">(${c.tvl}B)</span>
              </div>
            ))}
            {!isFiltered && (
              <>
                <div className="legend-item"><span className="dot c-opt"></span> <span className="l-name">Optimism</span> <span className="l-pct">2.4%</span> <span className="l-val">($2.05B)</span></div>
                <div className="legend-item"><span className="dot c-oth"></span> <span className="l-name">Others</span> <span className="l-pct">9.9%</span> <span className="l-val">($8.45B)</span></div>
              </>
            )}
          </div>
        </div>
        <div className="card-footer-link" onClick={() => { setActiveModal('chains'); setModalSearch(''); }}>
          View all chains &rarr;
        </div>
      </div>

      {/* Chart 3: Top Protocols */}
      <div className="chart-card top-protocols">
        <div className="card-header">
          <div className="card-title">Top Protocols <i className="icon-info"></i></div>
          <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); setActiveModal('protocols'); setModalSearch(''); }}>View all</a>
        </div>
        <div className="protocols-list">
          <div className="p-list-header">
            <span>Protocol</span>
            <span>TVL</span>
          </div>

          {data?.protocols?.slice(0, 8).map(p => (
            <div className="p-list-item" key={p.n}>
              <div className="p-num">{p.n}</div>
              <div className="p-icon" style={{ backgroundColor: p.color }}></div>
              <div className="p-name">{p.name}</div>
              <div className="p-val-container">
                <span className="p-val-text">${p.val}B</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card-footer-link" style={{ marginTop: 'auto' }} onClick={() => { setActiveModal('protocols'); setModalSearch(''); }}>
          View all protocols &rarr;
        </div>
      </div>
    </div>
  );
};

export default OnChainCharts;
