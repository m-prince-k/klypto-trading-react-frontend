import React from 'react';

const NotificationsSettings = ({ userData, handleToggle }) => (
  <div>
    <h3 className="settings-header mb-4">Notifications</h3>
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-info">
          <h4>System Messages</h4>
          <p>Receive notifications for account activities, deposits, and withdrawals.</p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.systemMessages} onChange={() => handleToggle('systemMessages')} />
          <span className="switch-slider"></span>
        </label>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Marketing & Promotions</h4>
          <p>Receive emails about new features, promotions, and crypto news.</p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.marketingEmails} onChange={() => handleToggle('marketingEmails')} />
          <span className="switch-slider"></span>
        </label>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Order Updates</h4>
          <p>Get notified when your trades are executed.</p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.orderUpdates} onChange={() => handleToggle('orderUpdates')} />
          <span className="switch-slider"></span>
        </label>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Price Alerts</h4>
          <p>Push notifications when your saved coins hit a target price.</p>
        </div>
        <label className="custom-switch">
          <input type="checkbox" checked={userData.priceAlerts} onChange={() => handleToggle('priceAlerts')} />
          <span className="switch-slider"></span>
        </label>
      </div>
    </div>
  </div>
);

export default NotificationsSettings;
