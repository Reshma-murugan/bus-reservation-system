import React from 'react';
import { formatTimeTo12h } from '../../utils/dateUtils';

const RouteVisualizer = ({ booking }) => {
  // If we have bus stops data, show the full route
  if (booking.bus?.stops?.length > 0) {
    const stops = [...booking.bus.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const fromSeq = booking.fromSeq;
    const toSeq = booking.toSeq;
    
    return (
      <div className="route-container">
        {stops.map((stop, index) => {
          const isActive = stop.sequenceOrder >= fromSeq && stop.sequenceOrder <= toSeq;
          const isFirst = index === 0;
          const isLast = index === stops.length - 1;
          const isStart = stop.sequenceOrder === fromSeq;
          const isEnd = stop.sequenceOrder === toSeq;
          const stopName = stop.stop?.name || stop.name || `Stop ${stop.sequenceOrder}`;
          
          return (
            <React.Fragment key={stop.id || index}>
              {!isFirst && (
                <div className={`route-connector ${isActive ? 'active' : ''}`}>
                  <span className="route-arrow">→</span>
                </div>
              )}
              <div 
                className={`route-stop ${isActive ? 'active' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
                title={`${stopName}${stop.arrivalTime ? ` (${formatTimeTo12h(stop.arrivalTime)})` : ''}`}
              >
                {isFirst || isLast || isStart || isEnd ? (
                  <span className="stop-name">{stopName}</span>
                ) : (
                  <span className="stop-dot">•</span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Fallback to simple view if we don't have full route data
  const fromName = booking.fromStopName || `Stop ${booking.fromSeq}`;
  const toName = booking.toStopName || `Stop ${booking.toSeq}`;
  
  return (
    <div className="route-simple">
      {fromName} → {toName}
    </div>
  );
};

export default RouteVisualizer;
