import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MarketSentiment.css';
import socket from '../../../services/websocket/socket';

import MarketSentimentHeader from '../../../components/dashboard/marketSentiment/MarketSentimentHeader';
import OverallMarketSentiment from '../../../components/dashboard/marketSentiment/OverallMarketSentiment';
import MarketSentimentTrend from '../../../components/dashboard/marketSentiment/MarketSentimentTrend';
import SentimentBreakdown from '../../../components/dashboard/marketSentiment/SentimentBreakdown';
import KeySentimentIndicators from '../../../components/dashboard/marketSentiment/KeySentimentIndicators';
import SectorSentiment from '../../../components/dashboard/marketSentiment/SectorSentiment';
import TopGainersLosers from '../../../components/dashboard/marketSentiment/TopGainersLosers';
import SocialMediaSentiment from '../../../components/dashboard/marketSentiment/SocialMediaSentiment';
import NewsSentiment from '../../../components/dashboard/marketSentiment/NewsSentiment';

const DEFAULT_DATA = {
    overall: {
        score: 68, label: "Greed", history: [
            { time: "Now", score: 68, label: "Greed" },
            { time: "Yesterday", score: 62, label: "Greed" },
            { time: "Last Week", score: 55, label: "Neutral" },
            { time: "Last Month", score: 48, label: "Neutral" }
        ]
    },
    trend: { currentValue: 68, labels: ["May 10", "May 11", "May 12", "May 13", "May 14", "May 15", "May 16"], dataPoints: [60, 65, 55, 70, 62, 68, 68] },
    breakdown: { greed: 68, neutral: 20, fear: 8, extremeFear: 4 },
    indicators: {
        btcDominance: { value: "54.2%", label: "Greed" },
        fundingRate: { value: "0.010%", label: "Greed" },
        tradingVolume: { value: "$68.45B", label: "Greed" },
        volatility: { value: "2.45%", label: "Neutral" },
        derivativesVolume: { value: "$132.56B", label: "Greed" }
    },
    sectors: [
        { name: "DeFi", icon: "bi-gem", sentimentScore: 72, sentimentLabel: "Greed", value: "$48.32B", trendUp: true },
        { name: "Layer 1", icon: "bi-layers", sentimentScore: 69, sentimentLabel: "Greed", value: "$92.15B", trendUp: true },
        { name: "Layer 2", icon: "bi-stack", sentimentScore: 63, sentimentLabel: "Greed", value: "$16.78B", trendUp: true },
        { name: "Meme", icon: "bi-emoji-smile", sentimentScore: 58, sentimentLabel: "Neutral", value: "$12.45B", trendUp: false },
        { name: "AI", icon: "bi-cpu", sentimentScore: 75, sentimentLabel: "Greed", value: "$18.67B", trendUp: true },
        { name: "Gaming", icon: "bi-controller", sentimentScore: 61, sentimentLabel: "Greed", value: "$8.34B", trendUp: true },
        { name: "Web3", icon: "bi-globe2", sentimentScore: 66, sentimentLabel: "Greed", value: "$9.21B", trendUp: true }
    ],
    topGainers: [
        { rank: 1, coin: "FET", iconUrl: "https://cryptologos.cc/logos/fetch-ai-fet-logo.png?v=029", sentimentScore: 72, sentimentLabel: "Greed", change24h: "+8.45%" },
        { rank: 2, coin: "RNDR", iconUrl: "https://cryptologos.cc/logos/render-token-rndr-logo.png?v=029", sentimentScore: 70, sentimentLabel: "Greed", change24h: "+6.23%" },
        { rank: 3, coin: "AGIX", iconUrl: "https://cryptologos.cc/logos/singularitynet-agix-logo.png?v=029", sentimentScore: 69, sentimentLabel: "Greed", change24h: "+7.12%" },
        { rank: 4, coin: "GRT", iconUrl: "https://cryptologos.cc/logos/the-graph-grt-logo.png?v=029", sentimentScore: 68, sentimentLabel: "Greed", change24h: "+5.34%" },
        { rank: 5, coin: "OCEAN", iconUrl: "https://cryptologos.cc/logos/ocean-protocol-ocean-logo.png?v=029", sentimentScore: 67, sentimentLabel: "Greed", change24h: "+4.65%" }
    ],
    topLosers: [
        { rank: 1, coin: "LUNC", iconUrl: "https://cryptologos.cc/logos/terra-luna-lunc-logo.png?v=029", sentimentScore: 25, sentimentLabel: "Fear", change24h: "-6.45%" },
        { rank: 2, coin: "PEPE", iconUrl: "https://cryptologos.cc/logos/pepe-pepe-logo.png?v=029", sentimentScore: 30, sentimentLabel: "Fear", change24h: "-5.32%" },
        { rank: 3, coin: "ARDR", iconUrl: "https://cryptologos.cc/logos/ardor-ardr-logo.png?v=029", sentimentScore: 32, sentimentLabel: "Fear", change24h: "-4.65%" },
        { rank: 4, coin: "WAVES", iconUrl: "https://cryptologos.cc/logos/waves-waves-logo.png?v=029", sentimentScore: 35, sentimentLabel: "Fear", change24h: "-3.91%" },
        { rank: 5, coin: "NKN", iconUrl: "https://cryptologos.cc/logos/nkn-nkn-logo.png?v=029", sentimentScore: 40, sentimentLabel: "Fear", change24h: "-3.22%" }
    ],
    socialMedia: {
        score: 60, label: "Neutral", distribution: { neutral: 60, greed: 25, fear: 15 },
        trending: ["PEPE", "DOGE", "SHIB", "FLOKI", "BONK"]
    },
    news: {
        score: 62, label: "Greed", distribution: { positive: 62, neutral: 23, negative: 15 },
        latest: [
            { title: "BlackRock files for Bitcoin ETF options trading", source: "CoinDesk", time: "2h ago" },
            { title: "Ethereum upgrade Pectra goes live on testnet", source: "The Block", time: "4h ago" },
            { title: "Binance Launchpad announces new project", source: "Binance Blog", time: "6h ago" }
        ]
    }
};

