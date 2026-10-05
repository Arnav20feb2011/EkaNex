import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Map `global` (referenced by @supabase/supabase-js) to globalThis so the
  // browser bundle runs — fixes the blank-page "global is not defined" crash.
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5174,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
