import React from 'react';
import SnaptoolsMiniLogo from '../assets/logo/snaptools_mini_onboard.svg';
import './styles/onboardingStep.css';

export default function OnboardingStep({ 
  currentStep, 
  totalSteps, 
  title, 
  children, 
  onNext, 
  onBack,
  nextButtonText = "Next step",
  isNextDisabled = false,
  animationDirection = "forward" // "forward" or "backward"
}) {
  return (
    <div className="onboarding-container">
      {/* Back Button - Only show for step 2 and beyond */}
      {currentStep > 1 && onBack && (
        <div className="onboarding-back-button-container">
          <button className="onboarding-back-button" onClick={onBack}>
            <span className="material-symbols-rounded onboarding-back-arrow">arrow_back</span>
            <span className="onboarding-back-text">Back</span>
          </button>
        </div>
      )}

      {/* Gradient Background Circles */}
      <div className="onboarding-gradient-background">
        <div className="onboarding-gradient-circle onboarding-gradient-circle-1"></div>
        <div className="onboarding-gradient-circle onboarding-gradient-circle-2"></div>
        <div className="onboarding-gradient-circle onboarding-gradient-circle-3"></div>
      </div>

      {/* Header and Steps Container - 16px internal padding */}
      <div className="onboarding-header-steps-container">
        {/* Onboarding Header */}
        <div className="onboarding-header">
          <img src={SnaptoolsMiniLogo} alt="SnapTools" className="onboarding-mini-logo" />
          <h1 className="onboarding-header-title">Quick setup.</h1>
          <p className="onboarding-header-subtitle">Let's get your SnapTools email templates ready in just a minute.</p>
        </div>

        {/* Step Progress */}
        <div className="step-progress">
          <div className="step-text">Step {currentStep} of {totalSteps}</div>
        <div className="step-bar-container">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`step-segment ${
                index < currentStep ? 'active' : ''
              } ${
                index === currentStep - 1 ? 'new-step' : ''
              }`}
            />
          ))}
        </div>
        </div>
      </div>

      <div className="onboarding-card">
        {/* Title - Only show if provided */}
        {title && <h2 className="onboarding-title">{title}</h2>}

        {/* Content */}
        <div className={`onboarding-content ${animationDirection === "forward" ? "slide-forward" : "slide-backward"}`}>
          {children}
        </div>

        {/* Next Button */}
        <button 
          className="onboarding-next-btn"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          {nextButtonText}
        </button>
      </div>
    </div>
  );
}
