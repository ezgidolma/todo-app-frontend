import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://seashell-app-2wf3u.ondigitalocean.app', // Proxy requests to the backend
    },
  },
})
