import socket from "./socket";
import EVENTS from "./socketEvents";

/**
 * CENTRAL SOCKET MANAGER
 * - registers all listeners once
 * - routes backend socket events → UI handlers
 *
 * RULE: only register `on` for events the SERVER sends to the client.
 *       Events the client sends (GET, SUBSCRIBE, UNSUBSCRIBE) are emits — never listeners.
 */

export const createSocketManager = (handlers = {}) => {
  const on = socket.on.bind(socket);
  const off = socket.off.bind(socket);
  const emit = socket.emit.bind(socket);

  const register = () => {
    /* ───────────────────────── MARKET ───────────────────────── */
    if (handlers.marketCoinsInit) on(EVENTS.MARKET.INIT, handlers.marketCoinsInit);
    if (handlers.marketSentiment) on(EVENTS.MARKET.SENTIMENT_UPDATE, handlers.marketSentiment);
    if (handlers.marketSentimentData) on(EVENTS.MARKET_SENTIMENT.UPDATE, handlers.marketSentimentData);

    /* ───────────────────────── BINANCE TICKER ────────────────── */
    if (handlers.binanceTicker) on(EVENTS.BINANCE_TICKER.UPDATE, handlers.binanceTicker);

    /* ───────────────────────── KLINE / CHART ─────────────────── */
    if (handlers.klineUpdate) on(EVENTS.KLINE.UPDATE, handlers.klineUpdate);
    if (handlers.klineListingUpdate) on(EVENTS.KLINE.LISTING_UPDATE, handlers.klineListingUpdate);

    /* ───────────────────────── SOCIAL ───────────────────────── */
    if (handlers.socialIntelResponse) on(EVENTS.SOCIAL.RESPONSE, handlers.socialIntelResponse);
    if (handlers.socialIntelUpdate) on(EVENTS.SOCIAL.UPDATE, handlers.socialIntelUpdate);

    /* ───────────────────────── LIVE TICK ─────────────────────── */
    if (handlers.liveTickUpdate) on(EVENTS.LIVE_TICK.UPDATE, handlers.liveTickUpdate);

    /* ───────────────────────── LISTING ───────────────────────── */
    if (handlers.listingResponse) on(EVENTS.LISTING.RESPONSE, handlers.listingResponse);
    if (handlers.listingError) on(EVENTS.LISTING.ERROR, handlers.listingError);

    /* ───────────────────────── INDICATORS ────────────────────── */
    if (handlers.indicatorDetailsData) on(EVENTS.INDICATORS.DETAILS_RESPONSE, handlers.indicatorDetailsData);
    if (handlers.indicatorUpdateData) on(EVENTS.INDICATORS.UPDATE_RESPONSE, handlers.indicatorUpdateData);
    if (handlers.indicatorTickUpdate) on(EVENTS.INDICATORS.TICK_UPDATE, handlers.indicatorTickUpdate);
    if (handlers.indicatorError) on(EVENTS.INDICATORS.ERROR, handlers.indicatorError);

    /* ───────────────────────── FINANCIAL DASHBOARD ───────────── */
    if (handlers.financeDashboardUpdate) on(EVENTS.FINANCIAL.UPDATE, handlers.financeDashboardUpdate);

    /* ───────────────────────── ORDERBOOK ─────────────────────── */
    if (handlers.orderbook) on(EVENTS.ORDERBOOK.UPDATE, handlers.orderbook);

    /* ───────────────────────── ARBITRAGE ─────────────────────── */
    if (handlers.arbitrageResponse) on(EVENTS.ARBITRAGE.RESPONSE, handlers.arbitrageResponse);
    if (handlers.arbitrageUpdate) on(EVENTS.ARBITRAGE.UPDATE, handlers.arbitrageUpdate);

    /* ───────────────────────── WATCHLIST ─────────────────────── */
    if (handlers.watchlistResponse) on(EVENTS.WATCHLIST.RESPONSE, handlers.watchlistResponse);
    if (handlers.watchlistUpdate) on(EVENTS.WATCHLIST.UPDATE, handlers.watchlistUpdate);

    /* ───────────────────────── ONCHAIN ───────────────────────── */
    if (handlers.onchainUpdate) on(EVENTS.ONCHAIN.UPDATE, handlers.onchainUpdate);
  };

  const unregister = () => {
    /* MARKET */
    if (handlers.marketCoinsInit) off(EVENTS.MARKET.INIT, handlers.marketCoinsInit);
    if (handlers.marketSentiment) off(EVENTS.MARKET.SENTIMENT_UPDATE, handlers.marketSentiment);
    if (handlers.marketSentimentData) off(EVENTS.MARKET_SENTIMENT.UPDATE, handlers.marketSentimentData);

    /* BINANCE TICKER */
    if (handlers.binanceTicker) off(EVENTS.BINANCE_TICKER.UPDATE, handlers.binanceTicker);

    /* KLINE / CHART */
    if (handlers.klineUpdate) off(EVENTS.KLINE.UPDATE, handlers.klineUpdate);
    if (handlers.klineListingUpdate) off(EVENTS.KLINE.LISTING_UPDATE, handlers.klineListingUpdate);

    /* SOCIAL */
    if (handlers.socialIntelResponse) off(EVENTS.SOCIAL.RESPONSE, handlers.socialIntelResponse);
    if (handlers.socialIntelUpdate) off(EVENTS.SOCIAL.UPDATE, handlers.socialIntelUpdate);

    /* LIVE TICK */
    if (handlers.liveTickUpdate) off(EVENTS.LIVE_TICK.UPDATE, handlers.liveTickUpdate);

    /* LISTING */
    if (handlers.listingResponse) off(EVENTS.LISTING.RESPONSE, handlers.listingResponse);
    if (handlers.listingError) off(EVENTS.LISTING.ERROR, handlers.listingError);

    /* INDICATORS */
    if (handlers.indicatorDetailsData) off(EVENTS.INDICATORS.DETAILS_RESPONSE, handlers.indicatorDetailsData);
    if (handlers.indicatorUpdateData) off(EVENTS.INDICATORS.UPDATE_RESPONSE, handlers.indicatorUpdateData);
    if (handlers.indicatorTickUpdate) off(EVENTS.INDICATORS.TICK_UPDATE, handlers.indicatorTickUpdate);
    if (handlers.indicatorError) off(EVENTS.INDICATORS.ERROR, handlers.indicatorError);

    /* FINANCIAL */
    if (handlers.financeDashboardUpdate) off(EVENTS.FINANCIAL.UPDATE, handlers.financeDashboardUpdate);

    /* ORDERBOOK */
    if (handlers.orderbook) off(EVENTS.ORDERBOOK.UPDATE, handlers.orderbook);

    /* ARBITRAGE */
    if (handlers.arbitrageResponse) off(EVENTS.ARBITRAGE.RESPONSE, handlers.arbitrageResponse);
    if (handlers.arbitrageUpdate) off(EVENTS.ARBITRAGE.UPDATE, handlers.arbitrageUpdate);

    /* WATCHLIST */
    if (handlers.watchlistResponse) off(EVENTS.WATCHLIST.RESPONSE, handlers.watchlistResponse);
    if (handlers.watchlistUpdate) off(EVENTS.WATCHLIST.UPDATE, handlers.watchlistUpdate);

    /* ONCHAIN */
    if (handlers.onchainUpdate) off(EVENTS.ONCHAIN.UPDATE, handlers.onchainUpdate);
  };

  return {
    register,
    unregister,
    emit,
    socket,
  };
};