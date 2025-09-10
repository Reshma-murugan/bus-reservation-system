import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Home.css';

const Home = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearchChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
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
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            🚌 BusBook
          </Link>
          <div className="nav-links">
            {isAuthenticated() ? (
              <>
                <span className="nav-link">Welcome, {user?.email}</span>
                <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                <button onClick={logout} className="nav-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn">Login</Link>
                <Link to="/register" className="nav-btn">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-container">
        <div className="hero-section">
          <h1 className="hero-title">Find Your Perfect Journey</h1>
          <p className="hero-subtitle">
            Book comfortable, safe, and affordable bus tickets for your next adventure
          </p>
        </div>

        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-field">
              <label className="search-label">From</label>
              <input
                type="text"
                name="from"
                value={searchData.from}
                onChange={handleSearchChange}
                placeholder="Enter departure city"
                className="search-input"
                required
              />
            </div>
            
            <div className="search-field">
              <label className="search-label">To</label>
              <input
                type="text"
                name="to"
                value={searchData.to}
                onChange={handleSearchChange}
                placeholder="Enter destination city"
                className="search-input"
                required
              />
            </div>
            
            <div className="search-field">
              <label className="search-label">Date</label>
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
            
            <button
              type="submit"
              disabled={loading}
              className="search-btn"
            >
              {loading ? '🔍 Searching...' : '🔍 Search'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

  return (
    <div className="home">
      <div className="home-content">
        {/* Header Navigation */}
        <header className="home-header">
          <Link to="/" className="home-logo">
            🚌 BusBooking
          </Link>
          <nav className="home-nav">
            {isAuthenticated() ? (
              <>
                <Link to="/my-bookings" className="nav-btn">
                  My Bookings
                </Link>
                <button onClick={logout} className="nav-btn logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn">Login</Link>
                <Link to="/register" className="nav-btn">Register</Link>
              </>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            Find Your Perfect 
            <span className="gradient-text"> Bus Journey</span>
          </h1>
          <p className="hero-subtitle">
            Book comfortable, affordable bus tickets to destinations across the country. 
            Travel with confidence and convenience.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="search-form">
            <h2 className="search-form-title">Search Bus Tickets</h2>
            
            {error && <div className="search-error">{error}</div>}
            
            <div className="search-grid">
              <div className="search-field">
                <label htmlFor="origin">From</label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={searchData.origin}
                  onChange={handleSearchChange}
                  placeholder="Enter departure city"
                  required
                />
              </div>
              
              <div className="search-field">
                <label htmlFor="destination">To</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={searchData.destination}
                  onChange={handleSearchChange}
                  placeholder="Enter destination city"
                  required
                />
              </div>
              
              <div className="search-field">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={searchData.date}
                  onChange={handleSearchChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="search-submit"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Buses 🔍'}
            </button>
          </form>

          {/* Features Section */}
          <section className="features-section">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎫</div>
                <h3 className="feature-title">Easy Booking</h3>
                <p className="feature-description">
                  Book your tickets in just a few clicks with our simple interface
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💺</div>
                <h3 className="feature-title">Choose Your Seat</h3>
                <p className="feature-description">
                  Select your preferred seat from available options
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3 className="feature-title">Instant Confirmation</h3>
                <p className="feature-description">
                  Get instant booking confirmation and e-tickets
                </p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
};

export default Home;
