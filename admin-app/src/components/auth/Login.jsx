import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to log in: ' + (err.response?.data?.message || err.message || 'Invalid email or password'));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="admin-header">
          <h2>Admin Portal</h2>
          <p>Sign in to access the dashboard</p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="admin@example.com"
              autoComplete="off"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
              autoComplete="off"
              className="form-control"
            />
          </div>
          
          <button 
            disabled={loading} 
            type="submit" 
            className="btn btn-primary w-100"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="auth-links">
            <p>Don't have an account? <Link to="/admin/register">Register here</Link></p>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>© {new Date().getFullYear()} Bus Reservation System</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
