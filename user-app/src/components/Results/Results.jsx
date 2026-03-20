import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdEventSeat, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import './Results.css';
import BusDetails from '../BusDetails/BusDetails';
import { formatTimeTo12h } from '../../utils/dateUtils';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results = [], searchParams } = location.state || {};
  const [expandedBusId, setExpandedBusId] = useState(null);

  const getSeatAvailabilityStyle = (count) => {
    if (count <= 5) return { text: `Only ${count} seats left!`, className: 'seats-critical' };
    if (count <= 10) return { text: `${count} seats remaining`, className: 'seats-low' };
    return { text: 'Available', className: 'seats-available' };
  };

  const formatDuration = (departureTime, arrivalTime) => {
    try {
      const [depHours, depMinutes] = departureTime.split(':').map(Number);
      const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
      
      let depTotalMinutes = depHours * 60 + depMinutes;
      let arrTotalMinutes = arrHours * 60 + arrMinutes;
      
      if (arrTotalMinutes < depTotalMinutes) {
        arrTotalMinutes += 24 * 60;
      }
      
      const durationMinutes = arrTotalMinutes - depTotalMinutes;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    } catch {
      return 'N/A';
    }
  };

  const toggleSeats = (busId) => {
    setExpandedBusId(expandedBusId === busId ? null : busId);
  };

  return (
    <div className="results">
      <div className="results-header">
        <button onClick={() => navigate('/')} className="back-btn-results">← Back to Search</button>
        <h2>Available Buses</h2>
        {searchParams && (
          <div className="search-info">
            <span className="info-route">{searchParams.from} → {searchParams.to}</span>
            <span className="info-separator">•</span>
            <span className="info-date">{new Date(searchParams.date).toLocaleDateString('en-GB')}</span>
          </div>
        )}
        <div className="results-count">
          <span>{results.length} buses found</span>
        </div>
      </div>
      
      {results.length === 0 ? (
        <div className="no-buses">
          <h3>No buses found</h3>
          <p>Sorry, no buses are available for your selected route and date.</p>
          <button onClick={() => navigate('/')} className="search-again-btn">
            ← Search Again
          </button>
        </div>
      ) : (
        <div className="bus-list">
          {results.map(bus => (
            <div key={bus.busId} className={`bus-card-wrapper ${expandedBusId === bus.busId ? 'is-expanded' : ''}`}>
              <div className="bus-card horizontal-card">
                <div className="bus-details-left">
                  <h3 className="bus-name">{bus.busName}</h3>
                  <span className="bus-type-badge">{bus.busType}</span>
                  <p className="operator-text">Operator: {bus.operatorName}</p>
                  <div className={`seat-badge ${getSeatAvailabilityStyle(bus.availableSeats).className}`}>
                    <MdEventSeat className="seat-icon-md" />
                    <span>{getSeatAvailabilityStyle(bus.availableSeats).text}</span>
                  </div>
                </div>
                
                <div className="journey-timeline">
                  <div className="time-col">
                    <span className="time">{formatTimeTo12h(bus.departureTime)}</span>
                    <span className="location">{searchParams?.from}</span>
                  </div>
                  <div className="duration-col">
                    <span className="duration-text">{formatDuration(bus.departureTime, bus.arrivalTime)}</span>
                    <div className="duration-line"></div>
                  </div>
                  <div className="time-col">
                    <span className="time">{formatTimeTo12h(bus.arrivalTime)}</span>
                    <span className="location">{searchParams?.to}</span>
                  </div>
                </div>
                
                <div className="action-right">
                  <div className="price-display">
                    <span className="currency">₹</span>
                    <span className="amount">{bus.totalPrice}</span>
                  </div>
                  <button 
                    onClick={() => toggleSeats(bus.busId)}
                    className={`view-seats-btn ${expandedBusId === bus.busId ? 'active' : ''}`}
                  >
                    {expandedBusId === bus.busId ? (
                      <>Hide Seats <MdKeyboardArrowUp /></>
                    ) : (
                      <>View Seats <MdKeyboardArrowDown /></>
                    )}
                  </button>
                </div>
              </div>
              
              {expandedBusId === bus.busId && (
                <div className="inline-seat-selection">
                  <BusDetails 
                    isEmbedded={true} 
                    bus={bus} 
                    date={searchParams?.date} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
