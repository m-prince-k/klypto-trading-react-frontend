const EVENTS = {
  ARBITRAGE: {
    GET: "get-arbitrage",
    RESPONSE: "arbitrage-response",
    UPDATE: "arbitrage-update",
  },
  BINANCE_TICKER: {
    UPDATE: "binance-ticker",
  },
  KLINE: {
    UPDATE: "binance-kline",
    LISTING_UPDATE: "listing-update",
  },
  FINANCIAL: {
    SUBSCRIBE: "subscribe-financial",
    UPDATE: "finance-dashboard-update",
  },
  INDICATORS: {
    GET_DETAILS: "get-indicator-details",
    UPDATE: "update-indicator",

    SUBSCRIBE_TICK: "subscribe-indicator-tick",
    UNSUBSCRIBE_TICK: "unsubscribe-indicator-tick",

    DETAILS_RESPONSE: "indicator-details-data",
    UPDATE_RESPONSE: "indicator-update-data",
    ERROR: "indicator-error",

    TICK_UPDATE: "indicator-tick-update",
  },

  LISTING: {
    GET: "get-listing",
    RESPONSE: "listing-response",
    ERROR: "listing-error",
  },

  LIVE_TICK: {
    SUBSCRIBE: "subscribe-live-tick",
    UNSUBSCRIBE: "unsubscribe-live-tick",
    UPDATE: "live-tick-update",
  },

  MARKET: {
    INIT: "market-coins-init",
    SENTIMENT_UPDATE: "binance-sentiment",
  },
  MARKET_SENTIMENT: {
    UPDATE: "market-sentiment-data",
  },
  ONCHAIN: {
    SUBSCRIBE: "subscribe_onchain",
    UNSUBSCRIBE: "unsubscribe_onchain",
    UPDATE: "onchain_update",
  },
  SOCIAL: {
    GET: "get-social-intel",
    RESPONSE: "social-intel-response",
    UPDATE: "social-intel-update",
  },
  WATCHLIST: {
    GET: "get-watchlist",
    RESPONSE: "watchlist-response",
    UPDATE: "watchlist-update",
  },
  ORDERBOOK:{
    UPDATE: "binance-orderbook",
  }
};

export default EVENTS;