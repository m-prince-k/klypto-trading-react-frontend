const EVENTS = {
  MARKET: {
    GET_COINS: "get-market-coins",
    COINS_RESPONSE: "market-coins-response",
    COINS_UPDATE: "market-coins-update",

    GET_COIN_BY_SYMBOL: "get-market-coin",
    COIN_RESPONSE: "market-coin-response",

    GET_COINS_BY_CATEGORY: "get-market-coins-by-category",
    COINS_BY_CATEGORY_RESPONSE: "market-coins-by-category-response",

    GET_NEW_LISTINGS: "get-market-new-listings",
    NEW_LISTINGS_RESPONSE: "market-new-listings-response",

    GET_METRICS: "get-market-metrics",
    METRICS_RESPONSE: "market-metrics-response",

    GET_OVERVIEW_CHART: "get-market-overview-chart",
    OVERVIEW_CHART_RESPONSE: "market-overview-chart-response",

    GET_FEAR_GREED: "get-market-fear-greed",
    FEAR_GREED_RESPONSE: "market-fear-greed-response",

    GET_SOCIAL_STATS: "get-market-social-stats",
    SOCIAL_STATS_RESPONSE: "market-social-stats-response",

    GET_TVL: "get-market-tvl",
    TVL_RESPONSE: "market-tvl-response",

    GET_FINANCIALS: "get-market-financials",
    FINANCIALS_RESPONSE: "market-financials-response",

    GET_ALL_MARKET_DATA: "get-all-market-data",
    ALL_MARKET_DATA_RESPONSE: "all-market-data-response",
  },

  WATCHLIST: {
    GET: "get-watchlist",
    RESPONSE: "watchlist-response",
    UPDATE: "watchlist-update",
  },

  FINANCIAL: {
    ALL_RESPONSE: "financial-all-response",
    INDICATORS_RESPONSE: "financial-indicators-response",
    FUNDAMENTALS_RESPONSE: "financial-fundamentals-response",
  },

  ONCHAIN: {
    ALL_RESPONSE: "onchain-all-response",
    STATS_RESPONSE: "onchain-stats-response",
    CHAINS_RESPONSE: "onchain-chains-response",
    PROTOCOLS_RESPONSE: "onchain-protocols-response",
  },

  SOCIAL: {
    ALL_RESPONSE: "social-all-response",
    SENTIMENT_RESPONSE: "social-sentiment-response",
  },

  ARBITRAGE: {
    OPPORTUNITIES_RESPONSE: "arbitrage-opportunities-response",
  },

  DASHBOARD: {
    DATA_RESPONSE: "dashboard-data-response",
  },

  STREAMS: {
    TICKER: "binance-ticker",
    ORDERBOOK: "binance-orderbook",
    KLINE: "binance-kline",
    SENTIMENT: "binance-sentiment",
  },
};

export default EVENTS;