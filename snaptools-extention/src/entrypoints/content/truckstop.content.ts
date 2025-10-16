import { defineContentScript } from 'wxt/sandbox';
import { sendMessage } from '@/shared/messaging';

export default defineContentScript({
  matches: ['https://*.truckstop.com/*'],
  registration: 'manifest',
  main() {
    bootstrap();
  },
});

function bootstrap() {
  console.log('SnapTools content script active (Truckstop)');

  // Send ping to background for testing
  sendMessage('ping', { from: 'truckstop-content' }).then(response => {
    console.log('Truckstop content received response:', response);
  });

  // TODO: Identify Truckstop message/communication areas
  // TODO: Initialize PDF signer module
  // TODO: Detect PDF upload/view contexts
  // TODO: Inject "Sign with SnapTools" button near PDF actions
  // TODO: Initialize replacer module for text areas
  // TODO: Initialize templates module for messaging
  // TODO: Sync with background script for auth state

  // Placeholder: detect PDF contexts
  observePdfContexts();
}

function observePdfContexts() {
  // TODO: Use MutationObserver to detect PDF viewers or upload areas
  // TODO: Inject custom UI for PDF signing
  console.log('TODO: Observing Truckstop PDF contexts');
}

