import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/job-board/',   // Must match EXACT repo name (case + dot)
  server: {
    proxy: {
      // Proxy /api requests to the Express backend in development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
