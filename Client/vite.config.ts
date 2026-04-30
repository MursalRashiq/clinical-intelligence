import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,  // Fail instead of switching to another port
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src')
    }
  }
})
