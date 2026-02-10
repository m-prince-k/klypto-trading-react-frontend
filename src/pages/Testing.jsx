import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

export default function CandleChartDemo() {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [ohlc, setOhlc] = useState(null);

  useEffect(() => {
    chartRef.current = createChart(containerRef.current, {
      height: 400,
      crosshair: { mode: 1 },
    });

    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    seriesRef.current.setData([
      { time: 1700000000, open: 100, high: 120, low: 90, close: 110 },
      { time: 1700000600, open: 110, high: 130, low: 105, close: 125 },
      { time: 1700001200, open: 125, high: 140, low: 120, close: 135 },
    ]);

    chartRef.current.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setOhlc(null);
        return;
      }

      const candle = param.seriesData?.get(seriesRef.current);
      if (!candle) return;

      setOhlc(candle);
    });

    return () => chartRef.current.remove();
  }, []);

  return (
    <div>
      {ohlc && (
        <div style={{ marginBottom: 8 }}>
          O: {ohlc.open} | H: {ohlc.high} | L: {ohlc.low} | C: {ohlc.close}
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
