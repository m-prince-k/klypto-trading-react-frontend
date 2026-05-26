import React from 'react';

const SentimentBreakdown = ({ data }) => (
    <div className="col-lg-3">
        <div className="binance-card h-100">
           <div className="card-header pb-2">
    <div className="d-flex flex-column">
        <div className="d-flex align-items-center mb-2">
            <span className="title">Sentiment Breakdown</span>
            <i className="bi bi-info-circle ms-2 info-icon"></i>
        </div>
        <div className="breakdown-tabs d-flex align-items-center extremely-small text-muted bg-dark-layer rounded p-1"
             style={{ flexWrap: 'wrap', gap: '3px' }}>
            <span className="tab active text-white bg-secondary px-2 py-1 rounded">All</span>
            <span className="tab px-2 py-1">Spot</span>
            <span className="tab px-2 py-1">Futures</span>
            <span className="tab px-2 py-1">Social</span>
        </div>
    </div>
</div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center p-3 gap-3">
                <div className="donut-chart position-relative">
                    <svg viewBox="0 0 100 100" width="110" height="110">
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#2b3139" strokeWidth="18" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#0ecb81" strokeWidth="18" strokeDasharray="149 220" strokeDashoffset="-15" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#f0b90b" strokeWidth="18" strokeDasharray="44 220" strokeDashoffset="-164" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#ff8c00" strokeWidth="18" strokeDasharray="17 220" strokeDashoffset="-208" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#f6465d" strokeWidth="18" strokeDasharray="10 220" strokeDashoffset="-5" />
                    </svg>
                </div>
                {/* Legend below donut */}
                <div className="w-100">
                    <div className="d-flex justify-content-between mb-2 small"><span className="text-muted"><span className="legend-dot bg-success"></span>Greed</span><span className="fw-medium" style={{ color: 'var(--ms-text-main)' }}>{data?.breakdown?.greed}%</span></div>
                    <div className="d-flex justify-content-between mb-2 small"><span className="text-muted"><span className="legend-dot bg-warning"></span>Neutral</span><span className="fw-medium" style={{ color: 'var(--ms-text-main)' }}>{data?.breakdown?.neutral}%</span></div>
                    <div className="d-flex justify-content-between mb-2 small"><span className="text-muted"><span className="legend-dot" style={{ backgroundColor: '#ff8c00' }}></span>Fear</span><span className="fw-medium" style={{ color: 'var(--ms-text-main)' }}>{data?.breakdown?.fear}%</span></div>
                    <div className="d-flex justify-content-between small"><span className="text-muted"><span className="legend-dot bg-danger"></span>Extreme Fear</span><span className="fw-medium" style={{ color: 'var(--ms-text-main)' }}>{data?.breakdown?.extremeFear}%</span></div>
                </div>
            </div>
        </div>
    </div>
);

export default SentimentBreakdown;