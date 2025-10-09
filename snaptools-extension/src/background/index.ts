// Background service worker for SnapTools Minimal
// Logs: chrome://extensions → Inspect service worker: [st-bg] …

console.log("[st-bg] background running");

// Basic service worker event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log("[st-bg] extension installed");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("[st-bg] extension startup");
});

// Listen for OPEN_VIEWER message from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'OPEN_VIEWER') {
    const base = chrome.runtime.getURL('viewer/viewer.html');
    const url = `${base}?name=${encodeURIComponent(msg.filename || '')}&src=${encodeURIComponent(msg.url || '')}`;
    
    chrome.windows.create({
      url: url,
      type: 'popup',
      width: 1100,
      height: 800
    }, (window) => {
      console.log('[st-bg] Opened viewer window for', msg.filename);
    });
    
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});
