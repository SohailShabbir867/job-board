import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/job-board/',   // 👈 Must match EXACT repo name (case + dot)
})