const getColorClass = (label) => {
    if (label.includes("Greed")) return "text-success";
    if (label.includes("Fear")) return "text-danger";
    return "text-warning";
};

const MarketSentiment = () => {
    const [sentimentData, setSentimentData] = useState(null);

    useEffect(() => {
        socket.on("connect", () => console.log("✅ Successfully connected to Market Sentiment WebSocket"));
        socket.on("connect_error", (error) => console.error("❌ WebSocket Connection Error:", error.message));
        socket.on("market-sentiment-data", (data) => setSentimentData(data));
        return () => { socket.off("market-sentiment-data"); };
    }, []);

    const data = sentimentData || DEFAULT_DATA;

    return (
        <div>  {/* removed binance-dashboard-layout class */}
            <div className="ms-content">  {/* replaced dashboard-content */}

                <MarketSentimentHeader />

                {/* Top Row */}
                <div className="row g-3 mb-3">
                    <OverallMarketSentiment data={data} getColorClass={getColorClass} />
                    <MarketSentimentTrend data={data} />
                    <SentimentBreakdown data={data} />
                </div>

                <KeySentimentIndicators data={data} getColorClass={getColorClass} />

                {/* Bottom Row */}
                <div className="row g-3">
                    <SectorSentiment data={data} getColorClass={getColorClass} />
                    <TopGainersLosers data={data} getColorClass={getColorClass} />

                    <div className="col-lg-3 d-flex flex-column gap-3">
                        <SocialMediaSentiment data={data} getColorClass={getColorClass} />
                        <NewsSentiment data={data} getColorClass={getColorClass} />
                    </div>
                </div>

                <div className="footer-disclaimer mt-5 mb-2 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between text-muted extremely-small">
                    <div className="pe-4">Market sentiment is calculated based on multiple data points including price momentum, trading volume, social media activity, and more.</div>
                    <div className="text-end ps-4">Disclaimer: Market sentiment is for informational purposes only and does not constitute financial advice. Cryptocurrency investments are subject to high market risk. Please do your own research.</div>
                </div>

            </div>
        </div>
    );
};

export default MarketSentiment;