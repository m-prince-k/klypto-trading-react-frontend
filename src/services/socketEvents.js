const SocketEvents = {
  // --- INPUT EVENTS (Client to Server) ---
  GET_HISTORICAL_DATA: "get-listing", //chart
  GET_WATCHLIST_DATA: "get-watchlist",

  GET_INDICATOR_DETAILS: "getIndicatorDetails",
  GET_LIVE_INDICATOR: "getLiveIndicatorUpdate",
  GET_RSI_SCANNER: "getRsiScanner",
  SET_RSI_ALERT: "setRsiAlert",
  GET_ALL_STOCKS: "getAllStocks",
  SUBSCRIBE_OPTION_CHAIN: "subscribeOptionChain",

  // --- OUTPUT EVENTS (Server to Client) ---
  HISTORICAL_DATA_RESPONSE: "listing-response", //chart
  HISTORICAL_DATA_ERROR: "listing-error", //chart
  WATCHLIST_RESPONSE: "watchlist-response",
  WATCHLIST_UPDATE: "watchlist-update",
  WATCHLIST_ERROR: "watchlist-error",

  INDICATOR_DETAILS_RESPONSE: "indicatorDetailsResponse",
  INDICATOR_DETAILS_ERROR: "indicatorDetailsError",

  LIVE_INDICATOR_RESPONSE: "liveIndicatorResponse",

  RSI_SCANNER_RESPONSE: "rsiScannerResponse",
  RSI_SCANNER_ERROR: "rsiScannerError",

  STOCKS_LIST: "stocks",
  STOCK_UPDATE: "stockUpdate",
  LIVE_TICK: "liveTick",
  OPTION_CHAIN_UPDATE: "optionChainUpdate",

  GOLD_UPDATE: "goldUpdate",
};

export default SocketEvents;
