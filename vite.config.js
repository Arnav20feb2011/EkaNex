import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // @supabase/supabase-js (and some deps) reference `global`, which doesn't
  // exist in the browser. Map it to globalThis so the bundle runs (fixes the
  // blank-page "global is not defined" crash in the production build).
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
