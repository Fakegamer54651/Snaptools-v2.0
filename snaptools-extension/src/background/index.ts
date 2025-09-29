// Background service worker for SnapTools v2 Extension
console.log('[st-ext] background loaded');

// Basic service worker event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('[st-ext] extension installed');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('[st-ext] extension startup');
});
