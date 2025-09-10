import React from 'react';

const BookingFilters = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Bookings' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'today', label: "Today's Bookings" },
    { id: 'past', label: 'Past Bookings' },
    { id: 'journey-today', label: 'Journey Today' },
    { id: 'past-journeys', label: 'Past Journeys' },
    { id: 'future-journeys', label: 'Future Journeys' },
  ];

  return (
    <div className="booking-filters">
      <div className="filters-container">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BookingFilters;
