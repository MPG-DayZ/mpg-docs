import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['vitepress'],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [vue()],
});
