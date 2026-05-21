import React from 'react';

const SectorSentiment = ({ data, getColorClass }) => (
    <div className="col-lg-6">
        <div className="binance-card h-100 d-flex flex-column">
            <div className="card-header pb-2">
                <div className="d-flex align-items-center mb-3">
                    <span className="title">Sector Sentiment</span>
                    <i className="bi bi-info-circle ms-2 info-icon"></i>
                </div>
                <div className="d-flex bg-dark-layer rounded p-1 w-100 justify-content-start">
                    <button className="btn btn-sm text-white bg-secondary flex-grow-0 me-1" style={{ fontSize: '12px' }}>By Market Cap</button>
                    <button className="btn btn-sm text-muted flex-grow-0" style={{ fontSize: '12px' }}>By 24h Change</button>
                </div>
            </div>
            <div className="card-body p-0 mt-2 flex-grow-1 d-flex flex-column">
                <table className="table binance-table mb-0 w-100 flex-grow-1" style={{ tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th className="ps-3 border-bottom-secondary" style={{ width: '28%' }}>Sector</th>
                            <th className="border-bottom-secondary" style={{ width: '30%' }}>Sentiment</th>
                            <th className="text-end border-bottom-secondary" style={{ width: '24%' }}>Value (24h)</th>
                            <th className="text-end pe-3 border-bottom-secondary" style={{ width: '18%' }}>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.sectors.map((s, i) => (
                            <tr key={i}>
                                <td className="ps-3"><div className="d-flex align-items-center"><i className={`bi ${s.icon} text-muted me-2`}></i>{s.name}</div></td>
                                <td className={getColorClass(s.sentimentLabel)} style={{ whiteSpace: 'nowrap' }}>
                                    {s.sentimentScore} <span className={`small ${getColorClass(s.sentimentLabel)}`}>{s.sentimentLabel}</span>
                                </td>
                                <td className="text-end" style={{ whiteSpace: 'nowrap' }}>{s.value}</td>
                                <td className="text-end pe-3">
                                    {s.trendUp
                                        ? <svg width="40" height="16" viewBox="0 0 45 18"><path d="M0,12 L10,6 L20,9 L30,2 L45,5" fill="none" stroke="#0ecb81" strokeWidth="1.5" /></svg>
                                        : <svg width="40" height="16" viewBox="0 0 45 18"><path d="M0,10 L10,12 L20,7 L30,11 L45,8" fill="none" stroke="#f0b90b" strokeWidth="1.5" /></svg>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-3 ps-4 mt-auto">
                    <a href="#" className="text-warning text-decoration-none small fw-medium hover-underline d-inline-flex align-items-center">
                        View all sectors <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-right ms-1" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" /></svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
);

export default SectorSentiment;