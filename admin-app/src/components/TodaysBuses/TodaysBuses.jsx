import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatTimeTo12h } from '../../utils/dateUtils';
import { BsArrowRight, BsPlusLg } from 'react-icons/bs';
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
            <span className="route-arrow" style={{margin: '0 10px'}}><BsArrowRight /></span>
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
                      {formatTimeTo12h(stop.arrivalTime)}
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
        <div className="route-arrow" style={{margin: '0 10px'}}><BsArrowRight /></div>
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
        <div className="header-title">
          <h1>Today's Active Fleet</h1>
          <p className="date-info">Live monitoring for {formattedDate}</p>
        </div>
        <button onClick={fetchTodaysBuses} className="btn btn-secondary">
          Refresh Live Status
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

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Buses on Road</h3>
          <div className="stat-number">{todaysBuses.length}</div>
        </div>
        <div className="summary-card">
          <h3>Today's Schedule</h3>
          <div className="stat-number" style={{fontSize: '1.5rem'}}>{formattedDate}</div>
        </div>
      </div>

      {todaysBuses.length === 0 ? (
        <div className="no-data">
          <p>No buses are scheduled to run today.</p>
          <Link to="/admin/buses/new" className="btn btn-primary" style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
            <BsPlusLg /> Add New Bus Fleet
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
                <div className="bus-name-group">
                  <h3>{bus.name}</h3>
                  <span className="bus-type">{bus.type ? bus.type.replace('_', ' ') : 'Standard'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Capacity</span>
                  <span className="meta-value">{bus.capacity || 19} Seats</span>
                </div>
              </div>
              
              <div className="route-strip">
                <div className="route-point">
                  <span className="point-city">{bus.busStops?.[0]?.stop?.name || 'Origin'}</span>
                  <span className="point-time">{formatTimeTo12h(bus.busStops?.[0]?.arrivalTime)}</span>
                </div>
                <div className="route-arrow" style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)'}}>
                  <span>──────────</span>
                  <BsArrowRight />
                </div>
                <div className="route-point" style={{textAlign: 'right'}}>
                  <span className="point-city">{bus.busStops?.slice(-1)[0]?.stop?.name || 'Dest.'}</span>
                  <span className="point-time">{formatTimeTo12h(bus.busStops?.slice(-1)[0]?.arrivalTime)}</span>
                </div>
              </div>
              
              {expandedBusId === bus.id && (
                <div className="expanded-details">
                   <table className="stops-table">
                    <thead>
                      <tr>
                        <th>Stop</th>
                        <th>Arrival</th>
                        <th>Fare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bus.busStops?.sort((a,b) => a.sequenceOrder - b.sequenceOrder).map((stop, idx) => (
                        <tr key={idx}>
                          <td>{stop.stop?.name}</td>
                          <td>{formatTimeTo12h(stop.arrivalTime)}</td>
                          <td>₹{stop.cumulativeFare}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bus-actions" style={{marginTop: '1.5rem', display: 'flex', gap: '1rem'}}>
                    <Link to={`/admin/buses/${bus.id}/edit`} className="btn-edit" onClick={e => e.stopPropagation()}>Manage Bus</Link>
                    <Link to={`/admin/buses/${bus.id}`} className="btn-view" onClick={e => e.stopPropagation()}>View Analytics</Link>
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
