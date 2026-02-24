import { useRef, useEffect, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

export default function Testing() {
  const wrapperRef = useRef(null);

  const priceRef = useRef(null);
  const smaRef = useRef(null);
  const bbRef = useRef(null);

  const priceChart = useRef(null);
  const smaChart = useRef(null);
  const bbChart = useRef(null);

  // splitter Y position (px from top)
  const [splitY, setSplitY] = useState(300);

  useEffect(() => {
    priceChart.current = createChart(priceRef.current, { height: splitY });
    smaChart.current = createChart(smaRef.current, { height: 150 });
    bbChart.current = createChart(bbRef.current, { height: 150 });

    priceChart.current.addSeries(CandlestickSeries).setData([
      { time: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
      { time: "2024-01-02", open: 105, high: 115, low: 100, close: 110 },
    ]);

    const line = [
      { time: "2024-01-01", value: 102 },
      { time: "2024-01-02", value: 106 },
    ];

    smaChart.current.addSeries(LineSeries).setData(line);
    bbChart.current.addSeries(LineSeries).setData(line);

    priceChart.current.timeScale().subscribeVisibleTimeRangeChange((r) => {
      smaChart.current.timeScale().setVisibleRange(r);
      bbChart.current.timeScale().setVisibleRange(r);
    });

    return () => {
      priceChart.current.remove();
      smaChart.current.remove();
      bbChart.current.remove();
    };
  }, []);

  // 🔥 APPLY HEIGHTS ON SPLIT MOVE
  useEffect(() => {
    const total = wrapperRef.current.clientHeight;
    const indicatorH = total - splitY - 6;

    priceChart.current?.applyOptions({ height: splitY });
    smaChart.current?.applyOptions({ height: indicatorH / 2 });
    bbChart.current?.applyOptions({ height: indicatorH / 2 });
  }, [splitY]);

  // ---------- DRAG ----------
  const startDrag = (e) => {
    const rect = wrapperRef.current.getBoundingClientRect();

    const move = (ev) => {
      const y = ev.clientY - rect.top;
      setSplitY(Math.min(Math.max(150, y), rect.height - 200));
    };

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  return (
    <div
      ref={wrapperRef}
      style={{ height: "600px", width: "100%", position: "relative" }}
    >
      <div ref={priceRef} />

      {/* 🔥 FREE MOVING SPLITTER */}
      <div
        onMouseDown={startDrag}
        style={{
          height: "6px",
          cursor: "row-resize",
          background: "#888",
        }}
      />

      <div>
        <div ref={smaRef} />
        <div ref={bbRef} />
      </div>
    </div>
  );
}