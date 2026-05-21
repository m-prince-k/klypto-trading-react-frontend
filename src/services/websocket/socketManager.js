import socket from "./socket";
import EVENTS from "./socketEvents";

/**
 * CENTRAL SOCKET MANAGER
 * - registers all listeners once
 * - routes to handlers
 */

export const createSocketManager = (handlers, context = {}) => {
  const on = socket.on.bind(socket);
  const off = socket.off.bind(socket);

  const register = () => {
    // WATCHLIST
    on(EVENTS.WATCHLIST.RESPONSE, handlers.watchlistResponse);
    on(EVENTS.WATCHLIST.UPDATE, handlers.watchlistUpdate);

    // MARKET
    on(EVENTS.MARKET.FEAR_GREED_RESPONSE, handlers.fearGreed);
    on(EVENTS.MARKET.SOCIAL_STATS_RESPONSE, handlers.socialStats);
    on(EVENTS.MARKET.TVL_RESPONSE, handlers.tvl);
    on(EVENTS.MARKET.FINANCIALS_RESPONSE, handlers.financials);

    // STREAMS
    on(EVENTS.STREAMS.TICKER, handlers.ticker);
    on(EVENTS.STREAMS.ORDERBOOK, handlers.orderbook);
    on(EVENTS.STREAMS.KLINE, handlers.kline);
    on(EVENTS.STREAMS.SENTIMENT, handlers.sentiment);
  };

  const unregister = () => {
    off(EVENTS.WATCHLIST.RESPONSE, handlers.watchlistResponse);
    off(EVENTS.WATCHLIST.UPDATE, handlers.watchlistUpdate);

    off(EVENTS.MARKET.FEAR_GREED_RESPONSE, handlers.fearGreed);
    off(EVENTS.MARKET.SOCIAL_STATS_RESPONSE, handlers.socialStats);
    off(EVENTS.MARKET.TVL_RESPONSE, handlers.tvl);
    off(EVENTS.MARKET.FINANCIALS_RESPONSE, handlers.financials);

    off(EVENTS.STREAMS.TICKER, handlers.ticker);
    off(EVENTS.STREAMS.ORDERBOOK, handlers.orderbook);
    off(EVENTS.STREAMS.KLINE, handlers.kline);
    off(EVENTS.STREAMS.SENTIMENT, handlers.sentiment);
  };

  const emit = socket.emit.bind(socket);

  return {
    register,
    unregister,
    emit,
    socket,
  };
};