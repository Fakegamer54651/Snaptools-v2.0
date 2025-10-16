import { defineConfig } from 'wxt';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  outDir: '.output',
  runner: {
    disabled: true, // Disable auto browser launch
  },
  manifest: {
    name: 'SnapTools Extension',
    description: 'Shortcuts, templates, and PDF tools for Gmail, Outlook, DAT & Truckstop',
    version: '1.0.0',
    permissions: [
      'storage',
      'scripting',
      'activeTab',
      'tabs'
    ],
    host_permissions: [
      'https://mail.google.com/*',
      'https://outlook.office.com/*',
      'https://outlook.live.com/*',
      'https://*.dat.com/*',
      'https://*.truckstop.com/*'
    ],
    default_locale: 'en',
    icons: {
      16: '/icons/16.png',
      32: '/icons/32.png',
      48: '/icons/48.png',
      128: '/icons/128.png'
    },
    content_scripts: [
      {
        matches: [
          'https://mail.google.com/*',
          'https://mail.google.com/mail/*',
          'https://mail.google.com/mail/u/*',
          'https://mail.google.com/mail/u/0/*'
        ],
        js: ['content-scripts/gmail.js'],
        all_frames: true,
        run_at: 'document_start',
        match_about_blank: true
      },
      {
        matches: ['https://outlook.office.com/*', 'https://outlook.live.com/*'],
        js: ['content-scripts/outlook.js'],
        run_at: 'document_idle'
      },
      {
        matches: ['https://*.dat.com/*'],
        js: ['content-scripts/dat.js'],
        run_at: 'document_idle'
      },
      {
        matches: ['https://*.truckstop.com/*'],
        js: ['content-scripts/truckstop.js'],
        run_at: 'document_idle'
      }
    ]
  },
  vite: () => ({
    plugins: [svelte()],
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  })
});

