import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './BusDetails.css';

const BusDetails = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const { bus: busFromState, searchParams, date } = location.state || {};
  
  const [seatAvailability, setSeatAvailability] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('BusDetails Debug:', {
      busId,
      busFromState,
      date,
      searchParams
    });
    
    console.log('Bus totalPrice:', busFromState?.totalPrice);
    console.log('Bus totalPrice type:', typeof busFromState?.totalPrice);
    console.log('Full bus object:', busFromState);
    
    if (busFromState?.totalPrice === undefined || busFromState?.totalPrice === null) {
      console.error('WARNING: Bus totalPrice is missing or null!');
    }
    if (busFromState?.totalPrice === 0) {
      console.error('WARNING: Bus totalPrice is 0 - this indicates database issue or missing fare data!');
    }
    
    // Additional debugging for props passed from Results
    console.log('Location state passed to BusDetails:', location.state);
  }, [busId, busFromState, date, searchParams, location.state]);

  useEffect(() => {
    console.log('BusDetails - busId:', busId);
    console.log('BusDetails - date:', date);
    console.log('BusDetails - busFromState:', busFromState);
    
    if (busId && date && busFromState) {
      fetchSeatAvailability();
    }
  }, [busId, date, busFromState]);

  const fetchSeatAvailability = async () => {
    const finalBusId = busId || busFromState?.busId;
    
    if (!finalBusId) {
      setError('Bus ID not available');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const fromSeq = busFromState?.fromSeq || 1;
      const toSeq = busFromState?.toSeq || 3;
      
      console.log('Fetching seats for:', {
        finalBusId,
        date,
        fromSeq,
        toSeq,
        busFromState
      });
      
      const response = await api.get(`/user/buses/${finalBusId}/seats`, {
        params: { 
          date,
          fromSeq,
          toSeq
        }
      });
      
      console.log('Seat availability response:', response.data);
      setSeatAvailability(response.data || []);
    } catch (err) {
      setError('Failed to load seat information');
      console.error('Seat availability error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelection = (seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.seatId === seat.seatId);
      if (isSelected) {
        return prev.filter(s => s.seatId !== seat.seatId);
      } else {
        return [...prev, seat];
      }
    });
  };

  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) return;
    
    const finalBusId = busId || busFromState?.busId;
    
    if (!finalBusId) {
      setError('Bus ID not available for booking');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await api.post('/user/book', {
        busId: finalBusId,
        date,
        fromStopSeq: busFromState?.fromSeq,
        toStopSeq: busFromState?.toSeq,
        seats: selectedSeats
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Booking successful!');
      setSelectedSeats([]);
      fetchSeatAvailability();
    } catch (err) {
      setError('Booking failed');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    
    const finalBusId = busId || busFromState?.busId;
    
    if (!finalBusId) {
      setError('Bus ID not available for booking');
      return;
    }

    setBookingLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await api.post('/user/book', {
        busId: finalBusId,
        journeyDate: date,
        fromSeq: busFromState?.fromSeq,
        toSeq: busFromState?.toSeq,
        seatIds: selectedSeats.map(seat => seat.seatId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Close booking modal and show success
      setShowBookingModal(false);
      setBookingSuccess(true);
      
      // Reset selected seats and refresh availability
      setSelectedSeats([]);
      fetchSeatAvailability();
      
    } catch (err) {
      setError('Booking failed: ' + (err.response?.data?.message || err.message));
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const totalPrice = selectedSeats.length * (busFromState?.totalPrice || 250); // Default ₹250 if no price

  if (!busFromState) {
    return (
      <div className="bus-details">
        <p>Bus information not available. Please go back and search again.</p>
        <button onClick={() => navigate('/')}>Back to Search</button>
      </div>
    );
  }

  return (
    <div className="bus-details">
      <div className="bus-details-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Results
        </button>
        <h2>Bus Details & Seat Selection</h2>
      </div>

      <div className="bus-info-card">
        <h3>{busFromState.busName}</h3>
        <div className="bus-meta">
          <span className="bus-type">{busFromState.busType}</span>
          <span className="operator">{busFromState.operatorName}</span>
        </div>
        <div className="journey-details">
          <div className="time-detail">
            <span>Departure: {busFromState.departureTime}</span>
            <span>Arrival: {busFromState.arrivalTime}</span>
          </div>
          <div className="price-detail">
            <span>Fare per seat: ₹{busFromState?.totalPrice || 250}</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="seat-selection">
        <h3>Select Seats</h3>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading seat information...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchSeatAvailability} className="retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <div className="seat-map">
            {seatAvailability.length > 0 ? (
              <>
                <div className="seats-grid">
                  {seatAvailability.map(seat => (
                    <button
                      key={seat.seatId}
                      className={`seat ${seat.available ? 'available' : 'booked'} ${
                        selectedSeats.some(s => s.seatId === seat.seatId) ? 'selected' : ''
                      }`}
                      onClick={() => seat.available && handleSeatSelection(seat)}
                      disabled={!seat.available}
                    >
                      {seat.seatNumber}
                    </button>
                  ))}
                </div>
                
                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="seat available"></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat selected"></div>
                    <span>Selected</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat booked"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-seats">
                <p>No seat information available for this route</p>
                <button onClick={fetchSeatAvailability} className="retry-btn">
                  Refresh
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedSeats.length > 0 && (
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <p>Selected Seats: {selectedSeats.map(seat => seat.seatNumber).join(', ')}</p>
            <p>Number of Seats: {selectedSeats.length}</p>
            <p className="total-price">Total Amount: ₹{totalPrice}</p>
          </div>
          <button 
            onClick={() => {
              if (!isAuthenticated()) {
                navigate('/login');
                return;
              }
              navigate('/payment', {
                state: {
                  selectedSeats,
                  busDetails: busFromState,
                  journeyDate: date,
                  totalPrice,
                  fromSeq: busFromState?.fromSeq,
                  toSeq: busFromState?.toSeq
                }
              });
            }} 
            className="book-button"
            disabled={bookingLoading}
          >
            Proceed to Payment
          </button>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h3>Confirm Your Booking</h3>
              <button 
                className="close-modal" 
                onClick={() => setShowBookingModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="trip-details">
                <h4>Trip Details</h4>
                <div className="detail-row">
                  <span>Bus:</span>
                  <span>{busFromState?.busName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span>Route:</span>
                  <span>{busFromState?.fromStop} → {busFromState?.toStop}</span>
                </div>
                <div className="detail-row">
                  <span>Date:</span>
                  <span>{date}</span>
                </div>
                <div className="detail-row">
                  <span>Selected Seats:</span>
                  <span>{selectedSeats.map(seat => seat.seatNumber).join(', ')}</span>
                </div>
              </div>

              <div className="fare-breakdown">
                <h4>Fare Details</h4>
                <div className="detail-row">
                  <span>Fare per seat:</span>
                  <span>₹{busFromState?.totalPrice || 0}</span>
                </div>
                <div className="detail-row">
                  <span>Number of seats:</span>
                  <span>{selectedSeats.length}</span>
                </div>
                <div className="detail-row total-row">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>₹{totalPrice}</strong></span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-booking-btn" 
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processing...' : 'Pay & Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="booking-modal-overlay">
          <div className="booking-modal success-modal">
            <div className="modal-content">
              <div className="success-icon">✓</div>
              <h3>Booking Confirmed!</h3>
              <p>Your seats have been successfully booked.</p>
              <p>Booking ID: #BK{Date.now()}</p>
              <div className="success-actions">
                <button 
                  className="view-bookings-btn"
                  onClick={() => navigate('/bookings')}
                >
                  View My Bookings
                </button>
                <button 
                  className="book-another-btn"
                  onClick={() => {
                    setBookingSuccess(false);
                    navigate('/search');
                  }}
                >
                  Book Another Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusDetails;
