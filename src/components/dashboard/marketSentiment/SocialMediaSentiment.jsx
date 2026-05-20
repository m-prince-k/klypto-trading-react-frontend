import React from 'react';

const SocialMediaSentiment = ({ data, getColorClass }) => (
    <div className="binance-card flex-grow-1">
        <div className="card-header pb-2 d-flex align-items-center">
            <span className="title">Social Media Sentiment</span>
            <i className="bi bi-info-circle ms-2 info-icon"></i>
        </div>
        <div className="card-body pt-2 pb-4 position-relative">
            <i className="bi bi-chat-left-dots position-absolute end-0 top-0 me-4 mt-2 text-secondary fs-2 opacity-25"></i>
            <div className="d-flex align-items-baseline mb-3">
                <span className={`fs-2 fw-bold ${getColorClass(data.socialMedia.label)} me-2`}>{data.socialMedia.score}</span>
                <span className={`${getColorClass(data.socialMedia.label)} fw-medium`}>{data.socialMedia.label}</span>
            </div>
            <div className="progress sentiment-progress mb-2">
                <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${data.socialMedia.distribution.neutral}%` }}></div>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${data.socialMedia.distribution.greed}%` }}></div>
                <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${data.socialMedia.distribution.fear}%` }}></div>
            </div>
            <div className="d-flex justify-content-between small text-muted mb-4 mt-2 pb-2 border-bottom border-secondary border-opacity-25">
                <span>{data.socialMedia.distribution.neutral}% Neutral</span>
                <span>{data.socialMedia.distribution.greed}% Greed</span>
                <span>{data.socialMedia.distribution.fear}% Fear</span>
            </div>
            <div className="small text-muted mb-3">Top Trending Coins on Social Media</div>
            <div className="d-flex flex-wrap gap-2 mb-4 mt-2">
                {data.socialMedia.trending.map((t, i) => (
                    <span className="trending-tag" key={i}>#{i + 1} {t}</span>
                ))}
            </div>
            <a href="#" className="text-warning text-decoration-none small fw-medium hover-underline d-inline-flex align-items-center mt-2">
                View more <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-right ms-1" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" /></svg>
            </a>
        </div>
    </div>
);

export default SocialMediaSentiment;