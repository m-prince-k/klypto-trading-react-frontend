import { useState, useEffect } from 'react';
import axios from 'axios';
import apiService from '../services/apiServices';

export const usePatterns = (symbol, interval) => {
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [selectedPatterns, setSelectedPatterns] = useState([]);
    const [availablePatterns, setAvailablePatterns] = useState([]);
    const [sidebarMode, setSidebarMode] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState('');
    
    // The currently active pattern type the user is viewing
    const [activePatternType, setActivePatternType] = useState('');

    // Fetch all available pattern names for the "All Types" tab
    useEffect(() => {
        const fetchPatternNames = async () => {
            try {
                // Keep the original GET request if it works, or hardcode the list if preferred.
                // Assuming the backend has this endpoint, or we provide a static list for the rich patterns:
                setAvailablePatterns(["CUP_HANDLE", "DOUBLE_BOTTOM", "FLAG", "N_PATTERN"]);
            } catch (error) {
                console.error("Error fetching pattern names:", error);
            }
        };
        fetchPatternNames();
    }, []);

    // When activePatternType changes, fetch the specific instances via POST
    useEffect(() => {
        const fetchData = async () => {
            if (!symbol || !interval || !activePatternType) return;
            
            try {
                setLoading(true);
                // POST request as specified by the user
                const res = await axios.post("http://192.168.1.10:7000/api/patterns/analyze-candles", {
                    patternType: activePatternType,
                    symbol,
                    timeframe: interval
                });
                
                const json = res.data;
                console.log(json, "rich pattern data");  
                
                if (json.success) {
                    const results = json.patterns || [];
                    const candles = json.meta?.candles || [];
                    const patternsWithIds = results.map((p, idx) => {
                        // Extract a meaningful time for the sidebar from indices
                        let patternTime = null;
                        if (candles.length > 0 && p.indices) {
                            // Try to get breakout or first valid index
                            const timeIndex = p.indices.breakout !== -1 ? p.indices.breakout : (p.indices.leftRim || p.indices.firstBottom || p.indices.flagpoleStart || p.indices.pointA);
                            if (timeIndex >= 0 && timeIndex < candles.length) {
                                patternTime = candles[timeIndex].time;
                            }
                        }

                        return {
                            ...p,
                            _id: p._id || `${activePatternType}-${idx}-${Date.now()}`,
                            name: `${activePatternType.replace('_', ' ')} #${idx + 1}`,
                            type: activePatternType,
                            time: patternTime ? (typeof patternTime === 'number' && patternTime < 20000000000 ? patternTime * 1000 : patternTime) : Date.now()
                        };
                    });
                    
                    setChartData({ 
                        patterns: patternsWithIds,
                        candles: candles
                    });
                    
                    setSidebarMode('detected');
                } else {
                    setChartData({ patterns: [], candles: [] });
                }
            } catch (error) {
                console.error("Error fetching rich pattern data:", error);
                setChartData({ patterns: [], candles: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [symbol, interval, activePatternType]);

    const togglePattern = (patternId) => {
        // If the user is clicking an available pattern from "All Types" list
        if (sidebarMode === 'all') {
            setActivePatternType(patternId);
            setSelectedPatterns([]); // Reset specific selections when changing type
            return;
        }

        // If the user is selecting a specific detected instance
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

        setSelectedPatterns(prev => {
            // Unselect if already selected
            if (prev.includes(patternId)) {
                return prev.filter(p => p !== patternId);
            }
            // For rich patterns, often only one makes sense to view at a time
            // but we allow multiple for flexibility, or we can enforce single selection:
            return [patternId]; // Only select one specific pattern instance at a time to prevent chart clutter
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
        activePatternType,
        setActivePatternType
    };
};
