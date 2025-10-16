# Mock Auth Module - Quick Test Guide 🚀

## ✅ Implementation Complete

Mock authentication is now working **without any backend APIs**!

**Build**: 35.48 KB total
- Background: 11.26 KB (includes mock auth + auto-refresh)
- Popup: 13.21 KB (includes mock auth UI)

---

## ⚡ Quick Test (1 Minute)

### 1. Load Extension
```
chrome://extensions
→ Enable Developer mode
→ Load unpacked
→ Select: C:\Snaptools v2.0\snaptools-extention\.output\chrome-mv3\
```

### 2. Check Background Console
```
chrome://extensions → Click "Service worker"
```

**Expected**:
```
SnapTools background running...
```

### 3. Open Popup
Click the SnapTools extension icon.

**Expected (Logged Out)**:
- ❌ Not logged in
- Button: "Fake Login"
- Status badge: "Inactive" (gray)

### 4. Click "Fake Login"

**Expected Background Console**:
```
[Auth] Logged in (mock): potato@snaptools.app
```

**Expected Popup**:
- ✅ Logged in as potato@snaptools.app
- Token expires: 5m (or 4m, depending on timing)
- Button: "Logout"
- Status badge: "Active" (green)

### 5. Close and Reopen Popup
Click outside popup to close, then click icon again.

**Expected**:
- Still shows logged in state
- Token time counts down

### 6. Click "Logout"

**Expected Background Console**:
```
[Auth] Logged out (mock)
```

**Expected Popup**:
- ❌ Not logged in
- Button: "Fake Login"
- Status badge: "Inactive"

---

## 🔄 Auto-Refresh Test

### Test Automatic Token Refresh

1. Click "Fake Login"
2. Wait 5 minutes (token expires in 5 min)
3. Watch background console around 4 minutes

**Expected** (at ~4 min mark):
```
[Auth] Token expired → refreshing...
[Auth] Token refreshed → expiresAt 11:40:30 PM
```

**Popup** (if still open):
- Token expires time resets to 5m

---

## 🧪 Advanced Tests

### Test Storage Persistence

```javascript
// In background console
chrome.storage.local.get('snaptools_auth', (result) => {
  console.log('Stored auth:', result);
});
```

**Expected** (when logged in):
```javascript
{
  snaptools_auth: {
    accessToken: "random123...",
    expiresAt: 1729123456789,
    user: { email: "potato@snaptools.app" }
  }
}
```

### Manually Trigger Refresh

```javascript
// In background console
import { autoRefresh } from '@/modules/auth/mockAuth';
autoRefresh(); // This won't work due to import limitations
```

**Instead**, just wait - it runs every 60 seconds automatically!

### Check Token Expiry

```javascript
// In background console
chrome.storage.local.get('snaptools_auth', (result) => {
  const token = result.snaptools_auth;
  if (token) {
    const now = Date.now();
    const remaining = token.expiresAt - now;
    console.log('Time until expiry:', Math.floor(remaining / 60000), 'minutes');
  }
});
```

---

## 📊 How It Works

### Mock Auth Flow

```
[User Clicks "Fake Login" in Popup]
    ↓
fakeLogin() generates random token
    ↓
Saves to chrome.storage.local
    ↓
Token expires in 5 minutes
    ↓
Background autoRefresh() runs every 60s
    ↓
When < 60s until expiry → generates new token
    ↓
Saves refreshed token (another 5 min)
    ↓
Loop continues...
```

### Auto-Refresh Loop

```
Background Startup
    ↓
autoRefresh() called
    ↓
Check token every 60 seconds
    ↓
If < 60s until expiry:
    ├─ Generate new random token
    ├─ Update expiresAt (+5 min)
    └─ Save to storage
    ↓
Schedule next check (60s)
```

### Storage Structure

```javascript
chrome.storage.local = {
  "snaptools_auth": {
    accessToken: "abc123xyz...",  // Random string
    expiresAt: 1729123456789,     // Unix timestamp (ms)
    user: {
      email: "potato@snaptools.app"
    }
  }
}
```

---

## 🎯 Expected Console Logs

### Background Console Timeline

**T+0s** (On load):
```
SnapTools background running...
```

