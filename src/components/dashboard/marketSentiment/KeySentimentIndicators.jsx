import React from 'react';

const KeySentimentIndicators = ({ data, getColorClass }) => (
    <div className="binance-card mb-3">
        <div className="card-header pb-0 d-flex align-items-center">
            <span className="title">Key Sentiment Indicators</span>
            <i className="bi bi-info-circle ms-2 info-icon"></i>
        </div>
        <div className="card-body py-3">
            <div className="row g-2 row-cols-1 row-cols-md-3 row-cols-xl-5">

                {/* Bitcoin Dominance */}
                <div className="col">
                    <div className="indicator-box bg-dark-layer d-flex align-items-center px-3 py-2 rounded">
                        <div className="indicator-icon me-3">
                            <div className="icon-circle bg-warning-dim text-warning d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-currency-bitcoin" viewBox="0 0 16 16"><path d="M5.5 13v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.5v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.084c1.992 0 3.416-1.033 3.416-2.82 0-1.502-1.007-2.323-2.186-2.44v-.088c.97-.242 1.683-.974 1.683-2.19C11.997 3.93 10.847 3 9.092 3H9V1.75a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25V3h-.5V1.75a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25V3H5.25a.25.25 0 0 0-.25.25V4c0 .138.112.25.25.25h.563c.094 0 .181.026.257.071.12.073.185.195.185.344v6.67c0 .149-.065.27-.185.344a.4.4 0 0 1-.257.071H5.25a.25.25 0 0 0-.25.25v.75c0 .138.112.25.25.25h.25zm1.56-8.724h1.284c1.228 0 2.04.59 2.04 1.61 0 1.054-.836 1.678-2.138 1.678h-1.186zm0 4.194h1.424c1.37 0 2.302.66 2.302 1.83 0 1.156-.93 1.828-2.2 1.939V8.73l.348.086z" /></svg>
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <div className="text-muted extremely-small mb-1 text-end">Bitcoin Dominance</div>
                            <div className="d-flex justify-content-between align-items-baseline">
                                <span className={`${getColorClass(data.indicators.btcDominance.label)} fw-bold fs-6`}>{data.indicators.btcDominance.value}</span>
                                <span className={`${getColorClass(data.indicators.btcDominance.label)} extremely-small fw-medium`}>{data.indicators.btcDominance.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Funding Rate */}
                <div className="col">
                    <div className="indicator-box bg-dark-layer d-flex align-items-center px-3 py-2 rounded">
                        <div className="indicator-icon me-3">
                            <div className="icon-circle bg-success-dim text-success d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-currency-dollar" viewBox="0 0 16 16"><path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z" /></svg>
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <div className="text-muted extremely-small mb-1 text-end">Funding Rate (Avg.)</div>
                            <div className="d-flex justify-content-between align-items-baseline">
                                <span className={`${getColorClass(data.indicators.fundingRate.label)} fw-bold fs-6`}>{data.indicators.fundingRate.value}</span>
                                <span className={`${getColorClass(data.indicators.fundingRate.label)} extremely-small fw-medium`}>{data.indicators.fundingRate.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trading Volume */}
                <div className="col">
                    <div className="indicator-box bg-dark-layer d-flex align-items-center px-3 py-2 rounded">
                        <div className="indicator-icon me-3">
                            <div className="icon-circle bg-success-dim text-success d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bar-chart-fill" viewBox="0 0 16 16"><path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" /></svg>
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <div className="text-muted extremely-small mb-1 text-end">Trading Volume (24h)</div>
                            <div className="d-flex justify-content-between align-items-baseline">
                                <span className={`${getColorClass(data.indicators.tradingVolume.label)} fw-bold fs-6`}>{data.indicators.tradingVolume.value}</span>
                                <span className={`${getColorClass(data.indicators.tradingVolume.label)} extremely-small fw-medium`}>{data.indicators.tradingVolume.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Volatility */}
                <div className="col">
                    <div className="indicator-box bg-dark-layer d-flex align-items-center px-3 py-2 rounded">
                        <div className="indicator-icon me-3">
                            <div className="icon-circle bg-warning-dim text-warning d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-activity" viewBox="0 0 16 16"><path fillRule="evenodd" d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2" /></svg>
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <div className="text-muted extremely-small mb-1 text-end">Volatility (24h)</div>
                            <div className="d-flex justify-content-between align-items-baseline">
                                <span className={`${getColorClass(data.indicators.volatility.label)} fw-bold fs-6`}>{data.indicators.volatility.value}</span>
                                <span className={`${getColorClass(data.indicators.volatility.label)} extremely-small fw-medium`}>{data.indicators.volatility.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Derivatives Volume */}
                <div className="col">
                    <div className="indicator-box bg-dark-layer d-flex align-items-center px-3 py-2 rounded border-0">
                        <div className="indicator-icon me-3">
                            <div className="icon-circle bg-success-dim text-success d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-graph-up-arrow" viewBox="0 0 16 16"><path fillRule="evenodd" d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5" /></svg>
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <div className="text-muted extremely-small mb-1 text-end">Derivatives Volume (24h)</div>
                            <div className="d-flex justify-content-between align-items-baseline">
                                <span className={`${getColorClass(data.indicators.derivativesVolume.label)} fw-bold fs-6`}>{data.indicators.derivativesVolume.value}</span>
                                <span className={`${getColorClass(data.indicators.derivativesVolume.label)} extremely-small fw-medium`}>{data.indicators.derivativesVolume.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
);

export default KeySentimentIndicators;