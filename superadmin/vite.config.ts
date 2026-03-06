import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
    proxy: {
      '/api/decolecta': {
        target: 'https://api.decolecta.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/decolecta/, ''),
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
