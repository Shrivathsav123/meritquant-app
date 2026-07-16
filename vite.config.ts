import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Production base matches the GitHub Pages repo path
  base: command === 'build' ? '/meritquant-app/' : '/',
}))
