/**
 * Token storage helpers
 * Handles reading/writing token pairs to chrome.storage
 */

import type { TokenPair } from './types';

const STORAGE_KEY = 'snaptools_auth';

/**
 * Save token pair to storage
 */
export async function saveTokens(tokens: TokenPair): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: tokens });
    console.log('Tokens stored successfully');
  } catch (error) {
    console.error('Failed to save tokens:', error);
    throw error;
  }
}

/**
 * Read token pair from storage
 */
export async function readTokens(): Promise<TokenPair | null> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  } catch (error) {
    console.error('Failed to read tokens:', error);
    return null;
  }
}

/**
 * Clear all tokens from storage
 */
export async function clearTokens(): Promise<void> {
  try {
    await chrome.storage.local.remove(STORAGE_KEY);
    console.log('Tokens cleared');
  } catch (error) {
    console.error('Failed to clear tokens:', error);
    throw error;
  }
}

/**
 * Check if tokens are expired
 */
export function isTokenExpired(tokens: TokenPair): boolean {
  return Date.now() >= tokens.expiresAt;
}

/**
 * Check if tokens are about to expire (within 60 seconds)
 */
export function shouldRefresh(tokens: TokenPair): boolean {
  const timeUntilExpiry = tokens.expiresAt - Date.now();
  return timeUntilExpiry < 60_000; // Refresh if less than 60s remaining
}

/**
 * Calculate expiry time from expires_in seconds
 */
export function calculateExpiresAt(expiresInSeconds: number): number {
  return Date.now() + (expiresInSeconds * 1000);
}

/**
 * Listen for token changes in storage
 */
export function onTokensChanged(
  callback: (tokens: TokenPair | null) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue || null);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}

