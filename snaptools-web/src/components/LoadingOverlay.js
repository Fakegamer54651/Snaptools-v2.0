import React from 'react';
import './styles/loadingOverlay.css';

const LoadingOverlay = ({ isVisible = false }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay__content">
        <div className="loading-overlay__spinner">
          <div className="spinner"></div>
        </div>
        <div className="loading-overlay__text">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
