/**
 * Environment and build-time configuration
 * Reads values from WXT build context
 */

// TODO: Import from WXT when available
// import { browser } from 'wxt/browser';

// Extend Vite's ImportMetaEnv
/// <reference types="vite/client" />

/**
 * Current build mode
 */
export const MODE = import.meta.env.MODE || 'development';

/**
 * Is development mode
 */
export const isDev = MODE === 'development';

/**
 * Is production mode
 */
export const isProd = MODE === 'production';

/**
 * Extension version from manifest
 */
export const VERSION = import.meta.env.VERSION || '2.0.0';

/**
 * API endpoint configuration
 * TODO: Replace with actual backend URLs
 */
export const API_URL = isDev
  ? 'http://localhost:3000/api'
  : 'https://api.snaptools.com';

/**
 * Web app URL for login/redirect
 * TODO: Replace with actual web app URLs
 */
export const WEB_APP_URL = isDev
  ? 'http://localhost:3001'
  : 'https://app.snaptools.com';

/**
 * Feature flags
 * TODO: Add feature flags as needed
 */
export const FEATURES = {
  PDF_SIGNING: true,
  TEMPLATES: true,
  SHORTCUTS: true,
  // TODO: Add more feature flags
};

/**
 * Log helper that only logs in development
 */
export function devLog(...args: any[]): void {
  if (isDev) {
    console.log('[SnapTools]', ...args);
  }
}

/**
 * Error log helper
 */
export function errorLog(...args: any[]): void {
  console.error('[SnapTools Error]', ...args);
}

