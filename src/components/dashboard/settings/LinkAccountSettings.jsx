import React from 'react';

const LinkAccountSettings = ({ userData, handleLinkAction }) => (
  <div>
    <h3 className="settings-header mb-4">Link Account</h3>
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-info">
          <h4><i className="bi bi-google me-2"></i> Google Account</h4>
          {userData.googleLinked ? (
            <p><span className="status-badge">Linked</span></p>
          ) : (
            <p>Link your Google account for faster login.</p>
          )}
        </div>
        <button className={userData.googleLinked ? "btn-edit" : "btn-primary-custom"} onClick={() => handleLinkAction('googleLinked')}>
          {userData.googleLinked ? "Unlink" : "Link"}
        </button>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4><i className="bi bi-apple me-2"></i> Apple ID</h4>
          {userData.appleLinked ? (
            <p><span className="status-badge">Linked</span></p>
          ) : (
            <p>Not Linked</p>
          )}
        </div>
        <button className={userData.appleLinked ? "btn-edit" : "btn-primary-custom"} onClick={() => handleLinkAction('appleLinked')}>
          {userData.appleLinked ? "Unlink" : "Link"}
        </button>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>API Management</h4>
          <p>Create and manage API keys for algorithmic trading.</p>
        </div>
        <button className="btn-edit" onClick={() => alert("API Management clicked")}>Manage APIs</button>
      </div>
    </div>
  </div>
);

export default LinkAccountSettings;
