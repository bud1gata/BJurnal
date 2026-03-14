import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['jurnal.budiputra.web.id'],
    host: true,
    port: 3000,
    open: true
  }
})
