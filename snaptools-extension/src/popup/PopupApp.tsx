import React, { useState, useEffect } from 'react';
import logoSvg from './assets/logo.svg';
import googleIconSvg from './assets/google-icon.svg';
import outlookIconSvg from './assets/outlook-icon.svg';
import settingsIconSvg from './assets/settings.svg';
import closeIconSvg from './assets/close.svg';
import emptyTemplatesSvg from './assets/empty-templates.svg';
import logoutIconSvg from './assets/logout.svg'; // TODO: Replace with actual logout icon asset
import addIconSvg from './assets/add.svg';
import editIconSvg from './assets/edit.svg';
import deleteIconSvg from './assets/delete.svg';
import { 
  isAuthenticated, 
  getUser, 
  setAccessToken, 
  setUser, 
  clearAuthData,
  type User 
} from '../shared/storage';

// Template interface for type safety
interface Template {
  id: string;
  email: string;
  name: string;
}

const PopupApp: React.FC = () => {
  // State management for authentication
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // TODO: Replace with real templates from backend API
  // This should fetch from /templates endpoint after login
  const [templates, setTemplates] = useState<Template[]>([]); // Empty array for now - will show empty state

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const user = await getUser();
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    // TODO: Navigate to settings page or open settings modal
  };

  const handleClose = () => {
    console.log('Close clicked');
    window.close();
  };

  /**
   * Handle Google OAuth sign in
   * TODO: Replace with real Google OAuth flow
   * 1. Use chrome.identity.launchWebAuthFlow() for OAuth
   * 2. Exchange auth code for access token via backend
   * 3. Store real JWT token and user profile
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Mock Google login - TODO: Replace with real OAuth
      const mockToken = 'google-mock-token-' + Date.now();
      const mockUser: User = {
        id: 'google-user-123',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        provider: 'google'
      };

      // Store auth data
      await setAccessToken(mockToken);
      await setUser(mockUser);

      // Update state
      setCurrentUser(mockUser);
      setIsLoggedIn(true);
      
      console.log('Google sign in successful (mock)');
    } catch (error) {
      console.error('Google sign in failed:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Outlook OAuth sign in
   * TODO: Replace with real Outlook OAuth flow
   * 1. Use chrome.identity.launchWebAuthFlow() for OAuth
   * 2. Exchange auth code for access token via backend
   * 3. Store real JWT token and user profile
   */
  const handleOutlookSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Mock Outlook login - TODO: Replace with real OAuth
      const mockToken = 'outlook-mock-token-' + Date.now();
      const mockUser: User = {
        id: 'outlook-user-456',
        name: 'Jane Smith',
        email: 'jane.smith@outlook.com',
        provider: 'outlook'
      };

      // Store auth data
      await setAccessToken(mockToken);
      await setUser(mockUser);

      // Update state
      setCurrentUser(mockUser);
      setIsLoggedIn(true);
      
      console.log('Outlook sign in successful (mock)');
    } catch (error) {
      console.error('Outlook sign in failed:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout
   * TODO: When implementing real logout:
   * 1. Call backend API to invalidate token
   * 2. Clear all local storage
   * 3. Redirect to login screen
   */
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Clear auth data
      await clearAuthData();
      
      // Update state
      setCurrentUser(null);
      setIsLoggedIn(false);
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsClick = () => {
    console.log('Terms of Service clicked');
    // TODO: Open terms page in new tab
  };

  const handlePrivacyClick = () => {
    console.log('Privacy Policy clicked');
    // TODO: Open privacy policy page in new tab
  };

  /**
   * Add a new template (mock implementation)
   * TODO: Replace with real API call to create template
   * Should POST to /templates endpoint with template data
   */
  const handleAddTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      email: "Example@mail.com",
      name: `Template name ${templates.length + 1}`
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    console.log('Template added (mock):', newTemplate);
  };

  /**
   * Edit a template
   * TODO: Replace with real API call to update template
   * Should PUT to /templates/:id endpoint
   */
  const handleEditTemplate = (templateId: string) => {
    console.log('Edit template:', templateId);
    // TODO: Open edit modal or navigate to edit page
  };

  /**
   * Delete a template
   * TODO: Replace with real API call to delete template
   * Should DELETE to /templates/:id endpoint
   */
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
    console.log('Template deleted (mock):', templateId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="popup-container">
        {/* No gradient background during loading state */}
        <div className="header-container">
          <div className="header-icon-button" style={{ visibility: 'hidden' }}></div>
          <img src={logoSvg} alt="SNAPMAIL" className="header-logo" />
          <div className="header-icon-button" style={{ visibility: 'hidden' }}></div>
        </div>
        <div className="main-section">
          <div className="loading-message">Loading...</div>
        </div>
        <div className="footer-placeholder">
          <div className="invisible-button"></div>
          <div className="invisible-logo"></div>
          <div className="invisible-button"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* Gradient background only for login state */}
      {!isLoggedIn && (
        <div className="gradient-background">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      )}

      {/* Top Bar */}
      <div className="header-container">
        <button className="header-icon-button" onClick={handleSettings}>
          <img src={settingsIconSvg} alt="Settings" className="header-icon" />
        </button>
        <img src={logoSvg} alt="SNAPMAIL" className="header-logo" />
        <button className="header-icon-button" onClick={handleClose}>
          <img src={closeIconSvg} alt="Close" className="header-icon" />
        </button>
      </div>

      {/* Main Content - Conditional rendering based on auth state */}
      <div className="main-section">
        {isLoggedIn && currentUser ? (
          // Logged-in state - Show templates or empty state
          <>
{/* Templates content area */}
            <div className="templates-content">
              {templates.length === 0 ? (
                // Empty templates state
                <div className="empty-templates-state">
                  <img 
                    src={emptyTemplatesSvg} 
                    alt="No templates" 
                    className="empty-templates-illustration"
                  />
                  <h2 className="empty-templates-title">Your templates</h2>
                  <p className="empty-templates-description">
                    Once you create a template it will appear here
                  </p>
                  {/* Add template button */}
                  <button className="add-template-button" onClick={handleAddTemplate}>
                    <img src={addIconSvg} alt="Add" className="add-template-icon" />
                    template
                  </button>
                </div>
              ) : (
                // Templates list header
                <>
                  <h1 className="templates-title">Your Templates</h1>
                  {/* Add template button */}
                  <button className="add-template-button" onClick={handleAddTemplate}>
                    <img src={addIconSvg} alt="Add" className="add-template-icon" />
                    template
                  </button>
                </>
              )}
              
              {/* Templates list */}
              {templates.length > 0 && (
                <div className="templates-list">
                  {templates.map((template) => (
                    <div key={template.id} className="template-card">
                      <div className="template-info">
                        <div className="template-email">{template.email}</div>
                        <div className="template-name">{template.name}</div>
                      </div>
                      <div className="template-actions">
                        <button 
                          className="template-action-button"
                          onClick={() => handleEditTemplate(template.id)}
                        >
                          <img src={editIconSvg} alt="Edit" className="template-action-icon" />
                        </button>
                        <button 
                          className="template-action-button"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <img src={deleteIconSvg} alt="Delete" className="template-action-icon" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* TODO: Add navigation to main app features:
                - Create New Template
                - Manage Drivers  
                - Account Settings
                - Quick Actions
                - Open Web App
            */}
          </>
        ) : (
          // Login state
          <>
            <h1 className="login-title">Register or log in</h1>
            
            <div className="login-container">
              <button className="login-button" onClick={handleGoogleSignIn}>
                <img src={googleIconSvg} alt="Google" className="login-button-icon" />
                Sign in with Google
              </button>
              
              <button className="login-button" onClick={handleOutlookSignIn}>
                <img src={outlookIconSvg} alt="Outlook" className="login-button-icon" />
                Sign in with Outlook
              </button>

              {/* Footer text inside buttons container */}
              <div className="footer-text">
                <span className="footer-text-normal">By continuing you acknowledge that you have read and understood. and agree to Snaptools </span>
                <span className="footer-link" onClick={handleTermsClick}>
                  Terms of Service
                </span>
                <span className="footer-text-normal"> and </span>
                <span className="footer-link" onClick={handlePrivacyClick}>
                  Privacy Policy
                </span>
                <span className="footer-text-normal">.</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - User info when logged in, invisible placeholder when not */}
      {isLoggedIn && currentUser ? (
        <div className="user-footer">
          <div className="user-info-footer">
            {/* TODO: Replace with real user data from backend API */}
            <div className="user-name">{currentUser.name}</div>
            <div className="user-email">{currentUser.email}</div>
          </div>
          <button className="logout-icon-button" onClick={handleLogout}>
            <img src={logoutIconSvg} alt="Logout" className="logout-icon" />
          </button>
        </div>
      ) : (
        // Invisible footer placeholder for visual centering when not logged in
        <div className="footer-placeholder">
          <div className="invisible-button"></div>
          <div className="invisible-logo"></div>
          <div className="invisible-button"></div>
        </div>
      )}
    </div>
  );
};

export default PopupApp;
