// Content script for SnapTools Minimal
// Temporarily disabled: PDF viewer integration
// import { PDFViewer } from './pdfsign/viewer/pdfViewer';

console.log('[st-ext] content script loaded successfully', window.location.href);

// Track processed containers to avoid duplicates
const processedContainers = new WeakSet<Element>();
const processedIframes = new WeakSet<HTMLIFrameElement>();

// Throttle mechanism for observer callbacks
let lastScanTime = 0;
const SCAN_THROTTLE_MS = 3000; // 3 seconds

// Temporarily disabled: PDF viewer instance
// const pdfViewer = new PDFViewer();

// Gmail PDF sign button injection
if (window.location.hostname === 'mail.google.com') {
  console.log('[st-ext] Gmail detected');
  initPdfSignButtons();
}

function initPdfSignButtons() {
  console.log("[st-ext] PDF Sign injector active");

  // Initial scan
  scanDocumentForPDFs(document);
  scanIframes();

  // Set up throttled global MutationObserver
  const globalObserver = new MutationObserver(() => {
    const now = Date.now();
    if (now - lastScanTime < SCAN_THROTTLE_MS) {
      return; // Skip if within throttle period
    }
    lastScanTime = now;

    scanDocumentForPDFs(document);
    scanIframes();
  });

  globalObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function scanIframes() {
  const iframes = document.querySelectorAll('iframe');
  
  iframes.forEach((iframe) => {
    // Skip if already processed
    if (processedIframes.has(iframe)) {
      return;
    }

    try {
      // Try to access iframe content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Check if this is a Gmail message iframe
        const src = iframe.src || '';
        if (src.includes('/mail/') || iframeDoc.body) {
          console.log('[st-ext] Gmail iframe detected');
          processedIframes.add(iframe);

          // Scan for PDFs inside iframe
          scanDocumentForPDFs(iframeDoc);

          // Watch for changes inside iframe (throttled)
          let lastIframeScanTime = 0;
          const iframeObserver = new MutationObserver(() => {
            const now = Date.now();
            if (now - lastIframeScanTime < SCAN_THROTTLE_MS) {
              return;
            }
            lastIframeScanTime = now;
            scanDocumentForPDFs(iframeDoc);
          });

          iframeObserver.observe(iframeDoc.body, {
            childList: true,
            subtree: true,
          });
        }
      }
    } catch (e) {
      // Cross-origin iframe, skip
    }
  });
}

function scanDocumentForPDFs(doc: Document) {
  // Look for PDF links and attachments with multiple selectors
  const pdfSelectors = [
    'a[href*=".pdf"]',
    'a[download*=".pdf"]',
    '[aria-label*=".pdf"]',
    '[data-tooltip*=".pdf"]',
    '[title*=".pdf"]',
    'div[role="link"][data-tooltip*="Download"]',
    '[aria-label*="Download"]',
  ];

  pdfSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);

    elements.forEach((element) => {
      processPDFElement(element, doc);
    });
  });

  // Also scan shadow roots
  scanShadowRoots(doc.body);
}

function scanShadowRoots(root: Element) {
  if (!root) return;

  // Check if this element has shadow root
  if (root.shadowRoot) {
    console.log('[st-ext] Shadow root detected, scanning...');
    scanDocumentForPDFs(root.shadowRoot as any);
  }

  // Recursively scan children
  const children = root.querySelectorAll('*');
  children.forEach((child) => {
    if (child.shadowRoot) {
      console.log('[st-ext] Shadow root detected in child, scanning...');
      scanDocumentForPDFs(child.shadowRoot as any);
    }
  });
}

function processPDFElement(element: Element, doc: Document) {
  // Find the attachment container
  const container = element.closest('div[role="group"], div.aQH, div.aZo, div[role="button"], .aQH, .aZo') 
    || element.parentElement;
  
  if (!container) return;

  // Skip if already processed
  if (processedContainers.has(container)) {
    return;
  }

  // Mark as processed
  processedContainers.add(container);

  // Try to inject button
  injectSignButtonForContainer(container, element, doc);
}

function injectSignButtonForContainer(container: Element, pdfElement: Element, doc: Document) {
  // Look for action bar inside container
  const actionBar = container.querySelector('.aQw') 
    || container.querySelector('[role="toolbar"]')
    || container.querySelector('.aQH');

  if (!actionBar) {
    // Try to find a suitable place to inject
    const driveButton = container.querySelector('[aria-label*="Drive"], [data-tooltip*="Drive"]');
    if (driveButton && driveButton.parentElement) {
      injectSignButton(driveButton.parentElement, pdfElement, doc);
      return;
    }
    return;
  }

  // Check if button already exists
  if (actionBar.querySelector('.st-sign-btn, [data-snaptools-sign="true"]')) {
    return;
  }

  injectSignButton(actionBar, pdfElement, doc);

  // Set up throttled observer for this container
  let lastContainerScanTime = 0;
  const observer = new MutationObserver(() => {
    const now = Date.now();
    if (now - lastContainerScanTime < SCAN_THROTTLE_MS) {
      return;
    }
    lastContainerScanTime = now;

    const actionBar = container.querySelector('.aQw');
    if (actionBar && !actionBar.querySelector('.st-sign-btn, [data-snaptools-sign="true"]')) {
      injectSignButton(actionBar, pdfElement, doc);
    }
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });
}

