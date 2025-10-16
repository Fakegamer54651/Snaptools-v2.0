# SnapTools Extension - Project Structure

## 📁 Complete File Tree

```
snaptools-extention/
├── .gitignore
├── .npmrc
├── package.json
├── pnpm-lock.yaml (generated)
├── README.md
├── PROJECT_STRUCTURE.md (this file)
├── svelte.config.js
├── tsconfig.json
├── wxt.config.ts
│
├── src/
│   ├── global.d.ts                    # Global TypeScript declarations
│   │
│   ├── entrypoints/                   # Extension entry points (WXT auto-discovers these)
│   │   ├── background/
│   │   │   └── index.ts               # Service worker (background script)
│   │   ├── content/
│   │   │   ├── gmail.content.ts       # Gmail integration
│   │   │   ├── outlook.content.ts     # Outlook integration
│   │   │   ├── dat.content.ts         # DAT.com integration
│   │   │   └── truckstop.content.ts   # Truckstop integration
│   │   └── popup/
│   │       ├── index.html             # Popup HTML shell
│   │       └── main.ts                # Popup entry (mounts Svelte)
│   │
│   ├── ui/                            # Svelte UI components
│   │   ├── popup/
│   │   │   └── Popup.svelte           # Main popup component
│   │   └── components/
│   │       ├── StatusBadge.svelte     # Status indicator component
│   │       ├── ListItem.svelte        # Reusable list item component
│   │       └── ModalFrame.svelte      # Modal wrapper component
│   │
│   ├── modules/                       # Feature modules (business logic)
│   │   ├── replacer/                  # Slash shortcuts module
│   │   │   ├── index.ts               # Public API
│   │   │   └── detectors.ts           # Shortcut detection utilities
│   │   ├── templates/                 # Email templates module
│   │   │   ├── index.ts               # Public API
│   │   │   └── variables.ts           # Variable resolution logic
│   │   ├── pdf/                       # PDF signing module
│   │   │   ├── index.ts               # Public API
│   │   │   └── ui-hook.ts             # Modal mounting utilities
│   │   └── auth/                      # Authentication module
│   │       ├── index.ts               # Public API
│   │       └── token.ts               # Token management
│   │
│   ├── shared/                        # Shared utilities and types
│   │   ├── types.ts                   # TypeScript type definitions
│   │   ├── storage.ts                 # Chrome storage wrapper
│   │   ├── messaging.ts               # Inter-context messaging
│   │   └── env.ts                     # Environment config
│   │
│   └── styles/
│       └── base.css                   # Base styles (no frameworks)
│
├── static/                            # Static assets (copied to output)
│   ├── icons/
│   │   ├── README.md                  # Icon requirements
│   │   └── placeholder.txt            # TODO: Add actual icons
│   └── _locales/
│       └── en/
│           └── messages.json          # English locale strings
│
└── .output/                           # Build output (generated)
    └── chrome-mv3/
        ├── manifest.json              # Generated manifest
        ├── background.js              # Compiled background script
        ├── popup.html                 # Popup HTML
        └── chunks/                    # Code chunks
            └── popup-*.js             # Compiled popup JS
```

---

## 🏗️ Architecture Overview

### Entry Points (src/entrypoints/)

WXT auto-discovers files in `src/entrypoints/` and generates the appropriate manifest entries:

