import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import './MyBookings.css';

const getStatusDisplay = (status) => {
  const statusMap = {
    'CONFIRMED': 'Confirmed',
    'CANCELLED': 'Cancelled',
    'COMPLETED': 'Completed'
  };
  return statusMap[status] || status;
};

const MyBookings = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busRoutes, setBusRoutes] = useState({}); // Store bus routes by bus ID
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'confirmed', 'cancelled', 'today', 'past', 'journey-today', 'past-journeys', 'future-journeys'

  const fetchBusRoute = useCallback(async (busId) => {
    try {
      const response = await api.get(`/buses/${busId}/stops`);
      return response.data || [];
    } catch (err) {
      console.error('Error fetching bus route:', err);
      return [];
    }
  }, []);

  // Function to filter bookings based on active filter
  const filterBookings = (bookingsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookingsList.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const journeyDate = new Date(booking.journeyDate);
      
      switch(activeFilter) {
        case 'confirmed':
          return booking.status !== 'CANCELLED';
        case 'cancelled':
          return booking.status === 'CANCELLED';
        case 'today':
          return bookingDate.toDateString() === today.toDateString();
        case 'past':
          return bookingDate < today && bookingDate.toDateString() !== today.toDateString();
        case 'journey-today':
          return journeyDate.toDateString() === today.toDateString();
        case 'past-journeys':
          return journeyDate < today && journeyDate.toDateString() !== today.toDateString();
        case 'future-journeys':
          return journeyDate > today;
        case 'all':
        default:
          return true;
      }
    });
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user/bookings/me');
      const bookingsData = response.data || [];
      setBookings(bookingsData);

      // Extract and set bus routes from the booking data
      const routes = {};
      bookingsData.forEach(booking => {
        if (booking.bus?.id && booking.bus.stops) {
          routes[booking.bus.id] = booking.bus.stops;
        }
      });
      setBusRoutes(routes);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchBusRoute, navigate]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, navigate, fetchBookings]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      // Assuming time format is HH:mm
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const getTotalBookings = () => {
    return bookings.length;
  };

  const renderRoute = (booking) => {
    // If we have bus stops data, show the full route
    if (booking.bus?.stops?.length > 0) {
      const stops = [...booking.bus.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      const fromSeq = booking.fromSeq;
      const toSeq = booking.toSeq;
      
      return (
        <div className="route-container">
          {stops.map((stop, index) => {
            const isActive = stop.sequenceOrder >= fromSeq && stop.sequenceOrder <= toSeq;
            const isFirst = index === 0;
            const isLast = index === stops.length - 1;
            const isStart = stop.sequenceOrder === fromSeq;
            const isEnd = stop.sequenceOrder === toSeq;
            const stopName = stop.stop?.name || stop.name || `Stop ${stop.sequenceOrder}`;
            
            return (
              <React.Fragment key={stop.id || index}>
                {!isFirst && (
                  <div className={`route-connector ${isActive ? 'active' : ''}`}>
                    <span className="route-arrow">→</span>
                  </div>
                )}
                <div 
                  className={`route-stop ${isActive ? 'active' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
                  title={`${stopName}${stop.arrivalTime ? ` (${stop.arrivalTime})` : ''}`}
                >
                  {isFirst || isLast || isStart || isEnd ? (
                    <span className="stop-name">{stopName}</span>
                  ) : (
                    <span className="stop-dot">•</span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    // Fallback to simple view if we don't have full route data
    const fromName = booking.fromStopName || `Stop ${booking.fromSeq}`;
    const toName = booking.toStopName || `Stop ${booking.toSeq}`;
    
    return (
      <div className="route-simple">
        {fromName} → {toName}
      </div>
    );
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    
    const reason = prompt('Please enter the reason for cancellation:');
    if (reason === null) return; // User cancelled the prompt
    
    try {
      // First update the UI optimistically
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'CANCELLED' } 
            : booking
        )
      );
      
      // Then make the API call
      const response = await api.patch(`/user/bookings/${bookingId}/cancel`, { 
        status: 'CANCELLED',
        reason 
      });
      
      // Refresh the bookings list to ensure consistency
      fetchBookings();
      alert('Booking has been cancelled successfully!');
      
    } catch (err) {
      console.error('Cancel booking error:', err);
      // Revert the optimistic update on error
      fetchBookings();
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel booking. Please try again or contact support.';
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="my-bookings">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-bookings">
        <div className="error-message">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  const filteredBookings = filterBookings(bookings);

  return (
    <div className="bookings-container">
      {filteredBookings.length > 0 ? (
        <div className="bookings-list">
            {filterBookings(bookings).map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <div className="booking-id">
                      Booking #{booking.id}
                    </div>
                    <div className="booking-route">
                      {renderRoute(booking)}
                    </div>
                  </div>
                  <div className={`booking-status ${
                    booking.status === 'CANCELLED' 
                      ? 'status-cancelled' 
                      : 'status-confirmed'
                  }`}>
                    {getStatusDisplay(booking.status)}
                  </div>
                </div>

                <div className="booking-body">
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">Travel Date</span>
                      <span className="detail-value">{formatDate(booking.journeyDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Bus</span>
                      <span className="detail-value">{booking.bus?.name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Type</span>
                      <span className="detail-value">{booking.bus?.type || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Operator</span>
                      <span className="detail-value">{booking.bus?.operatorName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Booked On</span>
                      <span className="detail-value">{formatDate(booking.createdAt)}</span>
                    </div>
                  </div>

                  <div className="seat-info">
                    <div className="seat-row">
                      <div className="seat-numbers">
                        <span className="seat-label">Selected Seat No</span>
                        <span className="seat-list">
                          {booking.seat?.seatNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="amount-row">
                      <div className="total-amount">
                        ₹{booking.amount || 0}
                      </div>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {!['CANCELLED', 'CANCELLED_REFUNDED', 'CANCELLED_REFUND_REQUESTED', 'REFUNDED'].includes(booking.status) && (
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="cancel-btn"
                        title="Cancel this booking"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Cancel'}
                      </button>
                    )}
                  </div>
              </div>
            </div>
          ))}
      </div>
    ) : (
      <div className="no-bookings">
        <p>No bookings found matching your filter criteria.</p>
      </div>
    )}
  </div>
  );
};

export default MyBookings;
