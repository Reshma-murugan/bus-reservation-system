import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdAccountCircle } from 'react-icons/md';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-spacer"></div> {/* Placeholder for alignment if needed */}

        {/* Right Group: Menu, Auth, and Toggle */}
        <div className="navbar-right-group">
          {/* Desktop Navigation */}
          <div className="navbar-menu">
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            >
              home
            </Link>
            
            {isAuthenticated() && (
              <Link 
                to="/my-bookings" 
                className={`navbar-link ${isActive('/my-bookings') ? 'active' : ''}`}
              >
                bookings
              </Link>
            )}

            <Link 
              to="#" 
              className="navbar-link"
            >
              Contact
            </Link>
          </div>

          {/* Auth Section */}
          <div className="navbar-auth">
            {isAuthenticated() ? (
              <div className="user-menu" ref={profileDropdownRef}>
                <div className="profile-icon" onClick={toggleProfileDropdown}>
                  <MdAccountCircle className="user-icon" />
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
                  className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
                >
                  login
                </Link>
                <Link 
                  to="/register" 
                  className={`navbar-link ${isActive('/register') ? 'active' : ''}`}
                >
                  register
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
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <Link 
            to="/" 
            className={`mobile-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            home
          </Link>
          
          {isAuthenticated() ? (
            <>
              <Link 
                to="/my-bookings" 
                className={`mobile-link ${isActive('/my-bookings') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                bookings
              </Link>
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <MdAccountCircle className="mobile-user-icon" />
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
                login
              </Link>
              <Link 
                to="/register" 
                className={`mobile-link ${isActive('/register') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                register
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
