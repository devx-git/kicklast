import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Con lazy() + import() dinámicos, rolldown divide automáticamente
    // cada ruta en su propio chunk — sin necesitar manualChunks
    chunkSizeWarningLimit: 600,
    cssMinify: true,
  },

  server: {
    proxy: {
      '/api': {
        target: 'https://api.devxsolutions.pro',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
