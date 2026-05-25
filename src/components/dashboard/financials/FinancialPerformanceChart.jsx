import React, { useEffect, useRef } from 'react';
import { CandlestickSeries, createChart, HistogramSeries } from 'lightweight-charts';

export default function FinancialPerformanceChart({
  price,
  change24h,
  klines,
  selectedPeriod,
  setSelectedPeriod,
  volume24h,
  formatNum,
  formatLarge,
  changeColor
}) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      crosshair: {
        mode: 1, // normal
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.1)',
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries,{
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial size with a small delay to ensure container is fully mounted
    setTimeout(handleResize, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!klines || !klines.length || !candleSeriesRef.current || !volumeSeriesRef.current) return;
    
    // Sort array by time ascending to satisfy lightweight-charts requirement
    const sortedKlines = [...klines].sort((a, b) => a.time - b.time);

    // Deduplicate array by time to prevent Lightweight Charts Duplicate Time Error
    const uniqueKlines = [];
    const seenTimes = new Set();
    for (const k of sortedKlines) {
       // Convert to seconds if it's in ms
       const timeSeconds = k.time > 1e11 ? Math.floor(k.time / 1000) : Math.floor(k.time);
       if (!seenTimes.has(timeSeconds)) {
           seenTimes.add(timeSeconds);
           uniqueKlines.push({
             ...k,
             time: timeSeconds
           });
       }
    }

    const candleData = uniqueKlines.map(k => ({
      time: k.time,
      open: Number(k.open),
      high: Number(k.high),
      low: Number(k.low),
      close: Number(k.close),
    }));

    const volumeData = uniqueKlines.map(k => ({
      time: k.time,
      value: Number(k.volume),
      color: Number(k.close) >= Number(k.open) ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
    }));

    try {
      candleSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volumeData);
      
      if (chartInstanceRef.current) {
        chartInstanceRef.current.timeScale().fitContent();
      }
    } catch (err) {
      console.error("Error setting chart data:", err);
    }
  }, [klines]);

  return (
    <div className="fin-col-4">
      <div className="fin-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="fin-card-title"><span className="icon">📊</span> 4. PRICE PERFORMANCE & CHARTS</div>
        <div className="fin-chart-filters" style={{ marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['15m','1h','4h','1d','1w','1M'].map(p => (
            <span 
              key={p} 
              className={`fin-chart-filter ${selectedPeriod === p ? 'active' : ''}`}
              style={{
                cursor: 'pointer', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '10px',
                fontWeight: selectedPeriod === p ? '600' : '500',
                backgroundColor: selectedPeriod === p ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                color: selectedPeriod === p ? '#ffffff' : '#94a3b8',
                border: '1px solid',
                borderColor: selectedPeriod === p ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase'
              }} 
              onClick={() => setSelectedPeriod(p)}
            >
              {p}
            </span>
          ))}
        </div>

        {/* Lightweight Charts Container */}
        <div 
          ref={chartContainerRef} 
          style={{ width: '100%', flex: 1, minHeight: '300px', position: 'relative' }}
        >
          {(!klines || klines.length === 0) && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', 
              transform: 'translate(-50%, -50%)', 
              color:'#334155', fontSize:'12px', zIndex: 10
            }}>
              Loading chart data...
            </div>
          )}
        </div>

        <div style={{textAlign:'right', fontSize:'10px', color:'#94a3b8', marginTop:'8px'}}>
          24h Volume: ${formatLarge(volume24h)}
        </div>
      </div>
    </div>
  );
}
