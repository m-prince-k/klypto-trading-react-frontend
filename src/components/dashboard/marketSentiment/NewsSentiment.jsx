import React from 'react';

const NewsSentiment = ({ data, getColorClass }) => (
    <div className="binance-card flex-grow-1">
        <div className="card-header pb-2 d-flex align-items-center">
            <span className="title">News Sentiment</span>
            <i className="bi bi-info-circle ms-2 info-icon"></i>
        </div>
        <div className="card-body pt-2 pb-4">
            <div className="d-flex align-items-baseline mb-3">
                <span className={`fs-2 fw-bold ${getColorClass(data.news.label)} me-2`}>{data.news.score}</span>
                <span className={`${getColorClass(data.news.label)} fw-medium`}>{data.news.label}</span>
            </div>
            <div className="progress sentiment-progress mb-2">
                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${data.news.distribution.positive}%` }}></div>
                <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${data.news.distribution.neutral}%` }}></div>
                <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${data.news.distribution.negative}%` }}></div>
            </div>
            <div className="d-flex justify-content-between extremely-small text-muted mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                <span>{data.news.distribution.positive}% Positive</span>
                <span>{data.news.distribution.neutral}% Neutral</span>
                <span>{data.news.distribution.negative}% Negative</span>
            </div>
            <div className="extremely-small text-muted mb-3">Latest Positive News</div>
            <div className="news-list mb-4">
                {data.news.latest.map((n, i) => (
                    <div className={`d-flex justify-content-between align-items-center ${i < data.news.latest.length - 1 ? 'mb-3' : ''}`} key={i}>
                        <div className="news-title text-truncate me-3 fw-medium">
                            <span className="text-success me-2 fs-6">•</span>{n.title}
                        </div>
                        <div className="text-muted extremely-small d-flex justify-content-between" style={{ minWidth: '100px' }}>
                            <span>{n.source}</span><span>{n.time}</span>
                        </div>
                    </div>
                ))}
            </div>
            <a href="#" className="text-warning text-decoration-none small fw-medium hover-underline d-inline-flex align-items-center mt-1">
                View all news <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-right ms-1" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" /></svg>
            </a>
        </div>
    </div>
);

export default NewsSentiment;