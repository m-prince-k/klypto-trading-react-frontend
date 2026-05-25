import React from 'react';

const OverallMarketSentiment = ({ data, getColorClass }) => {
    console.log("OverallMarketSentiment data:", data);
    return (
    <div className="col-lg-4">
        <div className="binance-card h-100">
            <div className="card-header d-flex align-items-center">
                <span className="title">Overall Market Sentiment</span>
                <i className="bi bi-info-circle ms-2 info-icon"></i>
            </div>
           <div className="card-body d-flex pt-0 align-items-center" style={{ minHeight: '200px', gap: '12px' }}>
    <div className="gauge-container position-relative flex-grow-1 d-flex justify-content-center align-items-end pb-3 pt-3">
        <svg viewBox="0 0 200 110" className="gauge-svg" style={{ width: '100%', maxWidth: '180px' }}>
            <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f6465d" />
                    <stop offset="35%" stopColor="#f0b90b" />
                    <stop offset="65%" stopColor="#f0b90b" />
                    <stop offset="100%" stopColor="#0ecb81" />
                </linearGradient>
            </defs>
            {/* Background Track */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="round" />
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1f2937" strokeWidth="18" strokeLinecap="round" style={{ opacity: 'var(--gauge-track-opacity, 0)' }} />
            {/* Gradient Arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="18" strokeDasharray={`${(data.overall.score / 100) * 251.2} 251.2`} strokeLinecap="round" />
            
            {/* Needle — dark stroke with white outline so visible on both themes */}
            <g transform={`rotate(${ (data.overall.score / 100) * 180 - 90 }, 100, 100)`}>
                <line x1="100" y1="100" x2="100" y2="30" stroke="white" strokeWidth="7" strokeLinecap="round" />
                <line x1="100" y1="100" x2="100" y2="30" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
                <circle cx="100" cy="100" r="9" fill="white" />
                <circle cx="100" cy="100" r="6" fill="#374151" />
            </g>
        </svg>
        <div className="gauge-labels position-absolute w-100 d-flex justify-content-between px-3" style={{ bottom: '0' }}>
            <div className="text-center">
                <div className="small fw-medium" style={{color:'var(--ms-text-main)'}}>0</div>
                <div className="text-danger extremely-small">Extreme Fear</div>
            </div>
            <div className="text-center" style={{ marginTop: '-35px' }}>
                <div className={`display-5 fw-bold ${getColorClass(data.overall.label)}`} style={{ lineHeight: '1' }}>{data.overall.score}</div>
                <div className={`${getColorClass(data.overall.label)} fs-6 mt-1`}>{data.overall.label}</div>
            </div>
            <div className="text-center">
                <div className="small fw-medium" style={{color:'var(--ms-text-main)'}}>100</div>
                <div className="text-success extremely-small">Extreme Greed</div>
            </div>
        </div>
    </div>
    {/* Fixed-width history column */}
    <div className="sentiment-history ps-3 border-start border-secondary d-flex flex-column justify-content-center"
         style={{ minWidth: '110px', maxWidth: '110px' }}>
        {data.overall.history.map((h, i) => (
            <div className="mb-3" key={i}>
                <div className="text-muted extremely-small mb-1">{h.time}</div>
                <div className={`${getColorClass(h.label)} small fw-medium`}>{h.score} {h.label}</div>
            </div>
        ))}
    </div>
</div>
        </div>
    </div>
    );
};

export default OverallMarketSentiment;