import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API URL from environment variables
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;
  
  // Load user from localStorage on initial render
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);
  
  // Register user
  const register = async (username, email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/register`, { username, email, password });
      const user = response.data;
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };
  
  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const user = response.data;
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  
  // Check if token is expired (simple check, not full JWT validation)
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      // Get the payload part of the JWT
      const payload = token.split('.')[1];
      if (!payload) return true;
      
      // Decode the base64 encoded payload
      const decoded = JSON.parse(atob(payload));
      
      // Check if the token has an expiration time
      if (!decoded.exp) return false;
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };
  
  // Get auth header
  const getAuthHeader = () => {
    if (currentUser && currentUser.token) {
      if (isTokenExpired(currentUser.token)) {
        // Token is expired, log the user out
        console.warn('Auth token is expired. Logging out...');
        logout();
        return {};
      }
      return { Authorization: `Bearer ${currentUser.token}` };
    }
    return {};
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;