import React from 'react';

const MarketSentimentTrend = ({ data }) => (
    <div className="col-lg-5">
        <div className="binance-card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                    <span className="title">Market Sentiment Trend</span>
                    <i className="bi bi-info-circle ms-2 info-icon"></i>
                </div>
                <div className="time-filters d-flex gap-1 bg-dark-layer p-1 rounded">
                    <span className="filter-btn active">7D</span>
                    <span className="filter-btn">30D</span>
                    <span className="filter-btn">90D</span>
                    <span className="filter-btn">1Y</span>
                </div>
            </div>
            <div className="card-body pt-0 position-relative d-flex flex-column">
                <div className="chart-placeholder flex-grow-1 position-relative" style={{ minHeight: "140px" }}>
                    <div className="position-absolute end-0 top-0 h-100 d-flex flex-column justify-content-between text-muted extremely-small pb-3 pe-1 text-end" style={{ zIndex: 1 }}>
                        <div>100</div><div>75</div><div>50</div><div>25</div><div>0</div>
                    </div>
                    <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-between text-muted extremely-small px-2 pe-5 pb-1">
                        <div>May 10</div><div>May 11</div><div>May 12</div><div>May 13</div><div>May 14</div><div>May 15</div><div>May 16</div>
                    </div>
                    <svg width="100%" height="100%" viewBox="0 0 500 120" preserveAspectRatio="none" className="pe-4 pb-3 pt-2">
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ecb81" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#0ecb81" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <line x1="0" y1="24" x2="500" y2="24" stroke="#2b3139" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="0" y1="48" x2="500" y2="48" stroke="#2b3139" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="0" y1="72" x2="500" y2="72" stroke="#2b3139" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="0" y1="96" x2="500" y2="96" stroke="#2b3139" strokeWidth="1" strokeDasharray="2,2" />
                        <path d="M0,100 L40,80 L80,75 L120,65 L160,55 L200,60 L240,40 L280,50 L320,60 L360,55 L400,65 L440,55 L480,45 L500,50 L500,120 L0,120 Z" fill="url(#areaGradient)" />
                        <path d="M0,100 L40,80 L80,75 L120,65 L160,55 L200,60 L240,40 L280,50 L320,60 L360,55 L400,65 L440,55 L480,45 L500,50" fill="none" stroke="#0ecb81" strokeWidth="2.5" />
                        <rect x="480" y="40" width="20" height="14" rx="2" fill="#0ecb81" />
                        <text x="490" y="50" fill="#181a20" fontSize="10" fontWeight="bold" textAnchor="middle">{data?.trend?.currentValue}</text>
                    </svg>
                </div>
                <div className="trend-legend d-flex justify-content-between mt-auto text-muted extremely-small pt-2 border-top border-secondary border-opacity-25">
                    <div className="d-flex align-items-center"><span className="legend-dot bg-danger"></span>0-25 Extreme Fear</div>
                    <div className="d-flex align-items-center"><span className="legend-dot" style={{ backgroundColor: '#ff8c00' }}></span>25-50 Fear</div>
                    <div className="d-flex align-items-center"><span className="legend-dot bg-warning"></span>50-75 Neutral</div>
                    <div className="d-flex align-items-center"><span className="legend-dot bg-success"></span>75-100 Greed</div>
                </div>
            </div>
        </div>
    </div>
);

export default MarketSentimentTrend;