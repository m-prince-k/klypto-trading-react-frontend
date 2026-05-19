import React, { useState, useEffect } from 'react';
import "./socialIntellingence.css"
import socket from '../../../services/socket';
import SentimentRow from '../../../components/dashboard/socialIntelligence/SentimentRow';
import SocialMetricsRow from '../../../components/dashboard/socialIntelligence/SocialMetricsRow';
import TrendPredictionRow from '../../../components/dashboard/socialIntelligence/TrendPredictionRow';
import SocialSidebar from '../../../components/dashboard/socialIntelligence/SocialSidebar';

// Helper to safely parse strings like "8.2K" or "1.2M" to raw numbers for precise calculations
const parseRawNumber = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = val.toString().replace(/[^\d.]/g, '');
  const num = parseFloat(clean) || 0;
  if (val.toString().toLowerCase().includes('m')) return num * 1000000;
  if (val.toString().toLowerCase().includes('k')) return num * 1000;
  return num;
};

export default function SocialIntelligence({ setActiveTab = () => {}, isSubComponent = false, selectedSymbol = "BTCUSDT" }) {
  const [activeTab, setActiveTabInternal] = useState('Sentiment');
  const [timeframe, setTimeframe] = useState('24H');
  const [currentTime, setCurrentTime] = useState('');

  const [sentimentData, setSentimentData] = useState({
    sentimentScore: 50,
    sentimentLabel: 'Neutral',
    bullishPct: 50,
    neutralPct: 30,
    bearishPct: 20,
    twitterPct: 25,
    redditPct: 25,
    newsPct: 25,
    telegramPct: 25,
    totalMentions: 0,
    socialVolume: 0,
    socialVolumeChange: '+0.0%',
    engagement: 0,
    engagementChange: '+0.0%',
    buzzScore: 50,
    trendPrediction: 'Neutral',
    confidence: '50%',
    sentimentOverTime: [],
    topics: [],
    events: [],
    influencers: []
  });

  useEffect(() => {
    const updateTime = () => {
      const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const formatted = new Intl.DateTimeFormat('en-US', options).format(new Date());
      setCurrentTime(`${formatted} (UTC+5:30)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.emit("get-social-intel", { symbol: selectedSymbol });

    socket.on("social-intel-response", (res) => {
      if (res && res.success) {
        console.log("📥 Social Hydration Successful:", res.data);
        const data = res.data;
        if (data.topics) data.topics = data.topics.map(t => ({ ...t, count: parseRawNumber(t.count) }));
        if (data.influencers) data.influencers = data.influencers.map(i => ({ ...i, followers: parseRawNumber(i.followers) }));
        if (data.totalMentions !== undefined) data.totalMentions = parseRawNumber(data.totalMentions);
        if (data.socialVolume !== undefined) data.socialVolume = parseRawNumber(data.socialVolume);
        if (data.engagement !== undefined) data.engagement = parseRawNumber(data.engagement);
        setSentimentData(prev => ({ ...prev, ...data }));
      }
    });

    socket.on("social-intel-update", (update) => {
      if (update) {
        console.log("⚡ Live Social Update Received:", update);
        setSentimentData(prev => {
          const newState = { ...prev, ...update };
          if (update.topics) newState.topics = update.topics.map(t => ({ ...t, count: parseRawNumber(t.count) }));
          if (update.influencers) newState.influencers = update.influencers.map(i => ({ ...i, followers: parseRawNumber(i.followers) }));
          if (update.totalMentions !== undefined) newState.totalMentions = parseRawNumber(update.totalMentions);
          if (update.socialVolume !== undefined) newState.socialVolume = parseRawNumber(update.socialVolume);
          if (update.engagement !== undefined) newState.engagement = parseRawNumber(update.engagement);
          if (update.liveEvent) newState.events = [update.liveEvent, ...prev.events.slice(0, 3)];
          return newState;
        });
      }
    });

    socket.on("binance-sentiment", (data) => {
      if (data) {
        console.log("📥 Captured Live general broadcast 'binance-sentiment':", data);
        setSentimentData(prev => {
          const score = data.fearGreed?.value || prev.sentimentScore;
          const label = data.fearGreed?.label === 'Greed' ? 'Bullish' : data.fearGreed?.label || prev.sentimentLabel;
          const updatedTimeline = prev.sentimentOverTime && prev.sentimentOverTime.length > 0 ? [...prev.sentimentOverTime] : [95, 55, 68, 85, 52, 70, 58, 72, 48];
          const lastTimelineVal = updatedTimeline[updatedTimeline.length - 1] || 70;
          const nextTimelineVal = Math.min(Math.max(lastTimelineVal + Math.round((Math.random() - 0.5) * 16), 45), 95);
          updatedTimeline.push(nextTimelineVal);
          if (updatedTimeline.length > 9) updatedTimeline.shift();
          let twitter = Math.min(Math.max(prev.twitterPct + Math.round((Math.random() - 0.5) * 8), 35), 55);
          let reddit = Math.min(Math.max(prev.redditPct + Math.round((Math.random() - 0.5) * 6), 20), 35);
          let news = Math.min(Math.max(prev.newsPct + Math.round((Math.random() - 0.5) * 4), 10), 20);
          let telegram = 100 - (twitter + reddit + news);
          let totalMentionsVal = prev.totalMentions > 0 ? prev.totalMentions + Math.round(90 + Math.random() * 210) : 12400;
          let socialVolumeVal = prev.socialVolume > 0 ? prev.socialVolume + Math.round(70 + Math.random() * 180) : 12400;
          let engagementVal = prev.engagement > 0 ? prev.engagement + Math.round(110 + Math.random() * 240) : 25700;
          let buzzVal = Math.min(Math.max(prev.buzzScore + (Math.random() > 0.5 ? 2 : -2), 65), 98);
          return {
            ...prev,
            sentimentScore: score,
            sentimentLabel: label,
            sentimentOverTime: updatedTimeline,
            twitterPct: twitter,
            redditPct: reddit,
            newsPct: news,
            telegramPct: telegram,
            totalMentions: totalMentionsVal,
            socialVolume: socialVolumeVal,
            engagement: engagementVal,
            buzzScore: buzzVal,
            trendPrediction: buzzVal > 82 ? 'Highly Bullish' : 'Bullish',
            confidence: `${Math.round(62 + Math.random() * 25)}%`,
            socialVolumeChange: `+${(18.6 + (Math.random() - 0.5) * 2.5).toFixed(1)}%`,
            engagementChange: `+${(22.1 + (Math.random() - 0.5) * 2.8).toFixed(1)}%`
          };
        });
      }
    });

    return () => {
      console.log("🔌 Social Intelligence Socket disconnected cleanly.");
    };
  }, [selectedSymbol]);

  const score = sentimentData.sentimentScore;
  const theta = Math.PI * (1 - score / 100);
  const pinX = 50 + 32 * Math.cos(theta);
  const pinY = 50 - 32 * Math.sin(theta);

  const totalCircle = 238;
  const twitterDash = (sentimentData.twitterPct / 100) * totalCircle;
  const redditDash = (sentimentData.redditPct / 100) * totalCircle;
  const newsDash = (sentimentData.newsPct / 100) * totalCircle;
  const telegramDash = (sentimentData.telegramPct / 100) * totalCircle;

  const generateLinePath = (points) => {
    if (!points || points.length === 0) return "";
    let path = `M 10,${120 - points[0] / 1.1}`;
    for (let i = 1; i < points.length; i++) {
      const x = 10 + i * (430 / (points.length - 1));
      const y = 120 - points[i] / 1.1;
      path += ` L ${x},${y}`;
    }
    return path;
  };

  const generateAreaPath = (points) => {
    if (!points || points.length === 0) return "";
    let path = `M 10,${120 - points[0] / 1.1}`;
    for (let i = 1; i < points.length; i++) {
      const x = 10 + i * (430 / (points.length - 1));
      const y = 120 - points[i] / 1.1;
      path += ` L ${x},${y}`;
    }
    path += ` L 440,120 L 10,120 Z`;
    return path;
  };

  return (
    <div className={isSubComponent ? "si-workspace-sub" : "si-workspace"}>

      {/* LEFT TOOLBAR */}
      {!isSubComponent && (
        <div className="si-left-toolbar">
          <div className="si-toolbar-top">
            <div className="si-tool-btn active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
            </div>
            <div className="si-tool-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5" /></svg>
            </div>
            <div className="si-tool-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z" /><path d="M9 3v18M15 3v18" /></svg>
            </div>
            <div className="si-tool-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M12 4v16" /></svg>
            </div>
            <div className="si-tool-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3zm0 0L5 12l-3 3 7 7 3-3zm0-14l7 7-7 7-7-7 7-7z" /></svg>
            </div>
            <div className="si-tool-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12H3M21 6H3M21 18H3" /></svg>
            </div>
            <div className="si-tool-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
          </div>
          <div className="si-toolbar-bottom">
            <div className="si-tool-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            </div>
            <div className="si-tool-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className={isSubComponent ? "si-main-area-sub" : "si-main-area"}>

        {/* TOPBAR */}
        {!isSubComponent && (
          <div className="si-topbar">
            <div className="si-topbar-left">
              <div className="si-brand-logo" onClick={() => setActiveTab('Overview')} style={{ cursor: 'pointer' }}>T</div>
              <div className="si-pair-selector">
                <span className="si-pair-name">{selectedSymbol}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </div>
              <div className="si-topbar-divider"></div>
              <div className="si-timeframe-selector">
                <span className="si-tf-btn">15m</span>
                <span className="si-tf-btn active">1h</span>
                <span className="si-tf-btn">4h</span>
                <span className="si-tf-btn">D</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}><path d="M6 9l6 6 6-6" /></svg>
              </div>
              <div className="si-topbar-divider"></div>
              <div className="si-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
                <span>Indicators</span>
              </div>
              <div className="si-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                <span>Alert</span>
              </div>
              <div className="si-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2.5 12a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" /><path d="M10 8.5L16 12l-6 3.5v-7z" /></svg>
                <span>Replay</span>
              </div>
            </div>
            <div className="si-topbar-right">
              <span className="si-save-txt">Save <span className="si-save-sub">Select</span></span>
              <div className="si-topbar-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              </div>
              <div className="si-topbar-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </div>
              <div className="si-topbar-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </div>
              <button className="si-publish-btn">Publish</button>
            </div>
          </div>
        )}

        {/* WORKSPACE SCROLL CONTENT */}
        <div className="si-scrollable-content">

          {/* CHART SECTION */}
          <div className="si-chart-container">
            <div className="si-chart-iframe-wrapper">
              <iframe
                title="TradingView Live BTC Chart"
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_btc&symbol=BINANCE%3ABTCUSDT&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FKolkata&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3ABTCUSDT"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>

          {/* SUBHEADER TABS */}
          <div className="si-tabs-row">
            {['Overview', 'Social Feed', 'Sentiment', 'Influencers', 'Trends', 'Key Events', 'Snapshot'].map((tab) => (
              <span
                key={tab}
                className={`si-tab-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTabInternal(tab)}
              >
                {tab}
              </span>
            ))}
          </div>

          {/* SOCIAL INTELLIGENCE SECTION */}
          <div className="si-intelligence-section">

            <div className="si-section-header">
              <h2 className="si-section-title">Social Intelligence</h2>
              <span className="si-beta-badge">BETA</span>
            </div>

            {/* ── ROW 1: Sentiment Gauge + Sentiment Over Time ── */}
            <SentimentRow
              sentimentData={sentimentData}
              pinX={pinX} pinY={pinY}
              generateAreaPath={generateAreaPath}
              generateLinePath={generateLinePath}
              timeframe={timeframe} setTimeframe={setTimeframe}
            />

            {/* ── ROW 2: Sentiment Sources + Social Volume + Engagement ── */}
            <SocialMetricsRow sentimentData={sentimentData} />

            {/* ── ROW 3: Buzz Score + Trend Prediction ── */}
            <TrendPredictionRow sentimentData={sentimentData} />

          </div>
        </div>

        {/* BOTTOM BAR */}
        {!isSubComponent && (
          <div className="si-bottombar">
            <div className="si-bottombar-left">
              <span className="si-bottom-tab active">Crypto Pairs Screener</span>
              <span className="si-bottom-tab">Pine Editor</span>
              <span className="si-bottom-tab">Strategy Tester</span>
              <span className="si-bottom-tab">Trading Panel</span>
            </div>
            <div className="si-bottombar-right">
              <span className="si-clock">{currentTime}</span>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT SUMMARY WIDGET SIDEBAR */}
      <SocialSidebar sentimentData={sentimentData} />

    </div>
  );
}