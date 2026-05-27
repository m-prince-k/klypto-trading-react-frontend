import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const SIDEBAR_TIMEFRAMES = ['24H', '7D', '30D'];

export default function SocialSidebar({ sentimentData }) {
  const [timeframe, setTimeframe] = useState('24H');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'trends' | 'influencers' | 'events'
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
            <span>24h</span>
          </div>
        </div>
        <div className="si-widget-section-label">Top Topics</div>
        <div className="si-topics-list">
          {[...(sentimentData?.topics || [])].sort((a, b) => (a?.id || 0) - (b?.id || 0)).slice(0, 5).map((item) => (
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
        <div className="si-widget-link" onClick={() => setModalType('trends')} style={{ cursor: 'pointer' }}>View more trends →</div>
      </div>

      {/* Top Influencers Widget */}
      <div className="si-widget">
        <div className="si-widget-header" style={{ marginBottom: '12px' }}>
          <h3 className="si-widget-title">Top Influencers</h3>
        </div>
        <div className="si-influencers-list text-left">
          {(sentimentData?.influencers || []).slice(0, 5).map((inf, idx) => (
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
        <div className="si-widget-link" onClick={() => setModalType('influencers')} style={{ marginTop: '8px', cursor: 'pointer' }}>View more influencers →</div>
      </div>

      {/* Key Events Widget */}
      <div className="si-widget" style={{ borderBottom: 'none' }}>
        <div className="si-widget-header" style={{ marginBottom: '12px' }}>
          <h3 className="si-widget-title">Latest Key Events</h3>
        </div>
        <div className="si-events-timeline text-left">
          {(sentimentData?.events || []).slice(0, 5).map((ev, idx) => (
            <div key={idx} className="si-timeline-item">
              <div className={`si-timeline-dot ${ev?.dotClass || 'green'}`}></div>
              <div className="si-timeline-content">
                <span className="si-timeline-time">{ev?.time || ''}</span>
                <p className="si-timeline-text">{ev?.text || ''}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="si-widget-link" onClick={() => setModalType('events')} style={{ marginTop: '12px', cursor: 'pointer' }}>View all events →</div>
      </div>

      {/* Modal Overlay */}
      {modalType && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999, padding: '20px'
          }}
          onClick={() => setModalType(null)}
        >
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', color: 'var(--text-main, #131722)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '16px', width: '100%', maxWidth: '500px',
              maxHeight: '80vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {modalType === 'trends' ? 'All Trends' : modalType === 'influencers' ? 'All Influencers' : 'All Key Events'}
                <span style={{ fontSize: '12px', background: 'var(--accent-color, #185fa5)', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>
                  {modalType === 'trends' ? (sentimentData?.topics || []).length : modalType === 'influencers' ? (sentimentData?.influencers || []).length : (sentimentData?.events || []).length}
                </span>
              </h3>
              <button
                onClick={() => setModalType(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {modalType === 'trends' && (
                <div className="si-topics-list">
                  {[...(sentimentData?.topics || [])].sort((a, b) => (a?.id || 0) - (b?.id || 0)).map((item) => (
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
              )}

              {modalType === 'influencers' && (
                <div className="si-influencers-list text-left">
                  {(sentimentData?.influencers || []).map((inf, idx) => (
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
              )}

              {modalType === 'events' && (
                <div className="si-events-timeline text-left" style={{ padding: '8px 4px' }}>
                  {(sentimentData?.events || []).map((ev, idx) => (
                    <div key={idx} className="si-timeline-item" style={{ paddingBottom: '24px' }}>
                      <div className={`si-timeline-dot ${ev?.dotClass || 'green'}`}></div>
                      <div className="si-timeline-content">
                        <span className="si-timeline-time">{ev?.time || ''}</span>
                        <p className="si-timeline-text" style={{ marginTop: '6px' }}>{ev?.text || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
