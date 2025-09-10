import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">🚌</span>
          <span className="logo-text">BusBook</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            <span>🏠</span>
            Home
          </Link>
          
          {isAuthenticated() && (
            <Link 
              to="/my-bookings" 
              className={`navbar-link ${isActive('/my-bookings') ? 'active' : ''}`}
            >
              <span>📋</span>
              My Bookings
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="navbar-auth">
          {isAuthenticated() ? (
            <div className="user-menu" ref={profileDropdownRef}>
              <div className="profile-icon" onClick={toggleProfileDropdown}>
                <div className="user-avatar">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              
              {isProfileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="user-avatar-large">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user?.name || 'User'}</div>
                      <div className="user-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider"></div>
                  <button className="dropdown-logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link 
                to="/login" 
                className={`auth-btn login-btn ${isActive('/login') ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className={`auth-btn register-btn ${isActive('/register') ? 'active' : ''}`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <Link 
            to="/" 
            className={`mobile-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span>🏠</span>
            Home
          </Link>
          
          {isAuthenticated() ? (
            <>
              <Link 
                to="/my-bookings" 
                className={`mobile-link ${isActive('/my-bookings') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>📋</span>
                My Bookings
              </Link>
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="mobile-user-details">
                    <div className="mobile-user-name">{user?.name || 'User'}</div>
                    <div className="mobile-user-email">{user?.email}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`mobile-link ${isActive('/login') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>🔑</span>
                Sign In
              </Link>
              <Link 
                to="/register" 
                className={`mobile-link ${isActive('/register') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>✨</span>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={closeMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;
