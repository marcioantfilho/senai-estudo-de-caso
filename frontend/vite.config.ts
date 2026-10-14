import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiOrigin = env.VITE_API_ORIGIN ?? 'http://localhost:3000'
  let originUrl: URL

  try {
    originUrl = new URL(apiOrigin)
  } catch {
    throw new Error('VITE_API_ORIGIN deve ser uma origem HTTP ou HTTPS válida.')
  }

  if (!['http:', 'https:'].includes(originUrl.protocol) || originUrl.origin !== apiOrigin) {
    throw new Error('VITE_API_ORIGIN deve conter apenas a origem, sem caminho ou barra final.')
  }

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_ORIGIN': JSON.stringify(apiOrigin),
    },
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
    },
  }
})
