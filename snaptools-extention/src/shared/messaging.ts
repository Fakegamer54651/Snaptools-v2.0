/**
 * Chrome Runtime Messaging Wrapper
 * Type-safe message passing between extension contexts
 */

import type { Message, MessageResponse } from './types';

// ============================================================================
// Message Channel Names
// ============================================================================

export const CHANNEL = {
  PING: 'ping',
  PONG: 'pong',
  
  // Auth channels
  AUTH_GET_STATE: 'AUTH_GET_STATE',
  AUTH_SET_TOKENS: 'AUTH_SET_TOKENS',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_CHANGED: 'AUTH_CHANGED',
  AUTH_STATE: 'AUTH_STATE',
  
  TEMPLATES_FETCH: 'templates:fetch',
  TEMPLATES_GET: 'templates:get',
  TEMPLATES_INSERT: 'templates:insert',
  TEMPLATES_REFRESH: 'templates:refresh',
  
  DRIVERS_FETCH: 'drivers:fetch',
  DRIVERS_GET: 'drivers:get',
  
  SHORTCUTS_FETCH: 'shortcuts:fetch',
  SHORTCUTS_RELOAD: 'shortcuts:reload',
  
  PDF_SIGN_REQUEST: 'PDF_SIGN_REQUEST',
  OPEN_PDF_MODAL: 'OPEN_PDF_MODAL',
  CLOSE_PDF_MODAL: 'CLOSE_PDF_MODAL',
  PDF_SAVE_SIGNATURE: 'pdf:save-signature',
} as const;

// ============================================================================
// Simple Messaging API (for testing)
// ============================================================================

/**
 * Send a message to the background script
 */
export const sendMessage = (type: string, payload?: any) => {
  return chrome.runtime.sendMessage({ type, payload });
};

/**
 * Listen for messages from any context
 */
export const onMessage = (handler: (msg: any, sender: any, sendResponse: any) => void) => {
  chrome.runtime.onMessage.addListener(handler);
  return handler; // Return for potential cleanup
};

// ============================================================================
// Send Message to Background Script
// ============================================================================

export async function sendToBackground<T = any, R = any>(
  type: string,
  payload?: T
): Promise<MessageResponse<R>> {
  // TODO: Use chrome.runtime.sendMessage
  // TODO: Wrap in try-catch for error handling
  // TODO: Return typed response
  console.log('TODO: Send message to background', type, payload);
  return { success: false, error: 'Not implemented' };
}

// ============================================================================
// Send Message to Content Script
// ============================================================================

export async function sendToContentScript<T = any, R = any>(
  tabId: number,
  type: string,
  payload?: T
): Promise<MessageResponse<R>> {
  // TODO: Use chrome.tabs.sendMessage
  // TODO: Wrap in try-catch for error handling
  // TODO: Return typed response
  console.log('TODO: Send message to content script', tabId, type, payload);
  return { success: false, error: 'Not implemented' };
}

// ============================================================================
// Send Message to Active Tab
// ============================================================================

export async function sendToActiveTab<T = any, R = any>(
  type: string,
  payload?: T
): Promise<MessageResponse<R>> {
  // TODO: Query active tab
  // TODO: Send message using sendToContentScript
  console.log('TODO: Send message to active tab', type, payload);
  return { success: false, error: 'Not implemented' };
}

// ============================================================================
// Broadcast Message to All Tabs
// ============================================================================

export async function broadcast<T = any>(
  type: string,
  payload?: T
): Promise<void> {
  // TODO: Query all tabs
  // TODO: Send message to each tab
  console.log('TODO: Broadcast message to all tabs', type, payload);
}

// ============================================================================
// Listen for Messages (Advanced - for future use)
// ============================================================================

export type MessageHandler<T = any, R = any> = (
  payload: T,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse<R>> | MessageResponse<R>;

// TODO: Implement type-safe message routing
// export function onMessageTyped<T = any, R = any>(
//   type: string,
//   handler: MessageHandler<T, R>
// ): () => void {
//   // Set up chrome.runtime.onMessage listener
//   // Filter messages by type
//   // Call handler with payload and sender
//   // Send response back
//   // Return unsubscribe function
// }

// ============================================================================
// Message Helper
// ============================================================================

export function createMessage<T = any>(type: string, payload?: T): Message<T> {
  return {
    type,
    payload,
    requestId: crypto.randomUUID(),
  };
}

export function createResponse<T = any>(success: boolean, data?: T, error?: string): MessageResponse<T> {
  return { success, data, error };
}

