import React from 'react';
import { formatTimeTo12h } from '../../utils/dateUtils';

const BusInfoCard = ({ bus }) => {
  if (!bus) return null;

  return (
    <div className="bus-info-card">
      <h3>{bus.busName}</h3>
      <div className="bus-meta">
        <span className="bus-type">{bus.busType}</span>
        <span className="operator">{bus.operatorName}</span>
      </div>
      <div className="journey-details">
        <div className="time-detail">
          <span>Departure: {formatTimeTo12h(bus.departureTime)}</span>
          <span>Arrival: {formatTimeTo12h(bus.arrivalTime)}</span>
        </div>
        <div className="price-detail">
          <span>Fare per seat: ₹{bus.totalPrice || 250}</span>
        </div>
      </div>
    </div>
  );
};

export default BusInfoCard;
