import React, { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
} from "lightweight-charts";

export default function ParabolicSARChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 900,
      height: 500,
    });

    const candleSeries = chart.addSeries(CandlestickSeries);

    const candles = [];
    let price = 100;
    const start = new Date(2024, 2, 1);

    for (let i = 0; i < 120; i++) {
      price += (Math.random() - 0.5) * 5;

      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      candles.push({
        time: `${yyyy}-${mm}-${dd}`,
        open: price - 2,
        high: price + 3,
        low: price - 3,
        close: price,
      });
    }

    candleSeries.setData(candles);

    // PARABOLIC SAR
    function calculateSAR(data, step = 0.02, max = 0.2) {
      let sar = data[0].low;
      let ep = data[0].high;
      let af = step;
      let upTrend = true;

      const result = [];

      for (let i = 1; i < data.length; i++) {
        sar = sar + af * (ep - sar);

        if (upTrend) {
          if (data[i].low < sar) {
            upTrend = false;
            sar = ep;
            ep = data[i].low;
            af = step;
          } else {
            if (data[i].high > ep) {
              ep = data[i].high;
              af = Math.min(af + step, max);
            }
          }
        } else {
          if (data[i].high > sar) {
            upTrend = true;
            sar = ep;
            ep = data[i].high;
            af = step;
          } else {
            if (data[i].low < ep) {
              ep = data[i].low;
              af = Math.min(af + step, max);
            }
          }
        }

        result.push({
          time: data[i].time,
          value: sar,
        });
      }

      return result;
    }

    const sarData = calculateSAR(candles);

    // SAR SERIES
    const sarSeries = chart.addSeries(LineSeries, {
      color: "#2962FF",
      lineWidth: 0,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
    });

    sarSeries.setData(sarData);

    // MARKERS (DOTS)
    const markers = sarData.map((p) => ({
      time: p.time,
      position: "inBar",
      color: "#2962FF",
      shape: "circle",
    }));

    createSeriesMarkers(sarSeries, markers);

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, []);

  return (
    <div>
      <h2>Parabolic SAR Indicator</h2>

      <div
        ref={chartRef}
        style={{
          width: "900px",
          height: "500px",
        }}
      ></div>
    </div>
  );
}
