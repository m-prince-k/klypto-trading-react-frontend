import React from 'react';

const OverallMarketSentiment = ({ data, getColorClass }) => (
    <div className="col-lg-4">
        <div className="binance-card h-100">
            <div className="card-header d-flex align-items-center">
                <span className="title">Overall Market Sentiment</span>
                <i className="bi bi-info-circle ms-2 info-icon"></i>
            </div>
           <div className="card-body d-flex pt-0 align-items-center" style={{ minHeight: '200px' }}>
    <div className="gauge-container position-relative flex-grow-1 d-flex justify-content-center align-items-end pb-3 pt-3">
        <svg viewBox="0 0 200 110" className="gauge-svg" style={{ width: '100%', maxWidth: '180px' }}>
            {/* SVG unchanged */}
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

export default OverallMarketSentiment;