function injectSignButton(parent: Element, pdfElement: Element, doc: Document) {
  // Get filename
  const fileName = getFileName(pdfElement);

  // Create button
  const btn = doc.createElement('button');
  btn.className = 'st-sign-btn';
  btn.textContent = '✍️ Sign';
  btn.dataset.snaptoolsSign = 'true';
  btn.setAttribute('title', 'Sign PDF');
  btn.style.cssText = `
    background: #f1f3f4;
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    margin-left: 6px;
    color: #202124;
    font-family: Google Sans, Roboto, Arial, sans-serif;
  `;

  btn.addEventListener('mouseenter', () => btn.style.background = '#e8eaed');
  btn.addEventListener('mouseleave', () => btn.style.background = '#f1f3f4');

  // Add click handler
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`[st-ext] Sign button clicked for: ${fileName}`);
    
    // Get PDF URL with improved detection
    const pdfUrl = getPDFUrl(pdfElement);
    
    if (pdfUrl) {
      console.log(`[st-ext] Found PDF attachment: ${pdfUrl}`);
      console.log(`[st-ext] Opening popup for PDF`);
      
      // Open popup window
      window.open(
        chrome.runtime.getURL('popup/popup.html') + '?pdf=' + encodeURIComponent(pdfUrl),
        '_blank',
        'width=800,height=600,noopener,noreferrer'
      );
    } else {
      console.log('[st-ext] PDF link not found for this attachment.');
    }
  });

  // Append button
  parent.appendChild(btn);

  console.log(`[st-ext] Added Sign button next to Add to Drive`);
}

function getPDFUrl(element: Element): string | null {
  // Strategy 1: Direct href attribute
  const href = element.getAttribute('href');
  if (href && href.includes('.pdf')) {
    return href.startsWith('http') ? href : window.location.origin + href;
  }

  // Strategy 2: Find closest <a> tag
  const link = element.closest('a');
  if (link && link instanceof HTMLAnchorElement && link.href) {
    if (link.href.includes('.pdf') || link.download) {
      return link.href;
    }
  }

  // Strategy 3: Find <a> in children
  const childLink = element.querySelector('a[href*=".pdf"], a[download]');
  if (childLink && childLink instanceof HTMLAnchorElement) {
    return childLink.href;
  }

  // Strategy 4: Check parent for download link
  const parent = element.parentElement;
  if (parent) {
    const parentLink = parent.querySelector('a[href*=".pdf"], a[download]');
    if (parentLink && parentLink instanceof HTMLAnchorElement) {
      return parentLink.href;
    }
  }

  // Strategy 5: Look for data attributes
  const dataUrl = element.getAttribute('data-url') 
    || element.getAttribute('data-href')
    || element.getAttribute('data-download-url');
  if (dataUrl && dataUrl.includes('.pdf')) {
    return dataUrl;
  }

  // Strategy 6: Check for Gmail-specific attachment links in container
  const container = element.closest('div[role="group"], div.aQH, div.aZo');
  if (container) {
    const downloadLink = container.querySelector('a[href*="mail.google.com"][href*="view=att"]');
    if (downloadLink && downloadLink instanceof HTMLAnchorElement) {
      return downloadLink.href;
    }

    // Check for any link that might be a download
    const anyLink = container.querySelector('a[aria-label*="Download"], a[data-tooltip*="Download"]');
    if (anyLink && anyLink instanceof HTMLAnchorElement && anyLink.href) {
      return anyLink.href;
    }
  }

  // Strategy 7: Look in siblings
  if (element.parentElement) {
    const siblings = Array.from(element.parentElement.children);
    for (const sibling of siblings) {
      if (sibling instanceof HTMLAnchorElement && sibling.href) {
        if (sibling.href.includes('.pdf') || sibling.download) {
          return sibling.href;
        }
      }
      const nestedLink = sibling.querySelector('a[href*=".pdf"], a[download]');
      if (nestedLink && nestedLink instanceof HTMLAnchorElement) {
        return nestedLink.href;
      }
    }
  }

  return null;
}

function getFileName(pdfElement: Element): string {
  // Try aria-label
  const ariaLabel = pdfElement.getAttribute('aria-label') || '';
  if (ariaLabel.includes('.pdf')) {
    const match = ariaLabel.match(/([^\/]+\.pdf)/i);
    if (match) return match[1];
  }

  // Try data-tooltip
  const dataTooltip = pdfElement.getAttribute('data-tooltip') || '';
  if (dataTooltip.includes('.pdf')) {
    const match = dataTooltip.match(/([^\/]+\.pdf)/i);
    if (match) return match[1];
  }

  // Try title
  const title = pdfElement.getAttribute('title') || '';
  if (title.includes('.pdf')) {
    const match = title.match(/([^\/]+\.pdf)/i);
    if (match) return match[1];
  }

  // Try text content
  const text = pdfElement.textContent?.trim() || '';
  if (text.includes('.pdf')) {
    const match = text.match(/([^\/]+\.pdf)/i);
    if (match) return match[1];
  }

  // Try href
  const href = pdfElement.getAttribute('href') || '';
  if (href.includes('.pdf')) {
    const urlParts = href.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart.includes('.pdf')) {
      return decodeURIComponent(lastPart.split('?')[0]);
    }
  }

  return 'document.pdf';
}
