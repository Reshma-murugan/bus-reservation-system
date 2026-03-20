import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  FaEye, FaEyeSlash,
  FaUser, FaEnvelope, FaLock, FaBus,
} from 'react-icons/fa';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }, {
        headers: { 'X-Application-Source': 'admin-app' },
      });

      // Navigate to login with a success message banner
      navigate('/admin/login', {
        state: { message: 'Account created! You can now sign in.' },
      });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 409) {
        setError('An account with this email already exists.');
      } else if (status === 400) {
        setError(msg || 'Invalid input data. Please check your information.');
      } else if (err.request) {
        setError('Unable to connect to the server. Please check your connection.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="signup-container">
      <div className="signup-card">

        {/* ── Left Brand Panel ── */}
        <div className="signup-brand">
          <div className="brand-logo">
            <div className="brand-logo-icon">
              <FaBus color="white" />
            </div>
            <div className="brand-logo-text">
              Bus<span>Book</span>
            </div>
          </div>

          <div className="brand-tagline">
            <h2>Join the Admin Network</h2>
            <p>Set up your account and start managing the fleet in minutes.</p>
          </div>

          <div className="brand-steps">
            <div className="brand-step">
              <div className="brand-step-num">1</div>
              <div className="brand-step-text">Create your admin account</div>
            </div>
            <div className="brand-step">
              <div className="brand-step-num">2</div>
              <div className="brand-step-text">Sign in to your portal</div>
            </div>
            <div className="brand-step">
              <div className="brand-step-num">3</div>
              <div className="brand-step-text">Start managing buses & bookings</div>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="signup-form-panel">
          <div className="signup-header">
            <h1>Create Account</h1>
            <p>Fill in the details to set up your admin profile</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {error && <div className="error-message">⚠ {error}</div>}

            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaUser /></span>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="form-input"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
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
                  required
                  placeholder="admin@busbook.com"
                  className="form-input"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
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
                  required
                  placeholder="Min. 6 characters"
                  className="form-input"
                  minLength="6"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper password-input-container">
                <span className="input-icon"><FaLock /></span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat your password"
                  className="form-input"
                  minLength="6"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <span className="loading-spinner" />}
              {loading ? 'Creating Account…' : 'Create Admin Account'}
            </button>
          </form>

          <div className="signup-footer">
            Already have an account?
            <Link to="/admin/login" className="link">Sign In</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;
