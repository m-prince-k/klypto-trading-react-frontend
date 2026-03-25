import React, { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
} from "lightweight-charts";

const SupertrendChart = () => {
  const ref = useRef();

  useEffect(() => {
    const chart = createChart(ref.current, {
      width: 1000,
      height: 500,
      layout: {
        background: { color: "#0D1117" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
    }); // :white_check_mark: CANDLE (TOP LAYER FEEL)

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#00FF88",
      downColor: "#FF4D4F",
      borderUpColor: "#00FF88",
      borderDownColor: "#FF4D4F",
      wickUpColor: "#00FF88",
      wickDownColor: "#FF4D4F",
    });

    const start = Math.floor(new Date("2024-01-01").getTime() / 1000);

    const data = Array.from({ length: 150 }, (_, i) => {
      const base = 100 + Math.sin(i / 6) * 15;
      return {
        time: start + i * 86400,
        open: base + Math.random() * 5,
        high: base + Math.random() * 10,
        low: base - Math.random() * 10,
        close: base + (Math.random() - 0.5) * 10,
      };
    });

    candle.setData(data); // :fire: SUPER TREND

    function supertrend(data, period = 10, multiplier = 3) {
      let tr = [],
        atr = [];

      for (let i = 0; i < data.length; i++) {
        if (i === 0) tr.push(data[i].high - data[i].low);
        else {
          const pc = data[i - 1].close;
          tr.push(
            Math.max(
              data[i].high - data[i].low,
              Math.abs(data[i].high - pc),
              Math.abs(data[i].low - pc),
            ),
          );
        }
      }

      for (let i = 0; i < tr.length; i++) {
        if (i < period) atr.push(null);
        else {
          let sum = 0;
          for (let j = i - period; j < i; j++) sum += tr[j];
          atr.push(sum / period);
        }
      }

      let res = [],
        dir = 1,
        prevU = 0,
        prevL = 0;

      for (let i = 0; i < data.length; i++) {
        if (!atr[i]) {
          res.push(null);
          continue;
        }

        const hl2 = (data[i].high + data[i].low) / 2;
        const upper = hl2 + multiplier * atr[i];
        const lower = hl2 - multiplier * atr[i];

        let fU = upper,
          fL = lower;

        if (i > 0) {
          fU = upper < prevU || data[i - 1].close > prevU ? upper : prevU;
          fL = lower > prevL || data[i - 1].close < prevL ? lower : prevL;
        }

        if (data[i].close > prevU) dir = 1;
        else if (data[i].close < prevL) dir = -1;

        const value = dir === 1 ? fL : fU;

        res.push({
          time: data[i].time,
          value,
          direction: dir,
        });

        prevU = fU;
        prevL = fL;
      }

      return res.filter(Boolean);
    }

    const st = supertrend(data); // :fire: SPLIT SEGMENTS (LINE BREAK)

    let segments = [];
    let current = [];

    for (let i = 0; i < st.length; i++) {
      if (!current.length) {
        current.push(st[i]);
        continue;
      }

      const prev = current[current.length - 1];

      if (st[i].direction !== prev.direction) {
        segments.push([...current]);
        current = [];
      }

      current.push(st[i]);
    }

    if (current.length) segments.push(current); // :fire: DRAW BAND + LINE

    segments.forEach((seg) => {
      const isBull = seg[0].direction === 1;

      const candleMap = {};
      data.forEach((c) => (candleMap[c.time] = c)); // :fire: Upper boundary (candle side)

      const topData = seg
        .map((d) => {
          const c = candleMap[d.time];
          if (!c) return null;

          return {
            time: d.time,
            value: isBull ? d.value : c.high, // red = high
          };
        })
        .filter(Boolean); // :fire: Lower boundary (line side)

      const bottomData = seg
        .map((d) => {
          const c = candleMap[d.time];
          if (!c) return null;

          return {
            time: d.time,
            value: isBull ? c.low : d.value, // green = low
          };
        })
        .filter(Boolean); // :white_check_mark: AREA (TRICK: stack illusion)

      const area = chart.addSeries(AreaSeries, {
        lineColor: "transparent",
        topColor: isBull
          ? "rgba(0, 247, 132, 100)" // :large_green_circle: dense green
          : "rgba(248, 1, 6, 100)", // :red_circle: dense red
        bottomColor: "transparent",
      }); // :point_down: midpoint trick to keep inside

      const areaData = seg
        .map((d) => {
          const c = candleMap[d.time];
          if (!c) return null;

          let top = isBull ? d.value : c.high;
          let bottom = isBull ? c.low : d.value;

          return {
            time: d.time,
            value: (top + bottom) / 2,
          };
        })
        .filter(Boolean);

      area.setData(areaData); // :white_check_mark: SUPER TREND LINE

      const line = chart.addSeries(LineSeries, {
        color: isBull ? "#00FF88" : "#FF4D4F",
        lineWidth: 2,
      });

      line.setData(
        seg.map((d) => ({
          time: d.time,
          value: d.value,
        })),
      );
    });

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, []);

  return <div ref={ref} />;
};

export default SupertrendChart;
