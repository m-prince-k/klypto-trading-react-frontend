import { useEffect } from "react";
import { createSocketManager } from "./socketManager";
import EVENTS from "./socketEvents";

export const useSocket = ({
  setPrices,
  setOrderBook,
  setFearGreed,
  setSocialStats,
  setTvlData,
  setFinancials,
  setArbitrage,
  setAlerts,
  selectedSymbolRef,
  getBaseSymbol,
}) => {
  useEffect(() => {
    const handlers = {
      watchlistResponse: (res) => {
        if (!res?.data) return;
        setPrices((prev) => {
          const updated = { ...prev };
          res.data.forEach((item) => {
            const base = getBaseSymbol(item.symbol);
            updated[base] = {
              price: Number(item.lastPrice).toFixed(2),
              change: item.changePercent,
            };
          });
          return updated;
        });
      },

      watchlistUpdate: (tick) => {
        if (!tick?.symbol) return;
        const base = getBaseSymbol(tick.symbol);

        setPrices((prev) => ({
          ...prev,
          [base]: {
            price: Number(tick.price).toFixed(2),
            change: tick.changePct,
          },
        }));
      },

      ticker: (data) => {
        const key = getBaseSymbol(data.symbol);
        setPrices((prev) => ({
          ...prev,
          [key]: {
            price: Number(data.price).toFixed(2),
            change: data.changePct,
          },
        }));
      },

      orderbook: (data) => {
        if (!data || data.symbol !== selectedSymbolRef.current) return;

        setOrderBook({
          asks: data.asks,
          bids: data.bids,
          spread: Number(data.asks[0][0]) - Number(data.bids[0][0]),
        });
      },

      kline: (data) => {
        if (data?.candle?.isFinal) {
          setAlerts((prev) => [
            {
              id: Date.now(),
              msg: `${data.symbol} candle closed`,
              type: "signal",
            },
            ...prev.slice(0, 4),
          ]);
        }
      },

      sentiment: (data) => {
        setFearGreed(data.fearGreed);
        setSocialStats(data.socialStats);
        setTvlData(data.tvlData);
        setFinancials(data.financials);
      },
    };

    const manager = createSocketManager(handlers);

    manager.register();

    // optional init
    manager.emit(EVENTS.WATCHLIST.GET);

    return () => {
      manager.unregister();
    };
  }, []);
};