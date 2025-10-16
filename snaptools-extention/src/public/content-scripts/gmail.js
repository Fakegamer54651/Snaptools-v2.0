// SnapTools Gmail Content Script
(function() {
  'use strict';
  
  console.log('SnapTools content script active (Gmail)');
  
  // Send ping to background for testing
  try {
    chrome.runtime.sendMessage(
      { type: 'ping', payload: { from: 'gmail-content' } },
      function(response) {
        if (response) {
          console.log('Gmail content received response:', response);
        }
      }
    );
  } catch (error) {
    console.error('SnapTools Gmail: Error sending message:', error);
  }
  
  // Initialize PDF button injection
  initPdfButtonInjection();
  
  // Set up modal listener
  setupModalListener();
  
  // ============================================================================
  // PDF Sign Button Injection
  // ============================================================================
  
  function safeLog() {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console, ['[SnapTools Gmail]'].concat(args));
  }
  
  function createSignButton() {
    var btn = document.createElement('button');
    btn.className = 'snaptools-sign-btn';
    btn.setAttribute('aria-label', 'Sign PDF (SnapTools)');
    btn.setAttribute('title', 'Sign this PDF with SnapTools');
    
    // Apply styles
    btn.style.width = '32px';
    btn.style.height = '32px';
    btn.style.padding = '4px';
    btn.style.border = 'none';
    btn.style.background = 'transparent';
    btn.style.color = '#80868B';
    btn.style.cursor = 'pointer';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.borderRadius = '4px';
    btn.style.transition = 'background 0.2s, color 0.2s';
    
    btn.addEventListener('mouseenter', function() {
      btn.style.background = 'rgba(128, 134, 139, 0.1)';
      btn.style.color = '#5f6368';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.background = 'transparent';
      btn.style.color = '#80868B';
    });
    
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>' +
      '<path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>' +
      '</svg>';
    
    return btn;
  }
  
  function findAttachmentContainers() {
    var selectors = [
      '[aria-label*="Download"]',
      '[role="button"][aria-label*="download"]',
      'div.aYp',
      'div.aQw',
      'div.a12',
      'div.aSH',
      'div.aZo'
    ];
    
    var nodes = [];
    var seen = new Set();
    
    selectors.forEach(function(selector) {
      try {
        document.querySelectorAll(selector).forEach(function(n) {
          if (!seen.has(n)) {
            seen.add(n);
            nodes.push(n);
          }
        });
      } catch (e) {
        // Invalid selector
      }
    });
    
    // Find PDF preview images
    document.querySelectorAll('img[src]').forEach(function(img) {
      var src = img.src || '';
      if (src.includes('view=snatt') || src.includes('attid=') || src.includes('.pdf')) {
        var container = img.closest('div');
        if (container && !seen.has(container)) {
          seen.add(container);
          nodes.push(container);
        }
      }
    });
    
    // Find attachment links
    document.querySelectorAll('a[href*="export=download"], a[href*="attid="]').forEach(function(link) {
      var container = link.closest('div');
      if (container && !seen.has(container)) {
        seen.add(container);
        nodes.push(container);
      }
    });
    
    return nodes;
  }
  
  function guessDownloadUrl(container) {
    // Find download link
    var downloadLink = container.querySelector('a[href*="export=download"]');
    if (downloadLink && downloadLink.href) return downloadLink.href;
    
    // Find attachment link
    var attLink = container.querySelector('a[href*="attid="]');
    if (attLink && attLink.href) {
      var url = attLink.href;
      if (!url.includes('export=download')) {
        url += (url.includes('?') ? '&' : '?') + 'export=download';
      }
      return url;
    }
    
    // Find parent anchor
    var parentLink = container.closest('a[href]');
    if (parentLink && parentLink.href && parentLink.href.includes('attid=')) {
      return parentLink.href;
    }
    
    // Find image source
    var img = container.querySelector('img[src*="attid="]');
    if (img && img.src) {
      var imgUrl = img.src.replace('view=snatt', 'export=download');
      return imgUrl;
    }
    
    return null;
  }
  
  function isPdfAttachment(container) {
    var text = (container.textContent || '').toLowerCase();
    var html = container.innerHTML.toLowerCase();
    
    if (text.includes('.pdf') || html.includes('.pdf')) return true;
    
    var url = guessDownloadUrl(container);
    if (url && url.toLowerCase().includes('.pdf')) return true;
    
    return false;
  }
  
  function injectButtons() {
    // Target div.aQw directly - Gmail's attachment toolbar container
    document.querySelectorAll('div.aQw').forEach(function(container) {
      try {
        // Skip if we already injected a button
        if (container.querySelector('.snaptools-sign-btn')) {
          return;
        }
        
        // Create a span wrapper to match Gmail's structure
        var span = document.createElement('span');
        span.setAttribute('data-is-tooltip-wrapper', 'true');
        
        // Create the button
        var btn = createSignButton();
        
        // Extract URL from download button's data-tooltip or href
        var downloadBtn = container.querySelector('button[aria-label^="Download"]');
        var url = null;
        
        if (downloadBtn) {
          url = downloadBtn.getAttribute('data-tooltip') || null;
        }
        
        // Fallback: try to find URL from container
        if (!url) {
          url = guessDownloadUrl(container);
        }
        
        // Attach click handler
        btn.addEventListener('click', function(ev) {
          ev.stopPropagation();
          ev.preventDefault();
          
          safeLog('Sign button clicked — sending URL', url || 'none found');
          
          try {
            chrome.runtime.sendMessage(
              { type: 'PDF_SIGN_REQUEST', payload: { url: url } },
              function(resp) {
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
        
        safeLog('Sign button injected inside aQw span', { url: url });
      } catch (error) {
        // Silently fail
      }
    });
  }
  
  function initPdfButtonInjection() {
    safeLog('Initializing PDF button injection...');
    
    injectButtons();
    
    var observer = new MutationObserver(function(mutations) {
      var shouldInject = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) {
          shouldInject = true;
          break;
        }
      }
      
      if (shouldInject) {
        injectButtons();
      }
    });
    
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
    
    window.addEventListener('load', function() {
      setTimeout(injectButtons, 600);
      setTimeout(injectButtons, 1500);
    });
    
    safeLog('PDF button injection initialized');
  }
  
  // ============================================================================
  // PDF Modal Overlay
  // ============================================================================
  
  function createModal(url) {
    if (document.querySelector('#snaptools-pdf-modal')) {
      safeLog('Modal already open');
      return;
    }
    
    safeLog('Creating PDF modal for', url);
    
    var overlay = document.createElement('div');
    overlay.id = 'snaptools-pdf-modal';
    overlay.style.cssText = 
      'position: fixed;' +
      'inset: 0;' +
      'background: rgba(0, 0, 0, 0.4);' +
      'z-index: 999999;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;';
    
    var modalContent = document.createElement('div');
    modalContent.style.cssText =
      'width: 90%;' +
      'height: 90%;' +
      'max-width: 1200px;' +
      'max-height: 900px;' +
      'background: #fff;' +
      'border-radius: 12px;' +
      'box-shadow: 0 4px 40px rgba(0, 0, 0, 0.4);' +
      'display: flex;' +
      'flex-direction: column;' +
      'overflow: hidden;';
    
    var frame = document.createElement('iframe');
    var pdfUrl = chrome.runtime.getURL('pdf.html' + (url ? '?file=' + encodeURIComponent(url) : ''));
    frame.src = pdfUrl;
    frame.style.cssText =
      'width: 100%;' +
      'height: 100%;' +
      'border: none;' +
      'background: #fff;';
    frame.setAttribute('allow', 'fullscreen');
    
    modalContent.appendChild(frame);
    overlay.appendChild(modalContent);
    
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
        safeLog('Modal closed');
      }
    });
    
    var handleEscape = function(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
        safeLog('Modal closed via Escape');
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    document.body.appendChild(overlay);
    safeLog('PDF modal opened with', url);
  }
  
  function setupModalListener() {
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
      if (msg.type === 'OPEN_PDF_MODAL') {
        createModal(msg.payload && msg.payload.url);
        sendResponse({ success: true });
        return true;
      }
      return false;
    });
    
    safeLog('Modal listener set up');
  }
  
})();

