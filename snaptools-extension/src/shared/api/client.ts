/**
 * API Client for Backend Communication
 * 
 * This client automatically handles authentication headers and provides
 * a consistent interface for all backend API calls.
 * 
 * TODO: Replace with real backend configuration
 * - Set actual API_BASE_URL (e.g., 'https://api.snaptools.com/v1')
 * - Configure proper error handling for different status codes
 * - Add retry logic for network failures
 * - Implement refresh token flow when tokens expire
 */

import { getAccessToken } from '../storage';

// TODO: Replace with actual backend URL
const API_BASE_URL = 'https://api.snaptools.com/v1'; // Replace with real API URL

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Enhanced fetch wrapper with automatic auth headers
 * @param path - API endpoint path (e.g., '/templates', '/drivers')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise<T> - Typed response data
 * 
 * TODO: Add refresh token logic when 401 errors occur
 * TODO: Add request/response interceptors for logging
 */
export const apiFetch = async <T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    // Get stored access token
    const accessToken = await getAccessToken();
    
    // Build headers with auth if available
    const headers = new Headers(options.headers);
    
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    
    headers.set('Content-Type', 'application/json');
    
    // Make request
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
    
    // Handle non-ok responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      const error: ApiError = {
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        code: errorData.code,
      };
      
      // TODO: Handle specific error cases:
      // - 401: Token expired, try refresh token flow
      // - 403: Insufficient permissions
      // - 429: Rate limited, implement backoff
      // - 5xx: Server errors, show user-friendly message
      
      throw error;
    }
    
    // Parse and return response
    const responseData = await response.json();
    return responseData.data || responseData;
    
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * API endpoint functions for common operations
 * TODO: Implement these when backend API is ready
 */

/**
 * Fetch user templates
 * TODO: Connect to GET /templates endpoint
 */
export const fetchTemplates = async () => {
  // return apiFetch('/templates');
  throw new Error('Templates API not implemented yet');
};

/**
 * Fetch user drivers
 * TODO: Connect to GET /drivers endpoint
 */
export const fetchDrivers = async () => {
  // return apiFetch('/drivers');
  throw new Error('Drivers API not implemented yet');
};

/**
 * Refresh access token
 * TODO: Implement refresh token flow
 * @param _refreshToken - Stored refresh token
 */
export const refreshAccessToken = async (_refreshToken: string) => {
  // return apiFetch('/auth/refresh', {
  //   method: 'POST',
  //   body: JSON.stringify({ refreshToken: _refreshToken }),
  // });
  throw new Error('Token refresh not implemented yet');
};
