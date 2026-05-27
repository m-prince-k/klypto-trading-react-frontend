import React, { useState, useMemo } from 'react';

const ViewAllLink = ({ onClick }) => (
    <button onClick={onClick} className="btn btn-link p-0 text-accent text-decoration-none small fw-medium hover-underline d-inline-flex align-items-center">
        View all <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-right ms-1" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" /></svg>
    </button>
);

const CoinTable = ({ rows, trendStroke, trendColor, getColorClass }) => (
    <table className="table binance-table mb-0 w-100" style={{ tableLayout: 'fixed' }}>
        <thead>
            <tr>
                <th className="ps-3 border-bottom-secondary" style={{ width: '8%' }}>#</th>
                <th className="border-bottom-secondary" style={{ width: '22%', textAlign: 'left' }}>Coin</th>
                <th className="border-bottom-secondary" style={{ width: '28%', textAlign: 'right' }}>Sentiment</th>
                <th className="text-end border-bottom-secondary" style={{ width: '20%' }}>24h</th>
                <th className="text-end pe-3 border-bottom-secondary" style={{ width: '22%' }}>Trend</th>
            </tr>
        </thead>
        <tbody>
            {rows.map((item, i) => (
                <tr key={i}>
                    <td className="text-muted ps-3">{item.rank}</td>
                    <td>
                        <div className="d-flex align-items-center">
                            {item?.iconUrl?.trim() ? (
                                <img src={item.iconUrl} width="16" height="16" className="me-1 flex-shrink-0" alt={item.coin} style={{ borderRadius: '50%' }} />
                            ) : (
                                <div className="me-1 flex-shrink-0" style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '8px', fontWeight: '700', color: '#fff',
                                }}>
                                    {item.coin?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                            <span className="fw-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.coin}</span>
                        </div>
                    </td>
                    <td className={getColorClass(item.sentimentLabel)} style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                        {item.sentimentScore} <span className={`small ${getColorClass(item.sentimentLabel)}`}>{item.sentimentLabel}</span>
                    </td>
                    <td className={`text-end ${getColorClass(item.sentimentLabel)}`} style={{ whiteSpace: 'nowrap' }}>{item.change24h}</td>
                    <td style={{ textAlign: 'right' }} >
                        <svg width="50" height="16" viewBox="0 0 55 18" style={{ display: 'block', marginLeft: 'auto' }}>
                            <path d={trendStroke} fill="none" stroke={trendColor} strokeWidth="1.5" />
                        </svg>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

const TopGainersLosers = ({ data, getColorClass }) => {
    const [modalType, setModalType] = useState(null); // 'gainers' or 'losers'
    const [searchQuery, setSearchQuery] = useState('');

    const modalData = useMemo(() => {
        if (!modalType) return [];
        let list = modalType === 'gainers' ? (data?.topGainers || []) : (data?.topLosers || []);
        if (searchQuery) {
            list = list.filter(item => item.coin?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return list;
    }, [modalType, data, searchQuery]);

    const upTrend = "M0,14 L10,12 L20,14 L30,7 L40,9 L55,2";
    const downTrend = "M0,4 L10,6 L20,4 L30,11 L40,9 L55,16";

    return (
        <div className="col-lg-6 d-flex flex-column gap-3">
            {/* Top Gainers */}
            <div className="binance-card flex-grow-1 d-flex flex-column">
                <div className="card-header d-flex justify-content-between align-items-center pb-2">
                    <div className="d-flex align-items-center">
                        <span className="title">Top Gainers (By Sentiment)</span>
                        <i className="bi bi-info-circle ms-2 info-icon"></i>
                    </div>
                    <ViewAllLink onClick={() => setModalType('gainers')} />
                </div>
                <div className="card-body p-0 pt-1 flex-grow-1">
                    <CoinTable
                        rows={(data?.topGainers || []).slice(0, 5)}
                        trendStroke={upTrend}
                        trendColor="#0ecb81"
                        getColorClass={getColorClass}
                    />
                </div>
            </div>

            {/* Top Losers */}
            <div className="binance-card flex-grow-1 d-flex flex-column">
                <div className="card-header d-flex justify-content-between align-items-center pb-2">
                    <div className="d-flex align-items-center">
                        <span className="title">Top Losers (By Sentiment)</span>
                        <i className="bi bi-info-circle ms-2 info-icon"></i>
                    </div>
                    <ViewAllLink onClick={() => setModalType('losers')} />
                </div>
                <div className="card-body p-0 pt-1 flex-grow-1">
                    <CoinTable
                        rows={(data?.topLosers || []).slice(0, 5)}
                        trendStroke={downTrend}
                        trendColor="#f6465d"
                        getColorClass={getColorClass}
                    />
                </div>
            </div>

            {/* Modal for View All */}
            {modalType && (
                <div className="modal-overlay" onClick={() => setModalType(null)} style={{ zIndex: 1050, backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <div className="modal-content premium-card" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "var(--bg-main, #1e293b)", color: "var(--text-main, #fff)" }}>
                        <div className="modal-header" style={{ borderBottom: "1px solid var(--border-color, #334155)" }}>
                            <h2 className="modal-title" style={{ color: "var(--text-main, #fff)" }}>
                                {modalType === 'gainers' ? 'Top Gainers' : 'Top Losers'} ({modalData.length})
                            </h2>
                            <button className="modal-close" onClick={() => setModalType(null)} style={{ color: "var(--text-muted, #9ca3af)" }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="modal-search"
                                placeholder="Search coins..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <table className="onchain-table">
                                <thead>
                                    <tr>
                                        <th className="text-start" style={{ width: '10%' }}>#</th>
                                        <th className="text-start">Coin</th>
                                        <th className="text-end">Sentiment</th>
                                        <th className="text-end">24h</th>
                                        <th className="text-end pe-2">Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalData.map((g, i) => (
                                        <tr key={i}>
                                            <td className="text-start text-muted">{g.rank}</td>
                                            <td className="text-start">
                                                <div className="table-chain-name">
                                                    {g?.iconUrl?.trim() ? (
                                                        <img src={g.iconUrl} width="16" height="16" className="me-1 flex-shrink-0" alt={g.coin} style={{ borderRadius: '50%' }} />
                                                    ) : (
                                                        <div className="me-1 flex-shrink-0" style={{
                                                            width: '16px', height: '16px', borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '8px', fontWeight: '700', color: '#fff',
                                                        }}>
                                                            {g.coin?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    {g.coin}
                                                </div>
                                            </td>
                                            <td className={`text-end ${getColorClass(g.sentimentLabel)}`}>
                                                {g.sentimentScore} <span className="small">{g.sentimentLabel}</span>
                                            </td>
                                            <td className="text-end">
                                                {g.change24h}
                                            </td>
                                            <td className="text-end pe-2">
                                                <svg width="40" height="16" viewBox="0 0 45 18" style={{ display: 'block', marginLeft: 'auto' }}>
                                                    <path d={modalType === 'gainers' ? upTrend : downTrend} fill="none" stroke={modalType === 'gainers' ? "#0ecb81" : "#f6465d"} strokeWidth="1.5" />
                                                </svg>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {modalData.length === 0 && (
                                <div className="text-center text-muted p-5">
                                    No coins found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopGainersLosers;