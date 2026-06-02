import { useState, useEffect, useRef } from 'react';
import { LineSeries, createSeriesMarkers } from 'lightweight-charts';
import apiService from '../services/apiServices';

export const usePatterns = (symbol, interval, chartRef, candleSeriesRef) => {
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [selectedPatterns, setSelectedPatterns] = useState([]);
    const [availablePatterns, setAvailablePatterns] = useState([]);
    const [sidebarMode, setSidebarMode] = useState('detected');
    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState('');

    const patternSeriesRefs = useRef([]);
    const markersPluginRef = useRef(null);

    // Initial setup for markers
    useEffect(() => {
        if (!candleSeriesRef?.current) return;
        
        try {
            // Try to initialize markers plugin if available
            if (typeof createSeriesMarkers === 'function') {
                markersPluginRef.current = createSeriesMarkers(candleSeriesRef.current, []);
            }
        } catch (e) {
            console.warn("Could not init markers plugin", e);
        }
    }, [candleSeriesRef?.current]);

    useEffect(() => {
        const fetchPatternNames = async () => {
            try {
                const data = await apiService.get('/api/patterns/all-names');
                
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

    useEffect(() => {
        const fetchData = async () => {
            if (!symbol || !interval) return;
            
            try {
                setLoading(true);
                const json = await apiService.get('/api/patterns/detect', { 
                    symbol, 
                    interval, 
                    limit: 1000 
                });
                console.log(json, "pattern data");  
                
                if (json.success) {
                    setChartData({ 
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

    // Draw logic
    useEffect(() => {
        if (!chartData || !chartRef?.current || !candleSeriesRef?.current) return;

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
                // Group connected segments into continuous paths
                const paths = [];
                let currentPath = [];

                pattern.lines.forEach(segment => {
                    let p1 = { time: Math.floor(segment.start.time / 1000), value: parseFloat(segment.start.price) };
                    let p2 = { time: Math.floor(segment.end.time / 1000), value: parseFloat(segment.end.price) };
                    
                    if (!p1.time || !p2.time || p1.time === p2.time) return;

                    // Ensure p1 is before p2
                    if (p1.time > p2.time) {
                        const temp = p1; p1 = p2; p2 = temp;
                    }

                    if (currentPath.length === 0) {
                        currentPath.push(p1, p2);
                    } else {
                        const lastPoint = currentPath[currentPath.length - 1];
                        // If segment connects to the last point (within 1-2 periods to be safe)
                        if (p1.time === lastPoint.time || (p1.time > lastPoint.time && (p1.time - lastPoint.time) <= 86400)) {
                            // Only add p2 if p1.time strictly equals lastPoint.time
                            // If it's slightly off, add both to continue path
                            if (p1.time !== lastPoint.time) {
                                currentPath.push(p1);
                            }
                            currentPath.push(p2);
                        } else {
                            // Not connected, start a new path
                            paths.push(currentPath);
                            currentPath = [p1, p2];
                        }
                    }
                });
                if (currentPath.length > 0) paths.push(currentPath);

                const isCurved = pattern.name && (
                    pattern.name.toLowerCase().includes('cup') || 
                    pattern.name.toLowerCase().includes('arc') || 
                    pattern.name.toLowerCase().includes('rounded')
                );

                paths.forEach(path => {
                    // Filter to ensure strict ascending time
                    const uniquePath = [];
                    path.forEach(pt => {
                        if (uniquePath.length === 0 || pt.time > uniquePath[uniquePath.length - 1].time) {
                            uniquePath.push(pt);
                        }
                    });

                    if (uniquePath.length > 1) {
                        const lineSeries = chartRef.current.addSeries(LineSeries, {
                            color: color,
                            lineWidth: 2,
                            lineType: isCurved ? 2 : 0, // 2 = Curved, 0 = Simple/Straight
                            crosshairMarkerVisible: false,
                            lastValueVisible: false,
                            priceLineVisible: false,
                            autoscaleInfoProvider: () => null,
                            priceScaleId: 'right',
                        });
                        lineSeries.setData(uniquePath);
                        patternSeriesRefs.current.push(lineSeries);
                    }
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
        
        try {
            if (markersPluginRef.current && typeof markersPluginRef.current.setMarkers === 'function') {
                markersPluginRef.current.setMarkers(markers);
            } else if (typeof candleSeriesRef.current.setMarkers === 'function') {
                candleSeriesRef.current.setMarkers(markers);
            }
        } catch (e) {
            console.warn("Failed to set markers", e);
        }

    }, [chartData, selectedPatterns, chartRef, candleSeriesRef]);

    const addPattern = (newPattern) => {
        setChartData(prev => {
            if (!prev) return { patterns: [newPattern] };
            
            const exists = prev.patterns.some(p => 
                p.name === newPattern.name && p.time === newPattern.time
            );
            if (exists) return prev;
            
            return {
                ...prev,
                patterns: [newPattern, ...prev.patterns]
            };
        });
    };

    return {
        loading,
        chartData,
        selectedPatterns,
        availablePatterns,
        sidebarMode,
        setSidebarMode,
        togglePattern,
        showModal,
        setShowModal,
        modalText,
        addPattern
    };
};
