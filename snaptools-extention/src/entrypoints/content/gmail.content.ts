import { defineContentScript } from 'wxt/sandbox';
import { sendMessage } from '@/shared/messaging';

export default defineContentScript({
  matches: [
    'https://mail.google.com/*',
    'https://mail.google.com/mail/*',
    'https://mail.google.com/mail/u/*'
  ],
  allFrames: true,
  registration: 'manifest',
  main() {
    bootstrap();
  },
});

function bootstrap() {
  console.log('SnapTools content script active (Gmail)');

  // Send ping to background for testing
  sendMessage('ping', { from: 'gmail-content' }).then(response => {
    console.log('Gmail content received response:', response);
  });

  // Initialize PDF button injection
  initPdfButtonInjection();
  
  // Set up modal message listener
  setupModalListener();

  // TODO: Initialize replacer module (slash shortcut detection)
  // TODO: Initialize templates module (template insertion UI)
  // TODO: Listen for keyboard shortcuts
}

// ============================================================================
// PDF Sign Button Injection
// ============================================================================

function safeLog(...args: any[]) {
  console.log('[SnapTools Gmail]', ...args);
}

/**
 * Create the "Sign PDF" button
 */
function createSignButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'snaptools-sign-btn';
  btn.setAttribute('aria-label', 'Sign PDF (SnapTools)');
  btn.setAttribute('title', 'Sign this PDF with SnapTools');
  
  // Apply styles using Object.assign for cleaner code
  Object.assign(btn.style, {
    width: '32px',
    height: '32px',
    padding: '4px',
    border: 'none',
    background: 'transparent',
    color: '#80868B',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background 0.2s, color 0.2s',
  });
  
  // Hover effects
  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(128, 134, 139, 0.1)';
    btn.style.color = '#5f6368';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'transparent';
    btn.style.color = '#80868B';
  });
  
  // SVG icon (pen/pencil for signing) - 24x24
  btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
    <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
  </svg>`;
  
  return btn;
}

// Helper functions removed - now targeting div.aQw directly for cleaner injection

/**
 * Guess the download URL from an attachment container
 */
function guessDownloadUrlFromContainer(container: HTMLElement): string | null {
  // Strategy 1: Find direct download link
  const downloadLink = container.querySelector('a[href*="export=download"], a[href*="disp=safe"]') as HTMLAnchorElement | null;
  if (downloadLink?.href) {
    return downloadLink.href;
  }
  
  // Strategy 2: Find any attachment link
  const attLink = container.querySelector('a[href*="attid="], a[href*="view=att"]') as HTMLAnchorElement | null;
  if (attLink?.href) {
    // Try to convert to download URL
    let url = attLink.href;
    if (!url.includes('export=download')) {
      // Convert preview URL to download URL
      url = url.replace('view=att', 'view=att&disp=safe');
      if (!url.includes('export=')) {
        url += url.includes('?') ? '&export=download' : '?export=download';
      }
    }
    return url;
  }
  
  // Strategy 3: Find parent anchor
  const parentLink = container.closest('a[href]') as HTMLAnchorElement | null;
  if (parentLink?.href && (parentLink.href.includes('attid=') || parentLink.href.includes('view='))) {
    return parentLink.href;
  }
  
  // Strategy 4: Find image source and try to convert
  const img = container.querySelector('img[src*="attid="], img[src*="view="]') as HTMLImageElement | null;
  if (img?.src) {
    // Convert image preview to download
    let url = img.src;
    url = url.replace('view=snatt', 'export=download');
    url = url.replace('view=fimg', 'export=download');
    if (url.includes('attid=')) {
      return url;
    }
  }
  
  return null;
}

// PDF detection removed - now injecting on all div.aQw containers

/**
 * Scan and inject buttons for all attachments
 */
function injectButtons(): void {
  // Target div.aQw directly - Gmail's attachment toolbar container
  document.querySelectorAll<HTMLElement>('div.aQw').forEach((container) => {
    try {
      // Skip if we already injected a button
      if (container.querySelector('.snaptools-sign-btn')) {
        return;
      }

      // Create a span wrapper to match Gmail's structure
      const span = document.createElement('span');
      span.setAttribute('data-is-tooltip-wrapper', 'true');

      // Create the button
      const btn = createSignButton();

      // Extract URL from download button's data-tooltip or href
      const downloadBtn = container.querySelector<HTMLButtonElement>('button[aria-label^="Download"]');
      let url: string | null = null;
      
      if (downloadBtn) {
        url = downloadBtn.getAttribute('data-tooltip') || null;
      }
      
      // Fallback: try to find URL from container
      if (!url) {
        url = guessDownloadUrlFromContainer(container);
      }

      // Attach click handler
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        
        safeLog('Sign button clicked — sending URL', url || 'none found');
        
        try {
          chrome.runtime.sendMessage(
            { type: 'PDF_SIGN_REQUEST', payload: { url } },
            (resp) => {
              if (chrome.runtime.lastError) {
                safeLog('Runtime error:', chrome.runtime.lastError.message);
              } else {
                safeLog('PDF_SIGN_REQUEST sent', resp);
              }
            }
          );
        } catch (error) {
          safeLog('sendMessage error:', error);
        }
      }, true);

      // Append button to span, span to container
      span.appendChild(btn);
      container.appendChild(span);

      safeLog('Sign button injected inside aQw span', { container: container.className, url });
    } catch (error) {
      // Silently fail for individual containers
    }
  });
}

/**
 * Initialize PDF button injection with MutationObserver
 */
function initPdfButtonInjection(): void {
  safeLog('Initializing PDF button injection...');
  
  // Initial injection
  injectButtons();
  
  // Set up MutationObserver for dynamic content
  const observer = new MutationObserver((mutations) => {
    // Debounce: only inject if mutations include added nodes
    let shouldInject = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldInject = true;
        break;
      }
    }
    
    if (shouldInject) {
      injectButtons();
    }
  });
  
  // Observe entire document
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
  
  // Also inject on load and after delay (for late-loading content)
  window.addEventListener('load', () => {
    setTimeout(injectButtons, 600);
    setTimeout(injectButtons, 1500);
  });
  
  safeLog('PDF button injection initialized');
}

// ============================================================================
// PDF Modal Overlay
// ============================================================================

/**
 * Create and display PDF modal overlay
 */
function createModal(url: string | null): void {
  // Check if modal already exists
  if (document.querySelector('#snaptools-pdf-modal')) {
    safeLog('Modal already open');
    return;
  }

  safeLog('Creating PDF modal for', url);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'snaptools-pdf-modal';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  // Create modal content frame
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    width: 90%;
    height: 90%;
    max-width: 1200px;
    max-height: 900px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 40px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // Create iframe for PDF viewer - loads SnapTools web app (embed version)
  const frame = document.createElement('iframe');
  const webAppUrl = `http://localhost:3001/pdfsign-embed${url ? '?pdf=' + encodeURIComponent(url) : ''}`;
  frame.src = webAppUrl;
  frame.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: #fff;
  `;
  frame.setAttribute('allow', 'fullscreen');
  frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-downloads');

  modalContent.appendChild(frame);
  overlay.appendChild(modalContent);

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      safeLog('Modal closed');
    }
  });

  // Escape key to close
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
      safeLog('Modal closed via Escape');
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Append to body
  document.body.appendChild(overlay);
  safeLog('PDF modal opened with', url);
}

/**
 * Set up listener for modal open requests from background
 */
function setupModalListener(): void {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'OPEN_PDF_MODAL') {
      createModal(msg.payload?.url || null);
      sendResponse({ success: true });
      return true;
    }
    return false;
  });
  
  safeLog('Modal listener set up');
}

