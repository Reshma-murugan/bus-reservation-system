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
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore stored tokens on app startup
  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', credentials);
      const authData = response.data;
      
      if (!authData.accessToken) {
        throw new Error('Authentication failed: No token received');
      }
      
      setToken(authData.accessToken);
      const userData = {
        email: authData.email,
        role: authData.role,
        name: authData.name
      };
      setUser(userData);
      
      localStorage.setItem('userToken', authData.accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return authData;
    } catch (error) {
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 400) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid credentials. Please check your email and password.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please check your internet connection.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = 'Unable to connect to the server. Please try again later.';
        }
      }
      
      // Log the full error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', credentials);
      const authData = response.data;
      
      setToken(authData.accessToken);
      setUser({
        email: authData.email,
        role: authData.role,
      });
      localStorage.setItem('userToken', authData.accessToken);
      localStorage.setItem('user', JSON.stringify({
        email: authData.email,
        role: authData.role,
      }));
      return authData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => !!token;

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};