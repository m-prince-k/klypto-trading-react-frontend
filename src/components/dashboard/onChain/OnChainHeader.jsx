import React from 'react';

const OnChainHeader = ({
  chainsList,
  selectedChain,
  setSelectedChain,
  dateRangePreset,
  setDateRangePreset,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  chainDropdownOpen,
  setChainDropdownOpen,
  datePickerOpen,
  setDatePickerOpen,
  exportDropdownOpen,
  setExportDropdownOpen,
  handleExport
}) => {
  return (
    <header className="onchain-header">
      <div className="header-titles">
        <h1>On-Chain (TVL) Overview</h1>
        <p>Total Value Locked across all chains and protocols</p>
      </div>
      <div className="header-actions">
        <div className="date-picker" onClick={(e) => { e.stopPropagation(); setDatePickerOpen(!datePickerOpen); setChainDropdownOpen(false); setExportDropdownOpen(false); }}>
          <span>{dateRangePreset === 'Custom' ? `${customStartDate} to ${customEndDate}` : dateRangePreset}</span>
          <i className="icon-calendar"></i>
          {datePickerOpen && (
            <div className="dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '220px', padding: '12px' }} onClick={(e) => e.stopPropagation()}>
              <div className={`dropdown-item ${dateRangePreset === 'Last 7 Days' ? 'active' : ''}`} onClick={() => { setDateRangePreset('Last 7 Days'); setDatePickerOpen(false); }}>Last 7 Days</div>
              <div className={`dropdown-item ${dateRangePreset === 'Last 30 Days' ? 'active' : ''}`} onClick={() => { setDateRangePreset('Last 30 Days'); setDatePickerOpen(false); }}>Last 30 Days</div>
              <div className={`dropdown-item ${dateRangePreset === 'Last 90 Days' ? 'active' : ''}`} onClick={() => { setDateRangePreset('Last 90 Days'); setDatePickerOpen(false); }}>Last 90 Days</div>
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }}></div>
              <div style={{ padding: '0 8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textAlign: 'left' }}>Custom Range</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => { setCustomStartDate(e.target.value); setDateRangePreset('Custom'); }}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                      padding: '4px 8px'
                    }} />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => { setCustomEndDate(e.target.value); setDateRangePreset('Custom'); }}
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '12px', padding: '4px 8px' }}
                  />
                  <button
                    onClick={() => setDatePickerOpen(false)}
                    style={{ background: 'var(--accent-color)', border: 'none', color: '#fff', fontSize: '12px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="dropdown" onClick={(e) => { e.stopPropagation(); setExportDropdownOpen(!exportDropdownOpen); setChainDropdownOpen(false); setDatePickerOpen(false); }}>
          <button className="onchain-btn-export">
            <i className="icon-export"></i> Export
            <i className="icon-chevron-down" style={{ marginLeft: '4px' }}></i>
          </button>
          {exportDropdownOpen && (
            <div className="dropdown-menu" style={{ right: 0, left: 'auto' }}>
              <div className="dropdown-item" onClick={() => handleExport('xlsx')}>Export as Excel (.xlsx)</div>
              <div className="dropdown-item" onClick={() => handleExport('csv')}>Export as CSV (.csv)</div>
              <div className="dropdown-item" onClick={() => handleExport('json')}>Export as JSON (.json)</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default OnChainHeader;
