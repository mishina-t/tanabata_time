import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "七夕祭 落語研究会",
        short_name: "七夕寄席",
        description: "七夕祭の教室寄席とステージ企画を管理する運営用アプリ",
        theme_color: "#252a31",
        background_color: "#f5f6f8",
        display: "standalone",
        start_url: "./#/schedule?date=2026-07-04",
        lang: "ja",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webmanifest}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  base: command === "build" ? "/rakugo-timekeeper/" : "/",
}));
