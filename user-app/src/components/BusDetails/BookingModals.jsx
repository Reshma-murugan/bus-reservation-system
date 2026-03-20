import React from 'react';

export const BookingConfirmationModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  loading, 
  bus, 
  date, 
  selectedSeats, 
  totalPrice 
}) => {
  if (!show) return null;

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="modal-header">
          <h3>Confirm Your Booking</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="trip-details">
            <h4>Trip Details</h4>
            <div className="detail-row"><span>Bus:</span><span>{bus?.busName || 'N/A'}</span></div>
            <div className="detail-row"><span>Route:</span><span>{bus?.fromStop} → {bus?.toStop}</span></div>
            <div className="detail-row"><span>Date:</span><span>{date}</span></div>
            <div className="detail-row"><span>Selected Seats:</span><span>{selectedSeats.map(seat => seat.seatNumber).join(', ')}</span></div>
          </div>

          <div className="fare-breakdown">
            <h4>Fare Details</h4>
            <div className="detail-row"><span>Fare per seat:</span><span>₹{bus?.totalPrice || 0}</span></div>
            <div className="detail-row"><span>Number of seats:</span><span>{selectedSeats.length}</span></div>
            <div className="detail-row total-row"><span><strong>Total Amount:</strong></span><span><strong>₹{totalPrice}</strong></span></div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-booking-btn" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : 'Pay & Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SuccessModal = ({ show, bookingId, onViewBookings, onBookAnother }) => {
  if (!show) return null;

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal success-modal">
        <div className="modal-content">
          <div className="success-icon">✓</div>
          <h3>Booking Confirmed!</h3>
          <p>Your seats have been successfully booked.</p>
          <p>Booking ID: #BK{bookingId}</p>
          <div className="success-actions">
            <button className="view-bookings-btn" onClick={onViewBookings}>View My Bookings</button>
            <button className="book-another-btn" onClick={onBookAnother}>Book Another Trip</button>
          </div>
        </div>
      </div>
    </div>
  );
};
