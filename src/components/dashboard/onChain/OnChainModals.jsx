import React from 'react';

const OnChainModals = ({ activeModal, setActiveModal, modalSearch, setModalSearch, data }) => {
  if (!activeModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {activeModal === 'chains' && 'All Defi Chains TVL Metrics'}
            {activeModal === 'protocols' && 'Top Protocols by TVL Dataset'}
            {activeModal === 'history' && 'Global TVL History Dataset'}
          </h2>
          <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
        </div>
        <div className="modal-body">
          {activeModal !== 'history' && (
            <input 
              type="text" 
              className="modal-search" 
              placeholder="Search by name..." 
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
            />
          )}
          
          {activeModal === 'chains' && (
            <table className="onchain-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Chain</th>
                  <th className="right">TVL</th>
                  <th className="right">24h Change</th>
                  <th className="right">7D Change</th>
                  <th className="right">Dominance</th>
                </tr>
              </thead>
              <tbody>
                {data?.chains
                  .filter(c => c.chain.toLowerCase().includes(modalSearch.toLowerCase()))
                  .map((r, i) => (
                    <tr key={i}>
                      <td>{r.n}</td>
                      <td>
                        <div className="table-chain-name">
                          <div className="c-icon" style={{backgroundColor: r.color}}></div>
                          {r.chain}
                        </div>
                      </td>
                      <td className="right">${r.tvl}B</td>
                      <td className={`right ${String(r.c24).includes('-') ? 'down' : 'up'}`}>{Number(r.c24) > 0 ? '+' : ''}{r.c24}%</td>
                      <td className={`right ${String(r.c7).includes('-') ? 'down' : 'up'}`}>{r.c7}</td>
                      <td className="right">{r.dom}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}

          {activeModal === 'protocols' && (
            <table className="onchain-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Protocol</th>
                  <th className="right">TVL</th>
                </tr>
              </thead>
              <tbody>
                {data?.protocols
                  .filter(p => p.name.toLowerCase().includes(modalSearch.toLowerCase()))
                  .map((p, i) => (
                    <tr key={i}>
                      <td>{p.n}</td>
                      <td>
                        <div className="table-chain-name">
                          <div className="c-icon" style={{backgroundColor: p.color || '#6b7280'}}></div>
                          {p.name}
                        </div>
                      </td>
                      <td className="right">${p.val}B</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}

          {activeModal === 'history' && (
            <table className="onchain-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="right">Global TVL</th>
                </tr>
              </thead>
              <tbody>
                {data?.tvlHistory.map((h, i) => (
                  <tr key={i}>
                    <td>{h.date}</td>
                    <td className="right">${h.tvl}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnChainModals;
