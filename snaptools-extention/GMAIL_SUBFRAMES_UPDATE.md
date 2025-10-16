# Gmail Subframes Configuration - Update Complete

## ✅ Changes Made

### Updated: `src/entrypoints/content/gmail.content.ts`

Modified the Gmail content script configuration to inject into all Gmail subframes:

```typescript
export default defineContentScript({
  matches: [
    'https://mail.google.com/*',
    'https://mail.google.com/mail/*',
    'https://mail.google.com/mail/u/*'
  ],
  allFrames: true,  // ← Added this
  main() {
    bootstrap();
  },
});
```

### What Changed

1. **Multiple Match Patterns**: Added specific patterns for Gmail subpaths
   - `https://mail.google.com/*` - Main domain
   - `https://mail.google.com/mail/*` - Mail interface
   - `https://mail.google.com/mail/u/*` - Multi-account paths (u/0, u/1, etc.)

2. **All Frames Enabled**: Added `allFrames: true` to inject into:
   - Main page
   - iframes (compose windows, previews)
   - All nested frames within Gmail

---

## 🧪 Testing Instructions

### Step 1: Reload the Extension

The dev server is currently running. To apply changes:

1. Go to `chrome://extensions`
2. Find "SnapTools Extension"
3. Click the **reload icon** (circular arrow)
   - OR press **Alt+R** while on any page (WXT dev shortcut)

### Step 2: Open Gmail

1. Navigate to `https://mail.google.com`
2. Log in to your Gmail account
3. Open the browser console (F12 or Right-click → Inspect)

### Step 3: Verify Console Output

You should see in the console:

```
SnapTools content script active (Gmail)
Gmail content received response: {type: 'pong', source: 'background'}
```

### Step 4: Test in Different Gmail Contexts

The content script should now activate in:

✅ **Main Gmail page**: `https://mail.google.com`
✅ **Inbox view**: `https://mail.google.com/mail/u/0/#inbox`
✅ **Compose window** (opens in iframe)
✅ **Email preview panes** (may use iframes)
✅ **Multiple accounts**: `https://mail.google.com/mail/u/1/`, `u/2/`, etc.

**Test each by**:
- Opening console
- Looking for "SnapTools content script active (Gmail)"
- Checking that the message appears in ALL frames (not just once)

---

## 🔍 Debugging

### Content Script Not Appearing

1. **Check Extension is Loaded**:
   ```
   chrome://extensions → SnapTools Extension → Enabled ✅
   ```

2. **Verify Service Worker is Active**:
   - Click "Service worker" link
   - Should see: "SnapTools background running..."

3. **Check for Errors**:
   - Open console on Gmail page
   - Look for any red errors
   - Check background console for errors

4. **Hard Refresh**:
   - On Gmail, press `Ctrl+Shift+R` (hard refresh)
   - This clears cache and reloads all scripts

### Script Runs But Not in Subframes

If you see the log only once but not in compose windows:

1. **Verify allFrames in Manifest**:
   ```bash
   # Check the manifest
   cat .output/chrome-mv3/manifest.json
   ```
   Look for `"all_frames": true` in content_scripts

2. **Compose Window Test**:
   - Click "Compose" in Gmail
   - Open console in the compose iframe specifically
   - Should see the activation log there too

### Multiple Accounts Test

If using multiple Gmail accounts:

1. Switch to account 0: `https://mail.google.com/mail/u/0/`
2. Switch to account 1: `https://mail.google.com/mail/u/1/`
3. Each should log the activation message

---

## 📦 Current Dev Server Status

The WXT dev server is running with:
- **Hot reload**: Enabled (changes auto-update)
- **Reload shortcut**: Alt+R
- **Dev server**: http://localhost:3000
- **Output**: `.output/chrome-mv3/`

To stop the dev server:
```bash
# Press Ctrl+C in the terminal where it's running
```

To restart:
```bash
cd "C:\Snaptools v2.0\snaptools-extention"
pnpm dev
```

---

## 🎯 Expected Behavior

### Single Frame (Normal Page)
```
Console Output:
  SnapTools content script active (Gmail)
  Gmail content received response: {type: 'pong', source: 'background'}
```

### Multiple Frames (Compose Open)
```
Main Frame Console:
  SnapTools content script active (Gmail)
  Gmail content received response: {type: 'pong', source: 'background'}

Compose Frame Console (if inspected separately):
  SnapTools content script active (Gmail)
  Gmail content received response: {type: 'pong', source: 'background'}
```

### Background Console
```
SnapTools background running...
Message received: {type: 'ping', payload: {from: 'gmail-content'}} from: ...
Ping received from: tab X
[May appear multiple times if multiple frames]
```

---

## ⚙️ Technical Details

### Why `allFrames: true`?

Gmail uses iframes extensively:
- **Compose windows**: Open in iframes
- **Preview panes**: May use iframes
- **Chat**: Uses iframes
- **Google Meet integration**: Uses iframes

Without `allFrames: true`, the content script only runs in the main frame, missing compose windows and other interactive areas.

### Match Pattern Coverage

| Pattern | Matches |
|---------|---------|
| `https://mail.google.com/*` | Main domain, any path |
| `https://mail.google.com/mail/*` | Mail interface (most common) |
| `https://mail.google.com/mail/u/*` | Multi-account paths |

These patterns ensure coverage of:
- Single account: `mail.google.com/mail/u/0/`
- Multiple accounts: `mail.google.com/mail/u/1/`, `u/2/`, etc.
- Direct paths: `mail.google.com/mail/`
- Root: `mail.google.com/`

---

## ✅ Verification Checklist

After reloading the extension in Chrome:

- [ ] Extension shows as active in `chrome://extensions`
- [ ] Background console shows "SnapTools background running..."
- [ ] Gmail main page console shows "SnapTools content script active (Gmail)"
- [ ] Ping-pong messages appear in background console
- [ ] Open compose window - script activates there too
- [ ] Test with different Gmail accounts (u/0, u/1, etc.)
- [ ] No errors in any console

---

## 🚀 Next Steps

Once verified working:

1. **Test other content scripts**: Outlook, DAT, Truckstop
2. **Implement feature hooks**: Start building actual functionality
3. **Add mutation observers**: Detect compose windows dynamically
4. **Implement replacer module**: Add slash shortcuts
5. **Add template insertion**: Gmail-specific UI injection

---

**Status**: ✅ **Configuration Updated - Ready for Testing**

The Gmail content script now has:
- ✅ Multiple match patterns for Gmail paths
- ✅ `allFrames: true` for iframe injection
- ✅ Proper ping-pong messaging
- ✅ Console logging for verification

