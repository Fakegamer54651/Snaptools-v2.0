// Simple auth state management
let authState = {
  isAuthenticated: false,
  user: null
};

const authListeners = [];

export const authStore = {
  // Get current auth state
  getState: () => authState,

  // Check if user is authenticated
  isAuthenticated: () => authState.isAuthenticated,

  // Login user
  login: (userData = { name: 'Rick Astley', email: 'rick@snaptools.com' }) => {
    authState = {
      isAuthenticated: true,
      user: userData
    };
    localStorage.setItem('snaptools_auth', JSON.stringify(authState));
    notifyListeners();
  },

  // Logout user
  logout: () => {
    authState = {
      isAuthenticated: false,
      user: null
    };
    localStorage.removeItem('snaptools_auth');
    notifyListeners();
  },

  // Initialize auth state from localStorage
  init: () => {
    try {
      const stored = localStorage.getItem('snaptools_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated) {
          authState = parsed;
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
    notifyListeners();
  },

  // Subscribe to auth state changes
  subscribe: (listener) => {
    authListeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = authListeners.indexOf(listener);
      if (index > -1) {
        authListeners.splice(index, 1);
      }
    };
  }
};

// Notify all listeners of state changes
function notifyListeners() {
  authListeners.forEach(listener => listener(authState));
}

// Initialize on module load
authStore.init();
