import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProfileDropdown.css';

const ProfileDropdown = ({ userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    function handleClick(event) {
      const dropdownMenu = dropdownRef.current?.querySelector('.dropdown-menu');
      const profileButton = dropdownRef.current?.querySelector('.profile-button');
      
      // Don't close if clicking on scrollbar or inside dropdown
      if (event.target.closest('.dropdown-menu') || 
          event.target.closest('.profile-button')) {
        return;
      }
      
      setIsOpen(false);
    }
    
    // Add event listeners
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="user-avatar">
          {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
        </span>
        <span className="user-email">{userEmail || 'User'}</span>
        <span className={`dropdown-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu" role="menu">
          <div className="dropdown-header">
            <div className="user-avatar large">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="user-info">
              <div className="user-email">{userEmail || 'admin@example.com'}</div>
              <div className="user-role">Administrator</div>
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
  );
};

export default ProfileDropdown;
