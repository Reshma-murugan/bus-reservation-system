import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import './BusForm.css';

const BusForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    operatorName: '',
    scheduleDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], // Default to all days
    stops: [
      { stopName: '', arrivalTime: '', priceFromPrev: 0 },
      { stopName: '', arrivalTime: '', priceFromPrev: 0 }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchBus();
    }
  }, [id, isEdit]);

  const fetchBus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/buses/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch bus details');
      console.error('Error fetching bus:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStopChange = (index, field, value) => {
    const newStops = [...formData.stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      stops: newStops
    }));
  };

  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, { stopName: '', arrivalTime: '', priceFromPrev: 0 }]
    }));
  };

  const removeStop = (index) => {
    if (formData.stops.length > 2) {
      const newStops = formData.stops.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        stops: newStops
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form data
    if (!formData.name || !formData.type || !formData.capacity || !formData.operatorName) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    // Validate stops
    for (let i = 0; i < formData.stops.length; i++) {
      const stop = formData.stops[i];
      if (!stop.stopName || !stop.arrivalTime || stop.priceFromPrev < 0) {
        setError(`Please fill all fields for stop ${i + 1}`);
        setLoading(false);
        return;
      }
    }

    try {
      // Transform data to match backend expectations
      const transformedData = {
        name: formData.name,
        type: formData.type,
        capacity: parseInt(formData.capacity), // Convert to integer
        operatorName: formData.operatorName,
        scheduleDays: formData.scheduleDays, // Backend expects Set but accepts array
        stops: formData.stops.map(stop => ({
          stopName: stop.stopName,
          arrivalTime: stop.arrivalTime,
          priceFromPrev: parseFloat(stop.priceFromPrev) || 0 // Convert to number
        }))
      };

      const endpoint = isEdit ? `/admin/buses/${id}` : '/admin/buses';
      const method = isEdit ? 'put' : 'post';
      
      console.log('Sending transformed bus data:', JSON.stringify(transformedData, null, 2));
      const response = await api[method](endpoint, transformedData);
      console.log('Bus creation/update successful:', response.data);
      navigate('/buses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bus');
      console.error('Error saving bus:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bus-form-container">
      <div className="bus-form-header">
        <h1>{isEdit ? 'Edit Bus' : 'Add New Bus'}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="bus-form">
        <div className="form-group">
          <label htmlFor="name">Bus Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Express Bus Service"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Bus Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Bus Type</option>
              <option value="AC_SLEEPER">AC Sleeper</option>
              <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
              <option value="AC_SEATER">AC Seater</option>
              <option value="NON_AC_SEATER">Non-AC Seater</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="operatorName">Operator Name</label>
            <input
              type="text"
              id="operatorName"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleChange}
              required
              placeholder="e.g., KSRTC"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            max="60"
            placeholder="e.g., 45"
          />
        </div>

        <div className="form-group schedule-days-section">
          <label>Operating Days</label>
          <div className="schedule-days">
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
              <label key={day} className="day-checkbox">
                <input
                  type="checkbox"
                  checked={formData.scheduleDays.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        scheduleDays: [...prev.scheduleDays, day]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        scheduleDays: prev.scheduleDays.filter(d => d !== day)
                      }));
                    }
                  }}
                />
                <span className="day-label">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
              </label>
            ))}
          </div>
          <small className="form-help">Select the days when this bus operates</small>
        </div>

        <div className="stops-section">
          <h3>Bus Stops</h3>
          {formData.stops.map((stop, index) => (
            <div key={index} className="stop-form">
              <div className="stop-header">
                <h4>Stop {index + 1}</h4>
                {formData.stops.length > 2 && (
                  <button 
                    type="button" 
                    onClick={() => removeStop(index)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`stop-name-${index}`}>Stop Name</label>
                  <input
                    type="text"
                    id={`stop-name-${index}`}
                    value={stop.stopName}
                    onChange={(e) => handleStopChange(index, 'stopName', e.target.value)}
                    required
                    placeholder="e.g., Bangalore"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`arrival-time-${index}`}>Arrival Time</label>
                  <input
                    type="time"
                    id={`arrival-time-${index}`}
                    value={stop.arrivalTime}
                    onChange={(e) => handleStopChange(index, 'arrivalTime', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`price-${index}`}>Price from Previous Stop</label>
                  <input
                    type="number"
                    id={`price-${index}`}
                    value={stop.priceFromPrev}
                    onChange={(e) => handleStopChange(index, 'priceFromPrev', parseFloat(e.target.value) || 0)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button type="button" onClick={addStop} className="btn-add-stop">
            Add Stop
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/buses')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Bus' : 'Create Bus')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusForm;
