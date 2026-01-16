import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base:
    command === 'serve'
      ? '/'
      : '/https-diksha22sharma-.github.io-parity-plus-upgraded-/',
}))



