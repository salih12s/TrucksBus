import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer - only in build mode
    process.env.ANALYZE === "true" &&
      visualizer({
        filename: "dist/bundle-analysis.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),

  // Base URL for production
  base: mode === "production" ? "/" : "/",

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@emotion/react",
      "@emotion/styled",
      "@reduxjs/toolkit",
      "react-redux",
    ],
  },

  // Build configuration - CHUNK LOADING KAPATILDI
  build: {
    target: "es2015", // Daha geniş browser desteği için
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false, // Production'da sourcemap'i kapat
    minify: "terser", // Daha iyi minification

    // CHUNK LOADING'İ TAMAMEN KAPAT
    cssCodeSplit: false, // CSS'i tek dosyada birleştir

    // Rollup options
    rollupOptions: {
      output: {
        // Tek JS dosyası oluştur - chunk yok
        manualChunks: undefined, // Chunk'ları kapat
        inlineDynamicImports: true, // Dynamic import'ları inline yap
      },
    },

    // Asset optimization
    assetsInlineLimit: 4096, // 4kb

    // Reduce bundle size warnings threshold
    chunkSizeWarningLimit: 600,
  },

  // Development server
  server: {
    port: 5174,
    host: true,
    open: true,
    cors: true,

    // API proxy
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
        secure: false, // Local development doesn't need SSL
        ws: true, // Enable WebSocket proxying
      },
    },
  },

  // Path resolution
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@pages": resolve(__dirname, "src/pages"),
      "@utils": resolve(__dirname, "src/utils"),
      "@hooks": resolve(__dirname, "src/hooks"),
      "@store": resolve(__dirname, "src/store"),
      "@api": resolve(__dirname, "src/api"),
    },
  },

  // Environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },

  // Experimental features
  esbuild: {
    // Drop console.log in production
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
