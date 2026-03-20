import React from 'react';
import RouteVisualizer from './RouteVisualizer';
import { formatTimeTo12h } from '../../utils/dateUtils';

const getStatusDisplay = (status) => {
  const statusMap = {
    'CONFIRMED': 'Confirmed',
    'CANCELLED': 'Cancelled',
    'COMPLETED': 'Completed'
  };
  return statusMap[status] || status;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
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

const BookingCard = ({ booking, onCancel, loading }) => {
  // Use seatNumbers array if available, fallback to legacy seat.seatNumber
  const seatDisplay = booking.seatNumbers?.length > 0 
    ? booking.seatNumbers.join(', ') 
    : (booking.seat?.seatNumber || 'N/A');

  return (
    <div className={`booking-card ticket-card ${booking.status === 'CANCELLED' ? 'ticket-cancelled' : ''}`}>
      {/* Front stub with barcode */}
      <div className="ticket-stub">
        <div className="ticket-barcode"></div>
        <div className="ticket-id-vertical">#{booking.id || booking.bookingId}</div>
      </div>

      <div className="ticket-perforation"></div>

      {/* Main ticket body */}
      <div className="ticket-main">
        <div className="ticket-header">
          <div className="ticket-operator">{booking.operatorName || booking.bus?.operatorName || 'Operator'}</div>
          <div className={`ticket-status ${
            booking.status === 'CANCELLED' ? 'status-cancelled' : 'status-confirmed'
          }`}>
            {getStatusDisplay(booking.status)}
          </div>
        </div>

        <div className="ticket-route">
          <RouteVisualizer booking={booking} />
        </div>

        <div className="ticket-details-grid">
          <div className="t-detail">
            <span className="t-label">Travel Date</span>
            <span className="t-value">{formatDate(booking.journeyDate || booking.travelDate)}</span>
          </div>
          <div className="t-detail">
            <span className="t-label">Boarding Time</span>
            <span className="t-value">{formatTimeTo12h(booking.boardingTime)}</span>
          </div>
          <div className="t-detail">
            <span className="t-label">Bus Type</span>
            <span className="t-value">{booking.busType || booking.bus?.type || 'Standard'}</span>
          </div>
          <div className="t-detail">
            <span className="t-label">Seat No</span>
            <span className="t-value">{seatDisplay}</span>
          </div>
          <div className="t-detail price-box">
            <span className="t-label">Fare</span>
            <span className="t-value total-fare">₹{booking.amount || booking.totalPrice || 0}</span>
          </div>
        </div>

        <div className="ticket-footer">
          <div className="footer-info">Booked: {formatDate(booking.createdAt)}</div>
          {!['CANCELLED', 'CANCELLED_REFUNDED', 'CANCELLED_REFUND_REQUESTED', 'REFUNDED'].includes(booking.status) && (
            <button 
              onClick={() => onCancel(booking.id || booking.bookingId)}
              className="ticket-cancel-btn"
              disabled={loading}
            >
              {loading ? '...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
