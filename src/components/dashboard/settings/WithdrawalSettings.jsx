import React from 'react';

const WithdrawalSettings = ({ userData, handleToggle }) => (
  <div>
    <h3 className="settings-header mb-4">Withdrawal Settings</h3>
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-info">
          <h4>24H Withdrawal Limit</h4>
          <p>{userData.withdrawalLimit} (Level 2 Verified)</p>
        </div>
        <button className="btn-edit">Upgrade Limit</button>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Address Whitelist</h4>
          <p>Only allow withdrawals to whitelisted addresses. <span className="status-badge ms-2">Recommended</span></p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.withdrawalAddressWhitelist} onChange={() => handleToggle('withdrawalAddressWhitelist')} />
          <span className="switch-slider"></span>
        </label>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Whitelisted Addresses</h4>
          <p>Manage your saved crypto addresses.</p>
        </div>
        <button className="btn-edit">Manage</button>
      </div>
    </div>
  </div>
);

export default WithdrawalSettings;
