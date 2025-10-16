/**
 * Global type declarations for WXT and Svelte
 */

/// <reference types="svelte" />
/// <reference types="vite/client" />

// Svelte component module declarations
declare module '*.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
  export default component;
}

// Image and asset imports
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// CSS module imports
declare module '*.css' {
  const content: string;
  export default content;
}

