// PDF.js Bridge Script - Runs in page context to access window.pdfjsLib
// This bypasses Gmail's CSP restrictions on inline scripts

window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;
  
  // Only handle our bridge command
  if (event.data?.cmd !== 'bridge-pdfjs') return;

  try {
    // Check for PDF.js global in page context
    const lib = (window as any).pdfjsLib || (window as any)['pdfjs-dist/build/pdf'];
    
    if (lib) {
      // Ensure it's available as window.pdfjsLib
      (window as any).pdfjsLib = lib;
      
      // Send success message back to content script
      window.postMessage({ source: 'snaptools-pdfjs', ok: true }, '*');
      
      console.log('[st-bridge] PDF.js found and bridged');
    } else {
      // Send failure message
      window.postMessage({ source: 'snaptools-pdfjs', ok: false }, '*');
      
      console.error('[st-bridge] PDF.js not found in window');
    }
  } catch (err) {
    console.error('[st-bridge] Bridge error:', err);
    window.postMessage({ source: 'snaptools-pdfjs', ok: false }, '*');
  }
});

console.log('[st-bridge] PDF.js bridge listener installed');

