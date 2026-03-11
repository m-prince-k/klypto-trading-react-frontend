import React, { useEffect, useRef, useState } from "react";
import { createChart, LineSeries, AreaSeries } from "lightweight-charts";

/* ================= SAMPLE DATA ================= */

function generateOHLC(count = 300) {
  const data = [];
  let price = 70000;

  for (let i = 0; i < count; i++) {
    const open = price;
    const close = open + (Math.random() - 0.5) * 250;
    const high = Math.max(open, close) + Math.random() * 80;
    const low = Math.min(open, close) - Math.random() * 80;

    price = close;

    data.push({
      time: i,
      open,
      high,
      low,
      close,
    });
  }

  return data;
}

/* ================= DONCHIAN ================= */

function donchian(data, len) {
  return data.map((_, i) => {
    if (i < len) return null;

    let high = -Infinity;
    let low = Infinity;

    for (let j = i - len; j <= i; j++) {
      high = Math.max(high, data[j].high);
      low = Math.min(low, data[j].low);
    }

    return (high + low) / 2;
  });
}

/* ================= SAFE MAP ================= */

function mapSeries(arr, offset = 0) {
  return arr
    .map((v, i) =>
      v == null
        ? null
        : {
            time: i + offset,
            value: v,
          }
    )
    .filter(Boolean);
}

/* ================= COMPONENT ================= */

export default function IchimokuProfessional() {
  const chartRef = useRef(null);
  const chart = useRef(null);
  const series = useRef({});
  const dataRef = useRef([]);

  /* ================= STYLE SETTINGS ================= */

  const [style, setStyle] = useState({
    conversion: { color: "#2962FF", width: 2 },
    base: { color: "#B71C1C", width: 2 },
    spanA: { color: "#43A047", width: 2 },
    spanB: { color: "#E53935", width: 2 },
    lagging: { color: "#2E7D32", width: 2 },

    bullCloud: "rgba(67,160,71,0.35)",
    bearCloud: "rgba(244,67,54,0.35)",
  });

  /* ================= CREATE CHART ================= */

  useEffect(() => {
    chart.current = createChart(chartRef.current, {
      width: 950,
      height: 520,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
    });

    /* ================= LINES ================= */

    series.current.conversion = chart.current.addSeries(LineSeries, {});
    series.current.base = chart.current.addSeries(LineSeries, {});
    series.current.spanA = chart.current.addSeries(LineSeries, {});
    series.current.spanB = chart.current.addSeries(LineSeries, {});
    series.current.lagging = chart.current.addSeries(LineSeries, {});

    /* ================= CLOUD ================= */

    series.current.cloudTop = chart.current.addSeries(AreaSeries, {
      lineWidth: 0,
      topColor: "transparent",
      bottomColor: style.bullCloud,
    });

    series.current.cloudBottom = chart.current.addSeries(AreaSeries, {
      lineWidth: 0,
      topColor: style.bullCloud,
      bottomColor: "transparent",
    });

    dataRef.current = generateOHLC();
  }, []);

  /* ================= ICHIMOKU LOGIC ================= */

  useEffect(() => {
    if (!chart.current) return;

    const data = dataRef.current;

    const conversionPeriods = 9;
    const basePeriods = 26;
    const spanBPeriods = 52;
    const displacement = 26;

    const conversion = donchian(data, conversionPeriods);
    const base = donchian(data, basePeriods);
    const spanB = donchian(data, spanBPeriods);

    const spanA = conversion.map((v, i) =>
      v && base[i] ? (v + base[i]) / 2 : null
    );

    /* ================= LINE DATA ================= */

    series.current.conversion.setData(mapSeries(conversion));
    series.current.base.setData(mapSeries(base));

    series.current.lagging.setData(
      data.map((p, i) => ({
        time: i - displacement,
        value: p.close,
      }))
    );

    const shiftedA = mapSeries(spanA, displacement);
    const shiftedB = mapSeries(spanB, displacement);

    series.current.spanA.setData(shiftedA);
    series.current.spanB.setData(shiftedB);

    /* ================= CLOUD BETWEEN SPANS ================= */

    const cloudTop = [];
    const cloudBottom = [];

    shiftedA.forEach((a, i) => {
      const b = shiftedB[i];
      if (!a || !b) return;

      const upper = Math.max(a.value, b.value);
      const lower = Math.min(a.value, b.value);

      const bullish = a.value > b.value;

      const color = bullish ? style.bullCloud : style.bearCloud;

      cloudTop.push({
        time: a.time,
        value: upper,
        color,
      });

      cloudBottom.push({
        time: a.time,
        value: lower,
        color,
      });
    });

    series.current.cloudTop.setData(cloudTop);
    series.current.cloudBottom.setData(cloudBottom);

    /* ================= APPLY STYLE ================= */

    series.current.conversion.applyOptions(style.conversion);
    series.current.base.applyOptions(style.base);
    series.current.spanA.applyOptions(style.spanA);
    series.current.spanB.applyOptions(style.spanB);
    series.current.lagging.applyOptions(style.lagging);
  }, [style]);

  /* ================= STYLE CONTROLS ================= */

  const updateLine = (key, field, value) => {
    setStyle((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  return (
    <div>
      <h2>Professional Ichimoku Cloud</h2>

      <div style={{ display: "flex", gap: 30 }}>
        <div ref={chartRef}></div>

        <div style={{ width: 260 }}>
          <h3>Palette</h3>

          {Object.entries(style).map(([key, val]) => {
            if (typeof val === "string") {
              return (
                <div key={key}>
                  {key}
                  <input
                    type="color"
                    value={val}
                    onChange={(e) =>
                      setStyle((p) => ({
                        ...p,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
              );
            }

            return (
              <div key={key}>
                <div>{key}</div>

                <input
                  type="color"
                  value={val.color}
                  onChange={(e) =>
                    updateLine(key, "color", e.target.value)
                  }
                />

                <input
                  type="number"
                  min={1}
                  max={5}
                  value={val.width}
                  onChange={(e) =>
                    updateLine(key, "width", Number(e.target.value))
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}