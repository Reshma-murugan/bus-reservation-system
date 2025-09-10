import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Results from './components/Results/Results';
import BusDetails from './components/BusDetails/BusDetails';
import Payment from './components/Payment/Payment';
import MyBookings from './components/MyBookings/MyBookings';
import FareCalculator from './components/FareCalculator/FareCalculator';
import UserLogin from './components/auth/Login';
import './App.css';
import './components/auth/Auth.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fare-calculator" element={<FareCalculator />} />
          <Route 
            path="/login" 
            element={isAuthenticated() ? <Navigate to="/" /> : <UserLogin />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated() ? <Navigate to="/" /> : <Register />} 
          />
          <Route path="/results" element={<Results />} />
          <Route path="/bus/:busId" element={<BusDetails />} />
          <Route
            path="/payment"
            element={
              <PrivateRoute>
                <Payment />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            }
          />
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