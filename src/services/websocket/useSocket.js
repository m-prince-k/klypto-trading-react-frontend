import { useEffect } from "react";
import { createSocketManager } from "./socketManager";
import EVENTS from "./socketEvents";
import socket from "./socket";

// Global cache to persist data across route transitions (e.g. going to Details and back)
export const globalCache = {
  marketCoins: null,
  marketMetrics: null,
  overviewChartData: null,
  sentimentData: null,
  onchainData: null,
  financeData: null,
  opportunities: null,
};

export const useSocket = ({
  setPrices,
  setOrderBook,
  setFearGreed,
  setSocialStats,
  setTvlData,
  setFinancials,
  setAlerts,
  selectedSymbolRef,
  getBaseSymbol,

  // Chart
  setChartData,

  // Watchlist
  setWatchlist,

  // On-chain
  setOnchainData,

  // Arbitrage
  setOpportunities,
  setLastUpdated,
  setPriceFlash,
  setLoading,

  // Futures
  setFuturesData,
  setFuturesLoading,
  setFuturesError,
  handleFuturesTickerUpdate,

  //Financials
  setKlines,
  setDepthData,
  setMarketExtra,
  setFinanceData,
  selectedSymbol,
  cleanSymbol,
  selectedPeriod,

  // MarketData
  setCoins,
  setMarketMetrics,
  setOverviewChartData,
  setFlashStates,

  // MarketSentiment
  setSentimentData,

  // CoinMarketDetails
  setCoinDetail,
  areaSeriesRef,
  setFlashState,

  // CandleStick
  handleLiveTickUpdate,
  handleWatchlistResponse,
  handleWatchlistUpdate,
}) => {
  useEffect(() => {
    const handlers = {

      /* ───────────────── MARKET INIT ───────────────── */
      marketCoinsInit: (res) => {
        if (setCoins || setMarketMetrics || setOverviewChartData || setCoinDetail) console.log("[useSocket] Event: market-coins-init Payload:", res);
        
        // Handle varying backend payloads e.g. { coins: [...] } vs { data: [...] } vs [...]
        const extractedCoins = res.coins || res.data || (Array.isArray(res) ? res : []);
        
        if (extractedCoins.length > 0) globalCache.marketCoins = extractedCoins;
        if (res.metrics) globalCache.marketMetrics = res.metrics;
        const chartData = res.overviewChartData || res.overviewChart;
        if (chartData) globalCache.overviewChartData = chartData;

        if (setCoins) setCoins(extractedCoins);
        if (setMarketMetrics && res.metrics) setMarketMetrics((prev) => ({ ...prev, ...res.metrics }));
        if (setOverviewChartData && chartData) setOverviewChartData(chartData);

        if (setCoinDetail && extractedCoins.length > 0) {
          const found = extractedCoins.find(c => c.symbol.toUpperCase() === selectedSymbol?.toUpperCase());
          if (found) {
            setCoinDetail((prevCoin) => prevCoin ? prevCoin : found);
            if (areaSeriesRef?.current && found.history) {
              const chartData = found.history.map((price, idx) => ({
                time: Math.floor(Date.now() / 1000) - (found.history.length - idx) * 10,
                value: price,
              }));
              areaSeriesRef.current.setData(chartData);
            }
          }
        }

        if (!res?.coins) return;

        setPrices?.(() => {
          const updated = {};

          res.coins.forEach((coin) => {
            const base = getBaseSymbol ? getBaseSymbol(coin.symbol) : coin.symbol.replace("USDT", "");

            updated[base] = {
              price: Number(coin.price).toFixed(2),
              change: coin.change24h,
            };
          });

          return updated;
        });
      },

      marketSentiment: (data) => {
        // binance-sentiment
        if (setSentimentData || setFearGreed || setSocialStats || setTvlData || setFinancials || setMarketMetrics) console.log("[useSocket] Event: binance-sentiment Payload:", data);

        const mergeValidProps = (prev, incoming) => {
          if (!incoming || typeof incoming !== 'object') return prev;
          const updated = { ...prev };
          Object.keys(incoming).forEach(key => {
            if (incoming[key] !== null && incoming[key] !== undefined && incoming[key] !== "") {
              updated[key] = incoming[key];
            }
          });
          return updated;
        };

        if (setSentimentData) {
          setSentimentData(prev => {
            const next = prev ? mergeValidProps(prev, data) : data;
            globalCache.sentimentData = next;
            return next;
          });
        }

        if (data.fearGreed) setFearGreed?.((prev) => mergeValidProps(prev, data.fearGreed));
        if (data.socialStats) setSocialStats?.((prev) => mergeValidProps(prev, data.socialStats));
        if (data.tvlData) setTvlData?.((prev) => mergeValidProps(prev, data.tvlData));
        if (data.financials) setFinancials?.((prev) => mergeValidProps(prev, data.financials));

        setMarketMetrics?.((prev) => ({
          ...prev,
          btcDominance: parseFloat(data?.socialStats?.btcDominance) || prev?.btcDominance,
          fearGreedIndex: parseInt(data?.fearGreed?.value) || prev?.fearGreedIndex,
        }));
      },

      marketSentimentData: (data) => {
        // market-sentiment-data — real API sentiment stream
        console.log("[useSocket] Event: market-sentiment-data Response:", data);
        const mergeValidProps = (prev, incoming) => {
          if (!incoming || typeof incoming !== 'object') return prev;
          const updated = { ...prev };
          Object.keys(incoming).forEach(key => {
            if (incoming[key] !== null && incoming[key] !== undefined && incoming[key] !== "") {
              updated[key] = incoming[key];
            }
          });
          return updated;
        };
        // Safely extract fearGreed whether it's nested or the root object
        const incomingFearGreed = data?.fearGreed ? data?.fearGreed : data;
        setFearGreed?.((prev) => mergeValidProps(prev, incomingFearGreed));
        setSentimentData?.((prev) => {
          const next = prev ? mergeValidProps(prev, data) : data;
          globalCache.sentimentData = next;
          return next;
        });
      },

      /* ───────────────── BINANCE TICKER ───────────────── */
      binanceTicker: (data) => {
        // data: { symbol, price, change24h, ... }
        if (!data?.symbol) return;
        const symbolKey = data.symbol.replace("USDT", "").toUpperCase();
        const base = getBaseSymbol ? getBaseSymbol(data.symbol) : symbolKey;

        setCoins?.((prevCoins) => {
          const coinExists = prevCoins.some((c) => c.symbol === symbolKey);
          if (!coinExists) return prevCoins;
          const originalCoin = prevCoins.find((c) => c.symbol === symbolKey);
          const originalPrice = originalCoin ? originalCoin.price : 0;
          const newPrice = Number(data.price);

          if (originalPrice > 0 && newPrice !== originalPrice && setFlashStates) {
            const direction = newPrice >= originalPrice ? "up" : "down";
            const flashKey = `${symbolKey}-price`;
            setFlashStates((prev) => ({ ...prev, [flashKey]: direction }));
            setTimeout(() => {
              setFlashStates((prev) => {
                const next = { ...prev };
                delete next[flashKey];
                return next;
              });
            }, 800);
          }

          return prevCoins.map((coin) => {
            if (coin.symbol === symbolKey) {
              const updatedHistory = [...coin.history.slice(1), newPrice];
              return {
                ...coin,
                price: newPrice,
                change24h: Number(data.changePct),
                volume24h: Number(data.volume),
                high: Number(data.high),
                low: Number(data.low),
                history: updatedHistory,
              };
            }
            return coin;
          });
        });

        if (globalCache.marketCoins) {
          const coinIdx = globalCache.marketCoins.findIndex((c) => c.symbol === symbolKey);
          if (coinIdx !== -1) {
            globalCache.marketCoins[coinIdx] = {
              ...globalCache.marketCoins[coinIdx],
              price: Number(data.price),
              change24h: Number(data.changePct),
              volume24h: Number(data.volume),
              high: Number(data.high),
              low: Number(data.low),
            };
          }
        }

        setPrices?.((prev) => ({
          ...prev,
          [base]: {
            price: Number(data.price).toFixed(2),
            change: data.change24h ?? prev[base]?.change ?? 0,
          },
        }));
      },

      /* ───────────────── KLINE / CHART ───────────────── */
      klineUpdate: (data) => {
        // data: { symbol, interval, openTime, open, high, low, close, volume, isClosed }
        if (!data) return;

        setChartData?.((prev) => {
          if (!prev?.length) return prev;

          const updated = [...prev];
          const last = updated[updated.length - 1];

          if (last?.time === data.openTime) {
            // update the current forming candle in place
            updated[updated.length - 1] = {
              ...last,
              high: Math.max(last.high, Number(data.high)),
              low: Math.min(last.low, Number(data.low)),
              close: Number(data.close),
              volume: Number(data.volume),
            };
          } else if (data.isClosed) {
            // candle closed — push a new one
            updated.push({
              time: data.openTime,
              open: Number(data.open),
              high: Number(data.high),
              low: Number(data.low),
              close: Number(data.close),
              volume: Number(data.volume),
            });
          }

          return updated;
        });
      },

      klineListingUpdate: (data) => {
        // listing-update — bulk historical candles for initial chart load
        if (!data?.candles) return;

        setChartData?.(
          data.candles.map((c) => ({
            time: c.openTime,
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
            volume: Number(c.volume),
          }))
        );
      },

      /* ───────────────── SOCIAL ───────────────── */
      socialIntelResponse: (res) => {
        if (setSocialStats) console.log("[useSocket] Event: social-intel-response Payload:", res);
        if (!res?.data) return;
        setSocialStats?.((prev) => {
          if (!prev || typeof prev !== 'object') return res.data;
          return { ...prev, ...res.data };
        });
      },

      socialIntelUpdate: (data) => {
        if (setSocialStats) console.log("[useSocket] Event: social-intel-update Payload:", data);
        setSocialStats?.((prev) => {
          if (!prev || typeof prev !== 'object') return data;
          return { ...prev, ...data };
        });
      },

      /* ───────────────── LIVE TICK ───────────────── */
      liveTickUpdate: (tick) => {
        if (handleLiveTickUpdate) handleLiveTickUpdate(tick);

        if (!tick || !tick.symbol || !tick.ohlcv) return;
        const key = getBaseSymbol ? getBaseSymbol(tick.symbol) : tick.symbol.replace("USDT", "").toUpperCase();

        if (setCoinDetail && selectedSymbol && key === selectedSymbol.toUpperCase()) {
          const { open, high, low, close, volume } = tick.ohlcv;
          const newPrice = Number(close);
          setCoinDetail((prevCoin) => {
            if (!prevCoin) return null;
            const oldPrice = prevCoin.price;
            if (oldPrice > 0 && newPrice !== oldPrice && setFlashState) {
              const direction = newPrice >= oldPrice ? "up" : "down";
              setFlashState(direction);
              setTimeout(() => setFlashState(null), 800);
            }
            if (areaSeriesRef?.current) {
              const time = Math.floor(tick.timestamp / 1000);
              if (typeof areaSeriesRef.current.updateCandle === 'function') {
                 areaSeriesRef.current.updateCandle({ time, open: Number(open), high: Number(high), low: Number(low), close: Number(close) });
                 if (typeof areaSeriesRef.current.updateVolume === 'function') {
                    areaSeriesRef.current.updateVolume({ 
                      time, 
                      value: Number(volume), 
                      color: Number(close) >= Number(open) ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)' 
                    });
                 }
              } else if (typeof areaSeriesRef.current.update === 'function') {
                 areaSeriesRef.current.update({ time, value: newPrice });
              }
            }
            const updatedHistory = Array.isArray(prevCoin.history) ? [...prevCoin.history.slice(1), newPrice] : [newPrice];
            return {
              ...prevCoin,
              price: newPrice,
              change24h: Number(tick.changePct ?? prevCoin.change24h),
              volume24h: Number(volume || prevCoin.volume24h),
              high: Number(high || prevCoin.high),
              low: Number(low || prevCoin.low),
              history: updatedHistory,
            };
          });
        }

        setPrices?.((prev) => ({
          ...prev,
          [key]: {
            price: Number(tick.ohlcv.close).toFixed(2),
            change: prev[key]?.change || 0,
          },
        }));
      },

      /* ───────────────── LISTING ───────────────── */
      listingResponse: (res) => {
        if (setKlines || setPrices) console.log("[useSocket] Event: listing-response received:", { symbol: res?.symbol, dataLength: res?.data?.length });
        if (!res?.data || !Array.isArray(res.data)) return;

        if (setKlines && res.symbol && selectedSymbol && cleanSymbol) {
          const normRes = cleanSymbol(res.symbol);
          if (normRes === selectedSymbol) {
            console.log("[useSocket] listingResponse matches selectedSymbol, updating klines!");
            setKlines(res.data.map(c => ({
              time: c.openTime || c.time,
              open: Number(c.open),
              high: Number(c.high),
              low: Number(c.low),
              close: Number(c.close),
              volume: Number(c.volume)
            })));
          }
        }

        setPrices?.((prev) => {
          const updated = { ...prev };

          res.data.forEach((candle) => {
            const base = getBaseSymbol ? getBaseSymbol(res.symbol) : res.symbol.replace("USDT", "");

            updated[base] = {
              price: Number(candle.close).toFixed(2),
              change: 0,
            };
          });

          return updated;
        });
      },

      listingError: (err) => {
        if (setKlines || setPrices) console.error("Listing error:", err);
      },

      // Duplicate orderbook handler removed

      /* ───────────────── INDICATORS ───────────────── */
      indicatorDetailsData: (res) => {
        // console.log("Indicator details:", res);
      },

      indicatorUpdateData: (res) => {
        // console.log("Indicator updated:", res);
      },

      indicatorTickUpdate: (tick) => {
        // console.log("Indicator tick:", tick);
      },

      indicatorError: (err) => {
        // console.error("Indicator error:", err);
      },



      /* ───────────────── ARBITRAGE ───────────────── */
      arbitrageResponse: (res) => {
        if (setOpportunities) console.log("[useSocket] Event: arbitrage-response Response:", res);
        if (!res?.data) return;
        globalCache.opportunities = res.data;
        setOpportunities?.(res.data);
        setLastUpdated?.(new Date().toLocaleTimeString());
      },

      arbitrageUpdate: (res) => {
        if (setOpportunities) console.log("[useSocket] Event: arbitrage-update Payload:", res);
        if (!res?.success || !res.data || !Array.isArray(res.data)) return;

        setOpportunities?.((prev) => {
          const flashes = {};

          res.data.forEach((newOpp) => {
            const oldOpp = prev.find((o) => o.id === newOpp.id);
            if (!oldOpp) return;

            if (newOpp.buyPrice !== oldOpp.buyPrice) {
              flashes[`${newOpp.id}-buy`] =
                newOpp.buyPrice > oldOpp.buyPrice ? "up" : "down";
            }

            if (newOpp.sellPrice !== oldOpp.sellPrice) {
              flashes[`${newOpp.id}-sell`] =
                newOpp.sellPrice > oldOpp.sellPrice ? "up" : "down";
            }
          });

          setPriceFlash?.((prev) => ({ ...prev, ...flashes }));
          globalCache.opportunities = res.data;
          return res.data;
        });

        setLastUpdated?.(new Date().toLocaleTimeString());
      },

      /* ───────────────── WATCHLIST ───────────────── */
      watchlistResponse: (res) => {
        if (handleWatchlistResponse) handleWatchlistResponse(res);
        if (!res?.data) return;
        setWatchlist?.(res.data);
      },

      watchlistUpdate: (data) => {
        if (handleWatchlistUpdate) handleWatchlistUpdate(data);
        setWatchlist?.(data);
      },

      /* ───────────────── ONCHAIN ───────────────── */
      onchainUpdate: (data) => {
        if (!data) return;
        console.log("[useSocket] Event: onchainUpdate response:", data);
        const payload = data.success ? data.data : data;
        
        // Filter out stale updates from previous currency subscriptions to prevent flicker
        const eventSymbol = payload?.symbol || data.symbol;
        if (eventSymbol && safeSymbol) {
          const getBaseAsset = (sym) => sym.replace(/USDT|BUSD|USDC|USD|BTC|ETH$/gi, '').toUpperCase();
          if (getBaseAsset(eventSymbol) !== getBaseAsset(safeSymbol)) {
            // console.log(`[useSocket] Filtering out stale onchain update for ${eventSymbol} (current is ${safeSymbol})`);
            return;
          }
        }
        
        globalCache.onchainData = payload;
        setOnchainData?.(payload);
      },



      /* ───────────────── FUTURES ───────────────── */
      futuresInitialData: (res) => {
        if (setFuturesData) console.log("[useSocket] Event: futures-initial-data Payload:", res);
        if (res.success) setFuturesData?.(res.data);
        else setFuturesError?.(res.message || "Failed to load futures data");
        setFuturesLoading?.(false);
      },

      futuresTickerUpdate: (updates) => {
        if (handleFuturesTickerUpdate) console.log("[useSocket] Event: futures-ticker-update Payload:", updates);
        if (handleFuturesTickerUpdate) handleFuturesTickerUpdate(updates);
      },

      /* ───────────────── FINANCIAL ───────────────── */
      financeDashboardUpdate: (data) => {
        if (!data) return;

        // Filter out stale updates from previous currency subscriptions
        const eventSymbol = data.symbol || data.marketExtra?.symbol || data.financials?.symbol || data.tvlData?.symbol;

        const getBaseAsset = (sym) => {
          if (!sym) return '';
          return sym.replace(/USDT|BUSD|USDC|USD|BTC|ETH$/gi, '').toUpperCase();
        };

        if (eventSymbol && selectedSymbol) {
          if (getBaseAsset(eventSymbol) !== getBaseAsset(selectedSymbol)) {
            return;
          }
        }

        if (setFinanceData || setFearGreed || setSocialStats || setTvlData || setFinancials || setMarketExtra) console.log("[useSocket] Event: finance-dashboard-update Payload:", data);
        globalCache.financeData = data;
        if (setFinanceData) setFinanceData(data);

        const mergeValidProps = (prev, incoming) => {
          if (!incoming || typeof incoming !== 'object') return prev;
          const updated = { ...prev };
          Object.keys(incoming).forEach(key => {
            if (incoming[key] !== null && incoming[key] !== undefined && incoming[key] !== "") {
              updated[key] = incoming[key];
            }
          });
          return updated;
        };

        if (data.fearGreed) setFearGreed?.((prev) => mergeValidProps(prev, data.fearGreed));
        if (data.socialStats) setSocialStats?.((prev) => mergeValidProps(prev, data.socialStats));
        if (data.tvlData) setTvlData?.((prev) => mergeValidProps(prev, data.tvlData));
        if (data.financials) setFinancials?.((prev) => mergeValidProps(prev, data.financials));
        // console.log("[useSocket] finance-dashboard-update full payload keys:", Object.keys(data));
        // console.log("[useSocket] data.marketExtra raw value:", data.marketExtra);
        if (data.marketExtra) setMarketExtra?.((prev) => mergeValidProps(prev, data.marketExtra));
      },

      /* ───────────────── KLINE / CHART ───────────────── */
      klineUpdate: (data) => {
        if (!data || (cleanSymbol && selectedSymbol && cleanSymbol(data.symbol) !== selectedSymbol)) return; // filter by symbol
        setKlines?.((prev) => {
          if (!prev?.length) return prev;
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.time === data.openTime) {
            updated[updated.length - 1] = {
              ...last,
              high: Math.max(last.high, Number(data.high)),
              low: Math.min(last.low, Number(data.low)),
              close: Number(data.close),
              volume: Number(data.volume),
            };
          } else if (data.isClosed) {
            updated.push({
              time: data.openTime,
              open: Number(data.open),
              high: Number(data.high),
              low: Number(data.low),
              close: Number(data.close),
              volume: Number(data.volume),
            });
          }
          return updated;
        });
      },

      klineListingUpdate: (data) => {
        if (!data?.candles) return;
        setKlines?.(data.candles.map((c) => ({
          time: c.openTime,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume),
        })));
      },

      orderbook: (data) => {
        const currentSymbol = selectedSymbolRef?.current || selectedSymbol;
        if (!data || !currentSymbol) return;

        const normalizedDataSymbol = data.symbol ? data.symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";
        const normalizedCurrentSymbol = currentSymbol ? currentSymbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";

        if (normalizedDataSymbol !== normalizedCurrentSymbol) return;

        setOrderBook?.({
          asks: data.asks,
          bids: data.bids,
          spread: Number(data.asks?.[0]?.[0]) - Number(data.bids?.[0]?.[0]),
        });

        setDepthData?.({                    // ← add this
          liquidityRisk: data.asks?.length > 20 ? "Low" : "Medium",
          spreadPct: (
            (Number(data.asks?.[0]?.[0]) - Number(data.bids?.[0]?.[0])) /
            Number(data.asks?.[0]?.[0]) * 100
          ).toFixed(4),
        });
      },
    };

    const manager = createSocketManager(handlers);

    manager.register();

    const safeSymbol = (() => {
      if (!selectedSymbol) return null;
      const upper = selectedSymbol.toUpperCase();
      if (upper === 'BTC' || upper === 'ETH') return `${upper}USDT`;
      if (upper.endsWith('USDT') || upper.endsWith('BTC') || upper.endsWith('ETH') || upper.endsWith('USDC') || upper.endsWith('BUSD')) {
        return upper;
      }
      return `${upper}USDT`;
    })();

    const bootstrap = () => {
      console.log(`[useSocket] Tab Mounted! Passed selectedSymbol: "${selectedSymbol}", resolved safeSymbol: "${safeSymbol}"`);
      
      manager.emit(EVENTS.WATCHLIST.GET);

      if (setCoins) {
        if (globalCache.marketCoins) {
          setCoins(globalCache.marketCoins);
        }
        if (setMarketMetrics && globalCache.marketMetrics) {
          setMarketMetrics(globalCache.marketMetrics);
        }
        if (setOverviewChartData && globalCache.overviewChartData) {
          setOverviewChartData(globalCache.overviewChartData);
        }
        manager.emit(EVENTS.MARKET.GET, { symbol: safeSymbol || "BTCUSDT" });
      }

      if (setSentimentData && globalCache.sentimentData) {
        setSentimentData(globalCache.sentimentData);
      }
      if (setOnchainData && globalCache.onchainData) {
        setOnchainData(globalCache.onchainData);
      }
      if (setFinanceData && globalCache.financeData) {
        setFinanceData(globalCache.financeData);
      }
      if (setOpportunities && globalCache.opportunities) {
        setOpportunities(globalCache.opportunities);
      }

      if (setOnchainData && safeSymbol) {
        console.log(`[useSocket] Emitting subscribe_onchain with symbol:`, { symbol: safeSymbol });
        manager.emit(EVENTS.ONCHAIN.SUBSCRIBE, { symbol: safeSymbol });
      }

      if (setCoinDetail && safeSymbol) {
        manager.emit(EVENTS.MARKET.GET, { symbol: safeSymbol });
      }

      // if (setOpportunities) {
        
      //   manager.emit(EVENTS.ARBITRAGE.GET, { symbol: safeSymbol || "BTCUSDT" });
      //   if (setLoading) {
      //     setTimeout(() => setLoading(false), 3000);
      //   }
      // }

      if (safeSymbol) {
        if (setPrices || setCoinDetail || setFlashStates || setOverviewChartData) {
          manager.emit(EVENTS.LIVE_TICK.SUBSCRIBE, {
            symbol: safeSymbol,
            interval: "5m",
          });
        }

        if (setFinanceData || setFinancials || setMarketExtra || setDepthData || setTvlData) {
          console.log("EMITTING SUBSCRIBE FOR:", safeSymbol);
          manager.emit(EVENTS.FINANCIAL.SUBSCRIBE, { symbol: safeSymbol });
        }

        if (setSocialStats) {
          manager.emit(EVENTS.SOCIAL.GET, { symbol: selectedSymbol || safeSymbol });
        }

        if (setKlines || setChartData) {
          const validIntervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
          let interval = validIntervals.includes(selectedPeriod) ? selectedPeriod : "1d";
          let limit = 200; // Consistent lookback of 200 candles to ensure enough chart data
          manager.emit(EVENTS.LISTING.GET, { symbol: safeSymbol, interval, limit });
        }

        if (setSentimentData) {
          manager.emit(EVENTS.MARKET.SENTIMENT_UPDATE, { symbol: safeSymbol });
        }

        if (setOrderBook) {
          manager.emit(EVENTS.ORDERBOOK.UPDATE, { symbol: safeSymbol });
        }
      }

      if (setFuturesData) {
        manager.emit(EVENTS.FUTURES.REQUEST_INITIAL);
      }
    };

    manager.socket.on("connect", bootstrap);
    if (manager.socket.connected) {
      bootstrap();
    }

    return () => {
      if (safeSymbol) {
        console.log("EMITTING UNSUBSCRIBE FOR:", safeSymbol);
        
        if (setPrices || setCoinDetail || setFlashStates || setOverviewChartData) {
          manager.emit(EVENTS.LIVE_TICK.UNSUBSCRIBE, { symbol: safeSymbol, interval: "5m" });
        }
        
        if (setFinanceData || setFinancials || setMarketExtra || setDepthData || setTvlData) {
          manager.emit("unsubscribe-financial", { symbol: safeSymbol });
        }
        
        if (setOnchainData) {
          manager.emit(EVENTS.ONCHAIN.UNSUBSCRIBE, { symbol: safeSymbol });
        }
      }
      manager.socket.off("connect", bootstrap);
      manager.unregister();
    };
  }, [selectedSymbol]); // Removed selectedPeriod to prevent full teardown on chart timeframe change

  // Separate effect specifically for when the chart timeframe changes
  useEffect(() => {
    if (!selectedPeriod || !selectedSymbol) return;

    const safeSymbol = (() => {
      const upper = selectedSymbol.toUpperCase();
      if (upper === 'BTC' || upper === 'ETH') return `${upper}USDT`;
      if (upper.endsWith('USDT') || upper.endsWith('BTC') || upper.endsWith('ETH') || upper.endsWith('USDC') || upper.endsWith('BUSD')) {
        return upper;
      }
      return `${upper}USDT`;
    })();

    if (socket.connected) {
      const validIntervals = ['1m','3m','5m','15m','30m','1h','2h','4h','6h','8h','12h','1d','3d','1w','1M'];
      let interval = validIntervals.includes(selectedPeriod) ? selectedPeriod : "1d";
      let limit = 200;
      console.log(`[useSocket] Chart Timeframe Changed! Emitting LISTING.GET for ${safeSymbol} at interval ${interval}`);
      socket.emit(EVENTS.LISTING.GET, { symbol: safeSymbol, interval, limit });
    } else {
      console.log(`[useSocket] Chart Timeframe Changed, but socket not connected yet.`);
    }
  }, [selectedPeriod, selectedSymbol]);
};