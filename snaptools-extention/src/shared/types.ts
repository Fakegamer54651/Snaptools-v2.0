/**
 * Shared TypeScript types and interfaces
 */

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken?: string | null;
  user: User | null;
  expiresAt?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  // TODO: Add additional user fields as needed
}

// ============================================================================
// Driver Types
// ============================================================================

export interface Driver {
  id: string;
  name: string;
  // TODO: Add driver fields (phone, email, license, etc.)
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Template Types
// ============================================================================

export interface Template {
  id: string;
  name: string;
  subject?: string;
  body: string;
  variables?: string[];
  category?: string;
  // TODO: Add additional template metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateInsertOptions {
  targetElement?: HTMLElement;
  variables?: VariableContext;
  insertSubject?: boolean;
}

// ============================================================================
// Variable Types
// ============================================================================

export interface VariableContext {
  [key: string]: any;
  driver?: Driver;
  user?: User;
  date?: string;
  time?: string;
  // TODO: Add more context variables as needed
}

// ============================================================================
// Shortcut/Replacer Types
// ============================================================================

export interface Shortcut {
  id: string;
  trigger: string; // e.g., "/hello"
  replacement: string;
  enabled: boolean;
  // TODO: Add shortcut metadata
}

export interface ReplacerConfig {
  enabled: boolean;
  shortcuts?: Shortcut[];
  // TODO: Add replacer configuration options
}

// ============================================================================
// Message Types (for chrome.runtime messaging)
// ============================================================================

export interface Message<T = any> {
  type: string;
  payload?: T;
  requestId?: string;
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StorageData {
  auth?: AuthState;
  templates?: Template[];
  drivers?: Driver[];
  shortcuts?: Shortcut[];
  // TODO: Add more storage keys as needed
}

// ============================================================================
// PDF Types
// ============================================================================

export interface PdfSignature {
  id: string;
  imageData: string; // Base64 encoded image
  createdAt: string;
  // TODO: Add signature metadata
}

export interface PdfAnnotation {
  type: 'signature' | 'text' | 'date';
  x: number;
  y: number;
  width: number;
  height: number;
  data: string;
  // TODO: Add annotation properties
}

