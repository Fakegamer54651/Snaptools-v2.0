// Background service worker for SnapTools Minimal
console.log('[st-ext] background running');

// Basic service worker event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('[st-ext] extension installed');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('[st-ext] extension startup');
});