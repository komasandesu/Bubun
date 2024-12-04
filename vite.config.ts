import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    host: true, // これで全てのインターフェースでアクセスできるようになります
    port: 5173, // 必要に応じてポート番号を指定
    watch: {
      usePolling: true, // ポーリングモードに設定
      interval: 1000,   // ポーリング間隔（ミリ秒）
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ["@mapbox"],
  },

  // ビルド設定を追加
  build: {
    // ソースマップを生成（デバッグ時に便利）
    sourcemap: true,
    // 出力ディレクトリを明示的に指定
    outDir: 'build',
    // サーバービルドの設定
    rollupOptions: {
      output: {
        // チャンクの設定
        manualChunks: undefined,
      },
    },
  },
});
