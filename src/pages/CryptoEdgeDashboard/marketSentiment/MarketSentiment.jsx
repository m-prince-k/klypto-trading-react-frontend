import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MarketSentiment.css';
import { useSocket } from "../../../services/websocket/useSocket";
import socket from "../../../services/websocket/socket";
import EVENTS from "../../../services/websocket/socketEvents";
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
    if (!label || typeof label !== 'string') return "text-warning";
    if (label?.includes("Greed")) return "text-success";
    if (label?.includes("Fear")) return "text-danger";
    return "text-warning";
};

const MarketSentiment = ({ selectedSymbol }) => {
    const [sentimentData, setSentimentData] = useState(null);

    useSocket({
        setSentimentData: (data) => {
            setSentimentData(data);
        },
        selectedSymbol
    });

    useEffect(() => {
        if (sentimentData) {
            console.log("[MarketSentiment.jsx] WebSocket Response:", sentimentData);
        }
    }, [sentimentData]);



    const actualData = sentimentData?.data ? sentimentData.data : sentimentData;

    const data = {
        overall: actualData?.overall || (actualData?.value ? {
            score: actualData?.value,
            label: actualData?.label,
            history: []
        } : null),
        trend: actualData?.trend,
        breakdown: actualData?.breakdown,
        indicators: actualData?.indicators,
        sectors: actualData?.sectors,
        topGainers: actualData?.topGainers,
        topLosers: actualData?.topLosers,
        socialMedia: actualData?.socialMedia,
        news: actualData?.news,
    };

    const isLoading = !sentimentData;

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
            <div style={{
                filter: isLoading ? 'blur(4px)' : 'none',
                opacity: isLoading ? 0.6 : 1,
                pointerEvents: isLoading ? 'none' : 'auto'
            }}>  {/* removed binance-dashboard-layout class */}
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
                </div>

                {/* Social and News Row */}
                <div className="row g-3 mt-1">
                    {/* {data?.socialMedia && ( */}
                        <div className="col-lg-6">
                            <SocialMediaSentiment data={data} getColorClass={getColorClass} />
                        </div>
                    {/* )} */}
                    {/* {data?.news && ( */}
                        <div className="col-lg-6">
                            <NewsSentiment data={data} getColorClass={getColorClass} />
                        </div>
                    {/* )} */}
                </div>
            </div>
            </div>
        </div>
    );
};

export default MarketSentiment;