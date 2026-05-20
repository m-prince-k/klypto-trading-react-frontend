import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, field: null, title: '', type: 'text', options: [] });
  const [tempValue, setTempValue] = useState('');

  // Mock User Data
  const [userData, setUserData] = useState({
    // Profile
    nickname: 'CryptoTrader99',
    email: 'user****@gmail.com',
    phone: '***-***-8992',
    // Preferences
    currency: 'USD',
    language: 'English',
    theme: 'Dark',
    // Notifications
    systemMessages: true,
    marketingEmails: false,
    orderUpdates: true,
    priceAlerts: false,
    // Withdrawal
    withdrawalAddressWhitelist: true,
    withdrawalLimit: '100 BTC',
    // Trade
    spotConfirmation: true,
    marginConfirmation: false,
    defaultLayout: 'Advanced',
    // Privacy
    hideSmallBalances: false,
    sharePortfolio: false,
    // Linked Accounts
    googleLinked: false,
    appleLinked: false
  });

  const handleEdit = (field, title, type, options = []) => {
    setTempValue(userData[field]);
    setModalConfig({ isOpen: true, field, title, type, options });
  };

  const handleLinkAction = (field) => {
    const updatedValue = !userData[field];
    const updatedData = { ...userData, [field]: updatedValue };
    setUserData(updatedData);

    const payload = {
      action: updatedValue ? 'LINK_ACCOUNT' : 'UNLINK_ACCOUNT',
      accountType: field,
      status: updatedValue ? 'Linked' : 'Not Linked',
      fullUserData: updatedData
    };
    alert(`Payload Submitted:\n\n${JSON.stringify(payload, null, 2)}`);
  };

  const handleToggle = (field) => {
    const updatedValue = !userData[field];
    const updatedData = { ...userData, [field]: updatedValue };
    setUserData(updatedData);

    const payload = {
      action: 'UPDATE_TOGGLE',
      fieldUpdated: field,
      newValue: updatedValue,
      fullUserData: updatedData
    };
    alert(`Payload Submitted:\n\n${JSON.stringify(payload, null, 2)}`);
  };

  const handleSave = () => {
    if (modalConfig.field) {
      const updatedData = { ...userData, [modalConfig.field]: tempValue };
      setUserData(updatedData);

      const payload = {
        action: 'UPDATE_FIELD',
        fieldUpdated: modalConfig.field,
        newValue: tempValue,
        fullUserData: updatedData
      };
      alert(`Payload Submitted:\n\n${JSON.stringify(payload, null, 2)}`);
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'bi-person' },
    { id: 'preferences', label: 'Preferences', icon: 'bi-sliders' },
    { id: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    { id: 'withdrawal', label: 'Withdrawal', icon: 'bi-wallet2' },
    { id: 'trade', label: 'Trade', icon: 'bi-graph-up' },
    { id: 'link_account', label: 'Link Account', icon: 'bi-link-45deg' },
    { id: 'privacy', label: 'Privacy', icon: 'bi-shield-lock' }
  ];

  return (
    <div className="settings-container">
      <div className="container">
        <div className="row">
          
          {/* Sidebar Navigation */}
          <div className="col-md-3 settings-sidebar">
            <h2 className="settings-header">Settings</h2>
            <div className="d-flex flex-column">
              {tabs.map(tab => (
                <div 
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`bi ${tab.icon} fs-5`}></i>
                  {tab.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-md-9 settings-content">
            
            {/* 1. Profile Section */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="settings-header mb-4">Profile Settings</h3>
                <div className="settings-section">
                  <div className="settings-section-title"><i className="bi bi-person-badge"></i> Basic Information</div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Nickname</h4>
                      <p>{userData.nickname}</p>
                    </div>
                    <button className="btn-edit" onClick={() => handleEdit('nickname', 'Edit Nickname', 'text')}>Edit</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>User ID</h4>
                      <p>94328104 <span className="status-badge ms-2">Verified</span></p>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <div className="settings-section-title"><i className="bi bi-shield-check"></i> Security Contacts</div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Email Address</h4>
                      <p>{userData.email}</p>
                    </div>
                    <button className="btn-edit" onClick={() => handleEdit('email', 'Change Email', 'email')}>Change</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Phone Number</h4>
                      <p>{userData.phone}</p>
                    </div>
                    <button className="btn-edit" onClick={() => handleEdit('phone', 'Change Phone', 'text')}>Change</button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Preferences Section */}
            {activeTab === 'preferences' && (
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
            )}

            {/* 3. Notifications */}
            {activeTab === 'notifications' && (
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
            )}

            {/* 4. Withdrawal */}
            {activeTab === 'withdrawal' && (
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
            )}

            {/* 5. Trade */}
            {activeTab === 'trade' && (
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
            )}

            {/* 6. Link Account */}
            {activeTab === 'link_account' && (
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
            )}

            {/* 7. Privacy */}
            {activeTab === 'privacy' && (
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
            )}

          </div>
        </div>
      </div>

      {/* Global Edit Modal */}
      {modalConfig.isOpen && (
        <div className="settings-modal-overlay" onClick={() => setModalConfig({...modalConfig, isOpen: false})}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h5>{modalConfig.title}</h5>
              <button className="settings-modal-close" onClick={() => setModalConfig({...modalConfig, isOpen: false})}>&times;</button>
            </div>
            <div className="settings-modal-body">
              {modalConfig.type === 'select' ? (
                <select 
                  className="custom-input" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)}
                >
                  {modalConfig.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type={modalConfig.type} 
                  className="custom-input" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)}
                />
              )}
            </div>
            <div className="settings-modal-footer">
              <button className="btn-edit" onClick={() => setModalConfig({...modalConfig, isOpen: false})}>Cancel</button>
              <button className="btn-primary-custom" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;