import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';

const PATTERN_CATEGORIES = [
  {
    title: "Classic Patterns",
    items: [
      { id: "Double Top", label: "🏔️ Double Top (M-Shape)" },
      { id: "Double Bottom", label: "🕳️ Double Bottom (W-Shape)" },
      { id: "Head & Shoulders", label: "👤 Head & Shoulders" },
      { id: "Inverse Head & Shoulders", label: "👤 Inverse Head & Shoulders" },
      { id: "Symmetrical Triangle", label: "📐 Symmetrical Triangle" },
      { id: "Ascending Triangle", label: "📈 Ascending Triangle" },
      { id: "Descending Triangle", label: "📉 Descending Triangle" },
      { id: "Rising Wedge", label: "📉 Rising Wedge" },
      { id: "Falling Wedge", label: "📈 Falling Wedge" },
    ]
  },
  {
    title: "🚩 Pole-Based Momentum Patterns (Breakouts)",
    items: [
      { id: "Bull Flag", label: "🐂 Bull Flag (Pole + Parallel Channel)" },
      { id: "Bear Flag", label: "🐻 Bear Flag (Pole + Parallel Channel)" },
      { id: "Bull Pennant", label: "🐂 Bull Pennant (Pole + Small Triangle)" },
      { id: "Bear Pennant", label: "🐻 Bear Pennant (Pole + Small Triangle)" },
    ]
  },
  {
    title: "🕯️ Advanced Candlestick Patterns (2 to 3 Candles)",
    items: [
      { id: "Three White Soldiers", label: "⚔️ Three White Soldiers (Strong Bullish Continuation)" },
      { id: "Three Black Crows", label: "🐦‍⬛ Three Black Crows (Strong Bearish Continuation)" },
      { id: "Bullish Harami", label: "🤰 Bullish Harami (Inside Bar Reversal)" },
      { id: "Bearish Harami", label: "🤰 Bearish Harami (Inside Bar Reversal)" },
      { id: "Piercing Line", label: "🌤️ Piercing Line (Bullish Reversal)" },
      { id: "Dark Cloud Cover", label: "⛈️ Dark Cloud Cover (Bearish Reversal)" },
      { id: "Tweezer Top", label: "🥢 Tweezer Top (Exact High Match)" },
      { id: "Tweezer Bottom", label: "🥢 Tweezer Bottom (Exact Low Match)" },
      { id: "Morning Star", label: "🌅 Morning Star" },
      { id: "Evening Star", label: "🌇 Evening Star" },
      { id: "Bullish Engulfing", label: "📈 Bullish Engulfing" },
      { id: "Bearish Engulfing", label: "📉 Bearish Engulfing" },
      { id: "Hammer", label: "🔨 Hammer" },
      { id: "Shooting Star", label: "🌠 Shooting Star" },
    ]
  }
];

const PatternChart = ({ symbol = 'BTCUSDT', interval = '15m' }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const patternSeriesRefs = useRef([]);

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [selectedPatterns, setSelectedPatterns] = useState([]);

  const togglePattern = (patternId) => {
    setSelectedPatterns(prev =>
      prev.includes(patternId)
        ? prev.filter(p => p !== patternId)
        : [...prev, patternId]
    );
  };

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://192.168.1.13:7000/api/patterns/detect?symbol=${symbol}&interval=${interval}&limit=1000`
        );
        const json = await res.json();

        if (json.success) {
          const seenTimes = new Set();
          const formattedCandles = [];

          json.candles.forEach(c => {
            const timeInSeconds = Math.floor(c.time / 1000);
            if (!seenTimes.has(timeInSeconds)) {
              seenTimes.add(timeInSeconds);
              formattedCandles.push({
                time: timeInSeconds,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
              });
            }
          });

          formattedCandles.sort((a, b) => a.time - b.time);
          setChartData({ candles: formattedCandles, patterns: json.detectedPatterns });
        }
      } catch (error) {
        console.error('Error fetching pattern data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, interval]);

  // 2. Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { color: '#1E1E1E' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26A69A',
      downColor: '#EF5350',
      borderVisible: false,
      wickUpColor: '#26A69A',
      wickDownColor: '#EF5350',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  // 3. Draw Data & Patterns
  useEffect(() => {
    if (!chartData || !chartRef.current || !candleSeriesRef.current) return;

    // Set candles
    candleSeriesRef.current.setData(chartData.candles);

    // Clear existing pattern lines
    patternSeriesRefs.current.forEach(series => {
      try {
        chartRef.current.removeSeries(series);
      } catch (e) {}
    });
    patternSeriesRefs.current = [];

    // Draw lines for selected patterns
    chartData.patterns.forEach(pattern => {
      if (!selectedPatterns.includes(pattern.name)) return;

      const isBullish = pattern.type.includes('Bullish');
      const isBearish = pattern.type.includes('Bearish');
      const color = isBullish ? '#2196F3' : isBearish ? '#E91E63' : '#FF9800';

      if (pattern.lines && pattern.lines.length > 0) {
        pattern.lines.forEach(segment => {
          const lineSeries = chartRef.current.addSeries(LineSeries, {
            color,
            lineWidth: 2,
            crosshairMarkerVisible: false,
            lastValueVisible: false,
            priceLineVisible: false,
          });

          const p1 = { time: Math.floor(segment.start.time / 1000), value: segment.start.price };
          const p2 = { time: Math.floor(segment.end.time / 1000), value: segment.end.price };

          // lightweight-charts requires data sorted by time
          const sortedPoints = p1.time <= p2.time ? [p1, p2] : [p2, p1];
          lineSeries.setData(sortedPoints);
          patternSeriesRefs.current.push(lineSeries);
        });
      }
    });
  }, [chartData, selectedPatterns]);

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 80px)', backgroundColor: '#1E1E1E' }}>

      {/* Sidebar */}
      <div style={{
        width: '320px',
        backgroundColor: '#2A2A35',
        borderRight: '1px solid #3E3E4F',
        padding: '20px',
        overflowY: 'auto',
        color: 'white',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#FFF' }}>
          Chart Patterns
        </h3>

        {PATTERN_CATEGORIES.map((category, catIdx) => (
          <div key={catIdx} style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#8B8BA7',
              textTransform: 'uppercase',
              marginBottom: '12px',
              borderBottom: '1px solid #3E3E4F',
              paddingBottom: '6px',
            }}>
              {category.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {category.items.map(item => (
                <label key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: selectedPatterns.includes(item.id) ? '#2196F3' : '#D1D1DF',
                  transition: 'color 0.2s',
                }}>
                  <input
                    type="checkbox"
                    checked={selectedPatterns.includes(item.id)}
                    onChange={() => togglePattern(item.id)}
                    style={{ accentColor: '#2196F3', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2B2B43' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>
            Pattern Detection ({symbol} - {interval})
          </h2>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(30, 30, 30, 0.7)', color: 'white', zIndex: 10,
              fontSize: '16px', fontWeight: 'bold',
            }}>
              Loading Chart & Patterns...
            </div>
          )}
          <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default PatternChart;