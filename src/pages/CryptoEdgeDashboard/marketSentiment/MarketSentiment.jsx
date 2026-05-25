import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MarketSentiment.css';
import { useSocket } from "../../../services/websocket/useSocket";
import { Spinner } from "../../../components/tradingModals/Spinner";

import MarketSentimentHeader from '../../../components/dashboard/marketSentiment/MarketSentimentHeader';
import OverallMarketSentiment from '../../../components/dashboard/marketSentiment/OverallMarketSentiment';
import MarketSentimentTrend from '../../../components/dashboard/marketSentiment/MarketSentimentTrend';
import SentimentBreakdown from '../../../components/dashboard/marketSentiment/SentimentBreakdown';
import KeySentimentIndicators from '../../../components/dashboard/marketSentiment/KeySentimentIndicators';
import SectorSentiment from '../../../components/dashboard/marketSentiment/SectorSentiment';
import TopGainersLosers from '../../../components/dashboard/marketSentiment/TopGainersLosers';
import SocialMediaSentiment from '../../../components/dashboard/marketSentiment/SocialMediaSentiment';
import NewsSentiment from '../../../components/dashboard/marketSentiment/NewsSentiment';


const getColorClass = (label) => {
    if (label.includes("Greed")) return "text-success";
    if (label.includes("Fear")) return "text-danger";
    return "text-warning";
};

const MarketSentiment = () => {
    const [sentimentData, setSentimentData] = useState(null);

    useSocket({
        setSentimentData: (data) => {
            setSentimentData(data);
        }
    });

    useEffect(() => {
        if (sentimentData) {
            console.log("[MarketSentiment.jsx] WebSocket Response:", sentimentData);
        }
    }, [sentimentData]);

    const data = {
        overall: sentimentData?.overall || (sentimentData?.value ? {
            score: sentimentData.value,
            label: sentimentData.label,
            history: []
        } : null),
        trend: sentimentData?.trend,
        breakdown: sentimentData?.breakdown,
        indicators: sentimentData?.indicators,
        sectors: sentimentData?.sectors,
        topGainers: sentimentData?.topGainers,
        topLosers: sentimentData?.topLosers,
        socialMedia: sentimentData?.socialMedia,
        news: sentimentData?.news,
    };

    if (!sentimentData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <Spinner />
            </div>
        );
    }

    return (
        <div>  {/* removed binance-dashboard-layout class */}
            <div className="ms-content">  {/* replaced dashboard-content */}

                <MarketSentimentHeader />

                {/* Top Row */}
                <div className="row g-3 mb-3">
                    {data.overall && <OverallMarketSentiment data={data} getColorClass={getColorClass} />}
                    {data.trend && <MarketSentimentTrend data={data} />}
                    {data.breakdown && <SentimentBreakdown data={data} />}
                </div>

                {data.indicators && <KeySentimentIndicators data={data} getColorClass={getColorClass} />}

                {/* Bottom Row */}
                <div className="row g-3">
                    {data.sectors && <SectorSentiment data={data} getColorClass={getColorClass} />}
                    {(data.topGainers || data.topLosers) && <TopGainersLosers data={data} getColorClass={getColorClass} />}
                </div>

                {/* Social and News Row */}
                <div className="row g-3 mt-1">
                    {data.socialMedia && (
                        <div className="col-lg-6">
                            <SocialMediaSentiment data={data} getColorClass={getColorClass} />
                        </div>
                    )}
                    {data.news && (
                        <div className="col-lg-6">
                            <NewsSentiment data={data} getColorClass={getColorClass} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketSentiment;