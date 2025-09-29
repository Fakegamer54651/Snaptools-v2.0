/**
 * Chrome Extension Storage Utilities
 * 
 * IMPORTANT: For cross-platform compatibility between WebApp and Extension:
 * - WebApp should use localStorage/sessionStorage with the same keys
 * - Extension uses chrome.storage.local for persistence across browser restarts
 * - Both platforms should use identical accessToken and user object formats
 * 
 * Storage Keys:
 * - 'accessToken': JWT or API token for backend authentication
 * - 'user': User profile object { id, name, email, provider }
 */

export interface User {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'outlook';
}

/**
 * Get stored access token
 * @returns Promise<string | null> - Access token or null if not found
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const result = await chrome.storage.local.get(['accessToken']);
    return result.accessToken || null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

/**
 * Store access token
 * @param token - JWT or API token string
 */
export const setAccessToken = async (token: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ accessToken: token });
  } catch (error) {
    console.error('Failed to set access token:', error);
    throw error;
  }
};

/**
 * Remove access token from storage
 */
export const removeAccessToken = async (): Promise<void> => {
  try {
    await chrome.storage.local.remove(['accessToken']);
  } catch (error) {
    console.error('Failed to remove access token:', error);
    throw error;
  }
};

/**
 * Get stored user profile
 * @returns Promise<User | null> - User object or null if not found
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const result = await chrome.storage.local.get(['user']);
    return result.user || null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

/**
 * Store user profile
 * @param user - User profile object
 */
export const setUser = async (user: User): Promise<void> => {
  try {
    await chrome.storage.local.set({ user });
  } catch (error) {
    console.error('Failed to set user:', error);
    throw error;
  }
};

/**
 * Remove user profile from storage
 */
export const removeUser = async (): Promise<void> => {
  try {
    await chrome.storage.local.remove(['user']);
  } catch (error) {
    console.error('Failed to remove user:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated (has valid token and user data)
 * @returns Promise<boolean> - True if authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const [token, user] = await Promise.all([getAccessToken(), getUser()]);
    return !!(token && user);
  } catch (error) {
    console.error('Failed to check authentication status:', error);
    return false;
  }
};

/**
 * Clear all auth data (logout)
 * TODO: When implementing real logout, also call backend API to invalidate token
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([removeAccessToken(), removeUser()]);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
    throw error;
  }
};
