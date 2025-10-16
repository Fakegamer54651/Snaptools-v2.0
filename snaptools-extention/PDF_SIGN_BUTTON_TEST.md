# PDF Sign Button - Testing Guide 📄✍️

## ✅ Implementation Complete

The "Sign PDF" button injection for Gmail is now fully implemented!

**Build Results**:
- Gmail content script: **7.25 kB** (up from 924 B)
- Background: 11.58 kB (includes PDF message handler)
- Total: 42.13 kB

---

## 🎯 What Was Implemented

### Features
- ✅ **PDF Detection**: Finds PDF attachments using multiple strategies
- ✅ **Sign Button**: Injects 32×32 transparent button with pen icon
- ✅ **URL Extraction**: Finds download URLs from Gmail's dynamic structure
- ✅ **Message Sending**: Sends `PDF_SIGN_REQUEST` to background
- ✅ **Dedupe Protection**: Prevents duplicate button injection
- ✅ **MutationObserver**: Watches for dynamic Gmail content
- ✅ **Non-invasive**: Doesn't modify Gmail's existing elements

### Detection Strategies

**1. Accessibility selectors** (preferred):
- `[aria-label*="Download"]`
- `[role="button"][aria-label*="download"]`

**2. Gmail class selectors** (fallback):
- `div.aYp`, `div.aQw`, `div.a12`, `div.aSH`, `div.aZo`

**3. Image-based detection**:
- `img[src*="view=snatt"]` - Preview thumbnails
- `img[src*="attid="]` - Attachment IDs
- `img[src*=".pdf"]` - PDF images

**4. Link-based detection**:
- `a[href*="export=download"]` - Download links
- `a[href*="attid="]` - Attachment links

### URL Extraction Priorities

1. Direct download link: `a[href*="export=download"]`
2. Attachment link: `a[href*="attid="]` (converts to download URL)
3. Parent anchor: Closest `a[href]` with attachment indicators
4. Image source: Converts preview URL to download URL

---

## 🧪 Testing Instructions

### Step 1: Load Extension

```
chrome://extensions
→ Enable Developer mode
→ Load unpacked
→ Select: C:\Snaptools v2.0\snaptools-extention\.output\chrome-mv3\
```

### Step 2: Open Gmail with PDF Attachment

**Option A: Use Test Email**
1. Go to `https://mail.google.com`
2. Send yourself an email with a PDF attachment
3. Open that email

**Option B: Search for PDF**
1. In Gmail search: `has:attachment filename:pdf`
2. Open an email with PDF attachment

### Step 3: Check for Injected Button

**Expected**: Near the download button for the PDF, you should see:
- 📝 A small **pen icon** (20×20 px, gray)
- On hover: Light gray background
- Tooltip: "Sign this PDF with SnapTools"

**Console Logs** (Gmail page console):
```
SnapTools content script active (Gmail)
[SnapTools Gmail] Initializing PDF button injection...
[SnapTools Gmail] PDF button injection initialized
[SnapTools Gmail] Injected sign button for attachment {url: "..."}
```

### Step 4: Click the Sign Button

**Expected Gmail Console**:
```
[SnapTools Gmail] Sign button clicked — sending URL https://mail.google.com/...
[SnapTools Gmail] PDF_SIGN_REQUEST sent {success: true, message: "PDF sign request received"}
```

**Expected Background Console**:
```
Message received: {type: 'PDF_SIGN_REQUEST', payload: {url: 'https://...'}} from: {tab: ...}
PDF Sign Request received: {url: 'https://...'}
PDF URL to sign: https://mail.google.com/mail/u/0/?...&export=download
```

### Step 5: Verify Button Behavior

**Click the button** and check:
- [ ] Gmail's default action is prevented (doesn't download)
- [ ] Button stays in place (no navigation)
- [ ] Background receives PDF_SIGN_REQUEST message
- [ ] Background logs the PDF URL

---

## 🔍 What to Look For

### Visual Indicator

The injected button should appear:
- **Near download button**: Same row or nearby
- **Size**: 32×32 pixels
- **Icon**: Gray pen/pencil SVG
- **Hover effect**: Light gray background on mouseover
- **Cursor**: Changes to pointer

### Console Logs

**Gmail Page Console** (successful injection):
```
[SnapTools Gmail] Initializing PDF button injection...
[SnapTools Gmail] Injected sign button for attachment {url: "https://..."}
[SnapTools Gmail] PDF button injection initialized
```

**Gmail Page Console** (button click):
```
[SnapTools Gmail] Sign button clicked — sending URL https://mail.google.com/...
[SnapTools Gmail] PDF_SIGN_REQUEST sent {success: true, ...}
```

**Background Console**:
```
PDF Sign Request received: {url: "https://...", reason: undefined}
PDF URL to sign: https://mail.google.com/mail/u/0/?ui=2&ik=...&attid=...&export=download
```

---

## 🐛 Troubleshooting

### Button Doesn't Appear

**Check**:
1. **Console logs**: Look for "Initializing PDF button injection" in Gmail console
2. **PDF detected**: Console should show "Injected sign button" only for PDFs
3. **Gmail classes changed**: Gmail may have updated their class names

**Debug**:
```javascript
// In Gmail console
document.querySelectorAll('[aria-label*="Download"]').length
// Should return > 0 if attachments exist

document.querySelectorAll('[data-snaptools-injected="1"]').length
// Shows how many buttons were injected
```

### Button Appears But No URL

**Expected behavior**: Button still works, but background receives:
```javascript
{
  type: 'PDF_SIGN_REQUEST',
  payload: {
    url: null,
    reason: 'notFound'
  }
}
```

