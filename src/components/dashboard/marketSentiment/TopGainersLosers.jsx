import React from 'react';

const ViewAllLink = () => (
    <a href="#" className="text-warning text-decoration-none small fw-medium hover-underline d-inline-flex align-items-center">
        View all <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-right ms-1" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" /></svg>
    </a>
);

const CoinTable = ({ rows, trendStroke, getColorClass }) => (
    <table className="table binance-table mb-0 w-100">
        <thead>
            <tr>
                <th className="ps-4 border-bottom-secondary" style={{ width: '40px' }}>#</th>
                <th className="border-bottom-secondary">Coin</th>
                <th className="border-bottom-secondary">Sentiment</th>
                <th className="text-end border-bottom-secondary">24h Change</th>
                <th className="text-end pe-4 border-bottom-secondary">Trend (7D)</th>
            </tr>
        </thead>
        <tbody>
            {rows.map((item, i) => (
                <tr key={i}>
                    <td className="text-muted ps-4">{item.rank}</td>
                    <td>
                        <div className="d-flex align-items-center">
                            <img src={item.iconUrl} width="18" className="me-2" alt={item.coin} />
                            <span className="fw-medium">{item.coin}</span>
                        </div>
                    </td>
                    <td className={getColorClass(item.sentimentLabel)}>
                        {item.sentimentScore} <span className={`small ${getColorClass(item.sentimentLabel)}`}>{item.sentimentLabel}</span>
                    </td>
                    <td className={`text-end ${getColorClass(item.sentimentLabel)}`}>{item.change24h}</td>
                    <td className="text-end pe-4">
                        <svg width="55" height="18" viewBox="0 0 55 18">
                            <path d={trendStroke} fill="none" stroke={trendStroke.endsWith('2') ? '#0ecb81' : '#f6465d'} strokeWidth="1.5" />
                        </svg>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

const TopGainersLosers = ({ data, getColorClass }) => (
    <div className="col-lg-6 d-flex flex-column gap-3">
        {/* Top Gainers */}
        <div className="binance-card flex-grow-1 d-flex flex-column">
            <div className="card-header d-flex justify-content-between align-items-center pb-2">
                <div className="d-flex align-items-center">
                    <span className="title">Top Gainers (By Sentiment)</span>
                    <i className="bi bi-info-circle ms-2 info-icon"></i>
                </div>
                <ViewAllLink />
            </div>
            <div className="card-body p-0 pt-1 flex-grow-1">
                <table className="table binance-table mb-0 w-100">
                    <thead>
                        <tr>
                            <th className="ps-4 border-bottom-secondary" style={{ width: '40px' }}>#</th>
                            <th className="border-bottom-secondary">Coin</th>
                            <th className="border-bottom-secondary">Sentiment</th>
                            <th className="text-end border-bottom-secondary">24h Change</th>
                            <th className="text-end pe-4 border-bottom-secondary">Trend (7D)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.topGainers?.map((g, i) => (
                            <tr key={i}>
                                <td className="text-muted ps-4">{g.rank}</td>
                                <td><div className="d-flex align-items-center"><img src={g.iconUrl} width="18" className="me-2" alt={g.coin} /><span className="fw-medium">{g.coin}</span></div></td>
                                <td className={getColorClass(g.sentimentLabel)}>{g.sentimentScore} <span className={`small ${getColorClass(g.sentimentLabel)}`}>{g.sentimentLabel}</span></td>
                                <td className={`text-end ${getColorClass(g.sentimentLabel)}`}>{g.change24h}</td>
                                <td className="text-end pe-4"><svg width="55" height="18" viewBox="0 0 55 18"><path d="M0,14 L10,12 L20,14 L30,7 L40,9 L55,2" fill="none" stroke="#0ecb81" strokeWidth="1.5" /></svg></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Top Losers */}
        <div className="binance-card flex-grow-1 d-flex flex-column">
            <div className="card-header d-flex justify-content-between align-items-center pb-2">
                <div className="d-flex align-items-center">
                    <span className="title">Top Losers (By Sentiment)</span>
                    <i className="bi bi-info-circle ms-2 info-icon"></i>
                </div>
                <ViewAllLink />
            </div>
            <div className="card-body p-0 pt-1 flex-grow-1">
                // Shared thead — use this for BOTH gainers and losers tables
                <table className="table binance-table mb-0 w-100" style={{ tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th className="ps-3 border-bottom-secondary" style={{ width: '8%' }}>#</th>
                            <th className="border-bottom-secondary" style={{ width: '22%' }}>Coin</th>
                            <th className="border-bottom-secondary" style={{ width: '28%' }}>Sentiment</th>
                            <th className="text-end border-bottom-secondary" style={{ width: '20%' }}>24h</th>
                            <th className="text-end pe-3 border-bottom-secondary" style={{ width: '22%' }}>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.topLosers?.map((g, i) => (
                            <tr key={i}>
                                <td className="text-muted ps-3">{g.rank}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <img src={g.iconUrl} width="16" className="me-1 flex-shrink-0" alt={g.coin}
                                            onError={e => { e.target.style.display = 'none'; }} />
                                        <span className="fw-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.coin}</span>
                                    </div>
                                </td>
                                <td className={getColorClass(g.sentimentLabel)} style={{ whiteSpace: 'nowrap' }}>
                                    {g.sentimentScore} <span className={`small ${getColorClass(g.sentimentLabel)}`}>{g.sentimentLabel}</span>
                                </td>
                                <td className={`text-end ${getColorClass(g.sentimentLabel)}`} style={{ whiteSpace: 'nowrap' }}>{g.change24h}</td>
                                <td className="text-end pe-3">
                                    <svg width="50" height="16" viewBox="0 0 55 18">
                                        <path d="M0,14 L10,12 L20,14 L30,7 L40,9 L55,2" fill="none" stroke="#0ecb81" strokeWidth="1.5" />
                                    </svg>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default TopGainersLosers;