- **background/index.ts** → Service worker
- **popup/index.html + main.ts** → Extension popup
- **content/*.content.ts** → Content scripts (auto-matched to domains)

### Modules (src/modules/)

Each module is self-contained with a public API (`index.ts`) and internal implementation files:

```
modules/
├── replacer/     → Slash shortcut detection & replacement
├── templates/    → Template fetching, caching, insertion
├── pdf/          → PDF signing UI injection
└── auth/         → Token sync with web app
```

**Usage Example:**
```typescript
import { initReplacer } from '@/modules/replacer';
import { initTemplates } from '@/modules/templates';

// In content script
initReplacer();
initTemplates();
```

### Shared Utilities (src/shared/)

Common utilities used across all contexts:

- **types.ts** - All TypeScript interfaces and types
- **storage.ts** - Typed wrapper for chrome.storage API
- **messaging.ts** - Type-safe cross-context messaging
- **env.ts** - Environment variables and feature flags

### UI Components (src/ui/)

Svelte components for the popup and injected modals:

- **popup/Popup.svelte** - Main popup UI
- **components/** - Reusable Svelte components

---

## 🔄 Data Flow

### Content Script → Background → Storage

```
[Content Script]
    ↓ sendToBackground()
[Background Service Worker]
    ↓ storage.set()
[Chrome Storage]
```

### Popup ↔ Background ↔ Content Scripts

```
[Popup]
    ↓ chrome.runtime.sendMessage()
[Background]
    ↓ chrome.tabs.sendMessage()
[Content Scripts]
```

### Module Initialization Flow

1. **Background Script** starts → Initializes auth module
2. **Content Scripts** inject → Initialize replacer, templates, PDF modules
3. **Popup** opens → Reads state from storage, displays UI

---

## 🎯 Module Responsibilities

### Replacer Module
- Detect `/shortcut` patterns in text inputs
- Replace with predefined text
- Support undo (Ctrl+Z)
- Work in both plain text and contentEditable elements

### Templates Module
- Fetch templates from backend API
- Cache in chrome.storage
- Insert templates into compose windows
- Resolve variables ({{driver.name}}, {{date}}, etc.)

### PDF Module
- Detect PDF viewer contexts
- Inject "Sign with SnapTools" button
- Open signing modal (Svelte component)
- Handle signature placement and saving

### Auth Module
- Sync auth tokens with web app
- Manage token refresh
- Broadcast auth state changes
- Handle logout across all contexts

---

## 🛠️ Development Patterns

### Adding a New Module

1. Create folder in `src/modules/[module-name]/`
2. Create `index.ts` with public API
3. Add types to `src/shared/types.ts`
4. Import and use in content scripts or background

### Adding a New Content Script

1. Create `src/entrypoints/content/[site].content.ts`
2. Use `defineContentScript()` with `matches` array
3. WXT auto-registers in manifest

### Adding a New Svelte Component

1. Create `.svelte` file in `src/ui/components/`
2. Import in other components
3. Keep styles scoped within `<style>` block

---

## 📦 Build Output

### Development (`pnpm dev`)
- Output: `.output/chrome-mv3/`
- Hot reload enabled
- Source maps included
- CSP allows localhost HMR

### Production (`pnpm build`)
- Output: `.output/chrome-mv3/`
- Minified and optimized
- No source maps
- Strict CSP

### ZIP for Store (`pnpm zip`)
- Output: `.output/snaptools-extension-2.0.0-chrome.zip`
- Ready for Chrome Web Store submission

---

## 🧩 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Build System | WXT | Extension bundler, MV3 support |
| UI Framework | Svelte 4 | Reactive UI components |
| Type Safety | TypeScript | Static typing |
| Bundler | Vite | Fast builds, HMR |
| Package Manager | pnpm | Fast, disk-efficient |

---

## 🔍 Key Configuration Files

### wxt.config.ts
- Manifest configuration
- Permissions and host permissions
- Svelte plugin integration
- Path aliases (@/ → src/)

### tsconfig.json
- TypeScript compiler options
- Path aliases
- Type includes

### svelte.config.js
- Svelte preprocessor
- Compiler options

---

## 📝 TODOs

All files are scaffolded with `// TODO:` comments marking implementation points:

```bash
# Search for all TODOs
grep -r "TODO:" src/
```

Major implementation areas:
- [ ] Auth token sync with web app
- [ ] Slash shortcut detection and replacement
- [ ] Template fetching and variable resolution
- [ ] PDF context detection and signing UI
- [ ] Chrome storage wrappers
- [ ] Cross-context messaging handlers
- [ ] Gmail/Outlook/DAT/Truckstop observers

---

## 🚀 Next Steps

1. **Add Extension Icons**: Replace placeholder in `static/icons/`
2. **Implement Auth**: Connect to backend API for login/token management
3. **Build Replacer**: Implement slash shortcut detection logic
4. **Build Templates**: Fetch and cache templates from API
5. **Build PDF Signer**: Create PDF modal and signature placement UI
6. **Test on Target Sites**: Load extension and test on Gmail, Outlook, DAT, Truckstop
7. **Add E2E Tests**: Use Playwright for automated testing

---

## 📚 Resources

- [WXT Documentation](https://wxt.dev/)
- [Svelte Documentation](https://svelte.dev/)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)

