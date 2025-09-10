import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('adminUser');
    return userData ? JSON.parse(userData) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (!response.data || !response.data.accessToken) {
        throw new Error('Invalid response from server');
      }
      
      const { accessToken, email: userEmail, role, name } = response.data;
      
      if (role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Store token and user data
      setToken(accessToken);
      const userData = {
        email: userEmail,
        role,
        name: name || ''
      };
      setUser(userData);
      
      // Persist to localStorage
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      
      return { ...userData, accessToken };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const isAuthenticated = () => {
    // Check if token and user exist
    if (!token || !user) {
      // Clean up any invalid token in localStorage
      if (localStorage.getItem('adminToken')) {
        console.log('Clearing invalid token from storage');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
      return false;
    }

    // Check token format
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid token format - clearing token');
      logout();
      return false;
    }

    try {
      // Decode the token payload
      const base64Url = tokenParts[1];
      // Replace URL-safe base64 characters and add padding
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      
      // Parse the token payload
      const tokenPayload = JSON.parse(atob(paddedBase64));
      
      // Check if token is expired
      const currentTime = Date.now() / 1000; // Convert to seconds
      const isExpired = tokenPayload.exp < currentTime;
      
      if (isExpired) {
        console.log('Token has expired - logging out');
        logout();
        return false;
      }
      
      // Verify user role
      if (user.role !== 'ADMIN') {
        console.log('User does not have admin role - logging out');
        logout();
        return false;
      }
      
      return true;
      
    } catch (e) {
      console.error('Token validation error:', e);
      logout(); // Clear invalid token
      return false;
    }
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    setLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};