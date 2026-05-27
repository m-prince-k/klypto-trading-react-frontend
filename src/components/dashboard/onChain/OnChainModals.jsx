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
                {(data?.chains || [])
                  .filter(c => c.chain.toLowerCase().includes(modalSearch.toLowerCase()))
                  .sort((a, b) => a.n - b.n)
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
                      <td className={`right ${String(r.c24).includes('-') ? 'down' : 'up'}`}>
                        {parseFloat(r.c24) > 0 && !String(r.c24).startsWith('+') ? '+' : ''}{r.c24}
                      </td>
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
                  {/* <th>Period</th> */}
                  <th>Date</th>
                  <th className="right">TVL</th>
                  {/* <th className="right">Change</th>
                  <th className="right">Change %</th> */}
                </tr>
              </thead>
              <tbody>
                {[...(data?.tvlHistory || [])].reverse().map((h, reversedIdx, reversedArr) => {
                  const originalArr = data?.tvlHistory || [];
                  const originalIdx = (originalArr.length - 1) - reversedIdx;
                  const currentTvl = parseFloat(h.tvl) || 0;
                  const prevTvl = originalIdx > 0 ? (parseFloat(originalArr[originalIdx - 1].tvl) || 0) : currentTvl;
                  
                  const change = currentTvl - prevTvl;
                  const changePct = prevTvl !== 0 ? (change / prevTvl) * 100 : 0;
                  const isUp = change >= 0;
                  
                  return (
                    <tr key={reversedIdx}>
                      <td className="text-center">{h.date}</td>
                      {/* <td className="right">${currentTvl.toFixed(2)}B</td>
                      <td className={`right ${isUp ? 'up' : 'down'}`}>
                        {isUp ? '+' : ''}{change.toFixed(2)}B
                      </td>
                      <td className={`right ${isUp ? 'up' : 'down'}`}>
                        {isUp ? '+' : ''}{changePct.toFixed(2)}%
                      </td> */}
                      <td className="text-right">{h.tvl}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnChainModals;
