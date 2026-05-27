import React, { useState, useRef, useEffect } from 'react';

const SIDEBAR_TIMEFRAMES = ['24H', '7D', '30D'];

export default function SocialSidebar({ sentimentData }) {
  const [timeframe, setTimeframe] = useState('24H');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="si-right-sidebar">
      {/* Top Topics Widget */}
      <div className="si-widget">
        <div className="si-widget-header">
          <h3 className="si-widget-title">Social Summary</h3>
          <div
            className="si-widget-dropdown"
            ref={dropdownRef}
            onClick={() => setDropdownOpen(o => !o)}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <span>{timeframe}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '6px', zIndex: 100, minWidth: '70px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                overflow: 'hidden',
              }}>
                {SIDEBAR_TIMEFRAMES.map(tf => (
                  <div
                    key={tf}
                    onClick={(e) => { e.stopPropagation(); setTimeframe(tf); setDropdownOpen(false); }}
                    style={{
                      padding: '8px 14px', fontSize: '12px', cursor: 'pointer',
                      color: tf === timeframe ? 'var(--color-primary, #6366f1)' : 'var(--text-muted)',
                      fontWeight: tf === timeframe ? '600' : '400',
                      background: tf === timeframe ? 'rgba(99,102,241,0.1)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (tf !== timeframe) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (tf !== timeframe) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {tf}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="si-widget-section-label">Top Topics</div>
        <div className="si-topics-list">
          {(sentimentData?.topics || []).slice(0,5).map((item) => (
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
          {(sentimentData?.influencers || []).slice(0,5).map((inf, idx) => (
            <div key={idx} className="si-influencer-item">
              <div className="si-inf-left">
                {inf?.avatar?.startsWith('http') ? (
                  <img
                    src={inf.avatar}
                    alt={inf?.name || 'Influencer'}
                    className="si-inf-avatar"
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="si-inf-avatar"
                  style={{
                    backgroundColor: inf?.color || '#3b82f6',
                    display: inf?.avatar?.startsWith('http') ? 'none' : 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '11px', color: '#fff',
                  }}
                >
                  {inf?.name?.charAt(0)?.toUpperCase() || 'I'}
                </div>
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
          {(sentimentData?.events || []).slice(0,5).map((ev, idx) => (
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
