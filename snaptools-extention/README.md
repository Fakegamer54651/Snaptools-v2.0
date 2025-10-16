# SnapTools Extension

Modern Chrome extension for shortcuts, templates, and PDF tools across Gmail, Outlook, DAT, and Truckstop.

Built with **WXT** (Manifest V3), **Svelte**, and **TypeScript**.

---

## 🚀 Features

- **Slash Shortcuts**: Type `/shortcut` to quickly insert predefined text
- **Email Templates**: Insert email templates with variable support
- **PDF Signing**: Sign PDFs directly within DAT and Truckstop workflows
- **Cross-Platform**: Works on Gmail, Outlook, DAT, and Truckstop

---

## 📋 Prerequisites

- **Node.js** 18+
- **pnpm** 8+ (required - npm will not work with WXT)
- **Chrome** browser (or Chromium-based browser)

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

---

## 🛠️ Development

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

This will:
- Start WXT in development mode with hot reload
- Watch for file changes
- Output extension to `.output/chrome-mv3`

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3` directory
5. The extension should now be loaded and active

### Development with Firefox

```bash
pnpm dev:firefox
```

Load from `.output/firefox-mv3` in Firefox's `about:debugging` page.

---

## 🏗️ Build for Production

```bash
pnpm build
```

Production-ready extension will be in `.output/chrome-mv3/`.

To create a ZIP for Chrome Web Store submission:

```bash
pnpm zip
```

The ZIP will be in `.output/` directory.

---

## 📁 Project Structure

```
snaptools-extention/
├── src/
│   ├── entrypoints/
│   │   ├── background/          # Service worker (background script)
│   │   ├── content/              # Content scripts for each platform
│   │   │   ├── gmail.content.ts
│   │   │   ├── outlook.content.ts
│   │   │   ├── dat.content.ts
│   │   │   └── truckstop.content.ts
│   │   └── popup/                # Extension popup UI
│   │       ├── index.html
│   │       └── main.ts
│   ├── ui/
│   │   ├── popup/                # Popup Svelte components
│   │   │   └── Popup.svelte
│   │   └── components/           # Shared Svelte components
│   │       ├── StatusBadge.svelte
│   │       ├── ListItem.svelte
│   │       └── ModalFrame.svelte
│   ├── modules/
│   │   ├── replacer/             # Slash shortcut detection & replacement
│   │   ├── templates/            # Template management & insertion
│   │   ├── pdf/                  # PDF signing UI hooks
│   │   └── auth/                 # Authentication & token sync
│   ├── shared/
│   │   ├── types.ts              # TypeScript type definitions
│   │   ├── storage.ts            # Chrome storage wrapper
│   │   ├── messaging.ts          # Cross-context messaging
│   │   └── env.ts                # Environment & config
│   └── styles/
│       └── base.css              # Base styles (no frameworks)
├── static/
│   ├── icons/                    # Extension icons (16, 32, 48, 128)
│   └── _locales/en/              # Internationalization
│       └── messages.json
├── wxt.config.ts                 # WXT configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## 🧩 Architecture

### Entrypoints

- **Background Script**: Service worker that manages auth, data sync, and inter-script messaging
- **Content Scripts**: Injected into target websites (Gmail, Outlook, DAT, Truckstop) to add features
- **Popup**: UI shown when clicking the extension icon in the toolbar

### Modules

- **Replacer**: Detects `/shortcuts` and replaces them with predefined text
- **Templates**: Fetches, caches, and inserts email templates with variable support
- **PDF**: Detects PDF contexts and injects signing UI
- **Auth**: Syncs authentication state with the web app

### Communication

- Uses `chrome.runtime.sendMessage` for cross-context communication
- Uses `chrome.storage` for persistent data and state sync
- All messaging is type-safe via shared types

---

## 🔧 Configuration

### Manifest Configuration

Edit `wxt.config.ts` to modify:
- Extension name and description
- Permissions
- Host permissions (which websites the extension can access)
- Content script matching patterns

### API Endpoints

Edit `src/shared/env.ts` to configure:
- Backend API URL
- Web app URL for login redirects
- Feature flags

---

## 📝 Development Workflow

### Adding a New Content Script

1. Create a new file in `src/entrypoints/content/`
2. Use `defineContentScript()` with appropriate `matches` patterns
3. Add your feature initialization in the `main()` function
4. WXT will automatically register it in the manifest

### Adding a New Module

1. Create a folder in `src/modules/`
2. Create an `index.ts` with your module's public API
3. Import and use in content scripts or background script
4. Add any required types to `src/shared/types.ts`

### Adding a New Svelte Component

1. Create a `.svelte` file in `src/ui/components/`
2. Import and use in other Svelte components
3. Keep styles scoped within the component

---

## 🧪 Testing

```bash
# Type checking
pnpm compile

# TODO: Add testing framework (Vitest, Playwright)
```

---

## 🐛 Debugging

### Chrome DevTools

- **Popup**: Right-click the extension icon → "Inspect popup"
- **Background Script**: Go to `chrome://extensions` → Click "Service worker"
- **Content Scripts**: Open DevTools on the target page, scripts will be listed

### Console Logging

All modules use `devLog()` from `src/shared/env.ts` which only logs in development mode.

---

## 📦 Dependencies

### Core

- **wxt**: Extension build system and framework
- **svelte**: UI framework
- **typescript**: Type safety

### Chrome APIs

- Uses `@types/chrome` for TypeScript support
- No additional runtime dependencies for Chrome APIs

---

## 🚧 TODOs & Future Work

This is a **scaffolding/skeleton** project with placeholder implementations. The following features need implementation:

### Auth Module
- [ ] Implement token sync with web app
- [ ] Add token refresh logic
- [ ] Handle login/logout flows

### Replacer Module
- [ ] Implement slash shortcut detection
- [ ] Add replacement logic for plain text inputs
- [ ] Add replacement logic for contentEditable elements
- [ ] Support undo (Ctrl+Z)

### Templates Module
- [ ] Fetch templates from backend API
- [ ] Cache templates in storage
- [ ] Implement variable resolution
- [ ] Create template insertion UI

### PDF Module
- [ ] Detect PDF contexts on DAT/Truckstop
- [ ] Inject "Sign with SnapTools" button
- [ ] Create PDF signing modal (Svelte component)
- [ ] Implement signature placement and saving

### Content Scripts
- [ ] Implement Gmail compose window detection
- [ ] Implement Outlook compose window detection
- [ ] Add mutation observers for SPA detection
- [ ] Hook up keyboard shortcuts

### UI
- [ ] Connect popup to actual auth state
- [ ] Load and display real shortcuts/templates
- [ ] Add settings/options page
- [ ] Create onboarding flow

### Testing
- [ ] Add unit tests (Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Test on all target platforms

---

## 📄 License

[Add your license here]

---

## 👥 Contributing

[Add contribution guidelines here]

---

## 📞 Support

[Add support contact info here]

