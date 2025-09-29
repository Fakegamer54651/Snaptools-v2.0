import React from 'react';
import './styles/figmaChip.css';

const FigmaChip = ({ 
  type = 'success', 
  subtitle = 'Nice', 
  message = 'Template has been saved' 
}) => {
  const getGlowColors = () => {
    switch (type) {
      case 'success':
        return ['#D5F5DD', '#C2FF9A', '#7DDF96'];
      case 'error':
        return ['#FA7FFE', '#FD8E92', '#FD8E92'];
      default:
        return ['#D5F5DD', '#C2FF9A', '#7DDF96'];
    }
  };

  const getIconGradient = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(270deg, #02A763 0%, #85D5B2 100%)';
      case 'error':
        return 'linear-gradient(0deg, #FE9498 0%, #ED484F 100%)';
      default:
        return 'linear-gradient(270deg, #02A763 0%, #85D5B2 100%)';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="url(#successGradient)" />
            <path 
              d="M6 10L8.5 12.5L14 7" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="successGradient" x1="20" y1="10" x2="0" y2="10" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#02A763" />
                <stop offset="100%" stopColor="#85D5B2" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="url(#errorGradient)" />
            <path 
              d="M7 7L13 13M13 7L7 13" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="errorGradient" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FE9498" />
                <stop offset="100%" stopColor="#ED484F" />
              </linearGradient>
            </defs>
          </svg>
        );
      default:
        return null;
    }
  };

  const glowColors = getGlowColors();

  return (
    <div className={`figma-chip figma-chip--${type}`}>
      {/* Decorative Glow Circles */}
      <div className="figma-chip__glow-container">
        <div 
          className="figma-chip__glow figma-chip__glow--1"
          style={{ backgroundColor: glowColors[0] }}
        />
        <div 
          className="figma-chip__glow figma-chip__glow--2"
          style={{ backgroundColor: glowColors[1] }}
        />
        <div 
          className="figma-chip__glow figma-chip__glow--3"
          style={{ backgroundColor: glowColors[2] }}
        />
      </div>

      {/* Icon Holder */}
      <div className="figma-chip__icon-holder">
        {getIcon()}
      </div>

      {/* Text Content */}
      <div className="figma-chip__text">
        <div className="figma-chip__subtitle">{subtitle}</div>
        <div className="figma-chip__message">{message}</div>
      </div>
    </div>
  );
};

export default FigmaChip;
