/**
 * Auth Module Types
 */

export interface User {
  id?: string;
  email?: string;
  name?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms when access token expires
  issuedAt: number; // unix ms when tokens were issued
  scopes?: string[];
  user?: User;
}

export interface AuthState {
  loggedIn: boolean;
  user?: User;
  expiresAt?: number;
}

export interface AuthChangeEvent {
  type: 'AUTH_CHANGED';
  payload: {
    state: AuthState;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds
  user?: User;
}

