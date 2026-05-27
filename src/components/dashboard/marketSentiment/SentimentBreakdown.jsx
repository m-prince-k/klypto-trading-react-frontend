import React, { useState } from 'react';

const SentimentBreakdown = ({ data }) => {
    const [activeTab, setActiveTab] = useState('All');
    
    // Safely get data for the active tab, defaulting to 0 if not available
    const activeData = data?.breakdown?.[activeTab] || { greed: 0, neutral: 0, fear: 0, extremeFear: 0 };
    
    // Calculate SVG circle properties for donut chart
    const C = 2 * Math.PI * 35; // Circumference (r=35)
    
    const greedLen = (activeData.greed / 100) * C;
    const neutralLen = (activeData.neutral / 100) * C;
    const fearLen = (activeData.fear / 100) * C;
    const extFearLen = (activeData.extremeFear / 100) * C;

    const greedOffset = 0;
    const neutralOffset = -greedLen;
    const fearOffset = -(greedLen + neutralLen);
    const extFearOffset = -(greedLen + neutralLen + fearLen);
    
    return (
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
            <span className={`tab px-2 py-1 rounded ${activeTab === 'All' ? 'active active-purple-toggle' : ''}`} onClick={() => setActiveTab('All')} style={{ cursor: 'pointer' }}>All</span>
            <span className={`tab px-2 py-1 rounded ${activeTab === 'Spot' ? 'active active-purple-toggle' : ''}`} onClick={() => setActiveTab('Spot')} style={{ cursor: 'pointer' }}>Spot</span>
            <span className={`tab px-2 py-1 rounded ${activeTab === 'Futures' ? 'active active-purple-toggle' : ''}`} onClick={() => setActiveTab('Futures')} style={{ cursor: 'pointer' }}>Futures</span>
            <span className={`tab px-2 py-1 rounded ${activeTab === 'Social' ? 'active active-purple-toggle' : ''}`} onClick={() => setActiveTab('Social')} style={{ cursor: 'pointer' }}>Social</span>
        </div>
    </div>
</div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center p-3 gap-3">
                <div className="donut-chart position-relative">
                    <svg viewBox="0 0 100 100" width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#2b3139" strokeWidth="18" />
                        {activeData.greed > 0 && <circle cx="50" cy="50" r="35" fill="none" stroke="#0ecb81" strokeWidth="18" strokeDasharray={`${greedLen} ${C}`} strokeDashoffset={greedOffset} />}
                        {activeData.neutral > 0 && <circle cx="50" cy="50" r="35" fill="none" stroke="#f0b90b" strokeWidth="18" strokeDasharray={`${neutralLen} ${C}`} strokeDashoffset={neutralOffset} />}
                        {activeData.fear > 0 && <circle cx="50" cy="50" r="35" fill="none" stroke="#ff8c00" strokeWidth="18" strokeDasharray={`${fearLen} ${C}`} strokeDashoffset={fearOffset} />}
                        {activeData.extremeFear > 0 && <circle cx="50" cy="50" r="35" fill="none" stroke="#f6465d" strokeWidth="18" strokeDasharray={`${extFearLen} ${C}`} strokeDashoffset={extFearOffset} />}
                    </svg>
                </div>
                {/* Legend below donut */}
                <div className="w-100">
                    <div className="d-flex justify-content-between mb-2 small"><span className="text-muted"><span className="legend-dot bg-success"></span>Greed</span><span className="fw-medium" style={{ color: 'var(--ms-text-main)' }}>{activeData.greed}%</span></div>
                    <div className="d-flex justify-content-between mb-2 small"><span className="text-muted"><span className="legend-dot bg-warning"></span>Neutral</span><span className="fw-medium" style={{ color: 'var(--ms-text-main)' }}>{activeData.neutral}%</span></div>
                    <div className="d-flex justify-content-between mb-2 small"><span className="text-muted"><span className="legend-dot" style={{ backgroundColor: '#ff8c00' }}></span>Fear</span><span className="fw-medium" style={{ color: 'var(--ms-text-main)' }}>{activeData.fear}%</span></div>
                    <div className="d-flex justify-content-between small"><span className="text-muted"><span className="legend-dot bg-danger"></span>Extreme Fear</span><span className="fw-medium" style={{ color: 'var(--ms-text-main)' }}>{activeData.extremeFear}%</span></div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default SentimentBreakdown;