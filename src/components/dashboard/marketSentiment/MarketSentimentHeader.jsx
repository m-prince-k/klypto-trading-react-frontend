import React from 'react';

const MarketSentimentHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
            <h2 className="text-white fs-4 mb-1 text-left">Market Sentiment</h2>
            <p className="text-muted small mb-0">Real-time overview of the crypto market sentiment.</p>
        </div>
        <div>
            <span className="text-muted small me-2 cursor-pointer hover-white d-flex align-items-center">
                Share <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-share ms-2" viewBox="0 0 16 16"><path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" /></svg>
            </span>
        </div>
    </div>
);

export default MarketSentimentHeader;