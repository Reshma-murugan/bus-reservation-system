import React, { useState, useEffect } from 'react';
import './FareCalculator.css';

const FareCalculator = () => {
  const stops = ['Chennai', 'Trichy', 'Madurai', 'Tirunelveli'];
  const incrementalPrices = [500, 200, 300]; // Chennai→Trichy: 500, Trichy→Madurai: 200, Madurai→Tirunelveli: 300
  
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState(0);
  const [error, setError] = useState('');

  const calculateFare = () => {
    setError('');
    
    if (!source || !destination) {
      setError('Please select both source and destination');
      setFare(0);
      return;
    }

    const sourceIndex = stops.indexOf(source);
    const destIndex = stops.indexOf(destination);

    if (sourceIndex === destIndex) {
      setError('Source and destination cannot be the same');
      setFare(0);
      return;
    }

    if (sourceIndex > destIndex) {
      setError('Source must come before destination in route order');
      setFare(0);
      return;
    }

    // Calculate cumulative fare between source and destination
    let totalFare = 0;
    for (let i = sourceIndex; i < destIndex; i++) {
      totalFare += incrementalPrices[i];
    }

    setFare(totalFare);
  };

  // Auto-calculate when source or destination changes
  useEffect(() => {
    calculateFare();
  }, [source, destination]);

  const getAvailableDestinations = () => {
    if (!source) return stops;
    const sourceIndex = stops.indexOf(source);
    return stops.slice(sourceIndex + 1); // Only allow stops after source
  };

  const getAvailableSources = () => {
    if (!destination) return stops;
    const destIndex = stops.indexOf(destination);
    return stops.slice(0, destIndex); // Only allow stops before destination
  };

  return (
    <div className="fare-calculator">
      <h2>Bus Fare Calculator</h2>
      
      <div className="route-info">
        <h3>Route: {stops.join(' → ')}</h3>
        <div className="price-breakdown">
          <span>Chennai → Trichy: ₹500</span>
          <span>Trichy → Madurai: ₹200</span>
          <span>Madurai → Tirunelveli: ₹300</span>
        </div>
      </div>

      <div className="selection-container">
        <div className="dropdown-group">
          <label htmlFor="source">Source:</label>
          <select 
            id="source"
            value={source} 
            onChange={(e) => setSource(e.target.value)}
            className="dropdown"
          >
            <option value="">Select Source</option>
            {getAvailableSources().map((stop) => (
              <option key={stop} value={stop}>{stop}</option>
            ))}
          </select>
        </div>

        <div className="dropdown-group">
          <label htmlFor="destination">Destination:</label>
          <select 
            id="destination"
            value={destination} 
            onChange={(e) => setDestination(e.target.value)}
            className="dropdown"
          >
            <option value="">Select Destination</option>
            {getAvailableDestinations().map((stop) => (
              <option key={stop} value={stop}>{stop}</option>
            ))}
          </select>
        </div>
      </div>

      <button 
        onClick={calculateFare} 
        className="calculate-btn"
        disabled={!source || !destination}
      >
        Calculate Fare
      </button>

      <div className="result-container">
        {error && <div className="error">{error}</div>}
        {fare > 0 && !error && (
          <div className="fare-result">
            <h3>Fare: ₹{fare}</h3>
            <div className="calculation-details">
              {source} → {destination}
              {fare > 0 && (
                <div className="breakdown">
                  Journey breakdown: {source} to {destination} costs ₹{fare}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FareCalculator;
