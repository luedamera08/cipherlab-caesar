import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "CipherLab — Caesar Cipher",
        short_name: "CipherLab",
        description:
          "An interactive educational app for learning the Caesar Cipher.",
        theme_color: "#0B1020",
        background_color: "#0B1020",
        display: "standalone",
        start_url: "/",
        icons: [
  {
    src: "/pwa-64x64.png",
    sizes: "64x64",
    type: "image/png",
  },
  {
    src: "/pwa-192x192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/pwa-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/maskable-icon-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
],
      },
      devOptions: {
        enabled: true,
      },
    }),
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    viteReact(),
  ],
});