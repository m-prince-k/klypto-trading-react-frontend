import React from 'react';

export default function SocialSidebar({ sentimentData }) {
  return (
    <div className="si-right-sidebar">
      {/* Top Topics Widget */}
      <div className="si-widget">
        <div className="si-widget-header">
          <h3 className="si-widget-title">Social Summary</h3>
          <div className="si-widget-dropdown">
            <span>24H</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </div>
        <div className="si-widget-section-label">Top Topics</div>
        <div className="si-topics-list">
          {(sentimentData.topics || []).map((item) => (
            <div key={item?.id || Math.random()} className="si-topic-item">
              <div className="si-topic-left">
                <span className="si-topic-num">{item?.id || ''}</span>
                <div className="si-topic-name-wrap">
                  <span className="si-topic-name">{item?.topic || ''}</span>
                  <span className={`si-badge ${(item?.status || 'Trending').toLowerCase()}`}>{item?.status || 'Trending'}</span>
                </div>
              </div>
              <span className="si-topic-mentions">
                {typeof item?.count === 'number' ? (item.count / 1000).toFixed(1) + 'K mentions' : (item?.count || '0')}
              </span>
            </div>
          ))}
        </div>
        <div className="si-widget-link">View more trends →</div>
      </div>

      {/* Top Influencers Widget */}
      <div className="si-widget">
        <div className="si-widget-header" style={{ marginBottom: '12px' }}>
          <h3 className="si-widget-title">Top Influencers</h3>
        </div>
        <div className="si-influencers-list text-left">
          {(sentimentData.influencers || []).map((inf, idx) => (
            <div key={idx} className="si-influencer-item">
              <div className="si-inf-left">
                <div className="si-inf-avatar" style={{ backgroundColor: inf?.color || '#3b82f6' }}>{inf?.avatar || 'I'}</div>
                <div className="si-inf-details">
                  <span className="si-inf-name">{inf?.name || ''}</span>
                  <span className="si-inf-handle">{inf?.handle || ''}</span>
                  <span className="si-inf-followers">
                    {typeof inf?.followers === 'number' ? (inf.followers / 1000000).toFixed(2) + 'M Followers' : (inf?.followers || '0')}
                  </span>
                </div>
              </div>
              <span className="si-bullish-badge">{inf?.sentiment || 'Bullish'}</span>
            </div>
          ))}
        </div>
        <div className="si-widget-link" style={{ marginTop: '8px' }}>View more influencers →</div>
      </div>

      {/* Key Events Widget */}
      <div className="si-widget" style={{ borderBottom: 'none' }}>
        <div className="si-widget-header" style={{ marginBottom: '12px' }}>
          <h3 className="si-widget-title">Latest Key Events</h3>
        </div>
        <div className="si-events-timeline text-left">
          {(sentimentData.events || []).map((ev, idx) => (
            <div key={idx} className="si-timeline-item">
              <div className={`si-timeline-dot ${ev?.dotClass || 'green'}`}></div>
              <div className="si-timeline-content">
                <span className="si-timeline-time">{ev?.time || ''}</span>
                <p className="si-timeline-text">{ev?.text || ''}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="si-widget-link" style={{ marginTop: '12px' }}>View all events →</div>
      </div>
    </div>
  );
}