**T+0s** (If logged in):
```
[Checking for token every 60s...]
```

**T+~4min** (If logged in and token about to expire):
```
[Auth] Token expired → refreshing...
[Auth] Token refreshed → expiresAt 11:45:30 PM
```

### Popup Console

**On open (logged out)**:
```
SnapTools popup mounted
```

**On "Fake Login" click**:
```
[Auth] Logged in (mock): potato@snaptools.app
```

**On "Logout" click**:
```
[Auth] Logged out (mock)
```

---

## 🔍 Troubleshooting

### Popup Shows "Not logged in" After Clicking "Fake Login"

**Check**:
1. Background console for errors
2. Popup console for errors
3. Try closing and reopening popup

**Debug**:
```javascript
// In popup console (after opening popup)
chrome.storage.local.get('snaptools_auth', console.log);
```

### Auto-Refresh Not Working

**Check**:
1. Background console - is it active? (not "Inactive")
2. Click "Service worker" to wake it up if needed
3. Wait for logs every ~60 seconds

### Token Expiry Shows Negative or "Expiring soon" Immediately

The token expires in 5 minutes. If you see this:
- Check system clock is correct
- Refresh might have already run
- Try logging out and back in

---

## 🎨 UI States

### Logged Out
```
┌──────────────────────────┐
│ SnapTools      Inactive  │
├──────────────────────────┤
│ ❌ Not logged in         │
│                          │
│    [Fake Login]          │
└──────────────────────────┘
```

### Logged In
```
┌──────────────────────────┐
│ SnapTools        Active  │
├──────────────────────────┤
│ ✅ Logged in as          │
│ potato@snaptools.app     │
│ Token expires: 5m        │
│              [Logout]    │
├──────────────────────────┤
│ Shortcuts                │
│ No shortcuts configured  │
├──────────────────────────┤
│ Templates                │
│ No templates available   │
└──────────────────────────┘
```

---

## 💡 Key Features

### ✅ Implemented
- **Fake Login**: Generates random token, saves to storage
- **Fake Logout**: Clears token from storage
- **Auto-Refresh**: Runs every 60s, refreshes if < 60s until expiry
- **Persistence**: Token survives popup close, browser restart
- **UI Updates**: Status badge, user email, expiry countdown
- **No Backend**: Works entirely offline

### Token Properties
- **Lifetime**: 5 minutes from creation
- **Refresh**: Automatic when < 60s remaining
- **Email**: Always `potato@snaptools.app` (hardcoded)
- **Access Token**: Random string (e.g., `abc123xyz...`)

---

## 🔄 Upgrade Path to Real Auth

When ready for real backend authentication:

1. **Replace `mockAuth.ts`** with the full auth module (already created)
2. **Update background** to call `initAuthBridge()` instead of `autoRefresh()`
3. **Update popup** to use real auth API instead of mock functions
4. **Connect to backend** endpoints for login/refresh

Or keep both:
- Use mock auth for local development
- Use real auth for production
- Toggle via environment variable

---

## ✅ Verification Checklist

Test these scenarios:

**Basic Flow**:
- [ ] Extension loads without errors
- [ ] Popup shows "Not logged in" initially
- [ ] "Fake Login" button creates token
- [ ] Popup updates to show "Logged in as potato@snaptools.app"
- [ ] Status badge changes to "Active" (green)
- [ ] Token expiry shows "5m" or similar

**Persistence**:
- [ ] Close popup, reopen → still logged in
- [ ] Reload extension → still logged in (check background console)
- [ ] Restart Chrome → still logged in

**Logout**:
- [ ] "Logout" button clears token
- [ ] Popup updates to "Not logged in"
- [ ] Status badge changes to "Inactive"

**Auto-Refresh**:
- [ ] Wait ~4-5 minutes while logged in
- [ ] Background console shows refresh log
- [ ] Token expiry resets to 5m

---

## 🎉 Success!

Mock auth is **fully functional**!

**Quick Test**: Load extension → Open popup → Click "Fake Login" → See ✅ Logged in as potato@snaptools.app

**Auto-refresh**: Leave extension running for 5 minutes and watch the magic! 🪄

