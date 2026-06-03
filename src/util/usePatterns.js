import { useState, useEffect, useRef } from 'react';
import { LineSeries, createSeriesMarkers } from 'lightweight-charts';
import apiService from '../services/apiServices';

const normalizeTime = (t) => {
    if (typeof t === 'number') {
        return t < 20000000000 ? t * 1000 : t;
    }
    if (typeof t === 'string') {
        let ms = Date.parse(t);
        const match = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match && !isNaN(ms)) {
            const d1 = parseInt(match[1], 10);
            const d2 = parseInt(match[2], 10);
            
            // If parsed date is more than 30 days away from today, try swapping month and day
            const diff = Math.abs(ms - Date.now());
            if (diff > 30 * 24 * 60 * 60 * 1000) {
                const swappedStr = t.replace(/^(\d{1,2})\/(\d{1,2})/, `${d2}/${d1}`);
                const swappedMs = Date.parse(swappedStr);
                if (!isNaN(swappedMs)) {
                    const swappedDiff = Math.abs(swappedMs - Date.now());
                    if (swappedDiff < diff) {
                        return swappedMs;
                    }
                }
            }
        }
        if (!isNaN(ms)) return ms;
    }
    return t;
};

let uniqueCounter = 0;

const normalizePattern = (p) => {
    const normalizedTime = normalizeTime(p.time);
    const stableId = p._id || `${p.name}-${normalizedTime}-${++uniqueCounter}`;
    
    return {
        ...p,
        _id: stableId,
        time: normalizedTime,
        lines: (p.lines || []).map(line => ({
            ...line,
            start: { ...line.start, time: normalizeTime(line.start.time) },
            end: { ...line.end, time: normalizeTime(line.end.time) }
        }))
    };
};

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
                const json = await apiService.get('/api/pattern/analyze-candles', { 
                    symbol, 
                    interval, 
                    limit: 1000 
                });
                console.log(json, "pattern data");  
                
                if (json.success) {
                    const normalized = (json.detectedPatterns || []).map(normalizePattern);
                    const sortedPatterns = normalized.sort((a, b) => b.time - a.time);
                    setChartData({ 
                        patterns: sortedPatterns 
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
            const exists = chartData.patterns.some((p) => {
                return p.name === patternId || p._id === patternId;
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

        chartData.patterns.forEach((pattern) => {
            const patternUniqueId = pattern._id;
            
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
                    shape: isBullish ? 'arrowUp' : 'arrowDown',
                    id: patternUniqueId
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

    // Tooltip Hover Logic
    useEffect(() => {
        if (!chartRef?.current || !candleSeriesRef?.current) return;
        const chart = chartRef.current;
        
        let toolTip = document.getElementById('pattern-tooltip');
        if (!toolTip) {
            toolTip = document.createElement('div');
            toolTip.id = 'pattern-tooltip';
            toolTip.style = `position: absolute; display: none; padding: 10px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; pointer-events: none; border: 1px solid rgba(41, 98, 255, 0.3); box-shadow: 0 4px 10px rgba(0,0,0,0.15); border-radius: 6px; background: var(--bg-card, #ffffff); color: var(--text-main, #131722);`;
            
            const chartElement = chart.chartElement();
            if (chartElement) {
                chartElement.style.position = 'relative';
                chartElement.appendChild(toolTip);
            }
        }

        const handler = (param) => {
            if (!param.time || param.point === undefined || !param.seriesData.get(candleSeriesRef.current)) {
                toolTip.style.display = 'none';
                return;
            }

            if (!chartData || !chartData.patterns) return;
            
            const patternsAtTime = chartData.patterns.filter(p => {
                const isSelected = selectedPatterns.includes(p.name) || selectedPatterns.includes(p._id);
                const pTime = Math.floor(p.time / 1000); 
                return isSelected && pTime === param.time;
            });

            if (patternsAtTime.length === 0) {
                toolTip.style.display = 'none';
                return;
            }

            toolTip.innerHTML = patternsAtTime.map(p => {
                const isBullish = p.type && p.type.includes('Bullish');
                const isBearish = p.type && p.type.includes('Bearish');
                const color = isBullish ? '#2196F3' : (isBearish ? '#E91E63' : '#FF9800');
                return `<div style="color: ${color}; font-weight: bold; margin-bottom: 2px;">${p.name}</div><div style="font-size: 10px; color: var(--text-muted, gray);">${p.type || ''}</div>`;
            }).join('<hr style="margin: 6px 0; border: none; border-top: 1px solid var(--border-color, #e2e8f0);"/>');

            toolTip.style.display = 'block';
            
            const y = param.point.y;
            const x = param.point.x;
            const chartElement = chart.chartElement();
            
            if (chartElement) {
                let left = x + 15;
                if (left + toolTip.clientWidth > chartElement.clientWidth) {
                    left = x - 15 - toolTip.clientWidth;
                }
                
                let top = y + 15;
                if (top + toolTip.clientHeight > chartElement.clientHeight) {
                    top = y - 15 - toolTip.clientHeight;
                }
                
                toolTip.style.left = left + 'px';
                toolTip.style.top = top + 'px';
            }
        };

        chart.subscribeCrosshairMove(handler);

        return () => {
            chart.unsubscribeCrosshairMove(handler);
            if (toolTip && toolTip.parentNode) {
                toolTip.parentNode.removeChild(toolTip);
            }
        };
    }, [chartData, selectedPatterns, chartRef, candleSeriesRef]);

    const addPattern = (data) => {
        setChartData(prev => {
            let incomingPatterns = [];
            if (data && Array.isArray(data.patterns)) {
                incomingPatterns = data.patterns.map(normalizePattern);
            } else if (data && data.name) {
                incomingPatterns = [normalizePattern(data)];
            }

            if (incomingPatterns.length === 0) return prev;
            
            const prevPatterns = prev?.patterns || [];
            
            const updatedPrevPatterns = [...prevPatterns];
            const brandNewPatterns = [];
            
            incomingPatterns.forEach(incoming => {
                const existingIdx = updatedPrevPatterns.findIndex(p => p.name === incoming.name && p.time === incoming.time);
                if (existingIdx !== -1) {
                    // Update the existing pattern with new live tick data (e.g. extending lines)
                    // We must retain the original _id so it stays selected and redraws!
                    updatedPrevPatterns[existingIdx] = {
                        ...incoming,
                        _id: updatedPrevPatterns[existingIdx]._id
                    };
                } else {
                    brandNewPatterns.push(incoming);
                }
            });
            
            // If nothing changed, we could optimize, but we need to trigger a redraw for updated patterns
            const mergedPatterns = [...brandNewPatterns, ...updatedPrevPatterns].sort((a, b) => b.time - a.time);
            
            // Automatically select BRAND NEW patterns so they draw instantly on the live chart
            const newPatternIds = brandNewPatterns.map(p => p._id);

            setSelectedPatterns(currentSelected => {
                const toAdd = newPatternIds.filter(id => !currentSelected.includes(id));
                if (toAdd.length === 0) return currentSelected;
                return [...currentSelected, ...toAdd];
            });
            
            return {
                ...prev,
                patterns: mergedPatterns
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
