import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>; // Or a proper loading component
  }

  if (!isAuthenticated()) {
    // Redirect to login page with the return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role
  if (isAuthenticated()) {
    return children;
  }

  // If not admin, redirect to unauthorized or home
  return <Navigate to="/unauthorized" replace />;
};

export default AdminProtectedRoute;
