import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
const handleSaveSettings = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com', // 🟢 Replace this with dynamic user email
        ...settings
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings: ' + data.message);
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings.');
  }
};

  return (
    <div className="settings-container">
      <h1>Application Settings</h1>
      <p className="settings-subtitle">Customize your Landilockify experience.</p>

      <div className="settings-section">
        <h2>Notifications</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3>Email Notifications</h3>
            <p>Receive updates and alerts via email.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Push Notifications</h3>
            <p>Get real-time alerts on your device (if supported).</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2>Security</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3>Two-Factor Authentication (2FA)</h3>
            <p>Add an extra layer of security to your account.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.twoFactorAuth}
              onChange={() => handleToggle('twoFactorAuth')}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="setting-item">
          
       
<button className="save-settings-btn" onClick={handleSaveSettings}>Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;