import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const navbar = document.querySelector('.navbar');
      const profileButton = document.querySelector('.profile-button');
      const dropdownMenu = document.querySelector('.dropdown-menu');
      
      if (isMobileMenuOpen && navbar && !navbar.contains(e.target) && 
          profileButton && !profileButton.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
      
      if (isUserMenuOpen && dropdownMenu && !dropdownMenu.contains(e.target) &&
          profileButton && !profileButton.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isUserMenuOpen]);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button 
            className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
        </div>
        
        <div className="navbar-center">
          <Link to="/admin/dashboard" className="navbar-logo">
            <div className="logo-icon">🚌</div>
            <div className="logo-text-container">
              <span className="logo-text">BusBook</span>
              <span className="logo-subtext">Admin Dashboard</span>
            </div>
          </Link>
        </div>
        
        <div className="navbar-right">
          {isAuthenticated && (
            <>
              {/* Profile Dropdown - Visible on all screens */}
              <div className="profile-dropdown" aria-expanded={isUserMenuOpen}>
                <button 
                  className="profile-button"
                  onClick={toggleUserMenu}
                  aria-label="User menu"
                  aria-haspopup="true"
                >
                  <span className="user-avatar">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="user-email">Profile</span>
                  <span className={`dropdown-arrow ${isUserMenuOpen ? 'up' : 'down'}`}>▼</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="dropdown-menu show">
                    <div className="dropdown-header">
                      <div className="user-avatar large">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user?.name || 'Admin User'}</div>
                        <div className="user-email">{user?.email || 'admin@example.com'}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <span className="icon">🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Mobile Navigation */}
        <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link 
              to="/admin/dashboard" 
              className={`navbar-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
              onClick={closeAllMenus}
            >
              <span>📊</span> Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/admin/buses" 
              className={`navbar-link ${location.pathname.startsWith('/admin/buses') ? 'active' : ''}`}
              onClick={closeAllMenus}
            >
              <span>🚌</span> Buses
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/admin/todays-buses" 
              className={`navbar-link ${location.pathname === '/admin/todays-buses' ? 'active' : ''}`}
              onClick={closeAllMenus}
            >
              <span>📅</span> Today's Buses
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/admin/bookings" 
              className={`navbar-link ${location.pathname === '/admin/bookings' ? 'active' : ''}`}
              onClick={closeAllMenus}
            >
              <span>🎫</span> Bookings
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/admin/buses/new" 
              className={`navbar-link ${location.pathname === '/admin/buses/new' ? 'active' : ''}`}
              onClick={closeAllMenus}
            >
              <span>➕</span> Add Bus
            </Link>
          </li>
        </ul>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="menu-overlay" 
            onClick={closeAllMenus}
            aria-hidden="true"
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
