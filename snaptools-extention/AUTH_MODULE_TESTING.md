# Auth Module - Testing Guide

## ✅ Implementation Complete

The Auth Module is now fully implemented with:
- ✅ Token storage (chrome.storage.local)
- ✅ Automatic token refresh (60s before expiry)
- ✅ Background service worker integration
- ✅ Message-based communication
- ✅ Popup UI (login/logout)
- ✅ Secure logging (no token values in console)

**Build Size**: 38.44 KB total
- Background: 13.65 KB (includes auth module)
- Popup: 13.69 KB (includes auth UI)

---

## 🧪 Testing Instructions

### Step 1: Load Extension

```
chrome://extensions
→ Enable Developer mode
→ Load unpacked
→ Select: C:\Snaptools v2.0\snaptools-extention\.output\chrome-mv3\
```

### Step 2: Verify Background Initialization

1. On `chrome://extensions`, find "SnapTools Extension"
2. Click **"Service worker"** (blue link)
3. Background console should show:
   ```
   SnapTools background running...
   AuthBridge: Initializing...
   AuthBridge: No tokens found
   AuthBridge: Initialized
   ```

### Step 3: Check Popup (Logged Out State)

1. Click the SnapTools extension icon
2. Popup should open
3. Should display:
   - Status badge: "Inactive" (gray)
   - Message: "Sign in to use SnapTools features"
   - Button: "Open Login Page"

### Step 4: Test Login Flow (Simulated)

Since the web app integration isn't complete yet, simulate receiving tokens from the web app:

**In Background Console**, run:

```javascript
chrome.runtime.sendMessage({ 
  type: 'AUTH_SET_TOKENS', 
  payload: { 
    accessToken: 'test_access_token_12345',
    refreshToken: 'test_refresh_token_67890',
    expiresIn: 3600, // 1 hour
    user: { 
      email: 'potato@example.com',
      name: 'Test User'
    }
  }
});
```

**Expected Background Console Output**:
```
AuthBridge: Tokens stored — scheduled refresh at [time]
Tokens stored successfully
AuthBridge: Token refreshed successfully (when broadcast happens)
```

**Expected in Popup** (reopen if already open):
- Status badge: "Active" (green)
- User name: "Test User"
- User email: "potato@example.com"
- Token expiry: "60m" or "1h"
- Button: "Logout"

### Step 5: Verify Token Persistence

1. Close and reopen the popup
2. Should still show "Logged in as potato@example.com"
3. Close Chrome entirely
4. Reopen Chrome and reload extension
5. Background console should show:
   ```
   AuthBridge: Tokens found, scheduling refresh
   ```
6. Popup should still show logged-in state

### Step 6: Test Logout

1. Open popup
2. Click **"Logout"** button
3. **Expected Background Console**:
   ```
   Tokens cleared
   AuthBridge: Logged out, tokens cleared
   ```
4. **Expected Popup**:
   - Status badge changes to "Inactive"
   - Shows "Sign in to use SnapTools features"
   - Button changes to "Open Login Page"

### Step 7: Test Fast Expiry (Token Refresh)

Simulate tokens that expire quickly:

**In Background Console**:
```javascript
chrome.runtime.sendMessage({ 
  type: 'AUTH_SET_TOKENS', 
  payload: { 
    accessToken: 'short_lived_token',
    refreshToken: 'refresh_token',
    expiresIn: 10, // 10 seconds!
    user: { email: 'test@example.com' }
  }
});
```

**Expected** (wait ~10 seconds):
```
AuthBridge: Attempting token refresh...
[Either success or failure depending on API availability]
```

**If API not available** (expected for now):
```
AuthBridge: Token refresh failed: [error]
[Retry in 30 seconds]
```

**To test successful refresh**, you'll need the backend endpoint working.

### Step 8: Test "Open Login Page" Button

1. Ensure logged out (click Logout if needed)
2. Click **"Open Login Page"**
3. **Expected**: New tab opens to:
   ```
   http://localhost:3001/login?ext=1
   ```
