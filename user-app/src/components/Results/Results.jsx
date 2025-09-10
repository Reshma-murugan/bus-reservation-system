import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results = [], searchParams } = location.state || {};

  // Debug logging for Results component
  console.log('Results component - received data:', {
    results,
    searchParams,
    resultsLength: results.length,
    firstBus: results[0]
  });

  // Log each bus's totalPrice specifically
  results.forEach((bus, index) => {
    console.log(`Bus ${index}:`, {
      busId: bus.busId,
      busName: bus.busName,
      totalPrice: bus.totalPrice,
      totalPriceType: typeof bus.totalPrice,
      fullBusObject: bus
    });
  });

  const handleBackToSearch = () => {
    navigate('/');
  };

  const formatDuration = (departureTime, arrivalTime) => {
    try {
      const [depHours, depMinutes] = departureTime.split(':').map(Number);
      const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
      
      let depTotalMinutes = depHours * 60 + depMinutes;
      let arrTotalMinutes = arrHours * 60 + arrMinutes;
      
      // Handle next day arrival
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

  return (
    <div className="results">
      <div className="results-header">
        <h2>Available Buses</h2>
        {searchParams && (
          <div className="search-info">
            <strong>{searchParams.from} → {searchParams.to}</strong>
            <span>{new Date(searchParams.date).toLocaleDateString()}</span>
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
          <Link to="/" className="search-again-btn">
            ← Search Again
          </Link>
        </div>
      ) : (
        <div className="bus-list">
          {results.map(bus => (
            <div key={bus.busId} className="bus-card">
              <div className="bus-card-header">
                <h3>{bus.busName}</h3>
                <div className="fare-badge">₹{bus.totalPrice}</div>
              </div>
              
              <div className="bus-info">
                <p>
                  <span className="bus-type-badge">{bus.busType}</span>
                </p>
                <p>Operator: {bus.operatorName}</p>
                <p>Available Seats: {bus.availableSeats}</p>
              </div>
              
              <div className="journey-time">
                <div className="time-point">
                  <span className="time">{bus.departureTime}</span>
                  <span className="location">{searchParams?.from}</span>
                </div>
                <div className="journey-duration">
                  {formatDuration(bus.departureTime, bus.arrivalTime)}
                </div>
                <div className="time-point">
                  <span className="time">{bus.arrivalTime}</span>
                  <span className="location">{searchParams?.to}</span>
                </div>
              </div>
              
              <Link 
                to={`/bus/${bus.busId}`} 
                className="view-details"
                state={{ 
                  bus, 
                  searchParams,
                  date: searchParams?.date 
                }}
              >
                Select Seats
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
