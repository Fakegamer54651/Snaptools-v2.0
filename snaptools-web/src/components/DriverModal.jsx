import React, { useState } from 'react';
import './styles/driverModal.css';
import usFlag from '../assets/icons/us-flag.svg';

const DriverModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    callsign: initialData?.callsign || '',
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    truck: initialData?.truck || '',
    trailer: initialData?.trailer || '',
    vin: initialData?.vin || ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Handle call sign formatting
    if (name === 'callsign') {
      let cleanValue = value.replace(/^\/+/, '');
      processedValue = cleanValue ? `/${cleanValue}` : '';
    }

    // Handle phone formatting
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length > 10) {
        processedValue = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
      } else if (digits.length > 7) {
        processedValue = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      } else if (digits.length > 3) {
        processedValue = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 7)}`;
      } else if (digits.length > 0) {
        processedValue = `+1 (${digits.slice(0, 3)}`;
      } else {
        processedValue = '';
      }
    }

    // Handle VIN formatting
    if (name === 'vin') {
      processedValue = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSave = () => {
    // Validation
    const newErrors = {};
    if (!formData.callsign) {
      newErrors.callsign = 'This field is required';
    }
    if (!formData.name) {
      newErrors.name = 'This field is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Console log the driver data (placeholder)
    console.log('Driver data:', formData);
    
    // Call the onSave prop if provided
    if (onSave) {
      onSave(formData);
    }

    // Reset form and close modal
    setFormData({
      callsign: '',
      name: '',
      phone: '',
      truck: '',
      trailer: '',
      vin: ''
    });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    // Reset form and close modal
    setFormData({
      callsign: '',
      name: '',
      phone: '',
      truck: '',
      trailer: '',
      vin: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="driver-modal-overlay" onClick={onClose}>
      <div className="driver-modal-container">
        {/* Modal */}
        <div className="driver-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="driver-modal__header">
            <h2 className="driver-modal__title">Create driver</h2>
            <button className="driver-modal__close" onClick={onClose}>
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="driver-modal__content">
            <div className="form-container">
              {/* Call sign */}
              <div className="form-field">
                <label className="form-label">Call sign</label>
                <input
                  type="text"
                  name="callsign"
                  value={formData.callsign}
                  onChange={handleInputChange}
                  placeholder="/"
                  className={`form-input ${errors.callsign ? 'form-input--error' : ''}`}
                />
                {errors.callsign && (
                  <span className="form-error-text">{errors.callsign}</span>
                )}
              </div>

              {/* Driver name */}
              <div className="form-field">
                <label className="form-label">Driver name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John dones"
                  className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                />
                {errors.name && (
                  <span className="form-error-text">{errors.name}</span>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-field">
                <label className="form-label">Phone Number</label>
                <div className="form-input phone-input-wrapper">
                  <div className="phone-flag-icon">
                    <img 
                      src={usFlag} 
                      alt="US Flag" 
                      width="28" 
                      height="16"
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1"
                    className="phone-input"
                  />
                </div>
              </div>

              {/* Truck# and Trailer# row */}
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Truck#</label>
                  <input
                    type="text"
                    name="truck"
                    value={formData.truck}
                    onChange={handleInputChange}
                    placeholder="###"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Trailer#</label>
                  <input
                    type="text"
                    name="trailer"
                    value={formData.trailer}
                    onChange={handleInputChange}
                    placeholder="###"
                    className="form-input"
                  />
                </div>
              </div>

              {/* VIN# */}
              <div className="form-field">
                <label className="form-label">VIN#</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  placeholder="17 digit number"
                  className="form-input"
                  maxLength="17"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="driver-modal__buttons">
              <button className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Tutorial Box - Outside Modal */}
        <div className="driver-modal__tutorial-section">
          <div className="tutorial-box">
            <div className="tutorial-header">
              <h3 className="box-title">Driver tutorial</h3>
              <span className="tutorial-duration">(45 seconds)</span>
            </div>
            <div className="tutorial-video">
              <iframe
                width="290"
                height="160"
                src="https://www.youtube.com/embed/DIFFERENT_VIDEO_ID"
                title="Driver Creation Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="tutorial-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                />
                <span className="checkmark"></span>
                Don't show tutorial next time
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverModal;