4. (Web app would complete auth and call `chrome.runtime.sendMessage` with tokens)

---

## 📝 Message API Reference

### AUTH_GET_STATE
Request current auth state from background.

**Send**:
```javascript
chrome.runtime.sendMessage({ type: 'AUTH_GET_STATE' })
```

**Response**:
```javascript
{
  type: 'AUTH_STATE',
  payload: {
    loggedIn: boolean,
    user?: { email: string, name: string },
    expiresAt?: number
  }
}
```

### AUTH_SET_TOKENS
Store tokens (typically sent by web app after OAuth).

**Send**:
```javascript
chrome.runtime.sendMessage({ 
  type: 'AUTH_SET_TOKENS',
  payload: {
    accessToken: string,
    refreshToken: string,
    expiresIn: number, // seconds
    user?: { email: string, name: string, id?: string }
  }
})
```

**Response**:
```javascript
{ success: true }
```

### AUTH_LOGOUT
Clear all tokens and log out.

**Send**:
```javascript
chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' })
```

**Response**:
```javascript
{ success: true }
```

### AUTH_CHANGED (Broadcast)
Background broadcasts this when auth state changes.

**Received Message**:
```javascript
{
  type: 'AUTH_CHANGED',
  payload: {
    state: {
      loggedIn: boolean,
      user?: { ... },
      expiresAt?: number
    }
  }
}
```

---

## 🔒 Security Features

### ✅ Implemented
- **No token logging**: Console only shows safe messages like "Tokens stored successfully"
- **Secure storage**: Uses `chrome.storage.local` (isolated from web pages)
- **Automatic refresh**: Refreshes 60s before expiry
- **Expiry validation**: Checks token expiry on every read
- **Logout on invalid refresh**: Clears tokens if refresh fails with 401

### Token Storage Location
```
chrome.storage.local
Key: "snaptools_auth"
Value: {
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  issuedAt: number,
  user: { email, name, id }
}
```

---

## 🎯 Expected Console Outputs

### Background Console (Success Flow)

**On extension load (no tokens)**:
```
SnapTools background running...
AuthBridge: Initializing...
AuthBridge: No tokens found
AuthBridge: Initialized
```

**After receiving tokens**:
```
Tokens stored successfully
AuthBridge: Tokens stored — scheduled refresh at 11:23:45 PM
```

**On token refresh (if API available)**:
```
AuthBridge: Attempting token refresh...
Tokens stored successfully
AuthBridge: Token refreshed successfully
```

**On logout**:
```
Tokens cleared
AuthBridge: Logged out, tokens cleared
```

### Popup Console

**On mount (logged out)**:
```
SnapTools popup mounted
```

**On mount (logged in)**:
```
SnapTools popup mounted
[AUTH_GET_STATE response received]
```

**On logout click**:
```
Logged out successfully
```

---

## 🐛 Troubleshooting

### Popup Doesn't Update After Login

**Solution**: Close and reopen the popup after sending AUTH_SET_TOKENS.

The popup loads auth state on mount. Either:
1. Close/reopen popup
2. Or add a "Refresh" button
3. Or the popup will auto-update via AUTH_CHANGED broadcast (already implemented!)

### Token Refresh Fails

**Expected** if backend isn't running:
```
AuthBridge: Token refresh failed: TypeError: Failed to fetch
```

This is normal - the retry mechanism will attempt again in 30s.

**When backend is ready**, update this line in `src/modules/auth/index.ts`:
```typescript
const REFRESH_API_URL = 'https://api.snaptools.app/auth/refresh';
```

### Extension Doesn't Load

**Check**:
1. All files in `.output/chrome-mv3/`?
2. Manifest valid? (click "Errors" button)
3. Service worker running? (not "Inactive")

### Popup Shows "Logged in" but User is Undefined

**Check background console** for AUTH_SET_TOKENS - ensure `user` object was included in payload.

---

## 🧩 Web App Integration (Future)

When your web app is ready to send tokens to the extension:

