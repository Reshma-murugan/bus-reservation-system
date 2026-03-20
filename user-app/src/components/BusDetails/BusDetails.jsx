import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './BusDetails.css';

// Sub-components
import BusInfoCard from './BusInfoCard';
import SeatMap from './SeatMap';
import BookingSummary from './BookingSummary';
import { BookingConfirmationModal, SuccessModal } from './BookingModals';

const BusDetails = ({ isEmbedded, bus: propBus, date: propDate }) => {
  const { busId: pathBusId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Use props if available (embedded mode), otherwise use location state (page mode)
  const { bus: stateBus, date: stateDate } = location.state || {};
  const busFromState = propBus || stateBus;
  const date = propDate || stateDate;
  const busId = pathBusId || busFromState?.busId;

  const [seatAvailability, setSeatAvailability] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (busId && date) {
      fetchSeatAvailability();
    }
  }, [busId, date]);

  const fetchSeatAvailability = async () => {
    setLoading(true);
    setError('');
    
    try {
      const fromSeq = busFromState?.fromSeq || 1;
      const toSeq = busFromState?.toSeq || 3;
      
      const response = await api.get(`/user/buses/${busId}/seats`, {
        params: { date, fromSeq, toSeq }
      });
      setSeatAvailability(response.data || []);
    } catch (err) {
      setError('Failed to load seat information');
      console.error('Seat availability error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelection = (seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.seatId === seat.seatId);
      if (isSelected) {
        return prev.filter(s => s.seatId !== seat.seatId);
      } else {
        return [...prev, seat];
      }
    });
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    if (!busId) {
      setError('Bus ID not available for booking');
      return;
    }

    setBookingLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('userToken');
      await api.post('/user/book', {
        busId: busId,
        journeyDate: date,
        fromSeq: busFromState?.fromSeq,
        toSeq: busFromState?.toSeq,
        seatIds: selectedSeats.map(seat => seat.seatId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowBookingModal(false);
      setBookingSuccess(true);
      setSelectedSeats([]);
      fetchSeatAvailability();
    } catch (err) {
      setError('Booking failed: ' + (err.response?.data?.message || err.message));
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const totalPrice = selectedSeats.length * (busFromState?.totalPrice || 250);

  if (!busFromState && !isEmbedded) {
    return (
      <div className="bus-details">
        <p>Bus information not available. Please go back and search again.</p>
        <button onClick={() => navigate('/')}>Back to Search</button>
      </div>
    );
  }

  return (
    <div className={`bus-details ${isEmbedded ? 'embedded' : ''}`}>
      {!isEmbedded && (
        <div className="bus-details-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back to Results
          </button>
          <h2>Bus Details & Seat Selection</h2>
        </div>
      )}

      {!isEmbedded && <BusInfoCard bus={busFromState} />}

      {error && <div className="error-message">{error}</div>}

      <div className="bus-details-split">
        <div className="seat-selection-col">
          <div className="seat-selection">
            {isEmbedded ? (
              <div className="embedded-selection-header">
                <h3>Select Your Seats</h3>
                <span className="price-info">₹{busFromState?.totalPrice || 250} / seat</span>
              </div>
            ) : (
              <h3>Select Seats</h3>
            )}
            <SeatMap 
              loading={loading}
              error={error}
              seatAvailability={seatAvailability}
              selectedSeats={selectedSeats}
              onSeatSelection={handleSeatSelection}
              onRetry={fetchSeatAvailability}
            />
          </div>
        </div>

        <div className="booking-summary-col">
          <BookingSummary 
            selectedSeats={selectedSeats}
            totalPrice={totalPrice}
            loading={bookingLoading}
            onProceed={() => {
              if (!isAuthenticated()) {
                navigate('/login');
                return;
              }
              navigate('/payment', {
                state: {
                  selectedSeats,
                  busDetails: busFromState,
                  journeyDate: date,
                  totalPrice,
                  fromSeq: busFromState?.fromSeq,
                  toSeq: busFromState?.toSeq
                }
              });
            }}
          />
        </div>
      </div>

      <BookingConfirmationModal 
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleConfirmBooking}
        loading={bookingLoading}
        bus={busFromState}
        date={date}
        selectedSeats={selectedSeats}
        totalPrice={totalPrice}
      />

      <SuccessModal 
        show={bookingSuccess}
        bookingId={Date.now()}
        onViewBookings={() => navigate('/bookings')}
        onBookAnother={() => {
          setBookingSuccess(false);
          // In embedded mode, maybe just collapse? 
          // For now navigate to search is fine as per original logic.
          navigate('/search');
        }}
      />
    </div>
  );
};

export default BusDetails;
