# Auth Module - Quick Test Reference 🚀

## ⚡ Super Quick Test (Copy & Paste)

### 1. Load Extension
```
chrome://extensions
→ Load unpacked
→ C:\Snaptools v2.0\snaptools-extention\.output\chrome-mv3\
```

### 2. Open Background Console
```
chrome://extensions
→ SnapTools Extension
→ Click "Service worker"
```

### 3. Paste This in Background Console:

```javascript
// Test login
chrome.runtime.sendMessage({ 
  type: 'AUTH_SET_TOKENS', 
  payload: { 
    accessToken: 'test_access_token',
    refreshToken: 'test_refresh_token',
    expiresIn: 3600,
    user: { 
      email: 'potato@example.com',
      name: 'Potato User'
    }
  }
});
```

**Expected Output**:
```
Tokens stored successfully
AuthBridge: Tokens stored — scheduled refresh at [time]
```

### 4. Open Popup
Click the SnapTools icon.

**Expected**:
- ✅ Status: "Active" (green)
- ✅ Shows: "Potato User"
- ✅ Shows: "potato@example.com"
- ✅ Shows: "Token: 60m" (or similar)
- ✅ Button: "Logout"

### 5. Test Logout
Click "Logout" button in popup.

**Expected Background Console**:
```
Tokens cleared
AuthBridge: Logged out, tokens cleared
```

**Expected Popup**:
- Status: "Inactive" (gray)
- Shows: "Sign in to use SnapTools features"
- Button: "Open Login Page"

---

## 🔬 Advanced Tests

### Test Token Persistence
```javascript
// 1. Set tokens (see above)
// 2. Close popup
// 3. Reopen popup
// Expected: Still logged in

// 4. Close Chrome entirely
// 5. Reopen Chrome, reload extension
// 6. Click service worker
// Expected: "AuthBridge: Tokens found, scheduling refresh"
```

### Test Short-Lived Token (Fast Refresh)
```javascript
// Set tokens that expire in 10 seconds
chrome.runtime.sendMessage({ 
  type: 'AUTH_SET_TOKENS', 
  payload: { 
    accessToken: 'short_token',
    refreshToken: 'refresh_token',
    expiresIn: 10, // 10 seconds!
    user: { email: 'test@example.com' }
  }
});

// Wait 10 seconds and watch background console
// Expected: "AuthBridge: Attempting token refresh..."
// (Will fail if API not available, but shows retry logic)
```

### Test Get Auth State
```javascript
// In popup console or background console
chrome.runtime.sendMessage({ 
  type: 'AUTH_GET_STATE' 
}, (response) => {
  console.log('Current auth state:', response.payload);
});
```

### Inspect Storage Directly
```javascript
// In background console
chrome.storage.local.get('snaptools_auth', (result) => {
  console.log('Stored tokens:', result);
  // DO NOT do this in production! (security risk)
});
```

---

## ✅ Verification Checklist

Quick checklist for testing:

**Background Console**:
- [ ] "SnapTools background running..."
- [ ] "AuthBridge: Initialized"
- [ ] After AUTH_SET_TOKENS: "Tokens stored successfully"
- [ ] Shows scheduled refresh time
- [ ] No actual token values logged

**Popup (Logged Out)**:
- [ ] Status badge: "Inactive"
- [ ] Message: "Sign in to use SnapTools features"
- [ ] Button: "Open Login Page"

**Popup (Logged In)**:
- [ ] Status badge: "Active"
- [ ] Shows user name
- [ ] Shows user email
- [ ] Shows token expiry ("60m", "1h", etc.)
- [ ] Button: "Logout"

**Logout Flow**:
- [ ] Logout button clears state
- [ ] Background console: "Tokens cleared"
- [ ] Popup updates to logged-out state
- [ ] Storage cleared (verify with storage.local.get)

**Persistence**:
- [ ] Tokens persist across popup close/reopen
- [ ] Tokens persist across Chrome restart
- [ ] Background reschedules refresh on restart

