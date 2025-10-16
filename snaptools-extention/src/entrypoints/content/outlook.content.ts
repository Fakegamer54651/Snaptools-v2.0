import { defineContentScript } from 'wxt/sandbox';
import { sendMessage } from '@/shared/messaging';

export default defineContentScript({
  matches: ['https://outlook.office.com/*', 'https://outlook.live.com/*'],
  registration: 'manifest',
  main() {
    bootstrap();
  },
});

function bootstrap() {
  console.log('SnapTools content script active (Outlook)');

  // Send ping to background for testing
  sendMessage('ping', { from: 'outlook-content' }).then(response => {
    console.log('Outlook content received response:', response);
  });

  // TODO: Wait for Outlook DOM to be ready (SPA detection)
  // TODO: Initialize replacer module (slash shortcut detection)
  // TODO: Initialize templates module (template insertion UI)
  // TODO: Set up mutation observers for compose windows
  // TODO: Listen for keyboard shortcuts
  // TODO: Inject template selector UI when triggered
  // TODO: Handle variable replacement in templates
  // TODO: Sync with background script for auth state

  // Placeholder: detect compose windows
  observeComposeWindows();
}

function observeComposeWindows() {
  // TODO: Use MutationObserver to detect when compose windows open
  // TODO: Attach event listeners to compose editors (contentEditable)
  console.log('TODO: Observing Outlook compose windows');
}

