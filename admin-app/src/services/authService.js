import api from '../utils/api';

const authService = {
  // Register a new admin user
  registerAdmin: async (userData) => {
    try {
      // Add admin password from environment variable or use default
      const data = {
        ...userData,
        adminPassword: import.meta.env.VITE_ADMIN_REGISTRATION_PASSWORD || 'admin@123'
      };
      
      const response = await api.post('/api/auth/register', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      if (response.data.accessToken) {
        localStorage.setItem('adminToken', response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('adminToken');
  },

  // Get current user
  getCurrentUser: () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    
    // Decode token to get user info
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      return {
        email: payload.sub,
        role: payload.role,
        name: payload.name
      };
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }
};

export default authService;
