// Content script for SnapTools Minimal
import { PDFViewer } from './pdfsign/viewer/pdfViewer';

console.log('[st-ext] content script loaded successfully', window.location.href);

// Track processed containers to avoid duplicates
const processedContainers = new WeakSet<Element>();
const processedIframes = new WeakSet<HTMLIFrameElement>();

// Initialize PDF viewer instance
const pdfViewer = new PDFViewer();

// Gmail PDF sign button injection
if (window.location.hostname === 'mail.google.com') {
  console.log('[st-ext] Gmail detected');
  initPdfSignButtons();
}

function initPdfSignButtons() {
  console.log("[st-ext] PDF Sign injector active");

  // Scan main document
  scanDocumentForPDFs(document);

  // Scan all iframes
  scanIframes();

  // Set up global MutationObserver for new iframes and content
  const globalObserver = new MutationObserver((mutations) => {
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

          // Watch for changes inside iframe
          const iframeObserver = new MutationObserver(() => {
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
  // Look for PDF links and attachments
  const pdfSelectors = [
    'a[href*=".pdf"]',
    'a[download*=".pdf"]',
    '[aria-label*=".pdf"]',
    '[data-tooltip*=".pdf"]',
    '[title*=".pdf"]',
  ];

  pdfSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    
    if (elements.length > 0) {
      console.log(`[st-ext] Found ${elements.length} PDF elements with selector: ${selector}`);
    }

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

  // Set up observer for this container
  const observer = new MutationObserver(() => {
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    margin-left: 6px;
    padding: 0 10px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    background: #f8f9fa;
    color: #202124;
    font-size: 12px;
    font-family: Google Sans, Roboto, Arial, sans-serif;
    cursor: pointer;
  `;

  btn.addEventListener('mouseenter', () => btn.style.background = '#f1f3f4');
  btn.addEventListener('mouseleave', () => btn.style.background = '#f8f9fa');

  // Add click handler
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`[st-ext] Sign button clicked for: ${fileName}`);
    
    // Get PDF URL
    const pdfUrl = getPDFUrl(pdfElement);
    
    if (pdfUrl) {
      await pdfViewer.open(pdfUrl);
    } else {
      console.warn('[st-ext] Could not find PDF URL');
      alert('Could not find PDF URL. Please try downloading the file first.');
    }
  });

  // Append button
  parent.appendChild(btn);

  console.log(`[st-ext] Added Sign button for ${fileName}`);
}

function getPDFUrl(element: Element): string | null {
  // Try href attribute
  const href = element.getAttribute('href');
  if (href && href.includes('.pdf')) {
    return href.startsWith('http') ? href : window.location.origin + href;
  }

  // Try to find link in ancestors
  const link = element.closest('a');
  if (link && link instanceof HTMLAnchorElement) {
    return link.href;
  }

  // Try to find link in children
  const childLink = element.querySelector('a[href*=".pdf"]');
  if (childLink && childLink instanceof HTMLAnchorElement) {
    return childLink.href;
  }

  // Try data attributes
  const dataUrl = element.getAttribute('data-url') || element.getAttribute('data-href');
  if (dataUrl && dataUrl.includes('.pdf')) {
    return dataUrl;
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
