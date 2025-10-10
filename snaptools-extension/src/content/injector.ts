// Gmail Sign button injector
// Logs: Gmail tab → Chrome Console: [st-ext] …

console.log('[st-ext] Gmail injector active');

// Robust filename parsing - strip "Download attachment" prefix
function normalizeFilename(raw: string): string {
  if (!raw) return '';
  // Remove "Download attachment " prefix users saw
  return raw
    .replace(/^Download attachment\s*/i, '')   // strip Gmail prefix
    .replace(/\s*[\(\)\[\]]+$/, '')           // trim trailing parens/brackets if any
    .trim();
}

// Extract PDF URL with multiple fallback strategies
async function findPdfUrlFromCard(cardRoot: Element): Promise<string | null> {
  // 1) Look for an anchor with a .pdf in href
  const anchors = Array.from(cardRoot.querySelectorAll('a[href]'));
  for (const a of anchors) {
    const href = a.getAttribute('href') || '';
    if (/\.pdf(?:[?#]|$)/i.test(href)) return href;
  }

  // 2) Look for elements that Gmail uses: attribute 'download_url' or dataset
  const elWithDownload = cardRoot.querySelector('[download_url], [data-download-url], [data-downloadurl]');
  if (elWithDownload) {
    const raw = elWithDownload.getAttribute('download_url') 
             || elWithDownload.getAttribute('data-download-url')
             || elWithDownload.getAttribute('data-downloadurl') 
             || (elWithDownload as any).dataset?.downloadUrl;
    if (raw) {
      // gmail sometimes stores "application/pdf:Name.pdf:https://mail.google.com/..." style
      const maybeUrl = raw.split(':').slice(-1)[0];
      if (maybeUrl && maybeUrl.startsWith('http')) return maybeUrl;
    }
  }

  // 3) Look for a direct download button (SVG/button), try to find href inside
  const downloadButton = cardRoot.querySelector('a[role="link"][href*="view=att"], a[download]');
  if (downloadButton && (downloadButton as HTMLAnchorElement).href) {
    return (downloadButton as HTMLAnchorElement).href;
  }

  // 4) fail: return null so caller can show "download first" message
  return null;
}

// Track processed elements
const processed = new WeakSet<Element>();

// Throttle mechanism
let lastScanTime = 0;
const SCAN_THROTTLE_MS = 3000;

// Initialize if on Gmail
if (window.location.hostname === 'mail.google.com') {
  console.log('[st-ext] Gmail detected, starting injection');
  
  // Load overlay viewer dynamically
  (async () => {
    const { openOverlayViewer } = await import(chrome.runtime.getURL('content/pdfsign/overlayViewer.js'));
    
    // Initial scan
    scan(openOverlayViewer);
    
    // Set up throttled observer
    const observer = new MutationObserver(() => {
      const now = Date.now();
      if (now - lastScanTime < SCAN_THROTTLE_MS) {
        return; // Skip if within throttle period
      }
      lastScanTime = now;
      scan(openOverlayViewer);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  })();
}

function scan(openOverlayViewer: any) {
  // Scan main document
  scanRoot(document, openOverlayViewer);
  
  // Scan all iframes
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc?.body) {
        scanRoot(iframeDoc, openOverlayViewer);
      }
    } catch (e) {
      // Cross-origin iframe, skip
    }
  });
}

function scanRoot(root: Document, openOverlayViewer: any) {
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
    
    // Find attachment container
    const container = bar.closest('div[role="group"], div.aQH, div.aZo, div[role="button"]');
    if (!container) return;
    
    // Extract filename using robust parsing
    const raw = (container as HTMLElement).innerText || container.textContent || '';
    const filename = normalizeFilename(raw);
    
    console.log('[st-ext] filename:', filename);
    
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
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('[st-ext] Sign click', { filename });
      
      try {
        // Extract PDF URL with fallback strategies
        const url = await findPdfUrlFromCard(container);
        if (!url) {
          alert('Could not find direct PDF URL. Please click the Gmail download icon once and try again.');
          return;
        }
        
        console.log('[st-ext] Found PDF URL:', url);
        await openOverlayViewer({ src: url, name: filename || 'document.pdf' });
      } catch (error) {
        console.log('[st-ext] viewer open failed', error);
        alert('Failed to open PDF viewer: ' + (error as Error).message);
      }
    });
    
    // Append button to action bar
    bar.appendChild(btn);
    
    console.log('[st-ext] Added Sign button next to Add to Drive', filename);
  });
}
