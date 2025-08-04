import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { copyFileSync, mkdirSync, existsSync } from "fs";

export default defineConfig({
  base: process.env.NETLIFY === "true" ? "/" : "/NailStudio/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  plugins: [
    react(),
    runtimeErrorOverlay(),
    {
      name: "copy-data",
      closeBundle() {
        const dataDir = path.resolve(import.meta.dirname, "data");
        const targetDir = path.resolve(import.meta.dirname, "dist/public/data");
        
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }
        
        const fs = require("fs");
        const files = fs.readdirSync(dataDir);
        files.forEach(file => {
          copyFileSync(
            path.join(dataDir, file),
            path.join(targetDir, file)
          );
        });
      }
    },
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
