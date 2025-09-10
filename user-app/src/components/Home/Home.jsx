import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './Home.css';

const Home = () => {
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
      console.log('Making search request with params:', {
        from: searchData.from,
        to: searchData.to,
        date: searchData.date
      });
      
      console.log('API Base URL:', 'http://localhost:8080/api');
      console.log('Token in localStorage:', localStorage.getItem('userToken'));
      
      const response = await api.get('/user/search', {
        params: {
          from: searchData.from,
          to: searchData.to,
          date: searchData.date
        }
      });
      
      console.log('Search response:', response.data);
      
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
