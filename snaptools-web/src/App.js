import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DriversPage from "./pages/DriversPage";
import TemplatesPage from "./pages/TemplatesPage";
import CreateTemplatePage from "./pages/CreateTemplatePage";
import SignInPage from "./pages/SignInPage";
import OnboardingPage from "./pages/OnboardingPage";
import PDFSignPage from "./pages/PDFSignPage";
import SplashScreen from "./components/SplashScreen";
import LoadingOverlay from "./components/LoadingOverlay";
import ChipContainer from "./components/ChipContainer";
import { authStore } from "./store/auth.store";

// Global UI Context for managing feedback states
const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default function App() {
  const location = useLocation();
  
  // Global UI states
  const [showSplash, setShowSplash] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [chips, setChips] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(authStore.isAuthenticated());

  // Check if current page should hide navbar
  const shouldHideNavbar = location.pathname === '/onboarding';

  // Auto-dismiss splash screen after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authStore.subscribe((authState) => {
      setIsAuthenticated(authState.isAuthenticated);
    });

    return unsubscribe;
  }, []);

  // Manage body class for navbar padding
  useEffect(() => {
    if (isAuthenticated && !shouldHideNavbar) {
      document.body.classList.add('has-navbar');
    } else {
      document.body.classList.remove('has-navbar');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('has-navbar');
    };
  }, [isAuthenticated, shouldHideNavbar]);

  // Chip management functions
  const addChip = (type, message, duration = 3000) => {
    const chip = {
      id: Date.now() + Math.random(),
      type,
      message,
      duration
    };
    setChips(prev => [...prev, chip]);
  };

  const removeChip = (chipId) => {
    setChips(prev => prev.filter(chip => chip.id !== chipId));
  };

  const showSuccess = (message) => addChip('success', message);
  const showError = (message) => addChip('error', message);

  // UI Context value
  const uiValue = {
    globalLoading,
    setGlobalLoading,
    showSuccess,
    showError,
    addChip,
    removeChip
  };

  return (
    <UIContext.Provider value={uiValue}>
      {/* Splash Screen */}
      <SplashScreen isVisible={showSplash} />

      {/* Main App Content */}
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.3s ease' }}>
        {isAuthenticated && !shouldHideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          } />
          <Route path="/drivers" element={
            <ProtectedRoute>
              <DriversPage />
            </ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          } />
          <Route path="/templates/create" element={
            <ProtectedRoute>
              <CreateTemplatePage />
            </ProtectedRoute>
          } />
          <Route path="/templates/edit/:id" element={
            <ProtectedRoute>
              <CreateTemplatePage />
            </ProtectedRoute>
          } />
          <Route path="/pdfsign" element={
            <ProtectedRoute>
              <PDFSignPage />
            </ProtectedRoute>
          } />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>

      {/* Global UI Feedback Components */}
      <LoadingOverlay isVisible={globalLoading} />
      <ChipContainer chips={chips} onDismiss={removeChip} />
    </UIContext.Provider>
  );
}
