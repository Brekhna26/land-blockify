import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [fullName, setFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    if (email) setUserEmail(email);
    if (role) setUserRole(role);

    // Fetch bio from backend
    fetch(`http://localhost:3001/api/profile/get-bio?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.bio) setBio(data.bio);
        if (data.fullName) setFullName(data.fullName);
      });
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail, bio })
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Profile updated successfully!');
        setIsEditing(false);
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('❌ Backend error');
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-heading">My Profile</h1>
      <p className="profile-subtitle">View and manage your personal information.</p>
      <hr className="profile-divider" />

      <div className="profile-section">
        <h2>Full Name</h2>
        <p className="profile-info">{fullName}</p>
      </div>

      <div className="profile-section">
        <h2>Email Address</h2>
        <p className="profile-info">{userEmail}</p>
      </div>

      <div className="profile-section">
        <h2>Role</h2>
        <p className="profile-info">{userRole}</p>
      </div>

      <hr className="profile-divider" />

      <div className="profile-section">
        <h2>Bio</h2>
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="profile-textarea"
          />
        ) : (
          <p className="profile-bio">{bio}</p>
        )}
      </div>

      <div className="profile-button-group">
        {isEditing ? (
          <button className="save-button" onClick={handleSave}>Save</button>
        ) : (
          <button className="edit-button" onClick={() => setIsEditing(true)}>Edit</button>
        )}
      </div>
    </div>
  );
};

export default Profile;
