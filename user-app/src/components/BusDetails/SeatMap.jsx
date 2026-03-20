import React from 'react';
import { MdEventSeat } from 'react-icons/md';
import { GiSteeringWheel } from 'react-icons/gi';

const SeatMap = ({ loading, error, seatAvailability, selectedSeats, onSeatSelection, onRetry }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading seat information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={onRetry} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (seatAvailability.length === 0) {
    return (
      <div className="no-seats">
        <p>No seat information available for this route</p>
        <button onClick={onRetry} className="retry-btn">Refresh</button>
      </div>
    );
  }

  return (
    <div className="seat-map-container">
      {/* 1. Selection indicators at the top */}
      <div className="status-indicators">
        <div className="status-item">
          <div className="status-icon available">
            <MdEventSeat />
          </div>
          <span className="status-label">Available</span>
        </div>
        <div className="status-item">
          <div className="status-icon selected">
            <MdEventSeat />
          </div>
          <span className="status-label">Selected</span>
        </div>
        <div className="status-item">
          <div className="status-icon booked">
            <MdEventSeat />
          </div>
          <span className="status-label">Booked</span>
        </div>
      </div>

      {/* 2. Main bus container */}
      <div className="bus-container">
        <div className="bus-body">
          {/* 5. Bus cabin / driver section at the top */}
          <div className="driver-cabin-top">
            <div className="cabin-controls">
              <div className="steering-unit">
                <GiSteeringWheel className="steering-icon" />
              </div>
              <div className="entry-area">
                <div className="step-bar"></div>
                <div className="step-bar"></div>
              </div>
            </div>
            <div className="divider-line"></div>
          </div>

          {/* 3. Seat arrangement */}
          <div className="seat-grid-spec">
            {seatAvailability.map((seat, index) => (
              <React.Fragment key={seat.seatId}>
                {/* 2 + aisle + 2 layout */}
                {index % 4 === 2 && <div className="aisle-gap"></div>}
                <button
                  className={`seat-unit ${seat.available ? 'available' : 'booked'} ${
                    selectedSeats.some(s => s.seatId === seat.seatId) ? 'selected' : ''
                  }`}
                  onClick={() => seat.available && onSeatSelection(seat)}
                  disabled={!seat.available}
                >
                  <MdEventSeat className="inner-seat-icon" />
                  <span className="seat-number-tag">{seat.seatNumber}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
