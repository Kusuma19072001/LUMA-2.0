import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Explicitly ensure VITE_ prefixed env vars are loaded
  envPrefix: 'VITE_',
  optimizeDeps: {
    include: ['face-api.js', '@vladmandic/face-api', '@tensorflow/tfjs'],
    exclude: [],
  },
  resolve: {
    alias: {
      // You can add non-React aliases here if necessary
    },
  },
});

