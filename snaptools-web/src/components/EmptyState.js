import React from 'react';
import './styles/emptyState.css';

const EmptyState = ({ 
  title, 
  description, 
  illustration = 'default',
  actionButton = null 
}) => {
  const getIllustration = () => {
    // Simple placeholder illustration - can be replaced with specific illustrations later
    return (
      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="empty-state__illustration">
        <rect x="20" y="30" width="120" height="80" rx="8" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
        <circle cx="80" cy="70" r="15" fill="#d1d5db"/>
        <path d="M70 65 L75 70 L90 55" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="30" y="20" width="100" height="6" rx="3" fill="#e5e7eb"/>
        <rect x="40" y="95" width="80" height="4" rx="2" fill="#e5e7eb"/>
        <rect x="50" y="103" width="60" height="4" rx="2" fill="#f3f4f6"/>
      </svg>
    );
  };

  return (
    <div className="empty-state">
      <div className="empty-state__content">
        <div className="empty-state__illustration-container">
          {getIllustration()}
        </div>
        
        <div className="empty-state__text">
          <h3 className="empty-state__title">{title}</h3>
          <p className="empty-state__description">{description}</p>
        </div>
        
        {actionButton && (
          <div className="empty-state__action">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
