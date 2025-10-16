/**
 * Auth Module
 * Manages authentication state and token sync with web app
 */

import type { TokenPair, AuthState, RefreshTokenResponse } from './types';
import {
  readTokens,
  saveTokens,
  clearTokens,
  isTokenExpired,
  calculateExpiresAt,
} from './token';

// API endpoint for token refresh (replace with actual endpoint)
const REFRESH_API_URL = 'https://api.snaptools.app/auth/refresh';

// In-memory state
let currentTokens: TokenPair | null = null;
let refreshTimeoutId: number | null = null;

// Listeners for auth changes
type AuthChangeListener = (state: AuthState) => void;
const authChangeListeners: Set<AuthChangeListener> = new Set();

/**
 * Initialize auth bridge - called from background on startup
 */
export async function initAuthBridge() {
  console.log('AuthBridge: Initializing...');

  // Load tokens from storage
  currentTokens = await readTokens();

  if (currentTokens) {
    if (isTokenExpired(currentTokens)) {
      console.log('AuthBridge: Tokens expired on startup, clearing...');
      await handleLogout();
    } else {
      console.log('AuthBridge: Tokens found, scheduling refresh');
      scheduleTokenRefresh();
    }
  } else {
    console.log('AuthBridge: No tokens found');
  }

  // Set up message listeners
  setupMessageListeners();

  console.log('AuthBridge: Initialized');
}

/**
 * Get current auth state
 */
export async function getAuthState(): Promise<AuthState> {
  const tokens = currentTokens || await readTokens();

  if (!tokens) {
    return { loggedIn: false };
  }

  if (isTokenExpired(tokens)) {
    return { loggedIn: false };
  }

  return {
    loggedIn: true,
    user: tokens.user,
    expiresAt: tokens.expiresAt,
  };
}

/**
 * Set tokens (called when web app sends tokens)
 */
export async function setTokens(data: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: TokenPair['user'];
}): Promise<void> {
  const tokens: TokenPair = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: calculateExpiresAt(data.expiresIn),
    issuedAt: Date.now(),
    user: data.user,
  };

  await saveTokens(tokens);
  currentTokens = tokens;

  const refreshTime = new Date(tokens.expiresAt - 60_000).toLocaleTimeString();
  console.log(`AuthBridge: Tokens stored — scheduled refresh at ${refreshTime}`);

  scheduleTokenRefresh();
  broadcastAuthChange();
}

/**
 * Logout - clear tokens and broadcast
 */
export async function logout(): Promise<void> {
  await handleLogout();
}

/**
 * Internal logout handler
 */
async function handleLogout(): Promise<void> {
  await clearTokens();
  currentTokens = null;

  if (refreshTimeoutId !== null) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }

  console.log('AuthBridge: Logged out, tokens cleared');
  broadcastAuthChange();
}

/**
 * Schedule automatic token refresh
 */
function scheduleTokenRefresh(): void {
  if (refreshTimeoutId !== null) {
    clearTimeout(refreshTimeoutId);
  }

  if (!currentTokens) return;

  const timeToRefresh = currentTokens.expiresAt - Date.now() - 60_000; // Refresh 60s before expiry

  if (timeToRefresh <= 0) {
    // Already expired or about to, refresh immediately
    attemptTokenRefresh();
  } else {
    refreshTimeoutId = setTimeout(() => {
      attemptTokenRefresh();
    }, timeToRefresh) as unknown as number;
  }
}

/**
 * Attempt to refresh the access token
 */
async function attemptTokenRefresh(): Promise<void> {
  if (!currentTokens) return;

  console.log('AuthBridge: Attempting token refresh...');

  try {
    const response = await fetch(REFRESH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: currentTokens.refreshToken,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('AuthBridge: Refresh token invalid, logging out');
        await handleLogout();
        return;
      }
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const data: RefreshTokenResponse = await response.json();

    // Update tokens
    const newTokens: TokenPair = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || currentTokens.refreshToken,
      expiresAt: calculateExpiresAt(data.expires_in),
      issuedAt: Date.now(),
      user: data.user || currentTokens.user,
    };

    await saveTokens(newTokens);
    currentTokens = newTokens;

    console.log('AuthBridge: Token refreshed successfully');
    scheduleTokenRefresh();
    broadcastAuthChange();
  } catch (error) {
    console.error('AuthBridge: Token refresh failed:', error);
    // On network error, try again in 30 seconds
    refreshTimeoutId = setTimeout(() => {
      attemptTokenRefresh();
    }, 30_000) as unknown as number;
  }
}

/**
 * Broadcast auth state change to all contexts
 */
async function broadcastAuthChange(): Promise<void> {
  const state = await getAuthState();

  // Notify local listeners
  authChangeListeners.forEach((listener) => listener(state));

  // Broadcast to all extension contexts
  try {
    await chrome.runtime.sendMessage({
      type: 'AUTH_CHANGED',
      payload: { state },
    });
  } catch (error) {
    // Ignore errors (no listeners is fine)
  }
}

/**
 * Register auth change listener (for background context)
 */
export function onAuthChange(callback: AuthChangeListener): () => void {
  authChangeListeners.add(callback);
  return () => {
    authChangeListeners.delete(callback);
  };
}

/**
 * Set up message listeners for auth commands
 */
function setupMessageListeners(): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'AUTH_GET_STATE') {
      getAuthState().then((state) => {
        sendResponse({ type: 'AUTH_STATE', payload: state });
      });
      return true; // Async response
    }

    if (message.type === 'AUTH_SET_TOKENS') {
      const { accessToken, refreshToken, expiresIn, user } = message.payload;
      setTokens({ accessToken, refreshToken, expiresIn, user }).then(() => {
        sendResponse({ success: true });
      });
      return true; // Async response
    }

    if (message.type === 'AUTH_LOGOUT') {
      handleLogout().then(() => {
        sendResponse({ success: true });
      });
      return true; // Async response
    }

    return false; // Not an auth message
  });
}

/**
 * Get access token for API calls
 */
export async function getAccessToken(): Promise<string | null> {
  const tokens = currentTokens || await readTokens();

  if (!tokens || isTokenExpired(tokens)) {
    return null;
  }

  return tokens.accessToken;
}

