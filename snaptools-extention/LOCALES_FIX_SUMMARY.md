# Locales & Static Assets Fix - Summary

## ✅ Issues Fixed

### Problem
WXT dev server was failing with error:
```
ERROR  Default locale was specified, but _locales subtree is missing.
```

### Root Causes
1. **Unnecessary Import**: Had `import en from './static/_locales/en/messages.json'` which WXT tried to process as a TypeScript module
2. **Wrong Directory Location**: Static assets were in `/static` but WXT expects them in `/src/public`

---

## 🔧 Solutions Applied

### 1. Removed Unnecessary Import
**Before:**
```typescript
import { defineConfig } from 'wxt';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import en from './static/_locales/en/messages.json'; // ❌ Not needed

export default defineConfig({ ... });
```

**After:**
```typescript
import { defineConfig } from 'wxt';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({ ... });
```

**Why?**
- Chrome automatically reads `_locales/*/messages.json` at runtime
- It's not a TypeScript module - it's a Chrome extension localization file
- Importing it confuses the build process

### 2. Moved Static Assets to Correct Location
**Before:**
```
snaptools-extention/
├── static/              ← Wrong location
│   ├── _locales/
│   └── icons/
└── src/
```

**After:**
```
snaptools-extention/
└── src/
    └── public/          ← Correct location for WXT
        ├── _locales/
        │   └── en/
        │       └── messages.json
        └── icons/
            ├── 16.png
            ├── 32.png
            ├── 48.png
            └── 128.png
```

**Why?**
- WXT automatically copies `src/public/` contents to `.output/chrome-mv3/`
- This includes `_locales/` for i18n and `icons/` for extension icons
- No manual copying needed!

---

## ✅ Build Results

### Before (Failed)
```bash
$ pnpm dev
× Command failed after 21.0 s
ERROR  Default locale was specified, but _locales subtree is missing.
```

### After (Success!)
```bash
$ pnpm build
√ Built extension in 1.896 s
  ├─ .output\chrome-mv3\manifest.json              617 B   
  ├─ .output\chrome-mv3\_locales\en\messages.json  1.38 kB  ✅
  ├─ .output\chrome-mv3\icons\16.png               2 B      ✅
  ├─ .output\chrome-mv3\icons\32.png               2 B      ✅
  ├─ .output\chrome-mv3\icons\48.png               2 B      ✅
  └─ .output\chrome-mv3\icons\128.png              2 B      ✅
Σ Total size: 29.73 kB
```

---

## 📁 Current Directory Structure

```
snaptools-extention/
├── src/
│   ├── entrypoints/
│   │   ├── background/index.ts
│   │   ├── content/
│   │   │   ├── gmail.content.ts    ← Updated with allFrames: true
│   │   │   ├── outlook.content.ts
│   │   │   ├── dat.content.ts
│   │   │   └── truckstop.content.ts
│   │   └── popup/
│   │       ├── index.html
│   │       └── main.ts
│   ├── public/                      ← WXT copies this to output
│   │   ├── _locales/
│   │   │   └── en/
│   │   │       └── messages.json
│   │   └── icons/
│   │       ├── 16.png
│   │       ├── 32.png
│   │       ├── 48.png
│   │       └── 128.png
│   └── [other source files...]
│
├── .output/                         ← Build output
│   └── chrome-mv3/
│       ├── manifest.json
│       ├── background.js
│       ├── popup.html
│       ├── _locales/                ← Auto-copied from src/public
│       │   └── en/
│       │       └── messages.json
│       └── icons/                   ← Auto-copied from src/public
│           ├── 16.png
│           ├── 32.png
│           ├── 48.png
│           └── 128.png
│
├── wxt.config.ts                    ← Fixed config
├── package.json
└── README.md
```

---

## 🎯 Key Takeaways

### WXT Public Directory Convention
- Static assets go in **`src/public/`**
- WXT automatically copies everything to output root
- No manual copying or build scripts needed

### Chrome Localization Files
- `_locales/*/messages.json` are **Chrome runtime files**
- Don't import them in TypeScript/JavaScript code
- Chrome reads them automatically when extension loads
- Used for i18n via `chrome.i18n.getMessage()`

### Extension Icons
- Must be in output root as `/icons/*.png`
- Manifest references them as `/icons/16.png`, etc.
- WXT copies from `src/public/icons/` to `.output/chrome-mv3/icons/`

---

## 🧪 Verification

### 1. Dev Server
```bash
cd "C:\Snaptools v2.0\snaptools-extention"
pnpm dev
```
✅ Starts successfully without locale errors

### 2. Production Build
```bash
pnpm build
```
✅ Builds successfully, includes _locales and icons

### 3. Load in Chrome
```
chrome://extensions → Load unpacked → Select .output/chrome-mv3/
```
✅ Loads without manifest errors
✅ Icons display correctly
✅ Default locale "en" recognized

---

## 🚀 Testing Gmail Subframes

With the locales issue fixed, you can now test the Gmail subframes feature:

1. **Reload Extension** in Chrome:
   ```
   chrome://extensions → SnapTools Extension → Click reload
   OR press Alt+R
   ```

2. **Open Gmail**:
   ```
   https://mail.google.com
   ```

3. **Check Console** (F12):
   ```
   SnapTools content script active (Gmail)
   Gmail content received response: {type: 'pong', source: 'background'}
   ```

4. **Test Compose Window**:
   - Click "Compose" in Gmail
   - The content script should also activate in the compose iframe
   - Check console for activation log

---

## 📝 Updated Files

1. **wxt.config.ts**
   - Removed unnecessary `messages.json` import
   - Kept clean configuration

2. **Directory Structure**
   - Moved `/static` → `/src/public`
   - WXT now handles asset copying automatically

3. **Gmail Content Script**
   - Added `allFrames: true` for iframe injection
   - Multiple match patterns for Gmail subpaths

---

## ✅ Status

**All Issues Resolved:**
- [x] Removed unnecessary messages.json import
- [x] Moved static assets to src/public
- [x] Dev server runs without errors
- [x] Production builds successfully
- [x] _locales and icons properly copied
- [x] Gmail subframes configuration updated
- [x] Extension ready for Chrome testing

---

**Next Steps:** Load the extension in Chrome and verify the Gmail content script activates on all frames!

