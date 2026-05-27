import React, { useState, useMemo } from 'react';

const SectorSentiment = ({ data, getColorClass }) => {
    const [activeTab, setActiveTab] = useState('MarketCap');
    const [showAllModal, setShowAllModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const sectors = data?.sectors || [];

    const sortedSectors = useMemo(() => {
        let sorted = [...sectors];
        if (activeTab === 'MarketCap') {
            sorted.sort((a, b) => {
                const valA = parseFloat(a.value?.replace(/[^0-9.-]+/g, '')) || 0;
                const valB = parseFloat(b.value?.replace(/[^0-9.-]+/g, '')) || 0;
                return valB - valA;
            });
        } else {
            sorted.sort((a, b) => {
                const changeA = a.change || 0;
                const changeB = b.change || 0;
                return changeB - changeA;
            });
        }
        return sorted;
    }, [sectors, activeTab]);

    const displayedSectors = sortedSectors.slice(0, 12);

    const filteredModalSectors = useMemo(() => {
        if (!searchQuery) return sortedSectors;
        return sortedSectors.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [sortedSectors, searchQuery]);

    const renderRow = (s, i) => (
        <tr key={i}>
            <td className="ps-3"><div className="d-flex align-items-center"><i className={`bi ${s.icon || 'bi-layers'} text-muted me-2`}></i>{s.name}</div></td>
            <td className={getColorClass(s.sentimentLabel)} style={{ whiteSpace: 'nowrap' }}>
                {s.sentimentScore} <span className={`small ${getColorClass(s.sentimentLabel)}`}>{s.sentimentLabel}</span>
            </td>
            <td className="text-end" style={{ whiteSpace: 'nowrap' }}>
                {activeTab === 'MarketCap' ? s.value : s.change24h || s.value24h || s.change}
            </td>
            <td className="text-end pe-3">
                {s.trendUp !== false
                    ? <svg width="40" height="16" viewBox="0 0 45 18" style={{ display: 'block', marginLeft: 'auto' }}><path d="M0,12 L10,6 L20,9 L30,2 L45,5" fill="none" stroke="#0ecb81" strokeWidth="1.5" /></svg>
                    : <svg width="40" height="16" viewBox="0 0 45 18" style={{ display: 'block', marginLeft: 'auto' }}><path d="M0,10 L10,12 L20,7 L30,11 L45,8" fill="none" stroke="#f0b90b" strokeWidth="1.5" /></svg>
                }
            </td>
        </tr>
    );

    return (
        <div className="col-lg-6">
            <div className="binance-card h-100 d-flex flex-column">
                <div className="card-header pb-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <span className="title text-nowrap">Sector Sentiment</span>
                        <i className="bi bi-info-circle ms-2 info-icon"></i>
                    </div>
                    <div className="d-flex bg-dark-layer rounded p-1 justify-content-start">
                        <button 
                            className={`btn btn-sm flex-grow-0 me-1 text-nowrap ${activeTab === 'MarketCap' ? 'active-purple-toggle' : 'text-muted'}`} 
                            style={{ fontSize: '12px' }}
                            onClick={() => setActiveTab('MarketCap')}
                        >
                            By Market Cap
                        </button>
                        <button 
                            className={`btn btn-sm flex-grow-0 text-nowrap ${activeTab === 'Change' ? 'active-purple-toggle' : 'text-muted'}`} 
                            style={{ fontSize: '12px' }}
                            onClick={() => setActiveTab('Change')}
                        >
                            By 24h Change
                        </button>
                    </div>
                </div>
                <div className="card-body p-0 mt-2 flex-grow-1 d-flex flex-column">
                    <table className="table binance-table mb-0 w-100" style={{ tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th className="ps-3 border-bottom-secondary text-start" style={{ width: '40%' }}>Sector</th>
                                <th className="border-bottom-secondary text-start" style={{ width: '25%' }}>Sentiment</th>
                                <th className="text-end border-bottom-secondary" style={{ width: '20%' }}>{activeTab === 'MarketCap' ? 'Value' : 'Value (24h)'}</th>
                                <th className="text-end pe-3 border-bottom-secondary" style={{ width: '15%' }}>Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedSectors.map((s, i) => renderRow(s, i))}
                        </tbody>
                    </table>
                    <div className="p-3 ps-4 mt-auto">
                        <button onClick={() => setShowAllModal(true)} className="btn btn-link p-0 text-accent text-decoration-none small fw-medium hover-underline d-inline-flex align-items-center">
                            View all sectors <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-right ms-1" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal for View All Sectors */}
            {showAllModal && (
                <div className="modal-overlay" onClick={() => setShowAllModal(false)} style={{ zIndex: 1050, backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <div className="modal-content premium-card" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "var(--bg-main, #1e293b)", color: "var(--text-main, #fff)" }}>
                        <div className="modal-header" style={{ borderBottom: "1px solid var(--border-color, #334155)" }}>
                            <h2 className="modal-title" style={{ color: "var(--text-main, #fff)" }}>All Sectors ({filteredModalSectors.length})</h2>
                            <button className="modal-close" onClick={() => setShowAllModal(false)} style={{ color: "var(--text-muted, #9ca3af)" }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <input 
                                type="text" 
                                className="modal-search" 
                                placeholder="Search sectors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <table className="onchain-table">
                                <thead>
                                    <tr>
                                        <th className="text-start">Sector</th>
                                        <th className="text-start">Sentiment</th>
                                        <th className="text-end">{activeTab === 'MarketCap' ? 'Value' : 'Value (24h)'}</th>
                                        <th className="text-end pe-2">Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredModalSectors.map((s, i) => (
                                        <tr key={i}>
                                            <td className="text-start">
                                                <div className="table-chain-name">
                                                    <i className={`bi ${s.icon || 'bi-layers'} text-muted me-2`}></i>{s.name}
                                                </div>
                                            </td>
                                            <td className={`text-start ${getColorClass(s.sentimentLabel)}`}>
                                                {s.sentimentScore} <span className="small">{s.sentimentLabel}</span>
                                            </td>
                                            <td className="text-end">
                                                {activeTab === 'MarketCap' ? s.value : s.change24h || s.value24h || s.change}
                                            </td>
                                            <td className="text-end pe-2">
                                                {s.trendUp !== false
                                                    ? <svg width="40" height="16" viewBox="0 0 45 18" style={{ display: 'block', marginLeft: 'auto' }}><path d="M0,12 L10,6 L20,9 L30,2 L45,5" fill="none" stroke="#0ecb81" strokeWidth="1.5" /></svg>
                                                    : <svg width="40" height="16" viewBox="0 0 45 18" style={{ display: 'block', marginLeft: 'auto' }}><path d="M0,10 L10,12 L20,7 L30,11 L45,8" fill="none" stroke="#f0b90b" strokeWidth="1.5" /></svg>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredModalSectors.length === 0 && (
                                <div className="text-center text-muted p-5">
                                    No sectors found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectorSentiment;