import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, confirmed, cancelled, today, past, journey-today, past-journeys, future-journeys
  const [counts, setCounts] = useState({
    all: 0,
    confirmed: 0,
    cancelled: 0,
    today: 0,
    past: 0,
    'journey-today': 0,
    'past-journeys': 0,
    'future-journeys': 0
  });

  useEffect(() => {
    if (bookings.length > 0) {
      console.log('=== BOOKING DATA STRUCTURE ===');
      console.log('First booking object:', JSON.parse(JSON.stringify(bookings[0])));
      console.log('All status values:', bookings.map(b => ({
        id: b.id,
        status: b.status,
        statusType: typeof b.status,
        keys: Object.keys(b)
      })));
      console.log('=== END BOOKING DATA ===');
    }
  }, [bookings]);

  // Function to update counts based on current bookings
  const updateAllCounts = useCallback((bookingsData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newCounts = {
      all: bookingsData.length,
      confirmed: bookingsData.filter(b => b.status === 'CONFIRMED' || b.status === 'CONFIRMED_BOOKING').length,
      cancelled: bookingsData.filter(b => 
        b.status === 'CANCELLED' || 
        b.status === 'CANCELLED_BOOKING'
      ).length,
      today: bookingsData.filter(b => {
        try {
          const date = b.bookingDate ? new Date(b.bookingDate) : null;
          return date && !isNaN(date.getTime()) && date.toDateString() === today.toDateString();
        } catch {
          return false;
        }
      }).length,
      past: bookingsData.filter(b => {
        try {
          const date = b.bookingDate ? new Date(b.bookingDate) : null;
          return date && !isNaN(date.getTime()) && 
                 date < today && 
                 date.toDateString() !== today.toDateString();
        } catch {
          return false;
        }
      }).length,
      'journey-today': bookingsData.filter(b => {
        try {
          const date = b.journeyDate ? new Date(b.journeyDate) : null;
          return date && !isNaN(date.getTime()) && date.toDateString() === today.toDateString();
        } catch {
          return false;
        }
      }).length,
      'past-journeys': bookingsData.filter(b => {
        try {
          const date = b.journeyDate ? new Date(b.journeyDate) : null;
          return date && !isNaN(date.getTime()) && 
                 date < today && 
                 date.toDateString() !== today.toDateString();
        } catch {
          return false;
        }
      }).length,
      'future-journeys': bookingsData.filter(b => {
        try {
          const date = b.journeyDate ? new Date(b.journeyDate) : null;
          return date && !isNaN(date.getTime()) && date > today;
        } catch {
          return false;
        }
      }).length
    };
    
    setCounts(newCounts);
  }, []);

  useEffect(() => {
    fetchBookings();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchBookings, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Update counts whenever bookings or filter changes
  useEffect(() => {
    if (bookings.length > 0) {
      updateAllCounts(bookings);
    }
  }, [bookings, updateAllCounts]);

  const fetchBookings = useCallback(async () => {
    try {
      console.log('=== FETCHING BOOKINGS ===');
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/bookings');
      
      // Log the raw response
      console.log('Raw API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      
      // Log the first booking's structure if available
      if (response.data && response.data.length > 0) {
        console.log('First booking in response:', {
          ...response.data[0],
          // Include all top-level properties
          keys: Object.keys(response.data[0])
        });
      }
      
      console.log('Bookings API Response:', response.data);
      
      // Log all unique statuses for debugging
      const statuses = [...new Set(response.data?.map(b => b.status))];
      console.log('Unique statuses in response:', statuses);
      
      const bookingsData = response.data || [];
      setBookings(bookingsData);
      
    } catch (err) {
      setError('Failed to fetch bookings: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  });

  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings.filter((booking) => {
      try {
        // Handle potential missing or invalid dates
        const bookingDate = booking.bookingDate ? new Date(booking.bookingDate) : null;
        const journeyDate = booking.journeyDate ? new Date(booking.journeyDate) : null;
        
        // If either date is invalid, skip this booking for date-based filters
        const hasValidBookingDate = bookingDate && !isNaN(bookingDate.getTime());
        const hasValidJourneyDate = journeyDate && !isNaN(journeyDate.getTime());

        const status = booking.status ? booking.status.toUpperCase() : 'CONFIRMED'; // Default to CONFIRMED if status is missing
        
        switch(filter) {
          case 'confirmed':
            return status === 'CONFIRMED' || status === 'CONFIRMED_BOOKING';
          case 'cancelled':
            return status === 'CANCELLED' || 
                   status === 'CANCELLED_BOOKING';
          case 'today':
            return hasValidBookingDate && 
                   bookingDate.toDateString() === today.toDateString();
          case 'past':
            return hasValidBookingDate && 
                   bookingDate < today && 
                   bookingDate.toDateString() !== today.toDateString();
          case 'journey-today':
            return hasValidJourneyDate && 
                   journeyDate.toDateString() === today.toDateString();
          case 'past-journeys':
            return hasValidJourneyDate && 
                   journeyDate < today && 
                   journeyDate.toDateString() !== today.toDateString();
          case 'future-journeys':
            return hasValidJourneyDate && journeyDate > today;
          case 'all':
          default:
            return true;
        }
      } catch (error) {
        console.error('Error filtering booking:', booking.id, error);
        return false; // Skip this booking if there's an error processing it
      }
    });
  };

  const getStatusBadge = (status) => {
    if (!status) {
      console.warn('No status provided to getStatusBadge');
      status = 'CONFIRMED'; // Default to CONFIRMED instead of PENDING
    }
    
    const statusMap = {
      'CONFIRMED': { class: 'status-confirmed', text: 'Confirmed' },
      'CANCELLED': { class: 'status-cancelled', text: 'Cancelled' },
      'CANCELLED_BY_ADMIN': { class: 'status-cancelled', text: 'Cancelled' }
    };
    
    const normalizedStatus = status.toUpperCase();
    const statusInfo = statusMap[normalizedStatus] || { class: 'status-unknown', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const updateBookingStatus = async (bookingId, status) => {
    // Ensure we only use CONFIRMED or CANCELLED status
    const normalizedStatus = status.toUpperCase() === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED';
    
    if (window.confirm(`Are you sure you want to mark this booking as ${normalizedStatus}?`)) {
      try {
        await api.put(`/admin/bookings/${bookingId}/status?status=${normalizedStatus}`);
        
        // Update the local state immediately for better UX
        setBookings(prevBookings => {
          const updatedBookings = prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: normalizedStatus } 
              : booking
          );
          // Update counts after state update
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const newCounts = {
            all: updatedBookings.length,
            confirmed: updatedBookings.filter(b => b.status === 'CONFIRMED').length,
            cancelled: updatedBookings.filter(b => b.status === 'CANCELLED').length,
            today: updatedBookings.filter(b => new Date(b.bookingDate).toDateString() === today.toDateString()).length,
            past: updatedBookings.filter(b => {
              const date = new Date(b.bookingDate);
              return date < today && date.toDateString() !== today.toDateString();
            }).length,
            'journey-today': updatedBookings.filter(b => new Date(b.journeyDate).toDateString() === today.toDateString()).length,
            'past-journeys': updatedBookings.filter(b => {
              const date = new Date(b.journeyDate);
              return date < today && date.toDateString() !== today.toDateString();
            }).length,
            'future-journeys': updatedBookings.filter(b => new Date(b.journeyDate) > today).length
          };
          setCounts(newCounts);
          return updatedBookings;
        });
      } catch (err) {
        setError(`Failed to update booking status: ${err.response?.data?.message || err.message}`);
        console.error('Error updating booking status:', err);
        // Refresh the list to ensure consistency with the server
        fetchBookings();
      }
    }
  };

  const handleStatusChange = async (bookingId, e) => {
    const newStatus = e.target.value === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED';
    await updateBookingStatus(bookingId, newStatus);
  };

  const filteredBookings = getFilteredBookings();
  console.log('Filtered bookings count:', filteredBookings.length);

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>Booking Management</h1>
        <div className="header-actions">
          <button 
            onClick={fetchBookings} 
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchBookings} className="btn btn-outline">
            Try Again
          </button>
        </div>
      )}

      <div className="bookings-subnav">
        <div className="filters">
          <div className="filters-container">
            <div className="filter-group">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({counts.all})
              </button>
              <button 
                className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilter('confirmed')}
              >
                Confirmed ({counts.confirmed})
              </button>
              <button 
                className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled ({counts.cancelled})
              </button>
            </div>
            <div className="filter-group">
              <button 
                className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
                onClick={() => setFilter('today')}
              >
                Today's Bookings ({counts.today})
              </button>
              <button 
                className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
                onClick={() => setFilter('past')}
              >
                Past Bookings ({counts.past})
              </button>
            </div>
            <div className="filter-group">
              <button 
                className={`filter-btn ${filter === 'journey-today' ? 'active' : ''}`}
                onClick={() => setFilter('journey-today')}
              >
                Journey Today ({counts['journey-today']})
              </button>
              <button 
                className={`filter-btn ${filter === 'past-journeys' ? 'active' : ''}`}
                onClick={() => setFilter('past-journeys')}
              >
                Past Journeys ({counts['past-journeys']})
              </button>
              <button 
                className={`filter-btn ${filter === 'future-journeys' ? 'active' : ''}`}
                onClick={() => setFilter('future-journeys')}
              >
                Future Journeys ({counts['future-journeys']})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found for the selected filter.</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-id">
                  <strong>Booking #{booking.id}</strong>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="booking-date">
                  {formatDate(booking.bookingDate)}
                </div>
              </div>

              <div className="booking-details">
                <div className="customer-info">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {booking.user?.firstName || 'N/A'}</p>
                  <p><strong>Email:</strong> {booking.user?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {booking.user?.phoneNumber || 'N/A'}</p>
                </div>

                <div className="trip-info">
                  <h4>Trip Information</h4>
                  <p><strong>Bus:</strong> {booking.tripDate?.bus?.name || 'N/A'} {booking.tripDate?.bus?.type ? `(${booking.tripDate.bus.type})` : ''}</p>
                  <p><strong>Operator:</strong> {booking.tripDate?.bus?.operatorName || 'N/A'}</p>
                  <p><strong>Travel Date:</strong> {formatDate(booking.journeyDate)}</p>
                  <p><strong>From:</strong> {booking.fromStop?.name || 'N/A'}</p>
                  <p><strong>To:</strong> {booking.toStop?.name || 'N/A'}</p>
                  <p><strong>Departure:</strong> {formatTime(booking.fromStop?.arrivalTime)}</p>
                  <p><strong>Arrival:</strong> {formatTime(booking.toStop?.arrivalTime)}</p>
                </div>

                <div className="seat-info">
                  <h4>Seat & Payment</h4>
                  <p><strong>Seats:</strong> {Array.isArray(booking.seats) && booking.seats.length > 0 
                    ? booking.seats.map(seat => seat.seatNumber).join(', ')
                    : 'N/A'}</p>
                  <p><strong>Total Amount:</strong> ₹{booking.totalAmount || '0.00'}</p>
                  <p><strong>Payment Status:</strong> {booking.status === 'CANCELLED' ? 'Refunded' : 'Paid'}</p>
                </div>
              </div>

              <div className="booking-actions">
                <div className="status-display">
                  <strong>Status: </strong>
                  <span className={`status-badge ${booking.status === 'CANCELLED' ? 'status-cancelled' : 'status-confirmed'}`}>
                    {booking.status === 'CANCELLED' ? 'Cancelled' : 'Confirmed'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bookings;
