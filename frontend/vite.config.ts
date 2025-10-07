import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'fs'

// Custom plugin to copy favicon.ico to assets directory
const copyFaviconPlugin = () => {
  return {
    name: 'copy-favicon',
    writeBundle() {
      const faviconSource = path.resolve(__dirname, 'public/favicon.ico')
      const faviconDest = path.resolve(__dirname, 'dist/assets/favicon.ico')

      if (existsSync(faviconSource)) {
        copyFileSync(faviconSource, faviconDest)
        console.log('✅ favicon.ico copied to assets directory')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyFaviconPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
