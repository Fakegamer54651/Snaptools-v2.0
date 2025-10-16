import { defineBackground } from 'wxt/sandbox';
import { onMessage } from '@/shared/messaging';
import { autoRefresh } from '@/modules/auth/mockAuth';

export default defineBackground(() => {
  console.log('SnapTools background running...');

  // Start mock auth auto-refresh
  autoRefresh();

  // TODO: Handle data sync (drivers, templates) with backend
  // TODO: Manage extension state and lifecycle events

  // Basic runtime listeners
  chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details.reason);
    // TODO: Initialize storage with default values
    // TODO: Open onboarding page on first install
  });

  chrome.runtime.onStartup.addListener(() => {
    console.log('Browser started, extension active');
    // TODO: Restore sync state
    // TODO: Check token validity
  });

  // Message handling for ping-pong testing
  onMessage((msg, sender, sendResponse) => {
    console.log('Message received:', msg, 'from:', sender);
    
    if (msg.type === 'ping') {
      console.log('Ping received from:', sender.tab ? `tab ${sender.tab.id}` : 'popup');
      sendResponse({ type: 'pong', source: 'background' });
      return true;
    }
    
    if (msg.type === 'PDF_SIGN_REQUEST') {
      console.log('PDF Sign Request received:', msg.payload);
      const tabId = sender.tab?.id;
      const { url, reason } = msg.payload;
      
      if (tabId) {
        // Send message back to content script to open modal
        chrome.tabs.sendMessage(tabId, { 
          type: 'OPEN_PDF_MODAL', 
          payload: { url } 
        });
        console.log('[SnapTools bg] Opening modal for', url);
        sendResponse({ success: true, message: 'Opening PDF modal' });
      } else {
        console.log('PDF URL not found or no tab ID, reason:', reason);
        sendResponse({ success: false, message: 'No tab ID or URL' });
      }
      return true;
    }
    
    // TODO: Route messages to appropriate handlers
    // TODO: Handle template/driver data requests
    
    sendResponse({ status: 'ok' });
    return true; // Keep message channel open for async response
  });
});