**Console Log**:
```
[SnapTools Gmail] Sign button clicked — sending URL none found
PDF URL not found, reason: notFound
```

### Multiple Buttons on Same Attachment

**Should not happen** due to dedupe logic:
- Checks for `[data-snaptools-injected="1"]` before injecting
- Only injects once per container

**If happening**:
- Gmail may be re-rendering the container
- MutationObserver runs again
- Dedupe should still prevent duplicates

### Button Doesn't Click

**Check**:
1. Console for JavaScript errors
2. Verify `evt.stopPropagation()` and `evt.preventDefault()` are working
3. Check if Gmail's event handlers are blocking

**Debug in Gmail console**:
```javascript
document.querySelector('.snaptools-sign-btn')?.addEventListener('click', (e) => {
  console.log('Button clicked!', e);
});
```

---

## 📊 URL Extraction Examples

### Gmail Attachment URLs

**Direct Download**:
```
https://mail.google.com/mail/u/0/?ui=2&ik=...&attid=0.1&export=download
```

**Preview URL** (converted):
```
Before: https://mail.google.com/mail/u/0/?ui=2&attid=0.1&view=att
After:  https://mail.google.com/mail/u/0/?ui=2&attid=0.1&view=att&disp=safe&export=download
```

**Image Preview** (converted):
```
Before: https://mail.google.com/mail/u/0/?...&view=snatt&attid=0.1
After:  https://mail.google.com/mail/u/0/?...&export=download&attid=0.1
```

---

## 🎨 Button Visual

The injected button looks like this:

```
┌─────┐
│  📝 │  ← Pen icon (gray #5f6368)
└─────┘
32×32px
Transparent background
Hover: rgba(0,0,0,0.05)
```

**CSS Applied**:
```css
.snaptools-sign-btn {
  width: 32px;
  height: 32px;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}
```

---

## 🔬 Testing Scenarios

### Scenario 1: Single PDF Attachment
1. Email with one PDF attached
2. **Expected**: One sign button appears
3. Click it → Background receives URL

### Scenario 2: Multiple PDF Attachments
1. Email with 3 PDF files attached
2. **Expected**: Three sign buttons appear (one per PDF)
3. Click each → Each sends its own URL

### Scenario 3: Non-PDF Attachments
1. Email with .docx, .xlsx, .jpg files
2. **Expected**: No sign buttons appear
3. Only PDFs get the button

### Scenario 4: Mixed Attachments
1. Email with 1 PDF + 2 images + 1 Word doc
2. **Expected**: Only the PDF gets a sign button

### Scenario 5: Dynamic Loading
1. Open email with PDF
2. **Expected**: Button appears immediately
3. Scroll down/up (Gmail may lazy-load)
4. Button should persist (dedupe prevents duplicates)

### Scenario 6: Compose with Attachment
1. Click "Compose" in Gmail
2. Attach a PDF file
3. **Expected**: Sign button appears in compose window
4. (Works because `all_frames: true` is set)

---

## 🧩 Integration Points

### Background Handler

Currently logs the URL and responds:
```typescript
if (msg.type === 'PDF_SIGN_REQUEST') {
  console.log('PDF URL to sign:', url);
  // TODO: Open PDF signing modal
  // TODO: Fetch PDF and prepare for signing
  sendResponse({ success: true, message: 'PDF sign request received' });
}
```

### Next Steps (Future Implementation)

1. **Fetch PDF**: Download the PDF from the URL
2. **Open Modal**: Show PDF signing UI (Svelte modal)
3. **Signature Placement**: Let user click to place signature
4. **Save Signed PDF**: Upload or download signed version

---

## 📝 Code Statistics

**Gmail Content Script**:
- Lines: ~310 (TypeScript) / ~240 (JavaScript)
- Functions: 7 main functions
- Detection strategies: 4 different approaches
- Dedupe mechanisms: 2 (attribute check + set tracking)

**Functions**:
1. `safeLog()` - Prefixed logging
2. `createSignButton()` - Creates styled button with icon
3. `findAttachmentContainers()` - Finds all attachment elements
4. `guessDownloadUrlFromContainer()` - Extracts URL from element
5. `isPdfAttachment()` - Filters for PDF files only
6. `injectSignButton()` - Injects button into container
7. `injectButtons()` - Scans and injects all buttons
8. `initPdfButtonInjection()` - Sets up MutationObserver

---

## ✅ Verification Checklist

**Gmail Console**:
- [ ] "SnapTools content script active (Gmail)"
- [ ] "[SnapTools Gmail] Initializing PDF button injection..."
- [ ] "[SnapTools Gmail] PDF button injection initialized"
- [ ] On PDF email: "Injected sign button for attachment"

**Visual**:
- [ ] Pen icon appears near PDF download button
- [ ] Button is 32×32 px
- [ ] Hover shows light gray background
- [ ] Cursor changes to pointer on hover

**Functionality**:
- [ ] Click button → No navigation/download
- [ ] Click button → Console shows "Sign button clicked"
- [ ] Background receives PDF_SIGN_REQUEST message
- [ ] Background logs PDF URL

**Dedupe**:
- [ ] Only one button per PDF attachment
- [ ] Scrolling doesn't create duplicates
- [ ] Re-opening email doesn't duplicate buttons

**Dynamic Content**:
- [ ] MutationObserver detects new attachments
- [ ] Buttons appear on lazy-loaded content
- [ ] Works in compose window iframes

---

## 🚀 Ready to Test!

**Load the extension** → **Open Gmail** → **Find email with PDF** → **Look for pen icon!**

If you don't have a PDF email, send one to yourself or search: `has:attachment filename:pdf`

The button should appear automatically within 1-2 seconds of opening the email! ✍️

