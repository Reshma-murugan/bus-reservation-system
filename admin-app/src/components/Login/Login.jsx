import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Login.css';

function Login() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  // Password visibility toggle removed
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.role === 'ADMIN') {
        login(response.data);
      } else {
        setError('Access denied. Admin role required.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {/* Floating test button */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          backgroundColor: 'red',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 1000,
          borderRadius: '5px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
      >
        TEST BUTTON - CLICK ME
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Admin Login</h1>
            <p>Bus Reservation System</p>
            <div
              style={{
                padding: '15px',
                margin: '15px 0',
                background: '#ffeb3b',
                border: '2px solid #f44336',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <i
                className="bi bi-eye-fill"
                style={{ fontSize: '24px', color: '#f44336' }}
              ></i>
              <span>TEST ICON - This should be visible</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an admin account?{' '}
              <Link to="/signup" className="signup-link">
                Create one here
              </Link>
            </p>
          </div>
        </div> {/* close login-card */}
      </div> {/* close login-container */}
    </div>   
  );
};

export default Login;
