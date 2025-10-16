/**
 * Mock Auth Module
 * Provides fake authentication without backend APIs
 * For development and testing only
 */

export type MockToken = {
  accessToken: string;
  expiresAt: number;
  user: { email: string };
};

/**
 * Fake login - generates random token
 */
export async function fakeLogin(): Promise<MockToken> {
  const token: MockToken = {
    accessToken: Math.random().toString(36).substring(2),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    user: { email: 'potato@snaptools.app' },
  };
  await chrome.storage.local.set({ snaptools_auth: token });
  console.log('[Auth] Logged in (mock):', token.user.email);
  return token;
}

/**
 * Fake logout - clears token
 */
export async function fakeLogout() {
  await chrome.storage.local.remove('snaptools_auth');
  console.log('[Auth] Logged out (mock)');
}

/**
 * Get current mock auth token
 */
export async function getMockAuth(): Promise<MockToken | null> {
  const data = await chrome.storage.local.get('snaptools_auth');
  return data.snaptools_auth || null;
}

/**
 * Auto-refresh loop - refreshes token before expiry
 */
export async function autoRefresh() {
  const data = await getMockAuth();
  if (!data) {
    // No token, check again in 60s
    setTimeout(autoRefresh, 60_000);
    return;
  }

  const now = Date.now();
  if (data.expiresAt - now < 60_000) {
    console.log('[Auth] Token expired → refreshing...');
    const refreshed = {
      ...data,
      accessToken: Math.random().toString(36).substring(2),
      expiresAt: now + 5 * 60 * 1000,
    };
    await chrome.storage.local.set({ snaptools_auth: refreshed });
    console.log('[Auth] Token refreshed → expiresAt', new Date(refreshed.expiresAt).toLocaleTimeString());
  }

  setTimeout(autoRefresh, 60_000);
}

