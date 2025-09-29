import React, { useEffect, useState } from 'react';
import './styles/chip.css';

const Chip = ({ type = 'success', message, onDismiss, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`chip chip--${type} ${isAnimatingOut ? 'chip--fade-out' : 'chip--fade-in'}`}
      onClick={handleDismiss}
    >
      <div className="chip__content">
        <span className="chip__icon">
          {type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          )}
        </span>
        <span className="chip__message">{message}</span>
      </div>
      <button 
        className="chip__close"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
        </svg>
      </button>
    </div>
  );
};

export default Chip;
