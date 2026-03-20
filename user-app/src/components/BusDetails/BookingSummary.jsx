import React from 'react';

const BookingSummary = ({ selectedSeats, totalPrice, onProceed, loading }) => {
  return (
    <div className="booking-summary sticky-summary">
      <h3>Booking Summary</h3>
      {selectedSeats.length > 0 ? (
        <>
          <div className="summary-details">
            <p>Selected Seats: {selectedSeats.map(seat => seat.seatNumber).join(', ')}</p>
            <p>Number of Seats: {selectedSeats.length}</p>
            <p className="total-price">Total Amount: ₹{totalPrice}</p>
          </div>
          <button onClick={onProceed} className="book-button" disabled={loading}>
            Proceed to Payment
          </button>
        </>
      ) : (
        <div className="empty-summary placeholder">
          <div className="placeholder-icon">💺</div>
          <p>Select seats from the map to see your summary</p>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
