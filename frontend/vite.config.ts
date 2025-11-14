import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      // Force rollup to use JavaScript instead of native binaries
      // This fixes the @rollup/rollup-linux-x64-gnu issue in Vercel
      onwarn(warning, warn) {
        // Suppress the native binary warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
  },
  // Force rollup to skip native binaries
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu'],
  },
  define: {
    // Ensure rollup skips native binaries
    'process.env.ROLLUP_SKIP_NATIVE': JSON.stringify('true'),
  },
});
