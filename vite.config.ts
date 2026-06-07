import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
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
});
