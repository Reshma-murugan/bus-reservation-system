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
          {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
        </span>
        <span className="user-email">{userEmail?.split('@')[0] || 'Admin'}</span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu" role="menu">
          <div className="dropdown-header">
            <div className="user-avatar">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="dropdown-info">
              <span className="dropdown-email">{userEmail || 'admin@busbook.com'}</span>
              <span className="dropdown-role">System Administrator</span>
            </div>
          </div>
          
          <div className="dropdown-content">
            <button className="dropdown-item">
              <i className="bi bi-person-badge"></i> View Profile
            </button>
            <button className="dropdown-item">
              <i className="bi bi-shield-lock"></i> Security settings
            </button>
            <button 
              className="dropdown-item logout"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i> Sign Out Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
