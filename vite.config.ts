import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8080,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    target: 'es2015',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue']
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    reportCompressedSize: true
  },
  esbuild: {
    target: 'es2015',
    keepNames: true,
    drop: ['console', 'debugger']
  },
  optimizeDeps: {
    include: ['vue']
  }
})
