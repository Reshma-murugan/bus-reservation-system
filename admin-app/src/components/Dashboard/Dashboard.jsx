import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BsBusFrontFill, BsCheckCircleFill, BsCalendar, BsTicketDetailed } from 'react-icons/bs';
import api from '../../utils/api';
import './Dashboard.css';

function Dashboard() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    todayBuses: 0,
    totalBookings: 0,
  });
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchBuses();
    fetchStats();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await api.get('/admin/buses');
      const data = response.data;

      // Handle different response formats
      let busList = [];
      if (Array.isArray(data)) {
        busList = data;
      } else if (Array.isArray(data.content)) {
        busList = data.content; // For paginated response
      } else if (Array.isArray(data.buses)) {
        busList = data.buses; // If backend wraps in 'buses'
      }

      setBuses(busList);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]); // Ensure buses is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch various statistics
      const [busesRes, todayBusesRes, bookingsRes] = await Promise.allSettled([
        api.get('/admin/buses'),
        api.get('/admin/buses/today'),
        api.get('/admin/bookings')
      ]);

      const buses = busesRes.status === 'fulfilled' ? busesRes.value.data : [];
      const todayBuses = todayBusesRes.status === 'fulfilled' ? todayBusesRes.value.data : [];
      const bookings = bookingsRes.status === 'fulfilled' ? bookingsRes.value.data : [];

      setStats({
        totalBuses: Array.isArray(buses) ? buses.length : 0,
        activeBuses: Array.isArray(buses) ? buses.filter(bus => bus.active !== false).length : 0,
        todayBuses: Array.isArray(todayBuses) ? todayBuses.length : 0,
        totalBookings: Array.isArray(bookings) ? bookings.length : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <Link to="/admin/buses" className="stat-card">
              <div className="stat-icon-wrapper"><BsBusFrontFill /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalBuses}</span>
                <span className="stat-label">Total Buses</span>
              </div>
            </Link>
            <Link to="/admin/buses" className="stat-card">
              <div className="stat-icon-wrapper"><BsCheckCircleFill /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.activeBuses}</span>
                <span className="stat-label">Active Buses</span>
              </div>
            </Link>
            <Link to="/admin/todays-buses" className="stat-card">
              <div className="stat-icon-wrapper" style={{ position: 'relative', display: 'flex' }}>
                <BsCalendar />
                <span style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.5em', fontWeight: 'bold' }}>
                  {new Date().getDate()}
                </span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.todayBuses}</span>
                <span className="stat-label">Today's Buses</span>
              </div>
            </Link>
            <Link to="/admin/bookings" className="stat-card">
              <div className="stat-icon-wrapper"><BsTicketDetailed /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalBookings}</span>
                <span className="stat-label">Total Bookings</span>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-grid">
              <Link to="/admin/buses/new" className="action-card">
                <div className="action-icon"><BsBusFrontFill /></div>
                <div className="action-text">
                  <h3>Add New Bus</h3>
                  <p>Register a new fleet operator or vehicle</p>
                </div>
              </Link>
              <Link to="/admin/bookings" className="action-card">
                <div className="action-icon"><BsTicketDetailed /></div>
                <div className="action-text">
                  <h3>Manage Bookings</h3>
                  <p>View and update recent reservations</p>
                </div>
              </Link>
              <Link to="/admin/todays-buses" className="action-card">
                <div className="action-icon"><BsCheckCircleFill /></div>
                <div className="action-text">
                  <h3>Today's Schedule</h3>
                  <p>Check live buses and active routes</p>
                </div>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading recent buses...</div>
          ) : (
            <div className="recent-buses">
              <h2>Recent Buses</h2>
              <div className="bus-list">
                {Array.isArray(buses) && buses.length > 0 ? (
                  buses.slice(0, 5).map(bus => {
                    const busStops = bus.busStops || [];
                    const sortedStops = busStops.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
                    const completeRoute = sortedStops.length > 0 
                      ? sortedStops.map(stop => stop.stop?.name || 'Unknown').join(' → ')
                      : 'Route not available';
                    
                    return (
                      <div key={bus.id} className="bus-summary-card">
                        <div className="bus-info">
                          <div className="bus-info-header">
                            <BsBusFrontFill style={{ color: 'var(--accent-primary)' }} />
                            <h4 title={completeRoute}>{completeRoute}</h4>
                          </div>
                          <p>{bus.name} • {bus.type} • {bus.operatorName}</p>
                          <span className="status active">Active</span>
                        </div>
                        <div className="bus-actions">
                          <span className="capacity">{bus.capacity || 0} seats</span>
                          <Link to={`/admin/buses/${bus.id}/edit`} className="btn-outline">
                            Edit Details
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No recent buses found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;