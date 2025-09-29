// Content script for SnapTools v2 Extension
console.log('[st-ext] content script injected');

// Basic content script initialization
(() => {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('[st-ext] content script initialized on:', window.location.href);
  }
})();
