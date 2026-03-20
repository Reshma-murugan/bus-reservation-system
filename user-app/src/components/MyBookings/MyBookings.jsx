import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './MyBookings.css';

// Sub-components
import BookingCard from './BookingCard';
import BookingFilters from './BookingFilters';

const MyBookings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('today');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user/bookings/me');
      setBookings(response.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, navigate, fetchBookings]);

  const filterBookings = (bookingsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookingsList.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const journeyDate = new Date(booking.journeyDate);
      
      switch(activeFilter) {
        case 'confirmed': return booking.status !== 'CANCELLED';
        case 'cancelled': return booking.status === 'CANCELLED';
        case 'today': {
          const creationDate = new Date(booking.createdAt || booking.bookingDate);
          return creationDate.toDateString() === today.toDateString();
        }
        case 'past': {
          const creationDate = new Date(booking.createdAt || booking.bookingDate);
          return creationDate < today && creationDate.toDateString() !== today.toDateString();
        }
        case 'journey-today': return journeyDate.toDateString() === today.toDateString();
        case 'past-journeys': return journeyDate < today && journeyDate.toDateString() !== today.toDateString();
        case 'future-journeys': return journeyDate > today;
        default: return true;
      }
    });
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    
    const reason = prompt('Please enter the reason for cancellation:');
    if (reason === null) return;
    
    try {
      setLoading(true);
      await api.patch(`/user/bookings/${bookingId}/cancel`, { 
        status: 'CANCELLED',
        reason 
      });
      fetchBookings();
      alert('Booking has been cancelled successfully!');
    } catch (err) {
      console.error('Cancel booking error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel booking.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="my-bookings">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const filteredBookings = filterBookings(bookings);

  return (
    <div className="my-bookings">
      <div className="bookings-header">
        <h2>My Bookings</h2>
        <p>Manage your bus ticket reservations</p>
        <div className="bookings-total">
          Total Bookings: {bookings.length}
        </div>
      </div>

      <BookingFilters 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
      />

      <div className="bookings-container">
        {error && <div className="error-message">⚠️ {error}</div>}
        
        {filteredBookings.length > 0 ? (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onCancel={handleCancel}
                loading={loading}
              />
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <p>No bookings found matching your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
