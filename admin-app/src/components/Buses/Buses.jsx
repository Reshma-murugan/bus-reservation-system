import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { BsArrowRepeat, BsPlusLg, BsRecordCircleFill, BsPencilSquare, BsTrash } from 'react-icons/bs';
import './Buses.css';

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchBuses();
  }, []);

  // Refresh when coming back from other pages
  useEffect(() => {
    if (location.pathname === '/admin/buses') {
      fetchBuses();
    }
  }, [location.pathname]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching buses from /admin/buses...');
      const response = await api.get('/admin/buses');
      console.log('Buses API response:', response.data);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setBuses(response.data);
        console.log(`Successfully loaded ${response.data.length} buses`);
      } else {
        setBuses([]);
        console.error('API response is not an array:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError('Failed to fetch buses: ' + (err.response?.data?.message || err.message));
      setBuses([]); // Set empty array on error
      console.error('Error fetching buses:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await api.delete(`/admin/buses/${busId}`);
        setBuses(buses.filter(bus => bus.id !== busId));
      } catch (err) {
        setError('Failed to delete bus');
        console.error('Error deleting bus:', err);
      }
    }
  };

  if (loading) return <div className="loading">Loading buses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="buses-container">
      <div className="buses-header">
        <div className="header-title">
          <h1>Bus Management</h1>
          <p className="buses-subtitle">Manage your fleet, routes, and active service status.</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={fetchBuses} 
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : <><BsArrowRepeat /> Refresh</>}
          </button>
          <Link to="/admin/buses/new" className="btn btn-primary">
            <BsPlusLg /> Add New Bus
          </Link>
        </div>
      </div>

      <div className="buses-grid">
        {!Array.isArray(buses) || buses.length === 0 ? (
          <div className="no-buses">
            <p>No buses found. Add your first bus!</p>
            <Link to="/admin/buses/new" className="btn btn-primary">
              Add Bus
            </Link>
          </div>
        ) : (
          buses.map(bus => {
            const busStops = bus.busStops || [];
            const sortedStops = busStops.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
            const completeRoute = sortedStops.length > 0 
              ? sortedStops.map(stop => stop.stop?.name || 'Unknown').join(' → ')
              : 'Route not available';
            
            return (
              <div key={bus.id} className="bus-card">
                <div className="bus-main-info">
                  <div className="bus-title-group">
                    <span className="bus-operator">{bus.operatorName}</span>
                    <h3>{completeRoute}</h3>
                  </div>
                  <span className="bus-status-badge">
                    {bus.active ? <><BsRecordCircleFill style={{marginRight: '6px'}}/> Active</> : <><BsRecordCircleFill style={{marginRight: '6px', opacity: 0.5}}/> Inactive</>}
                  </span>
                </div>

                <div className="bus-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Bus Name</span>
                    <span className="detail-value">{bus.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{bus.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity</span>
                    <span className="detail-value">{bus.capacity} Seats</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Stops</span>
                    <span className="detail-value">{bus.busStops?.length || 0} Points</span>
                  </div>
                </div>

                <div className="bus-actions">
                  <Link 
                    to={`/admin/buses/${bus.id}/edit`} 
                    className="btn btn-edit"
                  >
                    <BsPencilSquare /> Edit Details
                  </Link>
                  <button 
                    onClick={() => deleteBus(bus.id)}
                    className="btn btn-danger"
                  >
                    <BsTrash /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Buses;
