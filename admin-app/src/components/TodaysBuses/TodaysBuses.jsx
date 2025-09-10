import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './TodaysBuses.css';

function TodaysBuses() {
  const [todaysBuses, setTodaysBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBusId, setExpandedBusId] = useState(null);

  useEffect(() => {
    fetchTodaysBuses();
  }, []);

  const fetchTodaysBuses = async () => {
    try {
      setLoading(true);
      // First try the new endpoint that returns just today's buses
      try {
        const response = await api.get('/admin/buses/today');
        console.log('Today\'s buses (new endpoint):', response.data);
        setTodaysBuses(Array.isArray(response.data) ? response.data : []);
        return;
      } catch (error) {
        console.log('Falling back to old endpoint');
      }
      
      // Fallback to the old endpoint if the new one fails
      const response = await api.get('/admin/buses/today-status');
      console.log('Today\'s buses (status endpoint):', response.data);
      
      // Debug: Log the first bus to see its structure
      if (response.data && response.data.runningBuses && response.data.runningBuses.length > 0) {
        console.log('First bus data:', response.data.runningBuses[0]);
      }
      
      if (response.data && response.data.runningBuses) {
        setTodaysBuses(response.data.runningBuses);
      } else if (Array.isArray(response.data)) {
        setTodaysBuses(response.data);
      } else {
        setTodaysBuses([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s buses:', error);
      setError('Failed to load today\'s buses');
      setTodaysBuses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="todays-buses">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading today's buses...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format bus schedule days for display
  const formatScheduleDays = (days) => {
    console.log('Formatting days:', days);
    if (!days || days.length === 0) return 'Daily';
    return days.map(day => 
      day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
    ).join(', ');
  };
  
  // Format route with all stops and pricing
  const formatRouteDetails = (bus) => {
    if (!bus) return 'N/A';
    
    // If we have the full bus object with busStops
    if (bus.busStops && bus.busStops.length > 0) {
      const sortedStops = [...bus.busStops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      const origin = sortedStops[0]?.stop?.name || 'N/A';
      const destination = sortedStops[sortedStops.length - 1]?.stop?.name || 'N/A';
      
      return (
        <div className="route-details">
          <div className="route-header">
            <span className="route-origin">{origin}</span>
            <span className="route-arrow">→</span>
            <span className="route-destination">{destination}</span>
          </div>
          <div className="stops-list">
            <h4>Route Stops:</h4>
            <table className="stops-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Stop Name</th>
                  <th>Arrival Time</th>
                  <th>Fare from Origin</th>
                </tr>
              </thead>
              <tbody>
                {sortedStops.map((stop, index) => (
                  <tr key={stop.id} className={index === 0 ? 'first-stop' : ''}>
                    <td>{index + 1}</td>
                    <td className="stop-name">
                      {stop.stop?.name || 'Unknown Stop'}
                      {index === 0 && <div className="stop-sequence">(Origin)</div>}
                      {index === sortedStops.length - 1 && <div className="stop-sequence">(Destination)</div>}
                    </td>
                    <td>
                      {stop.arrivalTime ? new Date(`1970-01-01T${stop.arrivalTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                    </td>
                    <td>
                      {stop.cumulativeFare ? `₹${parseFloat(stop.cumulativeFare).toFixed(2)}` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    // Fallback to the old format if we don't have busStops
    if (bus.route) {
      return bus.route;
    }
    
    return 'N/A';
  };

  // Simple route display for the main card
  const formatRouteSummary = (bus) => {
    if (!bus.busStops || bus.busStops.length < 2) return 'N/A';
    const sortedStops = [...bus.busStops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const origin = sortedStops[0]?.stop?.name || 'N/A';
    const destination = sortedStops[sortedStops.length - 1]?.stop?.name || 'N/A';
    
    return (
      <div className="route-summary">
        <div className="route-ends">
          <span className="route-origin">{origin}</span>
        </div>
        <div className="route-arrow">→</div>
        <div className="route-ends">
          <span className="route-destination">{destination}</span>
        </div>
      </div>
    );
  };
  
  const toggleBusDetails = (busId) => {
    setExpandedBusId(expandedBusId === busId ? null : busId);
  };

  return (
    <div className="todays-buses">
      <div className="page-header">
        <h1>Today's Buses</h1>
        <p className="date-info">Running on {formattedDate}</p>
        <button onClick={fetchTodaysBuses} className="refresh-btn">
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchTodaysBuses} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      <div className="buses-summary">
        <div className="summary-card">
          <h3>Total Buses Running</h3>
          <div className="stat-number">{todaysBuses.length}</div>
        </div>
        <div className="summary-card">
          <h3>For</h3>
          <div className="stat-number">{formattedDate.split(',')[0]}</div>
        </div>
      </div>

      {todaysBuses.length === 0 ? (
        <div className="no-data">
          <p>No buses are scheduled to run today.</p>
          <Link to="/buses/new" className="add-bus-btn">
            Add New Bus
          </Link>
        </div>
      ) : (
        <div className="buses-grid">
          {todaysBuses.map((bus) => (
            <div 
              key={bus.id} 
              className={`bus-card ${expandedBusId === bus.id ? 'expanded' : ''}`}
              onClick={() => toggleBusDetails(bus.id)}
            >
              <div className="bus-header">
                <div>
                  <h3>{bus.name} <span className="bus-type">{bus.type ? bus.type.replace('_', ' ') : 'Standard'}</span></h3>
                  <div className="bus-meta">
                    <span className="bus-seats">
                      <i className="fas fa-chair"></i> {bus.capacity || 19} seats
                    </span>
                  </div>
                </div>
                <button 
                  className="expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBusDetails(bus.id);
                  }}
                >
                  {expandedBusId === bus.id ? '▲' : '▼'}
                </button>
              </div>
              
              <div className="route-summary-container">
                {formatRouteSummary(bus)}
              </div>
              
              {expandedBusId === bus.id && (
                <div className="expanded-details">
                  {formatRouteDetails(bus)}
                  <div className="bus-actions">
                    <Link 
                      to={`/admin/buses/edit/${bus.id}`} 
                      className="action-btn edit-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit Bus
                    </Link>
                    <Link 
                      to={`/admin/buses/${bus.id}`} 
                      className="action-btn view-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodaysBuses;
