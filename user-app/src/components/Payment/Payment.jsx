import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    selectedSeats, 
    busDetails, 
    journeyDate, 
    totalPrice,
    fromSeq,
    toSeq 
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedSeats || !busDetails || !journeyDate) {
      navigate('/');
    }
  }, [selectedSeats, busDetails, journeyDate, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Make booking API call
      const token = localStorage.getItem('userToken');
      const response = await api.post('/user/book', {
        busId: busDetails.busId,
        journeyDate: journeyDate,
        fromSeq: fromSeq,
        toSeq: toSeq,
        seatIds: selectedSeats.map(seat => seat.seatId),
        paymentMethod: 'dummy_payment',
        paymentAmount: totalPrice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingId(response.data.bookingId || response.data.id);
      setBookingSuccess(true);
      
    } catch (err) {
      console.error('Booking error:', err);
      setError('Payment failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSeats || !busDetails) {
    return (
      <div className="payment">
        <p>Invalid booking details. Please go back and try again.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="payment">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Booking Confirmed!</h2>
          <div className="booking-details">
            <p><strong>Booking ID:</strong> {bookingId}</p>
            <p><strong>Bus:</strong> {busDetails.busName}</p>
            <p><strong>Date:</strong> {journeyDate}</p>
            <p><strong>Seats:</strong> {selectedSeats.map(s => s.seatNumber).join(', ')}</p>
            <p><strong>Total Paid:</strong> ₹{totalPrice}</p>
          </div>
          <div className="success-actions">
            <button 
              onClick={() => navigate('/my-bookings')} 
              className="primary-btn"
            >
              View My Bookings
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="secondary-btn"
            >
              Book Another Trip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment">
      <div className="payment-container">
        <h2>Payment & Confirmation</h2>
        
        {/* Booking Summary */}
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <div className="detail-row">
              <span>Bus:</span>
              <span>{busDetails.busName}</span>
            </div>
            <div className="detail-row">
              <span>Date:</span>
              <span>{journeyDate}</span>
            </div>
            <div className="detail-row">
              <span>Departure:</span>
              <span>{busDetails.departureTime}</span>
            </div>
            <div className="detail-row">
              <span>Arrival:</span>
              <span>{busDetails.arrivalTime}</span>
            </div>
            <div className="detail-row">
              <span>Seats:</span>
              <span>{selectedSeats.map(s => s.seatNumber).join(', ')}</span>
            </div>
            <div className="detail-row">
              <span>Number of Seats:</span>
              <span>{selectedSeats.length}</span>
            </div>
            <div className="detail-row total">
              <span>Total Amount:</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Simple Payment Section */}
        <div className="payment-section">
          <h3>Payment</h3>
          <div className="payment-info">
            <p>This is a demo payment system. Click the button below to confirm your booking.</p>
            <div className="total-display">
              <span className="total-label">Total Amount:</span>
              <span className="total-amount">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Action Buttons */}
        <div className="payment-actions">
          <button 
            onClick={() => navigate(-1)} 
            className="secondary-btn"
            disabled={loading}
          >
            Back
          </button>
          <button 
            onClick={handlePayment} 
            className="primary-btn"
            disabled={loading}
          >
            {loading ? 'Processing Payment...' : `Pay & Confirm ₹${totalPrice}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
