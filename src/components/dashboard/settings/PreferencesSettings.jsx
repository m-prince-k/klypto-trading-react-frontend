import React from 'react';

const PreferencesSettings = ({ userData, handleEdit }) => (
  <div>
    <h3 className="settings-header mb-4">Preferences</h3>
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-info">
          <h4>Language</h4>
          <p>{userData.language}</p>
        </div>
        <button className="btn-edit" onClick={() => handleEdit('language', 'Select Language', 'select', ['English', 'Spanish', 'Hindi', 'French'])}>Edit</button>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Local Currency</h4>
          <p>{userData.currency}</p>
        </div>
        <button className="btn-edit" onClick={() => handleEdit('currency', 'Select Currency', 'select', ['USD', 'EUR', 'GBP', 'INR', 'JPY'])}>Edit</button>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Theme</h4>
          <p>{userData.theme} Mode</p>
        </div>
        <button className="btn-edit" onClick={() => handleEdit('theme', 'Select Theme', 'select', ['Dark', 'Light', 'System'])}>Edit</button>
      </div>
    </div>
  </div>
);

export default PreferencesSettings;
