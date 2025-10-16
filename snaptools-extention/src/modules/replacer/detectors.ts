/**
 * Detectors for slash shortcuts in different editor contexts
 */

export interface ShortcutMatch {
  trigger: string;
  startPos: number;
  endPos: number;
  element: HTMLElement;
}

/**
 * Detect slash shortcuts in plain text inputs/textareas
 */
export function detectInPlainText(_element: HTMLInputElement | HTMLTextAreaElement): ShortcutMatch | null {
  // TODO: Get cursor position
  // TODO: Get text before cursor
  // TODO: Check if text matches /shortcut pattern
  // TODO: Return match details if found
  console.log('TODO: Detect shortcuts in plain text');
  return null;
}

/**
 * Detect slash shortcuts in contentEditable elements (rich text editors)
 */
export function detectInContentEditable(_element: HTMLElement): ShortcutMatch | null {
  // TODO: Get current selection/cursor position
  // TODO: Get text content before cursor
  // TODO: Check if text matches /shortcut pattern
  // TODO: Return match details if found
  console.log('TODO: Detect shortcuts in contentEditable');
  return null;
}

/**
 * Replace detected shortcut with replacement text
 */
export function replaceShortcut(match: ShortcutMatch, replacement: string): void {
  // TODO: Determine element type (input, textarea, contentEditable)
  // TODO: Perform replacement at detected position
  // TODO: Restore cursor position after replacement
  // TODO: Trigger input event so frameworks detect the change
  console.log('TODO: Replace shortcut', match, replacement);
}

/**
 * Get the word before cursor (for shortcut matching)
 */
export function getWordBeforeCursor(_text: string, _cursorPos: number): string {
  // TODO: Extract word starting with / before cursor
  // TODO: Return empty string if no slash found
  console.log('TODO: Get word before cursor');
  return '';
}

