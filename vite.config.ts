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
  },
  optimizeDeps: {
    exclude: ["@mapbox"],
  },
});
