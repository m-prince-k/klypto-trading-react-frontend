import React, { useState, useMemo } from 'react';

const MarketSentimentTrend = ({ data }) => {
    const [activeRange, setActiveRange] = useState('7D');

    const trendData = data?.trend?.[activeRange] || { labels: [], dataPoints: [] };
    const { labels, dataPoints } = trendData;

    // SVG coordinate generation
    const svgWidth = 500;
    const svgHeight = 120;
    
    const { linePath, areaPath, lastPoint } = useMemo(() => {
        if (!dataPoints || dataPoints.length === 0) {
            return { linePath: '', areaPath: '', lastPoint: { x: 0, y: 0, val: 0 } };
        }

        const pts = dataPoints.map((val, i) => {
            const x = dataPoints.length > 1 ? (i / (dataPoints.length - 1)) * svgWidth : 0;
            const y = svgHeight - (val / 100) * svgHeight;
            return { x, y, val };
        });

        const lPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        const aPath = `${lPath} L${svgWidth},${svgHeight} L0,${svgHeight} Z`;
        
        return { linePath: lPath, areaPath: aPath, lastPoint: pts[pts.length - 1] };
    }, [dataPoints, svgWidth, svgHeight]);

    // X-axis label generation (show max 7 labels evenly distributed)
    const displayLabels = useMemo(() => {
        if (!labels || labels.length === 0) return [];
        const maxLabels = 7;
        if (labels.length <= maxLabels) return labels;
        
        const step = (labels.length - 1) / (maxLabels - 1);
        const result = [];
        for (let i = 0; i < maxLabels; i++) {
            result.push(labels[Math.round(i * step)]);
        }
        return result;
    }, [labels]);

    return (
        <div className="col-lg-5">
            <div className="binance-card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <span className="title">Market Sentiment Trend</span>
                        <i className="bi bi-info-circle ms-2 info-icon"></i>
                    </div>
                    <div className="time-filters d-flex gap-1 bg-dark-layer p-1 rounded">
                        {['7D', '30D', '90D', '1Y'].map(range => (
                            <span 
                                key={range}
                                className={`filter-btn ${activeRange === range ? 'active' : ''}`}
                                onClick={() => setActiveRange(range)}
                                style={{ cursor: 'pointer' }}
                            >
                                {range}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="card-body pt-0 position-relative d-flex flex-column">
                    <div className="chart-placeholder flex-grow-1 position-relative" style={{ minHeight: "180px" }}>
                        <div className="position-absolute end-0 top-0 h-100 d-flex flex-column justify-content-between text-muted extremely-small pb-5 pt-2 pe-3 text-end" style={{ zIndex: 1, width: '30px' }}>
                            <div>100</div><div>75</div><div>50</div><div>25</div><div>0</div>
                        </div>
                        <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-between text-muted extremely-small ps-3 pe-5 pb-2">
                            {displayLabels.map((l, i) => <div key={i}>{l}</div>)}
                        </div>
                        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="ps-2 pe-5 pb-5 pt-2">
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0ecb81" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#0ecb81" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            {[...Array(4)].map((_, i) => (
                                <line key={i} x1="0" y1={(i + 1) * 24} x2="500" y2={(i + 1) * 24} stroke="#2b3139" strokeWidth="1" strokeDasharray="2,2" />
                            ))}
                            
                            {dataPoints.length > 0 && (
                                <>
                                    <path d={areaPath} fill="url(#areaGradient)" />
                                    <path d={linePath} fill="none" stroke="#0ecb81" strokeWidth={dataPoints.length > 90 ? "1" : "2"} />
                                    <rect x={svgWidth - 20} y={Math.max(0, lastPoint.y - 7)} width="20" height="14" rx="2" fill="#0ecb81" />
                                    <text x={svgWidth - 10} y={Math.max(0, lastPoint.y - 7) + 10} fill="#181a20" fontSize="10" fontWeight="bold" textAnchor="middle">
                                        {lastPoint.val}
                                    </text>
                                </>
                            )}
                        </svg>
                    </div>
                    <div className="trend-legend d-flex justify-content-between mt-auto text-muted extremely-small pt-3 pb-2 px-2 border-top border-secondary border-opacity-25">
                        <div className="d-flex align-items-center"><span className="legend-dot bg-danger"></span>0-25 Extreme Fear</div>
                        <div className="d-flex align-items-center"><span className="legend-dot" style={{ backgroundColor: '#ff8c00' }}></span>25-50 Fear</div>
                        <div className="d-flex align-items-center"><span className="legend-dot bg-warning"></span>50-75 Neutral</div>
                        <div className="d-flex align-items-center"><span className="legend-dot bg-success"></span>75-100 Greed</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketSentimentTrend;