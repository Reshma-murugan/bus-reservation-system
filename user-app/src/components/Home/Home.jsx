import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import logoImage from '../../logo/BusLogo.png';
import { MdLocationOn, MdSwapHoriz, MdCalendarToday } from 'react-icons/md';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const fromInputRef = useRef(null);
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHighlighting, setIsHighlighting] = useState(false);

  const handleSearchChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const swapLocations = () => {
    setSearchData({
      ...searchData,
      from: searchData.to,
      to: searchData.from
    });
  };

  const handleBookNow = () => {
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
      searchBox.scrollIntoView({ behavior: 'smooth' });
      
      // Trigger highlight animation
      setIsHighlighting(true);
      setTimeout(() => setIsHighlighting(false), 2000);
      
      // Focus the first input after a short delay for smooth transition
      setTimeout(() => {
        if (fromInputRef.current) {
          fromInputRef.current.focus();
        }
      }, 800);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!searchData.from || !searchData.to || !searchData.date) {
      setError('Please fill in all search fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/user/search', {
        params: {
          from: searchData.from,
          to: searchData.to,
          date: searchData.date
        }
      });
      
      navigate('/results', { 
        state: { 
          results: response.data, 
          searchParams: searchData 
        } 
      });
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Brand Logo Fixed in Corner */}
      <img src={logoImage} alt="BusBook Logo" className="fixed-logo" />

      {/* Main Content */}
      <div className="home-container">
        
        {/* Left Column: Text & Search stays on left, image moves to background */}
        <div className="home-content-left">
          <section className="hero-section">
            <h1 className="hero-title">
              Find Your Perfect 
              <span className="gradient-text"> Bus Journey</span>
            </h1>
            <p className="hero-subtitle">
              Book comfortable, affordable bus tickets to destinations across the country. 
              Travel with confidence and convenience.
            </p>
            <button 
              className="book-now-btn" 
              onClick={handleBookNow}
            >
              BOOK NOW
            </button>
          </section>

          <div className={`search-container ${isHighlighting ? 'highlight-pulse' : ''}`} id="search-box">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-inputs-row">
                <div className="search-field">
                  <div className="field-header">
                    <MdLocationOn className="field-icon" />
                    <label className="search-label">From</label>
                  </div>
                  <input
                    type="text"
                    name="from"
                    ref={fromInputRef}
                    value={searchData.from}
                    onChange={handleSearchChange}
                    placeholder="Departure city"
                    className="search-input"
                    required
                  />
                </div>

                <div className="swap-button-container">
                  <button type="button" className="swap-btn" onClick={swapLocations} title="Swap Locations">
                    <MdSwapHoriz />
                  </button>
                </div>
                
                <div className="search-field">
                  <div className="field-header">
                    <MdLocationOn className="field-icon" />
                    <label className="search-label">To</label>
                  </div>
                  <input
                    type="text"
                    name="to"
                    value={searchData.to}
                    onChange={handleSearchChange}
                    placeholder="Destination city"
                    className="search-input"
                    required
                  />
                </div>
                
                <div className="search-field">
                  <div className="field-header">
                    <MdCalendarToday className="field-icon" />
                    <label className="search-label">Date</label>
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={searchData.date}
                    onChange={handleSearchChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="search-input"
                    required
                  />
                </div>
              </div>
              
              <div className="search-button-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="search-btn"
                >
                  {loading ? 'Searching...' : 'Search Buses'}
                </button>
              </div>
            </form>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
