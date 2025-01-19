import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname),
    },
  },
  plugins: [babel(), react(), tsconfigPaths()],
})
