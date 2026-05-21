import React from 'react';

const ProfileSettings = ({ userData, handleEdit }) => {

  return (
    <div>
      <h3 className="settings-header mb-4">Profile Settings</h3>
      <div className="settings-section">
        <div className="settings-section-title"><i className="bi bi-person-badge"></i> Basic Information</div>
        <div className="setting-item">
          <div className="setting-info">
          <h4>First Name</h4>
          <p>{userData.firstName}</p>
        </div>
        <button className="btn-edit" onClick={() => handleEdit('firstName', 'Edit First Name', 'text')}>Edit</button>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>Last Name</h4>
          <p>{userData.lastName}</p>
        </div>
        <button className="btn-edit" onClick={() => handleEdit('lastName', 'Edit Last Name', 'text')}>Edit</button>
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
        </div>
        <div className="setting-item">
          <div className="setting-info">
          <h4>Phone Number</h4>
          <p>{userData.phone ? (userData.phone.startsWith('+') ? userData.phone : `+91 ${userData.phone}`) : ''}</p>
        </div>
          <button className="btn-edit" onClick={() => handleEdit('phone', 'Change Phone', 'text')}>Change</button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings;
