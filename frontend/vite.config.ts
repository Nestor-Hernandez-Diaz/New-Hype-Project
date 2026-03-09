/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@monorepo/shared-types': path.resolve(__dirname, '../packages/shared-types/src'),
      '@monorepo/shared-utils': path.resolve(__dirname, '../packages/shared-utils/src'),
      '@monorepo/shared-api-client': path.resolve(__dirname, '../packages/shared-api-client/src'),
      '@monorepo/shared-constants': path.resolve(__dirname, '../packages/shared-constants/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/decolecta-api': {
        target: 'https://api.decolecta.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/decolecta-api/, ''),
        secure: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') && !id.includes('react-router')) return 'react';
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('styled-components')) return 'styled';
            if (id.includes('axios')) return 'axios';
            if (id.includes('@fortawesome')) return 'icons';
            if (id.includes('vitest') || id.includes('@testing-library')) return 'test-utils';
            return 'vendor';
          }
          if (id.includes('/Inventario/')) return 'inventario';
          if (id.includes('/components/') && !id.includes('/Inventario/')) return 'components';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
    ],
  },
});
