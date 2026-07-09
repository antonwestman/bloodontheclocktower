import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set by the GitHub Actions workflow to "/<repo-name>/" for project pages.
  base: process.env.VITE_BASE_PATH ?? '/',
})
