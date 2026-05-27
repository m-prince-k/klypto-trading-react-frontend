import React, { useState } from 'react';

const NewsSentiment = ({ data, getColorClass }) => {
    const [expanded, setExpanded] = useState(false);
    const allNews = data?.news?.latest || [];
    const displayNews = expanded ? allNews : allNews.slice(0, 4);

    return (
        <div className="binance-card flex-grow-1 h-100">
            <div className="card-header p-4 pb-2 d-flex align-items-center">
                <span className="title">News Sentiment</span>
                <i className="bi bi-info-circle ms-2 info-icon"></i>
            </div>
            <div className="card-body p-4 pt-2 pb-4">
                <div className="d-flex align-items-baseline mb-3">
                    <span className={`fs-2 fw-bold ${getColorClass(data?.news?.label)} me-2`}>{data?.news?.score}</span>
                    <span className={`${getColorClass(data?.news?.label)} fw-medium`}>{data?.news?.label}</span>
                </div>
                <div className="progress sentiment-progress mb-2">
                    <div className="progress-bar bg-success" role="progressbar" style={{ width: `${data?.news?.distribution?.positive}%` }}></div>
                    <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${data?.news?.distribution?.neutral}%` }}></div>
                    <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${data?.news?.distribution?.negative}%` }}></div>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-4 mt-2 pb-2 border-bottom border-secondary border-opacity-25">
                    <span>{data?.news?.distribution?.positive}% Positive</span>
                    <span>{data?.news?.distribution?.neutral}% Neutral</span>
                    <span>{data?.news?.distribution?.negative}% Negative</span>
                </div>
                <div className="small text-muted mb-3">Latest Positive News</div>
                <div className="news-list mb-4 mt-2">
                    {displayNews.map((n, i) => (
                        <div className={`d-flex justify-content-between align-items-center ${i < displayNews.length - 1 ? 'mb-3' : ''}`} key={i}>
                            <div className="news-title text-left me-3 fw-medium">
                                <span className="text-success me-2 fs-6">•</span>{n.title}
                            </div>
                            <div className="text-muted text-right small d-flex gap-1 justify-content-between" style={{ minWidth: '150px' }}>
                                <span>{n.source}</span><span>{n.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {allNews.length > 4 && (
                    <button 
                        className="btn btn-sm btn-link text-accent text-decoration-none p-0 mt-3 d-flex align-items-center justify-content-center w-100" 
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'View less' : 'View all news'}
                        {expanded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-up ms-1" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-down ms-1" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" /></svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default NewsSentiment;