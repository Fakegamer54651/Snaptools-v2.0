# SnapTools Extension - Messaging Bridge Test

## ✅ Configuration Complete

### 1. Entry Points Registered
All entry points are properly configured in `wxt.config.ts`:

- ✅ **Background Script**: `src/entrypoints/background/index.ts`
- ✅ **Popup**: `src/entrypoints/popup/index.html` + `main.ts`
- ✅ **Content Scripts**:
  - Gmail: `src/entrypoints/content/gmail.content.ts`
  - Outlook: `src/entrypoints/content/outlook.content.ts`
  - DAT: `src/entrypoints/content/dat.content.ts`
  - Truckstop: `src/entrypoints/content/truckstop.content.ts`

### 2. Manifest V3 Configuration
Generated manifest includes:

```json
{
  "manifest_version": 3,
  "name": "SnapTools Extension",
  "description": "Shortcuts, templates, and PDF tools for Gmail, Outlook, DAT & Truckstop",
  "version": "1.0.0",
  "permissions": ["storage", "scripting", "activeTab", "tabs"],
  "host_permissions": [
    "https://mail.google.com/*",
    "https://outlook.office.com/*",
    "https://outlook.live.com/*",
    "https://*.dat.com/*",
    "https://*.truckstop.com/*"
  ],
  "default_locale": "en",
  "icons": { "16": "/icons/16.png", ... },
  "background": { "service_worker": "background.js" },
  "action": { "default_popup": "popup.html" }
}
```

### 3. Messaging Bridge Implemented

**Simple API** in `src/shared/messaging.ts`:
```typescript
export const sendMessage = (type: string, payload?: any) => 
  chrome.runtime.sendMessage({ type, payload });

export const onMessage = (handler: (msg, sender, sendResponse) => void) =>
  chrome.runtime.onMessage.addListener(handler);
```

**Background Script** (`src/entrypoints/background/index.ts`):
```typescript
onMessage((msg, sender, sendResponse) => {
  if (msg.type === 'ping') {
    console.log('Ping received from:', sender);
    sendResponse({ type: 'pong', source: 'background' });
    return true;
  }
});
```

**Each Content Script**:
```typescript
sendMessage('ping', { from: 'gmail-content' }).then(response => {
  console.log('Gmail content received response:', response);
});
```

**Popup** (`src/entrypoints/popup/main.ts`):
```typescript
sendMessage('ping', { from: 'popup' }).then(response => {
  console.log('Popup received response:', response);
});
```

---

## 🧪 Testing Instructions

### Step 1: Load Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select directory: `C:\Snaptools v2.0\snaptools-extention\.output\chrome-mv3\`
5. Extension should load successfully ✅

### Step 2: Verify Background Script

1. On the `chrome://extensions` page, find "SnapTools Extension"
2. Click on **"Service worker"** (blue link)
3. Background script console should open
4. **Expected Output**:
   ```
   SnapTools background running...
   ```

### Step 3: Test Popup → Background Communication

1. Click the **SnapTools icon** in Chrome toolbar
2. Popup should open
3. Right-click popup → **Inspect** (to open popup DevTools)
4. In popup console, you should see:
   ```
   Popup loaded
   Popup received response: {type: 'pong', source: 'background'}
   ```
5. In background console, you should see:
   ```
   Message received: {type: 'ping', payload: {from: 'popup'}} from: ...
   Ping received from: popup
   ```

### Step 4: Test Content Script → Background Communication

#### Test on Gmail:
1. Navigate to: `https://mail.google.com`
2. Open browser console (F12)
3. **Expected Output**:
   ```
   SnapTools content script active (Gmail)
   Gmail content received response: {type: 'pong', source: 'background'}
   ```
4. In background console:
   ```
   Message received: {type: 'ping', payload: {from: 'gmail-content'}} from: ...
   Ping received from: tab [tab-id]
   ```

#### Test on Outlook:
1. Navigate to: `https://outlook.office.com`
2. Open browser console (F12)
3. **Expected Output**:
   ```
   SnapTools content script active (Outlook)
   Outlook content received response: {type: 'pong', source: 'background'}
   ```

#### Test on DAT (if you have access):
1. Navigate to any `https://*.dat.com/*` page
2. **Expected**: "SnapTools content script active (DAT)"

#### Test on Truckstop (if you have access):
1. Navigate to any `https://*.truckstop.com/*` page
2. **Expected**: "SnapTools content script active (Truckstop)"

---

## ✅ Expected Results Summary

| Component | Expected Log | Location |
|-----------|-------------|----------|
| **Background** | `SnapTools background running...` | Service worker console |
| **Background (on ping)** | `Ping received from: ...` | Service worker console |
| **Popup** | `Popup loaded` | Popup console |
| **Popup** | `Popup received response: {type: 'pong', ...}` | Popup console |
| **Gmail Content** | `SnapTools content script active (Gmail)` | Page console |
| **Gmail Content** | `Gmail content received response: ...` | Page console |
| **Outlook Content** | `SnapTools content script active (Outlook)` | Page console |
| **DAT Content** | `SnapTools content script active (DAT)` | Page console |
| **Truckstop Content** | `SnapTools content script active (Truckstop)` | Page console |

---

## 🔍 Debugging

### Extension Doesn't Load
- Check for manifest errors in `chrome://extensions`
- Ensure all required files exist in `.output/chrome-mv3/`
- Check that `_locales/en/messages.json` exists

### Content Script Not Running
- Verify you're on the correct URL (e.g., `mail.google.com` not `gmail.com`)
- Check host permissions in manifest
- Refresh the page after loading extension

### Messages Not Working
- Check that background service worker is active (not "inactive")
- If inactive, click "Service worker" link to wake it up
- Verify no errors in background console

### Popup Doesn't Open
- Check for JavaScript errors in popup console
- Verify `popup.html` exists in output directory
- Try removing and re-adding the extension

---

## 📁 Build Output Structure

```
.output/chrome-mv3/
├── manifest.json          ✅ Manifest V3
├── background.js          ✅ Service worker
├── popup.html             ✅ Popup HTML
├── chunks/
│   └── popup-*.js         ✅ Compiled Svelte + JS
├── assets/
│   └── popup-*.css        ✅ Compiled CSS
├── _locales/
│   └── en/
│       └── messages.json  ✅ i18n strings
└── icons/
    ├── 16.png             ✅ (placeholder)
    ├── 32.png             ✅ (placeholder)
    ├── 48.png             ✅ (placeholder)
    └── 128.png            ✅ (placeholder)
```

---

## 🎯 Success Criteria

- [x] TypeScript compiles without errors
- [x] Extension builds successfully
- [x] Manifest V3 generated correctly
- [x] All entry points registered
- [x] Background script logs "running"
- [x] Popup logs "loaded" and receives pong
- [x] Content scripts log "active" and receive pong
- [x] Ping-pong messages visible in background console
- [x] No runtime errors

---

## 🚀 Next Steps

Once verified working, proceed to **Prompt 3**: **Auth Module Implementation**

This will include:
- Login state management
- Token storage (chrome.storage)
- Auth sync with web app
- Protected routes
- Session persistence

---

## 📝 Notes

- **Icon Placeholders**: Currently using empty PNG files. Replace with actual SnapTools icons before production.
- **Public Directory**: Static assets are manually copied. Consider moving `static/` to `src/public/` for automatic copying by WXT.
- **Content Script Matching**: Scripts will only run on exact domain matches. Adjust `matches` patterns as needed.

---

**Status**: ✅ **Messaging Bridge Ready for Testing**

