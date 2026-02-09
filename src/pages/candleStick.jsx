import {
  createChart,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  HistogramSeries,
  BaselineSeries,
} from "lightweight-charts";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import { RiResetRightLine } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import { FaFileWaveform } from "react-icons/fa6";
import { Form } from "../components/tradingModals/Form";
import ChartHeader from "../components/tradingModals/ChartHeader";
import { ChartProprties } from "../util/common";
import apiService from "../services/apiServices";

export default function Candlestick() {
  const chartRef = useRef();
  const containerRef = useRef();
  const seriesRef = useRef(null);
  const indicatorSeries = useRef({});
  const socketRef = useRef(null);

  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState('1m');
  const [selectedCurrency, setSelectedCurrency] = useState("ETHBTC");
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [rangeValue, setRangeValue] = useState("1000");
  const [chartType, setChartType] = useState("candlestick");
  const [historicalData, setHistoricalData] = useState([]);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [liveOhlcv, setLiveOhlcv] = useState({});

  console.log(selectedIndicator, "selecteddddddddddddddddddddddd------------");

  const Statistics = ["O:32", "H:33", "L:34", "C:31", "V:43"];

  const formatCandleData = (data) => {
    if (!Array.isArray(data)) return [];

    const map = new Map();

    data.forEach((item) => {
      const time = item.time
        ? Number(item.time)
        : Math.floor(Number(item.t) / 1000);

      if (!time) return;

      map.set(time, {
        time,
        open: Number(item.open ?? item.o),
        high: Number(item.high ?? item.h),
        low: Number(item.low ?? item.l),
        close: Number(item.close ?? item.c),
        volume: Number(item.volume ?? item.v ?? 0),
      });
    });

    return Array.from(map.values()).sort((a, b) => a.time - b.time);
  };

  // async function fetchChartData() {
  //   try {
  //     const response = await apiService.post("listing", { type: chartType });

  //     if (response?.statusCode === 200) {
  //       setHistoricalData(response?.data);
  //     }
  //   } catch (error) {
  //     console.log("error", error.message);
  //   }
  // }

  // useEffect(() => {
  //   if (seriesRef.current) {
  //     chartRef.current.removeSeries(seriesRef.current);
  //   }
  //   if (apiCalledRef.current) return;
  //   apiCalledRef.current = true;

  //   // apiService
  //   //   .post("/listing", { chartType })
  //   //   .then(async (res) => {
  //   //     console.log(
  //   //       res,
  //   //       "-------------------------------------------------------asjkfjskfjksjfkjk",
  //   //     );

  //   //     // because of interceptor, res is already response.data
  //   //     const formatted = await res.data;
  //   //     setHistoricalData(formatted);
  //   //   })
  //   //   .catch(console.error);
  // }, []);

  useEffect(() => {
    chartRef.current = createChart(containerRef.current, ChartProprties);

    // const series = chartRef.current.addSeries(CandlestickSeries, {
    //   upColor: "#22c55e",
    //   downColor: "#ef4444",
    //   borderUpColor: "#22c55e",
    //   borderDownColor: "#ef4444",
    //   wickUpColor: "#22c55e",
    //   wickDownColor: "#ef4444",
    // });

    // const formattedData = formatCandleData(historicalData);
    //   if (formattedData.length > 0) {
    //     series.setData(formattedData);
    //   }

    // 3️⃣ Connect Binance WebSocket (BTCUSDT 1m)
    // const socket = new WebSocket(
    //   "wss://stream.binance.com:9443/ws/btcusdt@kline_1m",
    // );

    // socketRef.current = socket;

    // socket.onmessage = (event) => {
    //   const msg = JSON.parse(event.data);
    //   const k = msg.k;

    //   // 4️⃣ Extract candle values
    //   const candle = {
    //     time: new Date(k.t).toISOString().split("T")[0], // YYYY-MM-DD
    //     open: Number(k.o),
    //     high: Number(k.h),
    //     low: Number(k.l),
    //     close: Number(k.c),
    //   };

    //   // 5️⃣ Update chart candle
    //   console.log(candle, "live candle-----------------------------");
    //   socketRef.current.update(candle);

    //   // 6️⃣ Update OHLC panel
    //   setLiveOhlcv({
    //     open: Number(candle.open),
    //     high: Number(candle.high),
    //     low: Number(candle.low),
    //     close: Number(candle.close),
    //   });
    // };

    chartRef.current.timeScale().fitContent();
    return () => {
      chartRef.current.remove();
      // socketRef.close();
    };
  }, []);

  //  -------------------LOAD INDICATOR FROM API------------------------------
  const loadIndicator = async () => {
    const { panel, data } = await apiService.post(
      `indicatorDetails?symbol=${selectedCurrency ? selectedCurrency : "ETHBTC"}&interval=${timeframeValue}&indicator=${selectedIndicator.toLowerCase() || "ema"}`,
    );
    console.log(panel, "24444444444444444444");
    // const responde = await res.data;
    // const panel=responde.panel;
    // let data=responde.data

    console.log(data, "24444444444444444444");
    // Remove existing indicator
    if (indicatorSeries.current[selectedIndicator]) {
      chartRef.current.removeSeries(indicatorSeries.current[selectedIndicator]);
    }

    let series;

    // Overlay indicators
    if (panel === "overlay") {
      series = chartRef.current.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
      });
    }

    // Separate panel indicators (RSI, MACD)
    if (panel === "separate") {
      series = chartRef.current.addSeries(LineSeries, {
        color: "#facc15",
        priceScaleId: "right",
      });
    }

    // Volume
    if (panel === "volume") {
      series = chartRef.current.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
        scaleMargins: { top: 0.8, bottom: 0 },
      });
    }

    series.setData(data);
    indicatorSeries.current[selectedIndicator] = series;
  };

  useEffect(() => {
    loadIndicator();
  }, [selectedIndicator]);

  useEffect(() => {
    // if(chartType == 'line'){
    //     console.log("---------------------0-0-0-0-")

    //     seriesRef.current = chartRef.current.addSeries(LineSeries,{ color: "#38bdf8" });
    //     seriesRef.current.setData(data.map(d => ({ time: d.time, value: d.close })));
    // }

    // if (!chartRef.current || !seriesRef.current) return;

    try {
      chartRef.current.removeSeries(seriesRef.current);
    } catch (e) {
      console.warn("Series already removed");
    }

    seriesRef.current = null;

    switch (chartType) {
      case "line":
        async function fetchCandeStickData1() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "ETHBTC"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );

          } else {
            console.log("fourth insertion------------------------------");

            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "ETHBTC"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          resetZoom();

          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(LineSeries, {
            color: "#38bdf8",
           
          });
          seriesRef.current.setData(await response.data.map((d) => ({ time: d.time, value: d.close })));
        }
        fetchCandeStickData1();
        break;

      case "bar":
        apiService.post("/listing", { type: chartType }).then((res) => {
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }

          seriesRef.current = chartRef.current.addSeries(BarSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
          });

          seriesRef.current.setData(
            res.data.map((d) => ({
              time: d.time,
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
            })),
          );

          chartRef.current.timeScale().fitContent();
        });
        break;

      case "area":
        apiService.post("/listing", { type: chartType }).then(async (res) => {
          seriesRef.current = chartRef.current.addSeries(AreaSeries);
          seriesRef.current.setData(
            await res.data.map((d) => ({ time: d.time, value: d.value })),
          );
        });
        break;

      case "baseline":
        apiService.post("/listing", { type: chartType }).then(async (res) => {
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(BaselineSeries, {
            baseValue: { type: "price", price: 120 },
          });
          seriesRef.current.setData(
            await res.data.map((d) => ({ time: d.time, value: d.value })),
          );
        });
        break;

      case "histogram":
        apiService.post("/listing", { type: chartType }).then(async (res) => {
          seriesRef.current = chartRef.current.addSeries(HistogramSeries, {
            priceFormat: { type: "volume" },
            priceScaleId: "",
            scaleMargins: { top: 0.7, bottom: 0 },
          });
          seriesRef.current.setData(
            await res.data.map((d) => ({ time: d.time, value: d.value })),
          );
        });
        break;

      case "heikinashi":
        apiService.post("/listing", { type: chartType }).then(async (res) => {
          seriesRef.current = chartRef.current.addSeries(CandlestickSeries);
          seriesRef.current.setData(convertToHeikinAshi(await res.data));
        });
        break;

      case "hollow":
        apiService.post("/listing", { type: chartType }).then(async (res) => {
          seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
            upColor: "transparent",
            downColor: "#26dc35",
            borderUpColor: "#8378e2",
            borderDownColor: "#26dc35",
            wickUpColor: "#8378e2",
            wickDownColor: "#26dc35",
          });
          seriesRef.current.setData(await res.data);
        });
        break;

      case "hollowcandles":
        apiService.post("/listing", { type: chartType }).then(async (res) => {
          seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
            upColor: "transparent",
            downColor: "#ef4444",
            borderUpColor: "#22c55e",
            borderDownColor: "#ef4444",
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
          });
          seriesRef.current.setData(await res.data);
        });
        break;

      default:
        async function fetchCandeStickData() {
          let response;
          if (selectedCurrency && timeframeValue && rangeValue) {
            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "ETHBTC"}&interval=${timeframeValue ? timeframeValue : "1m"}&limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );

            console.log(
              "first insertion------------------------------",
              response,
            );
          } else if (rangeValue) {
            response = await apiService.post(
              `listing?limit=${rangeValue ? rangeValue : 1000}`,
              { type: chartType },
            );
            console.log(
              "second insertion------------------------------",
              response,
            );
          } else if (selectedCurrency) {
            console.log("third insertion------------------------------");

            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "ETHBTC"}`,
              { type: chartType },
            );
          } else {
            console.log("fourth insertion------------------------------");

            response = await apiService.post(
              `listing?symbol=${selectedCurrency ? selectedCurrency : "ETHBTC"}&limit=${rangeValue ? rangeValue : 1000}&interval=${timeframeValue ? timeframeValue : "1m"}`,
              { type: chartType },
            );
          }
          resetZoom();

          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
          }
          seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderUpColor: "#22c55e",
            borderDownColor: "#ef4444",
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
          });
          seriesRef.current.setData(await response.data);
        }
        fetchCandeStickData();
    }

    chartRef.current.timeScale().fitContent();
  }, [chartType, historicalData, rangeValue, timeframeValue]);

  const convertToHeikinAshi = (data) => {
    if (!data.length) return [];

    let prevOpen = data[0].open;
    let prevClose = data[0].close;

    return data.map((candle) => {
      const haClose =
        (candle.open + candle.high + candle.low + candle.close) / 4;

      const haOpen = (prevOpen + prevClose) / 2;

      const haHigh = Math.max(candle.high, haOpen, haClose);
      const haLow = Math.min(candle.low, haOpen, haClose);

      prevOpen = haOpen;
      prevClose = haClose;

      return {
        time: candle.time,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
      };
    });
  };

  const zoomIn = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return;

    chart.timeScale().setVisibleLogicalRange({
      from: range.from + 1,
      to: range.to - 1,
    });
  };

  // 🔎 Zoom Out
  const zoomOut = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return;

    chart.timeScale().setVisibleLogicalRange({
      from: range.from - 1,
      to: range.to + 1,
    });
  };

  // 🔄 Reset Zoom
  const resetZoom = () => {
    chartRef.current?.timeScale().fitContent();
  };

  // function generateCandles(tfSeconds, bars = 100) {
  //   let time = Math.floor(Date.now() / 1000) - bars * tfSeconds;
  //   let price = 30000;
  //   const data = [];

  //   for (let i = 0; i < bars; i++) {
  //     const open = price;
  //     const close = open + (Math.random() - 0.5) * 200;
  //     const high = Math.max(open, close) + Math.random() * 100;
  //     const low = Math.min(open, close) - Math.random() * 100;

  //     data.push({
  //       time,
  //       open: +open.toFixed(2),
  //       high: +high.toFixed(2),
  //       low: +low.toFixed(2),
  //       close: +close.toFixed(2),
  //     });

  //     price = close;
  //     time += tfSeconds;
  //   }
  //   console.log("generatedData", data);
  //   return data;
  // }

  const clearSeries = () => {
    if (!chartRef.current || !seriesRef.current) return;

    try {
      chartRef.current.removeSeries(seriesRef.current);
    } catch (e) {
      console.warn("Series already removed");
    }

    seriesRef.current = null;
  };

  const loadSeries = (type) => {
    const chart = chartRef.current;
    if (!chart) return;

    clearSeries();

    let series;

    if (type === "line") {
      series = chart.addSeries(LineSeries, { color: "#38bdf8" });
      series.setData(
        historicalData.map((d) => ({ time: d.time, value: d.close })),
      );
    }

    if (type === "bar") {
      series = chart.addSeries(BarSeries, {});
      series.setData(historicalData);
    }

    if (type === "area") {
      series = chart.addSeries(AreaSeries, {
        topColor: "rgba(56,189,248,0.4)",
        bottomColor: "rgba(56,189,248,0)",
        lineColor: "#38bdf8",
      });
      series.setData(
        historicalData.map((d) => ({ time: d.time, value: d.close })),
      );
    }

    if (type === "candlestick") {
      series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      series.setData(historicalData);
      chartRef.current.timeScale().fitContent();
    }

    if (type === "baseline") {
      series = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: +historicalData[0]?.close || 0 },
        topLineColor: "#22c55e",
        bottomLineColor: "#ef4444",
        topFillColor1: "rgba(34,197,94,0.3)",
        bottomFillColor1: "rgba(239,68,68,0.3)",
      });
      series.setData(
        historicalData.map((d) => ({ time: d.time, value: d.close })),
      );
    }

    if (type === "histogram") {
      series = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
      });
      series.setData(
        historicalData.map((d) => ({
          time: d.time,
          value: Math.floor(Math.random() * 3000 + 1000),
          color: d.close >= d.open ? "#22c55e" : "#ef4444",
        })),
      );
    }

    //      if (type === "custom") {
    //   series = chart.addSeries(CustomSeries,
    //     { priceLineVisible: false },
    //     {
    //       renderer: {
    //         draw(ctx, priceToY, timeToX, data) {
    //           ctx.fillStyle = "#fbbf24";
    //           data.forEach(point => {
    //             const x = timeToX(point.time);
    //             const y = priceToY(point.value);
    //             if (x !== null && y !== null) {
    //               ctx.beginPath();
    //               ctx.arc(x, y, 4, 0, Math.PI * 2);
    //               ctx.fill();
    //             }
    //           });
    //         },
    //       },
    //     }
    //   );
    //   series.setData(historicalData.map(d => ({ time: d.time,value: d.close}) ));
    // }

    seriesRef.current = series;
    chart.timeScale().fitContent();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
      <div>
        <ChartHeader
          timeframeValue={timeframeValue}
          setTimeframeValue={setTimeframeValue}
          rangeValue={rangeValue}
          setRangeValue={setRangeValue}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          setChartType={setChartType}
          chartType={chartType}
          selectedIndicator={selectedIndicator}
          setSelectedIndicator={setSelectedIndicator}
          loadIndicator={loadIndicator}
        />
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        className="p-2 relative m-2 rounded-md bg-white w-fit"
      >
        {/* -------------------------------sub-header live Values----------------------- */}
        <div className="flex px-2 top-2 z-50 absolute items-center gap-2 justify-start">
          {/* LEFT: Symbol */}

          <div className="text-sm text-slate-400">
            {selectedCurrency} : {timeframeValue} :
            <span
              className={`w-5 h-5 rounded-full ${
                isMarketOpen ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
          </div>

          {/* CENTER: Timeframes */}
          <div className="flex gap-1">
            {Statistics.map((frame) => (
              <button
                key={frame}
                onClick={() => setTimeframeValue(frame)}
                className={`px-2 py-1 text-xs transition
              ${
                frame === timeframeValue
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
              >
                {frame}
              </button>
            ))}
            {/* <div className="flex gap-1">
              <h2 className="px-2 py-1 text-xs">O: {liveOhlcv.open}</h2>
              <h2 className="px-2 py-1 text-xs">H: {liveOhlcv.high}</h2>
              <h2 className="px-2 py-1 text-xs">L: {liveOhlcv.low}</h2>
              <h2 className="px-2 py-1 text-xs">C: {liveOhlcv.close}</h2> 
            </div> */}


          </div>
        </div>
      </div>

      <div className="flex justify-center text-sm ml-3 text-slate-950">
        <button
          onClick={zoomIn}
          className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-md"
        >
          <LuCirclePlus /> Zoom In
        </button>
        <button
          onClick={zoomOut}
          className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-md ml-2"
        >
          <LuCircleMinus /> Zoom Out
        </button>
        <button
          onClick={resetZoom}
          className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-md ml-2"
        >
          <RiResetRightLine /> Reset
        </button>
      </div>

      <div
        className={`
                    fixed top-0 right-0 h-screen w-[400px] bg-white shadow-xl z-50
                    transform transition-transform duration-300 ease-in-out
                    ${openForm ? "translate-x-0" : "translate-x-full hidden"}
                  `}
      >
        <Form onClose={() => setOpenForm(false)} />
      </div>

      {/* Open Button */}
      {!openForm && (
        <button
          onClick={() => setOpenForm(true)}
          className="fixed bottom-6 right-6 flex items-center gap-1 px-3 py-2
                             text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-purple-500 z-50"
        >
          <FaFileWaveform />
        </button>
      )}
    </div>
  );
}
