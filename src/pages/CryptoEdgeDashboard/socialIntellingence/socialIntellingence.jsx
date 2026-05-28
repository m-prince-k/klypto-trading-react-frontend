import React, { useState, useEffect } from 'react';
import "./socialIntellingence.css"
import { useSocket } from '../../../services/websocket/useSocket';
import { useTheme } from '../../../context/ThemeContext';
import SentimentRow from '../../../components/dashboard/socialIntelligence/SentimentRow';
import SocialMetricsRow from '../../../components/dashboard/socialIntelligence/SocialMetricsRow';
import TrendPredictionRow from '../../../components/dashboard/socialIntelligence/TrendPredictionRow';
import SocialSidebar from '../../../components/dashboard/socialIntelligence/SocialSidebar';
import { Spinner } from "../../../components/tradingModals/Spinner";

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

export default function SocialIntelligence({ setActiveTab = () => { }, isSubComponent = false, selectedSymbol = "BTCUSDT" }) {
  const { theme } = useTheme();
  const tvTheme = theme === 'dark' ? 'dark' : 'light';
  const [activeTab, setActiveTabInternal] = useState('Sentiment');
  const [timeframe, setTimeframe] = useState('24H');
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);

  const [sentimentData, setSentimentData] = useState(null);

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

  useSocket({
    selectedSymbol,
    setSocialStats: (updater) => {
        setSentimentData(prev => {
            // Resolve the new data whether it's a direct object or a functional updater
            const resolvedData = typeof updater === 'function' ? updater(prev) : updater;
            if (!resolvedData) return prev;

            if (!prev) {
                // Initial load
                const data = { ...resolvedData };
                if (data?.topics) data.topics = data?.topics.map(t => ({ ...t, count: parseRawNumber(t.count) }));
                if (data?.influencers) data.influencers = data?.influencers.map(i => ({ ...i, followers: parseRawNumber(i.followers) }));
                if (data?.totalMentions !== undefined) data.totalMentions = parseRawNumber(data?.totalMentions);
                if (data?.socialVolume !== undefined) data.socialVolume = parseRawNumber(data?.socialVolume);
                if (data?.engagement !== undefined) data.engagement = parseRawNumber(data?.engagement);
                setLoading(false);
                return data;
            }
            // Update
            const newState = { ...prev, ...resolvedData };
            if (resolvedData.topics) newState.topics = resolvedData.topics.map(t => ({ ...t, count: parseRawNumber(t.count) }));
            if (resolvedData.influencers) newState.influencers = resolvedData.influencers.map(i => ({ ...i, followers: parseRawNumber(i.followers) }));
            if (resolvedData.totalMentions !== undefined) newState.totalMentions = parseRawNumber(resolvedData.totalMentions);
            if (resolvedData.socialVolume !== undefined) newState.socialVolume = parseRawNumber(resolvedData.socialVolume);
            if (resolvedData.engagement !== undefined) newState.engagement = parseRawNumber(resolvedData.engagement);
            if (resolvedData.liveEvent) newState.events = [resolvedData.liveEvent, ...(prev.events || []).slice(0, 3)];
            return newState;
        });
    }
  });

  const isLoading = loading || !sentimentData;

  const score = sentimentData?.sentimentScore;
  const theta = Math.PI * (1 - score / 100);
  const pinX = 50 + 32 * Math.cos(theta);
  const pinY = 50 - 32 * Math.sin(theta);

  const totalCircle = 238;
  const twitterDash = (sentimentData?.twitterPct / 100) * totalCircle;
  const redditDash = (sentimentData?.redditPct / 100) * totalCircle;
  const newsDash = (sentimentData?.newsPct / 100) * totalCircle;
  const telegramDash = (sentimentData?.telegramPct / 100) * totalCircle;

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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999
        }}>
          <Spinner />
        </div>
      )}
      <div 
        className={isSubComponent ? "si-workspace-sub" : "si-workspace"}
        style={{
          filter: isLoading ? 'blur(4px)' : 'none',
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto'
        }}
      >


      {/* MAIN CONTAINER */}
      <div className={isSubComponent ? "si-main-area-sub" : "si-main-area"}>

        {/* WORKSPACE SCROLL CONTENT */}
        <div className="si-scrollable-content">

          {/* CHART SECTION */}
          <div className="si-chart-container">
            <div className="si-chart-iframe-wrapper">
              <iframe
                title="TradingView Live Chart"
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_btc&symbol=BINANCE%3A${selectedSymbol}&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=${tvTheme}&style=1&timezone=Asia%2FKolkata&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3A${selectedSymbol}`}
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
    </div>
  );
}