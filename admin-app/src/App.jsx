import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import AdminLogin from './components/auth/Login';
import Signup from './components/Signup/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Buses from './components/Buses/Buses';
import BusForm from './components/BusForm/BusForm';
import Bookings from './components/Bookings/Bookings';
import TodaysBuses from './components/TodaysBuses/TodaysBuses';
import './App.css';
import './components/auth/Auth.css';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {isAuthenticated() && <Navbar />}
      <main className={`main-content ${isAuthenticated() ? 'with-navbar' : ''}`}>
        <Routes>
          <Route 
            path="/admin/login" 
            element={isAuthenticated() ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} 
          />
          <Route 
            path="/admin/register" 
            element={isAuthenticated() ? <Navigate to="/admin/dashboard" /> : <Signup />} 
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/buses"
            element={
              <AdminProtectedRoute>
                <Buses />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminProtectedRoute>
                <Bookings />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/buses/new"
            element={
              <AdminProtectedRoute>
                <BusForm />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/buses/:id/edit"
            element={
              <AdminProtectedRoute>
                <BusForm />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/todays-buses"
            element={
              <AdminProtectedRoute>
                <TodaysBuses />
              </AdminProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;