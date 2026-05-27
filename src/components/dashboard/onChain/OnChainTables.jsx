import React from 'react';

const OnChainTables = ({ data, setActiveModal, setModalSearch }) => {
  return (
    <div className="tables-row">
      {/* Table 1: TVL by Chain */}
      <div className="table-card">
        <div className="card-header">
          <div className="card-title">TVL by Chain <i className="icon-info"></i></div>
        </div>
        <table className="onchain-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Chain</th>
              <th className="right">TVL</th>
              <th className="right">24h Change</th>
              <th className="right">7D Change</th>
              <th className="right">30D Change</th>
              <th className="right">Dominance</th>
            </tr>
          </thead>
          <tbody>
            {([...(data?.chains || [])].sort((a, b) => a.n - b.n).slice(0, 5)).map(r => (
              <tr key={r.n}>
                <td>{r.n}</td>
                <td>
                  <div className="table-chain-name">
                    <div className="c-icon" style={{backgroundColor: r.color}}></div>
                    {r.chain}
                  </div>
                </td>
                <td className="right">${r.tvl}B</td>
                <td className={`right ${String(r.c24).includes('-') ? 'down' : 'up'}`}>
                  {parseFloat(r.c24) > 0 && !String(r.c24).startsWith('+') ? '+' : ''}{r.c24}
                </td>
                <td className={`right ${String(r.c7).includes('-') ? 'down' : 'up'}`}>{r.c7}</td>
                <td className={`right ${String(r.c30).includes('-') ? 'down' : 'up'}`}>{r.c30}</td>
                <td className="right">{r.dom}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="card-footer-link" onClick={() => { setActiveModal('chains'); setModalSearch(''); }}>
          View all chains &rarr;
        </div>
      </div>

      {/* Table 2: TVL Changes */}
      <div className="table-card">
        <div className="card-header">
          <div className="card-title">TVL Changes <i className="icon-info"></i></div>
        </div>
        <table className="onchain-table">
          <thead>
            <tr>
              <th>Period</th>
              <th className="right">TVL</th>
              <th className="right">Change</th>
              <th className="right">Change %</th>
            </tr>
          </thead>
          <tbody>
            {(data?.tvlChanges || []).map((r, i) => (
              <tr key={i}>
                <td className='text-left'>{r.p}</td>
                <td className="right">${r.tvl}B</td>
                <td className={`right ${r.isUp ? 'up' : 'down'}`}>{r.chg}</td>
                <td className={`right ${r.isUp ? 'up' : 'down'}`}>{r.pct}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="card-footer-link" onClick={() => { setActiveModal('history'); setModalSearch(''); }}>
          View historical data &rarr;
        </div>
      </div>
    </div>
  );
};

export default OnChainTables;
