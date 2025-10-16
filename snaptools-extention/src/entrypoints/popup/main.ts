import Popup from '@/ui/popup/Popup.svelte';
import '@/styles/base.css';
import { sendMessage } from '@/shared/messaging';

console.log('Popup loaded');

// Send ping to background for testing
sendMessage('ping', { from: 'popup' }).then(response => {
  console.log('Popup received response:', response);
}).catch(error => {
  console.error('Popup ping failed:', error);
});

// Mount Svelte app to #app
const target = document.getElementById('app');

if (!target) {
  throw new Error('Could not find #app element to mount Svelte app');
}

const app = new Popup({
  target,
});

export default app;

