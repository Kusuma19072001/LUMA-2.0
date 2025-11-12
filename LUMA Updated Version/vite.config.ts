import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Explicitly ensure VITE_ prefixed env vars are loaded
  envPrefix: 'VITE_',
});

