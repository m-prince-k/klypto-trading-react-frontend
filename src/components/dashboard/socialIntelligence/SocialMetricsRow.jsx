import React from 'react';

const renderDynamicBars = (dataArray, fillCol) => {
  const data = dataArray && dataArray.length > 0 ? dataArray : [];
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const wStep = 150 / data.length;
  
  return data.map((val, idx) => {
    const h = (val / max) * 40; // reserve 5px for visual padding top
    return (
      <rect
        key={idx}
        x={idx * wStep + (wStep * 0.15)}
        y={45 - h}
        width={wStep * 0.7}
        height={Math.max(h, 2)} // at least 2px height
        fill={fillCol}
        rx="1"
      />
    );
  });
};

export default function SocialMetricsRow({ sentimentData }) {
  const totalCircle = 238;
  const twitterDash = (sentimentData?.twitterPct / 100) * totalCircle;
  const redditDash = (sentimentData?.redditPct / 100) * totalCircle;
  const newsDash = (sentimentData?.newsPct / 100) * totalCircle;
  const telegramDash = (sentimentData?.telegramPct / 100) * totalCircle;

  return (
    <div className="si-grid-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
      {/* Card 3: Sentiment Sources */}
      <div className="si-card" style={{ flex: '1' }}>
        <h4 className="si-card-title">Sentiment Sources</h4>
        <div className="si-sources-body">
          <div className="si-donut-container">
            <svg className="si-donut-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#2563eb" strokeWidth="9" strokeDasharray={`${twitterDash} 238`} strokeDashoffset="0" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="9" strokeDasharray={`${redditDash} 238`} strokeDashoffset={-twitterDash} />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#ec4899" strokeWidth="9" strokeDasharray={`${newsDash} 238`} strokeDashoffset={-(twitterDash + redditDash)} />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="9" strokeDasharray={`${telegramDash} 238`} strokeDashoffset={-(twitterDash + redditDash + newsDash)} />
            </svg>
            <div className="si-donut-center-text">
              <span className="si-donut-val">
                {typeof sentimentData?.totalMentions === 'number' ? (sentimentData?.totalMentions / 1000).toFixed(1) + 'K' : sentimentData?.totalMentions}
              </span>
              <span className="si-donut-lbl">Total Mentions</span>
            </div>
          </div>
          <div className="si-sources-legend">
            <div className="si-source-row"><span className="si-leg-dot" style={{ backgroundColor: '#2563eb' }}></span><span className="si-source-name">Twitter</span><span className="si-source-pct">{sentimentData?.twitterPct}%</span></div>
            <div className="si-source-row"><span className="si-leg-dot" style={{ backgroundColor: '#ef4444' }}></span><span className="si-source-name">Reddit</span><span className="si-source-pct">{sentimentData?.redditPct}%</span></div>
            <div className="si-source-row"><span className="si-leg-dot" style={{ backgroundColor: '#ec4899' }}></span><span className="si-source-name">News</span><span className="si-source-pct">{sentimentData?.newsPct}%</span></div>
            <div className="si-source-row"><span className="si-leg-dot" style={{ backgroundColor: '#f59e0b' }}></span><span className="si-source-name">Telegram</span><span className="si-source-pct">{sentimentData?.telegramPct}%</span></div>
          </div>
        </div>
      </div>

      {/* Card 4: Social Volume */}
      <div className="si-card" style={{ flex: '1' }}>
        <h4 className="si-card-title">Social Volume</h4>
        <div className="si-card-stat-row">
          <span className="si-stat-number">
            {typeof sentimentData?.socialVolume === 'number' ? (sentimentData?.socialVolume / 1000).toFixed(1) + 'K' : sentimentData?.socialVolume}
          </span>
          <span className="si-stat-change positive">{sentimentData?.socialVolumeChange}</span>
        </div>
        <span className="si-stat-comparison">vs last 24h</span>
        <div className="si-barchart-container">
          <svg className="si-barchart-svg" viewBox="0 0 150 45" preserveAspectRatio="none">
            {renderDynamicBars(
              sentimentData?.socialVolumeHistory, 
              "#4f46e5"
            )}
          </svg>
        </div>
      </div>

      {/* Card 5: Engagement */}
      <div className="si-card" style={{ flex: '1' }}>
        <h4 className="si-card-title">Engagement</h4>
        <div className="si-card-stat-row">
          <span className="si-stat-number">
            {typeof sentimentData?.engagement === 'number' ? (sentimentData?.engagement / 1000).toFixed(1) + 'K' : sentimentData?.engagement}
          </span>
          <span className="si-stat-change positive">{sentimentData?.engagementChange}</span>
        </div>
        <span className="si-stat-comparison">vs last 24h</span>
        <div className="si-barchart-container">
          <svg className="si-barchart-svg" viewBox="0 0 150 45" preserveAspectRatio="none">
            {renderDynamicBars(
              sentimentData?.engagementHistory, 
              "#4f46e5"
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
