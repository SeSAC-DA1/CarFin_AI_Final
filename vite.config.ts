import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// ESM 호환 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,

    // 🚀 프로덕션 최적화 설정 (교육/공모전 점수 향상)
    minify: 'terser',
    sourcemap: process.env.NODE_ENV !== 'production',

    // 📊 번들 크기 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          // React 라이브러리 분리
          'react-vendor': ['react', 'react-dom'],
          // UI 컴포넌트 분리
          'ui-vendor': ['@radix-ui/react-slot', '@radix-ui/react-dialog', 'framer-motion'],
          // 유틸리티 분리
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          // 아이콘 분리
          'icons-vendor': ['lucide-react']
        },
        // 📁 청크 파일명 최적화
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[ext]/[name]-[hash][extname]`;
        }
      }
    },

    // 🎯 성능 최적화
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },

    // 📏 청크 크기 경고 임계값
    chunkSizeWarningLimit: 500,

    // 🔄 CSS 코드 분할
    cssCodeSplit: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // 🔥 개발 서버 최적화
    hmr: {
      overlay: true
    }
  },

  // ⚡ 성능 최적화 설정
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'framer-motion',
      'lucide-react'
    ]
  },

  // 🔍 번들 분석 (개발 모드에서만)
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __IS_PRODUCTION__: JSON.stringify(process.env.NODE_ENV === 'production')
  }
});
