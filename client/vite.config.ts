import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only in build mode
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      '@reduxjs/toolkit',
      'react-redux'
    ]
  },

  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          charts: ['recharts']
        }
      }
    },
    
    // Compression and optimization
    minify: 'esbuild',
    cssMinify: true,
    
    // Asset optimization
    assetsInlineLimit: 4096, // 4kb
    
    // Source maps for production debugging
    sourcemap: false,
    
    // Reduce bundle size warnings threshold
    chunkSizeWarningLimit: 600
  },

  // Development server
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    
    // API proxy
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@store': resolve(__dirname, 'src/store'),
      '@api': resolve(__dirname, 'src/api')
    }
  },

  // Environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },

  // Experimental features
  esbuild: {
    // Drop console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
