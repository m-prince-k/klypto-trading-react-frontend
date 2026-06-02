import React, { useState } from 'react';

export default function ChartPatternsPanel({ 
    selectedPatterns, 
    togglePattern, 
    onClose,
    loading,
    sidebarMode,
    setSidebarMode,
    availablePatterns,
    chartData
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const renderPatternList = () => {
        if (sidebarMode === 'all') {
            const filteredAvailable = (availablePatterns || []).filter(item => {
                const name = typeof item === 'string' ? item : (item.name || item.id || '');
                return name.toLowerCase().includes(searchQuery.toLowerCase());
            });

            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredAvailable.map((item, idx) => {
                        const name = typeof item === 'string' ? item : (item.name || item.id || `Pattern ${idx}`);
                        return (
                            <label key={`all-${idx}`} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                color: selectedPatterns.includes(name) ? '#2962ff' : 'var(--text-main, #131722)',
                                transition: 'color 0.2s'
                            }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedPatterns.includes(name)}
                                    onChange={() => togglePattern(name)}
                                    style={{ accentColor: '#2962ff', width: '14px', height: '14px', cursor: 'pointer' }}
                                />
                                {name}
                            </label>
                        );
                    })}
                    {(!availablePatterns || availablePatterns.length === 0) && (
                        <div style={{ color: 'var(--text-muted, #787b86)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>No patterns fetched from API yet.</div>
                    )}
                    {(availablePatterns && availablePatterns.length > 0 && filteredAvailable.length === 0) && (
                        <div style={{ color: 'var(--text-muted, #787b86)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>No matches found.</div>
                    )}
                </div>
            );
        }

        const filteredDetected = (chartData?.patterns || []).filter(pattern => {
            if (!pattern || !pattern.name) return false;
            return pattern.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

        if (!chartData || !chartData.patterns || chartData.patterns.length === 0) {
            return <div style={{ color: 'var(--text-muted, #787b86)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>No patterns detected on this chart.</div>;
        }

        if (chartData.patterns.length > 0 && filteredDetected.length === 0) {
            return <div style={{ color: 'var(--text-muted, #787b86)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>No matches found.</div>;
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredDetected.map((pattern, idx) => {
                    const uniqueId = `${pattern.name}-${pattern.time}-${idx}`;
                    const isSelected = selectedPatterns.includes(uniqueId) || selectedPatterns.includes(pattern.name);
                    
                    const isBullish = pattern.type && pattern.type.includes('Bullish');
                    const isBearish = pattern.type && pattern.type.includes('Bearish');
                    const dotColor = isBullish ? '#10b981' : (isBearish ? '#ef4444' : '#f59e0b');

                    return (
                        <div 
                            key={uniqueId} 
                            onClick={() => togglePattern(uniqueId)}
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '4px',
                                padding: '10px',
                                backgroundColor: isSelected ? 'rgba(41, 98, 255, 0.1)' : 'var(--bg-secondary, #f8f9fa)',
                                borderRadius: '6px',
                                border: `1px solid ${isSelected ? '#2962ff' : 'var(--border-color, #e2e8f0)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor }} />
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: isSelected ? 'var(--text-main, #131722)' : 'var(--text-muted, #787b86)' }}>
                                        {pattern.name}
                                    </span>
                                </div>
                                {pattern.confidence && (
                                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-card, #ffffff)', color: 'var(--text-muted, #787b86)', border: '1px solid var(--border-color, #e2e8f0)' }}>
                                        {pattern.confidence}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #787b86)', marginLeft: '14px' }}>
                                {new Date(pattern.time).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            backgroundColor: "var(--bg-card, #ffffff)",
            color: "var(--text-main, #131722)"
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                borderBottom: "1px solid var(--border-color, #e2e8f0)",
            }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Chart Patterns
                    {loading && <span style={{ fontSize: '10px', color: '#2962ff' }}>(Loading...)</span>}
                </h3>
                <button 
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted, #787b86)",
                        cursor: "pointer",
                        fontSize: "18px"
                    }}
                >
                    ×
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '16px 16px 0 16px', gap: '8px' }}>
                <button 
                    onClick={() => setSidebarMode('detected')} 
                    style={{
                        flex: 1, padding: '8px', borderRadius: '6px', border: 'none',
                        backgroundColor: sidebarMode === 'detected' ? '#2962ff' : 'var(--bg-secondary, #f8f9fa)',
                        color: sidebarMode === 'detected' ? '#ffffff' : 'var(--text-muted, #787b86)', 
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Detected ({chartData?.patterns?.length || 0})
                </button>
                <button 
                    onClick={() => setSidebarMode('all')} 
                    style={{
                        flex: 1, padding: '8px', borderRadius: '6px', border: 'none',
                        backgroundColor: sidebarMode === 'all' ? '#2962ff' : 'var(--bg-secondary, #f8f9fa)',
                        color: sidebarMode === 'all' ? '#ffffff' : 'var(--text-muted, #787b86)', 
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    All Types
                </button>
            </div>

            {/* Search */}
            <div style={{ padding: '12px 16px 0 16px' }}>
                <input
                    type="text"
                    placeholder="Search patterns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        backgroundColor: 'var(--bg-secondary, #f8f9fa)',
                        color: 'var(--text-main, #131722)',
                        fontSize: '12px',
                        outline: 'none'
                    }}
                />
            </div>

            {/* List */}
            <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
                {renderPatternList()}
            </div>
        </div>
    );
}