---

## 🎯 Expected Console Logs

### Startup (No Tokens)
```
SnapTools background running...
AuthBridge: Initializing...
AuthBridge: No tokens found
AuthBridge: Initialized
```

### Startup (With Tokens)
```
SnapTools background running...
AuthBridge: Initializing...
AuthBridge: Tokens found, scheduling refresh
AuthBridge: Initialized
```

### Setting Tokens
```
Tokens stored successfully
AuthBridge: Tokens stored — scheduled refresh at 11:45:30 PM
```

### Logout
```
Tokens cleared
AuthBridge: Logged out, tokens cleared
```

### Token Refresh Attempt (No API)
```
AuthBridge: Attempting token refresh...
AuthBridge: Token refresh failed: TypeError: Failed to fetch
```

---

## 🐛 Common Issues

### Popup Doesn't Update After Setting Tokens
**Solution**: Close and reopen popup, OR wait for AUTH_CHANGED broadcast (should be instant).

### Background Shows "Inactive"
**Solution**: Click "Service worker" link to activate it.

### Token Refresh Keeps Failing
**Expected** if backend not running. Update `REFRESH_API_URL` when backend is ready.

### "Sign In" Button Does Nothing
Check if popup console shows errors. Verify WEB_APP_LOGIN_URL is correct.

---

## 📱 Integration with Web App

When your web app login is ready, it should:

**After successful OAuth**, send this message:

```javascript
chrome.runtime.sendMessage({
  type: 'AUTH_SET_TOKENS',
  payload: {
    accessToken: authResponse.access_token,
    refreshToken: authResponse.refresh_token,
    expiresIn: authResponse.expires_in,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  }
}, (response) => {
  if (response?.success) {
    // Close login tab
    window.close();
  }
});
```

**Login URL Query Parameter**: `?ext=1`
- Web app can detect extension login flow
- Show simplified UI or auto-close after auth

---

## 🎨 Popup UI States

### Logged Out
```
╔══════════════════════════════════╗
║  SnapTools              Inactive ║
╠══════════════════════════════════╣
║                                  ║
║   Sign in to use SnapTools       ║
║          features                ║
║                                  ║
║      [Open Login Page]           ║
║                                  ║
╠══════════════════════════════════╣
║           Settings               ║
╚══════════════════════════════════╝
```

### Logged In
```
╔══════════════════════════════════╗
║  SnapTools                Active ║
╠══════════════════════════════════╣
║  Potato User                     ║
║  potato@example.com     [Logout] ║
║  Token: 60m                      ║
╠══════════════════════════════════╣
║  Shortcuts                       ║
║  No shortcuts configured         ║
╠══════════════════════════════════╣
║  Templates                       ║
║  No templates available          ║
╠══════════════════════════════════╣
║           Settings               ║
╚══════════════════════════════════╝
```

---

## 🔄 Message Flow Diagram

```
[Web App Login]
    │
    └─ chrome.runtime.sendMessage({ type: 'AUTH_SET_TOKENS' })
         │
         ↓
    [Background]
         ├─ saveTokens() → chrome.storage.local
         ├─ scheduleTokenRefresh() → setTimeout()
         └─ broadcastAuthChange() → AUTH_CHANGED message
                  │
                  ↓
            [Popup Receives AUTH_CHANGED]
                  │
                  └─ Updates UI: isLoggedIn = true
```

```
[User Clicks Logout in Popup]
    │
    └─ chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' })
         │
         ↓
    [Background]
         ├─ clearTokens() → chrome.storage.local.remove()
         ├─ clearTimeout() → cancel refresh
         └─ broadcastAuthChange() → AUTH_CHANGED message
                  │
                  ↓
            [Popup Receives AUTH_CHANGED]
                  │
                  └─ Updates UI: isLoggedIn = false
```

---

## 🎉 Success!

**Auth Module is fully functional!**

Quick test: Paste the test script above in background console, then open popup.

You should see: "Potato User" logged in with email and token expiry! ✅

