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
  FUTURES: {
    REQUEST_INITIAL: "request-futures-initial-data",
    INITIAL_DATA: "futures-initial-data",
    TICKER_UPDATE: "futures-ticker-update",
  },
  FUTURES_CHART: {
    REQUEST: "request-futures-chart",
    DATA: "futures-chart-data",
    SUBSCRIBE: "subscribe-futures-chart",
    UNSUBSCRIBE: "unsubscribe-futures-chart",
    TICK_UPDATE: "futures-chart-tick",
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
  PATTERN:{
    UPDATE: "live-pattern-update",
  },
  MARKET: {
    GET: "request-market-coins",
    INIT: "market-coins-init",
    SENTIMENT_UPDATE: "binance-sentiment",
  },
  MARKET_SENTIMENT: {
    GET: "get-dashboard-data",
    RESPONSE: "dashboard-data-response",
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
  ORDERBOOK: {
    UPDATE: "binance-orderbook",
  }
};

export default EVENTS;