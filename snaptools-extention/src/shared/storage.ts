/**
 * Chrome Storage Wrapper
 * Provides typed access to chrome.storage.local and chrome.storage.sync
 */

import type { StorageData } from './types';

/**
 * Get a value from storage
 */
export async function get<K extends keyof StorageData>(
  key: K
): Promise<StorageData[K] | undefined> {
  // TODO: Read from chrome.storage.local
  // TODO: Parse and return typed value
  console.log('TODO: Get from storage', key);
  return undefined;
}

/**
 * Get multiple values from storage
 */
export async function getMultiple<K extends keyof StorageData>(
  keys: K[]
): Promise<Partial<Pick<StorageData, K>>> {
  // TODO: Read multiple keys at once
  // TODO: Return object with typed values
  console.log('TODO: Get multiple from storage', keys);
  return {};
}

/**
 * Set a value in storage
 */
export async function set<K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
): Promise<void> {
  // TODO: Write to chrome.storage.local
  // TODO: Handle serialization if needed
  console.log('TODO: Set in storage', key, value);
}

/**
 * Set multiple values in storage
 */
export async function setMultiple(data: Partial<StorageData>): Promise<void> {
  // TODO: Write multiple key-value pairs at once
  console.log('TODO: Set multiple in storage', data);
}

/**
 * Remove a value from storage
 */
export async function remove<K extends keyof StorageData>(key: K): Promise<void> {
  // TODO: Remove from chrome.storage.local
  console.log('TODO: Remove from storage', key);
}

/**
 * Clear all storage
 */
export async function clear(): Promise<void> {
  // TODO: Clear all data from chrome.storage.local
  console.log('TODO: Clear all storage');
}

/**
 * Listen for storage changes
 */
export function onChange<K extends keyof StorageData>(
  key: K,
  _callback: (newValue: StorageData[K] | undefined, oldValue: StorageData[K] | undefined) => void
): () => void {
  // TODO: Set up chrome.storage.onChanged listener
  // TODO: Filter for specific key
  // TODO: Call callback with old and new values
  // TODO: Return unsubscribe function
  console.log('TODO: Set up storage change listener', key);
  return () => {}; // Cleanup function
}

/**
 * Storage wrapper with same interface for easy mocking/testing
 */
export const storage = {
  get,
  getMultiple,
  set,
  setMultiple,
  remove,
  clear,
  onChange,
};

