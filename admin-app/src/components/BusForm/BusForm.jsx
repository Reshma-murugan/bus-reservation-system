import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { BsPencilSquare, BsBusFrontFill, BsStars, BsCalendarEvent, BsGeoAltFill, BsPlusCircleFill } from 'react-icons/bs';
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
      navigate('/admin/buses');
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
        <div className="header-title">
          <h1>{isEdit ? <><BsPencilSquare className="icon-mr"/> Edit Bus Fleet</> : <><BsBusFrontFill className="icon-mr"/> Add New Bus</>}</h1>
          <p className="bus-form-subtitle">Define routes, schedules, and fleet details for your service.</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="bus-form">
        <div className="form-section-title"><BsStars className="icon-mr"/> Basic Information</div>
        <div className="form-group">
          <label>Bus Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Express Bus Service"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Bus Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="AC_SLEEPER">AC Sleeper</option>
              <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
              <option value="AC_SEATER">AC Seater</option>
              <option value="NON_AC_SEATER">Non-AC Seater</option>
            </select>
          </div>

          <div className="form-group">
            <label>Operator</label>
            <input
              type="text"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleChange}
              required
              placeholder="e.g., KSRTC"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Capacity (Seats)</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            max="60"
          />
        </div>

        <div className="form-section-title"><BsCalendarEvent className="icon-mr"/> Operation Schedule</div>
        <div className="form-group">
          <div className="schedule-days">
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
              <label key={day} className={`day-checkbox ${formData.scheduleDays.includes(day) ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.scheduleDays.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, scheduleDays: [...prev.scheduleDays, day] }));
                    } else {
                      setFormData(prev => ({ ...prev, scheduleDays: prev.scheduleDays.filter(d => d !== day) }));
                    }
                  }}
                />
                {day.charAt(0) + day.slice(1, 3).toLowerCase()}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section-title"><BsGeoAltFill className="icon-mr"/> Route & Pricing</div>
        <div className="stops-container">
          {formData.stops.map((stop, index) => (
            <div key={index} className="stop-entry">
              <div className="form-row">
                <div className="form-group">
                  <label>Stop {index + 1}</label>
                  <input
                    type="text"
                    value={stop.stopName}
                    onChange={(e) => handleStopChange(index, 'stopName', e.target.value)}
                    required
                    placeholder="City name"
                  />
                </div>
                <div className="form-group">
                  <label>Arrival</label>
                  <input
                    type="time"
                    value={stop.arrivalTime}
                    onChange={(e) => handleStopChange(index, 'arrivalTime', e.target.value)}
                    required
                  />
                </div>
                {index > 0 && (
                  <div className="form-group">
                    <label>Price from Prev</label>
                    <input
                      type="number"
                      value={stop.priceFromPrev}
                      onChange={(e) => handleStopChange(index, 'priceFromPrev', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addStop} className="btn-edit" style={{marginBottom: '2rem'}}>
            <BsPlusCircleFill className="icon-mr"/> Add Route Stop
          </button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/buses')} className="btn btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-submit">
            {loading ? 'Processing...' : (isEdit ? 'Update Fleet' : 'Create Fleet')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusForm;
