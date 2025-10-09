# PDF Sign Viewer

## Overview
Self-hosted PDF viewer integration for SnapTools Chrome Extension, built on PDF.js.

## Architecture

### Components
- **pdfViewer.ts**: Main PDF viewer class with overlay UI
  - Loads PDF.js from CDN (https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/)
  - Creates full-screen overlay with semi-transparent background
  - Renders PDFs on HTML5 canvas
  - Provides zoom and navigation controls

### Features
- ✅ Full-screen overlay with dark background
- ✅ White container with PDF canvas
- ✅ Close button (×) on top-right
- ✅ Page navigation (Previous/Next)
- ✅ Zoom controls (In/Out)
- ✅ Current page indicator
- ✅ 100% local rendering (no backend APIs)

### Integration
The PDF viewer is triggered when users click the "Sign" button next to Gmail PDF attachments:

1. User clicks "Sign" button
2. Extension extracts PDF URL from Gmail attachment link
3. `PDFViewer.open(pdfUrl)` is called
4. PDF.js loads and renders the PDF
5. User can view, navigate, and zoom the PDF
6. Console logs: `[st-ext] PDF viewer initialized`

### File Structure
```
src/content/pdfsign/
├── viewer/
│   └── pdfViewer.ts    # PDF viewer class
└── README.md           # This file
```

### Usage
```typescript
import { PDFViewer } from './pdfsign/viewer/pdfViewer';

const pdfViewer = new PDFViewer();
await pdfViewer.open('https://example.com/document.pdf');

// Later, to close:
pdfViewer.close();
```

### Permissions Required
The extension manifest requires these host permissions:
- `https://mail.google.com/*` - Gmail integration
- `https://*.googleusercontent.com/*` - Gmail PDF attachments
- `https://cdnjs.cloudflare.com/*` - PDF.js CDN

### Future Enhancements
- [ ] Add signature/annotation tools
- [ ] Add download button
- [ ] Add print functionality
- [ ] Keyboard shortcuts (arrow keys for navigation)
- [ ] Touch gestures for mobile
- [ ] Text selection and search
- [ ] Thumbnail view for page navigation

