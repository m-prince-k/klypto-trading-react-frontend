import {
  createChart,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  HistogramSeries,
  BaselineSeries,
  CustomSeries,
} from "lightweight-charts";
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
  const apiCalledRef = useRef(false);

  const [timeframe, setTimeframe] = useState("1m");
  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState(60);
  const [rangeValue, setRangeValue] = useState(1);
  const [chartType, setChartType] = useState("candlestick");
  const [historicalData, setHistoricalData] = useState([]);

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

  // const data = [
  //   {
  //     time: "2024-01-01",
  //     open: 100,
  //     high: 120,
  //     low: 90,
  //     close: 110,
  //     value: 110,
  //     volume: 500,
  //   },
  //   {
  //     time: "2024-01-02",
  //     open: 110,
  //     high: 130,
  //     low: 100,
  //     close: 125,
  //     value: 125,
  //     volume: 800,
  //   },
  //   {
  //     time: "2024-01-03",
  //     open: 125,
  //     high: 140,
  //     low: 115,
  //     close: 135,
  //     value: 135,
  //     volume: 650,
  //   },
  //   {
  //     time: "2024-01-04",
  //     open: 135,
  //     high: 150,
  //     low: 120,
  //     close: 145,
  //     value: 145,
  //     volume: 900,
  //   },
  // ];

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

    chartRef.current.timeScale().fitContent();
    return () => chartRef.current.remove();
  }, []);
  console.log(chartType, "===================>>>>>>>>>>>>>>>>>>>>");

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
        apiService.post("/listing", { type: chartType }).then(async (res) => {
          seriesRef.current = chartRef.current.addSeries(LineSeries, {
            color: "#38bdf8",
          });
          seriesRef.current.setData(
            await res.data.map((d) => ({ time: d.time, value: d.value })),
          );
        });
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
        apiService.post("/listing", { type: chartType }).then(async (res) => {
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
          seriesRef.current.setData(await res.data);
        });
    }

    chartRef.current.timeScale().fitContent();
  }, [chartType, historicalData]);

  // useEffect(() => {
  //   loadSeries(chartType);
  // }, [chartType]);

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
    <div className="w-screen h-screen flex flex-col bg-slate-900">
      {/* Dropdown */}
      <select
        value={chartType}
        onChange={(e) => setChartType(e.target.value)}
        className=" bg-slate-300"
      >
        <option value="candlestick">Candlestick</option>
        <option value="line">Line</option>
        <option value="bar">Bar</option>
        <option value="area">Area</option>
        <option value="baseline">Baseline</option>
        <option value="hollow">Hollow</option>
        <option value="hollowcandles">Hollow Candles</option>
        <option value="heikinashi">Heikin Ashi</option>
        <option value="histogram">Histogram (Volume)</option>
      </select>

      <ChartHeader
        price="43,250"
        change={2.15}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        setTimeframeValue={setTimeframeValue}
        setRangeValue={rangeValue}
      />

      {/* Chart */}
      <div ref={containerRef} />

       <div className="ml-3 text-slate-50">
        <button onClick={zoomIn}>➕ Zoom In</button>
        <button onClick={zoomOut} className="ml-3 ">
          ➖ Zoom Out
        </button>
        <button onClick={resetZoom} className="ml-3">
          🔄 Reset
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
