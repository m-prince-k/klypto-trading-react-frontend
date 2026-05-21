import React from 'react';

const PrivacySettings = ({ userData, handleToggle }) => (
  <div>
    <h3 className="settings-header mb-4">Privacy</h3>
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-info">
          <h4>Hide Small Balances</h4>
          <p>Hide assets with a value less than 0.001 BTC.</p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.hideSmallBalances} onChange={() => handleToggle('hideSmallBalances')} />
          <span className="switch-slider"></span>
        </label>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Share Portfolio View</h4>
          <p>Allow others to see your portfolio performance via a public link.</p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.sharePortfolio} onChange={() => handleToggle('sharePortfolio')} />
          <span className="switch-slider"></span>
        </label>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Delete Account</h4>
          <p className="text-danger mb-0 mt-1">Permanently delete your account and all associated data.</p>
        </div>
        <button className="btn-edit" style={{color: '#f6465d', backgroundColor: 'rgba(246, 70, 93, 0.1)'}}>Delete</button>
      </div>
    </div>
  </div>
);

export default PrivacySettings;
