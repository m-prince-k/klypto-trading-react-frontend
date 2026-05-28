import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Settings.css';
import apiService from '../../../services/apiServices';
import { useTheme } from '../../../context/ThemeContext';

import ProfileSettings from '../../../components/dashboard/settings/ProfileSettings';
import PreferencesSettings from '../../../components/dashboard/settings/PreferencesSettings';
import NotificationsSettings from '../../../components/dashboard/settings/NotificationsSettings';
import WithdrawalSettings from '../../../components/dashboard/settings/WithdrawalSettings';
import TradeSettings from '../../../components/dashboard/settings/TradeSettings';
import LinkAccountSettings from '../../../components/dashboard/settings/LinkAccountSettings';
import PrivacySettings from '../../../components/dashboard/settings/PrivacySettings';
import { toast } from 'react-toastify';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, field: null, title: '', type: 'text', options: [], errorMsg: '' });
  const [tempValue, setTempValue] = useState('');

  // User Data State
  const [userData, setUserData] = useState({
    // Profile
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Preferences — seed from actual app theme
    currency: 'USD',
    language: 'English',
    theme: theme === 'dark' ? 'Dark' : 'Light',
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

  useEffect(() => {


    // 2. Fetch from API endpoint
    const fetchProfile = async () => {
      try {
        const res = await apiService.get("api/viewProfile");
        console.log(res, "dataaaaaaaaaaa")
        const data = res?.data?.firstName ? res?.data : (res?.firstName ? res : res?.data);
        if (data) {
          setUserData(prev => ({
            ...prev,
            firstName: data?.firstName || prev.firstName,
            lastName: data?.lastName || prev.lastName,
            email: data?.email || prev.email,
            phone: data?.mobile || data?.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile from API:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = (field, title, type, options = []) => {
    let initialValue = userData[field];
    if (field === 'phone') {
      const phoneStr = initialValue || '';
      if (phoneStr.includes(' ')) {
        initialValue = phoneStr.split(' ').slice(1).join(' ');
      } else if (phoneStr.startsWith('+')) {
        // Assuming +XX... format without space, strip first 3 characters (+91)
        initialValue = phoneStr.substring(3);
      } else {
        // Just the number itself
        initialValue = phoneStr;
      }
    }
    setTempValue(initialValue);
    setModalConfig({ isOpen: true, field, title, type, options, errorMsg: '' });
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
    // alert(`Payload Submitted:\n\n${JSON.stringify(payload, null, 2)}`);
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
    // alert(`Payload Submitted:\n\n${JSON.stringify(payload, null, 2)}`);
  };

  const handleSave = () => {
    if (modalConfig.field) {
      let finalValue = tempValue;

      if (modalConfig.field === 'phone') {
        const phoneStr = userData.phone || '';
        const countryCode = phoneStr.includes(' ') 
          ? phoneStr.split(' ')[0] 
          : (phoneStr.startsWith('+') ? phoneStr.substring(0, 3) : '+91');
        
        finalValue = `${countryCode} ${tempValue}`;

        const phoneRegex = /^\+[1-9]\d{0,2}[\s-]?\d{10,}$/;
        if (!phoneRegex.test(finalValue)) {
          setModalConfig({ ...modalConfig, errorMsg: "Please enter a valid phone number. It must include at least 10 digits." });
          return;
        }
      }

      const updatedData = { ...userData, [modalConfig.field]: finalValue };
      setUserData(updatedData);

      // If the user changed the theme, apply it immediately via ThemeContext
      if (modalConfig.field === 'theme') {
        const themeMap = { Dark: 'dark', Light: 'light', System: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' };
        setTheme(themeMap[finalValue] || 'dark');
      }

      // Save user-related fields to session storage if applicable
      const userFields = ['firstName', 'lastName', 'phone'];
      if (userFields.includes(modalConfig.field)) {
        try {
          const sessionStr = localStorage.getItem("session");
          if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session.user) {
              session.user[modalConfig.field] = finalValue;
            } else {
              session[modalConfig.field] = finalValue;
            }
            localStorage.setItem("session", JSON.stringify(session));
          }

          // API Call to updateProfile
          const apiField = modalConfig.field === 'phone' ? 'mobile' : modalConfig.field;

          apiService.put("api/updateProfile", {
            [apiField]: finalValue
          })
          .then(() => {
            toast.success("Profile updated successfully!");
          })
          .catch(err => console.error("API update error:", err));

        } catch (error) {
          console.error("Error saving to local storage or API", error);
        }
      }

      const payload = {
        action: 'UPDATE_FIELD',
        fieldUpdated: modalConfig.field,
        newValue: tempValue,
        fullUserData: updatedData
      };
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'bi-person' },
    { id: 'preferences', label: 'Preferences', icon: 'bi-sliders' },
    { id: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    // { id: 'withdrawal', label: 'Withdrawal', icon: 'bi-wallet2' },
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

            {activeTab === 'profile' && <ProfileSettings userData={userData} handleEdit={handleEdit} />}
            {activeTab === 'preferences' && <PreferencesSettings userData={userData} handleEdit={handleEdit} />}
            {activeTab === 'notifications' && <NotificationsSettings userData={userData} handleToggle={handleToggle} />}
            {/* {activeTab === 'withdrawal' && <WithdrawalSettings userData={userData} handleToggle={handleToggle} />} */}
            {activeTab === 'trade' && <TradeSettings userData={userData} handleToggle={handleToggle} handleEdit={handleEdit} />}
            {activeTab === 'link_account' && <LinkAccountSettings userData={userData} handleLinkAction={handleLinkAction} />}
            {activeTab === 'privacy' && <PrivacySettings userData={userData} handleToggle={handleToggle} />}

          </div>
        </div>
      </div>

      {/* Global Edit Modal */}
      {modalConfig.isOpen && (
        <div className="settings-modal-overlay" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>{modalConfig.title}</h4>
              <i className="bi bi-x fs-4" style={{ cursor: 'pointer' }} onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}></i>
            </div>
            <div className="settings-modal-body">
              {modalConfig.type === 'select' ? (
                <select
                  className="custom-input"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                >
                  {modalConfig.options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : modalConfig.field === 'phone' ? (
                <div>
                  <div className="input-group">
                    <span 
                      className="input-group-text" 
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        color: 'var(--text-main)', 
                        borderColor: 'var(--border-color)' 
                      }}
                    >
                      {userData.phone 
                        ? (userData.phone.includes(' ') 
                            ? userData.phone.split(' ')[0] 
                            : (userData.phone.startsWith('+') ? userData.phone.substring(0, 3) : '+91')) 
                        : '+91'}
                    </span>
                    <input
                      type={modalConfig.type}
                      className="form-control custom-input"
                      value={tempValue}
                      onChange={(e) => {
                        setTempValue(e.target.value);
                        if (modalConfig.errorMsg) setModalConfig({ ...modalConfig, errorMsg: '' });
                      }}
                      placeholder="Enter 10 digit number"
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    />
                  </div>
                  {modalConfig.errorMsg && <div style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '6px', textAlign: 'left' }}>{modalConfig.errorMsg}</div>}
                </div>
              ) : (
                <div>
                  <input
                    type={modalConfig.type}
                    className="custom-input"
                    value={tempValue}
                    onChange={(e) => {
                      setTempValue(e.target.value);
                      if (modalConfig.errorMsg) setModalConfig({ ...modalConfig, errorMsg: '' });
                    }}
                  />
                  {modalConfig.errorMsg && <div style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '6px', textAlign: 'left' }}>{modalConfig.errorMsg}</div>}
                </div>
              )}
            </div>
            <div className="settings-modal-footer">
              <button className="btn-cancel" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;