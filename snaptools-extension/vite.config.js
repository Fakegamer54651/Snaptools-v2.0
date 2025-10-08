"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = require("@vitejs/plugin-react");
const path_1 = require("path");
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_1.dirname)(__filename);
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                popup: (0, path_1.resolve)(__dirname, 'src/popup/index.html'),
                background: (0, path_1.resolve)(__dirname, 'src/background/index.ts'),
                content: (0, path_1.resolve)(__dirname, 'src/content/index.ts'),
                'content-css': (0, path_1.resolve)(__dirname, 'src/content/inject.css'),
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
