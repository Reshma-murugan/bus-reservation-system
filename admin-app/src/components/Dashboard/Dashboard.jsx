import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
      <main className="dashboard-main">
        <div className="container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🚌</div>
              <div className="stat-info">
                <div className="stat-number">{stats.totalBuses}</div>
                <div className="stat-label">Total Buses</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-number">{stats.activeBuses}</div>
                <div className="stat-label">Active Buses</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-number">{stats.todayBuses}</div>
                <div className="stat-label">Today's Buses</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-info">
                <div className="stat-number">{stats.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading recent buses...</div>
          ) : (
            <div className="recent-buses">
              <h2>Recent Buses</h2>
              {Array.isArray(buses) && buses.length > 0 ? (
                buses.slice(0, 5).map(bus => {
                  // Extract complete route from bus stops
                  const busStops = bus.busStops || [];
                  const sortedStops = busStops.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
                  const completeRoute = sortedStops.length > 0 
                    ? sortedStops.map(stop => stop.stop?.name || 'Unknown').join(' → ')
                    : 'Route not available';
                  
                  return (
                    <div key={bus.id} className="bus-summary-card">
                      <div className="bus-info">
                        <h4>{completeRoute}</h4>
                        <p>{bus.name} ({bus.type}) - {bus.operatorName}</p>
                        <span className="status active">Active</span>
                      </div>
                      <div className="bus-actions">
                        <span className="capacity">{bus.capacity || 0} seats</span>
                        <Link to={`/buses/edit/${bus.id}`} className="btn btn-outline">
                          Edit
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No recent buses found.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;