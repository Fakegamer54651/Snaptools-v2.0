// SnapTools Truckstop Content Script
(function() {
  'use strict';
  
  console.log('SnapTools content script active (Truckstop)');
  
  // Send ping to background for testing
  try {
    chrome.runtime.sendMessage(
      { type: 'ping', payload: { from: 'truckstop-content' } },
      function(response) {
        if (response) {
          console.log('Truckstop content received response:', response);
        }
      }
    );
  } catch (error) {
    console.error('SnapTools Truckstop: Error sending message:', error);
  }
  
  // TODO: Initialize PDF signer module
  // TODO: Detect PDF upload/view contexts
  // TODO: Inject "Sign with SnapTools" button near PDF actions
  
})();

