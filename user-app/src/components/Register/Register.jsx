import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';
import '../Login/Login.css'; // Import shared styles

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value ? 'Name is required' : 
               value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        return !value ? 'Email is required' : 
               !/\S+@\S+\.\S+/.test(value) ? 'Please enter a valid email' : '';
      case 'password':
        return !value ? 'Password is required' : 
               value.length < 6 ? 'Password must be at least 6 characters' : '';
      case 'confirmPassword':
        return !value ? 'Please confirm your password' : 
               value !== formData.password ? 'Passwords do not match' : '';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      if (fieldError) errors[key] = fieldError;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/'); // Redirect to home page after successful registration
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    if (fieldError) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join us to start booking bus tickets</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className={`form-group ${fieldErrors.name ? 'has-error' : ''}`}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              required
            />
            {fieldErrors.name && (
              <div className="error-message">
                ❌ {fieldErrors.name}
              </div>
            )}
          </div>

          <div className={`form-group ${fieldErrors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
            />
            {fieldErrors.email && (
              <div className="error-message">
                ❌ {fieldErrors.email}
              </div>
            )}
          </div>

          <div className={`form-group ${fieldErrors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a strong password (min 6 characters)"
              required
              minLength="6"
            />
            {fieldErrors.password && (
              <div className="error-message">
                ❌ {fieldErrors.password}
              </div>
            )}
          </div>

          <div className={`form-group ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              required
              minLength="6"
            />
            {fieldErrors.confirmPassword && (
              <div className="error-message">
                ❌ {fieldErrors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-full"
            disabled={loading}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;