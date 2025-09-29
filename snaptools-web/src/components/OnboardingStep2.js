import React, { useState } from 'react';
import OnboardingStep from './OnboardingStep';
import usFlag from '../assets/icons/us-flag.svg';

export default function OnboardingStep2({ onNext, onBack, initialData, animationDirection }) {
  const [formData, setFormData] = useState({
    phone: initialData?.phone || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

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

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleNext = () => {
    console.log('Step 2 form data:', formData);
    if (onNext) {
      onNext(formData);
    }
  };

  // Phone number is optional, so button is always enabled
  const isFormValid = true;

  return (
    <OnboardingStep
      currentStep={2}
      totalSteps={2}
      onNext={handleNext}
      onBack={onBack}
      nextButtonText="Finish setup"
      isNextDisabled={!isFormValid}
      animationDirection={animationDirection}
    >
      <div className="input-group">
        <label className="input-label">Phone Number</label>
        <div className="input-field phone-input-wrapper">
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
    </OnboardingStep>
  );
}
