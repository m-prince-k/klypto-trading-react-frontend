import React from 'react';

const TradeSettings = ({ userData, handleToggle, handleEdit }) => (
  <div>
    <h3 className="settings-header mb-4">Trade Settings</h3>
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-info">
          <h4>Spot Order Confirmation</h4>
          <p>Show confirmation dialog before placing a spot order.</p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.spotConfirmation} onChange={() => handleToggle('spotConfirmation')} />
          <span className="switch-slider"></span>
        </label>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Margin Order Confirmation</h4>
          <p>Show confirmation dialog before placing a margin order.</p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.marginConfirmation} onChange={() => handleToggle('marginConfirmation')} />
          <span className="switch-slider"></span>
        </label>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Default Trading Layout</h4>
          <p>{userData.defaultLayout}</p>
        </div>
        <button className="btn-edit" onClick={() => handleEdit('defaultLayout', 'Select Default Layout', 'select', ['Classic', 'Advanced', 'Full Screen'])}>Edit</button>
      </div>
    </div>
  </div>
);

export default TradeSettings;
