import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store/auth.store';
import GoogleIcon from '../assets/icons/google.svg';
import OutlookIcon from '../assets/icons/outlook.svg';
import MiniLogo from '../assets/logo/snaptools-mini.svg';
import LoginBanner from '../assets/banners/login-banner.png';
import './styles/signIn.css';

export default function SignInPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Add class to body to prevent scrollbars
    document.body.classList.add('signin-page');
    
    // If already authenticated, redirect to templates page
    if (authStore.isAuthenticated()) {
      navigate('/templates');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('signin-page');
    };
  }, [navigate]);

  const handleGoogleSignIn = () => {
    console.log('Google login');
    // Simulate successful login
    const userData = {
      name: 'Rick Astley',
      email: 'rick@gmail.com',
      provider: 'google',
      // TODO: Replace with backend response - hasCompletedOnboarding flag
      hasCompletedOnboarding: true // Google users skip onboarding for now
    };
    
    authStore.login(userData);
    
    // TODO: Replace hardcoded logic with backend check
    // if (!userData.hasCompletedOnboarding) {
    //   navigate('/onboarding');
    // } else {
    //   navigate('/templates');
    // }
    navigate('/templates'); // Google users go directly to templates
  };

  const handleOutlookSignIn = () => {
    console.log('Outlook login');
    // Simulate successful login
    const userData = {
      name: 'Rick Astley', 
      email: 'rick@outlook.com',
      provider: 'outlook',
      // TODO: Replace with backend response - hasCompletedOnboarding flag
      hasCompletedOnboarding: false // Outlook users need onboarding for now
    };
    
    authStore.login(userData);
    
    // TODO: Replace hardcoded logic with backend check
    // if (!userData.hasCompletedOnboarding) {
    //   navigate('/onboarding');
    // } else {
    //   navigate('/templates');
    // }
    navigate('/onboarding'); // Outlook users go to onboarding
  };

  return (
    <div className="signin-container">
      {/* Blurred Background Circles */}
      <div className="signin-gradient-background">
        <div className="signin-gradient-circle signin-gradient-circle-1"></div>
        <div className="signin-gradient-circle signin-gradient-circle-2"></div>
        <div className="signin-gradient-circle signin-gradient-circle-3"></div>
      </div>
      
      {/* Left Side - Sign In Card */}
      <div className="signin-left">
        <div className="signin-card">
          <h1 className="signin-title">Register or log in</h1>
          
          <div className="signin-buttons">
            <button className="signin-btn google-btn" onClick={handleGoogleSignIn}>
              <img src={GoogleIcon} alt="Google" className="signin-icon" />
              Sign in with Google
            </button>
            
            <button className="signin-btn outlook-btn" onClick={handleOutlookSignIn}>
              <img src={OutlookIcon} alt="Outlook" className="signin-icon" />
              Sign in with Outlook
            </button>
          </div>
          
          <p className="signin-footer">
            By continuing you acknowledge that you have read and understood, and agree to Snaptools{' '}
            <a href="#" className="footer-link">Terms of Service</a> and{' '}
            <a href="#" className="footer-link">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Right Side - Banner */}
      <div className="signin-right">
        <div className="banner-container">
          <img src={LoginBanner} alt="Login Banner" className="banner-image" />
          <div className="banner-logo-overlay">
            <img src={MiniLogo} alt="SnapTools" className="mini-logo" />
            <h1 className="banner-title">Best at what we do.</h1>
            <p className="banner-subtitle">One toolset. All you need. And it's free.</p>
          </div>
        </div>
      </div>
    </div>
  );
}