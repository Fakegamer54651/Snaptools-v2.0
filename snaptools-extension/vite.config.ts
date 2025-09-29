import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        'content-css': resolve(__dirname, 'src/content/inject.css'),
      },
      output: {
        entryFileNames: (chunk) => {
          const facadeModuleId = chunk.facadeModuleId;
          if (facadeModuleId?.includes('background')) {
            return 'src/background/index.js';
          }
          if (facadeModuleId?.includes('content')) {
            return 'src/content/index.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name;
          if (name?.endsWith('.css')) {
            if (name.includes('inject')) {
              return 'src/content/inject.css';
            }
            return 'assets/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
    copyPublicDir: true,
  },
  publicDir: 'public',
});
