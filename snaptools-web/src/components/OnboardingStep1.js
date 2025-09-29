import React, { useState } from 'react';
import OnboardingStep from './OnboardingStep';

export default function OnboardingStep1({ onNext, initialData, animationDirection }) {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    mcNumber: initialData?.mcNumber || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    console.log('Step 1 form data:', formData);
    if (onNext) {
      onNext(formData);
    }
  };

  const isFormValid = formData.companyName.trim() && formData.mcNumber.trim();

  return (
    <OnboardingStep
      currentStep={1}
      totalSteps={2}
      onNext={handleNext}
      isNextDisabled={!isFormValid}
      animationDirection={animationDirection}
    >
      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Company name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter company name"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">MC#</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter MC number"
            value={formData.mcNumber}
            onChange={(e) => handleInputChange('mcNumber', e.target.value)}
          />
        </div>
      </div>
    </OnboardingStep>
  );
}
