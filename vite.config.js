import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── B 區固定埠口(展覽同網域,必須避開 F 區)─────────────────────────────────
// F 區占用:web 5173 / 5174 / 5175、ws 8787。B 區一律走 52xx / 8788。
// strictPort: true → 埠口被占就直接報錯,絕不自動漂移到 F 區的埠口造成撞號。
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5273,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 5273,
    strictPort: true,
  },
})
