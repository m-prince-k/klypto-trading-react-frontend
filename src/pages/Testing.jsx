import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries, createSeriesMarkers } from 'lightweight-charts';

const PatternChart = ({ symbol = 'BTCUSDT', interval = '15m' }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candleSeriesRef = useRef(null);
    const markersPluginRef = useRef(null);
    const patternSeriesRefs = useRef([]);
    
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const [selectedPatterns, setSelectedPatterns] = useState([]);
    
    const [availablePatterns, setAvailablePatterns] = useState([]);
    const [sidebarMode, setSidebarMode] = useState('detected');

    // ✅ NEW: modal state
    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState('');

    const togglePattern = (patternId) => {
    if (chartData && chartData.patterns) {
        const exists = chartData.patterns.some((p, idx) => {
            const uniqueId = `${p.name}-${p.time}-${idx}`;
            return p.name === patternId || uniqueId === patternId;
        });

        if (!exists) {
            setModalText(`No "${patternId}" pattern identified on this chart.`);
            setShowModal(true);
            return;
        }
    }

    setSelectedPatterns(prev => 
        prev.includes(patternId) 
            ? prev.filter(p => p !== patternId)
            : [...prev, patternId]
    );
};

    // 0. Fetch available pattern names
    useEffect(() => {
        const fetchPatternNames = async () => {
            try {
                const res = await fetch(`http://192.168.1.13:7000/api/patterns/all-names`);
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setAvailablePatterns(data);
                } else if (data && data.patterns && Array.isArray(data.patterns)) {
                    setAvailablePatterns(data.patterns);
                } else if (data && data.data && Array.isArray(data.data)) {
                    setAvailablePatterns(data.data);
                }
            } catch (error) {
                console.error("Error fetching pattern names:", error);
            }
        };
        fetchPatternNames();
    }, []);

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://192.168.1.13:7000/api/patterns/detect?symbol=${symbol}&interval=${interval}&limit=1000`);
                const json = await res.json();
                
                if (json.success) {
                    const seenTimes = new Set();
                    const formattedCandles = [];

                    if (json.candles) {
                        json.candles.forEach(c => {
                            const timeInSeconds = Math.floor(c.time / 1000);
                            if (!seenTimes.has(timeInSeconds)) {
                                seenTimes.add(timeInSeconds);
                                formattedCandles.push({
                                    time: timeInSeconds,
                                    open: parseFloat(c.open),
                                    high: parseFloat(c.high),
                                    low: parseFloat(c.low),
                                    close: parseFloat(c.close)
                                });
                            }
                        });
                        formattedCandles.sort((a, b) => a.time - b.time);
                    }

                    setChartData({ 
                        candles: formattedCandles, 
                        patterns: json.detectedPatterns || [] 
                    });
                }
            } catch (error) {
                console.error("Error fetching pattern data:", error);
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
            height: chartContainerRef.current.clientHeight || 600,
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

        const markersPlugin = createSeriesMarkers(candleSeries, []);

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        markersPluginRef.current = markersPlugin;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []);

    // 3. Draw Data & Patterns
    useEffect(() => {
        if (!chartData || !chartRef.current || !candleSeriesRef.current) return;

        if (chartData.candles.length > 0) {
            candleSeriesRef.current.setData(chartData.candles);
        }

        patternSeriesRefs.current.forEach(series => {
            try {
                chartRef.current.removeSeries(series);
            } catch(e) {}
        });
        patternSeriesRefs.current = [];
        
        const markers = [];

        chartData.patterns.forEach((pattern, idx) => {
            const patternUniqueId = `${pattern.name}-${pattern.time}-${idx}`;
            
            if (!selectedPatterns.includes(pattern.name) && !selectedPatterns.includes(patternUniqueId)) return;

            const isBullish = pattern.type && pattern.type.includes('Bullish');
            const isBearish = pattern.type && pattern.type.includes('Bearish');
            const color = isBullish ? '#2196F3' : (isBearish ? '#E91E63' : '#FF9800');

            if (pattern.lines && pattern.lines.length > 0) {
                pattern.lines.forEach(segment => {
                    const lineSeries = chartRef.current.addSeries(LineSeries, {
                        color: color,
                        lineWidth: 2,
                        crosshairMarkerVisible: false,
                        lastValueVisible: false,
                        priceLineVisible: false,
                        autoscaleInfoProvider: () => null,
                        priceScaleId: 'right',
                    });
                    
                    const p1 = { time: Math.floor(segment.start.time / 1000), value: parseFloat(segment.start.price) };
                    const p2 = { time: Math.floor(segment.end.time / 1000), value: parseFloat(segment.end.price) };
                    
                    // ✅ FIX: prevent duplicate timestamp crash
                    if (!p1.time || !p2.time || p1.time === p2.time) return;

                    const sortedPoints = p1.time <= p2.time ? [p1, p2] : [p2, p1];
                    lineSeries.setData(sortedPoints);
                    patternSeriesRefs.current.push(lineSeries);
                });
            }
            
            if (pattern.time) {
                markers.push({
                    time: Math.floor(pattern.time / 1000),
                    position: isBullish ? 'belowBar' : (isBearish ? 'aboveBar' : 'inBar'),
                    color: color,
                    shape: isBullish ? 'arrowUp' : (isBearish ? 'arrowDown' : 'circle'),
                    text: pattern.name,
                });
            }
        });
        
        markers.sort((a, b) => a.time - b.time);
        if (markersPluginRef.current) {
            markersPluginRef.current.setMarkers(markers);
        }
    }, [chartData, selectedPatterns]);

    const renderPatternList = () => {
        if (sidebarMode === 'all') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availablePatterns.map((item, idx) => {
                        const name = typeof item === 'string' ? item : (item.name || item.id || `Pattern ${idx}`);
                        return (
                            <label key={`all-${idx}`} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                color: selectedPatterns.includes(name) ? '#2196F3' : '#D1D1DF',
                                transition: 'color 0.2s'
                            }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedPatterns.includes(name)}
                                    onChange={() => togglePattern(name)}
                                    style={{ accentColor: '#2196F3', width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                {name}
                            </label>
                        );
                    })}
                    {availablePatterns.length === 0 && (
                        <div style={{ color: '#8B8BA7', fontSize: '12px' }}>No patterns fetched from API yet.</div>
                    )}
                </div>
            );
        }

        if (!chartData || !chartData.patterns || chartData.patterns.length === 0) {
            return <div style={{ color: '#8B8BA7', fontSize: '12px' }}>No patterns detected on this chart.</div>;
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chartData.patterns.map((pattern, idx) => {
                    const uniqueId = `${pattern.name}-${pattern.time}-${idx}`;
                    const isSelected = selectedPatterns.includes(uniqueId) || selectedPatterns.includes(pattern.name);
                    
                    const isBullish = pattern.type && pattern.type.includes('Bullish');
                    const isBearish = pattern.type && pattern.type.includes('Bearish');
                    const dotColor = isBullish ? '#2196F3' : (isBearish ? '#E91E63' : '#FF9800');

                    return (
                        <div 
                            key={uniqueId} 
                            onClick={() => togglePattern(uniqueId)}
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '4px',
                                padding: '10px',
                                backgroundColor: isSelected ? '#3E3E4F' : '#2A2A35',
                                borderRadius: '6px',
                                border: `1px solid ${isSelected ? '#2196F3' : '#3E3E4F'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor }} />
                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: isSelected ? '#FFF' : '#D1D1DF' }}>
                                        {pattern.name}
                                    </span>
                                </div>
                                {pattern.confidence && (
                                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#1E1E1E', color: '#8B8BA7' }}>
                                        {pattern.confidence}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#8B8BA7', marginLeft: '14px' }}>
                                {new Date(pattern.time).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#1E1E1E' }}>
            
            {/* ✅ Modal (added, no layout changes) */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999
                }}>
                    <div style={{
                        backgroundColor: '#2A2A35',
                        padding: '20px',
                        borderRadius: '8px',
                        color: 'white',
                        minWidth: '300px',
                        textAlign: 'center'
                    }}>
                        <p>{modalText}</p>
                        <button 
                            onClick={() => setShowModal(false)}
                            style={{
                                marginTop: '10px',
                                padding: '6px 12px',
                                backgroundColor: '#2196F3',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div style={{ 
                width: '320px', 
                backgroundColor: '#2A2A35', 
                borderRight: '1px solid #3E3E4F',
                padding: '20px',
                overflowY: 'auto',
                color: 'white',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#FFF' }}>
                    Chart Patterns
                </h3>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => setSidebarMode('detected')} style={{
                        flex: 1, padding: '8px', borderRadius: '4px', border: 'none',
                        backgroundColor: sidebarMode === 'detected' ? '#2196F3' : '#3E3E4F',
                        color: 'white', fontSize: '12px', fontWeight: 'bold'
                    }}>
                        Detected ({chartData?.patterns?.length || 0})
                    </button>
                    <button onClick={() => setSidebarMode('all')} style={{
                        flex: 1, padding: '8px', borderRadius: '4px', border: 'none',
                        backgroundColor: sidebarMode === 'all' ? '#2196F3' : '#3E3E4F',
                        color: 'white', fontSize: '12px', fontWeight: 'bold'
                    }}>
                        All Types
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {renderPatternList()}
                </div>
            </div>

            {/* Chart Area */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #2B2B43', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>
                        Pattern Detection ({symbol} - {interval})
                    </h2>
                    <div style={{ backgroundColor: '#2196F3', color: '#FFF', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        Total Detected: {chartData?.patterns?.length || 0}
                    </div>
                </div>
                
                <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                    {loading && (
                        <div style={{ 
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'rgba(30, 30, 30, 0.7)', color: 'white', zIndex: 10,
                            fontSize: '16px', fontWeight: 'bold'
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