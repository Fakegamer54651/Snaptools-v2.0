// SnapTools Outlook Content Script
(function() {
  'use strict';
  
  console.log('SnapTools content script active (Outlook)');
  
  // Send ping to background for testing
  try {
    chrome.runtime.sendMessage(
      { type: 'ping', payload: { from: 'outlook-content' } },
      function(response) {
        if (response) {
          console.log('Outlook content received response:', response);
        }
      }
    );
  } catch (error) {
    console.error('SnapTools Outlook: Error sending message:', error);
  }
  
  // TODO: Wait for Outlook DOM to be ready (SPA detection)
  // TODO: Initialize replacer module (slash shortcut detection)
  // TODO: Initialize templates module (template insertion UI)
  
})();

