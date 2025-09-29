import React from 'react';
import './styles/splashScreen.css';
import snaptoolsLogo from '../assets/snaptools-logo.svg';

const SplashScreen = ({ isVisible = true, onAnimationEnd }) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`splash-screen ${!isVisible ? 'splash-screen--fade-out' : ''}`}
      onAnimationEnd={onAnimationEnd}
    >
      <div className="splash-screen__content">
        <div id="splash-logo" className="splash-screen__logo">
          <img 
            src={snaptoolsLogo} 
            alt="SnapTools Logo" 
            className="splash-screen__logo-image"
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
