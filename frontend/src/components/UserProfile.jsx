import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  // Get first letter of username for avatar
  const avatarLetter = currentUser.username.charAt(0).toUpperCase();
  
  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          {avatarLetter}
        </div>
        <div className="user-details">
          <p className="user-name">{currentUser.username}</p>
          {currentUser.email && <p className="user-email">{currentUser.email}</p>}
          <span className="user-status">Active</span>
        </div>
      </div>
      <button className="logout-button" onClick={logout}>
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;