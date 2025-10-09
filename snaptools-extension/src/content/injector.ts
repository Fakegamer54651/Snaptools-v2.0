// Gmail Sign button injector
// Logs: Gmail tab → Chrome Console: [st-ext] …

console.log('[st-ext] Gmail injector active');

// Track processed elements
const processed = new WeakSet<Element>();

// Throttle mechanism
let lastScanTime = 0;
const SCAN_THROTTLE_MS = 3000;

// Initialize if on Gmail
if (window.location.hostname === 'mail.google.com') {
  console.log('[st-ext] Gmail detected, starting injection');
  
  // Initial scan
  scan();
  
  // Set up throttled observer
  const observer = new MutationObserver(() => {
    const now = Date.now();
    if (now - lastScanTime < SCAN_THROTTLE_MS) {
      return; // Skip if within throttle period
    }
    lastScanTime = now;
    scan();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function scan() {
  // Scan main document
  scanRoot(document);
  
  // Scan all iframes
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc?.body) {
        scanRoot(iframeDoc);
      }
    } catch (e) {
      // Cross-origin iframe, skip
    }
  });
}

function scanRoot(root: Document) {
  // Find all action bars (Gmail attachment toolbar)
  const bars = root.querySelectorAll('.aQw');
  
  bars.forEach((bar) => {
    // Skip if already has our button
    if (bar.querySelector('[data-st-sign-btn]')) {
      return;
    }
    
    // Skip if already processed (belt and suspenders)
    if (processed.has(bar)) {
      return;
    }
    
    processed.add(bar);
    
    // Try to find filename from nearby elements
    const container = bar.closest('div[role="group"], div.aQH, div.aZo, div[role="button"]');
    const filenameElement = container?.querySelector('[aria-label$=".pdf"], [data-tooltip$=".pdf"]');
    const filename = (
      filenameElement?.getAttribute('aria-label') ||
      filenameElement?.getAttribute('data-tooltip') ||
      container?.textContent?.match(/([^\\/]+\.pdf)/i)?.[1] ||
      ''
    ).trim();
    
    // Try to extract URL from nearby link
    const linkElement = container?.querySelector('a[href*=".pdf"], a[href*="googleusercontent.com"]') as HTMLAnchorElement | null;
    const url = linkElement?.href || '';
    
    // Create button
    const btn = root.createElement('button');
    btn.textContent = 'Sign';
    btn.dataset.stSignBtn = '1';
    btn.style.cssText = 'background:#f1f3f4;border:1px solid #dadce0;border-radius:4px;padding:2px 8px;margin-left:6px;font-size:12px;cursor:pointer;';
    
    // Add hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#e8eaed';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#f1f3f4';
    });
    
    // Click handler
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('[st-ext] Sign click', { filename, url });
      
      // Send message to background to open viewer
      chrome.runtime.sendMessage({
        type: 'OPEN_VIEWER',
        filename: filename || 'document.pdf',
        url: url
      });
    });
    
    // Append button to action bar
    bar.appendChild(btn);
    
    console.log('[st-ext] Added Sign button next to Add to Drive', filename);
  });
}

