import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingStep1 from '../components/OnboardingStep1';
import OnboardingStep2 from '../components/OnboardingStep2';
import OnboardingStep from '../components/OnboardingStep';
import { authStore } from '../store/auth.store';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState("forward");
  const [formData, setFormData] = useState({
    step1: null,
    step2: null,
    step3: null
  });

  const handleStep1Next = (step1Data) => {
    console.log('Step 1 completed:', step1Data);
    setFormData(prev => ({ ...prev, step1: step1Data }));
    setAnimationDirection("forward");
    setCurrentStep(2);
  };

  const handleStep2Next = (step2Data) => {
    console.log('Step 2 completed:', step2Data);
    setFormData(prev => ({ ...prev, step2: step2Data }));
    handleOnboardingComplete(step2Data);
  };

  const handleBackToStep1 = () => {
    setAnimationDirection("backward");
    setCurrentStep(1);
  };

  const handleOnboardingComplete = (step2Data) => {
    const allData = { ...formData, step2: step2Data };
    console.log('Onboarding completed! All data:', allData);
    
    // TODO: Send onboarding data to backend
    // await api.completeOnboarding(formData);
    
    // TODO: Update user's hasCompletedOnboarding flag in backend
    // const updatedUser = { ...authStore.getState().user, hasCompletedOnboarding: true };
    // authStore.login(updatedUser);
    
    // Simulate onboarding completion
    const currentUser = authStore.getState().user;
    const updatedUser = { ...currentUser, hasCompletedOnboarding: true };
    authStore.login(updatedUser);
    
    // Redirect to templates after completing onboarding
    navigate('/templates');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 onNext={handleStep1Next} initialData={formData.step1} animationDirection={animationDirection} />;
      
      case 2:
        return <OnboardingStep2 onNext={handleStep2Next} onBack={handleBackToStep1} initialData={formData.step2} animationDirection={animationDirection} />;
      
      default:
        return <OnboardingStep1 onNext={handleStep1Next} initialData={formData.step1} animationDirection={animationDirection} />;
    }
  };

  return (
    <div>
      {renderCurrentStep()}
    </div>
  );
}
