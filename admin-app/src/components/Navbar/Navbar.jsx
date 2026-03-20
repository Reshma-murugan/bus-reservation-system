import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BsBusFrontFill, BsGrid1X2Fill, BsCalendar, BsTicketDetailed, BsPlusLg, BsBoxArrowRight } from 'react-icons/bs';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll for glass effect
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <BsGrid1X2Fill />, activeRule: (path) => path === '/admin/dashboard' },
    { to: '/admin/buses', label: 'Buses', icon: <BsBusFrontFill />, activeRule: (path) => path.startsWith('/admin/buses') && path !== '/admin/buses/new' },
    { 
      to: '/admin/todays-buses', 
      label: "Today's Buses", 
      icon: (
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <BsCalendar />
          <span style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.45em', fontWeight: 'bold' }}>
            {new Date().getDate()}
          </span>
        </span>
      ),
      activeRule: (path) => path === '/admin/todays-buses' 
    },
    { to: '/admin/bookings', label: 'Bookings', icon: <BsTicketDetailed />, activeRule: (path) => path === '/admin/bookings' },
    { to: '/admin/buses/new', label: 'Add Bus', icon: <BsPlusLg />, activeRule: (path) => path === '/admin/buses/new' },
  ];

  return (
    <nav className={`navbar ${scrolled || isMobileMenuOpen ? 'scrolled' : ''}`}>
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

          <Link to="/admin/dashboard" className="navbar-logo">
            <div className="logo-icon"><BsBusFrontFill /></div>
            <div className="logo-text-container">
              <span className="logo-text">BusBook</span>
              <span className="logo-subtext">Admin</span>
            </div>
          </Link>
        </div>
        
        <div className="navbar-center">
          {/* Desktop Navigation */}
          <ul className="navbar-menu-desktop">
            {navItems.map((item) => (
              <li key={item.to} className="navbar-item">
                <Link 
                  to={item.to} 
                  className={`navbar-link ${item.activeRule(location.pathname) ? 'active' : ''}`}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              </li>
            ))}
          </ul>
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
                  <span className="user-email">{user?.name || 'Account'}</span>
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
                      <span className="icon"><BsBoxArrowRight /></span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Mobile Navigation (Slide out) */}
        <ul className={`navbar-menu-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <li key={item.to} className="navbar-item">
              <Link 
                to={item.to} 
                className={`navbar-link ${item.activeRule(location.pathname) ? 'active' : ''}`}
                onClick={closeAllMenus}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            </li>
          ))}
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
