import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// EDIT base to '/<repo-name>/' if using a project page.
// For username.github.io (user page), set base: '/'
export default defineConfig({
  plugins: [react()],
  base: '/'
})