**After successful OAuth login**, add this JavaScript:

```javascript
// In web app after user logs in
const authData = {
  type: 'AUTH_SET_TOKENS',
  payload: {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
    user: {
      email: user.email,
      name: user.name,
      id: user.id
    }
  }
};

// Send to extension
chrome.runtime.sendMessage(EXTENSION_ID, authData, (response) => {
  if (response?.success) {
    console.log('Tokens sent to extension');
    window.close(); // Close login tab
  }
});
```

**Extension ID**: Find on `chrome://extensions` page

**Alternative**: Use `chrome.storage.sync` to share tokens between web app and extension.

---

## 📊 Storage Inspection

To view stored tokens:

**In Background Console**:
```javascript
// Read current tokens
chrome.storage.local.get('snaptools_auth', (result) => {
  console.log('Stored auth:', result);
});

// Clear tokens manually
chrome.storage.local.remove('snaptools_auth');
```

**DO NOT log token values in production!** This is for debugging only.

---

## ✅ Verification Checklist

### Core Functionality
- [ ] Extension loads without errors
- [ ] Background console shows "AuthBridge: Initialized"
- [ ] Popup opens and displays auth state
- [ ] Logged out state shows correctly

### Token Management
- [ ] Can set tokens via AUTH_SET_TOKENS message
- [ ] Tokens persist across popup close/open
- [ ] Tokens persist across Chrome restart
- [ ] Expiry time displays correctly in popup
- [ ] Refresh is scheduled (check console log for time)

### Logout
- [ ] Logout button works
- [ ] Tokens cleared from storage
- [ ] Popup updates to logged-out state
- [ ] Background console confirms logout

### Login Flow
- [ ] "Open Login Page" button works
- [ ] Opens new tab to login URL
- [ ] Can receive tokens via message

### Security
- [ ] No access tokens logged to console
- [ ] No refresh tokens logged to console
- [ ] Only safe messages ("Tokens stored successfully", etc.)

---

## 🚀 Next Steps

With Auth Module complete:

1. **Test with Real Backend**
   - Update `REFRESH_API_URL` in `src/modules/auth/index.ts`
   - Test actual token refresh flow
   - Verify 401 handling (auto-logout on invalid refresh)

2. **Integrate with Web App**
   - Add extension message sending to web app login flow
   - Test OAuth → token → extension flow

3. **Use Auth in Other Modules**
   - Templates module: Fetch templates with access token
   - Drivers module: CRUD operations with auth
   - Content scripts: Check auth state before showing features

4. **Enhance Popup**
   - Show template list (requires auth)
   - Show driver selector (requires auth)
   - Add manual refresh button
   - Show token expiry countdown

---

## 📄 API Usage Examples

### In Content Scripts

```typescript
// Check if user is logged in
const response = await chrome.runtime.sendMessage({ type: 'AUTH_GET_STATE' });
if (response.payload.loggedIn) {
  // Enable features
  initTemplates();
  initReplacer();
}
```

### In Other Modules

```typescript
import { getAccessToken } from '@/modules/auth';

// Make authenticated API call
const token = await getAccessToken();
if (token) {
  const response = await fetch('https://api.snaptools.app/templates', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

### Listen for Auth Changes

```typescript
// In background context
import { onAuthChange } from '@/modules/auth';

onAuthChange((state) => {
  if (state.loggedIn) {
    console.log('User logged in:', state.user?.email);
    // Fetch templates, drivers, etc.
  } else {
    console.log('User logged out');
    // Clear cached data
  }
});
```

---

## 🎉 Success!

The Auth Module is **fully functional** and ready for testing!

**Quick Test Command** (paste in background console):
```javascript
chrome.runtime.sendMessage({ 
  type: 'AUTH_SET_TOKENS', 
  payload: { 
    accessToken: 'test_token',
    refreshToken: 'refresh_token',
    expiresIn: 3600,
    user: { email: 'test@snaptools.app', name: 'Test User' }
  }
});
```

Then open the popup - should show logged in as "Test User"! ✅

