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
  activeTab
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

  // if (!prices || Object.keys(prices).length === 0) {
  //     return (
  //         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
  //             <Spinner />
  //         </div>
  //     );
  // }

  return (
    <>
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
      {/* Row 3: Social & Financial Metrics Grid */}
      <SocialFinancialGrid
        tvlData={tvlData}
        socialStats={socialStats}
        financials={financials}
      />
      {/* Row 4: Narrative Heatmap bubbles & Alerts feed */}
      <HeatmapArbitrageGrid
        socialStats={socialStats}
        arbitrage={arbitrage}
        alerts={alerts}
      />
    </>
  );
}
