import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaBus } from 'react-icons/fa';
import './Login.css';

function Login() {
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage] = useState(location.state?.message || '');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* ── Left Brand Panel ── */}
        <div className="login-brand">
          <div className="brand-logo">
            <div className="brand-logo-icon">
              <FaBus color="white" />
            </div>
            <div className="brand-logo-text">
              Bus<span>Book</span>
            </div>
          </div>

          <div className="brand-tagline">
            <h2>Fleet Control, Simplified.</h2>
            <p>Manage your entire bus network from one powerful dashboard.</p>
          </div>

          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-dot" />
              Real-time seat & booking management
            </div>
            <div className="brand-feature">
              <div className="brand-feature-dot" />
              Live route and schedule control
            </div>
            <div className="brand-feature">
              <div className="brand-feature-dot" />
              Instant revenue insights
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="login-form-panel">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to your admin portal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {successMessage && (
              <div className="success-message">✓ {successMessage}</div>
            )}
            {error && (
              <div className="error-message">⚠ {error}</div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaEnvelope /></span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="email"
                  required
                  placeholder="admin@busbook.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper password-input-container">
                <span className="input-icon"><FaLock /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-full" disabled={loading}>
              {loading && <span className="loading-spinner" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            New admin?
            <Link to="/admin/register" className="signup-link">
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
