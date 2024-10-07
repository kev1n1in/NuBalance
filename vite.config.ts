import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
  ],
  build: {
    outDir: "dist", // 構建輸出的目錄
    assetsDir: "assets", // 靜態資源目錄
  },
  optimizeDeps: {
    include: ["date-fns"],
  },
});
