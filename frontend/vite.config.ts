import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const bffTarget = process.env.VITE_BFF_URL ?? 'http://localhost:4000'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // same-origin in dev so the app never needs to know the BFF's address or CORS
    proxy: {
      '/timeSlots': bffTarget,
      '/sse': { target: bffTarget, ws: false },
    },
  },
})
