import React from "react";
import AdvancedMetricsGrid from "../../../components/dashboard/overview/AdvancedMetricsGrid";
import ChartAndOrderBook from "../../../components/dashboard/overview/ChartAndOrderBook";
import SocialFinancialGrid from "../../../components/dashboard/overview/SocialFinancialGrid";
import HeatmapArbitrageGrid from "../../../components/dashboard/overview/HeatmapArbitrageGrid";
import { Spinner } from "../../../components/tradingModals/Spinner";

export default function Overview({
  marketMetrics,
  fearGreed,
  socialStats,
  prices,
  selectedSymbol,
  orderBook,
  tvlData,
  tvContainerRef,
  financials,
  arbitrage,
  alerts,
  activeTab,
  sentimentData
}) {
  const getBaseSymbol = (sym) => {
    if (!sym) return "";
    if (sym.endsWith("USDT")) return sym.slice(0, -4);
    if (sym.endsWith("BUSD")) return sym.slice(0, -4);
    if (sym.endsWith("USDC")) return sym.slice(0, -4);
    if (sym.endsWith("BTC")) return sym.slice(0, -3);
    if (sym.endsWith("ETH")) return sym.slice(0, -3);
    return sym;
  };

  const isLoading = !prices || Object.keys(prices).length === 0;

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
        pointerEvents: isLoading ? 'none' : 'auto',
        width: '100%',
        height: '100%'
      }}>
      {/* Row 1: 5 Advanced Metric Cards */}
      <AdvancedMetricsGrid
        marketMetrics={marketMetrics}
        fearGreed={fearGreed}
        socialStats={socialStats}
        prices={prices}
      />
      {/* Row 2: Live TradingView Chart & Order Book */}
      <ChartAndOrderBook
        selectedSymbol={selectedSymbol}
        baseSymbol={getBaseSymbol(selectedSymbol)}
        prices={prices}
        orderBook={orderBook}
        tvlData={tvlData}
        tvContainerRef={tvContainerRef}
        activeTab={activeTab} 
      />
      {/* Row 3: Top Arbitrage & TVL + Heatmap stack */}
      <HeatmapArbitrageGrid
        socialStats={socialStats}
        arbitrage={arbitrage}
        tvlData={tvlData}
      />
      {/* Row 4: Price Compass (left) + Social/Financial (right) */}
      <SocialFinancialGrid
        alerts={alerts}
        socialStats={socialStats}
        financials={financials}
        priceCompass={
          sentimentData?.priceCompass || 
          sentimentData?.data?.priceCompass || 
          (sentimentData?.deviation && sentimentData?.prices ? sentimentData : null) ||
          socialStats?.priceCompass
        }
      />
      </div>
    </div>
  );
}
